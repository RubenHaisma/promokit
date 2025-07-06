import { PromoConfig, WaitlistEntry, CreateWaitlistRequest } from '../types';

export class WaitlistAPI {
  constructor(private config: PromoConfig) {}

  async create(data: CreateWaitlistRequest): Promise<WaitlistEntry> {
    const response = await fetch(`${this.config.baseUrl}/api/waitlist/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to create waitlist entry: ${response.statusText}`);
    }

    return response.json();
  }

  async getStats(projectId: string): Promise<{
    totalSignups: number;
    signupsToday: number;
    signupsThisWeek: number;
    referralStats: Array<{ referrer: string; count: number }>;
  }> {
    const response = await fetch(`${this.config.baseUrl}/api/waitlist/${projectId}/stats`, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to get waitlist stats: ${response.statusText}`);
    }

    return response.json();
  }

  async remove(projectId: string, email: string): Promise<void> {
    const response = await fetch(`${this.config.baseUrl}/api/waitlist/${projectId}/remove`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to remove from waitlist: ${response.statusText}`);
    }
  }

  async export(projectId: string, format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    const response = await fetch(`${this.config.baseUrl}/api/waitlist/${projectId}/export?format=${format}`, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to export waitlist: ${response.statusText}`);
    }

    return response.blob();
  }
}