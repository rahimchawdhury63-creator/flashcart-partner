// ============================================================
// FlashCart — Partner Business Portal Entry Point
// CORRECTED VERSION — replaces Step 2 main.jsx
//
// Partner portal uses the same RouterProvider pattern.
// Additional difference from main portal:
// - Imports partner.css for dashboard-specific styles
// - Partner router will be defined in Step 29
// - For now, uses a placeholder router that will be replaced
//
// Developer: Rizwan Rahim Chowdhury
// Powered by: Bangladesh Software Development Community (bsdc.info.bd)
// ============================================================

// React 18 core
import React from 'react';

// React 18 concurrent rendering
import { createRoot } from 'react-dom/client';

// RouterProvider — replaces BrowserRouter
import { RouterProvider } from 'react-router-dom';

// HelmetProvider for per-page SEO meta tags
import { HelmetProvider } from 'react-helmet-async';

// Partner portal router — WILL BE CREATED IN STEP 29
// For now, create a placeholder: src/router.jsx with minimal content
// (see placeholder instructions below this file)
import router from './router';

// ── GLOBAL STYLES ──────────────────────────────────────────

// Design tokens — CSS custom properties (must be first)
import './styles/design-tokens.css';

// CSS reset and base element styles
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

// Partner portal specific styles
// (dashboard layouts, sidebar, data tables, widgets)
import './styles/partner.css';

// ── ROOT ELEMENT ──────────────────────────────────────────

// Get the React mount point from index.html
const rootElement = document.getElementById('root');

// Fail fast if root element is missing
if (!rootElement) {
  throw new Error(
    '[FlashCart Partner] Root element #root not found in index.html. ' +
    'Ensure index.html contains <div id="root"></div>.'
  );
}

// ── CREATE REACT 18 ROOT ──────────────────────────────────

// Concurrent root for React 18 features
const root = createRoot(rootElement);

// ── RENDER ───────────────────────────────────────────────

root.render(
  // StrictMode for development checks
  <React.StrictMode>

    {/* HelmetProvider — SEO meta tags for every partner page */}
    <HelmetProvider>

      {/* RouterProvider — partner portal routes from Step 29 */}
      <RouterProvider
        router={router}

        // Router initialization fallback
        fallbackElement={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              background: '#FAFAFA',
              fontFamily: 'Inter, sans-serif',
            }}
            role="status"
            aria-label="Partner portal loading"
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '3px solid #E8F5E9',
                borderTopColor: '#1B5E20',
                animation: 'spin 0.8s linear infinite',
              }}
              aria-hidden="true"
            />
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to   { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        }
      />

    </HelmetProvider>
  </React.StrictMode>
);
