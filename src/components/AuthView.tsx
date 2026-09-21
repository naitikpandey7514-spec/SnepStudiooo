import React, { useState, useEffect } from 'react';
import { 
  Camera, User, Briefcase, Shield, Mail, Lock, Phone, MapPin, 
  CheckCircle2, AlertCircle, ArrowRight, Eye, EyeOff, Sparkles, UserPlus, LogIn
} from 'lucide-react';
import { UserRecord, StudioShopProfile } from '../types';
import { StoredAuthAccount } from '../data/studioData';

interface AuthViewProps {
  initialMode?: 'login' | 'register';
  initialRole?: 'customer' | 'employee' | 'admin';
  accounts: StoredAuthAccount[];
  shopProfile?: StudioShopProfile;
  onRegisterAccount: (newAccount: StoredAuthAccount, updatedShop?: StudioShopProfile) => void;
  onLoginSuccess: (user: UserRecord, updatedAccounts?: StoredAuthAccount[]) => void;
  onNavigate: (page: string) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'login',
  initialRole = 'customer',
  accounts,
  shopProfile,
  onRegisterAccount,
  onLoginSuccess,
  onNavigate
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Registration role: strictly Customer or Employee (Admin cannot be registered)
  const [regRole, setRegRole] = useState<'customer' | 'employee'>('customer');

  // Login role: Customer, Employee, or Admin
  const [loginRole, setLoginRole] = useState<'customer' | 'employee' | 'admin'>(
    initialRole === 'admin' ? 'admin' : initialRole === 'employee' ? 'employee' : 'customer'
  );

  // Sync mode with props when changed from navbar
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (initialRole) {
      if (initialRole === 'admin') setLoginRole('admin');
      else if (initialRole === 'employee') {
        setLoginRole('employee');
        setRegRole('employee');
      } else {
        setLoginRole('customer');
        setRegRole('customer');
      }
    }
  }, [initialRole]);

  // Common Registration Fields
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  
  // Employee-only Registration Field
  const [regDesignation, setRegDesignation] = useState<string>('Lead Photographer');

  // Login Fields
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Email or Employee ID
  const [loginPassword, setLoginPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Demo Credentials Quick Fill
  const fillDemoCredentials = (role: 'customer' | 'employee' | 'admin') => {
    resetMessages();
    setMode('login');
    setLoginRole(role);
    if (role === 'customer') {
      setLoginIdentifier('rohan.sharma@example.com');
      setLoginPassword('password123');
    } else if (role === 'employee') {
      setLoginIdentifier('EMP-0001');
      setLoginPassword('employee123');
    } else if (role === 'admin') {
      setLoginIdentifier('admin@snepstudio.com');
      setLoginPassword('admin123');
    }
  };

  // -------------------------------------------------------------
  // REGISTRATION HANDLER
  // -------------------------------------------------------------
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanName = regFullName.trim();
    const cleanPhone = regPhone.trim();
    const cleanAddress = regAddress.trim();

    if (!cleanName || !cleanEmail || !cleanPhone || !cleanAddress || !regPassword) {
      setErrorMessage('Please fill in all required registration fields.');
      return;
    }

    // Unique email enforcement
    const existing = accounts.find(a => a.email.toLowerCase() === cleanEmail);
    if (existing) {
      setErrorMessage(`The email "${cleanEmail}" is already registered. Please login instead.`);
      return;
    }

    if (regPassword.length < 5) {
      setErrorMessage('Password must be at least 5 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your password entry.');
      return;
    }

    // Generate unique employee ID if employee
    const nextEmpNum = accounts.filter(a => a.role === 'employee').length + 1;
    const generatedEmployeeId = regRole === 'employee' ? `EMP-${String(nextEmpNum).padStart(4, '0')}` : undefined;

    const newAccount: StoredAuthAccount = {
      id: Date.now(),
      role: regRole,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      address: cleanAddress,
      passwordHash: regPassword,
      designation: regRole === 'employee' ? regDesignation : 'Customer',
      employee_id: generatedEmployeeId,
      created_at: new Date().toISOString().split('T')[0]
    };

    onRegisterAccount(newAccount);

    if (regRole === 'employee') {
      setSuccessMessage(`Employee account registered successfully! Your Employee ID is ${generatedEmployeeId}. Logging you in...`);
    } else {
      setSuccessMessage('Registration successful! Welcome to SnepStudio. Logging you in...');
    }

    // Automatically log in after registration
    setTimeout(() => {
      const userRecord: UserRecord = {
        id: newAccount.id,
        name: newAccount.name,
        email: newAccount.email,
        phone: newAccount.phone,
        address: newAccount.address,
        role: newAccount.role,
        employee_id: newAccount.employee_id,
        designation: newAccount.designation,
        created_at: newAccount.created_at,
        last_login_at: new Date().toISOString()
      };
      onLoginSuccess(userRecord);
      if (userRecord.role === 'employee') {
        onNavigate('employee-dashboard');
      } else {
        onNavigate('dashboard');
      }
    }, 1000);
  };

  // -------------------------------------------------------------
  // LOGIN HANDLER
  // -------------------------------------------------------------
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    const cleanInput = loginIdentifier.trim();
    if (!cleanInput || !loginPassword) {
      setErrorMessage('Please enter both your login credential and password.');
      return;
    }

    let targetAccount: StoredAuthAccount | undefined;

    if (loginRole === 'customer') {
      // Customer logs in with email
      targetAccount = accounts.find(
        a => a.role === 'customer' && a.email.toLowerCase() === cleanInput.toLowerCase()
      );
      if (!targetAccount) {
        setErrorMessage(`No customer account found with email "${cleanInput}". Please check your email or Register.`);
        return;
      }
    } else if (loginRole === 'employee') {
      // Employee logs in with Employee ID or email
      targetAccount = accounts.find(
        a => a.role === 'employee' && (
          a.employee_id?.toUpperCase() === cleanInput.toUpperCase() ||
          a.email.toLowerCase() === cleanInput.toLowerCase()
        )
      );
      if (!targetAccount) {
        setErrorMessage(`No staff account found with ID or email "${cleanInput}". Please register as an employee or check your ID.`);
        return;
      }
    } else if (loginRole === 'admin') {
      // Admin logs in with username 'admin' or email
      targetAccount = accounts.find(
        a => a.role === 'admin' && (
          a.email.toLowerCase() === cleanInput.toLowerCase() ||
          cleanInput.toLowerCase() === 'admin'
        )
      );
      if (!targetAccount) {
        setErrorMessage('Authorized Admin account not found.');
        return;
      }
    }

    if (targetAccount && targetAccount.passwordHash !== loginPassword) {
      setErrorMessage('Incorrect password. Please try again.');
      return;
    }

    if (targetAccount) {
      const userRecord: UserRecord = {
        id: targetAccount.id,
        name: targetAccount.name,
        email: targetAccount.email,
        phone: targetAccount.phone,
        address: targetAccount.address,
        role: targetAccount.role,
        employee_id: targetAccount.employee_id,
        designation: targetAccount.designation,
        created_at: targetAccount.created_at,
        last_login_at: new Date().toISOString()
      };

      setSuccessMessage(`Welcome back, ${userRecord.name}!`);
      setTimeout(() => {
        onLoginSuccess(userRecord);
        if (userRecord.role === 'admin') {
          onNavigate('admin-dashboard');
        } else if (userRecord.role === 'employee') {
          onNavigate('employee-dashboard');
        } else {
          onNavigate('dashboard');
        }
      }, 500);
    }
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col justify-center">
      
      {/* Top Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-xl shadow-amber-500/20 mb-4">
          <Camera className="w-7 h-7 stroke-[2.2]" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Snep<span className="text-amber-400">Studio</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Professional Photography &amp; Creative Editing Management Portal
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-[#121622] border border-white/10 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
        
        {/* Navigation Mode Switcher (Login vs Register) */}
        <div className="flex border-b border-white/10 bg-[#0d1019]">
          <button
            type="button"
            onClick={() => { setMode('login'); resetMessages(); }}
            className={`flex-1 py-4 text-center text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'login'
                ? 'text-amber-400 border-b-2 border-amber-400 bg-white/5'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Login to Studio</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode('register'); resetMessages(); }}
            className={`flex-1 py-4 text-center text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'register'
                ? 'text-amber-400 border-b-2 border-amber-400 bg-white/5'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
          </button>
        </div>

        <div className="p-6 sm:p-10">
          
          {/* ============================================================== */}
          {/* 1. REGISTRATION VIEW                                           */}
          {/* ============================================================== */}
          {mode === 'register' && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white">Create Your Account</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Select your role below to register with SnepStudio
                </p>
              </div>

              {/* Strict Role Selection: Customer vs Employee ONLY (No Admin!) */}
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#0b0d14] rounded-2xl border border-white/10 mb-8 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => { setRegRole('customer'); resetMessages(); }}
                  className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    regRole === 'customer'
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Customer</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setRegRole('employee'); resetMessages(); }}
                  className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    regRole === 'employee'
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Employee / Crew</span>
                </button>
              </div>

              {/* Alert Feedback */}
              {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleRegister} className="space-y-4 max-w-2xl mx-auto">
                
                {/* Full Name */}
                <div>
                  <label className="block text-xs uppercase font-bold text-slate-300 mb-1">
                    Full Name <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder={regRole === 'customer' ? 'e.g., Rohan Sharma' : 'e.g., Arjun Mehta'}
                      className="w-full bg-[#181d2a] border border-white/15 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase font-bold text-slate-300 mb-1">
                      Email Address <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="w-full bg-[#181d2a] border border-white/15 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold text-slate-300 mb-1">
                      Phone Number <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-[#181d2a] border border-white/15 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs uppercase font-bold text-slate-300 mb-1">
                    Address / Location <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      placeholder="e.g., Bandra West, Mumbai, Maharashtra"
                      className="w-full bg-[#181d2a] border border-white/15 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Employee Specialization / Designation */}
                {regRole === 'employee' && (
                  <div>
                    <label className="block text-xs uppercase font-bold text-slate-300 mb-1">
                      Staff Role / Designation <span className="text-amber-400">*</span>
                    </label>
                    <select
                      value={regDesignation}
                      onChange={(e) => setRegDesignation(e.target.value)}
                      className="w-full bg-[#181d2a] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="Lead Photographer">Lead Photographer</option>
                      <option value="Cinematographer">Cinematographer</option>
                      <option value="Drone Pilot">Drone Pilot</option>
                      <option value="Senior Colorist / Video Editor">Senior Colorist / Video Editor</option>
                      <option value="Studio Assistant">Studio Assistant</option>
                    </select>
                  </div>
                )}

                {/* Password and Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase font-bold text-slate-300 mb-1">
                      Password <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Create strong password"
                        className="w-full bg-[#181d2a] border border-white/15 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold text-slate-300 mb-1">
                      Confirm Password <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full bg-[#181d2a] border border-white/15 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold py-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2 mt-6"
                >
                  <UserPlus className="w-4 h-4 stroke-[2.5]" />
                  <span>{regRole === 'customer' ? 'Create Customer Account' : 'Register as Studio Staff'}</span>
                </button>
              </form>

              <div className="mt-6 text-center text-xs text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); resetMessages(); }}
                  className="text-amber-400 font-bold hover:underline cursor-pointer"
                >
                  Login here
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 2. LOGIN VIEW (Customer, Employee, and Separate Admin Login)   */}
          {/* ============================================================== */}
          {mode === 'login' && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white">Sign In to Your Account</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Choose your account type to proceed
                </p>
              </div>

              {/* 3 Login Tabs: Customer, Employee, Admin */}
              <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#0b0d14] rounded-2xl border border-white/10 mb-8 max-w-lg mx-auto">
                <button
                  type="button"
                  onClick={() => { setLoginRole('customer'); resetMessages(); setLoginIdentifier(''); setLoginPassword(''); }}
                  className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    loginRole === 'customer'
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Customer</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setLoginRole('employee'); resetMessages(); setLoginIdentifier(''); setLoginPassword(''); }}
                  className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    loginRole === 'employee'
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Employee</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setLoginRole('admin'); resetMessages(); setLoginIdentifier('admin@snepstudio.com'); setLoginPassword('admin123'); }}
                  className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    loginRole === 'admin'
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </button>
              </div>

              {/* Alert Feedback */}
              {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4 max-w-md mx-auto">
                
                {/* Identifier Input */}
                <div>
                  <label className="block text-xs uppercase font-bold text-slate-300 mb-1">
                    {loginRole === 'employee' ? 'Employee ID or Email' : loginRole === 'admin' ? 'Admin Email / Username' : 'Customer Email Address'} <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    {loginRole === 'employee' ? (
                      <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    ) : loginRole === 'admin' ? (
                      <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    ) : (
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    )}
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder={
                        loginRole === 'employee' 
                          ? 'e.g., EMP-0001 or employee email' 
                          : loginRole === 'admin'
                          ? 'admin@snepstudio.com'
                          : 'your.email@example.com'
                      }
                      className="w-full bg-[#181d2a] border border-white/15 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-xs uppercase font-bold text-slate-300 mb-1">
                    Password <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter account password"
                      className="w-full bg-[#181d2a] border border-white/15 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold py-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2 mt-6"
                >
                  <LogIn className="w-4 h-4 stroke-[2.5]" />
                  <span>
                    {loginRole === 'admin' 
                      ? 'Sign In to Admin Dashboard' 
                      : loginRole === 'employee' 
                      ? 'Sign In to Employee Portal' 
                      : 'Sign In to Customer Dashboard'}
                  </span>
                </button>
              </form>

              {/* B.Tech College Project Demo Quick-Fill Bar */}
              <div className="mt-8 pt-6 border-t border-white/10 max-w-md mx-auto">
                <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>1-Click Demo Accounts (College Project Evaluation)</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('customer')}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-amber-400/20 hover:text-amber-300 border border-white/10 transition-colors text-slate-300 text-center font-medium cursor-pointer"
                  >
                    <span className="block font-bold text-white">Customer</span>
                    <span className="text-[10px] text-slate-400 font-mono">rohan@sharma</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('employee')}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-amber-400/20 hover:text-amber-300 border border-white/10 transition-colors text-slate-300 text-center font-medium cursor-pointer"
                  >
                    <span className="block font-bold text-white">Employee</span>
                    <span className="text-[10px] text-slate-400 font-mono">EMP-0001</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('admin')}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-amber-400/20 hover:text-amber-300 border border-white/10 transition-colors text-slate-300 text-center font-medium cursor-pointer"
                  >
                    <span className="block font-bold text-white">Admin</span>
                    <span className="text-[10px] text-slate-400 font-mono">admin@snep</span>
                  </button>
                </div>
              </div>

              {/* Bottom switch to Register */}
              <div className="mt-6 text-center text-xs text-slate-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); resetMessages(); }}
                  className="text-amber-400 font-bold hover:underline cursor-pointer"
                >
                  Create Customer or Employee Account
                </button>
              </div>

            </div>
          )}

        </div>
      </div>

    </div>
  );
};
