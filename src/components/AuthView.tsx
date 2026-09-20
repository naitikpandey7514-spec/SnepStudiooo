import React, { useState } from 'react';
import { 
  Building2, Camera, User, Briefcase, Mail, Lock, Phone, MapPin, 
  CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Sparkles,
  Info, Clock, Award
} from 'lucide-react';
import { UserRecord, StudioShopProfile } from '../types';
import { StoredAuthAccount } from '../data/studioData';

interface AuthModalOrViewProps {
  initialRole?: 'customer' | 'admin' | 'employee';
  initialMode?: 'register' | 'login';
  accounts: StoredAuthAccount[];
  shopProfile: StudioShopProfile;
  onRegisterAccount: (newAccount: StoredAuthAccount, updatedShop?: StudioShopProfile) => void;
  onLoginSuccess: (user: UserRecord, updatedAccounts: StoredAuthAccount[]) => void;
  onNavigate: (page: string) => void;
}

export const AuthView: React.FC<AuthModalOrViewProps> = ({
  initialRole = 'customer',
  initialMode = 'register',
  accounts,
  shopProfile,
  onRegisterAccount,
  onLoginSuccess,
  onNavigate
}) => {
  // Navigation tabs
  const [activeRole, setActiveRole] = useState<'customer' | 'admin' | 'employee'>(initialRole);
  const [mode, setMode] = useState<'register' | 'login'>(initialMode);

  // Common credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Admin Shop Specific Details
  const [shopName, setShopName] = useState(shopProfile.shop_name);
  const [tagline, setTagline] = useState(shopProfile.tagline);
  const [shopRegNumber, setShopRegNumber] = useState(shopProfile.shop_reg_number);
  const [gstTin, setGstTin] = useState(shopProfile.gst_tin);
  const [streetAddress, setStreetAddress] = useState(shopProfile.street_address);
  const [landmark, setLandmark] = useState(shopProfile.landmark);
  const [city, setCity] = useState(shopProfile.city);
  const [state, setState] = useState(shopProfile.state);
  const [pincode, setPincode] = useState(shopProfile.pincode);
  const [operatingHours, setOperatingHours] = useState(shopProfile.operating_hours);
  const [upiId, setUpiId] = useState(shopProfile.upi_id);
  const [bankAccountNo, setBankAccountNo] = useState(shopProfile.bank_account_no);
  const [bankIfsc, setBankIfsc] = useState(shopProfile.bank_ifsc);

  // Employee specific details
  const [employeeId, setEmployeeId] = useState('EMP-' + Math.floor(Math.random() * 90 + 10));
  const [employeeRole, setEmployeeRole] = useState<'Lead Photographer' | 'Drone Pilot' | 'Cinematographer' | 'Senior Colorist / Video Editor' | 'Studio Assistant'>('Lead Photographer');

  // Feedback states
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Handle Register
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError('Please provide a valid email and password.');
      return;
    }

    // Check if account already exists with this email
    const existing = accounts.find(a => a.email.toLowerCase() === cleanEmail);
    if (existing) {
      setError(`An account with email "${cleanEmail}" already exists. Only one account can be registered with each email address.`);
      return;
    }

    if (password.length < 5) {
      setError('Password must contain at least 5 characters for studio security.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password entry.');
      return;
    }

    // Build new account
    const newId = Date.now();
    const newAccount: StoredAuthAccount = {
      id: newId,
      role: activeRole,
      name: fullName.trim() || (activeRole === 'admin' ? 'Studio Administrator' : activeRole === 'employee' ? 'Staff Member' : 'Studio Client'),
      email: cleanEmail,
      phone: phone.trim() || '+91 98765 43210',
      address: activeRole === 'admin' ? `${streetAddress}, ${landmark}, ${city}, ${state} - ${pincode}` : (address.trim() || `${city || 'Mumbai'}, India`),
      passwordHash: password,
      designation: activeRole === 'employee' ? employeeRole : activeRole === 'admin' ? 'Studio Owner & Admin' : 'Client',
      employee_id: activeRole === 'employee' ? employeeId : undefined,
      shop_name: activeRole === 'admin' ? shopName : undefined,
      has_logged_in: false,
      created_at: new Date().toISOString().split('T')[0]
    };

    let updatedShop: StudioShopProfile | undefined = undefined;
    if (activeRole === 'admin') {
      updatedShop = {
        ...shopProfile,
        shop_name: shopName.trim() || shopProfile.shop_name,
        tagline: tagline.trim() || shopProfile.tagline,
        owner_name: fullName.trim() || shopProfile.owner_name,
        shop_reg_number: shopRegNumber.trim() || shopProfile.shop_reg_number,
        gst_tin: gstTin.trim() || shopProfile.gst_tin,
        email: cleanEmail,
        phone_primary: phone.trim() || shopProfile.phone_primary,
        street_address: streetAddress.trim() || shopProfile.street_address,
        landmark: landmark.trim() || shopProfile.landmark,
        city: city.trim() || shopProfile.city,
        state: state.trim() || shopProfile.state,
        pincode: pincode.trim() || shopProfile.pincode,
        operating_hours: operatingHours.trim() || shopProfile.operating_hours,
        upi_id: upiId.trim() || shopProfile.upi_id,
        bank_account_no: bankAccountNo.trim() || shopProfile.bank_account_no,
        bank_ifsc: bankIfsc.trim() || shopProfile.bank_ifsc
      };
    }

    onRegisterAccount(newAccount, updatedShop);
    setSuccessMsg(`Registration successful! Your ${activeRole.toUpperCase()} account is ready. Proceeding to one-time sign-in...`);
    
    // Auto switch to login or automatically log in
    setTimeout(() => {
      // Mark as logged in (one-time login rule)
      const userRecord: UserRecord = {
        id: newAccount.id,
        name: newAccount.name,
        email: newAccount.email,
        phone: newAccount.phone,
        address: newAccount.address,
        created_at: newAccount.created_at,
        role: newAccount.role,
        designation: newAccount.designation,
        has_logged_in: true,
        last_login_at: new Date().toISOString()
      };

      const updatedAccounts = accounts.concat(newAccount).map(acc => 
        acc.email.toLowerCase() === cleanEmail ? { ...acc, has_logged_in: true } : acc
      );

      onLoginSuccess(userRecord, updatedAccounts);
      onNavigate(activeRole === 'customer' ? 'home' : activeRole === 'admin' ? 'home' : 'my-work');
    }, 1200);
  };

  // Handle Login with One-Time Login Rule
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError('Please provide your registered email address and password.');
      return;
    }

    // Locate account in database
    const targetAccount = accounts.find(a => a.email.toLowerCase() === cleanEmail);

    if (!targetAccount) {
      setError(`No account found for "${cleanEmail}". Please register first using the Register tab.`);
      return;
    }

    // Check role match
    if (targetAccount.role !== activeRole) {
      setError(`This email is registered as "${targetAccount.role.toUpperCase()}". Please switch to the ${targetAccount.role.toUpperCase()} tab to sign in.`);
      return;
    }

    // Validate password
    if (targetAccount.passwordHash !== password) {
      setError('Incorrect password. Please verify and try again.');
      return;
    }

    // ONE TIME CAN LOGIN WITH THE EMAIL RULE CHECK:
    // If the account has already logged in previously, enforce the single-session / one-time login constraint
    if (targetAccount.has_logged_in) {
      setError(`NOTICE: Security Policy: This email (${cleanEmail}) has already completed its single-activation login. To switch devices or re-authenticate, please reset via Studio Admin or use a fresh email.`);
      return;
    }

    // Successfully verified -> mark as logged in
    const updatedAccounts = accounts.map(a => 
      a.email.toLowerCase() === cleanEmail ? { ...a, has_logged_in: true } : a
    );

    const userRecord: UserRecord = {
      id: targetAccount.id,
      name: targetAccount.name,
      email: targetAccount.email,
      phone: targetAccount.phone,
      address: targetAccount.address,
      created_at: targetAccount.created_at,
      role: targetAccount.role,
      designation: targetAccount.designation,
      has_logged_in: true,
      last_login_at: new Date().toISOString()
    };

    setSuccessMsg(`Welcome, ${targetAccount.name}! Login verified.`);
    setTimeout(() => {
      onLoginSuccess(userRecord, updatedAccounts);
      onNavigate(activeRole === 'customer' ? 'home' : 'home');
    }, 800);
  };

  // Quick switch demo fillers
  const handleDemoFill = (role: 'customer' | 'admin' | 'employee') => {
    setActiveRole(role);
    setMode('login');
    setError(null);
    if (role === 'customer') {
      setEmail('rohan.sharma@example.com');
      setPassword('password123');
    } else if (role === 'admin') {
      setEmail('admin@snepstudio.com');
      setPassword('admin123');
    } else {
      setEmail('arjun.mehta@snepstudio.com');
      setPassword('employee123');
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative flex items-center justify-center">
      {/* Background ambient texture */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1920&q=80')`
        }}
      />

      <div className="relative max-w-2xl w-full bg-[#12151e] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
        
        {/* Studio Branding */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 mx-auto mb-3 shadow-lg shadow-amber-400/20">
            <Camera className="w-7 h-7 text-slate-950 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {shopProfile.shop_name || 'SnepStudio Photography & Films'}
          </h1>
          <p className="text-xs text-amber-400 font-medium tracking-wide mt-1">
            Studio Portal &bull; Customer &bull; Admin &bull; Employee Gateway
          </p>
        </div>

        {/* 3 Role Selection Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[#171b26] border border-white/10 mb-6">
          <button
            type="button"
            onClick={() => { setActiveRole('customer'); setError(null); }}
            className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeRole === 'customer'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Customer Portal</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveRole('admin'); setError(null); }}
            className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeRole === 'admin'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Admin / Shop Owner</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveRole('employee'); setError(null); }}
            className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeRole === 'employee'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Employee / Crew</span>
          </button>
        </div>

        {/* Mode Toggle: Register vs Login */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`text-sm font-bold pb-2 transition-colors relative cursor-pointer ${
                mode === 'register' ? 'text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              New Register ({activeRole.toUpperCase()})
              {mode === 'register' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
              )}
            </button>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`text-sm font-bold pb-2 transition-colors relative cursor-pointer ${
                mode === 'login' ? 'text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In (Existing)
              {mode === 'login' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
              )}
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-amber-300/80 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
            <Info className="w-3 h-3 text-amber-400" />
            <span>1-Email 1-Login Security Enabled</span>
          </div>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* FORM: REGISTRATION (with complete shop details for admin) */}
        {/* ======================================================== */}
        {mode === 'register' ? (
          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            
            {/* Header info based on role */}
            {activeRole === 'admin' && (
              <div className="p-4 rounded-2xl bg-amber-400/5 border border-amber-400/20 mb-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
                  <Building2 className="w-4 h-4" />
                  <span>Studio Owner &amp; Shop Registration</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  As the studio owner, register your shop profile including registered business address, GSTIN, shop establishment license, operating hours, and billing credentials. These details auto-populate all client invoices and booking contracts.
                </p>
              </div>
            )}

            {activeRole === 'employee' && (
              <div className="p-4 rounded-2xl bg-amber-400/5 border border-amber-400/20 mb-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
                  <Briefcase className="w-4 h-4" />
                  <span>Employee / Crew Registration</span>
                </div>
                <p className="text-slate-300 text-xs">
                  Register as studio photographer, drone operator, cinematographer, or post-production colorist. You will be able to dispatch shoot folders directly to clients and manage work queues.
                </p>
              </div>
            )}

            {/* Basic Identity Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block uppercase font-bold text-slate-400 mb-1 text-[11px]">
                  {activeRole === 'admin' ? 'Owner / Admin Full Name' : activeRole === 'employee' ? 'Staff Full Name' : 'Customer Full Name'} *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={activeRole === 'admin' ? 'e.g. Vikramaditya Sengupta' : 'e.g. Rohan Sharma'}
                    className="w-full bg-[#181c27] border border-white/15 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase font-bold text-slate-400 mb-1 text-[11px]">
                  Email Address (One-time unique) *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={activeRole === 'admin' ? 'admin@snepstudio.com' : activeRole === 'employee' ? 'staff@snepstudio.com' : 'client@example.com'}
                    className="w-full bg-[#181c27] border border-white/15 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block uppercase font-bold text-slate-400 mb-1 text-[11px]">
                  Contact Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#181c27] border border-white/15 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {activeRole === 'employee' ? (
                <div>
                  <label className="block uppercase font-bold text-slate-400 mb-1 text-[11px]">
                    Designation / Specialization *
                  </label>
                  <select
                    value={employeeRole}
                    onChange={(e) => setEmployeeRole(e.target.value as any)}
                    className="w-full bg-[#181c27] border border-white/15 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Lead Photographer">Lead Photographer</option>
                    <option value="Cinematographer">Cinematographer</option>
                    <option value="Drone Pilot">Drone Pilot (Licensed)</option>
                    <option value="Senior Colorist / Video Editor">Senior Colorist / Video Editor</option>
                    <option value="Studio Assistant">Studio Assistant</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block uppercase font-bold text-slate-400 mb-1 text-[11px]">
                    {activeRole === 'admin' ? 'Designation / Role Title' : 'City / Neighborhood'}
                  </label>
                  <input
                    type="text"
                    value={activeRole === 'admin' ? 'Studio Owner & Executive Director' : address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={activeRole === 'admin' ? 'Studio Owner' : 'Bandra West, Mumbai'}
                    className="w-full bg-[#181c27] border border-white/15 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}
            </div>

            {/* ========================================= */}
            {/* ADMIN EXCLUSIVE: FULL SHOP & ADDRESS FORM */}
            {/* ========================================= */}
            {activeRole === 'admin' && (
              <div className="pt-3 border-t border-white/10 space-y-3">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Shop &amp; Studio Commercial Details</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase font-bold text-slate-400 mb-1 text-[11px]">
                      Studio / Shop Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="SnepStudio Photography & Films"
                      className="w-full bg-[#181c27] border border-white/15 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block uppercase font-bold text-slate-400 mb-1 text-[11px]">
                      Studio Slogan / Tagline
                    </label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="Preserving Moments in Cinematic Splendor"
                      className="w-full bg-[#181c27] border border-white/15 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block uppercase font-bold text-slate-400 mb-1 text-[11px]">
                      Shop Establishment Reg. No.
                    </label>
                    <input
                      type="text"
                      value={shopRegNumber}
                      onChange={(e) => setShopRegNumber(e.target.value)}
                      placeholder="MAH/MUM/EST/2021/84920"
                      className="w-full bg-[#181c27] border border-white/15 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block uppercase font-bold text-slate-400 mb-1 text-[11px]">
                      GSTIN / Tax ID
                    </label>
                    <input
                      type="text"
                      value={gstTin}
                      onChange={(e) => setGstTin(e.target.value)}
                      placeholder="27AABCU9603R1ZM"
                      className="w-full bg-[#181c27] border border-white/15 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Complete Physical Address of the Shop */}
                <div className="space-y-2">
                  <div>
                    <label className="block uppercase font-bold text-slate-400 mb-1 text-[11px]">
                      Shop Street Address / Building / Floor *
                    </label>
                    <input
                      type="text"
                      required
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="Plot 42, Floor 2, Creative Arts Enclave, Off Linking Road"
                      className="w-full bg-[#181c27] border border-white/15 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div className="sm:col-span-2">
                      <label className="block uppercase font-bold text-slate-400 mb-1 text-[11px]">
                        Landmark / Area
                      </label>
                      <input
                        type="text"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        placeholder="Near Mehboob Studios, Bandra West"
                        className="w-full bg-[#181c27] border border-white/15 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block uppercase font-bold text-slate-400 mb-1 text-[11px]">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Mumbai"
                        className="w-full bg-[#181c27] border border-white/15 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block uppercase font-bold text-slate-400 mb-1 text-[11px]">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        required
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="400050"
                        className="w-full bg-[#181c27] border border-white/15 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block uppercase font-bold text-slate-400 mb-1 text-[11px]">
                      Operating Timings
                    </label>
                    <input
                      type="text"
                      value={operatingHours}
                      onChange={(e) => setOperatingHours(e.target.value)}
                      placeholder="Mon - Sun: 09:00 AM - 09:00 PM"
                      className="w-full bg-[#181c27] border border-white/15 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block uppercase font-bold text-slate-400 mb-1 text-[11px]">
                      UPI ID for Invoices
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="snepstudio@hdfcbank"
                      className="w-full bg-[#181c27] border border-white/15 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block uppercase font-bold text-slate-400 mb-1 text-[11px]">
                      Bank IFSC
                    </label>
                    <input
                      type="text"
                      value={bankIfsc}
                      onChange={(e) => setBankIfsc(e.target.value)}
                      placeholder="HDFC0000019"
                      className="w-full bg-[#181c27] border border-white/15 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Customer Address Field */}
            {activeRole === 'customer' && (
              <div>
                <label className="block uppercase font-bold text-slate-400 mb-1 text-[11px]">
                  Residential Address / Location (For Shoot Travel) *
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Silver Sands, Juhu Beach Road, Mumbai, Maharashtra"
                    className="w-full bg-[#181c27] border border-white/15 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}

            {/* Password Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block uppercase font-bold text-slate-400 mb-1 text-[11px]">
                  Create Password *
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#181c27] border border-white/15 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase font-bold text-slate-400 mb-1 text-[11px]">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#181c27] border border-white/15 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Submit Register Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 cursor-pointer mt-4 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-slate-950" />
              <span>Register &amp; Activate {activeRole.toUpperCase()} Account</span>
            </button>
          </form>
        ) : (
          /* ======================================================== */
          /* FORM: LOGIN (Enforces One-Time Login per Email Address)  */
          /* ======================================================== */
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-amber-400/5 border border-amber-400/20 text-slate-300 mb-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>One-Time Email Login Policy</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                As per studio safety protocols, each registered email address operates with verified session binding. If you are registering for the first time, switch to the <strong>New Register</strong> tab.
              </p>
            </div>

            <div>
              <label className="block uppercase font-bold text-slate-400 mb-1 text-[11px]">
                Registered Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={activeRole === 'admin' ? 'admin@snepstudio.com' : activeRole === 'employee' ? 'arjun.mehta@snepstudio.com' : 'rohan.sharma@example.com'}
                  className="w-full bg-[#181c27] border border-white/15 rounded-xl pl-9 pr-3 py-3 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block uppercase font-bold text-slate-400 mb-1 text-[11px]">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#181c27] border border-white/15 rounded-xl pl-9 pr-3 py-3 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 cursor-pointer mt-2"
            >
              Sign In to {activeRole.toUpperCase()} Portal
            </button>

            {/* Quick Demo Fill Buttons */}
            <div className="pt-3 border-t border-white/10">
              <span className="block text-[10px] uppercase font-bold text-slate-400 mb-2">
                Quick Demo Accounts (Pre-configured):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoFill('customer')}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] text-left border border-white/10 transition-colors"
                >
                  <strong className="block text-amber-400 font-bold">Client Demo:</strong>
                  <span className="truncate block text-slate-400">rohan.sharma@example.com</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('admin')}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] text-left border border-white/10 transition-colors"
                >
                  <strong className="block text-amber-400 font-bold">Admin Demo:</strong>
                  <span className="truncate block text-slate-400">admin@snepstudio.com</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('employee')}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] text-left border border-white/10 transition-colors"
                >
                  <strong className="block text-amber-400 font-bold">Employee Demo:</strong>
                  <span className="truncate block text-slate-400">arjun.mehta@snepstudio.com</span>
                </button>
              </div>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
