// SERPPreview.jsx — Google search-result preview of the store page.
import React from 'react'

export default function SERPPreview({ preview }) {
  return (
    <div className="card card-body">
      <h3 style={{ marginTop: 0 }}>Google Preview</h3>
      <div className="serp">
        <div className="serp-url">{preview.url}</div>
        <div className="serp-title">{preview.title}</div>
        <div className="serp-desc">{preview.desc}</div>
      </div>
    </div>
  )
}
