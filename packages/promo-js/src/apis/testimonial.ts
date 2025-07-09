import { PromoConfig, Testimonial, APIResponse } from '../types';

interface RequestClient {
  request<T>(endpoint: string, options?: RequestInit): Promise<T>;
}

export class TestimonialAPI {
  constructor(private config: PromoConfig, private client: RequestClient) {}

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
    return this.client.request<Testimonial>('/testimonial/submit', {
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

    return this.client.request(`/testimonial/${productId}?${params.toString()}`);
  }

  async approve(testimonialId: string): Promise<APIResponse> {
    return this.client.request<APIResponse>(`/testimonial/${testimonialId}/approve`, {
      method: 'POST',
    });
  }

  async reject(testimonialId: string): Promise<APIResponse> {
    return this.client.request<APIResponse>(`/testimonial/${testimonialId}/reject`, {
      method: 'POST',
    });
  }
}