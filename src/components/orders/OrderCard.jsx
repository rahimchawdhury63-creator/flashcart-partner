// OrderCard.jsx — Compact order row used in the order list.
import React from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'

const STATUS_BADGE = {
  placed: 'badge-accent', confirmed: 'badge-primary', preparing: 'badge-primary',
  out_for_delivery: 'badge-primary', delivered: 'badge-success', cancelled: 'badge-error',
}

export default function OrderCard({ order, isNew }) {
  const { t } = useLanguage()
  return (
    <Link to={`/orders/${order.id}`} className={`order-card ${isNew ? 'is-new' : ''}`}
      style={{ display: 'block', color: 'inherit' }}>
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-1">
            <strong>{order.orderId}</strong>
            {isNew && <span className="badge badge-accent">{t('newOrder')}</span>}
          </div>
          <p className="text-light" style={{ margin: '2px 0 0', fontSize: '0.8rem' }}>
            {order.customerName} · {order.items?.length} {t('items')} · ৳{order.total}
          </p>
        </div>
        <span className={`badge ${STATUS_BADGE[order.status] || 'badge-muted'}`}>{order.status}</span>
      </div>
    </Link>
  )
}
