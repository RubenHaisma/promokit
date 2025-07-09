import { useState, useEffect } from 'react';

export interface ReferralData {
  code: string | null;
  source: string | null;
  medium: string | null;
  campaign: string | null;
  timestamp: number;
  referrer: string | null;
}

export interface UseReferralOptions {
  paramNames?: string[]; // URL parameter names to check for referral codes
  persistent?: boolean; // Store in localStorage for future visits
  trackAnalytics?: boolean; // Auto-track referral events
}

export function useReferral(options: UseReferralOptions = {}) {
  const {
    paramNames = ['ref', 'referral', 'invite'],
    persistent = true,
    trackAnalytics = true
  } = options;

  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    
    // Check for referral code in URL parameters
    let referralCode = null;
    for (const param of paramNames) {
      const value = urlParams.get(param);
      if (value) {
        referralCode = value;
        break;
      }
    }

    // If no referral in URL, check localStorage
    if (!referralCode && persistent) {
      referralCode = localStorage.getItem('promokit_referral_code');
    }

    if (referralCode) {
      const data: ReferralData = {
        code: referralCode,
        source: urlParams.get('utm_source'),
        medium: urlParams.get('utm_medium'),
        campaign: urlParams.get('utm_campaign'),
        timestamp: Date.now(),
        referrer: document.referrer || null
      };

      setReferralData(data);

      // Store for future visits
      if (persistent) {
        localStorage.setItem('promokit_referral_code', referralCode);
        localStorage.setItem('promokit_referral_data', JSON.stringify(data));
      }

      // Auto-track analytics if enabled
      if (trackAnalytics && typeof window !== 'undefined') {
        // Check for common analytics tools
        if (window.analytics?.track) {
          window.analytics.track('Referral Click', {
            referral_code: referralCode,
            utm_source: data.source,
            utm_medium: data.medium,
            utm_campaign: data.campaign,
            referrer: data.referrer
          });
        }

        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
          gtag('event', 'referral_click', {
            referral_code: referralCode,
            utm_source: data.source,
            utm_medium: data.medium,
            utm_campaign: data.campaign
          });
        }

        // Facebook Pixel
        if (typeof fbq !== 'undefined') {
          fbq('trackCustom', 'ReferralClick', {
            referral_code: referralCode
          });
        }
      }
    } else if (persistent) {
      // Check if we have stored referral data
      const stored = localStorage.getItem('promokit_referral_data');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setReferralData(data);
        } catch (e) {
          localStorage.removeItem('promokit_referral_data');
        }
      }
    }

    setIsLoaded(true);
  }, [paramNames, persistent, trackAnalytics]);

  const clearReferral = () => {
    setReferralData(null);
    if (persistent && typeof window !== 'undefined') {
      localStorage.removeItem('promokit_referral_code');
      localStorage.removeItem('promokit_referral_data');
    }
  };

  const trackConversion = (email: string, newReferralCode: string) => {
    if (!referralData || !trackAnalytics || typeof window === 'undefined') return;

    const conversionData = {
      email_domain: email.split('@')[1],
      referrer_code: referralData.code,
      referee_code: newReferralCode,
      conversion_time: Date.now() - referralData.timestamp,
      utm_source: referralData.source,
      utm_medium: referralData.medium,
      utm_campaign: referralData.campaign
    };

    // Track with common analytics tools
    if (window.analytics?.track) {
      window.analytics.track('Referral Conversion', conversionData);
    }

    if (typeof gtag !== 'undefined') {
      gtag('event', 'referral_conversion', conversionData);
    }

    if (typeof fbq !== 'undefined') {
      fbq('track', 'Lead', {
        content_name: 'Waitlist Referral Conversion',
        custom_data: conversionData
      });
    }
  };

  return {
    referralData,
    isLoaded,
    clearReferral,
    trackConversion,
    // Convenience getters
    referralCode: referralData?.code || null,
    utmSource: referralData?.source || null,
    utmMedium: referralData?.medium || null,
    utmCampaign: referralData?.campaign || null
  };
}

// Global type declarations for analytics tools  
declare global {
  function gtag(...args: any[]): void;
  function fbq(...args: any[]): void;
} 