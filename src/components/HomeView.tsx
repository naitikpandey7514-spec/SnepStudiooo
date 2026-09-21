import React from 'react';
import { Camera, ArrowRight, Sparkles, CheckCircle2, Star, Calendar, Download, Film, ShieldCheck, CheckSquare, FolderCheck, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { STUDIO_SERVICES, GALLERY_ITEMS, TESTIMONIALS } from '../data/photographyData';
import { StudioShopProfile } from '../types';

interface HomeViewProps {
  onNavigate: (page: string) => void;
  onOpenBookingModal: (service?: string) => void;
  onOpenGalleryItem?: (photo: any) => void;
  shopProfile?: StudioShopProfile;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onOpenBookingModal,
  onOpenGalleryItem,
  shopProfile,
}) => {
  return (
    <div className="flex flex-col bg-[#0b0d12] text-slate-100 selection:bg-amber-400 selection:text-slate-950">
      
      {/* ============================================================== */}
      {/* 1. HERO SECTION                                                */}
      {/* ============================================================== */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Rich Photography Hero Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=2000&q=80')`
          }}
        >
          {/* Subtle multi-stop gradient for maximum text legibility & studio atmosphere */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d12] via-[#0b0d12]/75 to-black/60" />
          <div className="absolute inset-0 bg-radial from-transparent via-[#0b0d12]/40 to-[#0b0d12]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center flex flex-col items-center">
          
          {/* Subtle Studio Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-6 animate-fade-in shadow-xl">
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>Photography, Photoshoots &amp; Professional Editing</span>
          </div>

          {/* Primary Hero Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6 drop-shadow-md">
            Capture Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500">Moments</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl text-slate-200 font-light max-w-3xl mb-4 leading-relaxed drop-shadow">
            Professional Photography, Creative Editing &amp; Beautiful Memories
          </p>

          {/* Small line requested by user */}
          <p className="text-sm sm:text-base text-amber-400/90 font-serif italic tracking-wide mb-10">
            Your memories. Our creativity.
          </p>

          {/* Call-to-action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => onOpenBookingModal()}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold px-8 py-4 rounded-full text-sm uppercase tracking-wider transition-all shadow-xl shadow-amber-500/20 hover:scale-[1.03] cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Book a Photoshoot</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              onClick={() => onNavigate('photo-selection')}
              className="w-full sm:w-auto bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold px-7 py-4 rounded-full text-sm transition-all hover:scale-[1.03] cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckSquare className="w-4 h-4 text-amber-400" />
              <span>Client Photo Selection (Proofing)</span>
            </button>

            <button
              onClick={() => onNavigate('services')}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 font-bold px-7 py-4 rounded-full text-sm transition-all hover:scale-[1.03] cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Explore Services</span>
            </button>
          </div>

          {/* Quality Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10 mt-16 pt-10 border-t border-white/10 w-full text-left">
            <div>
              <div className="text-amber-400 font-black text-2xl sm:text-3xl">4K UHD</div>
              <div className="text-xs text-slate-400 mt-0.5">Ultra High Resolution Deliverables</div>
            </div>
            <div>
              <div className="text-amber-400 font-black text-2xl sm:text-3xl">48-Hour</div>
              <div className="text-xs text-slate-400 mt-0.5">Rapid Post-Production Turnaround</div>
            </div>
            <div>
              <div className="text-amber-400 font-black text-2xl sm:text-3xl">100%</div>
              <div className="text-xs text-slate-400 mt-0.5">Color-Calibrated Master Retouching</div>
            </div>
            <div>
              <div className="text-amber-400 font-black text-2xl sm:text-3xl">500+</div>
              <div className="text-xs text-slate-400 mt-0.5">Weddings &amp; Shoots Completed</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. OUR SERVICES SECTION                                        */}
      {/* ============================================================== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
            Studio Offerings
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2 mb-4">
            Our Photography &amp; Editing Services
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Whether framing the intimacy of your wedding day, crafting cinematic reels, or refining high-fashion portraits, we bring dedication and artistic vision to every shoot.
          </p>
        </div>

        {/* 5 Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {STUDIO_SERVICES.map((srv, idx) => (
            <div
              key={srv.id}
              className={`group bg-[#131620] border border-white/10 hover:border-amber-400/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between ${
                idx === 1 ? 'md:col-span-2 lg:col-span-1 border-amber-400/30' : ''
              }`}
            >
              <div>
                {/* Photo container */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={srv.image}
                    alt={srv.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#131620] via-transparent to-black/30" />
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full text-xs font-bold text-amber-400">
                    {srv.price}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors mb-2">
                    {srv.name}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-5">
                    {srv.description}
                  </p>

                  <ul className="space-y-2 mb-6">
                    {srv.features.slice(0, 3).map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom action */}
              <div className="px-6 pb-6 pt-2 border-t border-white/5 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  <span className="block text-[10px] uppercase text-slate-500">Starting at</span>
                  <span className="font-extrabold text-amber-400 text-base">₹{srv.numericPrice.toLocaleString()}</span>
                </div>

                <button
                  onClick={() => onOpenBookingModal(srv.name)}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-md hover:scale-[1.02]"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. WEDDING & PRE-WEDDING SPOTLIGHT                             */}
      {/* ============================================================== */}
      <section className="py-20 bg-gradient-to-b from-[#10131b] to-[#0b0d12] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Visual Mosaic */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 h-64">
                    <img
                      src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"
                      alt="Wedding vows ceremony"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 h-44">
                    <img
                      src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80"
                      alt="Henna ritual celebration"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-8">
                  <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 h-44">
                    <img
                      src="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80"
                      alt="Romantic pre-wedding couple"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 h-64">
                    <img
                      src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80"
                      alt="Couple lake portrait"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>

              {/* Floating Award Emblem */}
              <div className="absolute -bottom-6 -right-4 sm:bottom-6 sm:right-6 bg-amber-400 text-slate-950 p-4 rounded-2xl shadow-2xl border-4 border-[#0b0d12] flex items-center gap-3">
                <Star className="w-6 h-6 fill-slate-950" />
                <div>
                  <div className="font-black text-sm uppercase">Award-Winning</div>
                  <div className="text-[11px] font-medium opacity-90">Wedding &amp; Couple Cinematography</div>
                </div>
              </div>
            </div>

            {/* Narrative Content */}
            <div className="flex flex-col items-start">
              <span className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">
                Weddings &amp; Pre-Weddings
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-6">
                Cherish the Magic of Your Special Day
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                Your wedding isn't just an event; it's a sacred symphony of fleeting looks, joyful laughter, and shared tears. We believe in capturing raw, honest sentiment with cinematic grace.
              </p>

              <div className="space-y-4 mb-8 w-full">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
                    W
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Wedding Shoot &mdash; ₹9,999</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Full-day cinematic coverage, dual cameras, 4K aerial drone, and custom digital heirloom album.
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
                    P
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Pre-Wedding Shoot &mdash; ₹4,999</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Romantic outdoor destinations, sunset golden hour lighting, creative styling, and music reel cut.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => onOpenBookingModal('Wedding Shoot')}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/15 cursor-pointer"
                >
                  Book Wedding Shoot
                </button>
                <button
                  onClick={() => onOpenBookingModal('Pre-Wedding Shoot')}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/15 font-bold px-6 py-3 rounded-full text-xs transition-all cursor-pointer"
                >
                  Book Pre-Wedding Shoot
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. ONLINE PHOTO EDITOR CALLOUT                                 */}
      {/* ============================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-r from-[#171b26] to-[#0f121a] p-8 sm:p-12 lg:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simple In-Browser Photo Editor</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                Enhance Your Photos Instantly in Your Browser
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                No complex software needed. Adjust brightness, contrast, saturation, rotate, crop, or apply signature artistic filters like Vintage, Warm, Cool, Sepia, and Black &amp; White with live before/after comparison.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-8 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>Interactive Before / After</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>Vintage &amp; B&amp;W Presets</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>Brightness &amp; Contrast</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>1-Click High-Res Download</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => onNavigate('edit-photos')}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Launch Photo Editor</span>
                </button>
                <button
                  onClick={() => onNavigate('video-editing')}
                  className="text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer underline underline-offset-4"
                >
                  <span>Need Video Editing?</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Visual Editor Demonstration Graphic */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black">
                <img
                  src="https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1000&q=80"
                  alt="Photo color grading suite preview"
                  className="w-full h-72 sm:h-80 object-cover"
                />
                <div className="p-4 bg-[#12151e] border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Real-time Canvas Rendering</span>
                  </div>
                  <span className="text-[11px] text-amber-400 font-mono">Original vs Edited Split</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. HOW IT WORKS (4 STEPS)                                      */}
      {/* ============================================================== */}
      <section className="py-20 bg-[#0d1017] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
              Simple 4-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2 mb-4">
              How SnepStudio Works
            </h2>
            <p className="text-slate-400 text-sm">
              We made booking shoots and requesting media edits completely straightforward.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                num: '01',
                title: 'Choose a Service',
                desc: 'Select from portraits, wedding shoots, pre-weddings, photo retouching, or video editing.'
              },
              {
                num: '02',
                title: 'Photographer Shoots & Sends',
                desc: 'Employee uploads all shoot RAW photos (up to 25 GB) in one folder, auto-compressed for quick phone/laptop review.'
              },
              {
                num: '03',
                title: 'Client Check & Cross Proofing',
                desc: 'Client taps Check (moves to Selected album) or Cross (moves to end of original file) and sends selections back.'
              },
              {
                num: '04',
                title: 'Master Edit & Final Delivery',
                desc: 'Studio artists polish the selected RAW masters and deliver high-res heirloom downloads with tax invoice.'
              }
            ].map(step => (
              <div 
                key={step.num}
                className="bg-[#141822] border border-white/10 hover:border-amber-400/40 p-6 rounded-2xl relative transition-all group"
              >
                <div className="text-4xl font-black text-amber-400/20 group-hover:text-amber-400/40 transition-colors mb-4 font-mono">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. FEATURED GALLERY PREVIEW                                    */}
      {/* ============================================================== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
              Visual Portfolio
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
              Featured Gallery
            </h2>
          </div>

          <button
            onClick={() => onNavigate('gallery')}
            className="text-amber-400 hover:text-amber-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
          >
            <span>View All Works ({GALLERY_ITEMS.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GALLERY_ITEMS.slice(0, 6).map(photo => (
            <div
              key={photo.id}
              onClick={() => onOpenGalleryItem ? onOpenGalleryItem(photo) : onNavigate('gallery')}
              className="group relative h-72 rounded-2xl overflow-hidden border border-white/10 cursor-pointer shadow-lg"
            >
              <img
                src={photo.image}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1">
                  {photo.category}
                </span>
                <h4 className="text-white font-bold text-base">{photo.title}</h4>
                <p className="text-xs text-slate-300 mt-1">{photo.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 7. CLIENT TESTIMONIALS                                         */}
      {/* ============================================================== */}
      <section className="py-20 bg-[#0d1017] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
              Heartfelt Words
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2 mb-3">
              Loved by Our Clients
            </h2>
            <p className="text-slate-400 text-sm">
              Real stories from people whose special milestones we had the honor to frame.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="bg-[#141822] border border-white/10 p-6 rounded-2xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed italic mb-6">
                    &ldquo;{t.text}&rdquo;
                  </p>
                </div>

                <div className="border-t border-white/10 pt-4 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-bold text-white">{t.name}</h5>
                    <span className="text-[11px] text-amber-400">{t.service}</span>
                  </div>
                  <span className="text-[11px] text-slate-500">{t.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 8. STUDIO HEADQUARTERS & VISIT US                              */}
      {/* ============================================================== */}
      <section className="py-20 bg-[#090b10] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
              Visit Our Flagship Studio
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2 mb-3">
              Studio Location &amp; Contact Info
            </h2>
            <p className="text-slate-400 text-sm">
              Walk into our state-of-the-art studio for wedding consultations, portrait sessions, or portfolio screenings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Address Card */}
            <div className="bg-[#121620] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-amber-400/40 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center font-bold mb-4">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                  Studio Address
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {shopProfile 
                    ? `${shopProfile.street_address}, ${shopProfile.landmark}, ${shopProfile.city}, ${shopProfile.state} - ${shopProfile.pincode}`
                    : 'Plot 42, Floor 2, Creative Arts Enclave, Off Linking Road, Near Starbucks & Mehboob Studios, Bandra West, Mumbai, Maharashtra - 400050'}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-white/5 text-[11px] text-amber-400 font-semibold">
                Bandra West, Mumbai
              </div>
            </div>

            {/* Phone Card */}
            <div className="bg-[#121620] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-amber-400/40 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center font-bold mb-4">
                  <Phone className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                  Hotline &amp; WhatsApp
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed mb-1">
                  Connect directly with our senior shoot director or reservation desk.
                </p>
                <a 
                  href={`tel:${shopProfile?.phone_primary || '+919876543210'}`}
                  className="font-mono font-bold text-amber-400 text-sm hover:underline block mt-2"
                >
                  {shopProfile?.phone_primary || '+91 98765 43210'}
                </a>
              </div>
              <div className="pt-4 mt-4 border-t border-white/5 text-[11px] text-slate-400">
                Direct Hotline &amp; WhatsApp Call
              </div>
            </div>

            {/* Email Card */}
            <div className="bg-[#121620] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-amber-400/40 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center font-bold mb-4">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                  Official Email
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed mb-1">
                  Send wedding briefs, raw footage links, or commercial inquiries.
                </p>
                <a 
                  href={`mailto:${shopProfile?.email || 'contact@snepstudio.com'}`}
                  className="font-mono font-bold text-amber-400 text-xs hover:underline block mt-2 break-all"
                >
                  {shopProfile?.email || 'contact@snepstudio.com'}
                </a>
              </div>
              <div className="pt-4 mt-4 border-t border-white/5 text-[11px] text-slate-400">
                2-4 Hour Response Time
              </div>
            </div>

            {/* Working Hours Card */}
            <div className="bg-[#121620] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-amber-400/40 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center font-bold mb-4">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                  Operating Hours
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {shopProfile?.operating_hours || 'Monday – Sunday: 09:00 AM – 09:00 PM (Shoot crews 24/7 on request)'}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-white/5 flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Open 7 Days a Week</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 9. CALL TO ACTION BANNER                                       */}
      {/* ============================================================== */}
      <section className="relative py-24 overflow-hidden border-t border-white/10">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&w=1800&q=80')`
          }}
        >
          <div className="absolute inset-0 bg-[#0b0d12]/90 backdrop-blur-xs" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-3 inline-block">
            Start Your Visual Journey
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-6">
            Ready to Capture Something Beautiful?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Reserve your shoot date today with transparent fixed pricing and guaranteed 48-hour preview deliverables.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onOpenBookingModal()}
              className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-8 py-4 rounded-full text-xs uppercase tracking-wider transition-all shadow-xl shadow-amber-500/25 cursor-pointer"
            >
              Book a Photoshoot Now
            </button>
            <button
              onClick={() => onNavigate('edit-photos')}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-8 py-4 rounded-full text-xs transition-all cursor-pointer"
            >
              Try Online Photo Editor
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
