import { createRoot } from "react-dom/client";
import React from "react";
import { FeedbackWidget, FeedbackWidgetProps } from "./FeedbackWidget";

export interface StandaloneOptions extends FeedbackWidgetProps {
  /**
   * CSS selector for the element to mount the widget into. If not provided,
   * the widget will be mounted at the end of <body>.
   */
  target?: string;
}

function mountWidget(options: StandaloneOptions) {
  const { target, ...props } = options;

  // Resolve mount node
  let mountPoint: HTMLElement | null;
  if (target) {
    mountPoint = document.querySelector<HTMLElement>(target);
    if (!mountPoint) {
      console.error(
        `[FeedbackKit] Could not find mount target "${target}". Falling back to document.body.`
      );
      mountPoint = document.body;
    }
  } else {
    mountPoint = document.body;
  }

  // Create container div for React root
  const container = document.createElement("div");
  mountPoint.appendChild(container);

  // Render React component
  const root = createRoot(container);
  root.render(React.createElement(FeedbackWidget, props));
}

// Expose global helper. We intentionally attach to window in UMD/IIFE bundle
// so that users can call `FeedbackKitWidget.init({...})` after including the
// script via <script src=".../feedbackkit-widget.iife.js"></script>
declare global {
  interface Window {
    FeedbackKitWidget?: {
      init: (options: StandaloneOptions) => void;
    };
  }
}

if (typeof window !== "undefined") {
  window.FeedbackKitWidget = {
    init: mountWidget,
  };
} 