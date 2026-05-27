// ============================================================
// FlashCart — OneSignal Service Worker
// MUST be placed in /public/ folder (root of the domain)
// OneSignal requires this file at exactly:
// https://partner.flashcart.bsdc.info.bd/OneSignalSDKWorker.js
//
// This file enables background push notifications —
// notifications delivered even when browser is closed.
//
// Developer: Rizwan Rahim Chowdhury
// Powered by: Bangladesh Software Development Community
// ============================================================

// Import OneSignal service worker script
// This is loaded by OneSignal's SDK automatically
// The importScripts URL is OneSignal's CDN — always use this exact URL
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
