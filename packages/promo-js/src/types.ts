export interface PromoConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface WaitlistEntry {
  id: string;
  email: string;
  position: number;
  referralCode?: string;
  referralUrl?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface CreateWaitlistRequest {
  projectId: string;
  email: string;
  referralCode?: string;
  metadata?: Record<string, any>;
}

export interface Testimonial {
  id: string;
  content: string;
  author: string;
  role?: string;
  company?: string;
  avatar?: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface CreateTestimonialRequest {
  projectId: string;
  content: string;
  author: string;
  role?: string;
  company?: string;
  avatar?: string;
  rating?: number;
  metadata?: Record<string, any>;
}

export interface ChangelogEntry {
  id: string;
  version: string;
  title: string;
  content: string;
  changes: string[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChangelogRequest {
  projectId: string;
  version: string;
  title: string;
  content: string;
  changes: string[];
  publishedAt?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface WaitlistStats {
  totalSignups: number;
  signupsToday: number;
  signupsThisWeek: number;
  referralStats: Array<{
    referrer: string;
    count: number;
  }>;
}

export interface TestimonialPagination {
  testimonials: Testimonial[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}