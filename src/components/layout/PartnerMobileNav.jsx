// PartnerMobileNav.jsx — Bottom navigation for partner portal on mobile.
import React from 'react'
import { NavLink } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import { useOrders } from '../../hooks/useOrders'
import { IconGrid, IconReceipt, IconList, IconMapPin, IconUser } from '../svgs'

export default function PartnerMobileNav() {
  const { t } = useLanguage()
  const { newCount } = useOrders()
  const cls = ({ isActive }) => (isActive ? 'active' : '')
  return (
    <nav className="partner-mobilenav" aria-label="Partner mobile navigation">
      <NavLink to="/dashboard" className={cls}><IconGrid size={22} /><span>{t('dashboard')}</span></NavLink>
      <NavLink to="/orders" className={cls} style={{ position: 'relative' }}>
        <span style={{ position: 'relative' }}>
          <IconReceipt size={22} />
          {newCount > 0 && <span className="cart-count">{newCount}</span>}
        </span>
        <span>{t('orders')}</span>
      </NavLink>
      <NavLink to="/menu" className={cls}><IconList size={22} /><span>{t('menu')}</span></NavLink>
      <NavLink to="/settings" className={cls}><IconMapPin size={22} /><span>{t('settings')}</span></NavLink>
      <NavLink to="/profile" className={cls}><IconUser size={22} /><span>{t('profile')}</span></NavLink>
    </nav>
  )
}
