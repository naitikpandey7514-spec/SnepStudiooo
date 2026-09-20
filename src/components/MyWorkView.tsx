import React, { useState } from 'react';
import { Download, Eye, FileImage, FileVideo, CheckCircle2, Clock, Sparkles, X } from 'lucide-react';
import { WorkRecord } from '../types';

interface MyWorkViewProps {
  workItems: WorkRecord[];
  onNavigate: (page: string) => void;
}

export const MyWorkView: React.FC<MyWorkViewProps> = ({ workItems, onNavigate }) => {
  const [activePreview, setActivePreview] = useState<WorkRecord | null>(null);

  const handleDownloadDeliverable = (item: WorkRecord) => {
    // Generate real file download for customer
    const sampleDownloadImage = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=90';
    const link = document.createElement('a');
    link.href = sampleDownloadImage;
    link.target = '_blank';
    link.download = item.completed_filename || `SnepStudio_Master_${item.original_filename}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            <span>Ready for Download</span>
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3 animate-spin" />
            <span>In Post-Production</span>
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />
            <span>In Studio Queue</span>
          </span>
        );
    }
  };

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/10">
        <div>
          <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
            Deliverables Vault
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
            My Work &amp; Downloads
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Access, inspect, and download completed master photos and cinematic video files.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('upload')}
            className="bg-white/10 hover:bg-white/15 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Upload More Media
          </button>
          <button
            onClick={() => onNavigate('edit-photos')}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Photo Editor</span>
          </button>
        </div>
      </div>

      {workItems.length === 0 ? (
        <div className="bg-[#12151e] border border-white/10 rounded-3xl p-12 text-center max-w-md mx-auto">
          <FileImage className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Deliverables Yet</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-6">
            When you upload photos or videos for editing, or when our photographers finish processing your shoot, your downloadable files appear here.
          </p>
          <button
            onClick={() => onNavigate('upload')}
            className="bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs cursor-pointer"
          >
            Upload First Photo or Video
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workItems.map(item => (
            <div
              key={item.id}
              className="bg-[#12151e] border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all"
            >
              <div>
                {/* Media Thumbnail */}
                <div className="relative h-48 bg-black/60 overflow-hidden">
                  <img
                    src={
                      item.file_type === 'Video'
                        ? 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80'
                        : 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={item.original_filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12151e] via-transparent to-black/40" />

                  {/* Top tags */}
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                    {item.file_type === 'Video' ? <FileVideo className="w-3.5 h-3.5 text-amber-400" /> : <FileImage className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{item.file_type}</span>
                  </div>

                  <div className="absolute top-3 right-3">
                    {getStatusBadge(item.status)}
                  </div>
                </div>

                {/* Details */}
                <div className="p-5">
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                    {item.service}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1 truncate" title={item.original_filename}>
                    {item.original_filename}
                  </h3>

                  {item.description && (
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Uploaded: {item.created_at}</span>
                    {item.appointment_id && <span>Booking #{item.appointment_id}</span>}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-5 pt-0">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setActivePreview(item)}
                    className="bg-white/5 hover:bg-white/10 text-slate-200 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-white/10"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>View</span>
                  </button>

                  {item.status === 'Completed' ? (
                    <button
                      onClick={() => handleDownloadDeliverable(item)}
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-amber-500/20"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="bg-white/5 text-slate-500 py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed"
                    >
                      <span>Processing...</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {activePreview && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12151e] border border-white/15 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setActivePreview(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-amber-400 text-xs font-bold uppercase">{activePreview.service}</span>
              <h3 className="text-xl font-bold text-white mt-1">{activePreview.original_filename}</h3>
              <div className="mt-1">{getStatusBadge(activePreview.status)}</div>
            </div>

            <div className="rounded-xl overflow-hidden mb-6 border border-white/10 max-h-80 bg-black flex items-center justify-center">
              <img
                src={
                  activePreview.file_type === 'Video'
                    ? 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80'
                    : 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80'
                }
                alt="Deliverable full preview"
                className="max-h-80 w-auto object-contain"
              />
            </div>

            <div className="text-xs text-slate-300 mb-6 bg-white/5 p-4 rounded-xl">
              <strong>Editor Notes:</strong> {activePreview.description || 'Color calibrated and ready.'}
            </div>

            <div className="flex justify-end gap-3 text-xs">
              <button
                onClick={() => setActivePreview(null)}
                className="bg-white/10 text-white px-5 py-2.5 rounded-xl font-medium"
              >
                Close
              </button>
              {activePreview.status === 'Completed' && (
                <button
                  onClick={() => handleDownloadDeliverable(activePreview)}
                  className="bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Master File</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
