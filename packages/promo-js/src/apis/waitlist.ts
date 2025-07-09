import { PromoConfig, WaitlistEntry, WaitlistStats, APIResponse } from '../types';

interface RequestClient {
  request<T>(endpoint: string, options?: RequestInit): Promise<T>;
}

export class WaitlistAPI {
  constructor(private config: PromoConfig, private client: RequestClient) {}

  async create(data: {
    projectId: string;
    email: string;
    referralCode?: string;
    metadata?: Record<string, any>;
  }): Promise<WaitlistEntry> {
    return this.client.request<WaitlistEntry>('/waitlist/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getStats(projectId: string): Promise<WaitlistStats> {
    return this.client.request<WaitlistStats>(`/waitlist/${projectId}/stats`);
  }

  async export(projectId: string): Promise<WaitlistEntry[]> {
    return this.client.request<WaitlistEntry[]>(`/waitlist/${projectId}/export`);
  }

  async remove(projectId: string, email: string): Promise<APIResponse> {
    return this.client.request<APIResponse>(`/waitlist/${projectId}/remove`, {
      method: 'DELETE',
      body: JSON.stringify({ email }),
    });
  }
}