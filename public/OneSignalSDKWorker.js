/**
 * =============================================================================
 * ONESIGNAL SDK WORKER — Required by OneSignal Web Push SDK
 * =============================================================================
 * 
 * Purpose: This file MUST exist at the root of the partner portal's public
 * directory. OneSignal's SDK looks for this file to register its service worker
 * for handling push subscriptions and receiving push events.
 * 
 * The file imports OneSignal's actual service worker code from their CDN.
 * OneSignal handles all the complex push subscription management internally.
 * 
 * IMPORTANT: This file is ONLY in the partner portal, not in main or docs.
 * 
 * Developer: Rizwan Rahim Chowdhury
 * =============================================================================
 */

importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
