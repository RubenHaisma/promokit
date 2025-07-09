import React from 'react';

// Import the PromoError type from the JS package
import { PromoError } from '@promokit/js';

// Global analytics interface for type safety
declare global {
  interface Window {
    analytics?: {
      track: (event: string, properties?: Record<string, any>) => void;
      identify: (userId: string, traits?: Record<string, any>) => void;
      page: (name?: string, properties?: Record<string, any>) => void;
    };
  }
  
  const analytics: {
    track: (event: string, properties?: Record<string, any>) => void;
    identify: (userId: string, traits?: Record<string, any>) => void;
    page: (name?: string, properties?: Record<string, any>) => void;
  };
}

export interface PromoConfig {
  apiKey: string;
}

export interface WaitlistProps {
  projectId: string;
  apiKey?: string; // Now optional when using PromoProvider
  theme?: 'light' | 'dark' | 'auto';
  referralReward?: string;
  referralCode?: string; // Referral code from URL params
  customStyles?: React.CSSProperties;
  onSignup?: (email: string, referralCode?: string) => void;
  onError?: (error: PromoError | Error) => void;
  showDetailedErrors?: boolean; // New prop to show detailed error information
  enableRetry?: boolean; // New prop to enable retry functionality
  className?: string;
}

export interface TestimonialWallProps {
  productId: string;
  apiKey?: string; // Now optional when using PromoProvider
  layout?: 'grid' | 'masonry' | 'carousel';
  theme?: 'light' | 'dark' | 'auto';
  autoRefresh?: boolean;
  maxItems?: number;
  showRating?: boolean;
  onTestimonialClick?: (testimonial: Testimonial) => void;
  onError?: (error: PromoError | Error) => void;
  showDetailedErrors?: boolean;
  enableRetry?: boolean;
  className?: string;
}

export interface ChangelogFeedProps {
  projectId: string;
  apiKey?: string; // Now optional when using PromoProvider
  theme?: 'light' | 'dark' | 'auto';
  showSubscribe?: boolean;
  compact?: boolean;
  maxItems?: number;
  onVersionClick?: (entry: ChangelogEntry) => void;
  onError?: (error: PromoError | Error) => void;
  showDetailedErrors?: boolean;
  enableRetry?: boolean;
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