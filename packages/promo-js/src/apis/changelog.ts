import { PromoConfig, ChangelogEntry, APIResponse } from '../types';

interface RequestClient {
  request<T>(endpoint: string, options?: RequestInit): Promise<T>;
}

export class ChangelogAPI {
  constructor(private config: PromoConfig, private client: RequestClient) {}

  async create(data: {
    projectId: string;
    version: string;
    title: string;
    content: string;
    changes: string[];
    publishedAt?: string;
  }): Promise<ChangelogEntry> {
    return this.client.request<ChangelogEntry>('/changelog/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async get(
    projectId: string,
    options: {
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{
    entries: ChangelogEntry[];
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

    return this.client.request(`/changelog/${projectId}?${params.toString()}`);
  }

  async subscribe(projectId: string, email: string): Promise<APIResponse> {
    return this.client.request<APIResponse>(`/changelog/${projectId}/subscribe`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async update(entryId: string, data: Partial<ChangelogEntry>): Promise<ChangelogEntry> {
    return this.client.request<ChangelogEntry>(`/changelog/${entryId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(entryId: string): Promise<APIResponse> {
    return this.client.request<APIResponse>(`/changelog/${entryId}`, {
      method: 'DELETE',
    });
  }
}