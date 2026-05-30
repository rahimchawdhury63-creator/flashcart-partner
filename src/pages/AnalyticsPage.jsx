// AnalyticsPage.jsx — SEO score, Google preview, keyword suggestions + sales analytics.
import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import SEOHead from '../components/common/SEOHead'
import LoadingSpinner from '../components/common/LoadingSpinner'
import SEOScore from '../components/seo/SEOScore'
import SERPPreview from '../components/seo/SERPPreview'
import KeywordSuggestions from '../components/seo/KeywordSuggestions'
import SalesChart from '../components/dashboard/SalesChart'
import { usePartnerStore } from '../hooks/usePartnerStore'
import { useOrders } from '../hooks/useOrders'
import { useLanguage } from '../hooks/useLanguage'
import { computeSeoScore, serpPreview, salesSeries } from '../utils/analytics'
import { categoryName } from '../data/categories'

export default function AnalyticsPage() {
  const { store, items, loading } = usePartnerStore()
  const { orders } = useOrders()
  const { t, pick, lang } = useLanguage()

  const seo = useMemo(() => computeSeoScore(store, items), [store, items])
  const preview = useMemo(
    () => (store ? serpPreview(store, pick, categoryName(store.category, lang)) : null),
    [store, pick, lang]
  )
  const chart = useMemo(() => salesSeries(orders, 7), [orders])

  if (loading) return <LoadingSpinner large />
  if (!store) return <div className="partner-main empty-state"><Link to="/guide" className="btn btn-primary">Setup store first</Link></div>

  return (
    <div className="partner-main">
      <SEOHead title={t('analytics')} description="SEO and sales analytics." />
      <h2 style={{ marginTop: 0 }}>{t('analytics')}</h2>
      <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 'var(--sp-2)' }}>
        <SEOScore score={seo.score} tips={seo.tips} />
        {preview && <SERPPreview preview={preview} />}
        <KeywordSuggestions store={store} />
        <SalesChart data={chart} />
      </div>
    </div>
  )
}
