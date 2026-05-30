// NotificationsPage.jsx — Notification settings + permission status + alarm test.
import React, { useState } from 'react'
import SEOHead from '../components/common/SEOHead'
import { useNotifications } from '../hooks/useNotifications'
import { useLanguage } from '../hooks/useLanguage'
import { showNativeNotification } from '../utils/notifications'
import { testAlarmOnce, startAlarm, stopAlarm } from '../utils/alarm'
import { IconBell, IconCheckCircle, IconAlert, IconClose } from '../components/svgs'

export default function NotificationsPage() {
  const { permission, enableNotifications } = useNotifications()
  const { t } = useLanguage()
  const [demoRinging, setDemoRinging] = useState(false)

  const granted = permission === 'granted'

  // Play the real ringtone once (single clip) + a sample system notification.
  const testOnce = () => {
    testAlarmOnce()
    showNativeNotification('Test Notification', { body: 'This is how new-order alerts look.' })
  }

  // Demo the CONTINUOUS alarm so the partner hears exactly what a real order sounds like.
  const toggleContinuous = () => {
    if (demoRinging) { stopAlarm(); setDemoRinging(false) }
    else { startAlarm(); setDemoRinging(true) }
  }

  return (
    <div className="partner-main">
      <SEOHead title={t('notifications')} description="Notification settings." />
      <h2 style={{ marginTop: 0 }}>{t('notifications')}</h2>

      {/* Permission status */}
      <div className="card card-body mb-2">
        <div className="flex items-center gap-2">
          {granted ? <IconCheckCircle size={28} className="text-primary" /> : <IconAlert size={28} style={{ color: 'var(--color-warning)' }} />}
          <div>
            <strong>{granted ? 'Notifications enabled' : 'Notifications not enabled'}</strong>
            <p className="text-light" style={{ margin: 0, fontSize: '0.85rem' }}>{t('notifyImportance')}</p>
          </div>
        </div>
        {!granted && (
          <button className="btn btn-primary btn-block mt-2" onClick={enableNotifications}>
            <IconBell size={18} /> {t('enableNotifications')}
          </button>
        )}
      </div>

      {/* Sound test */}
      <div className="card card-body mb-2">
        <h3 style={{ marginTop: 0 }}>Order Alarm</h3>
        <p className="text-light" style={{ fontSize: '0.85rem' }}>
          When a new order arrives the alarm rings <strong>continuously</strong> until you open the order.
          Test it below. (Tap once anywhere first so the browser allows sound.)
        </p>
        <div className="flex gap-1 flex-wrap">
          <button className="btn btn-outline btn-sm" onClick={testOnce}>{t('testSound')}</button>
          <button
            className={demoRinging ? 'btn btn-sm' : 'btn btn-primary btn-sm'}
            onClick={toggleContinuous}
            style={demoRinging ? { background: 'var(--color-error)', color: '#fff' } : undefined}
          >
            {demoRinging ? <><IconClose size={14} /> {t('stopSound')}</> : 'Test Continuous Alarm'}
          </button>
        </div>
      </div>

      {/* How it works */}
      <div className="card card-body">
        <h3 style={{ marginTop: 0 }}>How alerts work</h3>
        <ul style={{ paddingLeft: 18, color: 'var(--color-text-secondary)' }}>
          <li><strong>Continuous ringtone</strong> — loops until you open the order.</li>
          <li><strong>OneSignal push</strong> — fires even when the app is closed or the phone is locked.</li>
          <li><strong>System notification</strong> — tap it to jump straight to the order.</li>
          <li><strong>Tab badge + blinking title</strong> — shows the unread order count.</li>
          <li><strong>Sticky banner</strong> — stays on screen until you view new orders.</li>
          <li><strong>Vibration</strong> — repeats on mobile while ringing.</li>
        </ul>
        <p className="text-light" style={{ fontSize: '0.82rem', marginBottom: 0 }}>
          Tip: install the app (Add to Home Screen) and keep it open in the background for the most reliable alerts.
        </p>
      </div>
    </div>
  )
}
