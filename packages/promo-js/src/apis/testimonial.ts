import { PromoConfig, Testimonial, APIResponse } from '../types';

export class TestimonialAPI {
  constructor(private config: PromoConfig) {}

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async submit(data: {
    projectId: string;
    content: string;
    author: string;
    role?: string;
    company?: string;
    avatar?: string;
    rating?: number;
    metadata?: Record<string, any>;
  }): Promise<Testimonial> {
    return this.request<Testimonial>('/testimonial/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async get(
    productId: string,
    options: {
      limit?: number;
      offset?: number;
      status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    } = {}
  ): Promise<{
    testimonials: Testimonial[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  }> {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());
    if (options.status) params.append('status', options.status);

    return this.request(`/testimonial/${productId}?${params.toString()}`);
  }

  async approve(testimonialId: string): Promise<APIResponse> {
    return this.request<APIResponse>(`/testimonial/${testimonialId}/approve`, {
      method: 'POST',
    });
  }

  async reject(testimonialId: string): Promise<APIResponse> {
    return this.request<APIResponse>(`/testimonial/${testimonialId}/reject`, {
      method: 'POST',
    });
  }
}