// SignupPage.jsx — Partner registration screen.
import React from 'react'
import SEOHead from '../components/common/SEOHead'
import PartnerSignup from '../components/auth/PartnerSignup'
import { useLanguage } from '../hooks/useLanguage'
import { LogoMark } from '../components/svgs'

export default function SignupPage() {
  const { t } = useLanguage()
  return (
    <main className="page">
      <SEOHead title={t('signup')} description="Become a FlashCart partner." />
      <div className="auth-wrap">
        <div className="text-center mb-2">
          <span className="text-primary"><LogoMark size={40} /></span>
          <h1>{t('welcome')}</h1>
          <p className="text-secondary">{t('signup')}</p>
        </div>
        <div className="auth-card"><PartnerSignup /></div>
      </div>
    </main>
  )
}
