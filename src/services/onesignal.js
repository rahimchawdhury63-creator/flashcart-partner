// ============================================================
// FlashCart — OneSignal Service
// Web push notification integration for partner portal.
// Handles subscription, player ID storage, and push sending.
//
// OneSignal Credentials:
// App ID:  289acc0a-9fde-435e-aad7-aca9c0aca98d
// REST Key: os_v2_app_fcnmycu73zbv5kwxvsu4blfjrxjhpbu4dp6ezx562jjsbpk3dpjrvuvypwzlfxhw2yta4qiupjmijw735zwj5nv6c3mx36ximt7un2q
//
// Developer: Rizwan Rahim Chowdhury
// Powered by: Bangladesh Software Development Community
// ============================================================

// OneSignal App ID from environment variables
const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID
  || '289acc0a-9fde-435e-aad7-aca9c0aca98d';

// OneSignal REST API Key — for server-side push sending
// Note: In production, this should be called from a backend
// For now we call OneSignal REST API directly from client
// (acceptable for partner-to-partner notification pattern)
const ONESIGNAL_REST_API_KEY = import.meta.env.VITE_ONESIGNAL_REST_API_KEY
  || 'os_v2_app_fcnmycu73zbv5kwxvsu4blfjrxjhpbu4dp6ezx562jjsbpk3dpjrvuvypwzlfxhw2yta4qiupjmijw735zwj5nv6c3mx36ximt7un2q';

// OneSignal API base URL
const ONESIGNAL_API_URL = 'https://onesignal.com/api/v1';

// Track initialization state — prevent double initialization
let isInitialized = false;

// ── ONESIGNAL INITIALIZATION ──────────────────────────────

/**
 * initOneSignal
 * Initializes the OneSignal SDK on the partner portal.
 * Must be called once when the app loads.
 * Loads the OneSignal SDK dynamically to avoid blocking render.
 *
 * @returns {Promise<boolean>} Whether initialization succeeded
 */
export const initOneSignal = async () => {
  // Prevent double initialization
  if (isInitialized) {
    if (import.meta.env.DEV) {
      console.log('[FlashCart OneSignal] Already initialized');
    }
    return true;
  }

  // OneSignal requires HTTPS — skip in development unless using ngrok/localhost
  // OneSignal actually works on localhost for testing
  try {
    // Check if OneSignal SDK is available globally
    // The SDK is loaded via the index.html script tag
    if (typeof window === 'undefined') return false;

    // Load OneSignal SDK dynamically
    // This prevents it from blocking the initial page render
    await loadOneSignalSDK();

    // Wait for OneSignal to be available on window
    await waitForOneSignal();

    // Initialize with our configuration
    window.OneSignalDeferred = window.OneSignalDeferred || [];

    // Push initialization config to OneSignal
    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        await OneSignal.init({
          // Our App ID from OneSignal dashboard
          appId: ONESIGNAL_APP_ID,

          // Allow localhost for development testing
          allowLocalhostAsSecureOrigin: true,

          // Service worker configuration
          // The OneSignalSDKWorker.js must be in /public/
          serviceWorkerParam: {
            scope: '/',
          },

          // Prompt settings — when to ask for permission
          promptOptions: {
            // Don't show the native browser prompt immediately
            // We control when to show it via our custom UI
            autoPrompt: false,

            // Custom prompt text
            actionMessage: 'নতুন অর্ডার পেতে Notification চালু করুন',
            exampleNotificationTitle: 'নতুন অর্ডার এসেছে!',
            exampleNotificationMessage: 'একটি নতুন অর্ডার অপেক্ষা করছে।',
          },

          // Notification display settings
          notifyButton: {
            // We use our own custom notification button
            // So we disable the default OneSignal floating button
            enable: false,
          },

          // Welcome notification when user first subscribes
          welcomeNotification: {
            title: 'FlashCart Partner',
            message: 'আপনি এখন নতুন অর্ডারের Notification পাবেন! / You will now receive new order notifications!',
          },
        });

        // Mark as initialized
        isInitialized = true;

        if (import.meta.env.DEV) {
          console.log('[FlashCart OneSignal] Initialized successfully');
        }

      } catch (initError) {
        console.error('[FlashCart OneSignal] Init error:', initError);
      }
    });

    return true;

  } catch (error) {
    console.error('[FlashCart OneSignal] Failed to initialize:', error.message);
    return false;
  }
};

// ── SDK LOADER ────────────────────────────────────────────

/**
 * loadOneSignalSDK
 * Dynamically loads the OneSignal SDK script.
 * Checks if already loaded to prevent duplicates.
 *
 * @returns {Promise<void>}
 */
const loadOneSignalSDK = () => {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (document.querySelector('script[src*="OneSignalSDK"]')) {
      resolve();
      return;
    }

    // Create the script element
    const script = document.createElement('script');

    // OneSignal CDN URL — always use the latest v16 SDK
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';

    // Defer loading — don't block page render
    script.defer = true;

    // Resolve when script loads
    script.onload = () => {
      if (import.meta.env.DEV) {
        console.log('[FlashCart OneSignal] SDK script loaded');
      }
      resolve();
    };

    // Reject on error
    script.onerror = () => {
      reject(new Error('Failed to load OneSignal SDK'));
    };

    // Add to document head
    document.head.appendChild(script);
  });
};

/**
 * waitForOneSignal
 * Polls until OneSignal is available on window object.
 * Necessary because script loading is async.
 *
 * @param {number} timeout - Max wait time in ms (default 10000)
 * @returns {Promise<void>}
 */
const waitForOneSignal = (timeout = 10000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      // OneSignal SDK ready
      if (window.OneSignal || window.OneSignalDeferred) {
        resolve();
        return;
      }

      // Timeout reached
      if (Date.now() - startTime > timeout) {
        reject(new Error('OneSignal SDK load timeout'));
        return;
      }

      // Check again in 100ms
      setTimeout(check, 100);
    };

    check();
  });
};

// ── SUBSCRIPTION MANAGEMENT ───────────────────────────────

/**
 * requestNotificationPermission
 * Shows the native browser permission prompt for push notifications.
 * Should be called when user clicks "Enable Notifications" button.
 * Returns the subscription result.
 *
 * @returns {Promise<{ subscribed: boolean, playerId: string|null }>}
 */
export const requestNotificationPermission = async () => {
  try {
    // Ensure OneSignal is initialized first
    if (!isInitialized) {
      await initOneSignal();
    }

    // Check if browser supports notifications
    if (!('Notification' in window)) {
      return {
        subscribed: false,
        playerId: null,
        error: 'Browser does not support notifications',
      };
    }

    // Check current permission state
    const currentPermission = Notification.permission;

    // If already denied, we can't ask again programmatically
    // User must manually enable in browser settings
    if (currentPermission === 'denied') {
      return {
        subscribed: false,
        playerId: null,
        error: 'denied',
        message: 'Browser settings-এ Notification Permission চালু করুন / Enable notification permission in browser settings',
      };
    }

    // Request permission via OneSignal
    // This shows the native browser permission dialog
    let subscribed = false;

    await new Promise((resolve) => {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async (OneSignal) => {
        try {
          // Show the permission prompt
          await OneSignal.Slidedown.promptPush();

          // Check if user subscribed
          subscribed = await OneSignal.User.PushSubscription.optedIn;

          resolve();
        } catch (err) {
          console.error('[FlashCart OneSignal] Permission prompt error:', err);
          resolve();
        }
      });
    });

    // Get the player ID (subscription ID) if subscribed
    let playerId = null;

    if (subscribed) {
      playerId = await getPlayerID();
    }

    return { subscribed, playerId };

  } catch (error) {
    console.error('[FlashCart OneSignal] Permission request failed:', error.message);
    return { subscribed: false, playerId: null, error: error.message };
  }
};

/**
 * getPlayerID
 * Gets the current user's OneSignal player/subscription ID.
 * This ID is used to send push notifications to specific partners.
 *
 * @returns {Promise<string|null>} Player ID or null
 */
export const getPlayerID = async () => {
  try {
    // Get player ID via OneSignal SDK
    return await new Promise((resolve) => {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async (OneSignal) => {
        try {
          const id = OneSignal.User.PushSubscription.id;
          resolve(id || null);
        } catch {
          resolve(null);
        }
      });
    });
  } catch {
    return null;
  }
};

/**
 * checkNotificationSubscription
 * Checks if the current user is subscribed to push notifications.
 *
 * @returns {Promise<{ isSubscribed: boolean, permission: string }>}
 */
export const checkNotificationSubscription = async () => {
  try {
    // Check native browser permission first
    const permission = Notification.permission;

    // Get OneSignal subscription status
    const isSubscribed = await new Promise((resolve) => {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async (OneSignal) => {
        try {
          const optedIn = await OneSignal.User.PushSubscription.optedIn;
          resolve(Boolean(optedIn));
        } catch {
          resolve(false);
        }
      });
    });

    return { isSubscribed, permission };

  } catch {
    return { isSubscribed: false, permission: 'default' };
  }
};

/**
 * unsubscribeFromNotifications
 * Unsubscribes from OneSignal push notifications.
 * Called when partner disables notifications in settings.
 *
 * @returns {Promise<boolean>} Success status
 */
export const unsubscribeFromNotifications = async () => {
  try {
    await new Promise((resolve) => {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async (OneSignal) => {
        try {
          // Opt out of push notifications
          await OneSignal.User.PushSubscription.optOut();
          resolve(true);
        } catch {
          resolve(false);
        }
      });
    });

    return true;

  } catch (error) {
    console.error('[FlashCart OneSignal] Unsubscribe failed:', error);
    return false;
  }
};

// ── PUSH NOTIFICATION SENDING ─────────────────────────────

/**
 * sendPushToPartner
 * Sends a push notification to a specific partner via OneSignal REST API.
 * Called when a customer places an order.
 *
 * ARCHITECTURE NOTE:
 * Ideally this would be called from a Firebase Cloud Function
 * to keep the REST API key secret. For the free tier without
 * Cloud Functions, we call it from the client.
 * The REST API key is already in the environment.
 *
 * @param {string} playerID - Partner's OneSignal player ID
 * @param {object} notification - Notification content
 * @param {string} notification.title - Notification title
 * @param {string} notification.message - Notification body
 * @param {object} notification.data - Extra data (orderId, etc.)
 * @returns {Promise<boolean>} Success status
 */
export const sendPushToPartner = async (playerID, notification) => {
  // Validate inputs
  if (!playerID || !notification) return false;

  try {
    // Build the OneSignal notification payload
    const payload = {
      // App identifier
      app_id: ONESIGNAL_APP_ID,

      // Target specific player (the partner)
      include_player_ids: [playerID],

      // Notification content — supports Bangla Unicode
      headings: {
        en: notification.title || 'FlashCart — নতুন অর্ডার!',
        bn: notification.title || 'FlashCart — নতুন অর্ডার!',
      },

      contents: {
        en: notification.message || 'আপনার দোকানে একটি নতুন অর্ডার এসেছে। A new order has arrived at your store.',
        bn: notification.message || 'আপনার দোকানে একটি নতুন অর্ডার এসেছে।',
      },

      // Extra data passed to notification click handler
      data: {
        type: 'new_order',
        ...notification.data,
      },

      // Click action — open the partner dashboard orders page
      url: `${import.meta.env.VITE_PARTNER_URL || 'https://partner.flashcart.bsdc.info.bd'}/orders`,

      // Notification appearance
      chrome_web_icon: `${import.meta.env.VITE_PARTNER_URL || 'https://partner.flashcart.bsdc.info.bd'}/icons/flashcart-logo.svg`,

      // Sound — play default notification sound
      chrome_web_badge: `${import.meta.env.VITE_PARTNER_URL || 'https://partner.flashcart.bsdc.info.bd'}/favicon.svg`,

      // Keep notification visible until user dismisses (important for orders)
      require_interaction: true,

      // Priority — high for new orders
      priority: 10,

      // Time to live — 30 minutes (if partner offline, deliver when online)
      ttl: 1800,
    };

    // Send via OneSignal REST API
    const response = await fetch(`${ONESIGNAL_API_URL}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // REST API Key for authentication
        'Authorization': `Key ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[FlashCart OneSignal] Push send failed:', errorText);
      return false;
    }

    const result = await response.json();

    if (import.meta.env.DEV) {
      console.log('[FlashCart OneSignal] Push sent:', result);
    }

    return true;

  } catch (error) {
    console.error('[FlashCart OneSignal] Push send error:', error.message);
    return false;
  }
};

/**
 * sendOrderNotification
 * Convenience function for sending new order notifications.
 * Combines order data into the correct notification format.
 *
 * @param {string} partnerPlayerId - Partner's OneSignal player ID
 * @param {object} order - Order data
 * @returns {Promise<boolean>}
 */
export const sendOrderNotification = async (partnerPlayerId, order) => {
  if (!partnerPlayerId || !order) return false;

  // Build notification content with order details
  const title = 'FlashCart — নতুন অর্ডার!';
  const message = `${order.customerName || 'Customer'} — ৳${order.totalAmount || 0} — ${order.items?.length || 0} item(s)`;

  return sendPushToPartner(partnerPlayerId, {
    title,
    message,
    data: {
      orderId: order.id || order.orderId,
      totalAmount: order.totalAmount,
      customerName: order.customerName,
    },
  });
};

// ── NOTIFICATION CLICK HANDLER ─────────────────────────────

/**
 * setupNotificationClickHandler
 * Sets up the handler for when a partner clicks a notification.
 * Navigates to the orders page.
 *
 * @param {function} navigate - React Router navigate function
 */
export const setupNotificationClickHandler = (navigate) => {
  window.OneSignalDeferred = window.OneSignalDeferred || [];

  window.OneSignalDeferred.push((OneSignal) => {
    // Listen for notification clicks
    OneSignal.Notifications.addEventListener('click', (event) => {
      // Get the data from the notification
      const data = event.notification.data || {};

      if (import.meta.env.DEV) {
        console.log('[FlashCart OneSignal] Notification clicked:', data);
      }

      // Navigate based on notification type
      if (data.type === 'new_order' && data.orderId) {
        // Go to specific order
        navigate(`/orders?orderId=${data.orderId}`);
      } else {
        // Go to orders list
        navigate('/orders');
      }
    });
  });
};
