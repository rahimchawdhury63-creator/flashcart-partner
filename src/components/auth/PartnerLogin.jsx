// PartnerLogin.jsx — Email/password + Google login for partners.
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../hooks/useLanguage'
import { IconGoogle } from '../svgs'
import toast from 'react-hot-toast'

export default function PartnerLogin() {
  const { loginWithEmail, loginWithGoogle } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await loginWithEmail(email, password)
      navigate('/dashboard')
    } catch {
      setError('Invalid email or password.')
    } finally { setLoading(false) }
  }

  const onGoogle = async () => {
    try { await loginWithGoogle(); navigate('/dashboard') }
    catch { toast.error('Google sign-in failed') }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="form-group">
        <label className="form-label">{t('email')}</label>
        <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="form-group">
        <label className="form-label">{t('password')}</label>
        <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      {error && <p className="form-error">{error}</p>}
      <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
        {loading ? <span className="spinner" /> : t('login')}
      </button>
      <div className="divider-text">or</div>
      <button type="button" className="btn btn-outline btn-block" onClick={onGoogle}>
        <IconGoogle size={20} /> Continue with Google
      </button>
      <p className="text-center mt-2 text-secondary">
        Don't have an account? <Link to="/signup">{t('signup')}</Link>
      </p>
    </form>
  )
}
