import React, { useState } from 'react';
import { Camera, Menu, X, User, LogOut, Calendar, Sparkles, Upload, CheckSquare, ShieldCheck, Briefcase, FileText } from 'lucide-react';
import { UserRecord } from '../types';

interface NavbarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  currentUser: UserRecord | null;
  shopName?: string;
  onLogout: () => void;
  onOpenBookingModal: (service?: string) => void;
  onOpenAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  setActivePage,
  currentUser,
  shopName,
  onLogout,
  onOpenBookingModal,
  onOpenAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (page: string) => {
    setActivePage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0e1117]/95 backdrop-blur-md border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Studio Brand */}
          <div 
            onClick={() => handleNavClick(currentUser?.role === 'employee' ? 'employee-dashboard' : currentUser?.role === 'admin' ? 'admin-dashboard' : 'home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5 text-slate-950 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  Snep<span className="text-amber-400">Studio</span>
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium -mt-0.5">
                Capture. Create. Cherish.
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {!currentUser ? (
              // --------------------------------------------------------
              // Public Navigation (Required: Home, Services, About, My Work, Login, Register)
              // --------------------------------------------------------
              <>
                <button
                  onClick={() => handleNavClick('home')}
                  className={`px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    activePage === 'home' ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => handleNavClick('services')}
                  className={`px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    activePage === 'services' ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Services
                </button>
                <button
                  onClick={() => handleNavClick('about')}
                  className={`px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    activePage === 'about' ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  About
                </button>
                <button
                  onClick={() => handleNavClick('my-work')}
                  className={`px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    activePage === 'my-work' ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  My Work
                </button>
                
                <div className="h-4 w-px bg-white/10 mx-2" />

                <button
                  onClick={() => handleNavClick('login')}
                  className={`px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    activePage === 'login' ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className={`px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    activePage === 'register' ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Register
                </button>
              </>
            ) : currentUser.role === 'employee' ? (
              // --------------------------------------------------------
              // Employee Navigation
              // --------------------------------------------------------
              <>
                <button
                  onClick={() => handleNavClick('employee-dashboard')}
                  className={`px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activePage === 'employee-dashboard' ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Employee Dashboard</span>
                </button>
                <button
                  onClick={() => handleNavClick('my-work')}
                  className={`px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    activePage === 'my-work' ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Studio Work Queue
                </button>
                <button
                  onClick={() => handleNavClick('photo-selection')}
                  className={`px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activePage === 'photo-selection' ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Client Proofing</span>
                </button>
              </>
            ) : currentUser.role === 'admin' ? (
              // --------------------------------------------------------
              // Admin Navigation
              // --------------------------------------------------------
              <>
                <button
                  onClick={() => handleNavClick('admin-dashboard')}
                  className={`px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activePage === 'admin-dashboard' ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Admin Dashboard</span>
                </button>
                <button
                  onClick={() => handleNavClick('services')}
                  className={`px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    activePage === 'services' ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Services
                </button>
                <button
                  onClick={() => handleNavClick('home')}
                  className={`px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    activePage === 'home' ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Studio Site
                </button>
              </>
            ) : (
              // --------------------------------------------------------
              // Customer Navigation
              // --------------------------------------------------------
              <>
                <button
                  onClick={() => handleNavClick('home')}
                  className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    activePage === 'home' ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => handleNavClick('services')}
                  className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    activePage === 'services' ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Services
                </button>
                <button
                  onClick={() => handleNavClick('about')}
                  className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    activePage === 'about' ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  About
                </button>
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    activePage === 'dashboard' ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => handleNavClick('my-bookings')}
                  className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    activePage === 'my-bookings' ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Bookings
                </button>
                <button
                  onClick={() => handleNavClick('my-work')}
                  className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    activePage === 'my-work' ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  My Work
                </button>
                <button
                  onClick={() => handleNavClick('upload')}
                  className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    activePage === 'upload' ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                </button>
              </>
            )}
          </div>

          {/* Right Area: User Badge / Actions / Book Now Button */}
          <div className="hidden sm:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-2 text-xs">
                  {currentUser.role === 'admin' ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  ) : currentUser.role === 'employee' ? (
                    <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span className="text-white font-semibold">{currentUser.name.split(' ')[0]}</span>
                  <span className="text-[10px] text-amber-400 font-mono uppercase bg-amber-400/10 px-1.5 py-0.5 rounded">
                    {currentUser.role}
                  </span>
                </div>

                <button
                  onClick={onLogout}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : null}

            {/* Book Now Button */}
            {currentUser?.role !== 'employee' && (
              <button
                onClick={() => onOpenBookingModal()}
                className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-full text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-[1.02] cursor-pointer"
              >
                Book Now
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => onOpenBookingModal()}
              className="sm:hidden bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-full text-xs"
            >
              Book
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#121620] border-b border-white/10 px-4 pt-3 pb-6 flex flex-col gap-1">
          {!currentUser ? (
            <>
              <button
                onClick={() => handleNavClick('home')}
                className={`text-left px-3 py-2.5 rounded-lg text-sm ${activePage === 'home' ? 'bg-amber-400/10 text-amber-400 font-bold' : 'text-slate-300'}`}
              >
                Home
              </button>
              <button
                onClick={() => handleNavClick('services')}
                className={`text-left px-3 py-2.5 rounded-lg text-sm ${activePage === 'services' ? 'bg-amber-400/10 text-amber-400 font-bold' : 'text-slate-300'}`}
              >
                Services
              </button>
              <button
                onClick={() => handleNavClick('about')}
                className={`text-left px-3 py-2.5 rounded-lg text-sm ${activePage === 'about' ? 'bg-amber-400/10 text-amber-400 font-bold' : 'text-slate-300'}`}
              >
                About
              </button>
              <button
                onClick={() => handleNavClick('my-work')}
                className={`text-left px-3 py-2.5 rounded-lg text-sm ${activePage === 'my-work' ? 'bg-amber-400/10 text-amber-400 font-bold' : 'text-slate-300'}`}
              >
                My Work
              </button>
              <div className="h-px bg-white/10 my-2" />
              <button
                onClick={() => handleNavClick('login')}
                className={`text-left px-3 py-2.5 rounded-lg text-sm ${activePage === 'login' ? 'bg-amber-400/10 text-amber-400 font-bold' : 'text-slate-300'}`}
              >
                Login
              </button>
              <button
                onClick={() => handleNavClick('register')}
                className={`text-left px-3 py-2.5 rounded-lg text-sm ${activePage === 'register' ? 'bg-amber-400/10 text-amber-400 font-bold' : 'text-slate-300'}`}
              >
                Register
              </button>
            </>
          ) : currentUser.role === 'employee' ? (
            <>
              <button
                onClick={() => handleNavClick('employee-dashboard')}
                className="text-left px-3 py-2.5 rounded-lg text-sm bg-amber-400/10 text-amber-400 font-bold"
              >
                Employee Dashboard
              </button>
              <button
                onClick={() => handleNavClick('my-work')}
                className="text-left px-3 py-2.5 rounded-lg text-sm text-slate-300"
              >
                Studio Work Queue
              </button>
              <button
                onClick={() => handleNavClick('photo-selection')}
                className="text-left px-3 py-2.5 rounded-lg text-sm text-slate-300"
              >
                Client Proofing
              </button>
              <button
                onClick={onLogout}
                className="text-left px-3 py-2.5 rounded-lg text-sm text-red-400 font-semibold"
              >
                Logout ({currentUser.name})
              </button>
            </>
          ) : currentUser.role === 'admin' ? (
            <>
              <button
                onClick={() => handleNavClick('admin-dashboard')}
                className="text-left px-3 py-2.5 rounded-lg text-sm bg-amber-400/10 text-amber-400 font-bold"
              >
                Admin Dashboard
              </button>
              <button
                onClick={() => handleNavClick('services')}
                className="text-left px-3 py-2.5 rounded-lg text-sm text-slate-300"
              >
                Services
              </button>
              <button
                onClick={() => handleNavClick('home')}
                className="text-left px-3 py-2.5 rounded-lg text-sm text-slate-300"
              >
                Studio Site
              </button>
              <button
                onClick={onLogout}
                className="text-left px-3 py-2.5 rounded-lg text-sm text-red-400 font-semibold"
              >
                Logout ({currentUser.name})
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNavClick('dashboard')}
                className="text-left px-3 py-2.5 rounded-lg text-sm bg-amber-400/10 text-amber-400 font-bold"
              >
                Dashboard
              </button>
              <button
                onClick={() => handleNavClick('my-bookings')}
                className="text-left px-3 py-2.5 rounded-lg text-sm text-slate-300"
              >
                My Bookings
              </button>
              <button
                onClick={() => handleNavClick('my-work')}
                className="text-left px-3 py-2.5 rounded-lg text-sm text-slate-300"
              >
                My Work
              </button>
              <button
                onClick={() => handleNavClick('upload')}
                className="text-left px-3 py-2.5 rounded-lg text-sm text-slate-300"
              >
                Upload Photo/Video
              </button>
              <button
                onClick={() => handleNavClick('services')}
                className="text-left px-3 py-2.5 rounded-lg text-sm text-slate-300"
              >
                Services
              </button>
              <button
                onClick={onLogout}
                className="text-left px-3 py-2.5 rounded-lg text-sm text-red-400 font-semibold"
              >
                Logout ({currentUser.name})
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
