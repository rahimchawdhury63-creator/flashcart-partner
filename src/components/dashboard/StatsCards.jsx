// StatsCards.jsx — Top dashboard KPI cards.
import React from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import { IconWallet, IconReceipt, IconStar, IconShield } from '../svgs'

export default function StatsCards({ todayRevenue, totalOrders, avgRating, profileScore }) {
  const { t } = useLanguage()
  const cards = [
    { icon: IconWallet, value: `৳${todayRevenue}`, label: t('todayRevenue') },
    { icon: IconReceipt, value: totalOrders, label: t('totalOrders') },
    { icon: IconStar, value: avgRating?.toFixed(1) ?? '0.0', label: t('avgRating') },
    { icon: IconShield, value: `${profileScore}%`, label: t('profileScore') },
  ]
  return (
    <div className="stats-grid">
      {cards.map(({ icon: Icon, value, label }, i) => (
        <div key={i} className="stat-card">
          <div className="stat-icon"><Icon size={20} /></div>
          <div className="stat-value">{value}</div>
          <div className="stat-label">{label}</div>
        </div>
      ))}
    </div>
  )
}
