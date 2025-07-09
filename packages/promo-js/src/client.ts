import { PromoConfig } from './types';
import { WaitlistAPI } from './apis/waitlist';
import { TestimonialAPI } from './apis/testimonial';
import { ChangelogAPI } from './apis/changelog';
import { PromoError, APIError } from './types';

export class PromoClient {
  private config: PromoConfig;
  public waitlist: WaitlistAPI;
  public testimonial: TestimonialAPI;
  public changelog: ChangelogAPI;

  constructor(config: PromoConfig) {
    this.config = {
      apiKey: config.apiKey,
    };

    this.waitlist = new WaitlistAPI(this.config, this);
    this.testimonial = new TestimonialAPI(this.config, this);
    this.changelog = new ChangelogAPI(this.config, this);
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `https://promokit.pro/api${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        let errorDetails;
        let errorMessage = response.statusText || 'API request failed';

        // Try to parse error response body for more details
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            errorDetails = await response.json();
            errorMessage = errorDetails.message || errorDetails.error || errorMessage;
          } else {
            errorDetails = await response.text();
          }
        } catch (parseError) {
          // If we can't parse the error response, use the status text
          errorDetails = `Failed to parse error response: ${parseError}`;
        }

        const apiError: APIError = {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
          details: errorDetails,
          endpoint,
          timestamp: new Date().toISOString(),
        };

        throw new PromoError(apiError);
      }

      return response.json();
    } catch (error) {
      // Handle network errors (fetch throws)
      if (error instanceof PromoError) {
        throw error;
      }

      // Network error or other fetch error
      const apiError: APIError = {
        status: 0,
        statusText: 'Network Error',
        message: error instanceof Error ? error.message : 'Network request failed',
        details: error,
        endpoint,
        timestamp: new Date().toISOString(),
      };

      throw new PromoError(apiError);
    }
  }
}