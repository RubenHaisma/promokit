export interface PromoConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface WaitlistProps {
  projectId: string;
  theme?: 'light' | 'dark' | 'auto';
  referralReward?: string;
  customStyles?: React.CSSProperties;
  onSignup?: (email: string, referralCode?: string) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export interface TestimonialWallProps {
  projectId: string;
  layout?: 'grid' | 'masonry' | 'carousel';
  theme?: 'light' | 'dark' | 'auto';
  maxItems?: number;
  autoRefresh?: boolean;
  showRating?: boolean;
  customStyles?: React.CSSProperties;
  className?: string;
}

export interface ChangelogFeedProps {
  projectId: string;
  theme?: 'light' | 'dark' | 'auto';
  showSubscribe?: boolean;
  compact?: boolean;
  maxItems?: number;
  customStyles?: React.CSSProperties;
  className?: string;
}