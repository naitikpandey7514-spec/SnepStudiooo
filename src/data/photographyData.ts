export interface StudioService {
  id: string;
  name: string;
  tagline: string;
  price: string;
  numericPrice: number;
  image: string;
  description: string;
  features: string[];
  deliverables: string;
  turnaround: string;
}

export interface GalleryPhoto {
  id: number;
  title: string;
  category: 'Wedding' | 'Pre-Wedding' | 'Portrait' | 'Events' | 'Editing';
  image: string;
  caption: string;
}

export const STUDIO_SERVICES: StudioService[] = [
  {
    id: 'photography',
    name: 'Photography',
    tagline: 'Personal portraits, creative headshots & portfolio sessions',
    price: 'Starting from ₹999',
    numericPrice: 999,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
    description: 'Capture your authentic personality with our bespoke studio or outdoor portrait sessions. Perfect for artists, professionals, fashion models, and personal brand building.',
    features: [
      '1 to 2 hours dedicated shoot session',
      'Studio lighting or natural outdoor golden hour',
      'Multiple outfit & mood changes',
      'High-resolution raw files provided',
      '5 master retouching portraits included'
    ],
    deliverables: '25+ Master Digital Photos in 4K resolution',
    turnaround: '48 to 72 hours'
  },
  {
    id: 'wedding',
    name: 'Wedding Shoot',
    tagline: 'Grand celebrations, rituals & timeless wedding memories',
    price: 'Starting from ₹9,999',
    numericPrice: 9999,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    description: 'Every wedding is a once-in-a-lifetime tapestry of emotions, rituals, and unforgettable celebrations. Our team documents every tear, smile, and dance move with cinematic poise.',
    features: [
      'Full-day coverage across all traditional ceremonies',
      'Dual photographer & cinematic videographer team',
      'Aerial 4K drone cinematography',
      'Handcrafted premium hardcover album preview',
      'Teaser highlight reel for social media within 48h'
    ],
    deliverables: '300+ Color-Graded Photos + 15-min Cinematic Film',
    turnaround: '7 to 10 business days'
  },
  {
    id: 'pre-wedding',
    name: 'Pre-Wedding Shoot',
    tagline: 'Romantic storytelling at breathtaking locations',
    price: 'Starting from ₹4,999',
    numericPrice: 4999,
    image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80',
    description: 'Tell your love story against sun-drenched beaches, heritage palaces, or rustic countryside. We create relaxed, natural, and deeply emotional frames before your big day.',
    features: [
      'Up to 4 hours at your chosen scenic destination',
      'Concept styling & creative theme planning',
      'Prop curation (fairy lights, smoke effects, lanterns)',
      'Drone aerial couple portraits',
      'Music sync romantic video reel'
    ],
    deliverables: '50+ High-Res Retouched Frames + 2-min Teaser',
    turnaround: '3 to 5 business days'
  },
  {
    id: 'photo-editing',
    name: 'Photo Editing',
    tagline: 'Pro skin retouching, color grading & background cleanup',
    price: 'Starting from ₹99 / photo',
    numericPrice: 99,
    image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=80',
    description: 'Transform your raw shots into publication-ready art. We offer frequency separation skin retouching, film color grading, sky replacement, and unwanted object removal.',
    features: [
      'Advanced frequency separation & skin smoothing',
      'Custom cinematic LUT & color grading',
      'Blemish, glare & flyaway hair removal',
      'Lighting & exposure balance correction',
      'Direct online browser tool + studio artist queue'
    ],
    deliverables: 'High-Res TIFF / PNG / JPEG with color profile',
    turnaround: '24 hours'
  },
  {
    id: 'video-editing',
    name: 'Video Editing',
    tagline: 'Cinematic cutting, dynamic sound design & color mastery',
    price: 'Starting from ₹499 / video',
    numericPrice: 499,
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
    description: 'Turn your raw clips into engaging reels, cinematic wedding recaps, or commercial videos. We synchronize cuts to rhythmic beats, perform audio cleaning, and add subtitles.',
    features: [
      'Beat-synced dynamic cuts and transitions',
      'Audio noise reduction & background music licensing',
      'Custom typography and subtitle animation',
      'Rec.709 & HDR cinematic color grading',
      'Multiple aspect ratios (9:16 Reels, 16:9 4K)'
    ],
    deliverables: 'Master 4K MP4 file optimized for all platforms',
    turnaround: '48 hours'
  }
];

export const GALLERY_ITEMS: GalleryPhoto[] = [
  {
    id: 1,
    title: 'Golden Sunset Vows',
    category: 'Wedding',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    caption: 'Intimate outdoor ceremony under golden sunset hues'
  },
  {
    id: 2,
    title: 'Ethereal Forest Romance',
    category: 'Pre-Wedding',
    image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80',
    caption: 'Dreamy couple portrait framed by morning woodland mist'
  },
  {
    id: 3,
    title: 'Studio High-Contrast Monolith',
    category: 'Portrait',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
    caption: 'Chiaroscuro studio lighting capturing raw expression'
  },
  {
    id: 4,
    title: 'Traditional Henna & Joy',
    category: 'Wedding',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
    caption: 'Candid laughter during the sangeet celebration'
  },
  {
    id: 5,
    title: 'Lakeside Twilight Embrace',
    category: 'Pre-Wedding',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
    caption: 'Cinematic reflections over serene lake waters'
  },
  {
    id: 6,
    title: 'Editorial Fashion Portrait',
    category: 'Portrait',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80',
    caption: 'Crisp 85mm prime lens depth and authentic texture'
  },
  {
    id: 7,
    title: 'Lantern Festival Euphoria',
    category: 'Events',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
    caption: 'Ambient light capturing nighttime celebration energy'
  },
  {
    id: 8,
    title: 'Cinematic Color Grading Suite',
    category: 'Editing',
    image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=80',
    caption: 'Before-and-after dynamic range tone curve perfection'
  },
  {
    id: 9,
    title: 'Heritage Palace Gala',
    category: 'Events',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
    caption: 'Grand architectural framing of royal family banquet'
  }
];

export const TESTIMONIALS = [
  {
    name: 'Priya & Vikram Nair',
    service: 'Wedding & Pre-Wedding Shoot',
    text: 'SnepStudio captured our wedding with such tenderness and artful poise. Looking at our photos feels like reliving every second of joy. The colors and candids are simply breathtaking!',
    location: 'Mumbai, India',
    rating: 5
  },
  {
    name: 'Arjun Sen',
    service: 'Professional Portrait Session',
    text: 'As an actor, my headshots determine auditions. The lighting setup and gentle direction from SnepStudio brought out my true character. Exceptional 48-hour turnaround.',
    location: 'Pune, India',
    rating: 5
  },
  {
    name: 'Aanya Mehra',
    service: 'Video Editing & Color Grading',
    text: 'I sent raw holiday footage from my Goa trip. Within two days, SnepStudio delivered a cinematic masterpiece synced to rhythm that brought tears to my eyes.',
    location: 'Bangalore, India',
    rating: 5
  }
];
