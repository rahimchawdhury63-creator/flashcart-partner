// NotificationsPage.jsx — Notification settings + permission status + test alert.
import React from 'react'
import SEOHead from '../components/common/SEOHead'
import { useNotifications } from '../hooks/useNotifications'
import { useLanguage } from '../hooks/useLanguage'
import { playOrderAlert, showNativeNotification } from '../utils/notifications'
import { IconBell, IconCheckCircle, IconAlert } from '../components/svgs'

export default function NotificationsPage() {
  const { permission, enableNotifications } = useNotifications()
  const { t } = useLanguage()

  const granted = permission === 'granted'

  // Fire a test alert (sound + system notification).
  const test = () => {
    playOrderAlert()
    showNativeNotification('Test Notification', { body: 'This is how new-order alerts look.' })
  }

  return (
    <div className="partner-main">
      <SEOHead title={t('notifications')} description="Notification settings." />
      <h2 style={{ marginTop: 0 }}>{t('notifications')}</h2>

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

      <div className="card card-body">
        <h3 style={{ marginTop: 0 }}>How alerts work</h3>
        <ul style={{ paddingLeft: 18, color: 'var(--color-text-secondary)' }}>
          <li>OneSignal push — works when the app is closed or phone is locked.</li>
          <li>Sound alert + tab badge — when the dashboard is open.</li>
          <li>System notification — clicking opens the order.</li>
          <li>Sticky banner — stays until you view new orders.</li>
        </ul>
        <button className="btn btn-outline btn-sm" onClick={test}>Test Alert</button>
      </div>
    </div>
  )
}
