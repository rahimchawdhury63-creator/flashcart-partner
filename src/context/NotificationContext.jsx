// ============================================================
// FlashCart — Notification Context Provider
// Manages the 5-layer notification system state.
// Coordinates OneSignal, RTDB listener, tab flash,
// Web Audio API sound, and native browser notifications.
//
// 5 LAYERS:
// Layer 1: OneSignal Web Push (browser closed — background)
// Layer 2: Firebase RTDB listener (tab open — foreground)
// Layer 3: Page Visibility + Tab Title Flash (tab hidden)
// Layer 4: Web Audio API Sound (tab active)
// Layer 5: Native Browser Notification API (system level)
//
// Developer: Rizwan Rahim Chowdhury
// Powered by: Bangladesh Software Development Community
// ============================================================

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';

// Firebase RTDB notification functions
import {
  subscribeToPartnerNotifications,
  subscribeToStoreActiveOrders,
  markNotificationRead,
  markAllNotificationsRead,
  clearAllNotifications,
  setPartnerPresence,
  updatePartnerTabActive,
  removePartnerPresence,
} from '../services/firebase/rtdb';

// OneSignal service functions
import {
  initOneSignal,
  requestNotificationPermission,
  checkNotificationSubscription,
  getPlayerID,
} from '../services/onesignal';

// Auth context for partner ID
import { AuthContext } from './AuthContext';

// NOTIFICATIONS constants
import { NOTIFICATIONS } from '../utils/constants';

// ── CREATE CONTEXT ─────────────────────────────────────────
const NotificationContext = createContext(null);

// ── PROVIDER COMPONENT ─────────────────────────────────────

/**
 * NotificationProvider
 * Wraps the partner portal app to provide notification state.
 * Sets up all 5 notification layers automatically.
 */
export const NotificationProvider = ({ children }) => {

  // Get partner auth state
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const partnerId = user?.uid;

  // ── NOTIFICATION STATE ────────────────────────────────

  // Array of notification objects from RTDB
  const [notifications, setNotifications] = useState([]);

  // Count of unread notifications (for badge)
  const [unreadCount, setUnreadCount] = useState(0);

  // Currently active orders (from RTDB activeOrders path)
  const [activeOrders, setActiveOrders] = useState([]);

  // New order alert state (triggers sound + flash)
  const [newOrderAlert, setNewOrderAlert] = useState(null);

  // OneSignal subscription status
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Native notification permission
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  // Whether notification system is initialized
  const [isInitialized, setIsInitialized] = useState(false);

  // Whether audio is available (user has interacted with page)
  const [audioEnabled, setAudioEnabled] = useState(false);

  // ── REFS ────────────────────────────────────────────

  // Audio context for Web Audio API (Layer 4)
  const audioContextRef = useRef(null);

  // Tab title flash interval reference (Layer 3)
  const tabFlashIntervalRef = useRef(null);

  // Original page title — restore after flash
  const originalTitleRef = useRef(document.title);

  // Previous order count — detect new orders
  const prevOrderCountRef = useRef(0);

  // RTDB unsubscribe functions
  const notifUnsubscribeRef = useRef(null);
  const ordersUnsubscribeRef = useRef(null);

  // ── LAYER 4: WEB AUDIO API SOUND ─────────────────────

  /**
   * createNotificationSound
   * Generates a notification sound using Web Audio API.
   * No external sound file needed — pure JavaScript audio synthesis.
   * Creates a pleasant 2-tone chime sound.
   */
  const playNotificationSound = useCallback(() => {
    // Audio requires user interaction first
    if (!audioEnabled) return;

    try {
      // Create or reuse AudioContext
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const ctx = audioContextRef.current;

      // Resume if suspended (browser auto-suspends unused AudioContext)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // First tone — higher pitch ding
      const playTone = (frequency, startTime, duration, volume = 0.3) => {
        // Create oscillator (sound generator)
        const oscillator = ctx.createOscillator();

        // Create gain node (volume control)
        const gainNode = ctx.createGain();

        // Connect oscillator → gain → output
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Set frequency (pitch) — 880Hz = high A note
        oscillator.frequency.setValueAtTime(frequency, startTime);

        // Sine wave for smooth, pleasant sound
        oscillator.type = 'sine';

        // Volume envelope — quick fade in, then fade out
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.02); // Quick attack
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // Fade out

        // Play the tone
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      const now = ctx.currentTime;

      // Play 2-tone chime: high note then lower note
      playTone(880, now, 0.3, 0.4);        // First chime — A5
      playTone(660, now + 0.2, 0.4, 0.3);  // Second chime — E5 (slightly quieter)
      playTone(880, now + 0.5, 0.3, 0.35); // Third chime — A5 again

    } catch (error) {
      // Audio API might not be available in all browsers
      console.warn('[FlashCart Notifications] Audio play failed:', error.message);
    }
  }, [audioEnabled]);

  // ── LAYER 3: TAB TITLE FLASH ──────────────────────────

  /**
   * startTabFlash
   * Alternates the browser tab title to alert partner.
   * Works even when the browser window is not focused.
   * Text: "NEW ORDER — FlashCart Partner" ↔ original title
   */
  const startTabFlash = useCallback(() => {
    // Don't start if already flashing
    if (tabFlashIntervalRef.current) return;

    // Save the current title to restore later
    originalTitleRef.current = document.title;

    let isFlashing = true;

    // Alternate title every second
    tabFlashIntervalRef.current = setInterval(() => {
      document.title = isFlashing
        ? NOTIFICATIONS.TAB_FLASH_MESSAGE        // "NEW ORDER — FlashCart Partner"
        : originalTitleRef.current;              // Original title
      isFlashing = !isFlashing;
    }, NOTIFICATIONS.TAB_FLASH_INTERVAL); // Default 1000ms

  }, []);

  /**
   * stopTabFlash
   * Stops the tab title flashing and restores original title.
   */
  const stopTabFlash = useCallback(() => {
    if (tabFlashIntervalRef.current) {
      clearInterval(tabFlashIntervalRef.current);
      tabFlashIntervalRef.current = null;
    }

    // Restore original title
    document.title = originalTitleRef.current;
  }, []);

  // ── LAYER 5: NATIVE BROWSER NOTIFICATION ──────────────

  /**
   * showBrowserNotification
   * Shows a native system notification using the Notification API.
   * Works even when browser is not focused.
   *
   * @param {string} title - Notification title
   * @param {string} body - Notification body text
   * @param {object} data - Extra data (orderId, etc.)
   */
  const showBrowserNotification = useCallback((title, body, data = {}) => {
    // Check if browser supports notifications
    if (!('Notification' in window)) return;

    // Check permission
    if (Notification.permission !== 'granted') return;

    try {
      // Create and show the notification
      const notification = new Notification(title, {
        body,
        // Use FlashCart favicon as the notification icon
        icon: '/favicon.svg',
        // Badge for mobile (Android)
        badge: '/favicon.svg',
        // Tag groups similar notifications (prevents spam)
        tag: `flashcart-order-${data.orderId || Date.now()}`,
        // Require interaction — notification stays until clicked
        requireInteraction: true,
        // Extra data for click handler
        data,
        // Vibration pattern (mobile) — [vibrate, pause, vibrate]
        vibrate: [200, 100, 200],
      });

      // Handle notification click
      notification.onclick = (event) => {
        // Focus the browser window/tab
        window.focus();

        // Close the notification
        event.target.close();

        // Navigate to orders if there's an orderId
        if (data.orderId) {
          window.location.href = `/orders?orderId=${data.orderId}`;
        } else {
          window.location.href = '/orders';
        }
      };

      // Auto-close after 30 seconds if not dismissed
      setTimeout(() => {
        notification.close();
      }, 30000);

    } catch (error) {
      console.warn('[FlashCart Notifications] Browser notification failed:', error.message);
    }
  }, []);

  // ── PAGE VISIBILITY API HANDLER ───────────────────────

  /**
   * handleVisibilityChange
   * Updates partner presence when tab becomes visible/hidden.
   * This is Layer 3's trigger — when tab is hidden, start flashing.
   */
  const handleVisibilityChange = useCallback(async () => {
    if (!partnerId) return;

    const isVisible = document.visibilityState === 'visible';

    // Update RTDB presence
    await updatePartnerTabActive(partnerId, isVisible);

    // If tab became visible, stop any active flashing
    if (isVisible) {
      stopTabFlash();
    }
  }, [partnerId, stopTabFlash]);

  // Set up Page Visibility API listener
  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  // ── ENABLE AUDIO ON FIRST USER INTERACTION ────────────

  // Web Audio API requires user interaction before playing
  // Set audioEnabled to true on first click anywhere on the page
  useEffect(() => {
    const enableAudio = () => {
      setAudioEnabled(true);
      // Remove listener after first interaction
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('touchstart', enableAudio);
    };

    document.addEventListener('click', enableAudio, { once: true });
    document.addEventListener('touchstart', enableAudio, { once: true });

    return () => {
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('touchstart', enableAudio);
    };
  }, []);

  // ── NEW ORDER ALERT TRIGGER ───────────────────────────

  /**
   * triggerNewOrderAlert
   * Activates ALL notification layers when a new order arrives.
   * Called when RTDB detects a new order in the active orders path.
   *
   * @param {object} order - New order data
   */
  const triggerNewOrderAlert = useCallback((order) => {
    // Set new order state (for in-app alert UI)
    setNewOrderAlert(order);

    // Layer 4: Play sound notification
    playNotificationSound();

    // Layer 3: Flash tab title (only if tab is NOT visible)
    if (document.visibilityState !== 'visible') {
      startTabFlash();
    }

    // Layer 5: Native browser notification
    showBrowserNotification(
      'FlashCart — নতুন অর্ডার!',
      `${order.customerName || 'Customer'} — ৳${order.totalAmount}`,
      { orderId: order.id }
    );

    // Auto-clear the new order alert after 30 seconds
    // (Partner must acknowledge or it goes away on its own)
    setTimeout(() => {
      setNewOrderAlert(null);
      stopTabFlash();
    }, 30000);

  }, [playNotificationSound, startTabFlash, stopTabFlash, showBrowserNotification]);

  // ── LAYER 2: FIREBASE RTDB LISTENER ──────────────────

  // Subscribe to active orders when partner is logged in
  useEffect(() => {
    if (!partnerId) return;

    // Subscribe to active orders in RTDB
    const unsubscribe = subscribeToStoreActiveOrders(
      partnerId,
      (orders) => {
        // Detect new orders by comparing count
        const newCount = orders.length;
        const prevCount = prevOrderCountRef.current;

        if (newCount > prevCount) {
          // New order(s) arrived!
          const newOrders = orders.slice(0, newCount - prevCount);
          newOrders.forEach(order => {
            if (order.status === 'pending') {
              triggerNewOrderAlert(order);
            }
          });
        }

        // Update previous count for next comparison
        prevOrderCountRef.current = newCount;

        // Update active orders state
        setActiveOrders(orders);
      }
    );

    // Store unsubscribe function for cleanup
    ordersUnsubscribeRef.current = unsubscribe;

    // Cleanup on unmount
    return () => {
      if (ordersUnsubscribeRef.current) {
        ordersUnsubscribeRef.current();
      }
    };
  }, [partnerId, triggerNewOrderAlert]);

  // ── NOTIFICATIONS LISTENER ────────────────────────────

  // Subscribe to notification queue in RTDB
  useEffect(() => {
    if (!partnerId) return;

    const unsubscribe = subscribeToPartnerNotifications(
      partnerId,
      (notifs) => {
        setNotifications(notifs);

        // Count unread
        const unread = notifs.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      }
    );

    notifUnsubscribeRef.current = unsubscribe;

    return () => {
      if (notifUnsubscribeRef.current) {
        notifUnsubscribeRef.current();
      }
    };
  }, [partnerId]);

  // ── PARTNER PRESENCE ──────────────────────────────────

  // Set partner as online when they log in
  useEffect(() => {
    if (!partnerId) return;

    // Mark partner as online
    setPartnerPresence(partnerId);

    // Mark as offline on unmount (logout/close)
    return () => {
      removePartnerPresence(partnerId);
    };
  }, [partnerId]);

  // ── ONESIGNAL INITIALIZATION ──────────────────────────

  // Initialize OneSignal when component mounts
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize OneSignal SDK (Layer 1)
        await initOneSignal();

        // Check current subscription status
        const { isSubscribed: subStatus, permission } =
          await checkNotificationSubscription();

        setIsSubscribed(subStatus);
        setNotificationPermission(permission);
        setIsInitialized(true);

      } catch (error) {
        console.error('[FlashCart Notifications] Init failed:', error.message);
        setIsInitialized(true); // Mark as initialized even on error
      }
    };

    initialize();
  }, []);

  // ── ACTION HANDLERS ───────────────────────────────────

  /**
   * handleRequestPermission
   * Requests notification permission from the user.
   * Shows OneSignal prompt + updates state.
   */
  const handleRequestPermission = useCallback(async () => {
    const result = await requestNotificationPermission();

    if (result.subscribed) {
      setIsSubscribed(true);
      setNotificationPermission('granted');
    }

    return result;
  }, []);

  /**
   * handleMarkRead
   * Marks a single notification as read.
   */
  const handleMarkRead = useCallback(async (notificationId) => {
    if (!partnerId || !notificationId) return;
    await markNotificationRead(partnerId, notificationId);
  }, [partnerId]);

  /**
   * handleMarkAllRead
   * Marks all notifications as read.
   */
  const handleMarkAllRead = useCallback(async () => {
    if (!partnerId) return;
    await markAllNotificationsRead(partnerId);
  }, [partnerId]);

  /**
   * handleClearAll
   * Clears all notifications.
   */
  const handleClearAll = useCallback(async () => {
    if (!partnerId) return;
    await clearAllNotifications(partnerId);
  }, [partnerId]);

  /**
   * handleDismissOrderAlert
   * Dismisses the new order alert and stops tab flash.
   */
  const handleDismissOrderAlert = useCallback(() => {
    setNewOrderAlert(null);
    stopTabFlash();
  }, [stopTabFlash]);

  // ── CONTEXT VALUE ─────────────────────────────────────
  const contextValue = useMemo(() => ({
    // State
    notifications,
    unreadCount,
    activeOrders,
    newOrderAlert,
    isSubscribed,
    notificationPermission,
    isInitialized,
    audioEnabled,

    // Actions
    requestPermission: handleRequestPermission,
    markRead: handleMarkRead,
    markAllRead: handleMarkAllRead,
    clearAll: handleClearAll,
    dismissOrderAlert: handleDismissOrderAlert,
    playSound: playNotificationSound,
    showBrowserNotification,
    stopTabFlash,

    // Computed
    hasUnread: unreadCount > 0,
    hasActiveOrders: activeOrders.length > 0,
    pendingOrderCount: activeOrders.filter(o => o.status === 'pending').length,

  }), [
    notifications, unreadCount, activeOrders, newOrderAlert,
    isSubscribed, notificationPermission, isInitialized, audioEnabled,
    handleRequestPermission, handleMarkRead, handleMarkAllRead,
    handleClearAll, handleDismissOrderAlert,
    playNotificationSound, showBrowserNotification, stopTabFlash,
  ]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Export context for hook
export { NotificationContext };

export default NotificationProvider;
