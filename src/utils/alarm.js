// alarm.js — Foodpanda-style CONTINUOUS order alarm.
// Plays a looping ringtone (public/order-alert.mp3) that keeps ringing until the
// partner acknowledges the order. Includes a Web-Audio fallback siren (generated,
// no file) in case the MP3 can't load, plus device vibration.
//
// Browser autoplay policy: audio can only start after a user gesture. We "unlock"
// the audio on the first click/tap/keypress anywhere in the app (see armAlarm()).

const SOUND_URL = '/order-alert.mp3'

let _audioEl = null          // HTMLAudioElement for the MP3 loop
let _unlocked = false        // true once a user gesture has unlocked audio
let _ringing = false         // is the alarm currently ringing?
let _fallbackTimer = null    // interval for the Web-Audio fallback siren
let _vibrateTimer = null     // interval for repeated vibration
let _audioCtx = null         // shared AudioContext for fallback siren

// Lazily create the <audio> element pointing at the looping ringtone.
function getAudioEl() {
  if (!_audioEl) {
    _audioEl = new Audio(SOUND_URL)
    _audioEl.loop = true        // KEY: keep ringing continuously
    _audioEl.preload = 'auto'
    _audioEl.volume = 1.0
  }
  return _audioEl
}

function getAudioCtx() {
  if (!_audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (Ctx) _audioCtx = new Ctx()
  }
  return _audioCtx
}

/**
 * Unlock audio on the first user interaction so later programmatic plays succeed.
 * Call this once on app mount; it self-removes after the first gesture.
 */
export function armAlarm() {
  if (_unlocked) return
  const unlock = () => {
    _unlocked = true
    // Prime the MP3: play muted for an instant, then reset.
    try {
      const a = getAudioEl()
      a.muted = true
      a.play().then(() => { a.pause(); a.currentTime = 0; a.muted = false }).catch(() => { a.muted = false })
    } catch { /* ignore */ }
    // Resume any suspended AudioContext.
    try { const c = getAudioCtx(); if (c?.state === 'suspended') c.resume() } catch { /* ignore */ }
    window.removeEventListener('click', unlock)
    window.removeEventListener('touchstart', unlock)
    window.removeEventListener('keydown', unlock)
  }
  window.addEventListener('click', unlock, { once: false })
  window.addEventListener('touchstart', unlock, { once: false })
  window.addEventListener('keydown', unlock, { once: false })
}

// Web-Audio fallback siren (two-tone), repeated while the MP3 is unavailable.
function playFallbackBeep() {
  const ctx = getAudioCtx()
  if (!ctx) return
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.frequency.setValueAtTime(988, ctx.currentTime)       // B5
  osc.frequency.setValueAtTime(660, ctx.currentTime + 0.25) // E5
  gain.gain.setValueAtTime(0.6, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.5)
}

/**
 * Start the continuous alarm. Safe to call repeatedly (no-op if already ringing).
 * Tries the MP3 loop first; if it fails, runs the fallback siren every 0.9s.
 * Also vibrates the device repeatedly (mobile).
 */
export function startAlarm() {
  if (_ringing) return
  _ringing = true

  // 1) Try the looping MP3.
  let mp3Ok = false
  try {
    const a = getAudioEl()
    a.currentTime = 0
    const p = a.play()
    if (p && typeof p.then === 'function') {
      p.then(() => { mp3Ok = true }).catch(() => { startFallback() })
    } else {
      mp3Ok = true
    }
  } catch {
    startFallback()
  }

  // 2) If MP3 didn't confirm quickly, ensure the fallback is running.
  setTimeout(() => { if (_ringing && !mp3Ok && !_fallbackTimer) startFallback() }, 400)

  // 3) Repeated vibration on mobile (Android Chrome supports this).
  if ('vibrate' in navigator) {
    const buzz = () => navigator.vibrate([400, 200, 400])
    buzz()
    _vibrateTimer = setInterval(buzz, 1500)
  }
}

// Start the generated fallback siren loop.
function startFallback() {
  if (_fallbackTimer) return
  playFallbackBeep()
  _fallbackTimer = setInterval(playFallbackBeep, 900)
}

/**
 * Stop the alarm completely (MP3 + fallback + vibration). Call on acknowledge.
 */
export function stopAlarm() {
  _ringing = false
  if (_audioEl) {
    try { _audioEl.pause(); _audioEl.currentTime = 0 } catch { /* ignore */ }
  }
  if (_fallbackTimer) { clearInterval(_fallbackTimer); _fallbackTimer = null }
  if (_vibrateTimer) { clearInterval(_vibrateTimer); _vibrateTimer = null }
  if ('vibrate' in navigator) navigator.vibrate(0)
}

/** Is the alarm currently ringing? */
export function isAlarmRinging() {
  return _ringing
}

/** Play the alarm once (single ring) — used for the "Test sound" button. */
export function testAlarmOnce() {
  try {
    const a = getAudioEl()
    a.loop = false
    a.currentTime = 0
    a.play().catch(() => playFallbackBeep())
    // Restore loop mode after the test clip for future real alarms.
    a.onended = () => { a.loop = true; a.onended = null }
  } catch {
    playFallbackBeep()
  }
}
