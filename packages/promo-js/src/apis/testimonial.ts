import { PromoConfig, Testimonial, CreateTestimonialRequest } from '../types';

export class TestimonialAPI {
  constructor(private config: PromoConfig) {}

  async submit(data: CreateTestimonialRequest): Promise<{
    id: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
  }> {
    const response = await fetch(`${this.config.baseUrl}/api/testimonial/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to submit testimonial: ${response.statusText}`);
    }

    return response.json();
  }

  async getAll(projectId: string, options?: { 
    limit?: number; 
    offset?: number; 
    status?: 'pending' | 'approved' | 'rejected';
  }): Promise<{
    testimonials: Testimonial[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  }> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.status) params.append('status', options.status);

    const response = await fetch(`${this.config.baseUrl}/api/testimonial/${projectId}?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to get testimonials: ${response.statusText}`);
    }

    return response.json();
  }

  async approve(testimonialId: string): Promise<void> {
    const response = await fetch(`${this.config.baseUrl}/api/testimonial/${testimonialId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to approve testimonial: ${response.statusText}`);
    }
  }

  async reject(testimonialId: string): Promise<void> {
    const response = await fetch(`${this.config.baseUrl}/api/testimonial/${testimonialId}/reject`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to reject testimonial: ${response.statusText}`);
    }
  }
}