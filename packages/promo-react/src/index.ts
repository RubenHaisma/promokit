export { PromoProvider, usePromo } from './components/PromoProvider';
export { Waitlist } from './components/Waitlist';
export { TestimonialWall } from './components/TestimonialWall';
export { ChangelogFeed } from './components/ChangelogFeed';
export { ErrorDisplay } from './components/ErrorDisplay';
export { useReferral } from './hooks/useReferral';

export type {
  PromoConfig,
  WaitlistProps,
  TestimonialWallProps,
  ChangelogFeedProps,
  Testimonial,
  ChangelogEntry,
  WaitlistEntry
} from './types';

export type {
  ErrorDisplayProps,
  ComponentPromoError
} from './components/ErrorDisplay';

export type {
  ReferralData,
  UseReferralOptions
} from './hooks/useReferral';