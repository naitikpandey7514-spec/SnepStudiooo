import React, { useState } from 'react';
import { Camera, UserPlus, LogIn, Briefcase, Shield, CheckCircle2, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { UserRecord, StudioShopProfile } from '../types';
import { StoredAuthAccount } from '../data/studioData';

export type StartupAuthOption = 'customer-register' | 'customer-login' | 'employee-login' | 'admin-login';

interface StartupAuthScreenProps {
  initialOption?: StartupAuthOption;
  accounts: StoredAuthAccount[];
  shopProfile?: StudioShopProfile;
  onRegisterCustomer: (newAccount: StoredAuthAccount) => void;
  onLoginSuccess: (user: UserRecord) => void;
  onExploreAsGuest?: () => void;
}

export const StartupAuthScreen: React.FC<StartupAuthScreenProps> = ({
  initialOption = 'customer-login',
  accounts,
  shopProfile,
  onRegisterCustomer,
  onLoginSuccess,
  onExploreAsGuest
}) => {
  const [selectedOption, setSelectedOption] = useState<StartupAuthOption>(initialOption);

  // Customer Register Form
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Customer Login Form
  const [custEmail, setCustEmail] = useState('');
  const [custPassword, setCustPassword] = useState('');

  // Employee Login Form
  const [empId, setEmpId] = useState('');
  const [empPassword, setEmpPassword] = useState('');

  // Admin Login Form
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('admin123');

  // Common UI State
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetFormState = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // 1. Customer Registration Handler
  const handleCustomerRegister = (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();

    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanPhone = regPhone.trim();
    const cleanName = regFullName.trim();

    if (!cleanName || !cleanEmail || !cleanPhone || !regPassword) {
      setErrorMessage('Please complete all registration fields.');
      return;
    }

    // Unique email enforcement
    const existing = accounts.find(a => a.email.toLowerCase() === cleanEmail);
    if (existing) {
      setErrorMessage(`The email "${cleanEmail}" is already registered. Please use Customer Login instead.`);
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both password fields.');
      return;
    }

    const newAccount: StoredAuthAccount = {
      id: Date.now(),
      role: 'customer',
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      address: 'Mumbai, Maharashtra',
      passwordHash: regPassword,
      created_at: new Date().toISOString().split('T')[0]
    };

    onRegisterCustomer(newAccount);
    setSuccessMessage('Registration successful! You can now log in anytime.');

    // Auto-login registered customer
    setTimeout(() => {
      const userRecord: UserRecord = {
        id: newAccount.id,
        name: newAccount.name,
        email: newAccount.email,
        phone: newAccount.phone,
        address: newAccount.address,
        role: 'customer',
        created_at: newAccount.created_at,
        last_login_at: new Date().toISOString()
      };
      onLoginSuccess(userRecord);
    }, 600);
  };

  // 2. Customer Login Handler (Allows unlimited logins: Register -> Login -> Logout -> Login again)
  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();

    const cleanEmail = custEmail.trim().toLowerCase();
    if (!cleanEmail || !custPassword) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    const targetAccount = accounts.find(
      a => a.email.toLowerCase() === cleanEmail && a.role === 'customer'
    );

    if (!targetAccount) {
      setErrorMessage(`No customer account found with email "${cleanEmail}". Please check your email or Register as a new customer.`);
      return;
    }

    if (targetAccount.passwordHash !== custPassword) {
      setErrorMessage('Incorrect password. Please try again.');
      return;
    }

    const userRecord: UserRecord = {
      id: targetAccount.id,
      name: targetAccount.name,
      email: targetAccount.email,
      phone: targetAccount.phone,
      address: targetAccount.address,
      role: 'customer',
      created_at: targetAccount.created_at,
      last_login_at: new Date().toISOString()
    };

    setSuccessMessage(`Welcome back, ${userRecord.name}! Accessing your client portal...`);
    setTimeout(() => {
      onLoginSuccess(userRecord);
    }, 300);
  };

  // 3. Employee Login Handler (Using Employee ID + Password)
  const handleEmployeeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();

    const cleanEmpId = empId.trim().toUpperCase();
    if (!cleanEmpId || !empPassword) {
      setErrorMessage('Please enter both your Employee ID and password.');
      return;
    }

    // Match employee account by employee_id or email
    const targetAccount = accounts.find(
      a => a.role === 'employee' && (a.employee_id?.toUpperCase() === cleanEmpId || a.email.toLowerCase() === cleanEmpId.toLowerCase())
    );

    if (!targetAccount) {
      setErrorMessage(`No employee record found for ID "${cleanEmpId}". Only studio administrators can create employee accounts.`);
      return;
    }

    if (targetAccount.passwordHash !== empPassword) {
      setErrorMessage('Incorrect employee password. Please verify with studio management.');
      return;
    }

    const userRecord: UserRecord = {
      id: targetAccount.id,
      name: targetAccount.name,
      email: targetAccount.email,
      phone: targetAccount.phone,
      address: targetAccount.address,
      role: 'employee',
      employee_id: targetAccount.employee_id,
      designation: targetAccount.designation || 'Studio Crew',
      created_at: targetAccount.created_at,
      last_login_at: new Date().toISOString()
    };

    setSuccessMessage(`Welcome, ${userRecord.name} (${userRecord.employee_id})! Opening employee dashboard...`);
    setTimeout(() => {
      onLoginSuccess(userRecord);
    }, 300);
  };

  // 4. Admin Login Handler (Separate Admin credentials)
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();

    const cleanUser = adminUsername.trim().toLowerCase();
    if (!cleanUser || !adminPassword) {
      setErrorMessage('Please enter admin username/email and password.');
      return;
    }

    const targetAccount = accounts.find(
      a => a.role === 'admin' && (a.email.toLowerCase() === cleanUser || a.name.toLowerCase().includes(cleanUser) || cleanUser === 'admin')
    );

    if (!targetAccount || targetAccount.passwordHash !== adminPassword) {
      setErrorMessage('Invalid admin credentials. Please enter authorized studio credentials.');
      return;
    }

    const userRecord: UserRecord = {
      id: targetAccount.id,
      name: targetAccount.name,
      email: targetAccount.email,
      phone: targetAccount.phone,
      address: targetAccount.address,
      role: 'admin',
      designation: 'Studio Owner & Executive Administrator',
      created_at: targetAccount.created_at,
      last_login_at: new Date().toISOString()
    };

    setSuccessMessage('Admin authentication verified. Launching studio administrative control...');
    setTimeout(() => {
      onLoginSuccess(userRecord);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#0d1017] text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Studio Header */}
      <div className="max-w-4xl mx-auto w-full text-center pt-4 pb-6">
        <div className="inline-flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Camera className="w-6 h-6 text-slate-950" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Snep<span className="text-amber-400">Studio</span>
            </h1>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">
              Photography &amp; Film Production
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-300 max-w-lg mx-auto">
          Welcome to SnepStudio. Please select an option below to access your photoshoot bookings, proofing albums, or staff portal.
        </p>
      </div>

      {/* Main Authentication Box */}
      <div className="max-w-xl mx-auto w-full bg-[#141824] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8">
        
        {/* 4 Clear Startup Options */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 p-1.5 bg-[#0d1017] rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => { setSelectedOption('customer-register'); resetFormState(); }}
            className={`py-2.5 px-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
              selectedOption === 'customer-register'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span className="truncate">1. Register</span>
          </button>

          <button
            type="button"
            onClick={() => { setSelectedOption('customer-login'); resetFormState(); }}
            className={`py-2.5 px-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
              selectedOption === 'customer-login'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span className="truncate">2. Customer</span>
          </button>

          <button
            type="button"
            onClick={() => { setSelectedOption('employee-login'); resetFormState(); }}
            className={`py-2.5 px-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
              selectedOption === 'employee-login'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span className="truncate">3. Employee</span>
          </button>

          <button
            type="button"
            onClick={() => { setSelectedOption('admin-login'); resetFormState(); }}
            className={`py-2.5 px-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
              selectedOption === 'admin-login'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span className="truncate">4. Admin</span>
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* OPTION 1: Customer / User Registration */}
        {selectedOption === 'customer-register' && (
          <div>
            <div className="mb-4 pb-3 border-b border-white/5">
              <h2 className="text-lg font-bold text-white">1. Customer / User Registration</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Create your SnepStudio customer account to book photoshoots and review albums.
              </p>
            </div>

            <form onSubmit={handleCustomerRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Rohan Sharma"
                  className="w-full bg-[#1a2030] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address <span className="text-amber-400">(Unique)</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#1a2030] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#1a2030] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-[#1a2030] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full bg-[#1a2030] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'Hide password' : 'Show password'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOption('customer-login')}
                  className="text-xs text-amber-400 hover:underline cursor-pointer"
                >
                  Already registered? Login
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-3 rounded-xl text-sm transition-all shadow-md shadow-amber-400/20 cursor-pointer mt-2 flex items-center justify-center gap-2"
              >
                <span>Register Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* OPTION 2: Customer / User Login */}
        {selectedOption === 'customer-login' && (
          <div>
            <div className="mb-4 pb-3 border-b border-white/5">
              <h2 className="text-lg font-bold text-white">2. Customer / User Login</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Sign in to view your bookings, photos, albums, and payment receipts.
              </p>
            </div>

            <form onSubmit={handleCustomerLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  required
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  placeholder="e.g. rohan.sharma@example.com"
                  className="w-full bg-[#1a2030] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={custPassword}
                  onChange={(e) => setCustPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#1a2030] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOption('customer-register')}
                  className="text-xs text-amber-400 hover:underline cursor-pointer"
                >
                  New customer? Register here
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-3 rounded-xl text-sm transition-all shadow-md shadow-amber-400/20 cursor-pointer mt-2 flex items-center justify-center gap-2"
              >
                <span>Login to Customer Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Fill */}
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
              <span>Demo Customer Account:</span>
              <button
                type="button"
                onClick={() => {
                  setCustEmail('rohan.sharma@example.com');
                  setCustPassword('password123');
                }}
                className="text-amber-400 hover:underline cursor-pointer font-medium"
              >
                Fill Demo Credentials
              </button>
            </div>
          </div>
        )}

        {/* OPTION 3: Employee Login */}
        {selectedOption === 'employee-login' && (
          <div>
            <div className="mb-4 pb-3 border-b border-white/5">
              <h2 className="text-lg font-bold text-white">3. Employee Login</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Staff portal for photographers, cinematographers, and editors.
              </p>
            </div>

            <form onSubmit={handleEmployeeLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Unique Employee ID
                </label>
                <input
                  type="text"
                  required
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  placeholder="e.g. EMP-0001"
                  className="w-full bg-[#1a2030] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white uppercase font-mono tracking-wider focus:outline-none focus:border-amber-400 transition-colors"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Employee accounts are generated exclusively by Admin. Use the EMP ID given by studio management.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={empPassword}
                  onChange={(e) => setEmpPassword(e.target.value)}
                  placeholder="Enter employee password"
                  className="w-full bg-[#1a2030] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'Hide password' : 'Show password'}</span>
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-3 rounded-xl text-sm transition-all shadow-md shadow-amber-400/20 cursor-pointer mt-2 flex items-center justify-center gap-2"
              >
                <span>Staff Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Fill for Employee */}
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
              <span>Demo Staff (Lead Photographer):</span>
              <button
                type="button"
                onClick={() => {
                  setEmpId('EMP-0001');
                  setEmpPassword('employee123');
                }}
                className="text-amber-400 hover:underline cursor-pointer font-medium"
              >
                Fill EMP-0001 Credentials
              </button>
            </div>
          </div>
        )}

        {/* OPTION 4: Admin Login */}
        {selectedOption === 'admin-login' && (
          <div>
            <div className="mb-4 pb-3 border-b border-white/5">
              <h2 className="text-lg font-bold text-white">4. Studio Admin Login</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete studio control: manage employees, bookings, shoots, services &amp; finances.
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Admin Username or Email
                </label>
                <input
                  type="text"
                  required
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="admin or admin@snepstudio.com"
                  className="w-full bg-[#1a2030] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Admin Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full bg-[#1a2030] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'Hide password' : 'Show password'}</span>
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-3 rounded-xl text-sm transition-all shadow-md shadow-amber-400/20 cursor-pointer mt-2 flex items-center justify-center gap-2"
              >
                <span>Admin Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Fill for Admin */}
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
              <span>Default Studio Admin:</span>
              <button
                type="button"
                onClick={() => {
                  setAdminUsername('admin');
                  setAdminPassword('admin123');
                }}
                className="text-amber-400 hover:underline cursor-pointer font-medium"
              >
                Fill Admin Credentials
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Guest Exploration Option */}
      {onExploreAsGuest && (
        <div className="max-w-md mx-auto w-full text-center mt-6">
          <button
            type="button"
            onClick={onExploreAsGuest}
            className="text-xs text-slate-400 hover:text-amber-400 transition-colors underline cursor-pointer"
          >
            Explore Studio Portfolio &amp; Services as Guest
          </button>
        </div>
      )}

      {/* Simple Studio Footer info */}
      <div className="text-center text-xs text-slate-400 mt-6 pb-2">
        <p>SnepStudio Photography &amp; Film Production Studio · Mumbai, Maharashtra</p>
      </div>

    </div>
  );
};
