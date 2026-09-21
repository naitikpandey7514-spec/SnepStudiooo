import React, { useState } from 'react';
import { 
  Shield, Lock, CheckCircle2, XCircle, Clock, Upload, Download, FileText, 
  Calendar, Users, DollarSign, LogOut, CheckSquare, FolderArchive, Send, 
  Sparkles, Building2, MapPin, Phone, Mail, Award, Plus, Camera, Briefcase,
  TrendingUp, Layers, Check, Edit2, ChevronRight, UserCheck
} from 'lucide-react';
import { AppointmentRecord, WorkRecord, ShootBatchRecord, StudioShopProfile, EmployeeRecord } from '../types';
import { StoredAuthAccount } from '../data/studioData';
import { StudioService, STUDIO_SERVICES } from '../data/photographyData';

interface AdminPortalProps {
  bookings: AppointmentRecord[];
  workItems: WorkRecord[];
  shootBatches?: ShootBatchRecord[];
  shopProfile?: StudioShopProfile;
  employees?: EmployeeRecord[];
  accounts?: StoredAuthAccount[];
  services?: StudioService[];
  onUpdateBookingStatus: (id: number, status: AppointmentRecord['status']) => void;
  onUpdateWorkStatus: (id: number, status: WorkRecord['status'], completedFilename?: string) => void;
  onAssignEmployeeToAppointment?: (bookingId: number, employeeId: string, employeeName: string) => void;
  onAssignEmployeeToWork?: (workId: number, employeeId: string, employeeName: string) => void;
  onAddEmployee?: (newEmployee: EmployeeRecord, tempPassword?: string) => void;
  onUpdateShopProfile?: (updatedShop: StudioShopProfile) => void;
  onAddService?: (newService: StudioService) => void;
  onUpdateServicePrice?: (serviceId: string, newNumericPrice: number) => void;
  onViewInvoice?: (booking: AppointmentRecord) => void;
  onClose: () => void;
  isFullPage?: boolean;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  bookings,
  workItems,
  shootBatches = [],
  shopProfile,
  employees = [],
  accounts = [],
  services = STUDIO_SERVICES,
  onUpdateBookingStatus,
  onUpdateWorkStatus,
  onAssignEmployeeToAppointment,
  onAssignEmployeeToWork,
  onAddEmployee,
  onUpdateShopProfile,
  onAddService,
  onUpdateServicePrice,
  onViewInvoice,
  onClose,
  isFullPage = false
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'appointments' | 'work' | 'customers' | 'employees' | 'services' | 'payments' | 'shop'
  >('overview');

  // Filter states
  const [bookingFilter, setBookingFilter] = useState<'all' | 'Pending' | 'Approved' | 'In Progress' | 'Completed'>('all');
  const [workFilter, setWorkFilter] = useState<'all' | 'Pending' | 'In Progress' | 'Completed'>('all');

  // Employee creation state
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpPhone, setNewEmpPhone] = useState('');
  const [newEmpRole, setNewEmpRole] = useState<EmployeeRecord['role']>('Lead Photographer');
  const [newEmpPassword, setNewEmpPassword] = useState('employee123');
  const [empSaveSuccess, setEmpSaveSuccess] = useState(false);

  // Service creation state
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState(1999);
  const [newServiceTagline, setNewServiceTagline] = useState('');
  const [newServiceTurnaround, setNewServiceTurnaround] = useState('48 hours');
  const [serviceSuccess, setServiceSuccess] = useState(false);

  // Shop profile editing state
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
    equipment_inventory: ['Sony FX6 Cinema 4K', 'Sony A7S III', 'DJI Mavic 3 Pro Cine', 'Canon RF 70-200mm f/2.8L'],
    studio_services: ['Wedding Coverage', 'Pre-Wedding Films', 'Maternity Shoots', 'Commercial Portfolios'],
    bank_account_holder: 'SnepStudio Media Private Limited',
    bank_name: 'HDFC Bank Ltd, Bandra West Branch',
    bank_account_no: '50200084920194',
    bank_ifsc: 'HDFC0000019',
    upi_id: 'snepstudio@hdfcbank'
  });
  const [shopSaveSuccess, setShopSaveSuccess] = useState(false);

  // Filtered lists
  const filteredBookings = bookings.filter(b => bookingFilter === 'all' ? true : b.status === bookingFilter);
  const filteredWork = workItems.filter(w => workFilter === 'all' ? true : w.status === workFilter);
  const customerAccounts = accounts.filter(a => a.role === 'customer');

  // Overview metrics
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.payment_status === 'Paid' ? b.amount : 0), 0);
  const pendingAppointmentsCount = bookings.filter(b => b.status === 'Pending').length;
  const inProgressWorkCount = workItems.filter(w => w.status === 'In Progress').length;
  const completedDeliverablesCount = workItems.filter(w => w.status === 'Completed').length;

  const content = (
    <div className="flex-1 flex flex-col overflow-hidden text-xs">
      
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white">Studio Admin Dashboard</h2>
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Owner Portal
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Comprehensive Photography &amp; Editing Management Control
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/15 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5 text-amber-400" />
            <span>Exit to Website</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-4 border-b border-white/10 shrink-0">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'overview' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'appointments' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Appointments ({bookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('work')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'work' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Uploaded Work ({workItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'customers' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Customers ({customerAccounts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('employees')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'employees' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Employees ({employees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'services' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Services ({services.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'payments' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Payments &amp; Invoices</span>
        </button>

        <button
          onClick={() => setActiveTab('shop')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'shop' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Studio Profile</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto pt-6 space-y-6">
        
        {/* ============================================================== */}
        {/* 1. OVERVIEW / ADMIN DASHBOARD                                  */}
        {/* ============================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-[#161a25] border border-white/10 rounded-2xl p-4">
                <span className="text-slate-400 text-[11px] block">Total Revenue</span>
                <span className="text-xl font-black text-amber-400 font-mono mt-1 block">
                  ₹{totalRevenue.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-400 mt-1 block">From paid bookings</span>
              </div>

              <div className="bg-[#161a25] border border-white/10 rounded-2xl p-4">
                <span className="text-slate-400 text-[11px] block">Total Bookings</span>
                <span className="text-xl font-black text-white font-mono mt-1 block">
                  {bookings.length}
                </span>
                <span className="text-[10px] text-amber-400 mt-1 block">{pendingAppointmentsCount} pending review</span>
              </div>

              <div className="bg-[#161a25] border border-white/10 rounded-2xl p-4">
                <span className="text-slate-400 text-[11px] block">Work Items</span>
                <span className="text-xl font-black text-white font-mono mt-1 block">
                  {workItems.length}
                </span>
                <span className="text-[10px] text-blue-400 mt-1 block">{inProgressWorkCount} currently editing</span>
              </div>

              <div className="bg-[#161a25] border border-white/10 rounded-2xl p-4">
                <span className="text-slate-400 text-[11px] block">Completed Files</span>
                <span className="text-xl font-black text-emerald-400 font-mono mt-1 block">
                  {completedDeliverablesCount}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">Ready for download</span>
              </div>

              <div className="bg-[#161a25] border border-white/10 rounded-2xl p-4">
                <span className="text-slate-400 text-[11px] block">Customers</span>
                <span className="text-xl font-black text-white font-mono mt-1 block">
                  {customerAccounts.length}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">Registered profiles</span>
              </div>

              <div className="bg-[#161a25] border border-white/10 rounded-2xl p-4">
                <span className="text-slate-400 text-[11px] block">Studio Crew</span>
                <span className="text-xl font-black text-white font-mono mt-1 block">
                  {employees.length}
                </span>
                <span className="text-[10px] text-amber-400 mt-1 block">Photographers &amp; staff</span>
              </div>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                onClick={() => setActiveTab('appointments')}
                className="bg-[#141824] border border-white/10 hover:border-amber-400/50 p-5 rounded-2xl cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white text-sm">Manage &amp; Assign Appointments</h4>
                  <Calendar className="w-5 h-5 text-amber-400" />
                </div>
                <p className="text-slate-400 text-xs">
                  Review customer bookings, approve dates, and allocate lead photographers or cinematography crews.
                </p>
              </div>

              <div 
                onClick={() => setActiveTab('work')}
                className="bg-[#141824] border border-white/10 hover:border-amber-400/50 p-5 rounded-2xl cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white text-sm">Editing Queue &amp; Completed Files</h4>
                  <Layers className="w-5 h-5 text-amber-400" />
                </div>
                <p className="text-slate-400 text-xs">
                  Track client photo and video editing requests, assign to colorists/editors, and upload final deliverables.
                </p>
              </div>

              <div 
                onClick={() => setActiveTab('services')}
                className="bg-[#141824] border border-white/10 hover:border-amber-400/50 p-5 rounded-2xl cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white text-sm">Studio Services &amp; Rates</h4>
                  <Camera className="w-5 h-5 text-amber-400" />
                </div>
                <p className="text-slate-400 text-xs">
                  Update photography package rates, turnaround times, and add new studio offerings.
                </p>
              </div>
            </div>

            {/* Recent Appointments Preview */}
            <div className="bg-[#141824] border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white text-sm">Upcoming Photoshoots</h3>
                <button
                  onClick={() => setActiveTab('appointments')}
                  className="text-amber-400 hover:underline text-xs font-semibold"
                >
                  View All &rarr;
                </button>
              </div>

              <div className="space-y-2.5">
                {bookings.slice(0, 3).map(b => (
                  <div key={b.id} className="p-3 bg-[#1a2030] rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">{b.service}</span>
                      <span className="text-slate-400 text-[11px]">{b.customer_name} &bull; {b.appointment_date} at {b.appointment_time}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-amber-400 font-mono font-bold">₹{b.amount.toLocaleString()}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        b.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' :
                        b.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* 2. APPOINTMENTS (VIEW, UPDATE STATUS, ASSIGN TO EMPLOYEE)     */}
        {/* ============================================================== */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#141824] p-3 rounded-2xl border border-white/10">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-semibold mr-1">Status:</span>
                {(['all', 'Pending', 'Approved', 'In Progress', 'Completed'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setBookingFilter(status)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                      bookingFilter === status ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {status === 'all' ? `All (${bookings.length})` : status}
                  </button>
                ))}
              </div>

              <span className="text-xs text-slate-400 font-mono">
                Showing {filteredBookings.length} bookings
              </span>
            </div>

            {/* Appointments List */}
            <div className="space-y-3">
              {filteredBookings.map(b => (
                <div 
                  key={b.id}
                  className="bg-[#141824] border border-white/10 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white text-base">#{b.id} &middot; {b.service}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        b.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        b.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        b.status === 'Completed' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                        b.status === 'Rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {b.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.payment_status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        Payment: {b.payment_status} (₹{b.amount.toLocaleString()})
                      </span>
                    </div>

                    <div className="text-slate-300 text-xs flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span><strong>Client:</strong> {b.customer_name} ({b.phone})</span>
                      <span><strong>Date:</strong> {b.appointment_date} at {b.appointment_time}</span>
                      <span><strong>Venue:</strong> {b.address}</span>
                    </div>

                    {b.message && (
                      <p className="text-slate-400 text-xs italic bg-white/5 p-2 rounded-lg max-w-2xl">
                        &ldquo;{b.message}&rdquo;
                      </p>
                    )}

                    {/* Assigned Employee Tag */}
                    <div className="pt-2 flex items-center gap-2">
                      <span className="text-slate-400 text-[11px] font-semibold">Assigned Staff / Crew:</span>
                      {b.assigned_employee_name ? (
                        <span className="inline-flex items-center gap-1.5 bg-amber-400/10 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-lg text-xs font-bold">
                          <UserCheck className="w-3 h-3 text-amber-400" />
                          <span>{b.assigned_employee_name} ({b.assigned_employee_id || 'Staff'})</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs italic">Unassigned (select staff below)</span>
                      )}
                    </div>
                  </div>

                  {/* Actions Area: Assign Employee + Update Status + Invoice */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/5">
                    
                    {/* Assign Employee Dropdown */}
                    <div className="flex items-center gap-1 bg-[#1a2030] border border-white/10 rounded-xl px-2.5 py-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <select
                        value={b.assigned_employee_id || ''}
                        onChange={(e) => {
                          const selectedEmp = employees.find(emp => emp.id === e.target.value);
                          if (selectedEmp && onAssignEmployeeToAppointment) {
                            onAssignEmployeeToAppointment(b.id, selectedEmp.id, selectedEmp.name);
                          }
                        }}
                        className="bg-transparent text-white text-xs font-medium focus:outline-none cursor-pointer"
                      >
                        <option value="" className="bg-[#1a2030] text-slate-400">Assign Crew...</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id} className="bg-[#1a2030] text-white">
                            {emp.name} ({emp.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status Updaters */}
                    <div className="flex items-center gap-1">
                      {b.status !== 'Approved' && (
                        <button
                          onClick={() => onUpdateBookingStatus(b.id, 'Approved')}
                          className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      {b.status !== 'In Progress' && (
                        <button
                          onClick={() => onUpdateBookingStatus(b.id, 'In Progress')}
                          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-bold px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          In Progress
                        </button>
                      )}
                      {b.status !== 'Completed' && (
                        <button
                          onClick={() => onUpdateBookingStatus(b.id, 'Completed')}
                          className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          Complete
                        </button>
                      )}
                    </div>

                    {/* View Invoice */}
                    {onViewInvoice && (
                      <button
                        onClick={() => onViewInvoice(b)}
                        className="bg-white/10 hover:bg-white/15 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                        title="View GST Tax Invoice"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>Invoice</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {filteredBookings.length === 0 && (
                <div className="p-8 text-center bg-[#141824] rounded-2xl text-slate-400">
                  No appointments match the selected status filter.
                </div>
              )}
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* 3. UPLOADED WORK (VIEW, ASSIGN TO EMPLOYEE, UPDATE STATUS)     */}
        {/* ============================================================== */}
        {activeTab === 'work' && (
          <div className="space-y-4">
            
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#141824] p-3 rounded-2xl border border-white/10">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-semibold mr-1">Work Status:</span>
                {(['all', 'Pending', 'In Progress', 'Completed'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setWorkFilter(status)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                      workFilter === status ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {status === 'all' ? `All (${workItems.length})` : status}
                  </button>
                ))}
              </div>

              <span className="text-xs text-slate-400 font-mono">
                {workItems.filter(w => w.status === 'Completed').length} Completed Deliverables
              </span>
            </div>

            {/* Work Queue */}
            <div className="space-y-3">
              {filteredWork.map(w => (
                <div 
                  key={w.id}
                  className="bg-[#141824] border border-white/10 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base">{w.original_filename}</span>
                      <span className="text-[10px] font-bold text-amber-400 uppercase bg-white/5 px-2 py-0.5 rounded">
                        {w.file_type} &bull; {w.service}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        w.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' :
                        w.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {w.status}
                      </span>
                    </div>

                    <div className="text-slate-300 text-xs">
                      Customer: <strong>{w.customer_name}</strong> &bull; Uploaded: {w.created_at}
                    </div>

                    {w.description && (
                      <p className="text-slate-400 text-xs italic bg-white/5 p-2 rounded-lg max-w-xl">
                        &ldquo;{w.description}&rdquo;
                      </p>
                    )}

                    {w.completed_filename && (
                      <div className="text-xs text-emerald-400 flex items-center gap-1 pt-1 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Completed Master: {w.completed_filename}</span>
                      </div>
                    )}

                    {/* Assigned Editor Tag */}
                    <div className="pt-1 flex items-center gap-2">
                      <span className="text-slate-400 text-[11px] font-semibold">Assigned Editor:</span>
                      {w.assigned_employee_name ? (
                        <span className="inline-flex items-center gap-1.5 bg-amber-400/10 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-lg text-xs font-bold">
                          <UserCheck className="w-3 h-3 text-amber-400" />
                          <span>{w.assigned_employee_name}</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs italic">Unassigned (select below)</span>
                      )}
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                    
                    {/* Assign Editor Dropdown */}
                    <div className="flex items-center gap-1 bg-[#1a2030] border border-white/10 rounded-xl px-2.5 py-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <select
                        value={w.assigned_employee_id || ''}
                        onChange={(e) => {
                          const selectedEmp = employees.find(emp => emp.id === e.target.value);
                          if (selectedEmp && onAssignEmployeeToWork) {
                            onAssignEmployeeToWork(w.id, selectedEmp.id, selectedEmp.name);
                          }
                        }}
                        className="bg-transparent text-white text-xs font-medium focus:outline-none cursor-pointer"
                      >
                        <option value="" className="bg-[#1a2030] text-slate-400">Assign Editor...</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id} className="bg-[#1a2030] text-white">
                            {emp.name} ({emp.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Update Status / Attach Finished Deliverable */}
                    {w.status !== 'Completed' ? (
                      <button
                        onClick={() => onUpdateWorkStatus(w.id, 'Completed', `SnepStudio_Master_${w.original_filename}`)}
                        className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Attach Master &amp; Complete</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onUpdateWorkStatus(w.id, 'In Progress')}
                        className="bg-white/10 hover:bg-white/15 text-slate-300 font-semibold px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors"
                      >
                        Reopen Editing
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* 4. CUSTOMERS (VIEW REGISTERED CLIENTS & PROFILES)             */}
        {/* ============================================================== */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            <div className="bg-[#141824] border border-white/10 rounded-2xl p-5">
              <h3 className="text-base font-bold text-white mb-1">Registered Customer Profiles ({customerAccounts.length})</h3>
              <p className="text-slate-400 text-xs mb-4">
                Directory of customers registered on SnepStudio with contact information and booking history.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {customerAccounts.map(cust => {
                  const customerBookings = bookings.filter(b => b.user_id === cust.id || b.customer_name.toLowerCase() === cust.name.toLowerCase());
                  return (
                    <div key={cust.id} className="p-4 bg-[#1a2030] border border-white/5 rounded-xl space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-white text-sm">{cust.name}</h4>
                          <div className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-amber-400" />
                            <span>{cust.email}</span>
                          </div>
                        </div>
                        <span className="bg-amber-400/10 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {customerBookings.length} Bookings
                        </span>
                      </div>

                      <div className="text-xs text-slate-300 space-y-0.5 pt-1 border-t border-white/5">
                        <div className="flex items-center gap-1 text-slate-400">
                          <Phone className="w-3 h-3 text-amber-400" />
                          <span>{cust.phone}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                          <MapPin className="w-3 h-3 text-amber-400" />
                          <span>{cust.address}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 pt-1">
                          Registered: {cust.created_at}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {customerAccounts.length === 0 && (
                  <div className="col-span-2 p-8 text-center text-slate-400">
                    No customer accounts registered yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 5. EMPLOYEES (VIEW STAFF, ENROLL NEW EMPLOYEE)                */}
        {/* ============================================================== */}
        {activeTab === 'employees' && (
          <div className="space-y-4">
            
            {/* Add Employee Form */}
            <div className="p-5 rounded-2xl bg-[#141824] border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-white">Enroll New Studio Employee / Crew Member</h4>
                </div>
                {empSaveSuccess && (
                  <span className="text-emerald-400 text-xs font-bold animate-pulse">✓ Staff member enrolled successfully!</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-3">
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
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Role / Designation</label>
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
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Initial Password</label>
                  <input
                    type="text"
                    value={newEmpPassword}
                    onChange={(e) => setNewEmpPassword(e.target.value)}
                    placeholder="employee123"
                    className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  if (!newEmpName || !newEmpEmail) {
                    alert('Please enter employee name and email');
                    return;
                  }
                  if (onAddEmployee) {
                    const nextNum = employees.length + 1;
                    const generatedId = `EMP-${String(nextNum).padStart(4, '0')}`;
                    const tempPass = newEmpPassword.trim() || 'employee123';

                    const newEmp: EmployeeRecord = {
                      id: generatedId,
                      name: newEmpName,
                      email: newEmpEmail,
                      phone: newEmpPhone || '+91 98200 00000',
                      role: newEmpRole,
                      joined_date: new Date().toISOString().split('T')[0],
                      status: 'Active',
                      shoots_completed: 0
                    };
                    onAddEmployee(newEmp, tempPass);
                    setEmpSaveSuccess(true);
                    setNewEmpName('');
                    setNewEmpEmail('');
                    setNewEmpPhone('');
                    setNewEmpPassword('employee123');
                    setTimeout(() => setEmpSaveSuccess(false), 3000);
                  }
                }}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2 rounded-xl uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create Staff Account &amp; Generate ID</span>
              </button>
            </div>

            {/* Existing Employees List */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase text-slate-400 text-xs">
                Active Studio Staff Directory ({employees.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {employees.map((emp) => (
                  <div
                    key={emp.id}
                    className="p-4 rounded-xl bg-[#141824] border border-white/10 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white text-sm">{emp.name}</span>
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                          {emp.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          emp.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {emp.status}
                        </span>
                      </div>
                      <div className="text-slate-400 text-xs">
                        <span className="text-white font-medium">{emp.role}</span> &bull; {emp.email} &bull; {emp.phone}
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

          </div>
        )}

        {/* ============================================================== */}
        {/* 6. MANAGE SERVICES (VIEW, EDIT PRICE, ADD NEW SERVICE)         */}
        {/* ============================================================== */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            
            {/* Add Service Card */}
            <div className="p-5 rounded-2xl bg-[#141824] border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-white">Add New Studio Package / Service</h4>
                </div>
                {serviceSuccess && (
                  <span className="text-emerald-400 text-xs font-bold animate-pulse">✓ New service added!</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Service Name</label>
                  <input
                    type="text"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    placeholder="e.g. Drone Cinematography"
                    className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Starting Price (₹)</label>
                  <input
                    type="number"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(Number(e.target.value))}
                    className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={newServiceTagline}
                    onChange={(e) => setNewServiceTagline(e.target.value)}
                    placeholder="e.g. 5.1K Aerial 4K Filming"
                    className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Turnaround Time</label>
                  <input
                    type="text"
                    value={newServiceTurnaround}
                    onChange={(e) => setNewServiceTurnaround(e.target.value)}
                    placeholder="e.g. 48 hours"
                    className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  if (!newServiceName) {
                    alert('Please enter service name');
                    return;
                  }
                  if (onAddService) {
                    const newSvc: StudioService = {
                      id: `svc-${Date.now()}`,
                      name: newServiceName,
                      tagline: newServiceTagline || 'Professional studio session',
                      price: `Starting from ₹${newServicePrice.toLocaleString()}`,
                      numericPrice: newServicePrice,
                      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
                      description: 'High-end specialized photoshoot service with master editing and color grading.',
                      features: ['Professional studio equipment', 'Rapid post-production turnaround', 'High-res master files included'],
                      deliverables: 'Master digital files in Ultra HD',
                      turnaround: newServiceTurnaround
                    };
                    onAddService(newSvc);
                    setServiceSuccess(true);
                    setNewServiceName('');
                    setNewServiceTagline('');
                    setTimeout(() => setServiceSuccess(false), 3000);
                  }
                }}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2 rounded-xl uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Save Service to Studio Catalog</span>
              </button>
            </div>

            {/* List of Services */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map(svc => (
                <div key={svc.id} className="bg-[#141824] border border-white/10 rounded-2xl p-5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white">{svc.name}</h4>
                    <p className="text-xs text-amber-400 font-medium">{svc.tagline}</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">{svc.description}</p>
                    <div className="text-[11px] text-slate-500 pt-1">
                      Turnaround: <strong>{svc.turnaround}</strong> &bull; Deliverables: {svc.deliverables}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-black text-white font-mono block">
                      ₹{svc.numericPrice.toLocaleString()}
                    </span>
                    <button
                      onClick={() => {
                        const newPriceStr = prompt(`Enter new price in ₹ for ${svc.name}:`, String(svc.numericPrice));
                        if (newPriceStr && !isNaN(Number(newPriceStr)) && onUpdateServicePrice) {
                          onUpdateServicePrice(svc.id, Number(newPriceStr));
                        }
                      }}
                      className="mt-2 text-amber-400 hover:underline text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Price</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* 7. PAYMENTS & INVOICES (VIEW ALL BILLING TRANSACTIONS)          */}
        {/* ============================================================== */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="bg-[#141824] border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Payment Records &amp; Tax Invoices</h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Real-time payment audit log with 18% GST calculation and official tax invoices.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Total Collections</span>
                  <span className="text-lg font-black text-amber-400 font-mono">
                    ₹{totalRevenue.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                {bookings.map(b => (
                  <div key={b.id} className="p-3.5 bg-[#1a2030] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">Payment #{b.payment_id}</span>
                        <span className="text-slate-400">&bull; {b.customer_name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.payment_status === 'Paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {b.payment_status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        For: <strong>{b.service}</strong> &bull; Method: {b.payment_method || 'Online/UPI'} &bull; Date: {b.appointment_date}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-mono font-bold text-white text-base">
                        ₹{b.amount.toLocaleString()}
                      </span>
                      {onViewInvoice && (
                        <button
                          onClick={() => onViewInvoice(b)}
                          className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer flex items-center gap-1 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Invoice</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 8. SHOP DETAILS & ADDRESS PROFILE                             */}
        {/* ============================================================== */}
        {activeTab === 'shop' && (
          <div className="space-y-4">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Studio / Shop Legal Name</label>
                    <input
                      type="text"
                      value={editedShop.shop_name}
                      onChange={(e) => setEditedShop({ ...editedShop, shop_name: e.target.value })}
                      className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Proprietor / Owner Name</label>
                    <input
                      type="text"
                      value={editedShop.owner_name}
                      onChange={(e) => setEditedShop({ ...editedShop, owner_name: e.target.value })}
                      className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Primary Email</label>
                    <input
                      type="email"
                      value={editedShop.email}
                      onChange={(e) => setEditedShop({ ...editedShop, email: e.target.value })}
                      className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Primary Phone</label>
                    <input
                      type="text"
                      value={editedShop.phone_primary}
                      onChange={(e) => setEditedShop({ ...editedShop, phone_primary: e.target.value })}
                      className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 font-semibold mb-1">Physical Street Address</label>
                    <input
                      type="text"
                      value={editedShop.street_address}
                      onChange={(e) => setEditedShop({ ...editedShop, street_address: e.target.value })}
                      className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">City &amp; PIN</label>
                    <input
                      type="text"
                      value={`${editedShop.city}, ${editedShop.pincode}`}
                      onChange={(e) => {
                        const [c, p] = e.target.value.split(',');
                        setEditedShop({ ...editedShop, city: c?.trim() || '', pincode: p?.trim() || '' });
                      }}
                      className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Shop GSTIN</label>
                    <input
                      type="text"
                      value={editedShop.gst_tin}
                      onChange={(e) => setEditedShop({ ...editedShop, gst_tin: e.target.value })}
                      className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">UPI ID for Invoices</label>
                    <input
                      type="text"
                      value={editedShop.upi_id}
                      onChange={(e) => setEditedShop({ ...editedShop, upi_id: e.target.value })}
                      className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-6 py-2.5 rounded-xl uppercase tracking-wider cursor-pointer shadow-md"
                >
                  Save Studio Profile
                </button>
              </form>
            </div>
          </div>
        )}

      </div>

    </div>
  );

  if (isFullPage) {
    return (
      <div className="min-h-screen bg-[#0b0d13] text-slate-100 p-4 sm:p-8 max-w-7xl mx-auto w-full">
        {content}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#12151e] border border-white/15 rounded-3xl max-w-6xl w-full p-6 sm:p-8 shadow-2xl relative my-8 max-h-[92vh] flex flex-col">
        {content}
      </div>
    </div>
  );
};
