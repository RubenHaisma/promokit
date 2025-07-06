# PromoKit 🚀

**Marketing infrastructure for developers**

Beautiful APIs and React components for waitlists, testimonials, and changelogs. Built for developers who care about experience.

[![npm version](https://badge.fury.io/js/@promokit%2Freact.svg)](https://www.npmjs.com/package/@promokit/react)
[![npm version](https://badge.fury.io/js/@promokit%2Fjs.svg)](https://www.npmjs.com/package/@promokit/js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📦 Packages

- **[@promokit/react](./packages/promo-react)** - React components for waitlists, testimonials, and changelogs
- **[@promokit/js](./packages/promo-js)** - JavaScript SDK for all PromoKit APIs

## 🚀 Quick Start

### React Components

```bash
npm install @promokit/react
```

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

### JavaScript SDK

```bash
npm install @promokit/js
```

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

## 🌟 Features

### 📝 Waitlist API
- ✅ Viral referral system
- ✅ Position tracking  
- ✅ Email validation
- ✅ Spam protection
- ✅ Custom rewards

### 💬 Testimonial API
- ✅ Review collection
- ✅ Moderation tools
- ✅ Display widgets
- ✅ Rating system
- ✅ Social proof

### 📋 Changelog API
- ✅ Version management
- ✅ Email notifications
- ✅ RSS feeds
- ✅ Subscriber management
- ✅ Beautiful displays

## 🎨 Component Features

All components support:

- 🌙 Light/dark themes
- 🎨 Custom styling
- 📘 TypeScript support
- 📱 Responsive design
- ♿ Accessibility

## 📚 Documentation

Visit [promo.dev/docs](https://promo.dev/docs) for:

- 📖 Complete documentation
- 🔧 API reference
- 💡 Examples and tutorials
- 🎮 Interactive playground

## 🔧 Development

```bash
# Clone the repository
git clone https://github.com/promokit/promokit.git
cd promokit

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test

# Start development mode
npm run dev
```

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 💬 Support & Community

- 📖 [Documentation](https://promo.dev/docs)
- 💬 [Discord Community](https://discord.gg/promo)
- 🐛 [GitHub Issues](https://github.com/promokit/promokit/issues)
- 📧 [Email Support](mailto:support@promo.dev)

## 🏢 Built by

PromoKit is built and maintained by the team at [Promo](https://promo.dev).

---

<div align="center">
  <strong>⭐ Star us on GitHub if you find PromoKit useful!</strong>
</div>