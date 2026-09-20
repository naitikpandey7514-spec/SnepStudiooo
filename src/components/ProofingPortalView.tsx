import React, { useState } from 'react';
import { 
  FolderCheck, 
  FolderArchive, 
  Clock, 
  CheckCircle2, 
  Send, 
  ArrowRight, 
  Camera, 
  Download, 
  Sparkles,
  Smartphone,
  Eye,
  Info
} from 'lucide-react';
import { ShootBatchRecord, UserRecord } from '../types';
import { PhotoSelectionProofingView } from './PhotoSelectionProofingView';

interface ProofingPortalViewProps {
  currentUser: UserRecord | null;
  shootBatches: ShootBatchRecord[];
  onUpdateBatch: (updatedBatch: ShootBatchRecord) => void;
  onNavigate: (page: string) => void;
}

export const ProofingPortalView: React.FC<ProofingPortalViewProps> = ({
  currentUser,
  shootBatches,
  onUpdateBatch,
  onNavigate,
}) => {
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(
    shootBatches.length > 0 ? shootBatches[0].id : null
  );

  const activeBatch = shootBatches.find((b) => b.id === selectedBatchId);

  const formatBytes = (bytes: number): string => {
    if (bytes >= 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    }
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // If viewing a specific batch detail for selection
  if (activeBatch) {
    return (
      <PhotoSelectionProofingView
        batch={activeBatch}
        onUpdateBatch={onUpdateBatch}
        onBackToBatches={() => setSelectedBatchId(null)}
      />
    );
  }

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#171b26] via-[#141824] to-[#10131d] border border-white/10 rounded-3xl p-8 sm:p-10 mb-10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 text-xs font-bold uppercase tracking-wider">
              Client Photo Selection &amp; Proofing
            </span>
            <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> 25GB Master Support
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Review &amp; Select Your Photoshoot Photos
          </h1>
          <p className="text-slate-300 text-sm mt-3 leading-relaxed">
            When our photographers complete your photoshoot, all high-resolution photos are uploaded in a single file and auto-compressed into a lightweight preview file for your phone or laptop.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-xs">
            <div className="bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl flex items-center gap-2 text-slate-200">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px]">✓</span>
              <span><strong>Check Button:</strong> Selects photo &amp; moves it into the New Selection File</span>
            </div>
            <div className="bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl flex items-center gap-2 text-slate-200">
              <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-[11px]">✕</span>
              <span><strong>Cross Button:</strong> Keeps photo in original file and moves it to the very bottom</span>
            </div>
          </div>
        </div>

        {/* Decorative backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Batch Cards Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-amber-400" />
            <span>Available Photoshoot Proofing Folders</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {shootBatches.length} Active Photoshoot{shootBatches.length === 1 ? '' : 's'}
          </span>
        </div>

        {shootBatches.length === 0 ? (
          <div className="py-20 text-center bg-[#131620] border border-white/10 rounded-3xl">
            <Camera className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No Photoshoot Folders Yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Once your photoshoot is completed by our photographers, your proofing folder will appear here automatically for photo selection.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shootBatches.map((batch) => {
              const selectedCount = batch.photos.filter((p) => p.selection_status === 'selected').length;
              const rejectedCount = batch.photos.filter((p) => p.selection_status === 'rejected').length;
              const pendingCount = batch.photos.filter((p) => p.selection_status === 'pending').length;

              return (
                <div
                  key={batch.id}
                  className="bg-[#131620] border border-white/10 hover:border-amber-400/40 rounded-2xl p-6 transition-all hover:shadow-xl group flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                          {batch.service_category}
                        </span>
                        <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                          {batch.shoot_title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Shot by <strong>{batch.employee_name}</strong> on {batch.created_at}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        {batch.status === 'submitted_to_admin' ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Submitted
                          </span>
                        ) : batch.status === 'review_in_progress' ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Selection In Progress
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Ready for Selection
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Photo Thumbnails Preview Row */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {batch.photos.slice(0, 4).map((p) => (
                        <div key={p.id} className="relative aspect-square rounded-lg overflow-hidden bg-slate-900 border border-white/10">
                          <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                          {p.selection_status === 'selected' && (
                            <div className="absolute inset-0 bg-emerald-500/40 flex items-center justify-center">
                              <span className="bg-emerald-500 text-slate-950 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">✓</span>
                            </div>
                          )}
                          {p.selection_status === 'rejected' && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="bg-rose-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">✕</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Compression Specs */}
                    <div className="bg-black/30 border border-white/5 rounded-xl p-3 text-xs space-y-1.5 mb-4">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-amber-400" /> Auto-Compressed Size:
                        </span>
                        <strong className="text-white font-mono">{formatBytes(batch.compressed_total_size_bytes)}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Original Master RAW Files:</span>
                        <span className="font-mono">{formatBytes(batch.original_total_size_bytes)} (Lossless)</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-300 font-medium">Selection Progress</span>
                        <span className="text-amber-400 font-mono font-bold">
                          {selectedCount} Selected / {batch.photos.length} Total
                        </span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden flex">
                        <div 
                          className="bg-emerald-500 h-full transition-all duration-300"
                          style={{ width: `${(selectedCount / batch.photos.length) * 100}%` }}
                        />
                        <div 
                          className="bg-rose-500/60 h-full transition-all duration-300"
                          style={{ width: `${(rejectedCount / batch.photos.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Open Proofing Folder Button */}
                  <button
                    onClick={() => setSelectedBatchId(batch.id)}
                    className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/10 group-hover:shadow-amber-500/20 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Open Photo Selection File</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
