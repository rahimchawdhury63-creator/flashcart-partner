// PartnerHeader.jsx — Top bar inside the content area with page title + actions.
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import { useAuth } from '../../hooks/useAuth'
import LanguageSwitch from '../common/LanguageSwitch'
import { IconBell, IconLogout } from '../svgs'
import { useOrders } from '../../hooks/useOrders'

export default function PartnerHeader({ title }) {
  const { t } = useLanguage()
  const { logout } = useAuth()
  const { newCount } = useOrders()
  const navigate = useNavigate()

  const onLogout = async () => { await logout(); navigate('/login') }

  return (
    <header className="partner-topbar">
      <h1>{title}</h1>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <LanguageSwitch />
        <button className="icon-btn" onClick={() => navigate('/orders')} aria-label={t('orders')}
          style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)' }}>
          <IconBell size={22} />
          {newCount > 0 && <span className="cart-count">{newCount}</span>}
        </button>
        <button className="btn-icon btn-ghost" onClick={onLogout} aria-label={t('logout')}>
          <IconLogout size={20} />
        </button>
      </div>
    </header>
  )
}
