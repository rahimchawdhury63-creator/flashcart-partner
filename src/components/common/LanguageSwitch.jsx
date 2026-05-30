// LanguageSwitch.jsx — Toggle between the three language modes (partner portal).
import React from 'react'
import { useLanguage } from '../../hooks/useLanguage'

export default function LanguageSwitch() {
  const { lang, changeLang } = useLanguage()
  const options = [
    { id: 'default', label: 'মিক্স' },
    { id: 'bn', label: 'বাং' },
    { id: 'en', label: 'EN' },
  ]
  return (
    <div className="lang-switch" role="group" aria-label="Language selector"
      style={{ background: 'var(--color-bg)' }}>
      {options.map((o) => (
        <button
          key={o.id}
          className={lang === o.id ? 'active' : ''}
          onClick={() => changeLang(o.id)}
          aria-pressed={lang === o.id}
          style={{ color: lang === o.id ? '#1a1a1a' : 'var(--color-text-secondary)' }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
