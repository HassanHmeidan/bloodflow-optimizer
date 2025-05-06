
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

// Matched donor type
export type MatchedDonor = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  bloodType: string;
  lastDonation?: string | null;
  distance?: number | null;
  score: number;
  eligibilityLevel: 'high' | 'medium' | 'low';
};

// Donor matching parameters
export type DonorMatchingParams = {
  bloodType: string;
  location?: { latitude: number; longitude: number } | string;
  unitsNeeded: number;
  excludeDonorIds?: string[];
};

// Donor matching hook interface
export interface DonorMatchingHook {
  findMatchingDonors: (params: DonorMatchingParams) => Promise<void>;
  matchedDonors: MatchedDonor[];
  notifyDonors: (donorIds: string[], requestInfo: {
    requestId: string;
    bloodType: string;
    units: number;
    urgency: string;
    hospitalName: string;
  }) => Promise<boolean>;
  isLoading: boolean;
  isMatching: boolean;
  error: string | null;
}

// Hospital interface
export interface Hospital {
  id: string;
  name: string;
}

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

// Request form values type
export type RequestFormValues = {
  hospitalId: string;
  bloodType: string;
  units: string;
  priority: string;
  requiredBy: Date;
  notes?: string;
};
