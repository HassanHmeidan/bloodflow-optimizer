
import { useState } from 'react';
import { supabase } from "@/lib/supabase";
import type { Database } from '@/integrations/supabase/types';

type BloodType = Database['public']['Enums']['blood_type']; 

interface MatchedDonor {
  id: string;
  name: string;
  bloodType: BloodType;
  distance: number; // in km
  lastDonation: string;
  eligibleToNotify: boolean;
  email?: string;
  phone?: string;
}

interface DonorMatchingParams {
  bloodType: BloodType;
  location?: {
    latitude: number;
    longitude: number;
  };
  unitsNeeded: number;
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

  const findMatchingDonors = async ({ bloodType, location, unitsNeeded }: DonorMatchingParams) => {
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
      
      // Get donor user information
      const donorIds = donorProfiles.map(donor => donor.user_id);
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
      
      donorProfiles.forEach(donor => {
        const userProfile = userProfiles?.find(profile => profile.id === donor.user_id);
        
        if (userProfile) {
          // Calculate eligibility based on last donation (minimum 56 days)
          const lastDonation = donor.last_donation_date ? new Date(donor.last_donation_date) : new Date(0);
          const today = new Date();
          const daysSinceLastDonation = Math.floor((today.getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24));
          const eligibleToNotify = daysSinceLastDonation >= 56;
          
          donors.push({
            id: donor.id,
            name: `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Unknown',
            bloodType: donor.blood_type,
            distance: location ? 0 : 999, // Will be updated if location provided
            lastDonation: donor.last_donation_date || 'Never',
            eligibleToNotify,
            email: userProfile.email,
            phone: userProfile.phone
          });
        }
      });
      
      // If location is provided, calculate distances and sort by proximity
      if (location) {
        // We would need donor locations here, but for now let's simulate with random distances
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
      
    } catch (err) {
      console.error("Error finding matching donors:", err);
      setError("Failed to find matching donors. Please try again.");
      setMatchedDonors([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    findMatchingDonors,
    matchedDonors,
    isLoading,
    error
  };
}
