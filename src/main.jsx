/**
 * =============================================================================
 * FLASHCART PARTNER PORTAL — Application Entry Point
 * =============================================================================
 * 
 * Bootstraps the partner portal React application.
 * Identical structure to main app's main.jsx but with:
 * - OneSignal initialization
 * - Partner-specific service worker registration
 * 
 * Developer: Rizwan Rahim Chowdhury
 * =============================================================================
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';

/* Global Styles */
import './styles/variables.css';
import './styles/global.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/animations.css';
import './styles/fabric-overrides.css';

/* Create React Root */
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);

/**
 * =============================================================================
 * ONESIGNAL INITIALIZATION — Partner Portal Only
 * =============================================================================
 * Initialize OneSignal Web Push SDK after the page loads.
 * This enables push notifications for order alerts.
 * 
 * Flow:
 * 1. Wait for page load (don't block rendering)
 * 2. Initialize OneSignal with our App ID
 * 3. OneSignal shows native browser permission prompt
 * 4. On permission grant, OneSignal provides a Player ID
 * 5. Player ID is saved to Firestore by NotificationContext
 * 6. Orders use this Player ID to send targeted push notifications
 */
window.addEventListener('load', () => {
  /* Initialize OneSignal if the SDK loaded successfully */
  if (window.OneSignalDeferred) {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function(OneSignal) {
      try {
        await OneSignal.init({
          appId: import.meta.env.VITE_ONESIGNAL_APP_ID || "289acc0a-9fde-435e-aad7-aca9c0aca98d",
          /* Allow localhost for development */
          allowLocalhostAsSecureOrigin: true,
          /* Notification prompt settings */
          notifyButton: {
            enable: false /* We use our own custom prompt */
          },
          /* Service worker configuration */
          serviceWorkerParam: {
            scope: '/'
          },
          serviceWorkerPath: '/OneSignalSDKWorker.js'
        });
        console.log('[FlashCart Partner] OneSignal initialized successfully');
      } catch (error) {
        console.warn('[FlashCart Partner] OneSignal initialization failed:', error);
      }
    });
  } else {
    console.warn('[FlashCart Partner] OneSignal SDK not loaded');
  }
});

/**
 * Service Worker Registration (Partner Portal)
 * Registers the app's own service worker alongside OneSignal's.
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('[FlashCart Partner] Service Worker registered:', registration.scope);

        /* Check for updates every 30 minutes (more frequent for partner portal) */
        setInterval(() => {
          registration.update();
        }, 30 * 60 * 1000);

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                window.dispatchEvent(new CustomEvent('swUpdateAvailable', {
                  detail: { registration }
                }));
              }
            });
          }
        });
      })
      .catch((error) => {
        console.warn('[FlashCart Partner] SW registration failed:', error);
      });
  });
}
