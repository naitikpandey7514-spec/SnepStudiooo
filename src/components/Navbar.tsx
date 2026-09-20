import React, { useState } from 'react';
import { Camera, Menu, X, User, LogOut, Calendar, Image as ImageIcon, Sparkles, Upload, CheckSquare, ShieldCheck, Building2, Briefcase } from 'lucide-react';
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
            onClick={() => handleNavClick('home')}
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
              // Before Login
              <>
                <button
                  onClick={() => handleNavClick('home')}
                  className={`px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    activePage === 'home' ? 'text-amber-400 font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => handleNavClick('services')}
                  className={`px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    activePage === 'services' ? 'text-amber-400 font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Services
                </button>
                <button
                  onClick={() => handleNavClick('gallery')}
                  className={`px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    activePage === 'gallery' ? 'text-amber-400 font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Gallery
                </button>
                <button
                  onClick={() => handleNavClick('about')}
                  className={`px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    activePage === 'about' ? 'text-amber-400 font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  About
                </button>
                <button
                  onClick={() => handleNavClick('contact')}
                  className={`px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    activePage === 'contact' ? 'text-amber-400 font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Contact
                </button>
                <div className="h-4 w-px bg-white/10 mx-2" />
                <button
                  onClick={() => handleNavClick('login')}
                  className={`px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    activePage === 'login' ? 'text-amber-400 font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className={`px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    activePage === 'register' ? 'text-amber-400 font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Register
                </button>
              </>
            ) : (
              // After Customer Login
              <>
                <button
                  onClick={() => handleNavClick('home')}
                  className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    activePage === 'home' ? 'text-amber-400 font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => handleNavClick('services')}
                  className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    activePage === 'services' ? 'text-amber-400 font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Services
                </button>
                <button
                  onClick={() => handleNavClick('my-bookings')}
                  className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    activePage === 'my-bookings' ? 'text-amber-400 font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  My Bookings
                </button>
                <button
                  onClick={() => handleNavClick('my-work')}
                  className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    activePage === 'my-work' ? 'text-amber-400 font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  My Work
                </button>
                <button
                  onClick={() => handleNavClick('photo-selection')}
                  className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activePage === 'photo-selection' ? 'text-amber-400 font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Photo Selection</span>
                </button>
                <button
                  onClick={() => handleNavClick('edit-photos')}
                  className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activePage === 'edit-photos' ? 'text-amber-400 font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Edit Photos</span>
                </button>
                <button
                  onClick={() => handleNavClick('upload')}
                  className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activePage === 'upload' ? 'text-amber-400 font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                </button>
                <button
                  onClick={() => handleNavClick('profile')}
                  className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activePage === 'profile' ? 'text-amber-400 font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={onLogout}
                  className="px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>

          {/* Prominent Action Button: Book Now & Admin/Staff Button */}
          <div className="hidden sm:flex items-center gap-2">
            {(currentUser?.role === 'admin' || currentUser?.role === 'employee' || onOpenAdmin) && (
              <button
                onClick={onOpenAdmin}
                className="bg-white/10 hover:bg-white/15 text-amber-400 border border-amber-400/30 font-bold px-3.5 py-2 rounded-full text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="Open Studio Staff & Shop Management"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentUser?.role === 'admin' ? 'Studio Admin' : currentUser?.role === 'employee' ? 'Staff Portal' : 'Admin'}</span>
              </button>
            )}
            <button
              onClick={() => onOpenBookingModal()}
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-full text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-[1.02] cursor-pointer"
            >
              Book Now
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => onOpenBookingModal()}
              className="sm:hidden bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-full text-xs"
            >
              Book Now
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
                onClick={() => handleNavClick('gallery')}
                className={`text-left px-3 py-2.5 rounded-lg text-sm ${activePage === 'gallery' ? 'bg-amber-400/10 text-amber-400 font-bold' : 'text-slate-300'}`}
              >
                Gallery
              </button>
              <button
                onClick={() => handleNavClick('about')}
                className={`text-left px-3 py-2.5 rounded-lg text-sm ${activePage === 'about' ? 'bg-amber-400/10 text-amber-400 font-bold' : 'text-slate-300'}`}
              >
                About
              </button>
              <button
                onClick={() => handleNavClick('contact')}
                className={`text-left px-3 py-2.5 rounded-lg text-sm ${activePage === 'contact' ? 'bg-amber-400/10 text-amber-400 font-bold' : 'text-slate-300'}`}
              >
                Contact
              </button>
              <div className="h-px bg-white/10 my-2" />
              <button
                onClick={() => handleNavClick('login')}
                className="text-left px-3 py-2.5 rounded-lg text-sm text-slate-200"
              >
                Login
              </button>
              <button
                onClick={() => handleNavClick('register')}
                className="text-left px-3 py-2.5 rounded-lg text-sm text-amber-400 font-semibold"
              >
                Register
              </button>
            </>
          ) : (
            <>
              <div className="px-3 py-2 text-xs text-slate-400 border-b border-white/5 mb-1 flex items-center justify-between">
                <span>Signed in as <strong className="text-white">{currentUser.name}</strong></span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-400 uppercase">
                  {currentUser.role || 'Client'}
                </span>
              </div>
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
                onClick={() => handleNavClick('my-bookings')}
                className={`text-left px-3 py-2.5 rounded-lg text-sm ${activePage === 'my-bookings' ? 'bg-amber-400/10 text-amber-400 font-bold' : 'text-slate-300'}`}
              >
                My Bookings
              </button>
              <button
                onClick={() => handleNavClick('my-work')}
                className={`text-left px-3 py-2.5 rounded-lg text-sm ${activePage === 'my-work' ? 'bg-amber-400/10 text-amber-400 font-bold' : 'text-slate-300'}`}
              >
                My Work
              </button>
              <button
                onClick={() => handleNavClick('photo-selection')}
                className={`text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-2 ${activePage === 'photo-selection' ? 'bg-amber-400/10 text-amber-400 font-bold' : 'text-slate-300'}`}
              >
                <CheckSquare className="w-4 h-4 text-amber-400" />
                <span>Photo Selection &amp; Proofing</span>
              </button>
              <button
                onClick={() => handleNavClick('edit-photos')}
                className={`text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-2 ${activePage === 'edit-photos' ? 'bg-amber-400/10 text-amber-400 font-bold' : 'text-slate-300'}`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Edit Photos</span>
              </button>
              <button
                onClick={() => handleNavClick('upload')}
                className={`text-left px-3 py-2.5 rounded-lg text-sm ${activePage === 'upload' ? 'bg-amber-400/10 text-amber-400 font-bold' : 'text-slate-300'}`}
              >
                Upload Photos &amp; Videos
              </button>
              <button
                onClick={() => handleNavClick('profile')}
                className={`text-left px-3 py-2.5 rounded-lg text-sm ${activePage === 'profile' ? 'bg-amber-400/10 text-amber-400 font-bold' : 'text-slate-300'}`}
              >
                Profile
              </button>
              <div className="h-px bg-white/10 my-2" />
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3 py-2.5 rounded-lg text-sm text-red-400"
              >
                Logout
              </button>
            </>
          )}

          <div className="pt-2">
            <button
              onClick={() => {
                onOpenBookingModal();
                setMobileMenuOpen(false);
              }}
              className="w-full bg-amber-400 text-slate-950 font-bold py-3 rounded-lg text-center text-sm"
            >
              Book Now
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
