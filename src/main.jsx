// ============================================================
// FlashCart — Partner Business Portal Entry Point
// Developer: Rizwan Rahim Chowdhury
// Powered by: Bangladesh Software Development Community (bsdc.info.bd)
// ============================================================

// React 18 core import
import React from 'react';

// React 18 concurrent rendering API
import { createRoot } from 'react-dom/client';

// Browser-based routing for clean URL navigation
import { BrowserRouter } from 'react-router-dom';

// React Helmet Async for dynamic SEO meta tags per route
import { HelmetProvider } from 'react-helmet-async';

// Partner portal root component
import App from './App';

// ── GLOBAL STYLES (same design system as main portal) ────────

// CSS custom properties — design tokens (colors, spacing, etc.)
import './styles/design-tokens.css';

// Base reset and global element styles
import './styles/global.css';

// Typography scale and font definitions
import './styles/typography.css';

// Utility classes for layout and spacing
import './styles/utilities.css';

// Animation keyframes
import './styles/animations.css';

// Responsive breakpoint utilities
import './styles/responsive.css';

// Fabric CSS grid system
import './styles/fabric.css';

// Partner portal specific styles (dashboard layouts, sidebar, etc.)
import './styles/partner.css';

// ── MOUNT APPLICATION ─────────────────────────────────────────

// Get root DOM element — defined in index.html
const rootElement = document.getElementById('root');

// Fail fast with clear error if root missing
if (!rootElement) {
  throw new Error(
    'FlashCart Partner: Root element #root not found. ' +
    'Check index.html for <div id="root"></div>'
  );
}

// Create React 18 concurrent root
const root = createRoot(rootElement);

// Render partner portal with providers
root.render(
  <React.StrictMode>
    {/* HelmetProvider for per-route meta tag management */}
    <HelmetProvider>
      {/* BrowserRouter for URL-based navigation */}
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        {/* Partner App with all context providers and protected routes */}
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
