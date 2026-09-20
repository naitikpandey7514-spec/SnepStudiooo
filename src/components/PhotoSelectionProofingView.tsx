import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Send, 
  Download, 
  FolderCheck, 
  FolderArchive, 
  Smartphone, 
  Sparkles, 
  Maximize2, 
  Undo2, 
  CheckCircle2, 
  ChevronRight,
  Info,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ShootBatchRecord, ShootPhotoItem } from '../types';

interface PhotoSelectionProofingViewProps {
  batch: ShootBatchRecord;
  onUpdateBatch: (updatedBatch: ShootBatchRecord) => void;
  onBackToBatches?: () => void;
}

export const PhotoSelectionProofingView: React.FC<PhotoSelectionProofingViewProps> = ({
  batch,
  onUpdateBatch,
  onBackToBatches,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'selected' | 'unselected'>('all');
  const [previewPhoto, setPreviewPhoto] = useState<ShootPhotoItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackNotes, setFeedbackNotes] = useState(batch.client_feedback_notes || '');
  const [showSuccessBanner, setShowSuccessBanner] = useState(batch.status === 'submitted_to_admin');

  // Compute selected vs unselected / rejected counts
  const selectedPhotos = batch.photos.filter((p) => p.selection_status === 'selected');
  // In our rule: photos that user crosses (rejected) or are pending remain in the main set,
  // and rejected ones are sorted to the bottom/end of the file as requested by user!
  const rejectedPhotos = batch.photos.filter((p) => p.selection_status === 'rejected');
  const pendingPhotos = batch.photos.filter((p) => p.selection_status === 'pending');

  // Sorted list as requested:
  // "if we click on check button it directly selected and move to one file and the photo we cross it move to same file in the last not in the new file."
  const mainFilePhotos = [...pendingPhotos, ...rejectedPhotos];

  // Helper formatting size
  const formatBytes = (bytes: number): string => {
    if (bytes >= 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    }
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Action: Check (Select) -> moves to Selected File
  const handleCheck = (photoId: string) => {
    const updatedPhotos = batch.photos.map((p) => {
      if (p.id === photoId) {
        return {
          ...p,
          selection_status: 'selected' as const,
          selected_at: new Date().toISOString(),
        };
      }
      return p;
    });

    onUpdateBatch({
      ...batch,
      photos: updatedPhotos,
      status: batch.status === 'sent_to_customer' ? 'review_in_progress' : batch.status,
    });
  };

  // Action: Cross (Reject) -> stays in original file, moved to the last!
  const handleCross = (photoId: string) => {
    // Find and update photo
    const target = batch.photos.find((p) => p.id === photoId);
    if (!target) return;

    const updatedTarget: ShootPhotoItem = {
      ...target,
      selection_status: 'rejected',
    };

    // Remove from current position and put in the list
    const otherPhotos = batch.photos.filter((p) => p.id !== photoId);
    // Put at the very end of the batch photos array so it moves to the end of the file
    const newPhotosList = [...otherPhotos, updatedTarget];

    onUpdateBatch({
      ...batch,
      photos: newPhotosList,
      status: batch.status === 'sent_to_customer' ? 'review_in_progress' : batch.status,
    });
  };

  // Reset to pending
  const handleReset = (photoId: string) => {
    const updatedPhotos = batch.photos.map((p) => {
      if (p.id === photoId) {
        return {
          ...p,
          selection_status: 'pending' as const,
        };
      }
      return p;
    });

    onUpdateBatch({
      ...batch,
      photos: updatedPhotos,
    });
  };

  // Submit final selected album to Admin / Photographer
  const handleSubmitToAdmin = () => {
    if (selectedPhotos.length === 0) {
      alert('Please select at least 1 photo using the Check button before sending to the studio!');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onUpdateBatch({
        ...batch,
        status: 'submitted_to_admin',
        customer_submitted_at: new Date().toISOString().split('T')[0],
        client_feedback_notes: feedbackNotes,
      });
      setIsSubmitting(false);
      setShowSuccessBanner(true);
    }, 700);
  };

  // Download compressed batch for phone/laptop
  const handleDownloadCompressedPackage = () => {
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(
        {
          package: `${batch.shoot_title} - Mobile/Laptop Compressed Proofing Set`,
          total_photos: batch.photos.length,
          compressed_size: formatBytes(batch.compressed_total_size_bytes),
          original_raw_size: formatBytes(batch.original_total_size_bytes),
          photos: batch.photos.map((p) => ({
            id: p.id,
            name: p.name,
            preview_url: p.url,
            status: p.selection_status,
          })),
        },
        null,
        2
      )
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${batch.shoot_title.replace(/\s+/g, '_')}_QuickPreview_Package.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span 
            onClick={onBackToBatches}
            className="hover:text-amber-400 cursor-pointer font-medium"
          >
            Proofing Folders
          </span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-amber-400 font-bold">{batch.shoot_title}</span>
          <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] text-slate-300 font-mono">
            ID: {batch.id}
          </span>
        </div>

        {onBackToBatches && (
          <button
            onClick={onBackToBatches}
            className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            ← View All Shoot Folders
          </button>
        )}
      </div>

      {/* Main Shoot Batch Header Banner */}
      <div className="bg-gradient-to-r from-[#171b26] via-[#141824] to-[#10131d] border border-white/10 rounded-3xl p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-400 text-[11px] font-bold tracking-wide uppercase">
                  {batch.service_category}
                </span>
                <span className="text-slate-400 text-xs">
                  Photographer: <strong className="text-white font-medium">{batch.employee_name}</strong>
                </span>
                <span className="text-slate-500 text-xs">•</span>
                <span className="text-slate-400 text-xs">
                  Shoot Date: <strong className="text-white font-medium">{batch.created_at}</strong>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {batch.shoot_title}
              </h1>

              {/* Compression Engine Notice */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-xl text-xs">
                  <Smartphone className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>
                    Auto-Compressed: <strong>{formatBytes(batch.compressed_total_size_bytes)}</strong>{' '}
                    <span className="text-emerald-400/80">(Optimized from {formatBytes(batch.original_total_size_bytes)} Master RAW for zero lag)</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-300 px-3 py-1.5 rounded-xl text-xs">
                  <Sparkles className="w-4 h-4 shrink-0 text-blue-400" />
                  <span>
                    Lossless Master: <strong>Original 25GB quality preserved</strong> on studio server
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Download for Phone/Laptop */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={handleDownloadCompressedPackage}
                className="bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:border-amber-400/50"
                title="Download lightweight compressed pack for phone or laptop"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Download for Phone/Laptop ({formatBytes(batch.compressed_total_size_bytes)})</span>
              </button>

              <button
                onClick={handleSubmitToAdmin}
                disabled={isSubmitting || selectedPhotos.length === 0 || batch.status === 'submitted_to_admin'}
                className={`font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                  batch.status === 'submitted_to_admin'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                    : selectedPhotos.length === 0
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                    : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-500/20 hover:scale-[1.02]'
                }`}
              >
                {batch.status === 'submitted_to_admin' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Selection Sent to Studio!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send {selectedPhotos.length} Selected to Studio</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Submission Success Alert */}
      {showSuccessBanner && (
        <div className="mb-8 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-4 animate-in fade-in">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-white mb-1">
              Your Photo Selection has been Dispatched to SnepStudio!
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              We received your <strong>{selectedPhotos.length} selected photos</strong>. Our retouching &amp; editing team will immediately link back your choices with the full-resolution <strong>25GB Master RAW</strong> files and begin advanced color grading, skin retouching, and album layout.
            </p>
            {batch.client_feedback_notes && (
              <p className="text-xs text-amber-300/90 mt-2 bg-black/20 p-2.5 rounded-lg border border-white/5">
                <strong>Your Notes to Editor:</strong> "{batch.client_feedback_notes}"
              </p>
            )}
          </div>
        </div>
      )}

      {/* Two Virtual Folders Explained (The core user requirement) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        
        {/* File 1: Main Shoot File (Pending + Crossed/Rejected at the end) */}
        <div 
          onClick={() => setActiveTab('unselected')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'unselected'
              ? 'bg-[#181c29] border-amber-400/60 shadow-lg shadow-amber-500/5'
              : 'bg-[#12151f] border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-slate-300">
                <FolderArchive className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Main Shoot File (Original Set)</h3>
                <p className="text-[11px] text-slate-400">All photos shot by {batch.employee_name}</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold bg-white/10 text-white px-2.5 py-1 rounded-full">
              {mainFilePhotos.length} Photos
            </span>
          </div>

          <div className="text-[11px] text-slate-400 bg-black/30 p-2.5 rounded-xl border border-white/5 flex items-center justify-between">
            <span>Pending Review: <strong className="text-amber-400">{pendingPhotos.length}</strong></span>
            <span>Crossed (Moved to end): <strong className="text-rose-400">{rejectedPhotos.length}</strong></span>
          </div>
        </div>

        {/* File 2: Selected New File (Checked Photos) */}
        <div 
          onClick={() => setActiveTab('selected')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'selected'
              ? 'bg-[#181c29] border-emerald-500/60 shadow-lg shadow-emerald-500/5'
              : 'bg-[#12151f] border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <FolderCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Selected Photos (New File)</h3>
                <p className="text-[11px] text-slate-400">Checked photos to be sent to editor</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30">
              {selectedPhotos.length} Selected
            </span>
          </div>

          <div className="text-[11px] text-slate-400 bg-black/30 p-2.5 rounded-xl border border-white/5 flex items-center justify-between">
            <span>Ready for Master Retouching</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Ready to Send
            </span>
          </div>
        </div>

      </div>

      {/* Tabs Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            All Photos ({batch.photos.length})
          </button>
          
          <button
            onClick={() => setActiveTab('selected')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'selected'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>New File: Selected ({selectedPhotos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('unselected')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'unselected'
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>Main Shoot File ({mainFilePhotos.length})</span>
          </button>
        </div>

        {/* Instructions helper tooltip */}
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Click <strong>✓ Check</strong> to move to Selected File. Click <strong>✕ Cross</strong> to move to the bottom of the original file.</span>
        </div>
      </div>

      {/* Photo Gallery Grid with Check & Cross Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {(activeTab === 'all' 
          ? batch.photos 
          : activeTab === 'selected' 
          ? selectedPhotos 
          : mainFilePhotos
        ).map((photo, index) => {
          const isSelected = photo.selection_status === 'selected';
          const isRejected = photo.selection_status === 'rejected';

          return (
            <div
              key={photo.id}
              className={`group relative rounded-2xl overflow-hidden border transition-all bg-[#131620] flex flex-col ${
                isSelected
                  ? 'border-emerald-500 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/40'
                  : isRejected
                  ? 'border-rose-500/30 opacity-70 hover:opacity-100 bg-[#161316]'
                  : 'border-white/10 hover:border-amber-400/40 hover:shadow-xl'
              }`}
            >
              {/* Photo Image Canvas with Overlay */}
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Status Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  {isSelected && (
                    <span className="bg-emerald-500 text-slate-950 font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <Check className="w-3 h-3 stroke-[3]" /> Selected
                    </span>
                  )}
                  {isRejected && (
                    <span className="bg-rose-500/90 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <X className="w-3 h-3 stroke-[3]" /> Rejected (Moved to End)
                    </span>
                  )}
                  {!isSelected && !isRejected && (
                    <span className="bg-black/60 backdrop-blur-md text-slate-300 text-[10px] px-2 py-0.5 rounded-full">
                      #{index + 1} Pending
                    </span>
                  )}
                </div>

                {/* Zoom / Full Preview Button */}
                <button
                  onClick={() => setPreviewPhoto(photo)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="View High Resolution"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>

                {/* Quick File Sizes Info (Compressed vs Master RAW) */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-white/90 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg">
                  <span>Fast: {formatBytes(photo.compressed_size_bytes)}</span>
                  <span className="text-slate-400">Master: {formatBytes(photo.size_bytes)}</span>
                </div>
              </div>

              {/* Photo Information & Control Action Bar */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="mb-3">
                  <h4 className="text-xs font-semibold text-white truncate" title={photo.name}>
                    {photo.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {photo.id}
                  </p>
                </div>

                {/* THE CORE BUTTONS: Check (Select) and Cross (Reject) */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                  
                  {/* CHECK BUTTON: Move to Selected File */}
                  <button
                    onClick={() => handleCheck(photo.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30'
                    }`}
                    title="Select this photo (moves to Selected File)"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Check</span>
                  </button>

                  {/* CROSS BUTTON: Move to original file at the last */}
                  <button
                    onClick={() => handleCross(photo.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isRejected
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                        : 'bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30'
                    }`}
                    title="Reject this photo (moves to bottom of same file)"
                  >
                    <X className="w-4 h-4 stroke-[2.5]" />
                    <span>Cross</span>
                  </button>

                </div>

                {(isSelected || isRejected) && (
                  <button
                    onClick={() => handleReset(photo.id)}
                    className="mt-2 text-[10px] text-slate-400 hover:text-slate-200 text-center flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Undo2 className="w-3 h-3" /> Reset Choice
                  </button>
                )}

              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State when filter yields 0 */}
      {(activeTab === 'selected' ? selectedPhotos.length === 0 : activeTab === 'unselected' ? mainFilePhotos.length === 0 : batch.photos.length === 0) && (
        <div className="py-16 text-center bg-[#131620] border border-white/10 rounded-2xl my-8">
          <FolderCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No photos in this folder yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {activeTab === 'selected'
              ? 'Click the green "Check" button on any photo in the main shoot to add it to your new selected file.'
              : 'All photos have been selected into your new file!'}
          </p>
          <button
            onClick={() => setActiveTab('all')}
            className="mt-4 px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
          >
            Show All Photos
          </button>
        </div>
      )}

      {/* Customer Submission & Editing Notes Footer Section */}
      <div className="mt-12 bg-[#141824] border border-white/10 rounded-3xl p-6 sm:p-8">
        <div className="max-w-3xl">
          <span className="text-amber-400 text-[10px] uppercase font-bold tracking-widest block mb-1">
            Proofing Instructions &amp; Studio Delivery
          </span>
          <h3 className="text-lg font-bold text-white mb-2">
            Send Selected Photos Back to SnepStudio Editors
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            Once you submit, your <strong>{selectedPhotos.length} selected photos</strong> will be instantly transmitted to our editing department. Our system links your selections back to the <strong>original 25 GB master RAW files</strong> so that final deliverables will come out in the absolute highest pristine quality!
          </p>

          <div className="mb-4">
            <label className="block text-slate-300 text-xs font-semibold mb-1.5">
              Specific instructions for the editor (Optional):
            </label>
            <textarea
              rows={3}
              value={feedbackNotes}
              onChange={(e) => setFeedbackNotes(e.target.value)}
              placeholder="e.g. Please enhance the warm sunset glow on photo #2, remove background visitors on photo #5, and prepare high-res print files..."
              className="w-full bg-[#181d2c] border border-white/15 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSubmitToAdmin}
              disabled={isSubmitting || selectedPhotos.length === 0}
              className={`font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all ${
                selectedPhotos.length === 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-500/20'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Submit {selectedPhotos.length} Selected Photos to Studio</span>
            </button>

            <span className="text-xs text-slate-400">
              {selectedPhotos.length} of {batch.photos.length} photos selected ({rejectedPhotos.length} rejected, {pendingPhotos.length} pending)
            </span>
          </div>
        </div>
      </div>

      {/* Modal: Fullscreen Photo Preview with Check/Cross overlay */}
      {previewPhoto && (
        <div 
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="max-w-5xl w-full bg-[#131620] border border-white/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#161a26]">
              <div>
                <h4 className="text-sm font-bold text-white">{previewPhoto.name}</h4>
                <p className="text-[11px] text-slate-400">
                  Compressed Preview ({formatBytes(previewPhoto.compressed_size_bytes)}) • Lossless RAW Master ({formatBytes(previewPhoto.size_bytes)})
                </p>
              </div>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image */}
            <div className="relative aspect-[16/10] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={previewPhoto.url}
                alt={previewPhoto.name}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>

            {/* Modal Controls */}
            <div className="p-4 border-t border-white/10 flex items-center justify-between bg-[#161a26]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300">Current Status:</span>
                {previewPhoto.selection_status === 'selected' ? (
                  <span className="bg-emerald-500 text-slate-950 font-bold text-xs px-2.5 py-0.5 rounded-full">
                    Selected (In New File)
                  </span>
                ) : previewPhoto.selection_status === 'rejected' ? (
                  <span className="bg-rose-500 text-white font-bold text-xs px-2.5 py-0.5 rounded-full">
                    Rejected (At End of File)
                  </span>
                ) : (
                  <span className="bg-white/10 text-slate-300 text-xs px-2.5 py-0.5 rounded-full">
                    Pending Decision
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    handleCheck(previewPhoto.id);
                    setPreviewPhoto({ ...previewPhoto, selection_status: 'selected' });
                  }}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Check (Select)
                </button>
                <button
                  onClick={() => {
                    handleCross(previewPhoto.id);
                    setPreviewPhoto({ ...previewPhoto, selection_status: 'rejected' });
                  }}
                  className="bg-rose-500 hover:bg-rose-400 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <X className="w-4 h-4" /> Cross (Move to End)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
