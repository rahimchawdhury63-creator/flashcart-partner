// KeywordSuggestions.jsx — Suggests SEO keywords based on store type & location.
import React from 'react'
import { categoryName } from '../../data/categories'

export default function KeywordSuggestions({ store }) {
  if (!store) return null
  const cat = categoryName(store.category, 'en').toLowerCase()
  const area = store.upazila || 'your area'
  // Generate keyword ideas from category + location.
  const keywords = [
    `${cat} delivery ${area}`,
    `online ${cat} ${store.district || 'Bangladesh'}`,
    `best ${cat} near me`,
    `${cat} cash on delivery`,
    `${store.upazila || ''} ${cat}`,
  ].filter(Boolean)

  return (
    <div className="card card-body">
      <h3 style={{ marginTop: 0 }}>Keyword Suggestions</h3>
      <p className="text-light" style={{ fontSize: '0.82rem' }}>Add these to your store's SEO keywords to rank higher.</p>
      <div className="flex gap-1 flex-wrap">
        {keywords.map((k) => <span key={k} className="badge badge-muted">{k}</span>)}
      </div>
    </div>
  )
}
