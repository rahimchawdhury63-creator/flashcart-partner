// SEOScore.jsx — Visual SEO score ring with improvement tips.
import React from 'react'

export default function SEOScore({ score, tips }) {
  return (
    <div className="card card-body">
      <h3 style={{ marginTop: 0 }}>SEO Score</h3>
      <div className="seo-score">
        <div className="ring" style={{ '--p': score }}>
          <span>{score}</span>
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 600 }}>
            {score >= 80 ? 'Excellent!' : score >= 50 ? 'Good — keep going' : 'Needs improvement'}
          </p>
          <p className="text-light" style={{ margin: 0, fontSize: '0.82rem' }}>Higher score = better Google ranking</p>
        </div>
      </div>
      {tips?.length > 0 && (
        <ul className="mt-2" style={{ paddingLeft: 18, color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>
          {tips.map((tip, i) => <li key={i} style={{ marginBottom: 4 }}>{tip}</li>)}
        </ul>
      )}
    </div>
  )
}
