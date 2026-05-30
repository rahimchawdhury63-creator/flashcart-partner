// PermissionPrompt.jsx — Persistent modal that explains why notifications matter
// and asks the partner to enable them. Driven by NotificationContext's prompt loop.

import React from 'react'
import { useNotifications } from '../../hooks/useNotifications'
import { useLanguage } from '../../hooks/useLanguage'
import Modal from './Modal'
import { IconBell, IconAlert } from '../svgs'

export default function PermissionPrompt() {
  const { promptVisible, permission, enableNotifications, dismissPrompt } = useNotifications()
  const { t } = useLanguage()

  if (!promptVisible) return null

  const isBlocked = permission === 'denied'

  return (
    <Modal open={promptVisible} title={t('enableNotifications')} onClose={dismissPrompt}>
      <div className="text-center">
        <div className="perm-modal-icon">
          {isBlocked ? <IconAlert size={32} /> : <IconBell size={32} />}
        </div>

        {/* Explain clearly why notifications are critical for their business. */}
        <p style={{ fontWeight: 600 }}>{t('notifyImportance')}</p>
        <p className="text-secondary">
          {isBlocked ? t('notifyBlocked') : (
            'Get instant alerts for every new order — even when the app is in the background or your phone is locked. Missing an order means losing a sale.'
          )}
        </p>

        {!isBlocked ? (
          <button className="btn btn-primary btn-block mt-2" onClick={enableNotifications}>
            <IconBell size={18} /> {t('enableNotifications')}
          </button>
        ) : (
          <div className="card card-body mt-2" style={{ textAlign: 'left', background: 'var(--color-bg)' }}>
            <strong>How to allow on Android Chrome:</strong>
            <ol style={{ margin: '8px 0 0', paddingLeft: 18 }}>
              <li>Tap the lock icon near the address bar</li>
              <li>Open "Permissions" / "Site settings"</li>
              <li>Set "Notifications" to Allow</li>
              <li>Reload this page</li>
            </ol>
          </div>
        )}

        <button className="btn btn-ghost btn-sm mt-2" onClick={dismissPrompt}>
          Remind me later
        </button>
      </div>
    </Modal>
  )
}
