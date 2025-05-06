
import { useState } from 'react';
import { supabase } from "@/lib/supabase";
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type BloodType = Database['public']['Enums']['blood_type']; 

// Export the MatchedDonor interface so it can be imported by other files
export interface MatchedDonor {
  id: string;
  name: string;
  bloodType: BloodType;
  distance: number; // in km
  lastDonation: string;
  eligibleToNotify: boolean;
  email?: string;
  phone?: string;
  score: number;
  eligibilityLevel: 'high' | 'medium' | 'low';
}

export interface DonorMatchingParams {
  bloodType: BloodType;
  location?: {
    latitude: number;
    longitude: number;
  };
  unitsNeeded: number;
  excludeDonorIds?: string[];
}

export function useAIDonorMatching() {
  const [isLoading, setIsLoading] = useState(false);
  const [matchedDonors, setMatchedDonors] = useState<MatchedDonor[]>([]);
  const [error, setError] = useState<string | null>(null);

  const findCompatibleDonors = (bloodType: BloodType): BloodType[] => {
    // Blood compatibility matrix
    const compatibilityMatrix: Record<BloodType, BloodType[]> = {
      'O-': ['O-'],
      'O+': ['O-', 'O+'],
      'A-': ['O-', 'A-'],
      'A+': ['O-', 'O+', 'A-', 'A+'],
      'B-': ['O-', 'B-'],
      'B+': ['O-', 'O+', 'B-', 'B+'],
      'AB-': ['O-', 'A-', 'B-', 'AB-'],
      'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
    };
    
    return compatibilityMatrix[bloodType] || [];
  };

  // Calculate distance between two geographic points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
  };

  const findMatchingDonors = async ({ bloodType, location, unitsNeeded, excludeDonorIds }: DonorMatchingParams) => {
    setIsLoading(true);
    setError(null);
    try {
      // Get compatible blood types for the requested type
      const compatibleTypes = findCompatibleDonors(bloodType);
      
      // Find eligible donors with compatible blood types
      const { data: donorProfiles, error: donorError } = await supabase
        .from('donor_profiles')
        .select(`
          id, 
          blood_type,
          last_donation_date,
          eligible_to_donate,
          user_id
        `)
        .in('blood_type', compatibleTypes)
        .eq('eligible_to_donate', true);
      
      if (donorError) throw donorError;
      
      if (!donorProfiles || donorProfiles.length === 0) {
        setMatchedDonors([]);
        return;
      }
      
      // Filter out excluded donors if provided
      let filteredDonors = donorProfiles;
      if (excludeDonorIds && excludeDonorIds.length > 0) {
        filteredDonors = donorProfiles.filter(
          donor => !excludeDonorIds.includes(donor.id)
        );
      }
      
      // Get donor user information
      const donorIds = filteredDonors.map(donor => donor.user_id);
      const { data: userProfiles, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone
        `)
        .in('id', donorIds);
      
      if (profileError) throw profileError;
      
      // Match donors with their profiles
      let donors: MatchedDonor[] = [];
      
      filteredDonors.forEach(donor => {
        const userProfile = userProfiles?.find(profile => profile.id === donor.user_id);
        
        if (userProfile) {
          // Calculate eligibility based on last donation (minimum 56 days)
          const lastDonation = donor.last_donation_date ? new Date(donor.last_donation_date) : new Date(0);
          const today = new Date();
          const daysSinceLastDonation = Math.floor((today.getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24));
          const eligibleToNotify = daysSinceLastDonation >= 56;
          
          // Calculate a score for the donor
          let score = 100; // Base score
          
          // Add points for days since last donation (more days = higher score)
          if (donor.last_donation_date) {
            score += Math.min(50, Math.floor(daysSinceLastDonation / 30) * 10);
          } else {
            score += 50; // Never donated before
          }
          
          // Determine eligibility level
          let eligibilityLevel: 'high' | 'medium' | 'low';
          if (score >= 130) {
            eligibilityLevel = 'high';
          } else if (score >= 100) {
            eligibilityLevel = 'medium';
          } else {
            eligibilityLevel = 'low';
          }
          
          donors.push({
            id: donor.id,
            name: `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Unknown',
            bloodType: donor.blood_type,
            distance: 0, // Will be updated if location provided
            lastDonation: donor.last_donation_date || 'Never',
            eligibleToNotify,
            email: userProfile.email,
            phone: userProfile.phone,
            score: score,
            eligibilityLevel: eligibilityLevel
          });
        }
      });
      
      // If location is provided, calculate distances and sort by proximity
      if (location) {
        // For now, we'll just simulate distances
        donors = donors.map(donor => ({
          ...donor,
          distance: Math.floor(Math.random() * 50) // simulate distances up to 50km
        }));
      }
      
      // Sort by priority factors:
      // 1. Blood type match (exact match first)
      // 2. Distance (closest first)
      // 3. Last donation (oldest first to distribute donation burden)
      donors.sort((a, b) => {
        // Exact blood type match gets higher priority
        if (a.bloodType === bloodType && b.bloodType !== bloodType) return -1;
        if (a.bloodType !== bloodType && b.bloodType === bloodType) return 1;
        
        // Then by distance
        if (a.distance !== b.distance) return a.distance - b.distance;
        
        // Then by last donation date (oldest first)
        const dateA = new Date(a.lastDonation).getTime();
        const dateB = new Date(b.lastDonation).getTime();
        return dateA - dateB;
      });
      
      // Limit to required number of donors (plus some extra for safety)
      setMatchedDonors(donors.slice(0, unitsNeeded * 2));
      
      // Show notification about match results
      if (donors.length === 0) {
        toast.warning("No matching donors found", {
          description: "Consider expanding your search criteria."
        });
      } else if (donors.length < unitsNeeded) {
        toast.warning(`Only ${donors.length} matching donors found`, {
          description: "This may not be enough to fulfill the request."
        });
      } else {
        toast.success(`Found ${Math.min(donors.length, unitsNeeded * 2)} potential donors`, {
          description: "You can now notify these donors about the donation need."
        });
      }
    } catch (err: any) {
      console.error("Error finding matching donors:", err);
      setError(err.message || "Failed to find matching donors. Please try again.");
      setMatchedDonors([]);
      
      toast.error("Failed to find matching donors", {
        description: "Please try again or adjust your criteria."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add the notifyDonors function that's being used in HospitalRequestDashboard
  const notifyDonors = async (donorIds: string[], requestDetails: {
    requestId: string;
    bloodType: BloodType;
    units: number;
    urgency: string;
    hospitalName: string;
  }): Promise<boolean> => {
    try {
      // Create notification records and potentially send emails/SMS
      const notifications = donorIds.map(donorId => ({
        recipient_id: donorId,
        subject: `Urgent Blood Donation Request: ${requestDetails.bloodType}`,
        message: `${requestDetails.hospitalName} urgently needs ${requestDetails.units} units of ${requestDetails.bloodType} blood. Please consider donating as soon as possible.`,
        event_type: 'blood_request',
        blood_type: requestDetails.bloodType,
        units: requestDetails.units,
        status: 'sent'
      }));
      
      // Insert notifications one by one instead of as an array
      for (const notification of notifications) {
        const { error } = await supabase
          .from('notifications')
          .insert(notification);
          
        if (error) throw error;
      }
      
      toast.success(`Notification sent to ${donorIds.length} donors`, {
        description: "Donors will be notified about this urgent request."
      });
      
      return true;
    } catch (err) {
      console.error("Error notifying donors:", err);
      toast.error("Failed to notify donors", {
        description: "Please try again later."
      });
      return false;
    }
  };

  return {
    findMatchingDonors,
    notifyDonors,
    matchedDonors,
    isLoading,
    isMatching: isLoading,
    error
  };
}
