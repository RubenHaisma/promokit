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
  baseUrl: 'https://api.promo.dev' // optional
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
```

#### Get Stats

```javascript
const stats = await promo.waitlist.getStats('project_123');
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
```

#### Get Testimonials

```javascript
const testimonials = await promo.testimonial.getAll('project_123', {
  limit: 10, // optional
  offset: 0, // optional
  status: 'approved' // optional: 'pending', 'approved', 'rejected'
});
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
  publishedAt: '2024-01-15T10:00:00Z' // optional
});
```

#### Get Entries

```javascript
const entries = await promo.changelog.getAll('project_123', {
  limit: 10, // optional
  offset: 0 // optional
});
```

## Error Handling

```javascript
try {
  const entry = await promo.waitlist.create({
    projectId: 'project_123',
    email: 'user@example.com'
  });
} catch (error) {
  console.error('Failed to create waitlist entry:', error.message);
}
```

## TypeScript Support

This package includes TypeScript definitions:

```typescript
import { PromoClient, WaitlistEntry, Testimonial } from '@promokit/js';

const promo = new PromoClient({ apiKey: 'your-api-key' });

const entry: WaitlistEntry = await promo.waitlist.create({
  projectId: 'project_123',
  email: 'user@example.com'
});
```

## License

MIT