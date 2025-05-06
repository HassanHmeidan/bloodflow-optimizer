
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { MatchedDonor, DonorMatchingParams, DonorMatchingHook, BloodType, PriorityLevel } from '@/types/status';

export function useAIDonorMatching(): DonorMatchingHook {
  const [isLoading, setIsLoading] = useState(false);
  const [matchedDonors, setMatchedDonors] = useState<MatchedDonor[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Function to find matching donors based on criteria
  const findMatchingDonors = async (params: DonorMatchingParams): Promise<void> => {
    setIsLoading(true);
    setError("");
    
    try {
      // Get eligible donors with the right blood type
      const { data: donors, error: donorsError } = await supabase
        .from('donor_profiles')
        .select(`
          id,
          user_id,
          blood_type,
          last_donation_date,
          eligible_to_donate,
          medical_history
        `)
        .eq('eligible_to_donate', true)
        .eq('blood_type', params.bloodType);
      
      if (donorsError) throw donorsError;
      
      // Filter out recently donated donors (within last 56 days)
      const today = new Date();
      const minDonationDate = new Date();
      minDonationDate.setDate(today.getDate() - 56); // 56 days between donations
      
      const eligibleDonors = donors.filter(donor => {
        if (!donor.last_donation_date) return true;
        const lastDonation = new Date(donor.last_donation_date);
        return lastDonation < minDonationDate;
      });
      
      if (params.excludeDonorIds && params.excludeDonorIds.length > 0) {
        eligibleDonors.filter(donor => !params.excludeDonorIds?.includes(donor.id));
      }
      
      // Get donor profiles with contact information
      const donorDetails: MatchedDonor[] = [];
      for (const donor of eligibleDonors) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, email, phone')
          .eq('id', donor.user_id)
          .single();
        
        if (profile) {
          // Calculate match score based on various factors
          // This is a simplified scoring algorithm that could be enhanced with ML
          let score = 100; // Base score
          
          // Factor 1: Recency of last donation (higher score for donors who haven't donated recently)
          if (donor.last_donation_date) {
            const daysSinceLastDonation = Math.floor((today.getTime() - new Date(donor.last_donation_date).getTime()) / (1000 * 3600 * 24));
            // More points for those who haven't donated in a long time but are still eligible
            score += Math.min(50, Math.floor(daysSinceLastDonation / 30) * 10);
          } else {
            score += 50; // Never donated before, highest score
          }
          
          // Factor 2: Location proximity would be calculated here if we had geolocation data
          // For now, assign a random "distance" as placeholder
          const mockDistance = Math.floor(Math.random() * 30) + 1; // 1-30km
          score -= mockDistance; // Reduce score based on distance
          
          // Factor 3: Medical history factors (simplified)
          if (donor.medical_history) {
            const medicalHistory = donor.medical_history as any;
            // Higher weight is generally better for donation
            if (medicalHistory.weight && medicalHistory.weight > 70) {
              score += 10;
            }
          }
          
          // Determine eligibility level based on score ranges
          let eligibilityLevel: 'high' | 'medium' | 'low';
          if (score >= 130) {
            eligibilityLevel = 'high';
          } else if (score >= 100) {
            eligibilityLevel = 'medium';
          } else {
            eligibilityLevel = 'low';
          }
          
          donorDetails.push({
            id: donor.id,
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
            email: profile.email || '',
            phone: profile.phone || '',
            bloodType: donor.blood_type as BloodType,
            lastDonation: donor.last_donation_date,
            distance: mockDistance,
            score: score,
            eligibilityLevel
          });
        }
      }
      
      // Sort by match score (descending)
      donorDetails.sort((a, b) => b.score - a.score);
      
      // Prioritize donors based on urgency
      const requiredDonors = Math.ceil(params.unitsNeeded * 1.5);
      
      // Select top N donors based on urgency
      setMatchedDonors(donorDetails.slice(0, requiredDonors));
      
      // Show notification about match results
      if (donorDetails.length === 0) {
        toast.warning("No matching donors found", {
          description: "Consider expanding your search criteria."
        });
      } else if (donorDetails.length < params.unitsNeeded) {
        toast.warning(`Only ${donorDetails.length} matching donors found`, {
          description: "This may not be enough to fulfill the request."
        });
      } else {
        toast.success(`Found ${requiredDonors} potential donors`, {
          description: "You can now notify these donors about the donation need."
        });
      }
      
    } catch (err) {
      console.error("Error finding matching donors:", err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      toast.error("Failed to find matching donors", {
        description: "Please try again or adjust your criteria."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to notify selected donors
  const notifyDonors = async (donorIds: string[], requestDetails: {
    requestId: string;
    bloodType: BloodType;
    units: number;
    urgency: PriorityLevel;
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
      
      const { error } = await supabase
        .from('notifications')
        .insert(notifications);
        
      if (error) throw error;
      
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

export default useAIDonorMatching;
