// CertificatesPage.jsx — Milestone certificates + business programs/badges.
import React from 'react'
import { Link } from 'react-router-dom'
import SEOHead from '../components/common/SEOHead'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { usePartnerStore } from '../hooks/usePartnerStore'
import { useLanguage } from '../hooks/useLanguage'
import { getMilestones, generateCertificate, downloadCertificate } from '../utils/certificate'
import { IconStar, IconShield } from '../components/svgs'

export default function CertificatesPage() {
  const { store, loading } = usePartnerStore()
  const { t, pick } = useLanguage()

  if (loading) return <LoadingSpinner large />
  if (!store) return <div className="partner-main empty-state"><Link to="/guide" className="btn btn-primary">Setup store first</Link></div>

  const milestones = getMilestones(store.totalOrders || 0)

  // Generate + download a milestone certificate image.
  const download = (m) => {
    const dataUrl = generateCertificate({
      storeName: pick(store.name) || 'Your Store',
      title: `${m.title} Achievement`,
      subtitle: m.subtitle,
    })
    downloadCertificate(dataUrl, `flashcart-${m.id}.png`)
  }

  return (
    <div className="partner-main">
      <SEOHead title={t('certificates')} description="Your achievements." />
      <h2 style={{ marginTop: 0 }}>{t('certificates')}</h2>

      {/* Badges */}
      <div className="card card-body mb-2">
        <h3 style={{ marginTop: 0 }}>Business Badges</h3>
        <div className="flex gap-1 flex-wrap">
          {store.isVerified && <span className="badge badge-primary"><IconShield size={12} /> Verified</span>}
          {store.averageRating >= 4.5 && <span className="badge badge-accent"><IconStar size={12} /> Top Rated</span>}
          {(store.totalOrders || 0) >= 100 && <span className="badge badge-success">Excellence</span>}
          {(!store.isVerified && store.averageRating < 4.5) && <span className="text-light">Earn badges by growing your store.</span>}
        </div>
      </div>

      {/* Milestone certificates */}
      <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 'var(--sp-2)' }}>
        {milestones.map((m) => (
          <div key={m.id} className="card card-body">
            <div className="flex justify-between items-center">
              <div>
                <h3 style={{ margin: 0 }}>{m.title}</h3>
                <p className="text-light" style={{ margin: 0, fontSize: '0.85rem' }}>{m.subtitle}</p>
              </div>
              {m.earned ? (
                <button className="btn btn-accent btn-sm" onClick={() => download(m)}>Download</button>
              ) : (
                <span className="badge badge-muted">{store.totalOrders || 0}/{m.threshold}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
