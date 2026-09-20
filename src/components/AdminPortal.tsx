import React, { useState } from 'react';
import { 
  Shield, Lock, CheckCircle2, XCircle, Clock, Upload, Download, FileText, 
  Calendar, Users, DollarSign, LogOut, CheckSquare, FolderArchive, Send, 
  Sparkles, Building2, MapPin, Phone, Mail, Award, Plus, Camera, Briefcase
} from 'lucide-react';
import { AppointmentRecord, WorkRecord, ShootBatchRecord, StudioShopProfile, EmployeeRecord } from '../types';
import JSZip from 'jszip';
import { SNEPSTUDIO_FILES, CodeFile } from '../codeData';

interface AdminPortalProps {
  bookings: AppointmentRecord[];
  workItems: WorkRecord[];
  shootBatches?: ShootBatchRecord[];
  shopProfile?: StudioShopProfile;
  employees?: EmployeeRecord[];
  onUpdateBookingStatus: (id: number, status: AppointmentRecord['status']) => void;
  onUpdateWorkStatus: (id: number, status: WorkRecord['status'], completedFilename?: string) => void;
  onSendNewBatch?: (newBatch: ShootBatchRecord) => void;
  onUpdateShopProfile?: (updatedShop: StudioShopProfile) => void;
  onAddEmployee?: (newEmployee: EmployeeRecord) => void;
  onClose: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  bookings,
  workItems,
  shootBatches = [],
  shopProfile,
  employees = [],
  onUpdateBookingStatus,
  onUpdateWorkStatus,
  onSendNewBatch,
  onUpdateShopProfile,
  onAddEmployee,
  onClose,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('admin123');
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'bookings' | 'work' | 'proofing' | 'shop' | 'employees' | 'payments' | 'package'>('bookings');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  
  // Shop profile state editing
  const [editedShop, setEditedShop] = useState<StudioShopProfile>(shopProfile || {
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
    operating_hours: 'Monday – Sunday: 09:00 AM – 09:00 PM',
    equipment_inventory: ['Sony FX6 Cinema 4K', 'Sony A7S III', 'DJI Mavic 3 Pro', 'Canon RF 70-200mm f/2.8L'],
    studio_services: ['Wedding Coverage', 'Pre-Wedding Films', 'Maternity Shoots', 'Commercial Portfolios'],
    bank_account_holder: 'SnepStudio Media Private Limited',
    bank_name: 'HDFC Bank Ltd, Bandra West Branch',
    bank_account_no: '50200084920194',
    bank_ifsc: 'HDFC0000019',
    upi_id: 'snepstudio@hdfcbank'
  });
  const [shopSaveSuccess, setShopSaveSuccess] = useState(false);

  // New employee state
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpPhone, setNewEmpPhone] = useState('');
  const [newEmpRole, setNewEmpRole] = useState<EmployeeRecord['role']>('Lead Photographer');
  const [empSaveSuccess, setEmpSaveSuccess] = useState(false);
  
  // New shoot batch dispatch state
  const [newShootTitle, setNewShootTitle] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('rohan.sharma@example.com');
  const [newServiceCategory, setNewServiceCategory] = useState('Pre-Wedding Shoot');
  const [newEmployeeName, setNewEmployeeName] = useState('Arjun Mehta (Lead Photographer)');
  const [batchCreatedSuccess, setBatchCreatedSuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError('Invalid credentials. (Hint: admin / admin123)');
    }
  };

  const handleDownloadFullProjectZip = async () => {
    setIsExporting(true);
    try {
      const zip = new JSZip();
      const rootFolder = zip.folder('SnepStudio') || zip;

      SNEPSTUDIO_FILES.forEach((file: CodeFile) => {
        rootFolder.file(file.path, file.content);
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'SnepStudio_Flask_PostgreSQL_Complete.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to bundle project ZIP', e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#12151e] border border-white/15 rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl relative my-8 max-h-[90vh] flex flex-col">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Studio Staff Administration</h2>
              <span className="text-xs text-slate-400">Back-office Shoot &amp; Work Operations</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                onClick={() => setIsAuthenticated(false)}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg cursor-pointer"
            >
              Exit Portal
            </button>
          </div>
        </div>

        {/* Auth Gate */}
        {!isAuthenticated ? (
          <div className="py-12 max-w-md mx-auto w-full text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/5 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Staff Authentication</h3>
            <p className="text-xs text-slate-400 mb-6">Restricted to SnepStudio photographers &amp; management.</p>

            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {authError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-xs text-left">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold uppercase tracking-wider text-[10px]">
                  Staff ID / Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#181c27] border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold uppercase tracking-wider text-[10px]">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#181c27] border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
              >
                Sign In to Staff Panel
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden pt-6">
            
            {/* Tabs */}
            <div className="flex items-center gap-2 pb-4 border-b border-white/10 shrink-0 text-xs">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-colors ${
                  activeTab === 'bookings' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Shoot Bookings ({bookings.length})
              </button>
              <button
                onClick={() => setActiveTab('work')}
                className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-colors ${
                  activeTab === 'work' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Editing Queue ({workItems.length})
              </button>
              <button
                onClick={() => setActiveTab('proofing')}
                className={`px-3 py-2 rounded-xl font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
                  activeTab === 'proofing' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Proofing ({shootBatches.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('shop')}
                className={`px-3 py-2 rounded-xl font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
                  activeTab === 'shop' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Shop &amp; Address</span>
              </button>
              <button
                onClick={() => setActiveTab('employees')}
                className={`px-3 py-2 rounded-xl font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
                  activeTab === 'employees' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Crew &amp; Gear ({employees.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`px-3 py-2 rounded-xl font-bold cursor-pointer transition-colors ${
                  activeTab === 'payments' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Billing Logs
              </button>
              <button
                onClick={() => setActiveTab('package')}
                className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-colors ml-auto ${
                  activeTab === 'package' ? 'bg-white/20 text-white' : 'text-amber-400 hover:underline'
                }`}
              >
                Standalone Project Package (.ZIP)
              </button>
            </div>

            {/* Tab 1: Bookings */}
            {activeTab === 'bookings' && (
              <div className="flex-1 overflow-y-auto pt-4 space-y-3">
                {bookings.map(b => (
                  <div
                    key={b.id}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white text-sm">#{b.id} &middot; {b.service}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          b.status === 'Approved' ? 'bg-emerald-500/15 text-emerald-400' :
                          b.status === 'In Progress' ? 'bg-blue-500/15 text-blue-400' :
                          b.status === 'Completed' ? 'bg-purple-500/15 text-purple-400' :
                          'bg-amber-500/15 text-amber-400'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px] space-x-2">
                        <span>Client: <strong className="text-slate-200">{b.customer_name}</strong> ({b.phone})</span>
                        <span>&bull;</span>
                        <span>Date: {b.appointment_date} {b.appointment_time}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Venue: {b.address}</div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 self-end md:self-auto">
                      {b.status !== 'Approved' && (
                        <button
                          onClick={() => onUpdateBookingStatus(b.id, 'Approved')}
                          className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      {b.status !== 'In Progress' && (
                        <button
                          onClick={() => onUpdateBookingStatus(b.id, 'In Progress')}
                          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          In Progress
                        </button>
                      )}
                      {b.status !== 'Completed' && (
                        <button
                          onClick={() => onUpdateBookingStatus(b.id, 'Completed')}
                          className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          Complete
                        </button>
                      )}
                      {b.status !== 'Rejected' && (
                        <button
                          onClick={() => onUpdateBookingStatus(b.id, 'Rejected')}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: Work Queue */}
            {activeTab === 'work' && (
              <div className="flex-1 overflow-y-auto pt-4 space-y-3">
                {workItems.map(w => (
                  <div
                    key={w.id}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white text-sm">{w.original_filename}</span>
                        <span className="text-[10px] uppercase font-bold text-amber-400 bg-white/5 px-2 py-0.5 rounded">
                          {w.file_type} &middot; {w.service}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Client: <strong className="text-slate-200">{w.customer_name}</strong> &middot; Status: <strong className="text-amber-300">{w.status}</strong>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-1 italic">
                        &ldquo;{w.description || 'No special notes.'}&rdquo;
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {w.status !== 'Completed' ? (
                        <button
                          onClick={() => onUpdateWorkStatus(w.id, 'Completed', `SnepStudio_Master_${w.original_filename}`)}
                          className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Attach Master Deliverable</span>
                        </button>
                      ) : (
                        <span className="text-emerald-400 font-bold flex items-center gap-1 bg-emerald-400/10 px-2.5 py-1 rounded-lg border border-emerald-400/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Delivered to Client</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Proofing & Selection Batches */}
            {activeTab === 'proofing' && (
              <div className="flex-1 overflow-y-auto pt-4 space-y-4 text-xs">
                
                {/* Send New Shoot Batch to Customer Form */}
                <div className="p-5 rounded-2xl bg-[#141824] border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Send className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-bold text-white">Employee/Admin: Send Shoot Photos in One File to Customer</h4>
                  </div>
                  <p className="text-slate-400 text-xs mb-4">
                    Photographers can upload the complete shoot folder (up to 25 GB master RAW files). The engine auto-compresses the files for client phone/laptop selection with Check &amp; Cross options.
                  </p>

                  {batchCreatedSuccess && (
                    <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                      ✓ New photoshoot proofing file dispatched to customer successfully!
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Shoot Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Udaipur Palace Pre-Wedding Day 1"
                        value={newShootTitle}
                        onChange={(e) => setNewShootTitle(e.target.value)}
                        className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Customer Email</label>
                      <input
                        type="text"
                        value={newCustomerEmail}
                        onChange={(e) => setNewCustomerEmail(e.target.value)}
                        className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Service Type</label>
                      <select
                        value={newServiceCategory}
                        onChange={(e) => setNewServiceCategory(e.target.value)}
                        className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="Pre-Wedding Shoot">Pre-Wedding Shoot</option>
                        <option value="Wedding Shoot">Wedding Shoot</option>
                        <option value="Maternity Shoot">Maternity Shoot</option>
                        <option value="Fashion / Model Shoot">Fashion / Model Shoot</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Photographer</label>
                      <input
                        type="text"
                        value={newEmployeeName}
                        onChange={(e) => setNewEmployeeName(e.target.value)}
                        className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!newShootTitle) {
                        alert('Please enter a shoot title');
                        return;
                      }
                      if (onSendNewBatch) {
                        const newBatch: ShootBatchRecord = {
                          id: `BATCH-2026-${Date.now().toString().slice(-4)}`,
                          customer_id: 101,
                          customer_name: 'Rohan Sharma',
                          customer_email: newCustomerEmail,
                          shoot_title: newShootTitle,
                          service_category: newServiceCategory,
                          employee_name: newEmployeeName,
                          created_at: new Date().toISOString().split('T')[0],
                          total_photos: 6,
                          original_total_size_bytes: 23.5 * 1024 * 1024 * 1024,
                          compressed_total_size_bytes: 14.2 * 1024 * 1024,
                          status: 'sent_to_customer',
                          photos: [
                            {
                              id: `p-${Date.now()}-1`,
                              name: 'RAW_DSC_1001_SunsetGlow.ARW',
                              url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=75',
                              original_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2400&q=100',
                              size_bytes: 3.2 * 1024 * 1024 * 1024,
                              compressed_size_bytes: 2.1 * 1024 * 1024,
                              selection_status: 'pending',
                            },
                            {
                              id: `p-${Date.now()}-2`,
                              name: 'RAW_DSC_1002_SeasidePortraits.ARW',
                              url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=75',
                              original_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=2400&q=100',
                              size_bytes: 3.5 * 1024 * 1024 * 1024,
                              compressed_size_bytes: 2.4 * 1024 * 1024,
                              selection_status: 'pending',
                            },
                            {
                              id: `p-${Date.now()}-3`,
                              name: 'RAW_DSC_1003_VeilFlow_Golden.ARW',
                              url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=75',
                              original_url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=2400&q=100',
                              size_bytes: 3.1 * 1024 * 1024 * 1024,
                              compressed_size_bytes: 2.0 * 1024 * 1024,
                              selection_status: 'pending',
                            },
                          ],
                        };
                        onSendNewBatch(newBatch);
                        setBatchCreatedSuccess(true);
                        setNewShootTitle('');
                        setTimeout(() => setBatchCreatedSuccess(false), 3000);
                      }
                    }}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Upload &amp; Send Shoot File to Customer (Auto-Compress to Mobile Size)</span>
                  </button>
                </div>

                {/* List of Active Shoot Batches */}
                <div className="space-y-3">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
                    Existing Client Proofing Files ({shootBatches.length})
                  </h4>

                  {shootBatches.map((batch) => {
                    const selected = batch.photos.filter((p) => p.selection_status === 'selected');
                    const rejected = batch.photos.filter((p) => p.selection_status === 'rejected');

                    return (
                      <div
                        key={batch.id}
                        className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-white text-sm">{batch.shoot_title}</span>
                            <span className="font-mono text-[10px] text-slate-400">({batch.id})</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              batch.status === 'submitted_to_admin'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : batch.status === 'review_in_progress'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {batch.status === 'submitted_to_admin' ? 'Customer Selected & Submitted' : batch.status}
                            </span>
                          </div>

                          <div className="text-slate-400 text-xs space-x-2">
                            <span>Client: <strong className="text-white">{batch.customer_name}</strong></span>
                            <span>&bull;</span>
                            <span>Photographer: {batch.employee_name}</span>
                            <span>&bull;</span>
                            <span>Original RAW: 24.8 GB (Auto-Compressed for Client)</span>
                          </div>

                          {batch.client_feedback_notes && (
                            <div className="mt-2 text-xs text-amber-300/90 bg-amber-400/5 p-2 rounded-lg border border-amber-400/10">
                              <strong>Client Notes:</strong> &ldquo;{batch.client_feedback_notes}&rdquo;
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-right">
                          <div>
                            <span className="text-xs font-bold text-emerald-400 block font-mono">
                              {selected.length} Selected (New File)
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {rejected.length} Crossed &bull; {batch.photos.length} Total
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* Tab: Shop Details & Physical Address */}
            {activeTab === 'shop' && (
              <div className="flex-1 overflow-y-auto pt-4 space-y-4 text-xs">
                <div className="p-5 rounded-2xl bg-[#141824] border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-400" />
                      <h4 className="text-sm font-bold text-white">Studio Shop Commercial Details &amp; Physical Address</h4>
                    </div>
                    {shopSaveSuccess && (
                      <span className="text-emerald-400 text-xs font-bold animate-pulse">
                        ✓ Studio Shop profile successfully saved &amp; updated!
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs mb-4">
                    Manage your complete studio establishment data, shop registration number, GSTIN, primary street address, operating hours, and invoice UPI credentials.
                  </p>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (onUpdateShopProfile) {
                        onUpdateShopProfile(editedShop);
                      }
                      setShopSaveSuccess(true);
                      setTimeout(() => setShopSaveSuccess(false), 3000);
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Studio / Shop Name</label>
                        <input
                          type="text"
                          required
                          value={editedShop.shop_name}
                          onChange={(e) => setEditedShop({ ...editedShop, shop_name: e.target.value })}
                          className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Owner / Director Name</label>
                        <input
                          type="text"
                          required
                          value={editedShop.owner_name}
                          onChange={(e) => setEditedShop({ ...editedShop, owner_name: e.target.value })}
                          className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Studio Slogan / Tagline</label>
                        <input
                          type="text"
                          value={editedShop.tagline}
                          onChange={(e) => setEditedShop({ ...editedShop, tagline: e.target.value })}
                          className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Shop Est. License No.</label>
                        <input
                          type="text"
                          value={editedShop.shop_reg_number}
                          onChange={(e) => setEditedShop({ ...editedShop, shop_reg_number: e.target.value })}
                          className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">GSTIN Tax Registration</label>
                        <input
                          type="text"
                          value={editedShop.gst_tin}
                          onChange={(e) => setEditedShop({ ...editedShop, gst_tin: e.target.value })}
                          className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Primary Hotline</label>
                        <input
                          type="text"
                          value={editedShop.phone_primary}
                          onChange={(e) => setEditedShop({ ...editedShop, phone_primary: e.target.value })}
                          className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Studio Landline / Secondary</label>
                        <input
                          type="text"
                          value={editedShop.phone_secondary || ''}
                          onChange={(e) => setEditedShop({ ...editedShop, phone_secondary: e.target.value })}
                          className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    {/* Physical Address Block */}
                    <div className="pt-2 border-t border-white/10 space-y-3">
                      <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                        Physical Studio Address &amp; Location
                      </span>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Street Address, Building, Floor</label>
                        <input
                          type="text"
                          value={editedShop.street_address}
                          onChange={(e) => setEditedShop({ ...editedShop, street_address: e.target.value })}
                          className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Landmark</label>
                          <input
                            type="text"
                            value={editedShop.landmark}
                            onChange={(e) => setEditedShop({ ...editedShop, landmark: e.target.value })}
                            className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">City &amp; State</label>
                          <input
                            type="text"
                            value={`${editedShop.city}, ${editedShop.state}`}
                            onChange={(e) => {
                              const parts = e.target.value.split(',');
                              setEditedShop({ ...editedShop, city: parts[0]?.trim() || '', state: parts[1]?.trim() || '' });
                            }}
                            className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Pincode</label>
                          <input
                            type="text"
                            value={editedShop.pincode}
                            onChange={(e) => setEditedShop({ ...editedShop, pincode: e.target.value })}
                            className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Banking & UPI */}
                    <div className="pt-2 border-t border-white/10 space-y-3">
                      <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                        Billing &amp; Invoice Settlement Details
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Studio UPI ID</label>
                          <input
                            type="text"
                            value={editedShop.upi_id}
                            onChange={(e) => setEditedShop({ ...editedShop, upi_id: e.target.value })}
                            className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Bank Name &amp; Branch</label>
                          <input
                            type="text"
                            value={editedShop.bank_name}
                            onChange={(e) => setEditedShop({ ...editedShop, bank_name: e.target.value })}
                            className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Account No &amp; IFSC</label>
                          <input
                            type="text"
                            value={`${editedShop.bank_account_no} / ${editedShop.bank_ifsc}`}
                            onChange={(e) => {
                              const parts = e.target.value.split('/');
                              setEditedShop({ ...editedShop, bank_account_no: parts[0]?.trim() || '', bank_ifsc: parts[1]?.trim() || '' });
                            }}
                            className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-6 py-2.5 rounded-xl uppercase tracking-wider cursor-pointer"
                    >
                      Save Studio Shop Details
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Tab: Employees & Studio Inventory */}
            {activeTab === 'employees' && (
              <div className="flex-1 overflow-y-auto pt-4 space-y-4 text-xs">
                {/* Add New Employee */}
                <div className="p-5 rounded-2xl bg-[#141824] border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-400" />
                      <h4 className="text-sm font-bold text-white">Enroll Studio Employee / Crew Member</h4>
                    </div>
                    {empSaveSuccess && (
                      <span className="text-emerald-400 text-xs font-bold">✓ Staff member enrolled!</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={newEmpName}
                        onChange={(e) => setNewEmpName(e.target.value)}
                        placeholder="e.g. Rohit Patil"
                        className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Email</label>
                      <input
                        type="email"
                        value={newEmpEmail}
                        onChange={(e) => setNewEmpEmail(e.target.value)}
                        placeholder="rohit@snepstudio.com"
                        className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Phone</label>
                      <input
                        type="text"
                        value={newEmpPhone}
                        onChange={(e) => setNewEmpPhone(e.target.value)}
                        placeholder="+91 98200 12345"
                        className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Specialization</label>
                      <select
                        value={newEmpRole}
                        onChange={(e) => setNewEmpRole(e.target.value as any)}
                        className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="Lead Photographer">Lead Photographer</option>
                        <option value="Cinematographer">Cinematographer</option>
                        <option value="Drone Pilot">Drone Pilot</option>
                        <option value="Senior Colorist / Video Editor">Senior Colorist / Video Editor</option>
                        <option value="Studio Assistant">Studio Assistant</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!newEmpName || !newEmpEmail) {
                        alert('Please fill employee name and email');
                        return;
                      }
                      if (onAddEmployee) {
                        const newEmp: EmployeeRecord = {
                          id: `EMP-0${employees.length + 1}`,
                          name: newEmpName,
                          email: newEmpEmail,
                          phone: newEmpPhone || '+91 98200 00000',
                          role: newEmpRole,
                          joined_date: new Date().toISOString().split('T')[0],
                          status: 'Active',
                          shoots_completed: 0
                        };
                        onAddEmployee(newEmp);
                        setEmpSaveSuccess(true);
                        setNewEmpName('');
                        setNewEmpEmail('');
                        setNewEmpPhone('');
                        setTimeout(() => setEmpSaveSuccess(false), 3000);
                      }
                    }}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2 rounded-xl uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Studio Staff Member</span>
                  </button>
                </div>

                {/* List of Studio Crew Members */}
                <div className="space-y-3">
                  <h4 className="font-bold text-white uppercase text-slate-400 text-xs">
                    Active Studio Photographers &amp; Film Crew ({employees.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {employees.map((emp) => (
                      <div
                        key={emp.id}
                        className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-white text-sm">{emp.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">({emp.id})</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              emp.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              {emp.status}
                            </span>
                          </div>
                          <div className="text-slate-400 text-xs">
                            <span className="text-amber-400 font-medium">{emp.role}</span> &bull; {emp.email} &bull; {emp.phone}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-emerald-400 text-sm block">
                            {emp.shoots_completed}
                          </span>
                          <span className="text-[10px] text-slate-500">Shoots Done</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Studio Equipment Inventory Section */}
                <div className="p-5 rounded-2xl bg-[#141824] border border-white/10 mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-bold text-white">Studio Cameras, Drones &amp; Lighting Gear Inventory</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    {(editedShop.equipment_inventory || []).map((eq, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{eq}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'payments' && (
              <div className="flex-1 overflow-y-auto pt-4 space-y-3">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] uppercase text-slate-400">Total Bookings Value</span>
                    <h4 className="text-xl font-black text-amber-400 mt-1">
                      ₹{bookings.reduce((acc, b) => acc + b.amount, 0).toLocaleString()}
                    </h4>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] uppercase text-slate-400">Paid &amp; Settled</span>
                    <h4 className="text-xl font-black text-emerald-400 mt-1">
                      ₹{bookings.filter(b => b.payment_status === 'Paid').reduce((acc, b) => acc + b.amount, 0).toLocaleString()}
                    </h4>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] uppercase text-slate-400">Awaiting Settlement</span>
                    <h4 className="text-xl font-black text-amber-300 mt-1">
                      ₹{bookings.filter(b => b.payment_status !== 'Paid').reduce((acc, b) => acc + b.amount, 0).toLocaleString()}
                    </h4>
                  </div>
                </div>

                {bookings.map(b => (
                  <div key={b.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">#{b.id} &middot; {b.customer_name}</span>
                      <span className="text-slate-400 text-[11px]">{b.service} &middot; {b.appointment_date}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-amber-400 block">₹{b.amount.toLocaleString()}</span>
                      <span className={`text-[10px] font-semibold ${b.payment_status === 'Paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {b.payment_status} ({b.payment_method || 'UPI/Online'})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 4: Package */}
            {activeTab === 'package' && (
              <div className="flex-1 overflow-y-auto pt-6 text-xs text-slate-300 space-y-4">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h4 className="text-base font-bold text-white mb-2">Standalone Project Package (Flask + PostgreSQL)</h4>
                  <p className="text-slate-400 text-xs leading-relaxed mb-4">
                    For examiners or academic viva review, the complete standalone Python Flask 3.0 backend, PostgreSQL schema (`schema.sql`), and Jinja2 templates are bundled ready to execute locally using <code>python app.py</code>.
                  </p>
                  <button
                    onClick={handleDownloadFullProjectZip}
                    disabled={isExporting}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-md flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isExporting ? 'Packaging ZIP Archive...' : 'Download SnepStudio.zip'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
