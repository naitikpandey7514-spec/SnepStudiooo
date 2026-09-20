import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, CheckCircle2, Save, Shield } from 'lucide-react';
import { UserRecord } from '../types';

interface ProfileViewProps {
  currentUser: UserRecord;
  onUpdateProfile: (updated: Partial<UserRecord>) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ currentUser, onUpdateProfile }) => {
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone);
  const [address, setAddress] = useState(currentUser.address);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ name, email, phone, address });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
          Personal Information
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
          Client Profile
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Keep your shoot contact details and communication channels up to date.
        </p>
      </div>

      <div className="bg-[#12151e] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
        <div className="flex items-center gap-4 pb-6 mb-6 border-b border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-amber-500/20">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{currentUser.name}</h2>
            <p className="text-xs text-amber-400 font-mono mt-0.5">{currentUser.email}</p>
            <span className="text-[11px] text-slate-500 block mt-1">
              Member since {currentUser.created_at || '2026'}
            </span>
          </div>
        </div>

        {saved && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Your profile details have been saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#181c27] border border-white/15 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#181c27] border border-white/15 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>Primary Phone Number</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#181c27] border border-white/15 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Default Address / City</span>
            </label>
            <textarea
              rows={3}
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-[#181c27] border border-white/15 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Changes</span>
          </button>
        </form>
      </div>
    </div>
  );
};
