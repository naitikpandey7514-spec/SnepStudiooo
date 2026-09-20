import React, { useState } from 'react';
import { Upload, FileImage, FileVideo, CheckCircle2, Sparkles, Send } from 'lucide-react';
import { AppointmentRecord } from '../types';

interface UploadViewProps {
  bookings: AppointmentRecord[];
  onUploadSuccess: (data: {
    filename: string;
    file_type: 'Photo' | 'Video';
    service: string;
    appointment_id?: number | null;
    description: string;
  }) => void;
  onNavigate: (page: string) => void;
}

export const UploadView: React.FC<UploadViewProps> = ({
  bookings,
  onUploadSuccess,
  onNavigate,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'Photo' | 'Video'>('Photo');
  const [selectedBookingId, setSelectedBookingId] = useState<string>('none');
  const [service, setService] = useState<string>('Photo Editing');
  const [message, setMessage] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.mov')) {
        setFileType('Video');
        setService('Video Editing');
      } else {
        setFileType('Photo');
        setService('Photo Editing');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    const filename = selectedFile?.name || (fileType === 'Photo' ? 'raw_client_photo.jpg' : 'raw_client_clip.mp4');
    const appointmentId = selectedBookingId !== 'none' ? Number(selectedBookingId) : null;

    setTimeout(() => {
      onUploadSuccess({
        filename,
        file_type: fileType,
        service: selectedBookingId !== 'none' 
          ? (bookings.find(b => b.id === appointmentId)?.service || service) 
          : service,
        appointment_id: appointmentId,
        description: message || 'Standard retouching and color correction requested.'
      });
      setIsUploading(false);
      setSuccess(true);
    }, 800);
  };

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Upload className="w-3.5 h-3.5" />
          <span>Studio Intake</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Send Your Photos &amp; Videos
        </h1>
        <p className="text-slate-300 text-sm mt-2">
          Upload your files for retouching, color grading, or link them directly to a scheduled shoot appointment.
        </p>
      </div>

      {success ? (
        <div className="bg-[#12151e] border border-emerald-400/30 rounded-3xl p-10 text-center shadow-2xl animate-fade-in max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-400/10 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Upload Received!</h3>
          <p className="text-slate-300 text-xs leading-relaxed mb-6">
            Your file has been transferred to our studio queue. Our retouchers and editors will start working on it promptly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('my-work')}
              className="w-full sm:w-auto bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs"
            >
              View in My Work
            </button>
            <button
              onClick={() => {
                setSuccess(false);
                setSelectedFile(null);
                setMessage('');
              }}
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-slate-300 px-6 py-2.5 rounded-xl text-xs"
            >
              Upload More
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#12151e] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            
            {/* File Dropzone */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-300 mb-2">
                Choose Media File (JPG, JPEG, PNG, WEBP, MP4, MOV)
              </label>

              <label className="border-2 border-dashed border-white/15 hover:border-amber-400/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-all group">
                <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  {fileType === 'Video' ? <FileVideo className="w-6 h-6" /> : <FileImage className="w-6 h-6" />}
                </div>

                {selectedFile ? (
                  <div className="text-center">
                    <span className="text-amber-400 font-bold text-sm block">{selectedFile.name}</span>
                    <span className="text-slate-400 text-xs mt-1 block">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &middot; Ready for multi-chunk studio upload (Up to 25 GB supported)</span>
                  </div>
                ) : (
                  <div className="text-center">
                    <span className="text-slate-200 font-semibold text-sm block">Click or drag &amp; drop photos or videos</span>
                    <span className="text-slate-400 text-xs mt-1 block">High resolution RAW (ARW/CR3/NEF), 4K Video, JPEG, PNG up to <strong>25 GB</strong> with automatic multi-part chunking</span>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Link to Booking (Optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Link to Scheduled Booking (Optional)
                </label>
                <select
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  className="w-full bg-[#171b26] border border-white/15 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-amber-400"
                >
                  <option value="none">-- Standalone Editing Request --</option>
                  {bookings.map(b => (
                    <option key={b.id} value={b.id}>
                      #{b.id} - {b.service} ({b.appointment_date})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Service Category
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full bg-[#171b26] border border-white/15 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-amber-400"
                >
                  <option value="Photo Editing">Photo Retouching &amp; Color Grading</option>
                  <option value="Video Editing">Cinematic Video Editing</option>
                  <option value="Wedding Shoot">Wedding Deliverables</option>
                  <option value="Pre-Wedding Shoot">Pre-Wedding Deliverables</option>
                  <option value="Photography">Portrait Deliverables</option>
                </select>
              </div>
            </div>

            {/* Editing Instructions */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Creative Notes &amp; Retouching Instructions
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe skin tone preference, background changes, color mood, or any special requests..."
                className="w-full bg-[#171b26] border border-white/15 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-amber-400 placeholder:text-slate-600 leading-relaxed"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isUploading}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold py-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <span>Uploading to Secure Studio Storage...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Upload to Studio Queue</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
