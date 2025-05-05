
import { supabase } from "@/integrations/supabase/client";
import type { Database } from '@/types/supabase';

type BloodType = Database['public']['Enums']['blood_type']; 

// Function to record a donation after an appointment is completed
export async function recordDonation(donorId: string, bloodType: BloodType, centerId: string, appointmentId?: string) {
  try {
    // Calculate expiry date (42 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 42);
    
    // First record the donation in blood inventory
    const { data, error } = await supabase
      .from('blood_inventory')
      .insert({
        donor_id: donorId,
        blood_type: bloodType,
        units: 1, // Standard donation is typically 1 unit
        donation_date: new Date().toISOString(),
        expiry_date: expiryDate.toISOString(),
        location_id: centerId,
        status: 'available'
      })
      .select();
      
    if (error) throw error;
    
    // If this is tied to an appointment, update the appointment status
    if (appointmentId) {
      const { error: appointmentError } = await supabase
        .from('donation_appointments')
        .update({
          status: 'completed'
        })
        .eq('id', appointmentId);
        
      if (appointmentError) throw appointmentError;
    }
    
    // Update donor's last donation date
    const { error: donorError } = await supabase
      .from('donor_profiles')
      .update({
        last_donation_date: new Date().toISOString()
      })
      .eq('id', donorId);
      
    if (donorError) throw donorError;
    
    // Update predictive demand
    await updatePredictiveDemand(bloodType);
    
    return data;
  } catch (error) {
    console.error("Error recording donation:", error);
    throw error;
  }
}

// Function to get current blood inventory levels
export async function getBloodInventory() {
  try {
    const { data, error } = await supabase
      .from('blood_inventory')
      .select(`
        id,
        blood_type,
        units,
        donation_date,
        expiry_date,
        status,
        location_id,
        donor_id
      `)
      .eq('status', 'available')
      .order('expiry_date', { ascending: true });
      
    if (error) throw error;
    
    // Fetch donor names separately
    const donorNames: Record<string, string> = {};
    if (data.length > 0) {
      const donorIds = [...new Set(data.filter(item => item.donor_id).map(item => item.donor_id))];
      
      for (const donorId of donorIds) {
        if (!donorId) continue;
        
        const { data: donorData } = await supabase
          .from('donor_profiles')
          .select('user_id')
          .eq('id', donorId)
          .single();
        
        if (donorData?.user_id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', donorData.user_id)
            .single();
            
          if (profileData) {
            donorNames[donorId] = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || 'Unknown';
          }
        }
      }
    }
    
    // Fetch location names
    const locationNames: Record<string, string> = {};
    if (data.length > 0) {
      const locationIds = [...new Set(data.filter(item => item.location_id).map(item => item.location_id))];
      
      for (const locationId of locationIds) {
        if (!locationId) continue;
        
        const { data: locationData } = await supabase
          .from('donation_centers')
          .select('name')
          .eq('id', locationId)
          .single();
          
        if (locationData) {
          locationNames[locationId] = locationData.name;
        }
      }
    }
    
    // Transform the data to a more usable format
    const inventory = data.map(item => ({
      id: item.id,
      bloodType: item.blood_type,
      units: item.units,
      donationDate: new Date(item.donation_date).toISOString().split('T')[0],
      expiryDate: new Date(item.expiry_date).toISOString().split('T')[0],
      status: item.status,
      donor: item.donor_id ? donorNames[item.donor_id] || 'Unknown' : 'Unknown',
      location: item.location_id ? locationNames[item.location_id] || 'Unknown' : 'Unknown'
    }));
    
    // Aggregate by blood type
    const bloodTypeTotals = inventory.reduce((acc, item) => {
      if (!acc[item.bloodType]) {
        acc[item.bloodType] = 0;
      }
      acc[item.bloodType] += item.units;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      inventory,
      bloodTypeTotals,
      lowStockTypes: Object.entries(bloodTypeTotals)
        .filter(([_, units]) => units < 5)
        .map(([type]) => type)
    };
  } catch (error) {
    console.error("Error getting blood inventory:", error);
    throw error;
  }
}

// Function to get stock alerts
export async function getStockAlerts() {
  try {
    // Get inventory totals
    const { bloodTypeTotals, lowStockTypes } = await getBloodInventory();
    
    // Get demand predictions
    const { data: demandData, error: demandError } = await supabase
      .from('predictive_demand')
      .select('*');
      
    if (demandError) throw demandError;
    
    // Create alerts based on current stock and predicted demand
    const alerts = [];
    
    // Low stock alerts
    for (const bloodType of lowStockTypes) {
      alerts.push({
        type: 'low_stock',
        bloodType,
        currentUnits: bloodTypeTotals[bloodType] || 0,
        message: `Low stock alert for blood type ${bloodType}. Current units: ${bloodTypeTotals[bloodType] || 0}`
      });
    }
    
    // High demand alerts from predictive model
    for (const prediction of demandData) {
      if (prediction.urgency_level === 'high') {
        const currentStock = bloodTypeTotals[prediction.blood_type] || 0;
        
        if (currentStock < prediction.short_term_demand) {
          alerts.push({
            type: 'high_demand',
            bloodType: prediction.blood_type,
            currentUnits: currentStock,
            predictedDemand: prediction.short_term_demand,
            message: `High demand predicted for blood type ${prediction.blood_type}. Current units: ${currentStock}, Predicted demand: ${prediction.short_term_demand}`
          });
        }
      }
    }
    
    // Expiring units alerts
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    // Query for expiring inventory
    const { data: expiringData, error: expiringError } = await supabase
      .from('blood_inventory')
      .select('blood_type')
      .eq('status', 'available')
      .lt('expiry_date', nextWeek.toISOString())
      .gt('expiry_date', today.toISOString());
      
    if (expiringError) throw expiringError;
    
    // Count expiring units by blood type
    const expiringCounts: Record<string, number> = {};
    for (const item of expiringData) {
      if (!expiringCounts[item.blood_type]) {
        expiringCounts[item.blood_type] = 0;
      }
      expiringCounts[item.blood_type]++;
    }
    
    // Add expiring alerts
    for (const [bloodType, count] of Object.entries(expiringCounts)) {
      alerts.push({
        type: 'expiring',
        bloodType: bloodType as BloodType,
        count,
        message: `${count} units of ${bloodType} blood will expire within the next week`
      });
    }
    
    return alerts;
  } catch (error) {
    console.error("Error getting stock alerts:", error);
    throw error;
  }
}

// Function to update predictive demand based on new donations or requests
async function updatePredictiveDemand(bloodType: BloodType) {
  try {
    // Get current inventory
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('blood_inventory')
      .select('id')
      .eq('status', 'available')
      .eq('blood_type', bloodType);
      
    if (inventoryError) throw inventoryError;
    
    const currentStock = inventoryData.length;
    
    // Get current requests
    const { data: requestsData, error: requestsError } = await supabase
      .from('blood_requests')
      .select('units')
      .in('status', ['pending', 'approved'])
      .eq('blood_type', bloodType);
      
    if (requestsError) throw requestsError;
    
    const pendingRequests = requestsData.reduce((sum, req) => sum + req.units, 0);
    
    // Calculate urgency level
    let urgencyLevel = 'low';
    if (pendingRequests > currentStock) {
      urgencyLevel = 'high';
    } else if (pendingRequests > currentStock * 0.5) {
      urgencyLevel = 'medium';
    }
    
    // Update predictive demand
    const { error: updateError } = await supabase
      .from('predictive_demand')
      .update({
        short_term_demand: pendingRequests,
        medium_term_demand: Math.round(pendingRequests * 1.5), // Simple prediction
        urgency_level: urgencyLevel,
        last_updated: new Date().toISOString()
      })
      .eq('blood_type', bloodType);
      
    if (updateError) throw updateError;
    
  } catch (error) {
    console.error("Error updating predictive demand:", error);
    // Don't throw here, as this is a background update and shouldn't block the main flow
  }
}
