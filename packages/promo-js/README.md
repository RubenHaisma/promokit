# @promokit/js

JavaScript SDK for PromoKit APIs - Marketing infrastructure for developers.

## Installation

```bash
npm install @promokit/js
```

## Quick Start

```javascript
import { PromoClient } from '@promokit/js';

const promo = new PromoClient({
  apiKey: 'your-api-key'
});

// Add to waitlist
const entry = await promo.waitlist.create({
  projectId: 'your-project-id',
  email: 'user@example.com'
});

// Submit testimonial
const testimonial = await promo.testimonial.submit({
  projectId: 'your-project-id',
  content: 'Amazing product!',
  author: 'John Doe',
  rating: 5
});

// Create changelog entry
const changelog = await promo.changelog.create({
  projectId: 'your-project-id',
  version: 'v1.2.0',
  title: 'New Features',
  content: 'We added some amazing new features...',
  changes: ['Dark mode', 'API improvements', 'Bug fixes']
});
```

## API Reference

### PromoClient

```javascript
const promo = new PromoClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.promo.dev' // optional, defaults to https://api.promo.dev
});
```

### Waitlist API

#### Create Entry

```javascript
const entry = await promo.waitlist.create({
  projectId: 'project_123',
  email: 'user@example.com',
  referralCode: 'FRIEND123', // optional
  metadata: { source: 'landing-page' } // optional
});

// Returns WaitlistEntry:
// {
//   id: string,
//   email: string,
//   position: number,
//   referralCode: string,
//   referralUrl: string,
//   createdAt: string,
//   metadata?: Record<string, any>
// }
```

#### Get Stats

```javascript
const stats = await promo.waitlist.getStats('project_123');

// Returns WaitlistStats:
// {
//   totalSignups: number,
//   signupsToday: number,
//   signupsThisWeek: number,
//   referralStats: Array<{ referrer: string, count: number }>
// }
```

#### Export Entries

```javascript
const entries = await promo.waitlist.export('project_123');
// Returns array of WaitlistEntry objects
```

#### Remove Entry

```javascript
const result = await promo.waitlist.remove('project_123', 'user@example.com');
// Returns APIResponse with success status
```

### Testimonial API

#### Submit Testimonial

```javascript
const testimonial = await promo.testimonial.submit({
  projectId: 'project_123',
  content: 'This product is amazing!',
  author: 'John Doe',
  role: 'CEO', // optional
  company: 'Acme Inc', // optional
  avatar: 'https://example.com/avatar.jpg', // optional
  rating: 5, // optional, defaults to 5
  metadata: { source: 'email' } // optional
});

// Returns Testimonial:
// {
//   id: string,
//   content: string,
//   author: string,
//   role?: string,
//   company?: string,
//   avatar?: string,
//   rating: number,
//   status: 'PENDING' | 'APPROVED' | 'REJECTED',
//   createdAt: string,
//   metadata?: Record<string, any>
// }
```

#### Get Testimonials

```javascript
const result = await promo.testimonial.get('project_123', {
  limit: 10, // optional, default varies
  offset: 0, // optional, default 0
  status: 'APPROVED' // optional: 'PENDING', 'APPROVED', 'REJECTED'
});

// Returns:
// {
//   testimonials: Testimonial[],
//   pagination: {
//     total: number,
//     limit: number,
//     offset: number,
//     hasMore: boolean
//   }
// }
```

#### Approve/Reject Testimonials

```javascript
// Approve testimonial
await promo.testimonial.approve('testimonial_id');

// Reject testimonial
await promo.testimonial.reject('testimonial_id');

// Both return APIResponse with success status
```

### Changelog API

#### Create Entry

```javascript
const changelog = await promo.changelog.create({
  projectId: 'project_123',
  version: 'v1.2.0',
  title: 'New Features Release',
  content: 'We are excited to announce...',
  changes: [
    'Added dark mode',
    'Improved performance',
    'Fixed bugs'
  ],
  publishedAt: '2024-01-15T10:00:00Z' // optional, defaults to now
});

// Returns ChangelogEntry:
// {
//   id: string,
//   version: string,
//   title: string,
//   content: string,
//   changes: string[],
//   publishedAt: string
// }
```

#### Get Entries

```javascript
const result = await promo.changelog.get('project_123', {
  limit: 10, // optional
  offset: 0 // optional
});

// Returns:
// {
//   entries: ChangelogEntry[],
//   pagination: {
//     total: number,
//     limit: number,
//     offset: number,
//     hasMore: boolean
//   }
// }
```

#### Subscribe to Updates

```javascript
const result = await promo.changelog.subscribe('project_123', 'user@example.com');
// Returns APIResponse with success status
```

#### Update Entry

```javascript
const updated = await promo.changelog.update('entry_id', {
  title: 'Updated Title',
  content: 'Updated content...'
});
// Returns updated ChangelogEntry
```

#### Delete Entry

```javascript
const result = await promo.changelog.delete('entry_id');
// Returns APIResponse with success status
```

## Error Handling

All API methods throw errors when requests fail:

```javascript
try {
  const entry = await promo.waitlist.create({
    projectId: 'project_123',
    email: 'user@example.com'
  });
} catch (error) {
  console.error('Failed to create waitlist entry:', error.message);
  // Handle error appropriately
}
```

## TypeScript Support

This package includes comprehensive TypeScript definitions:

```typescript
import { 
  PromoClient, 
  WaitlistEntry, 
  Testimonial, 
  ChangelogEntry,
  WaitlistStats,
  APIResponse 
} from '@promokit/js';

const promo = new PromoClient({ apiKey: 'your-api-key' });

const entry: WaitlistEntry = await promo.waitlist.create({
  projectId: 'project_123',
  email: 'user@example.com'
});
```

## Available Types

```typescript
interface PromoConfig {
  apiKey: string;
  baseUrl?: string;
}

interface WaitlistEntry {
  id: string;
  email: string;
  position: number;
  referralCode: string;
  referralUrl: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

interface Testimonial {
  id: string;
  content: string;
  author: string;
  role?: string;
  company?: string;
  avatar?: string;
  rating: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  metadata?: Record<string, any>;
}

interface ChangelogEntry {
  id: string;
  version: string;
  title: string;
  content: string;
  changes: string[];
  publishedAt: string;
}

interface WaitlistStats {
  totalSignups: number;
  signupsToday: number;
  signupsThisWeek: number;
  referralStats: Array<{
    referrer: string;
    count: number;
  }>;
}

interface APIResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}
```

## Browser Support

This package works in all modern browsers and Node.js environments. It uses the Fetch API for HTTP requests.

## License

MIT