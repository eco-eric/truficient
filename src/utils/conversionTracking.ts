/**
 * Utility functions for tracking conversions in Meta Pixel and Google Analytics
 */

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    gtag: (...args: any[]) => void;
  }
}

export type ConversionEvent = 
  | 'Lead'
  | 'Contact'
  | 'CompleteRegistration'
  | 'SubmitApplication'
  | 'Schedule';

interface ConversionData {
  content_name?: string;
  content_category?: string;
  value?: number;
  currency?: string;
  [key: string]: any;
}

/**
 * Track a conversion event in both Meta Pixel and Google Analytics
 */
export const trackConversion = (
  event: ConversionEvent,
  data?: ConversionData
) => {
  // Track in Meta Pixel
  if (typeof window.fbq === 'function') {
    window.fbq('track', event, data);
    console.log(`[Meta Pixel] Tracked: ${event}`, data);
  }

  // Track in Google Analytics
  if (typeof window.gtag === 'function') {
    window.gtag('event', event.toLowerCase(), {
      event_category: 'conversion',
      event_label: data?.content_name || event,
      value: data?.value,
      ...data,
    });
    console.log(`[Google Analytics] Tracked: ${event}`, data);
  }
};

/**
 * Track a contact form submission
 */
export const trackContactFormSubmission = (serviceType?: string) => {
  trackConversion('Lead', {
    content_name: 'Contact Form',
    content_category: serviceType || 'General Inquiry',
  });
};

/**
 * Track an estimate calculator interaction
 */
export const trackEstimateCalculation = (estimateValue: number, serviceType: string) => {
  trackConversion('Lead', {
    content_name: 'HVAC Estimate Calculator',
    content_category: serviceType,
    value: estimateValue,
    currency: 'USD',
  });
};

/**
 * Track when user clicks to get an exact quote from the calculator
 */
export const trackGetQuoteClick = (estimateValue?: number) => {
  trackConversion('Lead', {
    content_name: 'Get Exact Quote Click',
    content_category: 'HVAC Estimate',
    value: estimateValue,
    currency: 'USD',
  });
};

/**
 * Track phone call clicks
 */
export const trackPhoneCallClick = (source: string) => {
  trackConversion('Contact', {
    content_name: 'Phone Call Click',
    content_category: source,
  });
};

/**
 * Track a job application submission
 */
export const trackJobApplicationSubmission = (position: string) => {
  trackConversion('SubmitApplication', {
    content_name: 'Job Application',
    content_category: position,
  });
};
