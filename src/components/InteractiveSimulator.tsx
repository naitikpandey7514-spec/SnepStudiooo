import React, { useState } from 'react';
import {
  Camera, Calendar, Upload, CheckCircle2, Clock, FileText,
  CreditCard, Shield, User, LogOut, ArrowRight, Download, Search, Check, AlertTriangle, Eye, Printer
} from 'lucide-react';
import { UserRecord, AppointmentRecord, WorkRecord, PaymentRecord } from '../types';

export const InteractiveSimulator: React.FC = () => {
  // State simulation
  const [activeRole, setActiveRole] = useState<'customer' | 'admin'>('customer');
  const [customerTab, setCustomerTab] = useState<'home' | 'book' | 'dashboard' | 'appointments' | 'upload' | 'work' | 'invoice'>('home');
  const [adminTab, setAdminTab] = useState<'dashboard' | 'appointments' | 'work' | 'users' | 'payments'>('dashboard');

  // Active user session
  const [currentUser] = useState<UserRecord>({
    id: 1,
    name: "Rohan Sharma",
    email: "rohan.sharma@example.com",
    phone: "+91 98765 43210",
    address: "Flat 402, Green Valley Apartments, Pune, Maharashtra",
    created_at: "2026-03-15 10:30 AM"
  });

  // Sample Appointments
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([
    {
      id: 101,
      user_id: 1,
      customer_name: "Rohan Sharma",
      phone: "+91 98765 43210",
      address: "Studio 1, Main Street, Pune",
      service: "Photography",
      appointment_date: "2026-04-10",
      appointment_time: "14:00",
      message: "Need 20 high-res portrait headshots with dark background",
      status: "Approved",
      payment_status: "Paid",
      payment_id: 201,
      amount: 999.00,
      payment_method: "UPI"
    },
    {
      id: 102,
      user_id: 1,
      customer_name: "Rohan Sharma",
      phone: "+91 98765 43210",
      address: "Lakeside Resort, Lonavala",
      service: "Pre-Wedding Shoot",
      appointment_date: "2026-04-25",
      appointment_time: "09:00",
      message: "Outdoor morning golden hour lighting requested",
      status: "Pending",
      payment_status: "Pending",
      payment_id: 202,
      amount: 4999.00
    }
  ]);

  // Sample Work items
  const [workItems, setWorkItems] = useState<WorkRecord[]>([
    {
      id: 501,
      user_id: 1,
      customer_name: "Rohan Sharma",
      appointment_id: 101,
      service: "Photo Editing",
      original_filename: "raw_portrait_session_01.jpg",
      file_type: "Photo",
      description: "Please color grade with warm cinematic tones and remove skin blemishes",
      status: "In Progress",
      created_at: "2026-04-11"
    },
    {
      id: 502,
      user_id: 1,
      customer_name: "Rohan Sharma",
      appointment_id: null,
      service: "Video Editing",
      original_filename: "vacation_reels_clip.mp4",
      file_type: "Video",
      description: "60-second Instagram reel with dynamic beat sync transitions",
      status: "Completed",
      completed_filename: "vacation_reels_master_edited.mp4",
      created_at: "2026-04-05"
    }
  ]);

  // Sample Payments
  const [payments, setPayments] = useState<PaymentRecord[]>([
    {
      id: 201,
      user_id: 1,
      customer_name: "Rohan Sharma",
      customer_email: "rohan.sharma@example.com",
      appointment_id: 101,
      service: "Photography",
      amount: 999.00,
      payment_method: "UPI",
      payment_status: "Paid",
      payment_date: "2026-03-20 15:45"
    },
    {
      id: 202,
      user_id: 1,
      customer_name: "Rohan Sharma",
      customer_email: "rohan.sharma@example.com",
      appointment_id: 102,
      service: "Pre-Wedding Shoot",
      amount: 4999.00,
      payment_method: "Online",
      payment_status: "Pending"
    }
  ]);

  // Form states for booking
  const [bookingService, setBookingService] = useState("Photography");
  const [bookingDate, setBookingDate] = useState("2026-05-01");
  const [bookingTime, setBookingTime] = useState("10:00");
  const [bookingAddress, setBookingAddress] = useState(currentUser.address);
  const [bookingNotes, setBookingNotes] = useState("");

  // Upload Form states
  const [uploadType, setUploadType] = useState<'Photo' | 'Video'>('Photo');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadFileSelected, setUploadFileSelected] = useState<string | null>(null);

  // Selected Invoice to view
  const [activeInvoice, setActiveInvoice] = useState<PaymentRecord | null>(payments[0]);

  // Admin Search & Filter
  const [adminApptSearch, setAdminApptSearch] = useState("");
  const [adminApptFilter, setAdminApptFilter] = useState("All");

  // Notifications
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setBannerNotice(msg);
    setTimeout(() => setBannerNotice(null), 3500);
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const servicePrices: Record<string, number> = {
      "Photography": 999.00,
      "Wedding Shoot": 9999.00,
      "Pre-Wedding Shoot": 4999.00,
      "Photo Editing": 99.00,
      "Video Editing": 499.00
    };

    const newApptId = appointments.length + 101;
    const newPayId = payments.length + 201;
    const cost = servicePrices[bookingService] || 999.00;

    const newAppt: AppointmentRecord = {
      id: newApptId,
      user_id: currentUser.id,
      customer_name: currentUser.name,
      phone: currentUser.phone,
      address: bookingAddress,
      service: bookingService,
      appointment_date: bookingDate,
      appointment_time: bookingTime,
      message: bookingNotes,
      status: "Pending",
      payment_status: "Pending",
      payment_id: newPayId,
      amount: cost
    };

    const newPay: PaymentRecord = {
      id: newPayId,
      user_id: currentUser.id,
      customer_name: currentUser.name,
      customer_email: currentUser.email,
      appointment_id: newApptId,
      service: bookingService,
      amount: cost,
      payment_method: "Online",
      payment_status: "Pending"
    };

    setAppointments([newAppt, ...appointments]);
    setPayments([newPay, ...payments]);
    showNotification(`Appointment #${newApptId} booked successfully! Status is now Pending.`);
    setCustomerTab('appointments');
  };

  const handleUploadWork = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = workItems.length + 501;
    const filename = uploadFileSelected || (uploadType === 'Photo' ? 'my_raw_shoot.jpg' : 'my_raw_footage.mp4');

    const newItem: WorkRecord = {
      id: newId,
      user_id: currentUser.id,
      customer_name: currentUser.name,
      appointment_id: appointments[0]?.id || null,
      service: uploadType === 'Photo' ? 'Photo Editing' : 'Video Editing',
      original_filename: filename,
      file_type: uploadType,
      description: uploadDesc || "Standard retouch and grading",
      status: "Pending",
      created_at: new Date().toISOString().split('T')[0]
    };

    setWorkItems([newItem, ...workItems]);
    setUploadFileSelected(null);
    setUploadDesc('');
    showNotification(`Media file "${filename}" uploaded for editing queue!`);
    setCustomerTab('work');
  };

  const handlePay = (payId: number) => {
    setPayments(payments.map(p => p.id === payId ? { ...p, payment_status: 'Paid', payment_date: new Date().toLocaleString() } : p));
    setAppointments(appointments.map(a => a.payment_id === payId ? { ...a, payment_status: 'Paid' } : a));
    const paidRecord = payments.find(p => p.id === payId);
    if (paidRecord) {
      setActiveInvoice({ ...paidRecord, payment_status: 'Paid' });
    }
    showNotification("Payment verified! Tax Invoice is generated.");
    setCustomerTab('invoice');
  };

  // Admin Actions
  const updateAppointmentStatus = (id: number, status: AppointmentRecord['status']) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
    showNotification(`Appointment #${id} updated to "${status}".`);
  };

  const updateWorkStatus = (id: number, status: WorkRecord['status']) => {
    setWorkItems(workItems.map(w => w.id === id ? {
      ...w,
      status,
      completed_filename: status === 'Completed' ? `retouched_master_${w.original_filename}` : w.completed_filename
    } : w));
    showNotification(`Work #${id} marked as "${status}".`);
  };

  // Stats calculation
  const stats = {
    totalAppointments: appointments.length,
    pendingAppointments: appointments.filter(a => a.status === 'Pending').length,
    approvedAppointments: appointments.filter(a => a.status === 'Approved').length,
    completedWork: workItems.filter(w => w.status === 'Completed').length,
    pendingPayments: payments.filter(p => p.payment_status === 'Pending').length,
    totalRevenue: payments.filter(p => p.payment_status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0)
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Role Switcher Toolbar */}
      <div className="bg-[#181b22] border border-[#2e3545] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-yellow-400 flex items-center justify-center font-bold text-yellow-400">
            SS
          </div>
          <div>
            <div className="text-white font-bold flex items-center gap-2 text-sm">
              SnepStudio Live Simulator
              <span className="bg-yellow-500/20 text-yellow-400 text-[10px] px-2 py-0.5 rounded font-mono">
                PostgreSQL + Flask Active
              </span>
            </div>
            <div className="text-xs text-slate-400">Experience the live portal directly inside your browser</div>
          </div>
        </div>

        {/* Toggle between Customer Portal & Admin Panel */}
        <div className="flex items-center bg-[#12141a] p-1 rounded-lg border border-[#2e3545]">
          <button
            onClick={() => setActiveRole('customer')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeRole === 'customer'
                ? 'bg-yellow-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Customer Portal
          </button>
          <button
            onClick={() => setActiveRole('admin')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeRole === 'admin'
                ? 'bg-yellow-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Studio Admin Panel
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {bannerNotice && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-lg text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{bannerNotice}</span>
          </div>
          <button onClick={() => setBannerNotice(null)} className="text-emerald-400 font-bold">&times;</button>
        </div>
      )}

      {/* ================================================================ */}
      {/* 1. CUSTOMER PORTAL VIEW                                          */}
      {/* ================================================================ */}
      {activeRole === 'customer' && (
        <div className="flex flex-col gap-6">
          {/* Customer Sub-nav */}
          <div className="bg-[#14171e] border border-[#2e3545] rounded-xl px-4 py-2 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1 flex-wrap">
              {[
                { id: 'home', label: 'Studio Homepage' },
                { id: 'book', label: 'Book Appointment' },
                { id: 'dashboard', label: 'Dashboard' },
                { id: 'appointments', label: `My Appointments (${appointments.length})` },
                { id: 'upload', label: 'Upload Work' },
                { id: 'work', label: `My Work (${workItems.length})` },
                { id: 'invoice', label: 'Printable Invoice' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCustomerTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    customerTab === tab.id
                      ? 'bg-yellow-500/20 text-yellow-400 font-bold border border-yellow-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Logged in: <strong>{currentUser.name}</strong></span>
            </div>
          </div>

          {/* Customer Content Panels */}
          {customerTab === 'home' && (
            <div className="flex flex-col gap-6">
              {/* Hero */}
              <div className="bg-gradient-to-b from-[#1c212c] to-[#12141a] border border-[#2e3545] rounded-2xl p-8 text-center flex flex-col items-center">
                <span className="text-yellow-400 text-xs font-bold uppercase tracking-widest mb-3">
                  Studio &middot; Production &middot; Post-Processing
                </span>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                  Capture Your Moments
                </h1>
                <p className="text-slate-400 text-sm md:text-base max-w-xl mb-6">
                  Professional Photography, Photoshoots &amp; Editing Services. Transparent fixed rates, rapid scheduling, and high-resolution master deliverables.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setCustomerTab('book')}
                    className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold px-6 py-2.5 rounded-lg text-xs transition-all cursor-pointer shadow-lg shadow-yellow-500/10"
                  >
                    Book Your Appointment
                  </button>
                  <button
                    onClick={() => setCustomerTab('upload')}
                    className="bg-transparent hover:bg-white/5 text-white border border-[#2e3545] font-semibold px-6 py-2.5 rounded-lg text-xs transition-all cursor-pointer"
                  >
                    Upload Media for Editing
                  </button>
                </div>
              </div>

              {/* Service Catalog */}
              <div className="flex flex-col gap-4">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-white">Services &amp; Pricing Catalog</h2>
                  <p className="text-xs text-slate-400">Direct bookings, no hidden subscription costs</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    { name: 'Photography', price: '₹999', desc: 'Personal & portrait session' },
                    { name: 'Wedding Shoot', price: '₹9,999', desc: 'Full ceremony & videography' },
                    { name: 'Pre-Wedding Shoot', price: '₹4,999', desc: 'Creative outdoor destination' },
                    { name: 'Photo Editing', price: '₹99 / photo', desc: 'Color grade & retouching' },
                    { name: 'Video Editing', price: '₹499 / video', desc: 'Reels, cinematic cut & audio sync' },
                  ].map((srv, i) => (
                    <div key={i} className="bg-[#181b22] border border-[#2e3545] rounded-xl p-5 flex flex-col justify-between hover:border-yellow-500/50 transition-all">
                      <div>
                        <div className="w-9 h-9 rounded-lg bg-yellow-500/15 text-yellow-400 flex items-center justify-center font-bold mb-3 text-xs">
                          {i + 1}
                        </div>
                        <h3 className="font-bold text-white text-sm mb-1">{srv.name}</h3>
                        <p className="text-slate-400 text-xs mb-4">{srv.desc}</p>
                      </div>
                      <div className="border-t border-[#2e3545] pt-3">
                        <div className="text-yellow-400 font-extrabold text-lg mb-2">{srv.price}</div>
                        <button
                          onClick={() => {
                            setBookingService(srv.name.includes('Editing') ? srv.name : srv.name);
                            setCustomerTab('book');
                          }}
                          className="w-full bg-[#222735] hover:bg-yellow-500 hover:text-slate-950 text-white text-xs font-semibold py-1.5 rounded transition-all cursor-pointer"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Book Appointment View */}
          {customerTab === 'book' && (
            <div className="max-w-xl mx-auto w-full bg-[#181b22] border border-[#2e3545] rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-1">Book Studio or On-Location Appointment</h2>
              <p className="text-xs text-slate-400 mb-6">Select your requested visual service and schedule your date &amp; time</p>

              <form onSubmit={handleBookAppointment} className="flex flex-col gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Service Type</label>
                  <select
                    value={bookingService}
                    onChange={e => setBookingService(e.target.value)}
                    className="w-full bg-[#12141a] border border-[#2e3545] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500"
                  >
                    <option value="Photography">Photography (₹999)</option>
                    <option value="Wedding Shoot">Wedding Shoot (₹9,999)</option>
                    <option value="Pre-Wedding Shoot">Pre-Wedding Shoot (₹4,999)</option>
                    <option value="Photo Editing">Photo Editing (₹99)</option>
                    <option value="Video Editing">Video Editing (₹499)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Date</label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={e => setBookingDate(e.target.value)}
                      required
                      className="w-full bg-[#12141a] border border-[#2e3545] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Time Slot</label>
                    <input
                      type="time"
                      value={bookingTime}
                      onChange={e => setBookingTime(e.target.value)}
                      required
                      className="w-full bg-[#12141a] border border-[#2e3545] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Customer Name</label>
                  <input
                    type="text"
                    defaultValue={currentUser.name}
                    required
                    className="w-full bg-[#12141a] border border-[#2e3545] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    defaultValue={currentUser.phone}
                    required
                    className="w-full bg-[#12141a] border border-[#2e3545] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Shoot Venue / Address</label>
                  <textarea
                    value={bookingAddress}
                    onChange={e => setBookingAddress(e.target.value)}
                    rows={2}
                    required
                    className="w-full bg-[#12141a] border border-[#2e3545] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Creative Requirements &amp; Notes</label>
                  <textarea
                    value={bookingNotes}
                    onChange={e => setBookingNotes(e.target.value)}
                    placeholder="Specific backgrounds, props, or references..."
                    rows={3}
                    className="w-full bg-[#12141a] border border-[#2e3545] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold py-2.5 rounded-lg transition-all cursor-pointer"
                >
                  Confirm &amp; Create Appointment
                </button>
              </form>
            </div>
          )}

          {/* Customer Dashboard View */}
          {customerTab === 'dashboard' && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-[#181b22] border border-[#2e3545] p-4 rounded-xl">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Total Bookings</div>
                  <div className="text-2xl font-bold text-white mt-1">{appointments.length}</div>
                </div>
                <div className="bg-[#181b22] border border-[#2e3545] p-4 rounded-xl">
                  <div className="text-[11px] text-amber-400 uppercase font-semibold">Pending Review</div>
                  <div className="text-2xl font-bold text-amber-300 mt-1">{stats.pendingAppointments}</div>
                </div>
                <div className="bg-[#181b22] border border-[#2e3545] p-4 rounded-xl">
                  <div className="text-[11px] text-sky-400 uppercase font-semibold">Approved</div>
                  <div className="text-2xl font-bold text-sky-300 mt-1">{stats.approvedAppointments}</div>
                </div>
                <div className="bg-[#181b22] border border-[#2e3545] p-4 rounded-xl">
                  <div className="text-[11px] text-emerald-400 uppercase font-semibold">Completed Work</div>
                  <div className="text-2xl font-bold text-emerald-300 mt-1">{stats.completedWork}</div>
                </div>
                <div className="bg-[#181b22] border border-[#2e3545] p-4 rounded-xl">
                  <div className="text-[11px] text-yellow-400 uppercase font-semibold">Pending Payments</div>
                  <div className="text-2xl font-bold text-yellow-300 mt-1">{stats.pendingPayments}</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => setCustomerTab('book')}
                  className="bg-yellow-500 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs cursor-pointer hover:bg-yellow-400"
                >
                  + Book Appointment
                </button>
                <button
                  onClick={() => setCustomerTab('upload')}
                  className="bg-[#222735] text-white font-semibold px-4 py-2 rounded-lg text-xs cursor-pointer hover:bg-[#2b3142]"
                >
                  + Upload Media for Retouching
                </button>
              </div>

              {/* Appointments quick list */}
              <div className="bg-[#181b22] border border-[#2e3545] rounded-xl p-5">
                <h3 className="text-sm font-bold text-white mb-3">Recent Bookings</h3>
                <div className="divide-y divide-[#222735] text-xs">
                  {appointments.slice(0, 3).map(a => (
                    <div key={a.id} className="py-3 flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <div className="font-semibold text-white">#{a.id} - {a.service}</div>
                        <div className="text-slate-400 text-[11px]">{a.appointment_date} at {a.appointment_time}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          a.status === 'Approved' ? 'bg-sky-500/20 text-sky-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {a.status}
                        </span>
                        {a.payment_status === 'Paid' ? (
                          <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">Paid</span>
                        ) : (
                          <button
                            onClick={() => handlePay(a.payment_id)}
                            className="bg-yellow-500 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] cursor-pointer"
                          >
                            Pay ₹{a.amount}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* My Appointments View */}
          {customerTab === 'appointments' && (
            <div className="bg-[#181b22] border border-[#2e3545] rounded-xl p-6">
              <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <div>
                  <h2 className="text-base font-bold text-white">My Appointments List</h2>
                  <p className="text-xs text-slate-400">Track shoot status, payments, and view generated tax invoices</p>
                </div>
                <button
                  onClick={() => setCustomerTab('book')}
                  className="bg-yellow-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                >
                  + Book New
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#2e3545] text-slate-400 uppercase text-[11px]">
                      <th className="py-3 px-3">ID</th>
                      <th className="py-3 px-3">Service</th>
                      <th className="py-3 px-3">Date &amp; Slot</th>
                      <th className="py-3 px-3">Venue</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Payment</th>
                      <th className="py-3 px-3">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222735]">
                    {appointments.map(a => (
                      <tr key={a.id} className="hover:bg-white/5">
                        <td className="py-3 px-3 font-mono font-bold text-white">#{a.id}</td>
                        <td className="py-3 px-3 font-semibold text-slate-200">{a.service}</td>
                        <td className="py-3 px-3 text-slate-300">{a.appointment_date} <span className="text-slate-500">({a.appointment_time})</span></td>
                        <td className="py-3 px-3 text-slate-400 max-w-[180px] truncate">{a.address}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            a.status === 'Approved' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                            a.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                            'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {a.payment_status === 'Paid' ? (
                            <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">
                              Paid (₹{a.amount})
                            </span>
                          ) : (
                            <button
                              onClick={() => handlePay(a.payment_id)}
                              className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold px-2.5 py-1 rounded text-[10px] transition-all cursor-pointer"
                            >
                              Pay ₹{a.amount}
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => {
                              const p = payments.find(pay => pay.id === a.payment_id);
                              if (p) setActiveInvoice(p);
                              setCustomerTab('invoice');
                            }}
                            className="text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Upload Work View */}
          {customerTab === 'upload' && (
            <div className="max-w-xl mx-auto w-full bg-[#181b22] border border-[#2e3545] rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-1">Upload Media for Editing Queue</h2>
              <p className="text-xs text-slate-400 mb-6">
                Submit raw images (JPG, PNG, WEBP) or footage (MP4, MOV). Max size: 50MB.
              </p>

              <form onSubmit={handleUploadWork} className="flex flex-col gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">File Type</label>
                  <select
                    value={uploadType}
                    onChange={e => setUploadType(e.target.value as any)}
                    className="w-full bg-[#12141a] border border-[#2e3545] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500"
                  >
                    <option value="Photo">Raw Photograph (JPG, PNG, WEBP)</option>
                    <option value="Video">Raw Video Footage (MP4, MOV)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Select File</label>
                  <div className="border-2 border-dashed border-[#2e3545] hover:border-yellow-500 rounded-lg p-6 text-center cursor-pointer transition-all bg-[#12141a]">
                    <Upload className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <div className="text-slate-300 font-semibold">
                      {uploadFileSelected ? uploadFileSelected : "Click to select or drag & drop sample file"}
                    </div>
                    <div className="text-slate-500 text-[11px] mt-1">Simulated secure file storage in /uploads/{uploadType.toLowerCase()}s/</div>
                    <input
                      type="file"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setUploadFileSelected(e.target.files[0].name);
                        }
                      }}
                      className="hidden"
                      id="simFile"
                    />
                    <label
                      htmlFor="simFile"
                      className="mt-3 inline-block bg-[#222735] hover:bg-white/10 text-white px-3 py-1 rounded text-[11px] cursor-pointer"
                    >
                      Browse Files
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Editing Instructions</label>
                  <textarea
                    value={uploadDesc}
                    onChange={e => setUploadDesc(e.target.value)}
                    placeholder="Specific color palette, skin retouching, background removal, or aspect ratio..."
                    rows={3}
                    className="w-full bg-[#12141a] border border-[#2e3545] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold py-2.5 rounded-lg transition-all cursor-pointer"
                >
                  Upload to Studio Queue
                </button>
              </form>
            </div>
          )}

          {/* My Work View */}
          {customerTab === 'work' && (
            <div className="bg-[#181b22] border border-[#2e3545] rounded-xl p-6">
              <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <div>
                  <h2 className="text-base font-bold text-white">My Editing Projects &amp; Downloads</h2>
                  <p className="text-xs text-slate-400">Download finalized retouched photos and mastered video edits</p>
                </div>
                <button
                  onClick={() => setCustomerTab('upload')}
                  className="bg-yellow-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                >
                  + Upload More Media
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#2e3545] text-slate-400 uppercase text-[11px]">
                      <th className="py-3 px-3">Work ID</th>
                      <th className="py-3 px-3">Service</th>
                      <th className="py-3 px-3">Raw Uploaded File</th>
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Final Master Deliverable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222735]">
                    {workItems.map(w => (
                      <tr key={w.id} className="hover:bg-white/5">
                        <td className="py-3 px-3 font-mono font-bold text-white">#{w.id}</td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-200">{w.service}</span>
                          {w.description && <div className="text-[11px] text-slate-400 truncate max-w-xs">{w.description}</div>}
                        </td>
                        <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">{w.original_filename}</td>
                        <td className="py-3 px-3 text-yellow-400">{w.file_type}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            w.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                            w.status === 'In Progress' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                            'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {w.status}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {w.status === 'Completed' && w.completed_filename ? (
                            <div className="inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded text-[11px] font-semibold">
                              <Download className="w-3 h-3" />
                              <span>{w.completed_filename}</span>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Editor working on master...</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Printable Invoice View */}
          {customerTab === 'invoice' && activeInvoice && (
            <div className="max-w-2xl mx-auto w-full flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setCustomerTab('appointments')}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  &larr; Back to Appointments
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-yellow-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Tax Invoice
                </button>
              </div>

              {/* Printable White Sheet */}
              <div className="bg-white text-slate-900 rounded-xl p-8 shadow-2xl border border-slate-200 text-xs">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-950 tracking-tight">SnepStudio</h2>
                    <p className="text-slate-600 font-medium">Photography &amp; Editing Services</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Email: support@snepstudio.com | Phone: +91 XXXXX XXXXX<br />
                      Studio Campus, India
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">TAX INVOICE</span>
                    <div className="text-sm font-bold text-slate-950 mt-1">INV-{String(activeInvoice.id).padStart(5, '0')}</div>
                    <div className="text-slate-600 mt-1">Date: {activeInvoice.payment_date || 'Pending'}</div>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-2 ${
                      activeInvoice.payment_status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {activeInvoice.payment_status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Billed info */}
                <div className="grid grid-cols-2 gap-6 mb-6 text-slate-700">
                  <div>
                    <div className="font-bold text-slate-900 uppercase text-[10px] mb-1">Customer Details:</div>
                    <div className="font-semibold text-slate-950">{currentUser.name}</div>
                    <div>Email: {currentUser.email}</div>
                    <div>Phone: {currentUser.phone}</div>
                    <div className="text-[11px] text-slate-600 mt-1">{currentUser.address}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 uppercase text-[10px] mb-1">Payment Information:</div>
                    <div>Payment ID: #{activeInvoice.id}</div>
                    <div>Method: {activeInvoice.payment_method}</div>
                    <div>Appointment Ref: #{activeInvoice.appointment_id}</div>
                  </div>
                </div>

                {/* Table */}
                <table className="w-full text-left border-collapse mb-6">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 uppercase text-[10px] border-b border-slate-200">
                      <th className="py-2.5 px-3">Service Description</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Rate (INR)</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-950">{activeInvoice.service}</div>
                        <div className="text-[11px] text-slate-500">SnepStudio Professional Visual Shoot &amp; Post-Production</div>
                      </td>
                      <td className="py-3 px-3 text-center">1</td>
                      <td className="py-3 px-3 text-right font-mono">₹{activeInvoice.amount.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-950">₹{activeInvoice.amount.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Total */}
                <div className="border-t-2 border-slate-900 pt-4 flex justify-between items-center mb-6">
                  <span className="font-bold text-slate-900 text-sm">Grand Total (INR):</span>
                  <span className="text-xl font-black text-slate-950 font-mono">₹{activeInvoice.amount.toFixed(2)}</span>
                </div>

                <div className="text-center text-[10px] text-slate-400 border-t border-slate-200 pt-4">
                  Thank you for trusting SnepStudio! This is a valid system invoice generated for college project evaluation.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* 2. STUDIO ADMIN PANEL VIEW                                       */}
      {/* ================================================================ */}
      {activeRole === 'admin' && (
        <div className="flex flex-col gap-6">
          {/* Admin Header */}
          <div className="bg-[#14171e] border border-[#2e3545] rounded-xl px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1 flex-wrap">
              {[
                { id: 'dashboard', label: 'Admin Dashboard' },
                { id: 'appointments', label: `Appointments (${appointments.length})` },
                { id: 'work', label: `Work Queue (${workItems.length})` },
                { id: 'users', label: 'Registered Clients' },
                { id: 'payments', label: `Payments (${payments.length})` },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    adminTab === tab.id
                      ? 'bg-yellow-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-400">
              Admin Authenticated: <span className="text-yellow-400 font-bold">admin / admin123</span>
            </div>
          </div>

          {/* Admin Dashboard */}
          {adminTab === 'dashboard' && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#181b22] border border-[#2e3545] p-5 rounded-xl">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Total Registered Users</div>
                  <div className="text-3xl font-extrabold text-white mt-1">1</div>
                </div>
                <div className="bg-[#181b22] border border-[#2e3545] p-5 rounded-xl">
                  <div className="text-[11px] text-yellow-400 uppercase font-semibold">Pending Appointments</div>
                  <div className="text-3xl font-extrabold text-yellow-400 mt-1">{stats.pendingAppointments}</div>
                </div>
                <div className="bg-[#181b22] border border-[#2e3545] p-5 rounded-xl">
                  <div className="text-[11px] text-purple-400 uppercase font-semibold">Editing Queue</div>
                  <div className="text-3xl font-extrabold text-purple-300 mt-1">
                    {workItems.filter(w => w.status !== 'Completed').length}
                  </div>
                </div>
                <div className="bg-[#181b22] border border-[#2e3545] p-5 rounded-xl">
                  <div className="text-[11px] text-emerald-400 uppercase font-semibold">Total Revenue</div>
                  <div className="text-3xl font-extrabold text-emerald-400 mt-1">₹{stats.totalRevenue.toFixed(2)}</div>
                </div>
              </div>

              {/* Quick Actions & Recent Queue */}
              <div className="bg-[#181b22] border border-[#2e3545] rounded-xl p-5">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-white">Pending Action Items</h3>
                  <button
                    onClick={() => setAdminTab('appointments')}
                    className="text-xs text-sky-400 hover:underline cursor-pointer"
                  >
                    View All Appointments &rarr;
                  </button>
                </div>

                <div className="divide-y divide-[#222735] text-xs">
                  {appointments.filter(a => a.status === 'Pending').map(a => (
                    <div key={a.id} className="py-3 flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <div className="font-semibold text-white">#{a.id} - {a.service} ({a.customer_name})</div>
                        <div className="text-slate-400 text-[11px]">Shoot Date: {a.appointment_date} at {a.appointment_time}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateAppointmentStatus(a.id, 'Approved')}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1 rounded text-xs cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateAppointmentStatus(a.id, 'Rejected')}
                          className="bg-red-500 hover:bg-red-400 text-white font-bold px-3 py-1 rounded text-xs cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                  {appointments.filter(a => a.status === 'Pending').length === 0 && (
                    <div className="py-4 text-center text-slate-500 text-xs">No pending appointments right now.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Admin Appointments Manager */}
          {adminTab === 'appointments' && (
            <div className="bg-[#181b22] border border-[#2e3545] rounded-xl p-6">
              <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <div>
                  <h2 className="text-base font-bold text-white">All Client Appointments</h2>
                  <p className="text-xs text-slate-400">Change appointment status and schedule dates</p>
                </div>

                <div className="flex gap-2">
                  <select
                    value={adminApptFilter}
                    onChange={e => setAdminApptFilter(e.target.value)}
                    className="bg-[#12141a] border border-[#2e3545] rounded-lg px-2 py-1 text-xs text-white"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#2e3545] text-slate-400 uppercase text-[11px]">
                      <th className="py-3 px-3">ID</th>
                      <th className="py-3 px-3">Customer</th>
                      <th className="py-3 px-3">Service</th>
                      <th className="py-3 px-3">Date / Slot</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Admin Status Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222735]">
                    {appointments
                      .filter(a => adminApptFilter === 'All' || a.status === adminApptFilter)
                      .map(a => (
                        <tr key={a.id} className="hover:bg-white/5">
                          <td className="py-3 px-3 font-mono font-bold text-white">#{a.id}</td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-200">{a.customer_name}</div>
                            <div className="text-[11px] text-slate-400">{a.phone}</div>
                          </td>
                          <td className="py-3 px-3 text-slate-300">{a.service}</td>
                          <td className="py-3 px-3 text-slate-300">{a.appointment_date} ({a.appointment_time})</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              a.status === 'Approved' ? 'bg-sky-500/20 text-sky-300' :
                              a.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300' :
                              a.status === 'Rejected' ? 'bg-red-500/20 text-red-300' :
                              'bg-amber-500/20 text-amber-300'
                            }`}>
                              {a.status}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <select
                              value={a.status}
                              onChange={e => updateAppointmentStatus(a.id, e.target.value as any)}
                              className="bg-[#12141a] border border-[#2e3545] rounded px-2 py-1 text-[11px] text-white"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Approved">Approved</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                              <option value="Rejected">Rejected</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Admin Work Manager */}
          {adminTab === 'work' && (
            <div className="bg-[#181b22] border border-[#2e3545] rounded-xl p-6">
              <h2 className="text-base font-bold text-white mb-1">Post-Production Editing Pipeline</h2>
              <p className="text-xs text-slate-400 mb-6">Download raw customer media, retouch, and upload completed masters</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#2e3545] text-slate-400 uppercase text-[11px]">
                      <th className="py-3 px-3">Work ID</th>
                      <th className="py-3 px-3">Client</th>
                      <th className="py-3 px-3">Raw File</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Actions &amp; Deliverables</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222735]">
                    {workItems.map(w => (
                      <tr key={w.id} className="hover:bg-white/5">
                        <td className="py-3 px-3 font-mono font-bold text-white">#{w.id}</td>
                        <td className="py-3 px-3 font-semibold text-slate-200">{w.customer_name}</td>
                        <td className="py-3 px-3">
                          <span className="font-mono text-slate-300">{w.original_filename}</span>
                          <span className="ml-2 text-yellow-400 text-[10px] bg-yellow-500/15 px-1.5 py-0.5 rounded">{w.file_type}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            w.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300' :
                            w.status === 'In Progress' ? 'bg-purple-500/20 text-purple-300' :
                            'bg-amber-500/20 text-amber-300'
                          }`}>
                            {w.status}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            {w.status === 'Pending' && (
                              <button
                                onClick={() => updateWorkStatus(w.id, 'In Progress')}
                                className="bg-[#222735] hover:bg-[#2b3142] text-white px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer"
                              >
                                Start Work
                              </button>
                            )}
                            {w.status === 'In Progress' && (
                              <button
                                onClick={() => updateWorkStatus(w.id, 'Completed')}
                                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer"
                              >
                                Upload Master &amp; Complete
                              </button>
                            )}
                            {w.status === 'Completed' && (
                              <span className="text-emerald-400 font-semibold text-[11px]">Master Delivered</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Admin Clients Directory */}
          {adminTab === 'users' && (
            <div className="bg-[#181b22] border border-[#2e3545] rounded-xl p-6">
              <h2 className="text-base font-bold text-white mb-1">Registered Clients Directory</h2>
              <p className="text-xs text-slate-400 mb-6">Client profiles and contact details (passwords securely hidden)</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#2e3545] text-slate-400 uppercase text-[11px]">
                      <th className="py-3 px-3">ID</th>
                      <th className="py-3 px-3">Full Name</th>
                      <th className="py-3 px-3">Email</th>
                      <th className="py-3 px-3">Phone</th>
                      <th className="py-3 px-3">Address</th>
                      <th className="py-3 px-3">Registered On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222735]">
                    <tr className="hover:bg-white/5">
                      <td className="py-3 px-3 font-mono font-bold text-white">#{currentUser.id}</td>
                      <td className="py-3 px-3 font-semibold text-white">{currentUser.name}</td>
                      <td className="py-3 px-3 text-slate-300">{currentUser.email}</td>
                      <td className="py-3 px-3 text-slate-300">{currentUser.phone}</td>
                      <td className="py-3 px-3 text-slate-400 max-w-xs truncate">{currentUser.address}</td>
                      <td className="py-3 px-3 text-slate-500">{currentUser.created_at}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Admin Payments Ledger */}
          {adminTab === 'payments' && (
            <div className="bg-[#181b22] border border-[#2e3545] rounded-xl p-6">
              <h2 className="text-base font-bold text-white mb-1">Financial Transactions &amp; Receipts</h2>
              <p className="text-xs text-slate-400 mb-6">Audit incoming payments, methods, and status</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#2e3545] text-slate-400 uppercase text-[11px]">
                      <th className="py-3 px-3">Payment ID</th>
                      <th className="py-3 px-3">Customer</th>
                      <th className="py-3 px-3">Service</th>
                      <th className="py-3 px-3">Amount</th>
                      <th className="py-3 px-3">Method</th>
                      <th className="py-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222735]">
                    {payments.map(p => (
                      <tr key={p.id} className="hover:bg-white/5">
                        <td className="py-3 px-3 font-mono font-bold text-white">#PAY-{p.id}</td>
                        <td className="py-3 px-3 font-semibold text-slate-200">{p.customer_name}</td>
                        <td className="py-3 px-3 text-slate-300">{p.service}</td>
                        <td className="py-3 px-3 font-bold text-yellow-400">₹{p.amount.toFixed(2)}</td>
                        <td className="py-3 px-3 text-slate-300">{p.payment_method}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.payment_status === 'Paid' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {p.payment_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
