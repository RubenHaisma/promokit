export interface PromoConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface WaitlistProps {
  projectId: string;
  apiKey: string;
  baseUrl?: string;
  theme?: 'light' | 'dark' | 'auto';
  referralReward?: string;
  customStyles?: React.CSSProperties;
  onSignup?: (email: string, referralCode?: string) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export interface TestimonialWallProps {
  productId: string;
  apiKey: string;
  baseUrl?: string;
  layout?: 'grid' | 'masonry' | 'carousel';
  theme?: 'light' | 'dark' | 'auto';
  autoRefresh?: boolean;
  maxItems?: number;
  showRating?: boolean;
  onTestimonialClick?: (testimonial: Testimonial) => void;
  className?: string;
}

export interface ChangelogFeedProps {
  projectId: string;
  apiKey: string;
  baseUrl?: string;
  theme?: 'light' | 'dark' | 'auto';
  showSubscribe?: boolean;
  compact?: boolean;
  maxItems?: number;
  onVersionClick?: (version: ChangelogEntry) => void;
  className?: string;
}

export interface Testimonial {
  id: string;
  content: string;
  author: string;
  role?: string;
  company?: string;
  avatar?: string;
  rating: number;
  createdAt: string;
}

export interface ChangelogEntry {
  id: string;
  version: string;
  title: string;
  content: string;
  changes: string[];
  publishedAt: string;
}

export interface WaitlistEntry {
  id: string;
  email: string;
  position: number;
  referralCode: string;
  referralUrl: string;
  createdAt: string;
}