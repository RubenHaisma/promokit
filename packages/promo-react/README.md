# @promokit/react

React components for PromoKit - Marketing infrastructure for developers.

## Installation

```bash
npm install @promokit/react
```

## Quick Start

```jsx
import { PromoProvider, Waitlist } from '@promokit/react';

function App() {
  return (
    <PromoProvider config={{ apiKey: 'your-api-key' }}>
      <Waitlist 
        projectId="your-project-id"
        theme="dark"
        referralReward="Skip the line"
        onSignup={(email) => console.log('New signup:', email)}
      />
    </PromoProvider>
  );
}
```

## Components

### PromoProvider

Wrap your app with the PromoProvider to configure the API client:

```jsx
import { PromoProvider } from '@promokit/react';

function App() {
  return (
    <PromoProvider config={{ 
      apiKey: 'your-api-key',
      baseUrl: 'https://api.promo.dev' // optional
    }}>
      {/* Your components */}
    </PromoProvider>
  );
}
```

### Waitlist

Create viral waitlists with referral mechanics:

```jsx
import { Waitlist } from '@promokit/react';

function MyWaitlist() {
  return (
    <Waitlist 
      projectId="your-project-id"
      theme="dark" // 'light', 'dark', or 'auto'
      referralReward="Skip 10 spots in line"
      onSignup={(email, referralCode) => {
        console.log('New signup:', email);
        // Track with your analytics
        analytics.track('waitlist_signup', { email, referralCode });
      }}
      onError={(error) => {
        console.error('Waitlist error:', error);
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

### TestimonialWall

Display customer testimonials and reviews:

```jsx
import { TestimonialWall } from '@promokit/react';

function MyTestimonials() {
  return (
    <TestimonialWall 
      projectId="your-project-id"
      layout="masonry" // 'grid', 'masonry', or 'carousel'
      theme="auto"
      maxItems={12}
      autoRefresh={true}
      showRating={true}
      customStyles={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}
      className="testimonials-container"
    />
  );
}
```

### ChangelogFeed

Show product updates and changelogs:

```jsx
import { ChangelogFeed } from '@promokit/react';

function MyChangelog() {
  return (
    <ChangelogFeed 
      projectId="your-project-id"
      theme="light"
      showSubscribe={true}
      compact={false}
      maxItems={10}
      customStyles={{
        fontFamily: 'Inter, sans-serif'
      }}
      className="changelog-feed"
    />
  );
}
```

## Styling

### CSS Variables

You can customize the appearance using CSS variables:

```css
:root {
  --promo-bg: #ffffff;
  --promo-text: #1f2937;
  --promo-primary: #8b5cf6;
  --promo-border: #e5e7eb;
}

[data-theme="dark"] {
  --promo-bg: #1f2937;
  --promo-text: #ffffff;
  --promo-border: #374151;
}
```

### Custom Styles

Pass custom styles via the `customStyles` prop:

```jsx
<Waitlist 
  projectId="your-project-id"
  customStyles={{
    backgroundColor: 'var(--your-bg-color)',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  }}
/>
```

### CSS Classes

Add custom CSS classes:

```jsx
<Waitlist 
  projectId="your-project-id"
  className="my-waitlist-styles"
/>
```

```css
.my-waitlist-styles {
  border: 2px solid #8b5cf6;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

## TypeScript Support

All components include full TypeScript definitions:

```tsx
import { WaitlistProps, TestimonialWallProps } from '@promokit/react';

const MyWaitlist: React.FC<WaitlistProps> = (props) => {
  return <Waitlist {...props} />;
};
```

## Error Handling

Handle errors gracefully:

```jsx
<Waitlist 
  projectId="your-project-id"
  onError={(error) => {
    // Log to your error tracking service
    console.error('Waitlist error:', error);
    
    // Show user-friendly message
    toast.error('Something went wrong. Please try again.');
  }}
/>
```

## Examples

### Next.js Integration

```jsx
// pages/waitlist.js
import { PromoProvider, Waitlist } from '@promokit/react';

export default function WaitlistPage() {
  return (
    <PromoProvider config={{ apiKey: process.env.NEXT_PUBLIC_PROMO_API_KEY }}>
      <div className="min-h-screen flex items-center justify-center">
        <Waitlist 
          projectId={process.env.NEXT_PUBLIC_PROMO_PROJECT_ID}
          theme="auto"
          onSignup={(email) => {
            // Track with Next.js analytics
            gtag('event', 'waitlist_signup', {
              email_domain: email.split('@')[1]
            });
          }}
        />
      </div>
    </PromoProvider>
  );
}
```

### Custom Theme

```jsx
import { PromoProvider, Waitlist } from '@promokit/react';

function App() {
  return (
    <PromoProvider config={{ apiKey: 'your-api-key' }}>
      <Waitlist 
        projectId="your-project-id"
        theme="dark"
        customStyles={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}
      />
    </PromoProvider>
  );
}
```

## License

MIT