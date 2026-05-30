// onesignal.js — OneSignal Web Push initialization (Partner Portal ONLY).
// Initializes the SDK and exposes helpers to read the subscription/player id
// so the customer app's order flow can target this partner with a push.

// OneSignal App ID (public — safe in client code).
export const ONESIGNAL_APP_ID = '289acc0a-9fde-435e-aad7-aca9c0aca98d'

// Tracks whether init has run so we never initialize twice.
let initialized = false

/**
 * Initialize OneSignal. The SDK script is loaded via index.html (deferred).
 * We push our init callback into the OneSignalDeferred queue, which the SDK
 * drains once it is ready.
 * @returns {Promise<void>}
 */
export function initOneSignal() {
  if (initialized) return Promise.resolve()
  initialized = true

  return new Promise((resolve) => {
    window.OneSignalDeferred = window.OneSignalDeferred || []
    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        await OneSignal.init({
          appId: ONESIGNAL_APP_ID,
          // Allow OneSignal to work on localhost during development.
          allowLocalhostAsSecureOrigin: true,
          // We drive the permission prompt ourselves (custom modal),
          // so disable the default auto slidedown.
          autoResubscribe: true,
          notifyButton: { enable: false },
        })
      } catch {
        // SDK might be blocked (ad-blockers) — fall back handled elsewhere.
      } finally {
        resolve()
      }
    })
  })
}

/**
 * Prompt the browser for native push permission via OneSignal.
 * @returns {Promise<boolean>} whether permission is granted
 */
export function promptOneSignal() {
  return new Promise((resolve) => {
    window.OneSignalDeferred = window.OneSignalDeferred || []
    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        await OneSignal.Notifications.requestPermission()
        resolve(OneSignal.Notifications.permission === true)
      } catch {
        resolve(false)
      }
    })
  })
}

/**
 * Get the current OneSignal subscription / player id for this device.
 * This id is saved to the partner's Firestore user doc so orders can target them.
 * @returns {Promise<string|null>}
 */
export function getPlayerId() {
  return new Promise((resolve) => {
    window.OneSignalDeferred = window.OneSignalDeferred || []
    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        // v16 SDK exposes the subscription id under User.PushSubscription.
        const id = OneSignal.User?.PushSubscription?.id || null
        resolve(id)
      } catch {
        resolve(null)
      }
    })
  })
}

/**
 * Associate an external user id (the partner's Firebase uid) with OneSignal,
 * so notifications can also be targeted by external id.
 * @param {string} uid
 */
export function loginOneSignal(uid) {
  if (!uid) return
  window.OneSignalDeferred = window.OneSignalDeferred || []
  window.OneSignalDeferred.push(async (OneSignal) => {
    try {
      await OneSignal.login(uid)
    } catch {
      /* ignore */
    }
  })
}
