// QuickActions.jsx — Shortcut buttons to common partner tasks.
import React from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import { IconPlus, IconList, IconMapPin, IconShield } from '../svgs'

export default function QuickActions() {
  const { t } = useLanguage()
  const actions = [
    { to: '/menu/add-item', icon: IconPlus, label: t('addItem') },
    { to: '/menu', icon: IconList, label: t('menu') },
    { to: '/settings', icon: IconMapPin, label: t('settings') },
    { to: '/analytics', icon: IconShield, label: t('analytics') },
  ]
  return (
    <div className="card card-body">
      <h3 style={{ marginTop: 0 }}>{t('quickActions')}</h3>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {actions.map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to} className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
            <Icon size={18} /> {label}
          </Link>
        ))}
      </div>
    </div>
  )
}
