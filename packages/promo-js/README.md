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

## Architecture

PromoKit uses a centralized architecture where all requests go through `promokit.pro`. This simplifies configuration and ensures reliable service delivery.

## API Reference

### PromoClient

```javascript
const promo = new PromoClient({
  apiKey: 'your-api-key'
});
```

All API requests are routed through PromoKit's centralized infrastructure at `https://promokit.pro`.

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
await promo.waitlist.remove('project_123', 'user@example.com');
```

### Testimonial API

#### Submit Testimonial

```javascript
const testimonial = await promo.testimonial.submit({
  projectId: 'project_123',
  content: 'This product changed my life!',
  author: 'John Doe',
  role: 'CEO', // optional
  company: 'Acme Inc', // optional
  avatar: 'https://example.com/avatar.jpg', // optional
  rating: 5, // optional, 1-5 stars
  metadata: { source: 'email-campaign' } // optional
});

// Returns Testimonial:
// {
//   id: string,
//   content: string,
//   author: string,
//   role?: string,
//   company?: string,
//   avatar?: string,
//   rating?: number,
//   status: 'PENDING' | 'APPROVED' | 'REJECTED',
//   createdAt: string,
//   metadata?: Record<string, any>
// }
```

#### Get Testimonials

```javascript
const result = await promo.testimonial.get('project_123', {
  limit: 10,
  offset: 0,
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
// Approve a testimonial
await promo.testimonial.approve('testimonial_123');

// Reject a testimonial
await promo.testimonial.reject('testimonial_123');
```

### Changelog API

#### Create Entry

```javascript
const entry = await promo.changelog.create({
  projectId: 'project_123',
  version: 'v2.1.0',
  title: 'Major Update',
  content: 'We have released a major update with lots of new features...',
  changes: [
    'New dashboard design',
    'Performance improvements',
    'Bug fixes'
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
//   publishedAt: string,
//   createdAt: string
// }
```

#### Get Changelog Entries

```javascript
const result = await promo.changelog.get('project_123', {
  limit: 5,
  offset: 0
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
await promo.changelog.subscribe('project_123', 'user@example.com');
```

#### Update Entry

```javascript
const updated = await promo.changelog.update('entry_123', {
  title: 'Updated Title',
  content: 'Updated content...'
});
```

#### Delete Entry

```javascript
await promo.changelog.delete('entry_123');
```

## Error Handling

The SDK includes comprehensive error handling:

```javascript
import { PromoError } from '@promokit/js';

try {
  const entry = await promo.waitlist.create({
    projectId: 'project_123',
    email: 'invalid-email'
  });
} catch (error) {
  if (error instanceof PromoError) {
    console.error('API Error:', error.details);
    console.error('Status:', error.apiError.status);
    console.error('Message:', error.apiError.message);
  } else {
    console.error('Network Error:', error.message);
  }
}
```

### PromoError Properties

```typescript
interface APIError {
  status: number;
  statusText: string;
  message: string;
  details: any;
  endpoint: string;
  timestamp: string;
}

class PromoError extends Error {
  apiError: APIError;
  constructor(apiError: APIError);
}
```

## TypeScript Support

Full TypeScript definitions are included:

```typescript
interface PromoConfig {
  apiKey: string;
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
  rating?: number;
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
  createdAt: string;
}
```

## Node.js Example

```javascript
const { PromoClient } = require('@promokit/js');

const promo = new PromoClient({
  apiKey: process.env.PROMOKIT_API_KEY
});

async function addToWaitlist(email, referralCode) {
  try {
    const entry = await promo.waitlist.create({
      projectId: process.env.PROMOKIT_PROJECT_ID,
      email,
      referralCode,
      metadata: {
        source: 'server-side',
        timestamp: new Date().toISOString()
      }
    });
  
    console.log(`Added ${email} to waitlist at position ${entry.position}`);
    return entry;
  } catch (error) {
    console.error('Failed to add to waitlist:', error.message);
    throw error;
  }
}
```

## Next.js API Route Example

```javascript
// pages/api/waitlist.js
import { PromoClient } from '@promokit/js';

const promo = new PromoClient({
  apiKey: process.env.PROMOKIT_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, referralCode } = req.body;

  try {
    const entry = await promo.waitlist.create({
      projectId: process.env.PROMOKIT_PROJECT_ID,
      email,
      referralCode,
      metadata: {
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      }
    });

    res.status(200).json(entry);
  } catch (error) {
    console.error('Waitlist API error:', error);
    res.status(error.apiError?.status || 500).json({
      error: error.message || 'Internal server error'
    });
  }
}
```
