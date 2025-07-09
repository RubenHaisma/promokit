import { PromoConfig, WaitlistEntry, WaitlistStats, APIResponse } from '../types';

export class WaitlistAPI {
  constructor(private config: PromoConfig) {}

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.baseUrl}/api${endpoint}`;
    
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

  async create(data: {
    projectId: string;
    email: string;
    referralCode?: string;
    metadata?: Record<string, any>;
  }): Promise<WaitlistEntry> {
    return this.request<WaitlistEntry>('/waitlist/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getStats(projectId: string): Promise<WaitlistStats> {
    return this.request<WaitlistStats>(`/waitlist/${projectId}/stats`);
  }

  async export(projectId: string): Promise<WaitlistEntry[]> {
    return this.request<WaitlistEntry[]>(`/waitlist/${projectId}/export`);
  }

  async remove(projectId: string, email: string): Promise<APIResponse> {
    return this.request<APIResponse>(`/waitlist/${projectId}/remove`, {
      method: 'DELETE',
      body: JSON.stringify({ email }),
    });
  }
}