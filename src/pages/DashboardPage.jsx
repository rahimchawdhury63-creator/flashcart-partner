// DashboardPage.jsx — Partner home: KPIs, sales chart, top items, recent orders.

import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import SEOHead from '../components/common/SEOHead'
import LoadingSpinner from '../components/common/LoadingSpinner'
import StatsCards from '../components/dashboard/StatsCards'
import SalesChart from '../components/dashboard/SalesChart'
import RecentOrders from '../components/dashboard/RecentOrders'
import QuickActions from '../components/dashboard/QuickActions'
import TopSellingItems from '../components/dashboard/TopSellingItems'
import { useOrders } from '../hooks/useOrders'
import { usePartnerStore } from '../hooks/usePartnerStore'
import { useLanguage } from '../hooks/useLanguage'
import { salesSeries, topSellingItems } from '../utils/analytics'

export default function DashboardPage() {
  const { orders, loading: ordersLoading } = useOrders()
  const { store, loading: storeLoading } = usePartnerStore()
  const { t, pick } = useLanguage()

  // Derive dashboard metrics from the order list.
  const metrics = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    const todayRevenue = orders
      .filter((o) => {
        const ts = o.createdAt?.seconds ? o.createdAt.seconds * 1000 : o.createdAt
        return ts && new Date(ts).toISOString().slice(0, 10) === today && o.status !== 'cancelled'
      })
      .reduce((sum, o) => sum + (o.total || 0), 0)
    return {
      todayRevenue,
      totalOrders: store?.totalOrders ?? orders.length,
      avgRating: store?.averageRating ?? 0,
      profileScore: store?.profileCompleteness ?? 0,
    }
  }, [orders, store])

  const chartData = useMemo(() => salesSeries(orders, 7), [orders])
  const topItems = useMemo(() => topSellingItems(orders, 5), [orders])

  if (storeLoading || ordersLoading) return <LoadingSpinner large label={t('loading')} />

  // No store yet → guide them to onboarding.
  if (!store) {
    return (
      <div className="partner-main">
        <SEOHead title={t('dashboard')} description="FlashCart partner dashboard." />
        <div className="empty-state">
          <h2>{t('welcome')}</h2>
          <p className="text-secondary">You haven't set up your store yet.</p>
          <Link to="/guide" className="btn btn-primary">Start Setup</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="partner-main">
      <SEOHead title={t('dashboard')} description="FlashCart partner dashboard." />
      <h2 style={{ marginTop: 0 }}>{pick(store.name)}</h2>

      <StatsCards
        todayRevenue={metrics.todayRevenue}
        totalOrders={metrics.totalOrders}
        avgRating={metrics.avgRating}
        profileScore={metrics.profileScore}
      />

      <div className="grid mt-2" style={{ gridTemplateColumns: '1fr', gap: 'var(--sp-2)' }}>
        <SalesChart data={chartData} />
        <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 'var(--sp-2)' }}>
          <QuickActions />
          <TopSellingItems items={topItems} />
        </div>
        <RecentOrders orders={orders} />
      </div>
    </div>
  )
}
