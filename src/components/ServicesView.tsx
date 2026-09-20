import React from 'react';
import { CheckCircle2, Clock, Sparkles, ArrowRight, ShieldCheck, Camera } from 'lucide-react';
import { STUDIO_SERVICES } from '../data/photographyData';

interface ServicesViewProps {
  onOpenBookingModal: (service?: string) => void;
  onNavigate: (page: string) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  onOpenBookingModal,
  onNavigate,
}) => {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
          Transparent Rates &middot; Uncompromising Quality
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mt-2 mb-4">
          Our Photography &amp; Creative Services
        </h1>
        <p className="text-slate-400 text-base leading-relaxed">
          From full-day wedding coverage to swift in-browser color correction, discover our transparent packages tailored for memories that last forever.
        </p>
      </div>

      {/* Services List */}
      <div className="space-y-16">
        {STUDIO_SERVICES.map((srv, idx) => {
          const isEven = idx % 2 === 1;

          return (
            <div
              key={srv.id}
              className={`bg-[#12151e] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col ${
                isEven ? 'lg:flex-row-reverse' : 'lg:flex-row'
              } items-stretch transition-all hover:border-amber-400/40`}
            >
              {/* Photo Banner */}
              <div className="lg:w-1/2 relative min-h-[320px] sm:min-h-[400px]">
                <img
                  src={srv.image}
                  alt={srv.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12151e] via-transparent to-black/30 lg:hidden" />
                
                {/* Floating Tag */}
                <div className="absolute top-6 left-6 bg-black/80 backdrop-blur-md border border-white/15 px-4 py-1.5 rounded-full text-xs font-bold text-amber-400 shadow-xl">
                  {srv.price}
                </div>
              </div>

              {/* Text Specs */}
              <div className="lg:w-1/2 p-8 sm:p-12 flex flex-col justify-between">
                <div>
                  <div className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-2">
                    Service #{idx + 1}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                    {srv.name}
                  </h2>
                  <p className="text-slate-400 text-sm font-medium mb-4 italic">
                    {srv.tagline}
                  </p>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6">
                    {srv.description}
                  </p>

                  {/* Included bullets */}
                  <div className="mb-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      What is Included:
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                      {srv.features.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Deliverables and Turnaround badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-white/10 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Deliverables:</span>
                      <span className="font-semibold text-white">{srv.deliverables}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">Turnaround:</span>
                      <span className="font-semibold text-amber-300 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {srv.turnaround}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => onOpenBookingModal(srv.name)}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    Book {srv.name}
                  </button>

                  {srv.id === 'photo-editing' && (
                    <button
                      onClick={() => onNavigate('edit-photos')}
                      className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3 rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Launch In-Browser Editor</span>
                    </button>
                  )}

                  {srv.id === 'video-editing' && (
                    <button
                      onClick={() => onNavigate('video-editing')}
                      className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3 rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Upload Video Footage</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
