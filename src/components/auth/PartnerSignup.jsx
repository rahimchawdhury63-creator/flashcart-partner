// PartnerSignup.jsx — Partner registration (creates a partner-role account).
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../hooks/useLanguage'
import { IconGoogle } from '../svgs'
import toast from 'react-hot-toast'

export default function PartnerSignup() {
  const { signupWithEmail, loginWithGoogle } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    try {
      await signupWithEmail(name, email, password)
      toast.success('Account created! Let\u2019s set up your store.')
      navigate('/guide')
    } catch (err) {
      setError(err.code === 'auth/email-already-in-use' ? 'Email already registered.' : 'Sign up failed.')
    } finally { setLoading(false) }
  }

  const onGoogle = async () => {
    try { await loginWithGoogle(); navigate('/guide') }
    catch { toast.error('Google sign-in failed') }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="form-group">
        <label className="form-label">{t('fullName')}</label>
        <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
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
        {loading ? <span className="spinner" /> : t('signup')}
      </button>
      <div className="divider-text">or</div>
      <button type="button" className="btn btn-outline btn-block" onClick={onGoogle}>
        <IconGoogle size={20} /> Continue with Google
      </button>
      <p className="text-center mt-2 text-secondary">
        Already have an account? <Link to="/login">{t('login')}</Link>
      </p>
    </form>
  )
}
