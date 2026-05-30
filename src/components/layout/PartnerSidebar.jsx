// PartnerSidebar.jsx — Desktop side navigation for the partner portal.

import React from 'react'
import { NavLink } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import {
  LogoMark, IconGrid, IconReceipt, IconList, IconMapPin,
  IconShield, IconStar, IconUser, IconInfo, IconBell,
} from '../svgs'

export default function PartnerSidebar() {
  const { t } = useLanguage()
  const cls = ({ isActive }) => (isActive ? 'active' : '')

  // Navigation items with their icons.
  const links = [
    { to: '/dashboard', icon: IconGrid, label: t('dashboard') },
    { to: '/orders', icon: IconReceipt, label: t('orders') },
    { to: '/menu', icon: IconList, label: t('menu') },
    { to: '/settings', icon: IconMapPin, label: t('settings') },
    { to: '/analytics', icon: IconShield, label: t('analytics') },
    { to: '/certificates', icon: IconStar, label: t('certificates') },
    { to: '/reviews', icon: IconStar, label: t('reviews') },
    { to: '/notifications', icon: IconBell, label: t('notifications') },
    { to: '/guide', icon: IconInfo, label: t('guide') },
    { to: '/profile', icon: IconUser, label: t('profile') },
  ]

  return (
    <aside className="partner-sidebar">
      <div className="app-logo">
        <span className="logo-mark"><LogoMark size={24} /></span> Partner
      </div>
      <nav aria-label="Partner navigation">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={cls}>
            <Icon size={20} /> {label}
          </NavLink>
        ))}
      </nav>
      <div style={{ fontSize: '0.72rem', opacity: 0.6, marginTop: 'var(--sp-2)' }}>
        Powered by BSDC
      </div>
    </aside>
  )
}
