// OrdersPage.jsx — Live order management: filter, search, export CSV.

import React, { useMemo, useState } from 'react'
import SEOHead from '../components/common/SEOHead'
import LoadingSpinner from '../components/common/LoadingSpinner'
import OrderCard from '../components/orders/OrderCard'
import OrderFilters from '../components/orders/OrderFilters'
import { useOrders } from '../hooks/useOrders'
import { useLanguage } from '../hooks/useLanguage'
import { IconReceipt } from '../components/svgs'

export default function OrdersPage() {
  const { orders, liveOrders, loading } = useOrders()
  const { t } = useLanguage()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  // Filter + search the order list.
  const visible = useMemo(() => {
    let list = orders
    if (filter !== 'all') list = list.filter((o) => o.status === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (o) => o.orderId?.toLowerCase().includes(q) || o.customerName?.toLowerCase().includes(q)
      )
    }
    return list
  }, [orders, filter, search])

  // Export the current view to CSV (download).
  const exportCsv = () => {
    const rows = [['Order ID', 'Customer', 'Phone', 'Items', 'Total', 'Status']]
    visible.forEach((o) =>
      rows.push([o.orderId, o.customerName, o.customerPhone, o.items?.length, o.total, o.status])
    )
    const csv = rows.map((r) => r.map((c) => `"${c ?? ''}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'flashcart-orders.csv'
    a.click()
  }

  return (
    <div className="partner-main">
      <SEOHead title={t('orders')} description="Manage your FlashCart orders." />
      <div className="flex justify-between items-center mb-2">
        <h2 style={{ margin: 0 }}>{t('orders')}</h2>
        <button className="btn btn-outline btn-sm" onClick={exportCsv}>Export CSV</button>
      </div>

      <OrderFilters filter={filter} setFilter={setFilter} search={search} setSearch={setSearch} />

      {loading ? (
        <LoadingSpinner large />
      ) : visible.length ? (
        <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 'var(--sp-1)' }}>
          {visible.map((o) => (
            <OrderCard key={o.id} order={o} isNew={liveOrders?.[o.id]?.isNew} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <IconReceipt />
          <p>{t('noResults')}</p>
        </div>
      )}
    </div>
  )
}
