import { StudioShopProfile, EmployeeRecord, UserRecord } from '../types';

export const INITIAL_STUDIO_SHOP: StudioShopProfile = {
  shop_name: 'SnepStudio Photography & Films',
  tagline: 'Preserving Your Most Treasured Moments in Cinematic Splendor',
  owner_name: 'Vikramaditya Sengupta',
  shop_reg_number: 'MAH/MUM/EST/2021/84920',
  gst_tin: '27AABCU9603R1ZM',
  email: 'contact@snepstudio.com',
  phone_primary: '+91 98765 43210',
  phone_secondary: '+91 22 2640 8899',
  street_address: 'Plot 42, Floor 2, Creative Arts Enclave, Off Linking Road',
  landmark: 'Near Starbucks & Mehboob Studios, Bandra West',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400050',
  operating_hours: 'Monday – Sunday: 09:00 AM – 09:00 PM (Shoot crews 24/7 on request)',
  equipment_inventory: [
    'Sony FX6 Cinema Line Full-Frame 4K (2x)',
    'Sony A7S III & A7 IV High-Speed 120fps Cameras (4x)',
    'Canon RF 28-70mm f/2L & 70-200mm f/2.8L IS USM Lenses',
    'DJI Inspire 3 & DJI Mavic 3 Pro Cine 5.1K Drones with DGCA License',
    'Aputure 600d Pro & Amaran F22c Full Color RGB Studio Lights',
    'DJI RS 3 Pro Gimbals with LiDAR Auto-Focus Follow Systems',
    'Sennheiser MKH 416 & DJI Mic 2 Wireless Pro Dual Transmitters',
    'Color-Calibrated EIZO ColorEdge 4K Mastering Grading Suite'
  ],
  studio_services: [
    'Wedding & Reception Coverage',
    'Pre-Wedding Cinematic Films',
    'Destination Wedding Photography',
    'Maternity & Baby Milestone Shoots',
    'Fashion & Modeling Portfolios',
    'Commercial & Brand Product Catalog',
    'Corporate Events & Aerial Drone Shoots',
    'Custom Heirloom Photo Albums & Framing'
  ],
  bank_account_holder: 'SnepStudio Media Private Limited',
  bank_name: 'HDFC Bank Ltd, Bandra West Branch',
  bank_account_no: '50200084920194',
  bank_ifsc: 'HDFC0000019',
  upi_id: 'snepstudio@hdfcbank'
};

export const INITIAL_STUDIO_EMPLOYEES: EmployeeRecord[] = [
  {
    id: 'EMP-0001',
    name: 'Arjun Mehta',
    email: 'arjun.mehta@snepstudio.com',
    phone: '+91 98201 11223',
    role: 'Lead Photographer',
    joined_date: '2023-01-15',
    status: 'Active',
    shoots_completed: 142
  },
  {
    id: 'EMP-0002',
    name: 'Kavita Iyer',
    email: 'kavita.iyer@snepstudio.com',
    phone: '+91 98202 33445',
    role: 'Cinematographer',
    joined_date: '2023-06-01',
    status: 'On Shoot',
    shoots_completed: 98
  },
  {
    id: 'EMP-0003',
    name: 'Rahul Deshmukh',
    email: 'rahul.deshmukh@snepstudio.com',
    phone: '+91 98203 55667',
    role: 'Drone Pilot',
    joined_date: '2024-02-10',
    status: 'Active',
    shoots_completed: 64
  },
  {
    id: 'EMP-0004',
    name: 'Pooja Nair',
    email: 'pooja.nair@snepstudio.com',
    phone: '+91 98204 77889',
    role: 'Senior Colorist / Video Editor',
    joined_date: '2023-08-20',
    status: 'Active',
    shoots_completed: 215
  },
  {
    id: 'EMP-0005',
    name: 'Sameer Khan',
    email: 'sameer.khan@snepstudio.com',
    phone: '+91 98205 99001',
    role: 'Studio Assistant',
    joined_date: '2024-05-12',
    status: 'Active',
    shoots_completed: 45
  }
];

export interface StoredAuthAccount {
  id: number;
  role: 'customer' | 'admin' | 'employee';
  name: string;
  email: string;
  phone: string;
  address: string;
  passwordHash: string;
  designation?: string;
  employee_id?: string;
  shop_name?: string;
  created_at: string;
}

export const PRESEEDED_ACCOUNTS: StoredAuthAccount[] = [
  {
    id: 101,
    role: 'customer',
    name: 'Rohan Sharma',
    email: 'rohan.sharma@example.com',
    phone: '+91 98765 43210',
    address: 'Silver Sands, Juhu Beach Road, Mumbai, Maharashtra 400049',
    passwordHash: 'password123',
    created_at: '2026-02-15'
  },
  {
    id: 901,
    role: 'admin',
    name: 'Vikramaditya Sengupta (Studio Owner)',
    email: 'admin@snepstudio.com',
    phone: '+91 98765 43210',
    address: 'SnepStudio, Plot 42, Bandra West, Mumbai 400050',
    passwordHash: 'admin123',
    designation: 'Studio Owner & Executive Producer',
    shop_name: 'SnepStudio Photography & Films',
    created_at: '2025-01-01'
  },
  {
    id: 801,
    role: 'employee',
    name: 'Arjun Mehta',
    email: 'arjun.mehta@snepstudio.com',
    phone: '+91 98201 11223',
    address: 'Andheri West, Mumbai, Maharashtra',
    passwordHash: 'employee123',
    designation: 'Lead Photographer',
    employee_id: 'EMP-0001',
    created_at: '2023-01-15'
  }
];
