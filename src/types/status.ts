
// Donor status types
export type DonorStatus = 'active' | 'inactive' | 'pending' | 'ineligible';

// Appointment status types
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

// Blood unit tracking status types
export type BloodUnitStatus = 
  | 'collected'    // Initial collection from donor
  | 'stored'       // Stored at facility
  | 'tested'       // Going through testing
  | 'available'    // Available for use
  | 'reserved'     // Reserved for specific request
  | 'in_transit'   // Being shipped
  | 'delivered'    // Delivered to destination
  | 'used'         // Used for patient
  | 'expired'      // Past expiration date
  | 'discarded';   // Discarded due to issues

// Blood request status types
export type BloodRequestStatus = 'pending' | 'approved' | 'fulfilled' | 'cancelled' | 'rejected';

// Hospital types
export type HospitalStatus = 'active' | 'inactive';

// Blood types
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

// Priority levels for blood requests
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

// Blood type and priority level arrays for zod validation
export const BLOOD_TYPES: [BloodType, ...BloodType[]] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
export const PRIORITY_LEVELS: [PriorityLevel, ...PriorityLevel[]] = ["low", "medium", "high", "critical"] as const;

// Request form values type
export type RequestFormValues = {
  hospitalId: string;
  bloodType: BloodType; 
  units: string;
  priority: PriorityLevel; 
  requiredBy: Date;
  notes?: string;
};

// Hospital interface
export interface Hospital {
  id: string;
  name: string;
}

// Matched donor type
export type MatchedDonor = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  bloodType: BloodType;
  lastDonation?: string | null;
  distance?: number | null;
  score: number;
  eligibilityLevel: 'high' | 'medium' | 'low';
};

// Donor matching parameters
export type DonorMatchingParams = {
  bloodType: BloodType;
  location?: { latitude: number; longitude: number } | string;
  unitsNeeded: number;
  excludeDonorIds?: string[];
};

// Blood Request interface
export interface BloodRequest {
  id: string;
  hospital_id: string;
  hospital_name: string;
  blood_type: BloodType;
  units: number;
  priority: PriorityLevel;
  status: BloodRequestStatus;
  request_date: string;
  approval_date?: string;
  fulfillment_date?: string;
  notes?: string;
}

// Donor matching hook interface
export interface DonorMatchingHook {
  findMatchingDonors: (params: DonorMatchingParams) => Promise<void>;
  matchedDonors: MatchedDonor[];
  notifyDonors: (donorIds: string[], requestInfo: {
    requestId: string;
    bloodType: BloodType;
    units: number;
    urgency: PriorityLevel;
    hospitalName: string;
  }) => Promise<boolean>;
  isLoading: boolean;
  isMatching: boolean;
  error: string | null;
}
