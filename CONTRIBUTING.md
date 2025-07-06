# Contributing to PromoKit

We love your input! We want to make contributing to PromoKit as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Setting Up Development Environment

```bash
# Clone your fork
git clone https://github.com/your-username/promokit.git
cd promokit

# Install dependencies
npm install

# Build packages
npm run build

# Start development mode
npm run dev
```

## Package Development

This project uses a monorepo structure with multiple packages:

- `packages/promo-react` - React components
- `packages/promo-js` - JavaScript SDK

### Building Packages

```bash
# Build all packages
npm run build

# Build specific package
cd packages/promo-react
npm run build

# Watch mode for development
npm run dev
```

### Testing Packages Locally

```bash
# Link packages locally
cd packages/promo-react
npm link

# In your test project
npm link @promokit/react
```

## Code Style

We use ESLint and Prettier for code formatting. Make sure to run:

```bash
npm run lint
```

## Commit Messages

We follow the [Conventional Commits](https://conventionalcommits.org/) specification:

- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation changes
- `style:` formatting changes
- `refactor:` code refactoring
- `test:` adding tests
- `chore:` maintenance tasks

Examples:

```
feat(react): add testimonial wall component
fix(js): handle API errors properly
docs: update installation guide
```

## Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update package versions following semantic versioning
3. The PR will be merged once you have the sign-off of at least one maintainer

## Versioning

We use [Changesets](https://github.com/changesets/changesets) for version management:

```bash
# Add a changeset
npm run changeset

# Version packages
npm run version-packages

# Release packages
npm run release
```

## Any contributions you make will be under the MIT Software License

When you submit code changes, your submissions are understood to be under the same [MIT License](LICENSE) that covers the project.

## Report bugs using GitHub's [issue tracker](https://github.com/promokit/promokit/issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/promokit/promokit/issues/new).

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## License

By contributing, you agree that your contributions will be licensed under its MIT License.