// RecentOrders.jsx — Compact list of the latest orders on the dashboard.
import React from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'

const STATUS_BADGE = {
  placed: 'badge-accent', confirmed: 'badge-primary', preparing: 'badge-primary',
  out_for_delivery: 'badge-primary', delivered: 'badge-success', cancelled: 'badge-error',
}

export default function RecentOrders({ orders }) {
  const { t } = useLanguage()
  return (
    <div className="card card-body">
      <div className="flex justify-between items-center">
        <h3 style={{ margin: 0 }}>{t('recentOrders')}</h3>
        <Link to="/orders" className="btn btn-ghost btn-sm">{t('orders')}</Link>
      </div>
      {!orders.length && <p className="text-light mt-2">{t('noResults')}</p>}
      <div className="mt-2" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {orders.slice(0, 6).map((o) => (
          <Link key={o.id} to={`/orders/${o.id}`} className="flex justify-between items-center"
            style={{ color: 'inherit', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
            <div>
              <strong>{o.orderId}</strong>
              <p className="text-light" style={{ margin: 0, fontSize: '0.78rem' }}>{o.customerName} · ৳{o.total}</p>
            </div>
            <span className={`badge ${STATUS_BADGE[o.status] || 'badge-muted'}`}>{o.status}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
