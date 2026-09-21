import React from 'react';
import { Camera, MapPin, Phone, Mail, Instagram, Facebook, Youtube, Shield } from 'lucide-react';
import { StudioShopProfile } from '../types';

interface FooterProps {
  onNavigate: (page: string) => void;
  onOpenAdmin: () => void;
  shopProfile?: StudioShopProfile;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAdmin, shopProfile }) => {
  return (
    <footer className="bg-[#090b0e] text-slate-400 border-t border-white/10 pt-16 pb-12 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <div 
              onClick={() => { onNavigate('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex items-center gap-3 cursor-pointer group mb-4"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-400/20">
                <Camera className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <span className="font-extrabold text-2xl tracking-tight text-white">
                  {shopProfile?.shop_name ? (
                    <span>{shopProfile.shop_name.split(' ')[0]}<span className="text-amber-400">{shopProfile.shop_name.split(' ').slice(1).join(' ') || 'Studio'}</span></span>
                  ) : (
                    <span>Snep<span className="text-amber-400">Studio</span></span>
                  )}
                </span>
                <p className="text-xs uppercase tracking-widest text-slate-500 font-medium">
                  {shopProfile?.tagline || 'Capture. Create. Cherish.'}
                </p>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed text-sm mb-6 max-w-sm">
              SnepStudio is a premier photography and creative editing studio dedicated to immortalizing your most sacred emotions, grand celebrations, and visual stories with timeless artistry.
            </p>

            <div className="flex items-center gap-3">
              <a href="#instagram" className="w-9 h-9 rounded-full bg-white/5 hover:bg-amber-400 hover:text-slate-950 text-slate-300 flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#facebook" className="w-9 h-9 rounded-full bg-white/5 hover:bg-amber-400 hover:text-slate-950 text-slate-300 flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#youtube" className="w-9 h-9 rounded-full bg-white/5 hover:bg-amber-400 hover:text-slate-950 text-slate-300 flex items-center justify-center transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button 
                  onClick={() => { onNavigate('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onNavigate('services'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Services
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onNavigate('gallery'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Gallery
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onNavigate('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  About
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onNavigate('contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
              Services
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button 
                  onClick={() => { onNavigate('services'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Photography
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onNavigate('services'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Wedding Shoot
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onNavigate('services'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Pre-Wedding
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onNavigate('edit-photos'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Photo Editing
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onNavigate('photo-selection'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left flex items-center gap-1 text-amber-300"
                >
                  Photo Selection (Proofing)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onNavigate('video-editing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Video Editing
                </button>
              </li>
            </ul>
          </div>

          {/* Studio Contact Info */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
              Studio Location
            </h4>
            <div className="space-y-3 text-xs leading-relaxed">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  {shopProfile 
                    ? `${shopProfile.street_address}, ${shopProfile.landmark}, ${shopProfile.city}, ${shopProfile.state} - ${shopProfile.pincode}`
                    : 'Plot 42, Floor 2, Creative Arts Enclave, Off Linking Road, Near Starbucks & Mehboob Studios, Bandra West, Mumbai, Maharashtra - 400050'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`tel:${shopProfile?.phone_primary || '+919876543210'}`} className="hover:text-amber-400 transition-colors">
                  {shopProfile?.phone_primary || '+91 98765 43210'}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`mailto:${shopProfile?.email || 'contact@snepstudio.com'}`} className="hover:text-amber-400 transition-colors">
                  {shopProfile?.email || 'contact@snepstudio.com'}
                </a>
              </div>
              <div className="text-[11px] text-slate-500 pt-1">
                {shopProfile?.operating_hours || 'Monday – Sunday: 09:00 AM – 09:00 PM (Shoot crews 24/7 on request)'}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; 2026 SnepStudio. All Rights Reserved.
          </div>

          <div className="flex items-center gap-6">
            <span className="text-slate-400 font-medium">Capture. Create. Cherish.</span>
            
            {/* Discreet Admin Login Access */}
            <button
              onClick={onOpenAdmin}
              className="text-slate-600 hover:text-amber-400/80 transition-colors flex items-center gap-1.5 cursor-pointer text-[11px]"
              title="Studio Administrative Control Panel"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Studio Staff</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
