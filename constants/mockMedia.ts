export type MockPhoto = {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  category: 'health' | 'fitness' | 'wellness' | 'experience' | 'services';
  credit?: string;
};

export type MockVideo = {
  id: string;
  title: string;
  url: string; // mp4
  poster: string; // preview image
  category: 'health' | 'fitness' | 'wellness' | 'experience' | 'services';
  credit?: string;
};

export const MOCK_PHOTOS: MockPhoto[] = [
  {
    id: 'p-health-01',
    title: 'Doctor Consultation',
    url: 'https://images.unsplash.com/photo-1580281657527-47e4c81aa0ad?q=80&w=1600&auto=format&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1580281657527-47e4c81aa0ad?q=80&w=600&auto=format&fit=crop',
    category: 'health',
    credit: 'Unsplash',
  },
  {
    id: 'p-health-02',
    title: 'Medical Lab',
    url: 'https://images.unsplash.com/photo-1581594693700-85ae8fc8f5be?q=80&w=1600&auto=format&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581594693700-85ae8fc8f5be?q=80&w=600&auto=format&fit=crop',
    category: 'health',
    credit: 'Unsplash',
  },
  {
    id: 'p-fitness-01',
    title: 'Athlete Sprint',
    url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1600&auto=format&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600&auto=format&fit=crop',
    category: 'fitness',
    credit: 'Unsplash',
  },
  {
    id: 'p-fitness-02',
    title: 'Gym Training',
    url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1600&auto=format&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop',
    category: 'fitness',
    credit: 'Unsplash',
  },
  {
    id: 'p-wellness-01',
    title: 'Meditation',
    url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1600&auto=format&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop',
    category: 'wellness',
    credit: 'Unsplash',
  },
  {
    id: 'p-wellness-02',
    title: 'Healthy Breakfast',
    url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1600&auto=format&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=600&auto=format&fit=crop',
    category: 'wellness',
    credit: 'Unsplash',
  },
  {
    id: 'p-experience-01',
    title: 'Smartwatch Health',
    url: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?q=80&w=1600&auto=format&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?q=80&w=600&auto=format&fit=crop',
    category: 'experience',
    credit: 'Unsplash',
  },
  {
    id: 'p-experience-02',
    title: 'Telemedicine',
    url: 'https://images.unsplash.com/photo-1584420364154-1c8a9b0f6f5c?q=80&w=1600&auto=format&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1584420364154-1c8a9b0f6f5c?q=80&w=600&auto=format&fit=crop',
    category: 'experience',
    credit: 'Unsplash',
  },
  {
    id: 'p-services-01',
    title: 'Clinic Exterior',
    url: 'https://images.unsplash.com/photo-1576765608501-b3f1e3e4a8e0?q=80&w=1600&auto=format&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1576765608501-b3f1e3e4a8e0?q=80&w=600&auto=format&fit=crop',
    category: 'services',
    credit: 'Unsplash',
  },
  {
    id: 'p-services-02',
    title: 'Yoga Class',
    url: 'https://images.unsplash.com/photo-1517341724278-c1f2bda3a61c?q=80&w=1600&auto=format&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517341724278-c1f2bda3a61c?q=80&w=600&auto=format&fit=crop',
    category: 'services',
    credit: 'Unsplash',
  },
  {
    id: 'p-fitness-03',
    title: 'Cycling Outdoors',
    url: 'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?q=80&w=1600&auto=format&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?q=80&w=600&auto=format&fit=crop',
    category: 'fitness',
    credit: 'Unsplash',
  },
  {
    id: 'p-wellness-03',
    title: 'Calm Nature',
    url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=600&auto=format&fit=crop',
    category: 'wellness',
    credit: 'Unsplash',
  },
];

export const MOCK_VIDEOS: MockVideo[] = [
  {
    id: 'v-fitness-01',
    title: 'Athletes Training',
    url: 'https://cdn.coverr.co/videos/coverr-athletes-training-6045/1080p.mp4',
    poster: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop',
    category: 'fitness',
    credit: 'Coverr',
  },
  {
    id: 'v-fitness-02',
    title: 'Gym Lifting',
    url: 'https://cdn.coverr.co/videos/coverr-lifting-weights-7354/1080p.mp4',
    poster: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop',
    category: 'fitness',
    credit: 'Coverr',
  },
  {
    id: 'v-wellness-01',
    title: 'Yoga Flow',
    url: 'https://cdn.coverr.co/videos/coverr-yoga-flow-2157/1080p.mp4',
    poster: 'https://images.unsplash.com/photo-1517341724278-c1f2bda3a61c?q=80&w=1200&auto=format&fit=crop',
    category: 'wellness',
    credit: 'Coverr',
  },
  {
    id: 'v-wellness-02',
    title: 'Nature Stream',
    url: 'https://cdn.coverr.co/videos/coverr-mountain-river-2907/1080p.mp4',
    poster: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
    category: 'wellness',
    credit: 'Coverr',
  },
  {
    id: 'v-health-01',
    title: 'Telemedicine Call',
    url: 'https://cdn.coverr.co/videos/coverr-video-call-5516/1080p.mp4',
    poster: 'https://images.unsplash.com/photo-1584420364154-1c8a9b0f6f5c?q=80&w=1200&auto=format&fit=crop',
    category: 'health',
    credit: 'Coverr',
  },
  {
    id: 'v-health-02',
    title: 'Laboratory Work',
    url: 'https://cdn.coverr.co/videos/coverr-lab-works-3810/1080p.mp4',
    poster: 'https://images.unsplash.com/photo-1581594693700-85ae8fc8f5be?q=80&w=1200&auto=format&fit=crop',
    category: 'health',
    credit: 'Coverr',
  },
  {
    id: 'v-experience-01',
    title: 'Wearable Tech',
    url: 'https://cdn.coverr.co/videos/coverr-wearable-tech-4234/1080p.mp4',
    poster: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?q=80&w=1200&auto=format&fit=crop',
    category: 'experience',
    credit: 'Coverr',
  },
  {
    id: 'v-services-01',
    title: 'Clinic Lobby',
    url: 'https://cdn.coverr.co/videos/coverr-clinic-lobby-2084/1080p.mp4',
    poster: 'https://images.unsplash.com/photo-1576765608501-b3f1e3e4a8e0?q=80&w=1200&auto=format&fit=crop',
    category: 'services',
    credit: 'Coverr',
  },
];

export const MOCK_MEDIA_BY_CATEGORY = {
  health: {
    photos: MOCK_PHOTOS.filter((p) => p.category === 'health'),
    videos: MOCK_VIDEOS.filter((v) => v.category === 'health'),
  },
  fitness: {
    photos: MOCK_PHOTOS.filter((p) => p.category === 'fitness'),
    videos: MOCK_VIDEOS.filter((v) => v.category === 'fitness'),
  },
  wellness: {
    photos: MOCK_PHOTOS.filter((p) => p.category === 'wellness'),
    videos: MOCK_VIDEOS.filter((v) => v.category === 'wellness'),
  },
  experience: {
    photos: MOCK_PHOTOS.filter((p) => p.category === 'experience'),
    videos: MOCK_VIDEOS.filter((v) => v.category === 'experience'),
  },
  services: {
    photos: MOCK_PHOTOS.filter((p) => p.category === 'services'),
    videos: MOCK_VIDEOS.filter((v) => v.category === 'services'),
  },
} as const;
