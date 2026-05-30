// LoginPage.jsx — Partner login screen.
import React from 'react'
import SEOHead from '../components/common/SEOHead'
import PartnerLogin from '../components/auth/PartnerLogin'
import { useLanguage } from '../hooks/useLanguage'
import { LogoMark } from '../components/svgs'

export default function LoginPage() {
  const { t } = useLanguage()
  return (
    <main className="page">
      <SEOHead title={t('login')} description="FlashCart Partner login." />
      <div className="auth-wrap">
        <div className="text-center mb-2">
          <span className="text-primary"><LogoMark size={40} /></span>
          <h1>FlashCart Partner</h1>
          <p className="text-secondary">{t('login')}</p>
        </div>
        <div className="auth-card"><PartnerLogin /></div>
      </div>
    </main>
  )
}
