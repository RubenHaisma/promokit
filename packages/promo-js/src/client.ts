import { PromoConfig } from './types';
import { WaitlistAPI } from './apis/waitlist';
import { TestimonialAPI } from './apis/testimonial';
import { ChangelogAPI } from './apis/changelog';

export class PromoClient {
  private config: PromoConfig;
  public waitlist: WaitlistAPI;
  public testimonial: TestimonialAPI;
  public changelog: ChangelogAPI;

  constructor(config: PromoConfig) {
    this.config = {
      baseUrl: 'https://api.promo.dev',
      ...config,
    };

    this.waitlist = new WaitlistAPI(this.config);
    this.testimonial = new TestimonialAPI(this.config);
    this.changelog = new ChangelogAPI(this.config);
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }
}