// notifications.js — Complete client-side notification toolkit for partners.
// Includes: Web Audio alert (no files), tab-title badge, native Notification API
// fallback, and permission helpers. OneSignal is handled separately in onesignal.js.

// --- Audio alert (Web Audio API — generates a two-tone chime, no audio files) ---

let _audioCtx = null
function getAudioCtx() {
  if (!_audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (Ctx) _audioCtx = new Ctx()
  }
  return _audioCtx
}

/**
 * Play a short attention-grabbing two-tone alert for a new order.
 * Browsers require a prior user gesture before audio can play; we resume the
 * context defensively.
 */
export function playOrderAlert() {
  const ctx = getAudioCtx()
  if (!ctx) return
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)

  // High then low tone — distinctive "new order" sound.
  osc.frequency.setValueAtTime(880, ctx.currentTime)
  osc.frequency.setValueAtTime(440, ctx.currentTime + 0.3)
  gain.gain.setValueAtTime(0.5, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6)

  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.6)
}

// --- Tab title badge (shows unread order count, can blink) ---

const BASE_TITLE = 'FlashCart Partner — Business Dashboard'
let _blinkTimer = null

/**
 * Update the browser tab title with the unread-order count.
 * @param {number} count
 */
export function updateTabTitle(count) {
  document.title = count > 0 ? `(${count}) নতুন অর্ডার | FlashCart Partner` : BASE_TITLE
}

/**
 * Blink the tab title to draw attention while there are unread orders.
 * @param {number} count
 */
export function startTitleBlink(count) {
  stopTitleBlink()
  if (count <= 0) return
  let on = false
  _blinkTimer = setInterval(() => {
    document.title = on ? BASE_TITLE : `(${count}) নতুন অর্ডার!`
    on = !on
  }, 1000)
}

/** Stop blinking and restore the base title. */
export function stopTitleBlink() {
  if (_blinkTimer) {
    clearInterval(_blinkTimer)
    _blinkTimer = null
  }
  document.title = BASE_TITLE
}

// --- Native Notification API (fallback when OneSignal unavailable) ---

/**
 * Request native notification permission.
 * @returns {Promise<NotificationPermission>}
 */
export async function requestNativePermission() {
  if (!('Notification' in window)) return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  try {
    return await Notification.requestPermission()
  } catch {
    return 'denied'
  }
}

/**
 * Show a native system notification (works when tab is open/backgrounded).
 * @param {string} title
 * @param {object} options - body, icon, data, etc.
 */
export function showNativeNotification(title, options = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  try {
    const n = new Notification(title, { icon: '/favicon.svg', badge: '/favicon.svg', ...options })
    // Clicking focuses the window and optionally navigates.
    n.onclick = () => {
      window.focus()
      if (options.url) window.location.href = options.url
      n.close()
    }
  } catch {
    /* ignore */
  }
}

/** Current native permission state ('granted' | 'denied' | 'default'). */
export function notificationPermission() {
  return 'Notification' in window ? Notification.permission : 'denied'
}
