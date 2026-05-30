// ReviewsPage.jsx — View and reply to customer reviews.
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEOHead from '../components/common/SEOHead'
import LoadingSpinner from '../components/common/LoadingSpinner'
import StarRating from '../components/common/StarRating'
import { usePartnerStore } from '../hooks/usePartnerStore'
import { useLanguage } from '../hooks/useLanguage'
import { fetchReviews, replyToReview } from '../utils/partnerService'
import toast from 'react-hot-toast'

export default function ReviewsPage() {
  const { store, loading } = usePartnerStore()
  const { t } = useLanguage()
  const [reviews, setReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [replies, setReplies] = useState({})

  useEffect(() => {
    if (!store) { setLoadingReviews(false); return }
    fetchReviews(store.id).then((r) => { setReviews(r); setLoadingReviews(false) })
  }, [store])

  if (loading || loadingReviews) return <LoadingSpinner large />
  if (!store) return <div className="partner-main empty-state"><Link to="/guide" className="btn btn-primary">Setup store first</Link></div>

  // Submit a reply to a review.
  const submitReply = async (id) => {
    const reply = replies[id]
    if (!reply?.trim()) return
    await replyToReview(id, reply)
    toast.success('Reply posted')
    setReviews((rs) => rs.map((r) => (r.id === id ? { ...r, partnerReply: reply } : r)))
  }

  return (
    <div className="partner-main">
      <SEOHead title={t('reviews')} description="Customer reviews." />
      <h2 style={{ marginTop: 0 }}>{t('reviews')}</h2>
      {!reviews.length && <p className="text-light">{t('noResults')}</p>}
      <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 'var(--sp-2)' }}>
        {reviews.map((r) => (
          <div key={r.id} className="card card-body">
            <div className="flex justify-between items-center">
              <strong>{r.customerName || 'Customer'}</strong>
              <StarRating value={r.rating} size={14} />
            </div>
            <p style={{ margin: '6px 0' }}>{r.review}</p>
            {r.partnerReply ? (
              <div style={{ background: 'var(--color-bg)', padding: 8, borderRadius: 8 }}>
                <small className="text-primary font-semibold">Your reply:</small>
                <p style={{ margin: 0 }}>{r.partnerReply}</p>
              </div>
            ) : (
              <div className="flex gap-1">
                <input className="form-input" placeholder="Write a reply..." value={replies[r.id] || ''}
                  onChange={(e) => setReplies((p) => ({ ...p, [r.id]: e.target.value }))} />
                <button className="btn btn-primary btn-sm" onClick={() => submitReply(r.id)}>Reply</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
