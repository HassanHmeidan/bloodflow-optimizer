
// Define user role types
export type UserRole = 'admin' | 'hospital' | 'donor';

// Define permission types
export type Permission = 
  | 'manage_users'
  | 'view_all_donations'
  | 'create_blood_drive'
  | 'request_blood'
  | 'approve_requests'
  | 'manage_inventory'
  | 'make_donation'
  | 'schedule_appointment'
  | 'view_own_history'
  | 'manage_hospital'
  | 'edit_system_settings';

// Define role-based permissions
export const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    'manage_users',
    'view_all_donations',
    'create_blood_drive',
    'request_blood',
    'approve_requests',
    'manage_inventory',
    'edit_system_settings'
  ],
  hospital: [
    'request_blood',
    'view_all_donations',
    'manage_inventory',
    'manage_hospital'
  ],
  donor: [
    'make_donation',
    'schedule_appointment',
    'view_own_history'
  ]
};

// Helper function to check if a user has a specific permission
export const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
  return rolePermissions[userRole]?.includes(permission) || false;
};

// Descriptions of different user roles
export const roleDescriptions: Record<UserRole, string> = {
  admin: "System administrators have full access to manage users, donations, inventory, and system settings.",
  hospital: "Hospital staff can request blood, view available inventory, and manage hospital-specific settings.",
  donor: "Donors can schedule appointments, track their donation history, and manage their profile."
};

// Feature availability by role
export const roleFeatures: Record<UserRole, string[]> = {
  admin: [
    "Manage all system users and their permissions",
    "View and export comprehensive donation reports",
    "Organize and schedule blood drives",
    "Approve or deny blood requests",
    "Configure system settings",
    "Manage and update blood inventory",
    "Send mass notifications to donors or hospitals"
  ],
  hospital: [
    "Request specific blood types and quantities",
    "View real-time blood inventory availability",
    "Track incoming blood shipments",
    "Manage patient blood needs",
    "Generate reports on blood usage",
    "Coordinate with other hospitals for emergency needs"
  ],
  donor: [
    "Schedule and manage donation appointments",
    "View donation history and impact statistics",
    "Receive eligibility notifications",
    "Get rewards and recognition for donations",
    "Find nearby donation centers",
    "Share donation activity on social media"
  ]
};
