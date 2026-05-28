/**
 * =============================================================================
 * FLASHCART PARTNER — Partner Login Page
 * =============================================================================
 *
 * Purpose: Partner-specific login with branding emphasis on business features.
 *
 * Differences from customer login:
 * - "Partner Portal" branding
 * - SEO targets partner-related keywords
 * - Different success redirect (to /dashboard)
 *
 * Developer: Rizwan Rahim Chowdhury
 * Powered by: Bangladesh Software Development Community (BSDC)
 * =============================================================================
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth/useAuth';
import { useTranslation } from '@/i18n/useTranslation';
import MetaTags from '@/seo/HelmetManager';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  FlashCartLogoIcon,
  WarningIcon,
  AnalyticsIcon,
  BellIcon,
  StoreIcon
} from '@/components/icons';
import './PartnerLogin.css';

const PartnerLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithGoogle, signInWithEmail, currentUser } = useAuth();
  const t = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorKey, setErrorKey] = useState(null);

  const from = location.state?.from || '/dashboard';

  useEffect(() => {
    if (currentUser) {
      navigate(from, { replace: true });
    }
  }, [currentUser, navigate, from]);

  const handleGoogleSignIn = async () => {
    setErrorKey(null);
    setGoogleLoading(true);
    const result = await signInWithGoogle();
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setErrorKey(result.error);
      setGoogleLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setErrorKey(null);

    if (!email || !email.includes('@')) {
      setErrorKey('auth.errors.invalidEmail');
      return;
    }
    if (!password || password.length < 6) {
      setErrorKey('auth.errors.invalidPassword');
      return;
    }

    setLoading(true);
    const result = await signInWithEmail(email, password);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setErrorKey(result.error);
      setLoading(false);
    }
  };

  return (
    <>
      <MetaTags
        title="Partner Login - FlashCart"
        description="Sign in to your FlashCart Partner Portal to manage orders, menu, and analytics."
        keywords="FlashCart partner login, business dashboard, Bangladesh shop login"
        canonical="/login"
      />

      <div className="auth-page partner-auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <FlashCartLogoIcon size={56} color="var(--color-primary)" />
            </Link>
            <span className="partner-badge">Partner Portal</span>
            <h1 className="auth-title">Welcome Back, Partner</h1>
            <p className="auth-subtitle">Sign in to manage your business on FlashCart</p>
          </div>

          {errorKey && (
            <div className="auth-error" role="alert">
              <WarningIcon size={18} />
              <span>{t(errorKey)}</span>
            </div>
          )}

          <GoogleSignInButton
            onClick={handleGoogleSignIn}
            loading={googleLoading}
            disabled={loading}
            label="Continue with Google"
          />

          <div className="auth-divider">
            <span>{t('auth.login.orContinueWith')}</span>
          </div>

          <form onSubmit={handleEmailLogin} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="partner-email" className="form-label">Email Address</label>
              <div className="form-input-wrapper">
                <MailIcon size={18} className="form-input-icon" />
                <input
                  id="partner-email"
                  type="email"
                  className="form-input form-input-with-icon"
                  placeholder="business@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  disabled={loading || googleLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="partner-password" className="form-label">Password</label>
              <div className="form-input-wrapper">
                <LockIcon size={18} className="form-input-icon" />
                <input
                  id="partner-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input form-input-with-icon"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={loading || googleLoading}
                />
                <button
                  type="button"
                  className="form-input-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
            </div>

            <div className="auth-form-row">
              <span></span>
              <Link to="/forgot-password" className="auth-link">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-block btn-lg ${loading ? 'btn-loading' : ''}`}
              disabled={loading || googleLoading}
            >
              Sign In to Dashboard
            </button>
          </form>

          <div className="auth-footer">
            <span>Don't have a partner account?</span>
            <Link to="/register" className="auth-link auth-link-bold">
              Register your business
            </Link>
          </div>

          <div className="auth-brand-footer">
            <span>Powered by</span>
            <a
              href="https://www.bsdc.info.bd"
              target="_blank"
              rel="noopener noreferrer"
              className="auth-brand-link"
            >
              Bangladesh Software Development Community
            </a>
          </div>
        </div>

        {/* Partner-specific feature showcase */}
        <div className="auth-decoration" aria-hidden="true">
          <div className="auth-decoration-content">
            <FlashCartLogoIcon size={120} color="white" />
            <h2 className="auth-decoration-title">Grow Your Business</h2>
            <p className="auth-decoration-text">
              Join thousands of businesses across Bangladesh using FlashCart to reach more customers — for free.
            </p>
            <div className="partner-features-list">
              <div className="partner-feature-item">
                <BellIcon size={24} />
                <div>
                  <div className="partner-feature-title">Real-time Notifications</div>
                  <div className="partner-feature-text">9-layer alert system for new orders</div>
                </div>
              </div>
              <div className="partner-feature-item">
                <AnalyticsIcon size={24} />
                <div>
                  <div className="partner-feature-title">Powerful Analytics</div>
                  <div className="partner-feature-text">Track revenue and customer insights</div>
                </div>
              </div>
              <div className="partner-feature-item">
                <StoreIcon size={24} />
                <div>
                  <div className="partner-feature-title">SEO Optimized Page</div>
                  <div className="partner-feature-text">Get found on Google search</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PartnerLogin;
