import React, { useState } from 'react';
import { Film, Upload, CheckCircle2, Clock, Music, Sparkles, Send, FileVideo } from 'lucide-react';

interface VideoEditingViewProps {
  onQueueWork: (filename: string, fileType: 'Video', description: string) => void;
  onNavigate: (page: string) => void;
}

export const VideoEditingView: React.FC<VideoEditingViewProps> = ({
  onQueueWork,
  onNavigate,
}) => {
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [videoStyle, setVideoStyle] = useState<string>('Wedding Highlight');
  const [aspectRatio, setAspectRatio] = useState<string>('16:9 Landscape');
  const [moodMusic, setMoodMusic] = useState<string>('Romantic & Emotional');
  const [instructions, setInstructions] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const filename = selectedFileName || 'raw_wedding_footage.mp4';
    const fullDesc = `Style: ${videoStyle} (${aspectRatio}) | Music: ${moodMusic}. Notes: ${instructions || 'Color grade and sync cuts to rhythm.'}`;

    setTimeout(() => {
      onQueueWork(filename, 'Video', fullDesc);
      setIsSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
      
      {/* Studio Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Film className="w-3.5 h-3.5" />
          <span>Post-Production Suite</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Request Video Editing
        </h1>
        <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
          Upload your video and tell us what changes you need. Our editing team will process your video and provide the completed file.
        </p>
      </div>

      {submitted ? (
        <div className="bg-[#12151e] border border-amber-400/30 rounded-3xl p-10 text-center max-w-xl mx-auto shadow-2xl animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Video Submitted to Studio Queue!</h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Our video editors have received your project brief. You can track progress, review editor notes, and download the finished master video from your <strong>My Work</strong> section.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('my-work')}
              className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              Track in My Work
            </button>
            <button
              onClick={() => {
                setSubmitted(false);
                setSelectedFileName('');
                setInstructions('');
              }}
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-slate-300 font-medium px-6 py-3 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Submit Another Video
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Upload & Instructions Form (8 cols) */}
          <div className="lg:col-span-8 bg-[#12151e] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* File Upload Zone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Upload Video Footage (.MP4, .MOV, .MKV)
                </label>

                <label className="border-2 border-dashed border-white/15 hover:border-amber-400/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <FileVideo className="w-6 h-6" />
                  </div>
                  
                  {selectedFileName ? (
                    <div className="text-center">
                      <span className="text-amber-400 font-bold text-sm block">{selectedFileName}</span>
                      <span className="text-slate-500 text-xs mt-1 block">Click to change video file</span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="text-slate-200 font-semibold text-sm block">Drag and drop footage or click to browse</span>
                      <span className="text-slate-500 text-xs mt-1 block">Supports 4K, 1080p clips up to 2GB</span>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Style & Aspect Ratio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Editing Style
                  </label>
                  <select
                    value={videoStyle}
                    onChange={(e) => setVideoStyle(e.target.value)}
                    className="w-full bg-[#171b26] border border-white/15 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Wedding Highlight">Wedding Highlight Film</option>
                    <option value="Romantic Pre-Wedding Teaser">Romantic Pre-Wedding Teaser</option>
                    <option value="Instagram Reel / TikTok">Instagram Reel / 9:16 Shorts</option>
                    <option value="Color Grading & LUT Mastery">Color Grading &amp; LUT Mastery</option>
                    <option value="Travel / Vlog Narrative">Travel / Vlog Narrative</option>
                    <option value="Commercial & Brand Promo">Commercial &amp; Brand Promo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Target Aspect Ratio
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full bg-[#171b26] border border-white/15 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-amber-400"
                  >
                    <option value="16:9 Landscape">16:9 Widescreen (YouTube, TV)</option>
                    <option value="9:16 Vertical">9:16 Vertical (Reels, TikTok)</option>
                    <option value="1:1 Square">1:1 Square (Instagram Feed)</option>
                    <option value="4:5 Portrait">4:5 Social Portrait</option>
                  </select>
                </div>
              </div>

              {/* Music Mood */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-amber-400" />
                  <span>Desired Music &amp; Audio Mood</span>
                </label>
                <select
                  value={moodMusic}
                  onChange={(e) => setMoodMusic(e.target.value)}
                  className="w-full bg-[#171b26] border border-white/15 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-amber-400"
                >
                  <option value="Romantic & Emotional">Romantic, Soft &amp; Emotional</option>
                  <option value="Cinematic Orchestral">Cinematic Grand Orchestral</option>
                  <option value="Upbeat & Energetic Beats">Upbeat &amp; Energetic Rhythms</option>
                  <option value="Modern Lo-Fi & Chill">Modern Lo-Fi &amp; Chill Beats</option>
                  <option value="Client Provided Audio">I will provide my own specific song/audio</option>
                </select>
              </div>

              {/* Editing Instructions */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Editing Instructions &amp; Specific Changes Needed
                </label>
                <textarea
                  rows={4}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Please trim out the shaky start. Add smooth slow motion at the ring exchange. Color grade with warm golden tones. Add subtitle 'Forever & Always' at 0:45..."
                  className="w-full bg-[#171b26] border border-white/15 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-amber-400 placeholder:text-slate-600 leading-relaxed"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold py-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Submitting to Studio Queue...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Video Request &mdash; Starting ₹499</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Pricing & Process Explainer (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#12151e] border border-white/10 rounded-3xl p-6 shadow-xl">
              <span className="text-amber-400 text-[11px] font-bold uppercase tracking-wider block mb-1">
                Studio Guarantee
              </span>
              <h3 className="text-white font-bold text-lg mb-3">Professional Post-Production</h3>

              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Beat-synced dynamic cuts tailored to your song choice.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Cinematic Hollywood-grade color grading (Rec.709).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Speech clarity equalization &amp; wind noise removal.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Two rounds of complimentary revisions included.</span>
                </li>
              </ul>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block">Rate</span>
                  <span className="font-extrabold text-amber-400 text-base">₹499 / video</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block">Delivery</span>
                  <span className="font-bold text-white flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    48 Hours
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
