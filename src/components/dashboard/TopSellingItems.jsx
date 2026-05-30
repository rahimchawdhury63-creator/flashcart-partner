// TopSellingItems.jsx — Bar list of best-selling items.
import React from 'react'
import { useLanguage } from '../../hooks/useLanguage'

export default function TopSellingItems({ items }) {
  const { t } = useLanguage()
  const max = Math.max(1, ...items.map((i) => i.qty))
  return (
    <div className="card card-body">
      <h3 style={{ marginTop: 0 }}>{t('topItems')}</h3>
      {!items.length && <p className="text-light">{t('noResults')}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((it) => (
          <div key={it.name}>
            <div className="flex justify-between" style={{ fontSize: '0.85rem' }}>
              <span className="truncate">{it.name}</span><strong>{it.qty}</strong>
            </div>
            <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 3, marginTop: 3 }}>
              <div style={{ width: `${(it.qty / max) * 100}%`, height: '100%', background: 'var(--color-primary)', borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
