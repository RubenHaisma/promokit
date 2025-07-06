export interface PromoConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface APIResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface WaitlistEntry {
  id: string;
  email: string;
  position: number;
  referralCode: string;
  referralUrl: string;
  createdAt: string;
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
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface ChangelogEntry {
  id: string;
  version: string;
  title: string;
  content: string;
  changes: string[];
  publishedAt: string;
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