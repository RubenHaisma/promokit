# FeedbackKit Widget

Lightweight React widget to collect user feedback and send it to the FeedbackKit API.

## Features

- **Floating or Inline Trigger**: Choose between a floating button (bottom-right / bottom-left) or render the button inline anywhere in your UI.
- **Dark / Light Mode**: Follows the user’s OS preference automatically or can be forced via a prop.
- **Accent Colours**: Provide separate `light` / `dark` accent colours to match each theme.
- **Customizable Theme**: Still override `borderRadius` (and a default `primaryColor` fallback) to match your brand.
- **Rich Feedback Form**
  - Type: *Bug Report, Feature Request, Error Report, General Feedback*
  - Priority: *Low, Medium, High*
  - Title (required)
  - Description (required)
  - Email (optional)
- **Automatic Context Capture**: The widget appends useful metadata to every submission:
  - Timestamp (UTC ISO)
  - Current page URL
  - Browser User-Agent
  - App name
- **Simple Public API Key**: A publishable key identifies your application. It is **not a secret** and is validated / rate-limited by the FeedbackKit backend.
- **Success Callback**: Provide an `onSuccess` handler to hook into your own analytics or toast system after a successful submission.
- **Zero Runtime Dependencies**: Only requires React (peer) and TailwindCSS (bundled into the built CSS).
- **Works Everywhere**: Compatible with Create-React-App, Vite, Next.js, Remix, etc.

## Installation

```bash
npm install feedbackkit-widget
```

## Usage

```tsx
import { FeedbackWidget } from "feedbackkit-widget";

export default function App() {
  return (
    <FeedbackWidget
      apiKey="your-public-api-key"
      appName="My SaaS App"
      accentColors={{ light: "#ec4899", dark: "#d946ef" }}  // 👈 separate accents
      mode="system"                            // "light" | "dark" | "system"
      trigger="floating"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiKey` | `string` | – | Public API key provided by FeedbackKit (required) |
| `appName` | `string` | – | App name used in metadata (required) |
| `trigger` | `"floating" \| "inline"` | `"floating"` | How the widget is triggered |
| `mode` | `"light" \| "dark" \| "system"` | `"system"` | Force a colour-scheme or follow the OS |
| `accentColors.light` | `string` | – | Accent colour when in light mode (optional) |
| `accentColors.dark` | `string` | – | Accent colour when in dark mode (optional) |
| `theme.primaryColor` | `string` | `"#ec4899"` | Fallback accent if `accentColors` not supplied |
| `theme.borderRadius` | `string` | `"6px"` | Border radius for button and modal |
| `position` | `"bottom-right" \| "bottom-left"` | `"bottom-right"` | Position for floating trigger |
| `onSuccess` | `() => void` | – | Callback after successful submission |
| `endpoint` | `string` | `"https://api.feedbackkit.io/feedback"` | Override API URL for local development |

## Local testing

1. Clone both repos side-by-side:

   ```bash
   git clone <your-fork>/feedbackkit-widget
   git clone <your-fork>/feedbackkit-app
   ```

2. Start the backend (defaults to `http://localhost:3000/api/feedback`):

   ```bash
   cd feedbackkit-app
   npm install
   npm run dev
   ```

3. Build & link the widget:

   ```bash
   cd ../feedbackkit-widget
   npm install
   npm run build   # bundles JS & CSS
   npm link         # or `yarn link`
   ```

4. Link it in the Next.js app:

   ```bash
   cd ../feedbackkit-app
   npm link feedbackkit-widget
   ```

5. Use the widget somewhere in your app (e.g. `/pages/_app.tsx`):

   ```tsx
   import { FeedbackWidget } from "feedbackkit-widget";

   <FeedbackWidget
     apiKey="dev-public-key"
     appName="FeedbackKit Dev"
     endpoint="http://localhost:3000/api/feedback"   // 👈 local backend
   />
   ```

6. Visit `http://localhost:3000` in the browser, open the widget, submit feedback, and watch your backend console / email.

## Request Details

The widget sends a `POST` request with:

```http
POST /api/feedback HTTP/1.1
Content-Type: application/json
x-api-key: <PUBLIC_API_KEY>

{ ...payload }
```

`x-api-key` is a **public** identifier—safe for the browser. Your backend verifies it and applies rate-limits.

---

Built with React, TypeScript, and TailwindCSS. 