// SetupWizard.jsx — Step-by-step store onboarding for new partners.
// Steps: 1) Basics  2) Category & contact  3) Location  4) Logo/banner & finish.

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../hooks/useLanguage'
import ImageUpload from '../common/ImageUpload'
import LocationPicker from '../settings/LocationPicker'
import { createStore } from '../../utils/partnerService'
import { CATEGORIES } from '../../data/categories'
import toast from 'react-hot-toast'

export default function SetupWizard() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState({
    nameEn: '', nameBn: '', descEn: '', descBn: '',
    category: 'restaurant', phone: '', whatsapp: '',
    district: '', upazila: '', lat: null, lng: null,
    logo: '', banner: '',
  })

  const set = (patch) => setData((d) => ({ ...d, ...patch }))
  const TOTAL = 4

  // Validate the current step before allowing "Next".
  const canProceed = () => {
    if (step === 0) return data.nameEn || data.nameBn
    if (step === 1) return data.phone
    return true
  }

  // Finish: create the store document and go to the dashboard.
  const finish = async () => {
    setSaving(true)
    try {
      await createStore(user.uid, {
        name: { en: data.nameEn, bn: data.nameBn },
        description: { en: data.descEn, bn: data.descBn },
        category: data.category,
        phone: data.phone, whatsapp: data.whatsapp,
        district: data.district, upazila: data.upazila,
        lat: data.lat, lng: data.lng,
        logo: data.logo, banner: data.banner,
        address: { en: `${data.upazila}, ${data.district}`, bn: `${data.upazila}, ${data.district}` },
        seoKeywords: [data.category, data.upazila, data.district].filter(Boolean),
      })
      toast.success('Store created! Welcome to FlashCart.')
      navigate('/dashboard')
    } catch { toast.error('Could not create store') } finally { setSaving(false) }
  }

  return (
    <div className="card card-body">
      {/* Progress bar */}
      <div className="wizard-steps">
        {Array.from({ length: TOTAL }).map((_, i) => (
          <div key={i} className={`step ${i <= step ? 'active' : ''}`} />
        ))}
      </div>

      {step === 0 && (
        <div>
          <h3 style={{ marginTop: 0 }}>Store Basics</h3>
          <div className="form-group"><label className="form-label">{t('storeName')} (English)</label>
            <input className="form-input" value={data.nameEn} onChange={(e) => set({ nameEn: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">{t('storeName')} (বাংলা)</label>
            <input className="form-input" value={data.nameBn} onChange={(e) => set({ nameBn: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">{t('description')} (English)</label>
            <textarea className="form-textarea" value={data.descEn} onChange={(e) => set({ descEn: e.target.value })} /></div>
          <p className="form-hint">SEO tip: describe what you sell and your area for better Google ranking.</p>
        </div>
      )}

      {step === 1 && (
        <div>
          <h3 style={{ marginTop: 0 }}>Category & Contact</h3>
          <div className="form-group"><label className="form-label">{t('category')}</label>
            <select className="form-select" value={data.category} onChange={(e) => set({ category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.en}</option>)}
            </select></div>
          <div className="form-group"><label className="form-label">{t('phone')}</label>
            <input className="form-input" value={data.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="01XXXXXXXXX" /></div>
          <div className="form-group"><label className="form-label">{t('whatsapp')}</label>
            <input className="form-input" value={data.whatsapp} onChange={(e) => set({ whatsapp: e.target.value })} /></div>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-2)' }}>
            <div className="form-group"><label className="form-label">District</label>
              <input className="form-input" value={data.district} onChange={(e) => set({ district: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Upazila/Area</label>
              <input className="form-input" value={data.upazila} onChange={(e) => set({ upazila: e.target.value })} /></div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 style={{ marginTop: 0 }}>Store Location</h3>
          <LocationPicker lat={data.lat} lng={data.lng} onChange={({ lat, lng }) => set({ lat, lng })} />
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 style={{ marginTop: 0 }}>Logo & Banner</h3>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-2)' }}>
            <ImageUpload value={data.logo} onUploaded={(u) => set({ logo: u })} label="Logo" />
            <ImageUpload value={data.banner} onUploaded={(u) => set({ banner: u })} label="Banner" />
          </div>
          <p className="form-hint mt-2">You can change everything later in Settings.</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-3">
        <button className="btn btn-ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          {t('back')}
        </button>
        {step < TOTAL - 1 ? (
          <button className="btn btn-primary" onClick={() => canProceed() ? setStep((s) => s + 1) : toast.error('Please fill the required fields.')}>
            {t('next')}
          </button>
        ) : (
          <button className="btn btn-accent" onClick={finish} disabled={saving}>
            {saving ? <span className="spinner" /> : t('finish')}
          </button>
        )}
      </div>
    </div>
  )
}
