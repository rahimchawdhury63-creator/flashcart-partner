// GuidePage.jsx — Setup wizard for new partners; redirects to dashboard if store exists.
import React from 'react'
import { Navigate } from 'react-router-dom'
import SEOHead from '../components/common/SEOHead'
import LoadingSpinner from '../components/common/LoadingSpinner'
import SetupWizard from '../components/auth/SetupWizard'
import { usePartnerStore } from '../hooks/usePartnerStore'
import { useLanguage } from '../hooks/useLanguage'

export default function GuidePage() {
  const { store, loading } = usePartnerStore()
  const { t } = useLanguage()
  if (loading) return <LoadingSpinner large />
  // If they already have a store, skip the wizard.
  if (store) return <Navigate to="/dashboard" replace />
  return (
    <div className="partner-main">
      <SEOHead title={t('guide')} description="Set up your FlashCart store." />
      <h2 style={{ marginTop: 0 }}>{t('welcome')}</h2>
      <p className="text-secondary">Set up your store in 4 quick steps.</p>
      <SetupWizard />
    </div>
  )
}
