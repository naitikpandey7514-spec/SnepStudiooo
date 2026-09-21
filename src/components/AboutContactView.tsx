import React, { useState } from 'react';
import { Camera, MapPin, Phone, Mail, Clock, ShieldCheck, Award, Heart, CheckCircle2, Send, Building2 } from 'lucide-react';
import { StudioShopProfile } from '../types';

interface AboutContactViewProps {
  initialTab?: 'about' | 'contact';
  shopProfile?: StudioShopProfile;
}

export const AboutContactView: React.FC<AboutContactViewProps> = ({ initialTab = 'about', shopProfile }) => {
  const [activeTab, setActiveTab] = useState<'about' | 'contact'>(initialTab);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setContactMessage('');
    }, 3000);
  };

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      
      {/* Tab Switcher */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex bg-[#12151e] border border-white/10 p-1.5 rounded-full text-xs">
          <button
            onClick={() => setActiveTab('about')}
            className={`px-6 py-2 rounded-full font-bold transition-all cursor-pointer ${
              activeTab === 'about'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            About SnepStudio
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-6 py-2 rounded-full font-bold transition-all cursor-pointer ${
              activeTab === 'contact'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Contact &amp; Studio Office
          </button>
        </div>
      </div>

      {activeTab === 'about' ? (
        <div className="space-y-16 animate-fade-in">
          
          {/* Hero Story Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
                Our Narrative &middot; Est. 2020
              </span>
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mt-2 mb-6">
                Capturing What Words Cannot Express
              </h1>
              <p className="text-slate-300 text-base leading-relaxed mb-6">
                <strong>SnepStudio</strong> is a premier creative photography and editing studio focused on capturing beautiful moments and turning them into lasting memories.
              </p>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                From delicate wedding rituals to striking editorial fashion portraits, our philosophy is anchored in authentic emotional truth. We don't just stage photographs; we wait for the unscripted glance, the tear of joy, and the burst of spontaneous laughter that defines human connection.
              </p>

              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10">
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-amber-400">500+</span>
                  <span className="text-[11px] text-slate-400 block mt-1">Weddings Covered</span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-amber-400">12k+</span>
                  <span className="text-[11px] text-slate-400 block mt-1">Photos Retouched</span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-amber-400">4.9/5</span>
                  <span className="text-[11px] text-slate-400 block mt-1">Client Satisfaction</span>
                </div>
              </div>
            </div>

            {/* Visual Photography Rig image */}
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/15 h-[420px]">
                <img
                  src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80"
                  alt="Studio photography gear setup"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Studio Equipment Arsenal */}
          <div className="bg-[#12151e] border border-white/10 rounded-3xl p-8 sm:p-12">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
                Optical Craftsmanship
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                Our Pro Equipment &amp; Color Pipeline
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                We believe that gear serves the art. We use industry-standard full-frame bodies and cinematic glass.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center font-bold mb-3">
                  <Camera className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-sm mb-1">Sony &amp; Canon Bodies</h4>
                <p className="text-slate-400 leading-relaxed">
                  Dual high-speed 50MP Sony A1 &amp; Canon Cinema full-frame sensors with dual card redundancy.
                </p>
              </div>

              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center font-bold mb-3">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-sm mb-1">Prime G-Master Lenses</h4>
                <p className="text-slate-400 leading-relaxed">
                  Creamy bokeh 35mm f/1.4, 50mm f/1.2, and 85mm f/1.4 prime optics for unmatched micro-contrast.
                </p>
              </div>

              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center font-bold mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-sm mb-1">Profoto Studio Strobes</h4>
                <p className="text-slate-400 leading-relaxed">
                  Color-temperature consistent B10X continuous and high-speed flash with large parabolic softboxes.
                </p>
              </div>

              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center font-bold mb-3">
                  <Heart className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-sm mb-1">DJI Cine Drone Aerial</h4>
                <p className="text-slate-400 leading-relaxed">
                  Hasselblad sensor 4K drone cinematography capturing majestic wedding venues and scenic vistas.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Contact Form & Studio Location */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-fade-in">
          
          {/* Studio Info (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#12151e] border border-white/10 rounded-3xl p-8 shadow-xl">
              <span className="text-amber-400 text-xs font-bold uppercase tracking-widest block mb-1">
                Get In Touch
              </span>
              <h2 className="text-2xl font-extrabold text-white mb-4">
                Visit or Contact SnepStudio
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                Have questions regarding custom wedding packages, travel shoots, or commercial video licensing? Our studio coordinators are here to assist.
              </p>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Physical Studio &amp; Office:</strong>
                    <span>
                      {shopProfile 
                        ? `${shopProfile.street_address}, ${shopProfile.landmark}, ${shopProfile.city}, ${shopProfile.state} - ${shopProfile.pincode}`
                        : 'Plot 42, Floor 2, Creative Arts Enclave, Off Linking Road, Near Starbucks & Mehboob Studios, Bandra West, Mumbai, Maharashtra - 400050'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <strong className="text-white block">Studio Hotline &amp; WhatsApp:</strong>
                    <span>{shopProfile?.phone_primary || '+91 98765 43210'} {shopProfile?.phone_secondary ? `· ${shopProfile.phone_secondary}` : ''}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <strong className="text-white block">Email:</strong>
                    <span>{shopProfile?.email || 'contact@snepstudio.com'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <strong className="text-white block">Working Hours:</strong>
                    <span>{shopProfile?.operating_hours || 'Monday – Sunday: 09:00 AM – 09:00 PM (Shoot crews 24/7 on request)'}</span>
                  </div>
                </div>

                {shopProfile?.gst_tin && (
                  <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                    <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <strong className="text-white block">GSTIN / Shop License:</strong>
                      <span className="font-mono">{shopProfile.gst_tin} &bull; Reg: {shopProfile.shop_reg_number}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-[#12151e] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Send Us an Inquiry</h3>
            <p className="text-slate-400 text-xs mb-6">
              We usually respond within 2 to 4 hours with shoot availability.
            </p>

            {sent ? (
              <div className="p-8 text-center bg-emerald-400/10 border border-emerald-400/30 rounded-2xl text-emerald-400">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2" />
                <h4 className="font-bold text-base">Message Sent!</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Thank you! Our studio team has received your note and will be in touch shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Rahul Verma"
                      className="w-full bg-[#181c27] border border-white/15 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#181c27] border border-white/15 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#181c27] border border-white/15 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Your Message / Shoot Inquiries
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Tell us about your wedding dates, shoot location, or editing requirements..."
                    className="w-full bg-[#181c27] border border-white/15 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-amber-400 placeholder:text-slate-600 leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Studio Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
