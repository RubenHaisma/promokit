import { PromoConfig, ChangelogEntry, CreateChangelogRequest } from '../types';

export class ChangelogAPI {
  constructor(private config: PromoConfig) {}

  async create(data: CreateChangelogRequest): Promise<{
    id: string;
    version: string;
    title: string;
    publishedAt: string;
  }> {
    const response = await fetch(`${this.config.baseUrl}/api/changelog/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to create changelog entry: ${response.statusText}`);
    }

    return response.json();
  }

  async getAll(projectId: string, options?: { 
    limit?: number; 
    offset?: number;
  }): Promise<ChangelogEntry[]> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());

    const response = await fetch(`${this.config.baseUrl}/api/changelog/${projectId}?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to get changelog entries: ${response.statusText}`);
    }

    return response.json();
  }

  async update(entryId: string, data: Partial<CreateChangelogRequest>): Promise<ChangelogEntry> {
    const response = await fetch(`${this.config.baseUrl}/api/changelog/${entryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to update changelog entry: ${response.statusText}`);
    }

    return response.json();
  }

  async delete(entryId: string): Promise<void> {
    const response = await fetch(`${this.config.baseUrl}/api/changelog/${entryId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to delete changelog entry: ${response.statusText}`);
    }
  }
}