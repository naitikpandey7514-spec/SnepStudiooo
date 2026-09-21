import React, { useState, useRef } from 'react';
import { 
  Camera, Briefcase, Calendar, Upload, Download, CheckCircle2, XCircle, 
  Clock, FolderArchive, Send, LogOut, ArrowRight, Video, Image as ImageIcon,
  CheckSquare, AlertCircle, FileText, Check, X, ShieldAlert, RefreshCw
} from 'lucide-react';
import { UserRecord, AppointmentRecord, ShootBatchRecord, WorkRecord, ShootPhotoItem } from '../types';
import { ResumableChunkUploader, ChunkUploadProgress } from '../utils/chunkedUpload';
import { downloadFile } from '../utils/fileDownloader';
import JSZip from 'jszip';

interface EmployeeDashboardProps {
  employee: UserRecord;
  bookings: AppointmentRecord[];
  shootBatches: ShootBatchRecord[];
  workItems: WorkRecord[];
  onSendNewBatch: (batch: ShootBatchRecord) => void;
  onUpdateWorkStatus: (id: number, status: WorkRecord['status'], completedFilename?: string) => void;
  onUpdateBookingStatus: (id: number, status: AppointmentRecord['status']) => void;
  onUploadCompletedDeliverable?: (deliverable: {
    customer_name: string;
    user_id: number;
    appointment_id?: number;
    service: string;
    filename: string;
    file_type: 'Photo' | 'Video';
    description: string;
  }) => void;
  onLogout: () => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  employee,
  bookings,
  shootBatches,
  workItems,
  onSendNewBatch,
  onUpdateWorkStatus,
  onUpdateBookingStatus,
  onUploadCompletedDeliverable,
  onLogout
}) => {
  // Navigation tabs for employee
  const [activeTab, setActiveTab] = useState<'assigned-shoots' | 'create-album' | 'customer-selections' | 'upload-work'>('assigned-shoots');

  // Create & Send Album State
  const [selectedBookingId, setSelectedBookingId] = useState<number | ''>(bookings[0]?.id || '');
  const [albumTitle, setAlbumTitle] = useState('');
  const [serviceCategory, setServiceCategory] = useState('Wedding Coverage');
  const [customerEmail, setCustomerEmail] = useState(bookings[0]?.phone ? 'customer@example.com' : 'rohan.sharma@example.com');
  const [customerName, setCustomerName] = useState(bookings[0]?.customer_name || 'Rohan Sharma');
  const [uploadedPhotos, setUploadedPhotos] = useState<ShootPhotoItem[]>([]);
  
  // Chunked Upload State
  const [isChunkUploading, setIsChunkUploading] = useState(false);
  const [chunkProgress, setChunkProgress] = useState<ChunkUploadProgress | null>(null);
  const [uploadSuccessNote, setUploadSuccessNote] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Deliverable Upload State
  const [delivCustomer, setDelivCustomer] = useState(bookings[0]?.customer_name || 'Rohan Sharma');
  const [delivService, setDelivService] = useState('Wedding Coverage');
  const [delivType, setDelivType] = useState<'Photo' | 'Video'>('Photo');
  const [delivFilename, setDelivFilename] = useState('');
  const [delivNotes, setDelivNotes] = useState('');
  const [delivSuccess, setDelivSuccess] = useState(false);

  // Selected Album for Selections Inspection
  const [inspectedBatchId, setInspectedBatchId] = useState<string>(shootBatches[0]?.id || '');

  // Handle file selection with Chunked Uploader (supporting large files up to 25 GB)
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsChunkUploading(true);
    setUploadSuccessNote(null);

    const newItems: ShootPhotoItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        await new Promise<void>((resolve, reject) => {
          const uploader = new ResumableChunkUploader(file, {
            chunkSizeBytes: 5 * 1024 * 1024, // 5 MB chunks
            onProgress: (p) => setChunkProgress(p),
            onComplete: (info) => {
              newItems.push({
                id: `p-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
                name: info.filename,
                url: info.previewUrl,
                original_url: info.originalUrl,
                size_bytes: info.originalSizeBytes,
                compressed_size_bytes: info.compressedSizeBytes,
                selection_status: 'pending'
              });
              resolve();
            },
            onError: (err) => reject(err)
          });
          uploader.start();
        });
      } catch (err: any) {
        console.error('Upload error:', err);
      }
    }

    setUploadedPhotos((prev) => [...prev, ...newItems]);
    setIsChunkUploading(false);
    setChunkProgress(null);
    setUploadSuccessNote(`Added ${newItems.length} media files! Original master quality preserved with auto-compressed customer previews.`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Add default demo shoot photos if user doesn't have real files right now
  const handleAddSampleBatch = () => {
    const sampleItems: ShootPhotoItem[] = [
      {
        id: `sample-p-${Date.now()}-1`,
        name: 'RAW_DSC_0101_BridalPortrait.ARW',
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=75',
        original_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2400&q=100',
        size_bytes: 42 * 1024 * 1024,
        compressed_size_bytes: 320 * 1024,
        selection_status: 'pending'
      },
      {
        id: `sample-p-${Date.now()}-2`,
        name: 'RAW_DSC_0102_RingExchange.ARW',
        url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=75',
        original_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=2400&q=100',
        size_bytes: 45 * 1024 * 1024,
        compressed_size_bytes: 340 * 1024,
        selection_status: 'pending'
      },
      {
        id: `sample-p-${Date.now()}-3`,
        name: 'RAW_DSC_0103_VowsSunset.ARW',
        url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=75',
        original_url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=2400&q=100',
        size_bytes: 44 * 1024 * 1024,
        compressed_size_bytes: 310 * 1024,
        selection_status: 'pending'
      },
      {
        id: `sample-p-${Date.now()}-4`,
        name: 'RAW_DSC_0104_ReceptionFirstDance.ARW',
        url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=75',
        original_url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=2400&q=100',
        size_bytes: 48 * 1024 * 1024,
        compressed_size_bytes: 360 * 1024,
        selection_status: 'pending'
      }
    ];
    setUploadedPhotos((prev) => [...prev, ...sampleItems]);
    setUploadSuccessNote(`Added ${sampleItems.length} demo RAW shoot photos with auto-compression previews.`);
  };

  // Dispatch Album to Customer
  const handleSendAlbumToCustomer = () => {
    if (uploadedPhotos.length === 0) {
      alert('Please upload or add at least one photo or video before sending the album.');
      return;
    }

    const title = albumTitle.trim() || `${serviceCategory} - Album #${Date.now().toString().slice(-4)}`;
    const originalTotalBytes = uploadedPhotos.reduce((sum, p) => sum + p.size_bytes, 0);
    const compressedTotalBytes = uploadedPhotos.reduce((sum, p) => sum + p.compressed_size_bytes, 0);

    const newBatch: ShootBatchRecord = {
      id: `BATCH-${Date.now().toString().slice(-5)}`,
      appointment_id: selectedBookingId ? Number(selectedBookingId) : null,
      customer_id: 101,
      customer_name: customerName,
      customer_email: customerEmail,
      shoot_title: title,
      service_category: serviceCategory,
      employee_name: `${employee.name} (${employee.employee_id || 'Staff'})`,
      created_at: new Date().toISOString().split('T')[0],
      total_photos: uploadedPhotos.length,
      original_total_size_bytes: originalTotalBytes,
      compressed_total_size_bytes: compressedTotalBytes,
      photos: uploadedPhotos,
      status: 'sent_to_customer'
    };

    onSendNewBatch(newBatch);
    setAlbumTitle('');
    setUploadedPhotos([]);
    setUploadSuccessNote(null);
    alert(`Shoot Album "${newBatch.shoot_title}" successfully sent to customer ${customerName}!`);
    setActiveTab('customer-selections');
    setInspectedBatchId(newBatch.id);
  };

  // Download All Selected Originals
  const handleDownloadSelectedOriginals = async (batch: ShootBatchRecord) => {
    const selected = batch.photos.filter(p => p.selection_status === 'selected');
    if (selected.length === 0) {
      alert('No selected photos in this album yet.');
      return;
    }

    if (selected.length === 1) {
      const p = selected[0];
      await downloadFile(p.original_url, p.name);
      return;
    }

    // Zip download
    const zip = new JSZip();
    const folder = zip.folder(`${batch.shoot_title}_Selected_Originals`) || zip;

    for (const p of selected) {
      try {
        const res = await fetch(p.original_url);
        const blob = await res.blob();
        folder.file(p.name, blob);
      } catch {
        // Text fallback
        folder.file(`${p.name}.txt`, `Original URL: ${p.original_url}`);
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    await downloadFile(zipBlob, `${batch.shoot_title}_Selected_Originals.zip`);
  };

  // Upload Completed Work Deliverable
  const handleUploadDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!delivFilename.trim()) {
      alert('Please provide deliverable filename or description.');
      return;
    }

    if (onUploadCompletedDeliverable) {
      onUploadCompletedDeliverable({
        customer_name: delivCustomer,
        user_id: 101,
        appointment_id: selectedBookingId ? Number(selectedBookingId) : undefined,
        service: delivService,
        filename: delivFilename.trim(),
        file_type: delivType,
        description: delivNotes.trim() || 'Master final edited deliverable ready for download'
      });
    }

    setDelivSuccess(true);
    setDelivFilename('');
    setDelivNotes('');
    setTimeout(() => setDelivSuccess(false), 3000);
  };

  const inspectedBatch = shootBatches.find(b => b.id === inspectedBatchId) || shootBatches[0];

  return (
    <div className="min-h-screen bg-[#0d1017] text-slate-100 flex flex-col">
      
      {/* Top Staff Navigation Bar */}
      <header className="bg-[#141824] border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center text-slate-950 font-black shadow-md">
            <Camera className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white tracking-tight text-base sm:text-lg">
                Snep<span className="text-amber-400">Studio</span>
              </span>
              <span className="bg-amber-400/20 text-amber-400 border border-amber-400/30 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                EMPLOYEE PORTAL
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Staff: <strong className="text-white">{employee.name}</strong> · ID: <span className="font-mono text-amber-400">{employee.employee_id || 'EMP-0001'}</span>
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 text-red-400" />
          <span>Logout</span>
        </button>
      </header>

      {/* Main Employee Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Navigation Tabs (Employee Scope Only) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 border-b border-white/10 mb-6 text-xs">
          <button
            onClick={() => setActiveTab('assigned-shoots')}
            className={`px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'assigned-shoots'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Assigned Shoots ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('create-album')}
            className={`px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'create-album'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload &amp; Send Shoot Album</span>
          </button>

          <button
            onClick={() => setActiveTab('customer-selections')}
            className={`px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'customer-selections'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Customer Selections ({shootBatches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('upload-work')}
            className={`px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'upload-work'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Upload Completed Work ({workItems.length})</span>
          </button>
        </div>

        {/* TAB 1: ASSIGNED SHOOTS & JOBS */}
        {activeTab === 'assigned-shoots' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">My Assigned Shoots &amp; Jobs</h2>
                <p className="text-xs text-slate-400">Review upcoming customer dates, venues, contact numbers, and shoot requirements.</p>
              </div>
              <span className="text-xs font-mono font-bold bg-white/5 px-3 py-1 rounded-full text-amber-400">
                {bookings.length} Scheduled
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-[#141824] border border-white/10 rounded-2xl p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block">
                        {booking.service}
                      </span>
                      <h3 className="text-base font-bold text-white mt-0.5">{booking.customer_name}</h3>
                      <p className="text-xs text-slate-400">Phone: {booking.phone}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      booking.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      booking.status === 'In Progress' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      booking.status === 'Completed' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                    }`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="bg-[#1a2030] p-3 rounded-xl space-y-1 text-xs text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Date &amp; Time:</span>
                      <span className="font-semibold text-white">{booking.appointment_date} at {booking.appointment_time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Venue / Location:</span>
                      <span className="font-semibold text-white text-right max-w-[220px] truncate">{booking.address}</span>
                    </div>
                    {booking.message && (
                      <div className="pt-1 border-t border-white/5 text-[11px] text-slate-400 italic">
                        "{booking.message}"
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateBookingStatus(booking.id, 'In Progress')}
                        className="bg-white/5 hover:bg-white/10 text-amber-400 px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors"
                      >
                        Set In Progress
                      </button>
                      <button
                        onClick={() => onUpdateBookingStatus(booking.id, 'Completed')}
                        className="bg-white/5 hover:bg-white/10 text-emerald-400 px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors"
                      >
                        Set Completed
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedBookingId(booking.id);
                        setCustomerName(booking.customer_name);
                        setServiceCategory(booking.service);
                        setAlbumTitle(`${booking.service} - ${booking.customer_name}`);
                        setActiveTab('create-album');
                      }}
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer flex items-center gap-1 transition-all"
                    >
                      <span>Create Album</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: UPLOAD & CREATE SHOOT ALBUM (WITH CHUNKED UPLOAD SUPPORT UP TO 25 GB & AUTO-COMPRESSION) */}
        {activeTab === 'create-album' && (
          <div className="bg-[#141824] border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white">Create &amp; Dispatch Shoot Album</h2>
              <p className="text-xs text-slate-400 mt-1">
                Upload master photos/videos. The engine supports up to <strong>25 GB per batch</strong> using resumable chunked upload.
                High-resolution master files are kept intact while lightweight preview copies are automatically generated for fast customer mobile proofing.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rohan Sharma"
                  className="w-full bg-[#1a2030] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Customer Email</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="e.g. rohan.sharma@example.com"
                  className="w-full bg-[#1a2030] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Service Category</label>
                <select
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.target.value)}
                  className="w-full bg-[#1a2030] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Wedding Coverage">Wedding Coverage</option>
                  <option value="Pre-Wedding Shoot">Pre-Wedding Shoot</option>
                  <option value="Maternity Shoot">Maternity Shoot</option>
                  <option value="Commercial Portfolio">Commercial Portfolio</option>
                  <option value="Fashion Shoot">Fashion Shoot</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1">Album Title</label>
              <input
                type="text"
                value={albumTitle}
                onChange={(e) => setAlbumTitle(e.target.value)}
                placeholder="e.g. Wedding Ceremonies &amp; Reception - Raw Proofing Collection"
                className="w-full bg-[#1a2030] border border-white/15 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Chunk Upload Dropzone */}
            <div className="border-2 border-dashed border-white/20 rounded-2xl p-6 text-center hover:border-amber-400/50 transition-colors bg-[#10131d]">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.arw,.cr2,.cr3,.nef,.dng"
                onChange={handleFilesSelected}
                className="hidden"
                id="employee-chunk-upload"
              />
              <label htmlFor="employee-chunk-upload" className="cursor-pointer block">
                <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="font-bold text-sm text-white block">
                  Click or drag master shoot files here
                </span>
                <span className="text-xs text-slate-400 mt-1 block">
                  Supports large RAW images (.ARW, .CR3, .DNG) and 4K video clips up to 25 GB batch.
                </span>
              </label>

              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white/10 hover:bg-white/15 text-white font-semibold px-4 py-2 rounded-xl text-xs cursor-pointer transition-colors"
                >
                  Browse Computer Files
                </button>
                <button
                  type="button"
                  onClick={handleAddSampleBatch}
                  className="bg-amber-400/20 hover:bg-amber-400/30 text-amber-400 font-semibold px-4 py-2 rounded-xl text-xs cursor-pointer transition-colors"
                >
                  + Add Demo Shoot RAW Photos
                </button>
              </div>
            </div>

            {/* Chunk Uploading Progress Indicator */}
            {isChunkUploading && chunkProgress && (
              <div className="p-4 rounded-xl bg-amber-400/10 border border-amber-400/30 text-xs space-y-2">
                <div className="flex items-center justify-between text-amber-400 font-bold">
                  <span>Uploading Chunk {chunkProgress.currentChunk} of {chunkProgress.totalChunks}...</span>
                  <span>{chunkProgress.percent}% ({chunkProgress.speedMbps} Mbps)</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-400 h-2 transition-all duration-200" style={{ width: `${chunkProgress.percent}%` }} />
                </div>
                <p className="text-[11px] text-slate-300">
                  Transmitting slice chunks in memory. Reassembling master file safely.
                </p>
              </div>
            )}

            {uploadSuccessNote && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{uploadSuccessNote}</span>
              </div>
            )}

            {/* Uploaded Photos Preview List */}
            {uploadedPhotos.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Queued Media for Album ({uploadedPhotos.length} files)</span>
                  <button
                    onClick={() => setUploadedPhotos([])}
                    className="text-red-400 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-72 overflow-y-auto p-1">
                  {uploadedPhotos.map((photo) => (
                    <div key={photo.id} className="relative rounded-xl overflow-hidden bg-slate-900 border border-white/10 group">
                      <img src={photo.url} alt={photo.name} className="w-full h-24 object-cover" />
                      <div className="p-1.5 text-[10px] bg-slate-950/90 truncate font-mono text-slate-300">
                        {photo.name}
                      </div>
                      <div className="text-[9px] px-1.5 pb-1 text-slate-500">
                        {(photo.size_bytes / (1024 * 1024)).toFixed(1)} MB RAW
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleSendAlbumToCustomer}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send Album to Customer ({customerName})</span>
            </button>
          </div>
        )}

        {/* TAB 3: CUSTOMER SELECTIONS & DOWNLOADING ORIGINAL SELECTED FILES (SECTIONS 5, 6, 7) */}
        {activeTab === 'customer-selections' && (
          <div className="space-y-6">
            {/* Album Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#141824] p-4 rounded-2xl border border-white/10">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400">Select Customer Shoot Album</label>
                <select
                  value={inspectedBatch?.id || ''}
                  onChange={(e) => setInspectedBatchId(e.target.value)}
                  className="mt-1 bg-[#1a2030] border border-white/15 rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-amber-400"
                >
                  {shootBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.shoot_title} ({b.customer_name}) - {b.photos.filter(p => p.selection_status === 'selected').length} Selected
                    </option>
                  ))}
                </select>
              </div>

              {inspectedBatch && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadSelectedOriginals(inspectedBatch)}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Original Selected Files (Full RAW Quality)</span>
                  </button>
                </div>
              )}
            </div>

            {inspectedBatch ? (
              <div className="space-y-6">
                
                {/* Batch Overview Header */}
                <div className="bg-[#141824] border border-white/10 rounded-2xl p-5 text-xs grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <span className="text-slate-400 block">Customer:</span>
                    <span className="font-bold text-white text-sm">{inspectedBatch.customer_name}</span>
                    <span className="text-slate-400 block text-[11px]">{inspectedBatch.customer_email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Status:</span>
                    <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      inspectedBatch.status === 'submitted_to_admin' 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {inspectedBatch.status === 'submitted_to_admin' ? '✓ Final Selection Submitted' : 'Customer Reviewing'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Selected by Customer:</span>
                    <span className="font-bold text-emerald-400 text-base">
                      {inspectedBatch.photos.filter(p => p.selection_status === 'selected').length} photos
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Rejected by Customer:</span>
                    <span className="font-bold text-rose-400 text-base">
                      {inspectedBatch.photos.filter(p => p.selection_status === 'rejected').length} photos
                    </span>
                  </div>
                </div>

                {inspectedBatch.client_feedback_notes && (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs">
                    <span className="text-slate-400 font-bold block mb-1">Customer Selection Notes:</span>
                    <p className="text-slate-200 italic">"{inspectedBatch.client_feedback_notes}"</p>
                  </div>
                )}

                {/* Section A: Selected Photos (Marked with ✓) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-sm font-bold text-white">
                      Selected Photos ({inspectedBatch.photos.filter(p => p.selection_status === 'selected').length})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {inspectedBatch.photos
                      .filter(p => p.selection_status === 'selected')
                      .map((photo) => (
                        <div key={photo.id} className="bg-[#141824] border border-emerald-500/40 rounded-2xl overflow-hidden p-3 space-y-2">
                          <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-900">
                            <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                            <span className="absolute top-2 right-2 bg-emerald-500 text-slate-950 font-black text-xs px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                              <Check className="w-3 h-3" />
                              <span>Selected</span>
                            </span>
                          </div>

                          <div className="text-xs">
                            <p className="font-bold text-white truncate font-mono text-[11px]">{photo.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Master Original: {(photo.size_bytes / (1024 * 1024)).toFixed(1)} MB Lossless
                            </p>
                          </div>

                          <button
                            onClick={() => downloadFile(photo.original_url, photo.name)}
                            className="w-full bg-white/10 hover:bg-white/15 text-amber-400 text-xs font-semibold py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Master RAW</span>
                          </button>
                        </div>
                      ))}

                    {inspectedBatch.photos.filter(p => p.selection_status === 'selected').length === 0 && (
                      <div className="col-span-full p-8 text-center bg-[#141824] border border-white/5 rounded-2xl text-xs text-slate-400">
                        The customer has not selected any photos from this album yet.
                      </div>
                    )}
                  </div>
                </div>

                {/* Section B: Rejected Photos (Marked with ✕, kept at the end of the album) */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                      <X className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-300">
                      Rejected Photos ({inspectedBatch.photos.filter(p => p.selection_status === 'rejected').length})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 opacity-75">
                    {inspectedBatch.photos
                      .filter(p => p.selection_status === 'rejected')
                      .map((photo) => (
                        <div key={photo.id} className="bg-[#141824] border border-rose-500/30 rounded-2xl overflow-hidden p-3 space-y-2">
                          <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-900 grayscale">
                            <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                            <span className="absolute top-2 right-2 bg-rose-500 text-white font-bold text-xs px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                              <X className="w-3 h-3" />
                              <span>Rejected</span>
                            </span>
                          </div>

                          <div className="text-xs">
                            <p className="font-mono text-[11px] text-slate-300 truncate">{photo.name}</p>
                            <p className="text-[10px] text-slate-500">
                              Size: {(photo.size_bytes / (1024 * 1024)).toFixed(1)} MB
                            </p>
                          </div>
                        </div>
                      ))}

                    {inspectedBatch.photos.filter(p => p.selection_status === 'rejected').length === 0 && (
                      <div className="col-span-full p-4 text-center text-xs text-slate-500">
                        No rejected photos recorded in this album.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-12 text-center bg-[#141824] rounded-2xl border border-white/10 text-xs text-slate-400">
                No shoot albums created yet. Use the "Upload &amp; Send Shoot Album" tab to send your first batch.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: UPLOAD COMPLETED WORK & UPDATE STATUS */}
        {activeTab === 'upload-work' && (
          <div className="space-y-6">
            <div className="bg-[#141824] border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="border-b border-white/10 pb-3">
                <h2 className="text-lg font-bold text-white">Upload Completed Final Work Deliverable</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Once editing, color grading, or film retouching is finalized, upload the master deliverable here.
                  It will immediately become available in the customer's "My Work" and "Downloads" area.
                </p>
              </div>

              {delivSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Deliverable uploaded successfully and customer work status set to Completed!</span>
                </div>
              )}

              <form onSubmit={handleUploadDeliverable} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Customer</label>
                    <input
                      type="text"
                      required
                      value={delivCustomer}
                      onChange={(e) => setDelivCustomer(e.target.value)}
                      className="w-full bg-[#1a2030] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Service Type</label>
                    <input
                      type="text"
                      required
                      value={delivService}
                      onChange={(e) => setDelivService(e.target.value)}
                      className="w-full bg-[#1a2030] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Deliverable Format</label>
                    <select
                      value={delivType}
                      onChange={(e) => setDelivType(e.target.value as any)}
                      className="w-full bg-[#1a2030] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="Photo">Master Retouched Photos (ZIP / High-Res)</option>
                      <option value="Video">Final 4K Cinema Film (MP4 / ProRes)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Deliverable Filename</label>
                  <input
                    type="text"
                    required
                    value={delivFilename}
                    onChange={(e) => setDelivFilename(e.target.value)}
                    placeholder="e.g. Wedding_Final_Master_Album_UltraHD.zip"
                    className="w-full bg-[#1a2030] border border-white/15 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Completion Notes for Customer</label>
                  <textarea
                    rows={3}
                    value={delivNotes}
                    onChange={(e) => setDelivNotes(e.target.value)}
                    placeholder="e.g. Color grading completed with Fuji Provia LUT. Includes full resolution 300 DPI print-ready photos."
                    className="w-full bg-[#1a2030] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-6 py-2.5 rounded-xl uppercase tracking-wider text-xs cursor-pointer shadow-md transition-all flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Publish Deliverable to Customer</span>
                </button>
              </form>
            </div>

            {/* Current Work Deliverables Queue */}
            <div className="bg-[#141824] border border-white/10 rounded-2xl p-6 space-y-3">
              <h3 className="font-bold text-white text-sm">Editing Deliverables Queue ({workItems.length})</h3>

              <div className="space-y-2">
                {workItems.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-xl bg-[#1a2030] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{item.service}</span>
                        <span className="text-slate-400">· {item.customer_name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          item.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="font-mono text-[11px] text-slate-400 mt-1">File: {item.original_filename}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status !== 'Completed' ? (
                        <button
                          onClick={() => onUpdateWorkStatus(item.id, 'Completed', `retouched_${item.original_filename}`)}
                          className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors"
                        >
                          Mark Completed
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdateWorkStatus(item.id, 'In Progress')}
                          className="bg-white/5 hover:bg-white/10 text-slate-300 px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors"
                        >
                          Reopen Job
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

    </div>
  );
};
