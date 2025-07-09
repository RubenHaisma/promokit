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
      baseUrl="https://api.promo.dev" // optional
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
- `baseUrl` (string, optional) - API base URL, defaults to PromoKit's API
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
- `baseUrl` (string, optional) - API base URL, defaults to PromoKit's API
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
- `baseUrl` (string, optional) - API base URL, defaults to PromoKit's API
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

### Responsive Design

All components are fully responsive and work across all device sizes. The layouts automatically adapt:

- **Mobile**: Single column layouts
- **Tablet**: 2-column grids where appropriate  
- **Desktop**: 3+ column layouts for optimal space usage

## TypeScript Support

All components include comprehensive TypeScript definitions:

```tsx
import { WaitlistProps, TestimonialWallProps, ChangelogFeedProps } from '@promokit/react';

const MyWaitlist: React.FC<WaitlistProps> = (props) => {
  return <Waitlist {...props} />;
};
```

### Available Types

```typescript
interface WaitlistProps {
  projectId: string;
  apiKey: string;
  baseUrl?: string;
  theme?: 'light' | 'dark' | 'auto';
  referralReward?: string;
  customStyles?: React.CSSProperties;
  onSignup?: (email: string, referralCode?: string) => void;
  onError?: (error: Error) => void;
  className?: string;
}

interface TestimonialWallProps {
  productId: string;
  apiKey: string;
  baseUrl?: string;
  layout?: 'grid' | 'masonry' | 'carousel';
  theme?: 'light' | 'dark' | 'auto';
  autoRefresh?: boolean;
  maxItems?: number;
  showRating?: boolean;
  onTestimonialClick?: (testimonial: Testimonial) => void;
  className?: string;
}

interface ChangelogFeedProps {
  projectId: string;
  apiKey: string;
  baseUrl?: string;
  theme?: 'light' | 'dark' | 'auto';
  showSubscribe?: boolean;
  compact?: boolean;
  maxItems?: number;
  onVersionClick?: (version: ChangelogEntry) => void;
  className?: string;
}
```

## Error Handling

Handle errors gracefully with the `onError` prop:

```jsx
<Waitlist 
  projectId="your-project-id"
  apiKey="your-api-key"
  onError={(error) => {
    // Log to your error tracking service
    console.error('Waitlist error:', error);
    
    // Show user-friendly message
    toast.error('Something went wrong. Please try again.');
  }}
/>
```

## Animation & Interactions

Components use Framer Motion for smooth animations:

- **Loading states** with skeleton placeholders
- **Hover effects** on interactive elements
- **Smooth transitions** between states
- **Staggered animations** for lists

All animations respect user's motion preferences and can be disabled via CSS:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Examples

### Next.js Integration

```jsx
// pages/waitlist.js
import { Waitlist } from '@promokit/react';

export default function WaitlistPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Waitlist 
        projectId={process.env.NEXT_PUBLIC_PROMO_PROJECT_ID}
        apiKey={process.env.NEXT_PUBLIC_PROMO_API_KEY}
        theme="auto"
        onSignup={(email, referralCode) => {
          // Track with Next.js analytics
          gtag('event', 'waitlist_signup', {
            email_domain: email.split('@')[1],
            referral_code: referralCode
          });
        }}
      />
    </div>
  );
}
```

### Multiple Components

```jsx
import { Waitlist, TestimonialWall, ChangelogFeed } from '@promokit/react';

function App() {
  const apiKey = process.env.REACT_APP_PROMO_API_KEY;
  const projectId = process.env.REACT_APP_PROMO_PROJECT_ID;

  return (
    <div className="space-y-12">
      <Waitlist 
        projectId={projectId}
        apiKey={apiKey}
        theme="dark"
        customStyles={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}
      />
      
      <TestimonialWall
        productId={projectId}
        apiKey={apiKey}
        layout="masonry"
        theme="light"
        maxItems={9}
        showRating={true}
      />

      <ChangelogFeed
        projectId={projectId}
        apiKey={apiKey}
        theme="auto"
        showSubscribe={true}
      />
    </div>
  );
}
```

### Analytics Integration

```jsx
import { Waitlist } from '@promokit/react';
import { analytics } from './analytics';

function TrackedWaitlist() {
  return (
    <Waitlist 
      projectId="your-project-id"
      apiKey="your-api-key"
      onSignup={(email, referralCode) => {
        // Multiple analytics providers
        analytics.track('Waitlist Signup', {
          email_domain: email.split('@')[1],
          has_referral: !!referralCode,
          timestamp: new Date().toISOString()
        });
        
        // Google Analytics
        gtag('event', 'sign_up', {
          method: 'waitlist',
          custom_parameter: referralCode
        });
        
        // Facebook Pixel
        fbq('track', 'Lead', {
          content_name: 'Waitlist Signup'
        });
      }}
      onError={(error) => {
        analytics.track('Waitlist Error', {
          error_message: error.message,
          timestamp: new Date().toISOString()
        });
      }}
    />
  );
}
```

## Browser Support

- Chrome 91+
- Firefox 90+
- Safari 14+
- Edge 91+

## Dependencies

- React 16.8+ (peer dependency)
- Framer Motion (for animations)
- Lucide React (for icons)
- clsx (for conditional classes)

## License

MIT
