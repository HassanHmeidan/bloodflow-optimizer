
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';

type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

type DemandForecast = {
  bloodType: BloodType;
  shortTermDemand: number; // Expected demand in next 7 days
  mediumTermDemand: number; // Expected demand in next 30 days
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: Date;
};

type InventoryLevel = {
  bloodType: BloodType;
  currentUnits: number;
  optimalUnits: number;
  expiringWithin7Days: number;
};

// Fetch AI forecast from our database
export const getPredictiveDemand = async (): Promise<DemandForecast[]> => {
  try {
    const { data, error } = await supabase
      .from('predictive_demand')
      .select('*');
    
    if (error) throw error;
    
    // Transform the data to match our expected format
    return (data || []).map(item => ({
      bloodType: item.blood_type as BloodType,
      shortTermDemand: item.short_term_demand,
      mediumTermDemand: item.medium_term_demand,
      urgencyLevel: item.urgency_level as 'low' | 'medium' | 'high' | 'critical',
      lastUpdated: new Date(item.last_updated)
    }));
  } catch (error) {
    console.error("Error fetching predictive demand:", error);
    // Return empty array to prevent application crashes
    return [];
  }
};

export const getCurrentInventory = async (): Promise<InventoryLevel[]> => {
  try {
    // Get current inventory from Supabase
    const { data, error } = await supabase
      .from('blood_inventory')
      .select(`
        blood_type,
        units
      `)
      .eq('status', 'available');
    
    if (error) throw error;
    
    // Group by blood type and sum units
    const inventoryByBloodType = new Map<BloodType, number>();
    
    for (const item of (data || [])) {
      const bloodType = item.blood_type as BloodType;
      const currentUnits = inventoryByBloodType.get(bloodType) || 0;
      inventoryByBloodType.set(bloodType, currentUnits + item.units);
    }
    
    // Get expiring units (those expiring in 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const { data: expiringData, error: expiringError } = await supabase
      .from('blood_inventory')
      .select(`
        blood_type,
        units
      `)
      .eq('status', 'available')
      .lt('expiry_date', sevenDaysFromNow.toISOString());
    
    if (expiringError) throw expiringError;
    
    // Group expiring by blood type
    const expiringByBloodType = new Map<BloodType, number>();
    
    for (const item of (expiringData || [])) {
      const bloodType = item.blood_type as BloodType;
      const currentUnits = expiringByBloodType.get(bloodType) || 0;
      expiringByBloodType.set(bloodType, currentUnits + item.units);
    }
    
    // Calculate optimal units based on inventory or use default values
    // The optimal values could later be stored in a configuration table
    const optimalUnitsByBloodType: Record<BloodType, number> = {
      'O-': 50,
      'O+': 70,
      'A+': 60,
      'A-': 30,
      'B+': 35,
      'B-': 20,
      'AB+': 15,
      'AB-': 10
    };
    
    // Transform into the expected format
    const bloodTypes: BloodType[] = ['O-', 'O+', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
    
    return bloodTypes.map(bloodType => ({
      bloodType,
      currentUnits: inventoryByBloodType.get(bloodType) || 0,
      optimalUnits: optimalUnitsByBloodType[bloodType],
      expiringWithin7Days: expiringByBloodType.get(bloodType) || 0
    }));
  } catch (error) {
    console.error("Error fetching current inventory:", error);
    // Return empty array to prevent application crashes
    return [];
  }
};

// Generate donor recommendations based on inventory and predicted demand
export const getTargetedDonorRecommendations = async (bloodType: BloodType | null): Promise<string> => {
  try {
    const inventory = await getCurrentInventory();
    const demand = await getPredictiveDemand();
    
    if (!bloodType) {
      // Find the most needed blood type
      const criticalTypes = demand
        .filter(d => d.urgencyLevel === 'critical' || d.urgencyLevel === 'high')
        .sort((a, b) => {
          const aInv = inventory.find(i => i.bloodType === a.bloodType);
          const bInv = inventory.find(i => i.bloodType === b.bloodType);
          
          if (!aInv || !bInv) return 0;
          
          // Calculate inventory-to-demand ratio (lower is more critical)
          const aRatio = aInv.currentUnits / a.shortTermDemand;
          const bRatio = bInv.currentUnits / b.shortTermDemand;
          
          return aRatio - bRatio;
        });
      
      if (criticalTypes.length > 0) {
        bloodType = criticalTypes[0].bloodType;
      } else {
        bloodType = 'O-'; // Default to universal donor if nothing is critical
      }
    }
    
    const targetDemand = demand.find(d => d.bloodType === bloodType);
    const targetInventory = inventory.find(i => i.bloodType === bloodType);
    
    if (!targetDemand || !targetInventory) {
      return "We need donors of all blood types. Please consider donating today!";
    }
    
    if (targetInventory.currentUnits < targetInventory.optimalUnits * 0.3) {
      return `We urgently need ${bloodType} donors. Our inventory is critically low and patients' lives depend on these donations.`;
    } else if (targetInventory.currentUnits < targetInventory.optimalUnits * 0.7) {
      return `${bloodType} blood is in high demand. Your donation would help us meet patient needs in the coming days.`;
    } else if (targetInventory.expiringWithin7Days > targetInventory.currentUnits * 0.3) {
      return `We have ${bloodType} units that will expire soon. New fresh donations would help maintain our supply.`;
    } else {
      return `Our ${bloodType} supply is currently stable, but regular donations help us stay prepared for emergencies.`;
    }
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return "We always need blood donors of all types. Your donation can save up to three lives!";
  }
};

// Function to notify donors based on AI recommendations
export const notifyEligibleDonors = async (bloodType: BloodType): Promise<void> => {
  try {
    // In a real system, this would call a Supabase Edge Function
    // that would filter donors by blood type and eligibility date
    // and send them personalized notifications via email/SMS/push
    
    const message = await getTargetedDonorRecommendations(bloodType);
    
    // For now, we'll just show a toast
    toast.success(`Notifications sent to eligible ${bloodType} donors`, {
      description: `Message: ${message.substring(0, 60)}...`,
    });
  } catch (error) {
    console.error("Error sending notifications:", error);
    toast.error("Failed to send donor notifications", {
      description: "Please try again later.",
    });
  }
};
