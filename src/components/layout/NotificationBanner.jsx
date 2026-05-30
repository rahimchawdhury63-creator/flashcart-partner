// NotificationBanner.jsx — Sticky banner that appears when there are unseen new orders.
// Cannot be dismissed without viewing — clicking opens the order, which acknowledges it.

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrders } from '../../hooks/useOrders'
import { useLanguage } from '../../hooks/useLanguage'
import { IconBell, IconChevronRight } from '../svgs'

export default function NotificationBanner() {
  const { newCount, latestNew, acknowledgeAll } = useOrders()
  const { t } = useLanguage()
  const navigate = useNavigate()

  if (newCount <= 0 || !latestNew) return null

  // View the newest order: navigate + acknowledge all to clear the badges.
  const onView = () => {
    navigate(`/orders/${latestNew.id}`)
    acknowledgeAll()
  }

  return (
    <div className="order-banner animate-fade-in" role="alert">
      <span className="flex items-center gap-2">
        <span className="pulse-dot" />
        <IconBell size={18} />
        {newCount} {t('newOrders')} — {latestNew.customerName} · ৳{latestNew.total}
      </span>
      <button className="btn btn-primary btn-sm" onClick={onView}>
        View <IconChevronRight size={16} />
      </button>
    </div>
  )
}
