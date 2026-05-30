// ProfilePage.jsx — Partner account profile.
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SEOHead from '../components/common/SEOHead'
import ImageUpload from '../components/common/ImageUpload'
import LanguageSwitch from '../components/common/LanguageSwitch'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'
import { IconLogout } from '../components/svgs'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { profile, logout, updateUserProfile } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [name, setName] = useState(profile?.displayName || '')
  const [phone, setPhone] = useState(profile?.phoneNumber || '')
  const [photo, setPhoto] = useState(profile?.photoURL || '')
  const [saving, setSaving] = useState(false)

  const onSave = async () => {
    setSaving(true)
    try { await updateUserProfile({ displayName: name, phoneNumber: phone, photoURL: photo }); toast.success(t('saved')) }
    catch { toast.error('Could not save') } finally { setSaving(false) }
  }
  const onLogout = async () => { await logout(); navigate('/login') }

  return (
    <div className="partner-main">
      <SEOHead title={t('profile')} description="Partner profile." />
      <h2 style={{ marginTop: 0 }}>{t('profile')}</h2>
      <div className="card card-body" style={{ maxWidth: 480 }}>
        <ImageUpload value={photo} onUploaded={setPhoto} label="Profile Photo" />
        <div className="form-group mt-2"><label className="form-label">{t('fullName')}</label>
          <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">{t('email')}</label>
          <input className="form-input" value={profile?.email || ''} disabled /></div>
        <div className="form-group"><label className="form-label">{t('phone')}</label>
          <input className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        <div className="flex justify-between items-center mb-2">
          <span>Language</span><LanguageSwitch />
        </div>
        <button className="btn btn-primary btn-block" onClick={onSave} disabled={saving}>
          {saving ? <span className="spinner" /> : t('save')}
        </button>
      </div>
      <button className="btn btn-outline mt-2" onClick={onLogout} style={{ color: 'var(--color-error)' }}>
        <IconLogout size={18} /> {t('logout')}
      </button>
    </div>
  )
}
