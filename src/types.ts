export interface UserRecord {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
  role?: 'customer' | 'admin' | 'employee';
  designation?: string;
  has_logged_in?: boolean; // One-time login validation indicator
  last_login_at?: string;
}

export interface StudioShopProfile {
  shop_name: string;
  tagline: string;
  owner_name: string;
  shop_reg_number: string;
  gst_tin: string;
  email: string;
  phone_primary: string;
  phone_secondary?: string;
  street_address: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  operating_hours: string;
  equipment_inventory: string[];
  studio_services: string[];
  bank_account_holder: string;
  bank_name: string;
  bank_account_no: string;
  bank_ifsc: string;
  upi_id: string;
}

export interface EmployeeRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Lead Photographer' | 'Drone Pilot' | 'Cinematographer' | 'Senior Colorist / Video Editor' | 'Studio Assistant';
  joined_date: string;
  status: 'Active' | 'On Shoot' | 'Leave';
  shoots_completed: number;
}

export interface AppointmentRecord {
  id: number;
  user_id: number;
  customer_name: string;
  phone: string;
  address: string;
  service: string;
  appointment_date: string;
  appointment_time: string;
  message?: string;
  status: 'Pending' | 'Approved' | 'In Progress' | 'Completed' | 'Rejected' | 'Cancelled';
  payment_status: 'Pending' | 'Paid';
  payment_id: number;
  amount: number;
  payment_method?: string;
}

export interface WorkRecord {
  id: number;
  user_id: number;
  customer_name: string;
  appointment_id?: number | null;
  service: string;
  original_filename: string;
  file_type: 'Photo' | 'Video';
  description?: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  completed_filename?: string;
  created_at: string;
}

export interface PaymentRecord {
  id: number;
  user_id: number;
  customer_name: string;
  customer_email: string;
  appointment_id: number;
  service: string;
  amount: number;
  payment_method: string;
  payment_status: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  payment_date?: string;
}

export interface ShootPhotoItem {
  id: string;
  name: string;
  url: string; // Preview URL (smart compressed for fast viewing/browsing)
  original_url: string; // Full quality lossless original master URL
  size_bytes: number; // Original size (supports large master files)
  compressed_size_bytes: number; // Auto-compressed preview size
  selection_status: 'selected' | 'rejected' | 'pending'; // check (selected) or cross (rejected)
  selected_at?: string;
  notes?: string;
}

export interface ShootBatchRecord {
  id: string;
  appointment_id?: number | null;
  customer_id: number;
  customer_name: string;
  customer_email: string;
  shoot_title: string; // e.g., "Pre-Wedding Romantic Sunset Shoot - Goa Beach"
  service_category: string; // "Pre-Wedding Shoot", "Wedding Shoot", "Fashion Shoot", etc.
  employee_name: string; // Photograher / Assistant who uploaded
  created_at: string;
  total_photos: number;
  original_total_size_bytes: number; // up to 25 GB supported
  compressed_total_size_bytes: number; // tiny mobile-friendly compressed package
  photos: ShootPhotoItem[];
  status: 'sent_to_customer' | 'review_in_progress' | 'submitted_to_admin' | 'finalized';
  customer_submitted_at?: string;
  client_feedback_notes?: string;
}
