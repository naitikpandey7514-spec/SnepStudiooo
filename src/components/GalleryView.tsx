import React, { useState } from 'react';
import { X, Download, ZoomIn, Camera } from 'lucide-react';
import { GALLERY_ITEMS, GalleryPhoto } from '../data/photographyData';

export const GalleryView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activePhoto, setActivePhoto] = useState<GalleryPhoto | null>(null);

  const categories = ['All', 'Wedding', 'Pre-Wedding', 'Portrait', 'Events', 'Editing'];

  const filteredPhotos = selectedCategory === 'All' 
    ? GALLERY_ITEMS 
    : GALLERY_ITEMS.filter(p => p.category === selectedCategory);

  const handleDownload = (photo: GalleryPhoto) => {
    // Real download simulation for gallery photo
    const link = document.createElement('a');
    link.href = photo.image;
    link.target = '_blank';
    link.download = `SnepStudio_${photo.title.replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
          Captured Memories
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mt-2 mb-3">
          Our Studio Gallery
        </h1>
        <p className="text-slate-400 text-sm">
          Browse through our curated collection of intimate weddings, pre-wedding destination shoots, studio portraits, and master color grades.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20 scale-105'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPhotos.map(photo => (
          <div
            key={photo.id}
            onClick={() => setActivePhoto(photo)}
            className="group relative h-80 rounded-2xl overflow-hidden border border-white/10 cursor-pointer shadow-lg bg-[#141822]"
          >
            <img
              src={photo.image}
              alt={photo.title}
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
              loading="lazy"
            />
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6">
              <div className="flex justify-end">
                <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white">
                  <ZoomIn className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                  {photo.category}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{photo.title}</h3>
                <p className="text-xs text-slate-300 mt-1">{photo.caption}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full flex flex-col items-center">
            
            {/* Close Button */}
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute -top-12 right-0 text-slate-400 hover:text-white p-2 cursor-pointer"
            >
              <X className="w-7 h-7" />
            </button>

            {/* Photo */}
            <div className="rounded-2xl overflow-hidden max-h-[75vh] border border-white/15 shadow-2xl">
              <img
                src={activePhoto.image}
                alt={activePhoto.title}
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>

            {/* Photo Metadata Bar */}
            <div className="mt-4 w-full flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#12151e] border border-white/10 p-4 rounded-xl">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
                    {activePhoto.category}
                  </span>
                  <span className="text-slate-600">&bull;</span>
                  <h3 className="text-white font-bold text-sm sm:text-base">{activePhoto.title}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{activePhoto.caption}</p>
              </div>

              <button
                onClick={() => handleDownload(activePhoto)}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save High-Res</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
