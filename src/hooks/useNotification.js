// ============================================================
// FlashCart — useNotification Custom Hook
// Clean interface for partner portal components to access
// the 5-layer notification system.
//
// Usage:
//   const { notifications, unreadCount, newOrderAlert } = useNotification();
//
// Developer: Rizwan Rahim Chowdhury
// ============================================================

import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

/**
 * useNotification
 * Provides access to the notification context.
 * Must be used within NotificationProvider.
 *
 * @returns {object} Complete notification context
 *
 * @example
 * // Check for new orders
 * const { newOrderAlert, dismissOrderAlert } = useNotification();
 * if (newOrderAlert) {
 *   return <NewOrderModal order={newOrderAlert} onDismiss={dismissOrderAlert} />;
 * }
 *
 * @example
 * // Show unread badge
 * const { unreadCount } = useNotification();
 * return <Badge>{unreadCount}</Badge>;
 *
 * @example
 * // Request notification permission
 * const { requestPermission, isSubscribed } = useNotification();
 * <Button onClick={requestPermission}>Enable Notifications</Button>
 */
const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      '[FlashCart useNotification] Must be used within NotificationProvider. ' +
      'Wrap partner app with <NotificationProvider> in App.jsx.'
    );
  }

  return context;
};

export default useNotification;
