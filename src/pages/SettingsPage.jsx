// SettingsPage.jsx — Store settings: info, location, hours, delivery, status toggles.

import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEOHead from '../components/common/SEOHead'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ImageUpload from '../components/common/ImageUpload'
import LocationPicker from '../components/settings/LocationPicker'
import HoursSchedule from '../components/settings/HoursSchedule'
import { usePartnerStore } from '../hooks/usePartnerStore'
import { useLanguage } from '../hooks/useLanguage'
import { updateStore } from '../utils/partnerService'
import { CATEGORIES } from '../data/categories'
import toast from 'react-hot-toast'

const DEFAULT_HOURS = {
  monday: { open: '09:00', close: '22:00', isOpen: true },
  tuesday: { open: '09:00', close: '22:00', isOpen: true },
  wednesday: { open: '09:00', close: '22:00', isOpen: true },
  thursday: { open: '09:00', close: '22:00', isOpen: true },
  friday: { open: '09:00', close: '22:00', isOpen: true },
  saturday: { open: '09:00', close: '22:00', isOpen: true },
  sunday: { open: '09:00', close: '22:00', isOpen: true },
}

export default function SettingsPage() {
  const { store, loading, reload } = usePartnerStore()
  const { t } = useLanguage()
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  // Initialize the editable form from the loaded store.
  useEffect(() => {
    if (store) {
      setForm({
        nameEn: store.name?.en || '', nameBn: store.name?.bn || '',
        descEn: store.description?.en || '', descBn: store.description?.bn || '',
        category: store.category || 'restaurant',
        addressEn: store.address?.en || '', addressBn: store.address?.bn || '',
        district: store.district || '', upazila: store.upazila || '',
        phone: store.phone || '', whatsapp: store.whatsapp || '',
        logo: store.logo || '', banner: store.banner || '',
        lat: store.lat, lng: store.lng,
        deliveryRadius: store.deliveryRadius || 10,
        deliveryFee: store.deliveryFee || 0,
        allBangladeshDelivery: !!store.allBangladeshDelivery,
        isOpen: store.isOpen !== false,
        isAcceptingOrders: store.isAcceptingOrders !== false,
        hours: store.hours || DEFAULT_HOURS,
      })
    }
  }, [store])

  if (loading || !form) return <LoadingSpinner large />
  if (!store) return <div className="partner-main empty-state"><Link to="/guide" className="btn btn-primary">Setup store first</Link></div>

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  // Save all settings back to Firestore.
  const onSave = async () => {
    setSaving(true)
    try {
      await updateStore(store.id, {
        name: { en: form.nameEn, bn: form.nameBn },
        description: { en: form.descEn, bn: form.descBn },
        category: form.category,
        address: { en: form.addressEn, bn: form.addressBn },
        district: form.district, upazila: form.upazila,
        phone: form.phone, whatsapp: form.whatsapp,
        logo: form.logo, banner: form.banner,
        lat: form.lat, lng: form.lng,
        deliveryRadius: Number(form.deliveryRadius),
        deliveryFee: Number(form.deliveryFee),
        allBangladeshDelivery: form.allBangladeshDelivery,
        isOpen: form.isOpen,
        isAcceptingOrders: form.isAcceptingOrders,
        hours: form.hours,
      })
      toast.success(t('saved'))
      reload()
    } catch { toast.error('Could not save') } finally { setSaving(false) }
  }

  return (
    <div className="partner-main">
      <SEOHead title={t('settings')} description="Store settings." />
      <h2 style={{ marginTop: 0 }}>{t('settings')}</h2>

      {/* Status toggles */}
      <div className="card card-body mb-2">
        <div className="flex justify-between items-center mb-1">
          <span>{t('storeOpen')}</span>
          <label className="switch"><input type="checkbox" checked={form.isOpen} onChange={(e) => set({ isOpen: e.target.checked })} /><span className="slider" /></label>
        </div>
        <div className="flex justify-between items-center">
          <span>{t('acceptingOrders')}</span>
          <label className="switch"><input type="checkbox" checked={form.isAcceptingOrders} onChange={(e) => set({ isAcceptingOrders: e.target.checked })} /><span className="slider" /></label>
        </div>
      </div>

      {/* Store info */}
      <div className="card card-body mb-2">
        <h3 style={{ marginTop: 0 }}>{t('storeInfo')}</h3>
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-2)' }}>
          <ImageUpload value={form.logo} onUploaded={(u) => set({ logo: u })} label="Logo" />
          <ImageUpload value={form.banner} onUploaded={(u) => set({ banner: u })} label="Banner" />
        </div>
        <div className="grid mt-2" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-2)' }}>
          <div className="form-group"><label className="form-label">{t('storeName')} (EN)</label><input className="form-input" value={form.nameEn} onChange={(e) => set({ nameEn: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">{t('storeName')} (বাংলা)</label><input className="form-input" value={form.nameBn} onChange={(e) => set({ nameBn: e.target.value })} /></div>
        </div>
        <div className="form-group"><label className="form-label">{t('category')}</label>
          <select className="form-select" value={form.category} onChange={(e) => set({ category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.en}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">{t('description')} (EN)</label><textarea className="form-textarea" value={form.descEn} onChange={(e) => set({ descEn: e.target.value })} /></div>
        <div className="form-group"><label className="form-label">{t('description')} (বাংলা)</label><textarea className="form-textarea" value={form.descBn} onChange={(e) => set({ descBn: e.target.value })} /></div>
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-2)' }}>
          <div className="form-group"><label className="form-label">{t('phone')}</label><input className="form-input" value={form.phone} onChange={(e) => set({ phone: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">{t('whatsapp')}</label><input className="form-input" value={form.whatsapp} onChange={(e) => set({ whatsapp: e.target.value })} /></div>
        </div>
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-2)' }}>
          <div className="form-group"><label className="form-label">District</label><input className="form-input" value={form.district} onChange={(e) => set({ district: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Upazila/Area</label><input className="form-input" value={form.upazila} onChange={(e) => set({ upazila: e.target.value })} /></div>
        </div>
      </div>

      {/* Location */}
      <div className="card card-body mb-2">
        <h3 style={{ marginTop: 0 }}>{t('location')}</h3>
        <LocationPicker lat={form.lat} lng={form.lng} onChange={({ lat, lng }) => set({ lat, lng })} />
      </div>

      {/* Delivery */}
      <div className="card card-body mb-2">
        <h3 style={{ marginTop: 0 }}>{t('delivery')}</h3>
        <div className="flex justify-between items-center mb-2">
          <span>{t('allBangladesh')}</span>
          <label className="switch"><input type="checkbox" checked={form.allBangladeshDelivery} onChange={(e) => set({ allBangladeshDelivery: e.target.checked })} /><span className="slider" /></label>
        </div>
        {!form.allBangladeshDelivery && (
          <div className="form-group"><label className="form-label">{t('deliveryRadius')}</label>
            <input className="form-input" type="number" value={form.deliveryRadius} onChange={(e) => set({ deliveryRadius: e.target.value })} /></div>
        )}
        <div className="form-group"><label className="form-label">Delivery Fee (৳)</label>
          <input className="form-input" type="number" value={form.deliveryFee} onChange={(e) => set({ deliveryFee: e.target.value })} /></div>
      </div>

      {/* Hours */}
      <div className="card card-body mb-2">
        <h3 style={{ marginTop: 0 }}>{t('hours')}</h3>
        <HoursSchedule hours={form.hours} onChange={(h) => set({ hours: h })} />
      </div>

      <button className="btn btn-primary btn-block" onClick={onSave} disabled={saving}>
        {saving ? <span className="spinner" /> : t('save')}
      </button>
    </div>
  )
}
