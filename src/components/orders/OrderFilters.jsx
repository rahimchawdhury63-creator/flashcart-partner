// OrderFilters.jsx — Status filter pills + search box for orders.
import React from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import { IconSearch } from '../svgs'

const STATUSES = ['all', 'placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']

export default function OrderFilters({ filter, setFilter, search, setSearch }) {
  const { t } = useLanguage()
  return (
    <div className="mb-2">
      <div className="input-icon mb-2">
        <IconSearch size={18} />
        <input className="form-input" placeholder="Search by order ID or customer..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="flex gap-1 flex-wrap" style={{ overflowX: 'auto' }}>
        {STATUSES.map((s) => (
          <button key={s} className={`pill ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {s === 'all' ? t('filterAll') : s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>
    </div>
  )
}
