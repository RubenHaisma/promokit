import React, { useState, useCallback, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { ScreenshotCapture } from "./ScreenshotCapture";

// Portal component to render modal at document body level
const Portal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  // Create portal container if it doesn't exist
  let portalContainer = document.getElementById('feedbackkit-portal');
  if (!portalContainer) {
    portalContainer = document.createElement('div');
    portalContainer.id = 'feedbackkit-portal';
    document.body.appendChild(portalContainer);
  }

  return createPortal(children, portalContainer);
};

export interface FeedbackWidgetProps {
  apiKey: string; // Public API key (required)
  appName: string; // App name
  trigger?: "floating" | "inline"; // Default: "floating"
  /**
   * Either pass an object with custom colours OR simply pass "dark" / "light"
   * to force the widget into that appearance.
   */
  theme?:
    | {
        primaryColor?: string; // Default: "#ec4899"
        borderRadius?: string; // Default: "6px"
      }
    | "light"
    | "dark";
  /**
   * Accent colours that will be applied automatically depending on the user’s
   * preferred colour-scheme.  Supply `light` and/or `dark` hex values.  When
   * provided, this takes precedence over `theme.primaryColor`.
   */
  accentColors?: {
    light: string;
    dark: string;
  };
  /**
   * Force the widget into light or dark mode regardless of the user’s OS
   * preference.  Use "system" (default) to follow the OS.
   */
  mode?: "light" | "dark" | "system";
  position?: "bottom-right" | "bottom-left"; // For floating button
  onSuccess?: () => void; // Optional callback after successful submission
  /**
   * Override the default FeedbackKit API endpoint, e.g. "http://localhost:3000/api/feedback".
   * Useful for local development / self-hosted backends.
   */
  endpoint?: string;
}

type FeedbackType = "bug" | "feature" | "error" | "general";
type Priority = "low" | "medium" | "high" | "critical";

const feedbackTypes = [
  {
    id: "bug" as const,
    icon: "🐛",
    title: "Bug Report",
    description: "Something isn't working"
  },
  {
    id: "feature" as const,
    icon: "💡",
    title: "Feature Request", 
    description: "Suggest a new feature"
  },
  {
    id: "error" as const,
    icon: "⚠️",
    title: "Error Reports",
    description: "App crashed or error occurred"
  },
  {
    id: "general" as const,
    icon: "💬",
    title: "General Feedback",
    description: "General thoughts or suggestions"
  }
];

const priorities = [
  { id: "low" as const, label: "Low", description: "Minor issue" },
  { id: "medium" as const, label: "Medium", description: "Moderate issue" },
  { id: "high" as const, label: "High", description: "Important issue" },
  { id: "critical" as const, label: "Critical", description: "App is unusable" }
];

export const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({
  apiKey,
  appName,
  trigger = "floating",
  theme = { primaryColor: "#8b5cf6", borderRadius: "6px" },
  accentColors,
  mode = "system",
  position = "bottom-right",
  onSuccess,
  endpoint = "https://feedbackkit.io/api/feedback",
}) => {
  // Allow passing theme as "dark" | "light" string for convenience
  const normalizedTheme = typeof theme === 'string' ? { primaryColor: "#ec4899", borderRadius: "6px" } : theme;
  const forcedMode: "light" | "dark" | "system" = typeof theme === 'string' ? theme : mode;
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScreenshotCapture, setShowScreenshotCapture] = useState(false);

  const [selectedType, setSelectedType] = useState<FeedbackType>("error");
  const [selectedPriority, setSelectedPriority] = useState<Priority>("critical");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [screenshot, setScreenshot] = useState<{
    imageData: string;
    pointerData?: {
      x: number;
      y: number;
      annotation?: string;
    };
  } | null>(null);

  /* -------------------------------------------------------------
   *  Accent colour handling (light/dark)
   * ----------------------------------------------------------- */
  const getSystemScheme = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';

  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(() =>
    forcedMode === 'system' ? getSystemScheme() : forcedMode
  );

  useEffect(() => {
    if (forcedMode !== 'system' || typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setColorScheme(e.matches ? 'dark' : 'light');
    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
    } else {
      // Safari <14
      // @ts-ignore
      mq.addListener(handler);
    }
    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', handler);
      } else {
        // @ts-ignore
        mq.removeListener(handler);
      }
    };
  }, []);

  const accentColor = (accentColors && accentColors[colorScheme]) || normalizedTheme.primaryColor;

  const rootStyle = {
    '--fk-primary': accentColor,
  } as React.CSSProperties;

  const metadata = useMemo(() => ({
    url: typeof window !== "undefined" ? window.location.href : "",
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    appName,
  }), [appName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          type: selectedType,
          priority: selectedPriority,
          title,
          description,
          email: email || undefined,
          metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
          },
          screenshot: screenshot || undefined,
        }),
      });

      if (!res.ok) {
        let message = `Request failed: ${res.status}`;
        try {
          const data = await res.json();
          if (typeof data?.error === 'string') {
            message = data.error;
          }
        } catch {
          // ignore JSON parse errors
        }
        throw new Error(message);
      }

      setSuccess(true);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = useCallback(() => {
    setSelectedType("error");
    setSelectedPriority("critical"); 
    setTitle("");
    setDescription("");
    setEmail("");
    setScreenshot(null);
    setSuccess(false);
    setError(null);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    setTimeout(resetForm, 300); // Reset after animation
  }, [resetForm]);

  const handleScreenshotCaptured = useCallback((screenshotData: {
    imageData: string;
    pointerData?: {
      x: number;
      y: number;
      annotation?: string;
    };
  }) => {
    setScreenshot(screenshotData);
    setShowScreenshotCapture(false);
  }, []);

  const primaryStyle: React.CSSProperties = {
    backgroundColor: accentColor,
    borderRadius: normalizedTheme.borderRadius,
  };

  const floatingPosStyle: React.CSSProperties =
    position === "bottom-right"
      ? { right: "1.25rem", bottom: "1.25rem" }
      : { left: "1.25rem", bottom: "1.25rem" };

  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const getBrowser = () => {
    if (typeof navigator === 'undefined') return 'Unknown';
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  const Trigger = () => {
    if (trigger === "inline") {
      return (
        <button
          type="button"
          style={primaryStyle}
          className="px-4 py-2 text-white text-sm font-medium hover:opacity-90 transition-opacity"
          onClick={() => setOpen(!open)}
        >
          Feedback
        </button>
      );
    }
    return (
      <button
        type="button"
        aria-label="Feedback"
        style={{ 
          ...primaryStyle, 
          ...floatingPosStyle, 
          position: "fixed",
          transform: open ? 'scale(1.1) rotate(12deg)' : 'scale(1) rotate(0deg)',
          transition: 'all 0.3s ease-out'
        }}
        className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center shadow-lg text-white hover:scale-105 hover:rotate-3 z-50"
        onClick={() => setOpen(!open)}
      >
        <img
          src="https://feedbackkit.io/logo.png"
          alt="FeedbackKit"
          className="h-5 w-5 sm:h-6 sm:w-6 object-contain transition-transform duration-300"
        />
      </button>
    );
  };

  return (
    <div style={rootStyle} className={colorScheme === 'dark' ? 'dark' : ''}>
      <div data-feedbackkit-widget="trigger">
        <Trigger />
      </div>
      <Portal>
        {open && (
          <div className="fixed inset-0 z-[99999] flex items-end justify-end p-2 sm:p-3 md:p-4 lg:p-6 overflow-y-auto">
            <div
              className="fixed inset-0 bg-black/30 transition-opacity"
              onClick={closeModal}
            />
            <div
              className="relative bg-white dark:bg-gray-50 w-[min(90vw,280px)] h-[min(70vh,400px)] rounded-lg shadow-lg overflow-hidden z-30 overflow-y-auto border border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-out"
              style={{ transform: 'translateY(-60px)' }}
            >
              {success ? (
                <div className="p-4 text-center space-y-3">
                  <div className="w-10 h-10 mx-auto bg-green-50 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-base font-medium text-gray-900 dark:text-gray-900">
                    Thank you!
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-600">
                    Your feedback has been sent successfully.
                  </p>
                  <button
                    type="button"
                    style={primaryStyle}
                    className="px-3 py-1.5 text-white text-xs font-medium hover:opacity-90 transition-opacity rounded-md"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-200">
                    <h2 className="text-sm font-medium text-gray-900 dark:text-gray-900">Send Feedback</h2>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-3 space-y-3">
                    <p className="text-xs text-gray-600 dark:text-gray-600">
                      Help us improve {appName} by sharing your experience.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-3">
                      {/* Feedback Type */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-700 mb-1.5">
                          Feedback Type
                        </label>
                        <div className="grid grid-cols-1 gap-1.5">
                          {feedbackTypes.map((type) => (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => setSelectedType(type.id)}
                              className={`p-2 border rounded text-left transition-all ${
                                selectedType === type.id
                                  ? 'border-[var(--fk-primary)] bg-[var(--fk-primary)/0.05]'
                                  : 'border-gray-200 dark:border-gray-300 hover:border-gray-300 dark:hover:border-gray-400 bg-white dark:bg-white'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-sm">{type.icon}</span>
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-gray-900 text-xs">{type.title}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{type.description}</div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Priority */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-700 mb-1.5">
                          Priority
                        </label>
                        <select
                          value={selectedPriority}
                          onChange={(e) => setSelectedPriority(e.target.value as Priority)}
                          className="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-300 rounded focus:ring-1 focus:ring-[var(--fk-primary)] focus:border-[var(--fk-primary)] outline-none bg-white dark:bg-white text-gray-900 dark:text-gray-900 text-xs"
                        >
                          {priorities.map((priority) => (
                            <option key={priority.id} value={priority.id}>
                              {priority.label} - {priority.description}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Title */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-700 mb-1.5">
                          Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Brief description"
                          required
                          className="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-300 rounded focus:ring-1 focus:ring-[var(--fk-primary)] focus:border-[var(--fk-primary)] outline-none bg-white dark:bg-white text-xs"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-700 mb-1.5">
                          Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Detailed information..."
                          required
                          rows={2}
                          className="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-300 rounded focus:ring-1 focus:ring-[var(--fk-primary)] focus:border-[var(--fk-primary)] outline-none resize-none bg-white dark:bg-white text-xs"
                        />
                      </div>

                      {/* Screenshot Section */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-700 mb-1.5">
                          Screenshot (Optional)
                        </label>
                        {screenshot ? (
                          <div className="space-y-1.5">
                            <div className="relative border border-gray-200 dark:border-gray-300 rounded overflow-hidden">
                              <img
                                src={screenshot.imageData}
                                alt="Screenshot"
                                className="w-full h-auto max-h-16 object-cover"
                              />
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => setShowScreenshotCapture(true)}
                                className="px-1.5 py-1 text-xs border border-gray-200 dark:border-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-50"
                              >
                                Change
                              </button>
                              <button
                                type="button"
                                onClick={() => setScreenshot(null)}
                                className="px-1.5 py-1 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowScreenshotCapture(true)}
                            className="w-full px-2 py-1.5 border border-dashed border-gray-300 dark:border-gray-400 rounded text-gray-700 dark:text-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-800 dark:hover:text-gray-800 transition-colors bg-gray-50/50 dark:bg-gray-50/50"
                          >
                            <div className="flex items-center justify-center space-x-1.5">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-xs">Add Screenshot</span>
                            </div>
                          </button>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-700 mb-1.5">
                          Email (Optional)
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-300 rounded focus:ring-1 focus:ring-[var(--fk-primary)] focus:border-[var(--fk-primary)] outline-none bg-white dark:bg-white text-xs"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                          We'll only use this to follow up on your feedback if needed.
                        </p>
                      </div>

                      {error && (
                        <div className="p-2 bg-red-50 border border-red-200 rounded">
                          <p className="text-xs text-red-600">{error}</p>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-200">
                        <span>{formatDate()}</span>
                        <span>{getBrowser()}</span>
                        <span>{appName}</span>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={submitting}
                        style={primaryStyle}
                        className={`w-full py-1.5 text-white font-medium rounded transition-opacity text-xs ${
                          submitting ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                        }`}
                      >
                        {submitting ? 'Submitting...' : 'Submit Feedback'}
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        {showScreenshotCapture && (
          <div data-feedbackkit-widget="screenshot" className="fixed inset-0 z-[9999]">
            <ScreenshotCapture
              onScreenshotCaptured={handleScreenshotCaptured}
              onClose={() => setShowScreenshotCapture(false)}
            />
          </div>
        )}
      </Portal>
    </div>
  );
}; 