import React from 'react';
import { Calendar, Image as ImageIcon, Upload, Sparkles, User, Download, ArrowRight, Clock, CheckCircle2, CheckSquare, Smartphone } from 'lucide-react';
import { UserRecord, AppointmentRecord, WorkRecord, ShootBatchRecord } from '../types';

interface CustomerDashboardProps {
  currentUser: UserRecord;
  bookings: AppointmentRecord[];
  workItems: WorkRecord[];
  shootBatches?: ShootBatchRecord[];
  onNavigate: (page: string) => void;
  onOpenBookingModal: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  currentUser,
  bookings,
  workItems,
  shootBatches = [],
  onNavigate,
  onOpenBookingModal,
}) => {
  const pendingBookings = bookings.filter(b => b.status === 'Pending' || b.status === 'Approved' || b.status === 'In Progress').length;
  const completedWorks = workItems.filter(w => w.status === 'Completed').length;
  const activeBatchesCount = shootBatches.length;

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#171b27] via-[#131620] to-[#0f121a] border border-white/10 rounded-3xl p-8 sm:p-10 mb-12 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest block mb-1">
              Customer Portal
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-amber-400">{currentUser.name}</span>
            </h1>
            <p className="text-slate-400 text-sm mt-2 max-w-xl leading-relaxed">
              Track your upcoming photoshoot appointments, manage custom photo and video editing requests, and download your finalized master deliverables.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenBookingModal}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              Book Photoshoot
            </button>
            <button
              onClick={() => onNavigate('edit-photos')}
              className="bg-white/10 hover:bg-white/15 text-white border border-white/15 font-semibold px-5 py-3 rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Edit Photo</span>
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Core Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        
        {/* Featured: Photo Selection & Proofing */}
        <div
          onClick={() => onNavigate('photo-selection')}
          className="bg-gradient-to-br from-[#1b2234] via-[#141a29] to-[#12151e] border border-amber-400/50 hover:border-amber-400 p-6 rounded-2xl cursor-pointer transition-all hover:scale-[1.01] hover:shadow-2xl hover:shadow-amber-500/10 group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-105 transition-transform">
              <CheckSquare className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-xs font-bold text-slate-950 font-mono bg-amber-400 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {activeBatchesCount > 0 ? `${activeBatchesCount} Shoot Folder Available` : 'Proofing'}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
            Photo Selection
          </h3>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Review your photoshoot files. Click <strong>✓ Check</strong> to select and <strong>✕ Cross</strong> to reject. Auto-compressed for mobile &amp; laptop with 25GB master RAW fidelity.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-amber-400 gap-1">
            <span>Select Photos Now</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* 1. My Bookings */}
        <div
          onClick={() => onNavigate('my-bookings')}
          className="bg-[#12151e] border border-white/10 hover:border-amber-400/40 p-6 rounded-2xl cursor-pointer transition-all hover:scale-[1.01] hover:shadow-xl group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-amber-400 font-mono bg-white/5 px-2.5 py-1 rounded-full">
              {bookings.length} Total
            </span>
          </div>
          <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
            My Bookings
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Check appointment dates, shoot locations, status badges, and tax invoices.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-amber-400 gap-1">
            <span>View Bookings</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* 2. My Work */}
        <div
          onClick={() => onNavigate('my-work')}
          className="bg-[#12151e] border border-white/10 hover:border-amber-400/40 p-6 rounded-2xl cursor-pointer transition-all hover:scale-[1.01] hover:shadow-xl group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
              <ImageIcon className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-amber-400 font-mono bg-white/5 px-2.5 py-1 rounded-full">
              {workItems.length} Files
            </span>
          </div>
          <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
            My Work
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Review uploaded raw assets, color grading progress, and completed files.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-amber-400 gap-1">
            <span>Inspect Work</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* 3. Upload Photos & Videos */}
        <div
          onClick={() => onNavigate('upload')}
          className="bg-[#12151e] border border-white/10 hover:border-amber-400/40 p-6 rounded-2xl cursor-pointer transition-all hover:scale-[1.01] hover:shadow-xl group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
              <Upload className="w-6 h-6" />
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400 bg-white/5 px-2.5 py-1 rounded-full">
              Intake
            </span>
          </div>
          <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
            Upload Media
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Send raw photos and video clips for retouching, background removal, or video cuts.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-amber-400 gap-1">
            <span>Upload Files</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* 4. Edit Photo (Online Editor) */}
        <div
          onClick={() => onNavigate('edit-photos')}
          className="bg-[#12151e] border border-white/10 hover:border-amber-400/40 p-6 rounded-2xl cursor-pointer transition-all hover:scale-[1.01] hover:shadow-xl group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">
              Live Tool
            </span>
          </div>
          <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
            Edit Photo
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Adjust brightness, contrast, crop, rotate, apply vintage filters, and compare with before/after.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-amber-400 gap-1">
            <span>Launch Editor</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* 5. Downloads */}
        <div
          onClick={() => onNavigate('my-work')}
          className="bg-[#12151e] border border-white/10 hover:border-amber-400/40 p-6 rounded-2xl cursor-pointer transition-all hover:scale-[1.01] hover:shadow-xl group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
              <Download className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-400 font-mono bg-emerald-400/10 px-2.5 py-1 rounded-full">
              {completedWorks} Ready
            </span>
          </div>
          <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
            Downloads
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Download your finalized color-graded wedding frames and 4K video exports directly.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-amber-400 gap-1">
            <span>Get Master Files</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* 6. Profile */}
        <div
          onClick={() => onNavigate('profile')}
          className="bg-[#12151e] border border-white/10 hover:border-amber-400/40 p-6 rounded-2xl cursor-pointer transition-all hover:scale-[1.01] hover:shadow-xl group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
              <User className="w-6 h-6" />
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400 bg-white/5 px-2.5 py-1 rounded-full">
              Account
            </span>
          </div>
          <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
            Profile Settings
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Update your contact phone, email, and preferred shoot destination addresses.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-amber-400 gap-1">
            <span>Edit Profile</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-[#12151e] border border-white/10 rounded-3xl p-6 sm:p-8">
        <h3 className="text-lg font-bold text-white mb-6">Recent Studio Activity</h3>

        {bookings.length === 0 && workItems.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No recent appointments or media requests logged.</p>
        ) : (
          <div className="space-y-4">
            {bookings.slice(0, 3).map(b => (
              <div
                key={b.id}
                className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center font-bold">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white">{b.service}</h5>
                    <span className="text-slate-400 text-[11px]">{b.appointment_date} &middot; {b.appointment_time}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    b.status === 'Approved' ? 'bg-emerald-500/15 text-emerald-400' :
                    b.status === 'In Progress' ? 'bg-blue-500/15 text-blue-400' :
                    b.status === 'Completed' ? 'bg-purple-500/15 text-purple-400' :
                    'bg-amber-500/15 text-amber-400'
                  }`}>
                    {b.status}
                  </span>
                  <button
                    onClick={() => onNavigate('my-bookings')}
                    className="text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
