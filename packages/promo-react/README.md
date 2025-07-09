# @promokit/react

React components for PromoKit - Marketing infrastructure for developers.

## Installation

```bash
npm install @promokit/react
```

## Quick Start

Simply import and use any component with your API key - no provider wrapper needed!

```jsx
import { Waitlist } from '@promokit/react';

function App() {
  return (
    <Waitlist 
      projectId="your-project-id"
      apiKey="your-api-key"
      theme="dark"
      referralReward="Skip the line"
      onSignup={(email) => console.log('New signup:', email)}
    />
  );
}
```

## Components

All components are **plug-and-play** - just pass your API credentials as props!

### Waitlist

Create viral waitlists with referral mechanics:

```jsx
import { Waitlist } from '@promokit/react';

function MyWaitlist() {
  return (
    <Waitlist 
      projectId="your-project-id"
      apiKey="your-api-key"
      theme="dark" // 'light', 'dark', or 'auto'
      referralReward="Skip 10 spots in line"
      onSignup={(email, referralCode) => {
        console.log('New signup:', email, referralCode);
        // Track with your analytics
        analytics.track('waitlist_signup', { email, referralCode });
      }}
      onError={(error) => {
        console.error('Waitlist error:', error);
        // Show user-friendly error message
      }}
      customStyles={{
        backgroundColor: '#1a1a1a',
        borderRadius: '16px'
      }}
      className="my-custom-class"
    />
  );
}
```

**Props:**

- `projectId` (string, required) - Your project ID
- `apiKey` (string, required) - Your PromoKit API key
- `theme` ('light' | 'dark' | 'auto', optional) - Color theme, defaults to 'dark'
- `referralReward` (string, optional) - Text describing referral reward, defaults to 'Skip the line'
- `customStyles` (React.CSSProperties, optional) - Custom CSS styles
- `onSignup` (function, optional) - Callback when user signs up: `(email: string, referralCode?: string) => void`
- `onError` (function, optional) - Error handler: `(error: Error) => void`
- `className` (string, optional) - Additional CSS classes

### TestimonialWall

Display customer testimonials and reviews:

```jsx
import { TestimonialWall } from '@promokit/react';

function MyTestimonials() {
  return (
    <TestimonialWall 
      productId="your-project-id"
      apiKey="your-api-key"
      layout="masonry" // 'grid', 'masonry', or 'carousel'
      theme="auto"
      maxItems={12}
      autoRefresh={true}
      showRating={true}
      onTestimonialClick={(testimonial) => {
        console.log('Clicked testimonial:', testimonial);
        // Handle testimonial click
      }}
      className="testimonials-container"
    />
  );
}
```

**Props:**

- `productId` (string, required) - Your project ID
- `apiKey` (string, required) - Your PromoKit API key
- `layout` ('grid' | 'masonry' | 'carousel', optional) - Layout style, defaults to 'grid'
- `theme` ('light' | 'dark' | 'auto', optional) - Color theme, defaults to 'dark'
- `autoRefresh` (boolean, optional) - Auto-refresh testimonials every 30 seconds, defaults to false
- `maxItems` (number, optional) - Maximum testimonials to display, defaults to 12
- `showRating` (boolean, optional) - Show star ratings, defaults to true
- `onTestimonialClick` (function, optional) - Click handler: `(testimonial: Testimonial) => void`
- `className` (string, optional) - Additional CSS classes

### ChangelogFeed

Show product updates and changelogs:

```jsx
import { ChangelogFeed } from '@promokit/react';

function MyChangelog() {
  return (
    <ChangelogFeed 
      projectId="your-project-id"
      apiKey="your-api-key"
      theme="light"
      showSubscribe={true}
      compact={false}
      maxItems={10}
      onVersionClick={(entry) => {
        console.log('Clicked version:', entry);
        // Handle version click
      }}
      className="changelog-feed"
    />
  );
}
```

**Props:**

- `projectId` (string, required) - Your project ID
- `apiKey` (string, required) - Your PromoKit API key
- `theme` ('light' | 'dark' | 'auto', optional) - Color theme, defaults to 'dark'
- `showSubscribe` (boolean, optional) - Show email subscription form, defaults to true
- `compact` (boolean, optional) - Compact layout without full content, defaults to false
- `maxItems` (number, optional) - Maximum entries to display, defaults to 10
- `onVersionClick` (function, optional) - Click handler: `(entry: ChangelogEntry) => void`
- `className` (string, optional) - Additional CSS classes

## Styling

### Theme Support

All components support three theme modes:

- `'light'` - Light theme
- `'dark'` - Dark theme
- `'auto'` - Automatically detects user's system preference

### Custom Styles

Pass custom styles via the `customStyles` prop:

```jsx
<Waitlist 
  projectId="your-project-id"
  apiKey="your-api-key"
  customStyles={{
    backgroundColor: 'var(--your-bg-color)',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    maxWidth: '400px'
  }}
/>
```

### CSS Classes

Add custom CSS classes for additional styling:

```jsx
<Waitlist 
  projectId="your-project-id"
  apiKey="your-api-key"
  className="my-waitlist-styles custom-border"
/>
```

```css
.my-waitlist-styles {
  border: 2px solid #8b5cf6;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.custom-border {
  border-radius: 20px;
}
```

## Provider Pattern (Optional)

For better organization, you can wrap your components in a `PromoProvider`:

```jsx
import { PromoProvider, Waitlist, TestimonialWall } from '@promokit/react';

function App() {
  return (
    <PromoProvider config={{ apiKey: 'your-api-key' }}>
      <Waitlist projectId="your-project-id" />
      <TestimonialWall productId="your-product-id" />
    </PromoProvider>
  );
}
```

When using `PromoProvider`, you don't need to pass `apiKey` to individual components.

## Referral System

The referral system is handled centrally by PromoKit.pro. Here's how it works:

### Basic Setup

1. **User joins waitlist**: Component calls PromoKit API with optional referral code
2. **PromoKit generates referral URL**: `https://promokit.pro?ref=ABC123`
3. **User shares link**: Referral tracking happens automatically

### Detecting Referrals

Use the `useReferral` hook to detect referral codes from URLs:

```jsx
import { useReferral, Waitlist } from '@promokit/react';

function MyWaitlist() {
  const { referralCode, isLoaded } = useReferral();

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <Waitlist 
      projectId="your-project-id"
      apiKey="your-api-key"
      referralCode={referralCode}
      onSignup={(email, newReferralCode) => {
        console.log('Signup with referral:', referralCode);
        console.log('User received code:', newReferralCode);
      }}
    />
  );
}
```

### URL Parameters

The `useReferral` hook automatically detects these URL parameters:

- `?ref=ABC123` - Standard referral code
- `?referral=ABC123` - Alternative referral parameter
- `?invite=ABC123` - Invitation code

### Full Example

```jsx
import { useReferral, Waitlist } from '@promokit/react';

function App() {
  const { referralCode, isLoaded, referralData } = useReferral({
    persistent: true, // Store referral for future visits
    trackAnalytics: true // Auto-track with analytics tools
  });

  return (
    <div>
      {isLoaded && (
        <Waitlist
          projectId="your-project-id"
          apiKey="your-api-key"
          referralCode={referralCode}
          onSignup={(email, newReferralCode) => {
            // Track the signup
            if (referralCode) {
              analytics.track('Referral Signup', {
                referrer_code: referralCode,
                new_user_code: newReferralCode,
                email
              });
            }
          }}
        />
      )}
    </div>
  );
}
```

## TypeScript Support

All components come with full TypeScript definitions:

```typescript
interface WaitlistProps {
  projectId: string;
  apiKey?: string;
  theme?: 'light' | 'dark' | 'auto';
  referralReward?: string;
  referralCode?: string;
  customStyles?: React.CSSProperties;
  onSignup?: (email: string, referralCode?: string) => void;
  onError?: (error: Error) => void;
  showDetailedErrors?: boolean;
  enableRetry?: boolean;
  className?: string;
}

interface TestimonialWallProps {
  productId: string;
  apiKey?: string;
  layout?: 'grid' | 'masonry' | 'carousel';
  theme?: 'light' | 'dark' | 'auto';
  autoRefresh?: boolean;
  maxItems?: number;
  showRating?: boolean;
  onTestimonialClick?: (testimonial: Testimonial) => void;
  onError?: (error: Error) => void;
  showDetailedErrors?: boolean;
  enableRetry?: boolean;
  className?: string;
}

interface ChangelogFeedProps {
  projectId: string;
  apiKey?: string;
  theme?: 'light' | 'dark' | 'auto';
  showSubscribe?: boolean;
  compact?: boolean;
  maxItems?: number;
  onVersionClick?: (entry: ChangelogEntry) => void;
  onError?: (error: Error) => void;
  showDetailedErrors?: boolean;
  enableRetry?: boolean;
  className?: string;
}
```

## Error Handling

All components include comprehensive error handling:

```jsx
<Waitlist
  projectId="your-project-id"
  apiKey="your-api-key"
  showDetailedErrors={true} // Show detailed error messages
  enableRetry={true} // Show retry button on errors
  onError={(error) => {
    // Handle errors (e.g., show toast notification)
    if (error.status === 409) {
      toast.error('Email already on waitlist');
    } else {
      toast.error('Something went wrong');
    }
  }}
/>
```

## Next.js Support

PromoKit works seamlessly with Next.js:

```jsx
import dynamic from 'next/dynamic';

// Dynamically import to avoid SSR issues
const Waitlist = dynamic(() => import('@promokit/react').then(mod => ({ default: mod.Waitlist })), {
  ssr: false
});

export default function HomePage() {
  return (
    <div>
      <h1>Join our waitlist</h1>
      <Waitlist projectId="your-project-id" apiKey="your-api-key" />
    </div>
  );
}
```
