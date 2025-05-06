
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
