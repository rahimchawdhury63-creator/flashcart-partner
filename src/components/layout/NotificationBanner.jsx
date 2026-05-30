// NotificationBanner.jsx — Sticky, impossible-to-miss new-order alert.
// While orders are unseen it shows a pulsing banner with the ringing indicator,
// a "Stop sound" button (silences audio but keeps the badge), and a "View" button
// (opens the order and fully acknowledges). The continuous alarm is driven by
// OrderContext; this is the visual half of the alert.

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrders } from '../../hooks/useOrders'
import { useLanguage } from '../../hooks/useLanguage'
import { IconBell, IconChevronRight, IconClose } from '../svgs'

export default function NotificationBanner() {
  const { newCount, latestNew, acknowledgeAll, silenceAlarm } = useOrders()
  const { t } = useLanguage()
  const navigate = useNavigate()

  if (newCount <= 0 || !latestNew) return null

  // View the newest order: navigate + acknowledge all (stops alarm + clears badges).
  const onView = () => {
    navigate(`/orders/${latestNew.id}`)
    acknowledgeAll()
  }

  return (
    <div className="order-banner animate-fade-in" role="alert" aria-live="assertive">
      <span className="flex items-center gap-2" style={{ minWidth: 0 }}>
        <span className="pulse-dot" />
        <IconBell size={20} />
        <span className="truncate">
          <strong>{newCount} {t('newOrders')}</strong>
          {' — '}{latestNew.customerName} · ৳{latestNew.total}
        </span>
      </span>
      <span className="flex items-center gap-1" style={{ flexShrink: 0 }}>
        {/* Silence the ringtone without dismissing the order badge. */}
        <button
          className="btn btn-sm"
          onClick={silenceAlarm}
          style={{ background: 'rgba(0,0,0,0.12)', color: '#1a1a1a' }}
          aria-label="Stop sound"
        >
          <IconClose size={14} /> {t('stopSound')}
        </button>
        <button className="btn btn-primary btn-sm" onClick={onView}>
          {t('viewOrder')} <IconChevronRight size={16} />
        </button>
      </span>
    </div>
  )
}
