export interface PromoConfig {
  apiKey: string;
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

export interface APIError {
  status: number;
  statusText: string;
  message: string;
  details?: any;
  endpoint?: string;
  timestamp: string;
}

export class PromoError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly details?: any;
  public readonly endpoint?: string;
  public readonly timestamp: string;

  constructor(error: APIError) {
    super(error.message);
    this.name = 'PromoError';
    this.status = error.status;
    this.statusText = error.statusText;
    this.details = error.details;
    this.endpoint = error.endpoint;
    this.timestamp = error.timestamp;
  }

  get isNetworkError(): boolean {
    return this.status === 0 || this.status >= 500;
  }

  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  get isConflictError(): boolean {
    return this.status === 409;
  }

  get isUnauthorizedError(): boolean {
    return this.status === 401;
  }

  get isForbiddenError(): boolean {
    return this.status === 403;
  }

  get isNotFoundError(): boolean {
    return this.status === 404;
  }

  get isRateLimitError(): boolean {
    return this.status === 429;
  }

  getUserFriendlyMessage(): string {
    switch (this.status) {
      case 409:
        if (this.endpoint?.includes('/waitlist/create')) {
          return 'This email is already on the waitlist. Check your inbox for your referral link!';
        }
        return 'This resource already exists.';
      case 401:
        return 'Authentication failed. Please check your API key.';
      case 403:
        return 'You don\'t have permission to access this resource.';
      case 404:
        return 'The requested resource was not found.';
      case 429:
        return 'Too many requests. Please try again in a few moments.';
      case 0:
        return 'Network error. Please check your internet connection.';
      default:
        if (this.isNetworkError) {
          return 'Server error. Please try again later.';
        }
        return this.message || 'An unexpected error occurred.';
    }
  }
}