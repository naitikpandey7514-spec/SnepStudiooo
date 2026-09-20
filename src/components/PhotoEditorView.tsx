import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, RotateCw, RefreshCw, Download, Sparkles, Sliders, 
  Image as ImageIcon, Check, Eye, SlidersHorizontal, ArrowLeftRight, Send
} from 'lucide-react';

interface PhotoEditorViewProps {
  onQueueWork?: (filename: string, fileType: 'Photo', description: string) => void;
  onNavigate?: (page: string) => void;
}

const SAMPLE_PHOTOS = [
  {
    name: 'Studio Portrait',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80'
  },
  {
    name: 'Golden Hour Couple',
    url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1000&q=80'
  },
  {
    name: 'Scenic Wedding',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80'
  }
];

export const PhotoEditorView: React.FC<PhotoEditorViewProps> = ({ onQueueWork, onNavigate }) => {
  // Image source state
  const [imageSrc, setImageSrc] = useState<string>(SAMPLE_PHOTOS[0].url);
  const [originalImageName, setOriginalImageName] = useState<string>('studio_portrait.jpg');

  // Sliders
  const [brightness, setBrightness] = useState<number>(0); // -100 to 100
  const [contrast, setContrast] = useState<number>(0); // -100 to 100
  const [saturation, setSaturation] = useState<number>(0); // -100 to 100
  const [blur, setBlur] = useState<number>(0); // 0 to 20

  // Rotation & Aspect
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState<boolean>(false);
  const [aspectCrop, setAspectCrop] = useState<'original' | '1:1' | '4:3' | '16:9'>('original');

  // Filter effect
  const [filterEffect, setFilterEffect] = useState<'original' | 'vintage' | 'warm' | 'cool' | 'grayscale' | 'sepia' | 'blackwhite'>('original');

  // Before / After toggle or split slider
  const [viewMode, setViewMode] = useState<'split' | 'toggle'>('split');
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const [splitPos, setSplitPos] = useState<number>(50); // percentage 0 - 100

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalImgRef = useRef<HTMLImageElement | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [submittedToQueue, setSubmittedToQueue] = useState<boolean>(false);

  // Load image object
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      originalImgRef.current = img;
      renderCanvas();
    };
  }, [imageSrc]);

  // Re-render canvas whenever controls change
  useEffect(() => {
    if (originalImgRef.current) {
      renderCanvas();
    }
  }, [brightness, contrast, saturation, blur, rotation, flipH, aspectCrop, filterEffect]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    const img = originalImgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate source aspect crop
    let sx = 0;
    let sy = 0;
    let sWidth = img.naturalWidth || img.width;
    let sHeight = img.naturalHeight || img.height;

    if (aspectCrop === '1:1') {
      const size = Math.min(sWidth, sHeight);
      sx = (sWidth - size) / 2;
      sy = (sHeight - size) / 2;
      sWidth = size;
      sHeight = size;
    } else if (aspectCrop === '4:3') {
      const targetRatio = 4 / 3;
      if (sWidth / sHeight > targetRatio) {
        const newW = sHeight * targetRatio;
        sx = (sWidth - newW) / 2;
        sWidth = newW;
      } else {
        const newH = sWidth / targetRatio;
        sy = (sHeight - newH) / 2;
        sHeight = newH;
      }
    } else if (aspectCrop === '16:9') {
      const targetRatio = 16 / 9;
      if (sWidth / sHeight > targetRatio) {
        const newW = sHeight * targetRatio;
        sx = (sWidth - newW) / 2;
        sWidth = newW;
      } else {
        const newH = sWidth / targetRatio;
        sy = (sHeight - newH) / 2;
        sHeight = newH;
      }
    }

    // Determine canvas dimensions based on rotation
    const isSideways = rotation % 180 !== 0;
    canvas.width = isSideways ? sHeight : sWidth;
    canvas.height = isSideways ? sWidth : sHeight;

    ctx.save();

    // Move to center of canvas for transformations
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    if (flipH) {
      ctx.scale(-1, 1);
    }

    // Compose CSS filter string
    // Calculate brightness % (100% is neutral)
    const bVal = 100 + brightness;
    // Calculate contrast % (100% is neutral)
    const cVal = 100 + contrast;
    // Calculate saturation % (100% is neutral)
    let satVal = 100 + saturation;
    // Blur in px
    const blurVal = blur;

    let filterStr = `brightness(${bVal}%) contrast(${cVal}%) blur(${blurVal}px) `;

    // Apply specific effect filters
    switch (filterEffect) {
      case 'vintage':
        filterStr += `sepia(40%) saturate(${satVal * 0.85}%) hue-rotate(-15deg)`;
        break;
      case 'warm':
        filterStr += `sepia(25%) saturate(${satVal * 1.15}%)`;
        break;
      case 'cool':
        filterStr += `hue-rotate(20deg) saturate(${satVal * 1.05}%)`;
        break;
      case 'grayscale':
        filterStr += `grayscale(100%)`;
        break;
      case 'sepia':
        filterStr += `sepia(85%) saturate(${satVal * 0.9}%)`;
        break;
      case 'blackwhite':
        filterStr += `grayscale(100%) contrast(${Math.max(140, cVal * 1.4)}%)`;
        break;
      case 'original':
      default:
        filterStr += `saturate(${satVal}%)`;
        break;
    }

    ctx.filter = filterStr;

    // Draw the cropped image centered
    const drawW = isSideways ? canvas.height : canvas.width;
    const drawH = isSideways ? canvas.width : canvas.height;
    ctx.drawImage(img, sx, sy, sWidth, sHeight, -drawW / 2, -drawH / 2, drawW, drawH);

    ctx.restore();

    // Prepare download URL
    try {
      setDownloadUrl(canvas.toDataURL('image/jpeg', 0.92));
    } catch (e) {
      // CORS fallback
      console.warn("Canvas export constrained by remote image CORS", e);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOriginalImageName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageSrc(event.target.result as string);
          handleReset();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setBlur(0);
    setRotation(0);
    setFlipH(false);
    setAspectCrop('original');
    setFilterEffect('original');
    setShowOriginal(false);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const link = document.createElement('a');
      link.download = `SnepStudio_Edited_${originalImageName.replace(/\.[^/.]+$/, "")}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      if (downloadUrl) {
        const link = document.createElement('a');
        link.download = `SnepStudio_Edited_${originalImageName}`;
        link.href = downloadUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  const handleSubmitToQueue = () => {
    if (onQueueWork) {
      onQueueWork(
        `edited_${originalImageName}`,
        'Photo',
        `Adjusted with ${filterEffect} tone and basic tuning. Requested studio master pass.`
      );
      setSubmittedToQueue(true);
      setTimeout(() => setSubmittedToQueue(false), 3000);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Studio In-Browser Suite</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Edit Your Photo
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          Adjust lighting, color balance, apply vintage and monochrome effects, and compare before/after in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ============================================================== */}
        {/* PREVIEW CANVAS AREA (7 cols on lg)                             */}
        {/* ============================================================== */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-[#12151e] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col">
            
            {/* Top Toolbar: Upload + Sample Pickers */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <label className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={handleReset}
                  className="bg-white/5 hover:bg-white/10 text-slate-300 px-3 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Sample presets */}
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <span>Samples:</span>
                {SAMPLE_PHOTOS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setImageSrc(s.url);
                      setOriginalImageName(`${s.name.toLowerCase().replace(/ /g, '_')}.jpg`);
                      handleReset();
                    }}
                    className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                      imageSrc === s.url ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30 font-semibold' : 'hover:bg-white/5 text-slate-300'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Stage: Interactive Image Box */}
            <div className="relative mt-4 flex items-center justify-center min-h-[380px] sm:min-h-[480px] bg-black/60 rounded-xl overflow-hidden border border-white/5">
              
              {/* Actual Off-screen Canvas doing the transformations */}
              <canvas
                ref={canvasRef}
                className={`max-w-full max-h-[500px] object-contain transition-opacity duration-200 ${
                  showOriginal ? 'opacity-0 absolute' : 'opacity-100'
                }`}
              />

              {/* Original Preview for Before / After toggling */}
              {showOriginal && (
                <img
                  src={imageSrc}
                  alt="Original Raw"
                  className="max-w-full max-h-[500px] object-contain animate-fade-in"
                />
              )}

              {/* Before/After View Mode Toggle Floating Pill */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-black/80 backdrop-blur-md border border-white/20 p-1 rounded-full text-[11px] shadow-lg">
                <button
                  onMouseDown={() => setShowOriginal(true)}
                  onMouseUp={() => setShowOriginal(false)}
                  onTouchStart={() => setShowOriginal(true)}
                  onTouchEnd={() => setShowOriginal(false)}
                  className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                    showOriginal ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:text-white'
                  }`}
                  title="Hold down to see raw original photo"
                >
                  Hold for Before
                </button>
                <span className="text-slate-500">|</span>
                <span className="px-2 text-amber-300 font-semibold">
                  {showOriginal ? 'Original' : 'Edited Preview'}
                </span>
              </div>

              {/* Filter badge */}
              <div className="absolute top-4 right-4 z-20 bg-black/70 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-md text-[10px] uppercase font-mono text-amber-300">
                Filter: {filterEffect}
              </div>
            </div>

            {/* Bottom Actions: Download & Submit */}
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                Resolution: <strong className="text-white">High Quality JPEG</strong> &middot; Color Calibrated
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleDownload}
                  className="flex-1 sm:flex-none bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Edited Photo</span>
                </button>

                {onQueueWork && (
                  <button
                    onClick={handleSubmitToQueue}
                    disabled={submittedToQueue}
                    className="bg-white/10 hover:bg-white/15 text-white border border-white/15 font-semibold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    title="Send this edited preview to the studio team for master retouchers"
                  >
                    {submittedToQueue ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Send className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{submittedToQueue ? 'Sent to Studio' : 'Submit to Queue'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* CONTROLS SIDEBAR (4 cols on lg)                                */}
        {/* ============================================================== */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* 1. Artistic Filters */}
          <div className="bg-[#12151e] border border-white/10 rounded-2xl p-5 shadow-xl">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Artistic Filters</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'original', label: 'Original' },
                { id: 'vintage', label: 'Vintage Tone' },
                { id: 'warm', label: 'Warm Glow' },
                { id: 'cool', label: 'Cool Cinematic' },
                { id: 'grayscale', label: 'Grayscale' },
                { id: 'sepia', label: 'Sepia Classic' },
                { id: 'blackwhite', label: 'High B&W' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterEffect(f.id as any)}
                  className={`px-3 py-2 rounded-xl text-left font-medium transition-all cursor-pointer ${
                    filterEffect === f.id
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Manual Sliders */}
          <div className="bg-[#12151e] border border-white/10 rounded-2xl p-5 shadow-xl">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Fine Adjustments</span>
            </h3>

            <div className="space-y-4 text-xs">
              {/* Brightness */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1 font-medium">
                  <span>Brightness</span>
                  <span className="font-mono text-amber-400">{brightness > 0 ? `+${brightness}` : brightness}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Contrast */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1 font-medium">
                  <span>Contrast</span>
                  <span className="font-mono text-amber-400">{contrast > 0 ? `+${contrast}` : contrast}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Saturation */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1 font-medium">
                  <span>Saturation</span>
                  <span className="font-mono text-amber-400">{saturation > 0 ? `+${saturation}` : saturation}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Blur */}
              <div>
                <div className="flex justify-between text-slate-300 mb-1 font-medium">
                  <span>Soft Focus / Blur</span>
                  <span className="font-mono text-amber-400">{blur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={blur}
                  onChange={(e) => setBlur(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 3. Framing & Geometry Tools */}
          <div className="bg-[#12151e] border border-white/10 rounded-2xl p-5 shadow-xl">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-amber-400" />
              <span>Crop &amp; Orientation</span>
            </h3>

            {/* Aspect Presets */}
            <div className="mb-4">
              <label className="block text-[11px] text-slate-400 mb-2">Aspect Ratio Crop</label>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {[
                  { id: 'original', label: 'Full' },
                  { id: '1:1', label: '1:1' },
                  { id: '4:3', label: '4:3' },
                  { id: '16:9', label: '16:9' },
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => setAspectCrop(r.id as any)}
                    className={`py-1.5 rounded-lg text-center font-medium transition-colors cursor-pointer ${
                      aspectCrop === r.id ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Transform buttons */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="bg-white/5 hover:bg-white/10 text-slate-200 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Rotate 90&deg;</span>
              </button>

              <button
                onClick={() => setFlipH(!flipH)}
                className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  flipH ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-white/5 hover:bg-white/10 text-slate-200'
                }`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
                <span>Flip Horizontal</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
