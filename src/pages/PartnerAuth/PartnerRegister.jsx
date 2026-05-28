/**
 * =============================================================================
 * FLASHCART PARTNER — Partner Registration Page
 * =============================================================================
 *
 * Purpose: New partner registration with business-specific fields
 * including store type selection.
 *
 * Creates BOTH a user document and a partner document in Firestore.
 * Partner accounts start as `isApproved: false` until admin approves.
 *
 * Developer: Rizwan Rahim Chowdhury
 * =============================================================================
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/useAuth';
import { useTranslation } from '@/i18n/useTranslation';
import {
  db,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from '@/firebase';
import MetaTags from '@/seo/HelmetManager';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import PasswordStrengthMeter from '@/components/auth/PasswordStrengthMeter';
import {
  MailIcon,
  LockIcon,
  UserIcon,
  PhoneIcon,
  StoreIcon,
  EyeIcon,
  EyeOffIcon,
  FlashCartLogoIcon,
  WarningIcon,
  CheckCircleIcon
} from '@/components/icons';
import './PartnerRegister.css';

/* Store type options */
const STORE_TYPES = [
  { value: 'restaurant', label: 'Restaurant', labelBn: 'রেস্টুরেন্ট' },
  { value: 'grocery', label: 'Grocery Store', labelBn: 'মুদি দোকান' },
  { value: 'medical', label: 'Medical / Pharmacy', labelBn: 'ফার্মেসি' },
  { value: 'electronics', label: 'Electronics', labelBn: 'ইলেকট্রনিক্স' },
  { value: 'clothing', label: 'Clothing Store', labelBn: 'পোশাকের দোকান' },
  { value: 'books', label: 'Books / Library', labelBn: 'বইয়ের দোকান' },
  { value: 'mobile', label: 'Mobile Shop', labelBn: 'মোবাইল দোকান' },
  { value: 'homeKitchen', label: 'Home Kitchen', labelBn: 'হোম কিচেন' },
  { value: 'supermarket', label: 'Supermarket', labelBn: 'সুপারমার্কেট' },
  { value: 'other', label: 'Other', labelBn: 'অন্যান্য' }
];

/**
 * Generate URL-safe slug from business name
 */
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') /* Remove special chars */
    .replace(/[\s_]+/g, '-')   /* Replace spaces with hyphens */
    .replace(/^-+|-+$/g, '');  /* Trim hyphens */
};

const PartnerRegister = () => {
  const navigate = useNavigate();
  const { signInWithGoogle, registerWithEmail, currentUser } = useAuth();
  const t = useTranslation();

  /* --- Form State --- */
  const [formData, setFormData] = useState({
    displayName: '',
    businessName: '',
    businessNameBn: '',
    storeType: 'restaurant',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorKey, setErrorKey] = useState(null);

  /* If already authenticated as partner, redirect */
  useEffect(() => {
    const checkExistingPartner = async () => {
      if (currentUser) {
        const partnerRef = doc(db, 'partners', currentUser.uid);
        const snap = await getDoc(partnerRef);
        if (snap.exists()) {
          navigate('/dashboard', { replace: true });
        }
      }
    };
    checkExistingPartner();
  }, [currentUser, navigate]);

  /**
   * Update form field
   */
  const handleFieldChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setErrorKey(null);
  };

  /**
   * Create partner document after auth registration
   */
  const createPartnerDocument = async (userId, data) => {
    const slug = generateSlug(data.businessName) + '-' + userId.substring(0, 6);
    const partnerRef = doc(db, 'partners', userId);
    await setDoc(partnerRef, {
      uid: userId,
      email: data.email,
      businessName: data.businessName,
      businessNameBn: data.businessNameBn || '',
      slug: slug,
      storeType: data.storeType,
      logo: '',
      banner: '',
      phone: data.phone,
      description: '',
      descriptionBn: '',
      isApproved: false,
      isOpen: false,
      isReceivingOrders: false,
      allBangladeshDelivery: false,
      deliveryRadiusKm: 10,
      outlets: [],
      openingHours: {
        monday: { open: '09:00', close: '22:00', isOpen: true },
        tuesday: { open: '09:00', close: '22:00', isOpen: true },
        wednesday: { open: '09:00', close: '22:00', isOpen: true },
        thursday: { open: '09:00', close: '22:00', isOpen: true },
        friday: { open: '09:00', close: '22:00', isOpen: true },
        saturday: { open: '09:00', close: '22:00', isOpen: true },
        sunday: { open: '09:00', close: '22:00', isOpen: true }
      },
      specialSchedule: [],
      seoTitle: '',
      seoDescription: '',
      seoKeywords: [],
      rating: 0,
      reviewCount: 0,
      orderCount: 0,
      oneSignalPlayerId: '',
      location: { lat: null, lng: null, address: '', district: '' },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  };

  /**
   * Google sign-in (after this, partner needs to complete profile)
   */
  const handleGoogleSignIn = async () => {
    setErrorKey(null);
    if (!formData.businessName || !formData.storeType) {
      setErrorKey('Please fill in business name and type first');
      return;
    }
    setGoogleLoading(true);
    const result = await signInWithGoogle();
    if (result.success) {
      try {
        await createPartnerDocument(result.user.uid, {
          ...formData,
          email: result.user.email
        });
        navigate('/pending-approval', { replace: true });
      } catch (err) {
        setErrorKey('auth.errors.genericError');
      }
      setGoogleLoading(false);
    } else {
      setErrorKey(result.error);
      setGoogleLoading(false);
    }
  };

  /**
   * Form submission handler
   */
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorKey(null);

    const { displayName, businessName, email, phone, password, confirmPassword } = formData;

    if (!displayName || displayName.trim().length < 2) {
      setErrorKey('auth.errors.invalidName');
      return;
    }
    if (!businessName || businessName.trim().length < 2) {
      setErrorKey('Please enter your business name');
      return;
    }
    if (!email || !email.includes('@')) {
      setErrorKey('auth.errors.invalidEmail');
      return;
    }
    if (!phone || phone.length < 10) {
      setErrorKey('Please enter a valid phone number');
      return;
    }
    if (!password || password.length < 8) {
      setErrorKey('auth.errors.weakPassword');
      return;
    }
    if (password !== confirmPassword) {
      setErrorKey('auth.errors.passwordsDoNotMatch');
      return;
    }
    if (!acceptTerms) {
      setErrorKey('auth.errors.acceptTermsRequired');
      return;
    }

    setLoading(true);
    const result = await registerWithEmail(email, password, {
      displayName: displayName.trim(),
      phone: phone.trim()
    });

    if (result.success) {
      try {
        await createPartnerDocument(result.user.uid, formData);
        navigate('/pending-approval', { replace: true });
      } catch (err) {
        console.error('[PartnerRegister] Failed to create partner doc:', err);
        setErrorKey('auth.errors.genericError');
        setLoading(false);
      }
    } else {
      setErrorKey(result.error);
      setLoading(false);
    }
  };

  return (
    <>
      <MetaTags
        title="Register as Partner - FlashCart"
        description="Register your business on FlashCart for free. Reach thousands of customers across Bangladesh with Cash on Delivery."
        keywords="FlashCart partner registration, business signup Bangladesh, free shop registration"
        canonical="/register"
      />

      <div className="auth-page partner-auth-page">
        <div className="auth-container partner-register-container">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <FlashCartLogoIcon size={48} color="var(--color-primary)" />
            </Link>
            <span className="partner-badge">Partner Registration</span>
            <h1 className="auth-title">Grow Your Business with FlashCart</h1>
            <p className="auth-subtitle">
              Join Bangladesh's free delivery platform — no setup fees, no commission.
            </p>
          </div>

          {errorKey && (
            <div className="auth-error" role="alert">
              <WarningIcon size={18} />
              <span>{typeof errorKey === 'string' && errorKey.startsWith('auth.') ? t(errorKey) : errorKey}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="auth-form" noValidate>
            {/* Business Information Section */}
            <div className="form-section">
              <h3 className="form-section-title">
                <StoreIcon size={18} />
                Business Information
              </h3>

              <div className="form-group">
                <label htmlFor="reg-business-name" className="form-label">
                  Business Name (English) <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  id="reg-business-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Rahim Restaurant"
                  value={formData.businessName}
                  onChange={handleFieldChange('businessName')}
                  required
                  disabled={loading || googleLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-business-name-bn" className="form-label">
                  Business Name (Bangla)
                </label>
                <input
                  id="reg-business-name-bn"
                  type="text"
                  className="form-input"
                  placeholder="যেমন: রহিম রেস্টুরেন্ট"
                  value={formData.businessNameBn}
                  onChange={handleFieldChange('businessNameBn')}
                  disabled={loading || googleLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-store-type" className="form-label">
                  Store Type <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <select
                  id="reg-store-type"
                  className="form-input"
                  value={formData.storeType}
                  onChange={handleFieldChange('storeType')}
                  required
                  disabled={loading || googleLoading}
                >
                  {STORE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label} ({type.labelBn})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Account Information Section */}
            <div className="form-section">
              <h3 className="form-section-title">
                <UserIcon size={18} />
                Account Information
              </h3>

              <div className="form-group">
                <label htmlFor="reg-name" className="form-label">
                  Owner Full Name <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <div className="form-input-wrapper">
                  <UserIcon size={18} className="form-input-icon" />
                  <input
                    id="reg-name"
                    type="text"
                    className="form-input form-input-with-icon"
                    placeholder="Your full name"
                    value={formData.displayName}
                    onChange={handleFieldChange('displayName')}
                    required
                    disabled={loading || googleLoading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reg-email" className="form-label">
                  Email Address <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <div className="form-input-wrapper">
                  <MailIcon size={18} className="form-input-icon" />
                  <input
                    id="reg-email"
                    type="email"
                    className="form-input form-input-with-icon"
                    placeholder="business@example.com"
                    value={formData.email}
                    onChange={handleFieldChange('email')}
                    autoComplete="email"
                    required
                    disabled={loading || googleLoading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reg-phone" className="form-label">
                  Phone Number <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <div className="form-input-wrapper">
                  <PhoneIcon size={18} className="form-input-icon" />
                  <input
                    id="reg-phone"
                    type="tel"
                    className="form-input form-input-with-icon"
                    placeholder="01XXXXXXXXX"
                    value={formData.phone}
                    onChange={handleFieldChange('phone')}
                    autoComplete="tel"
                    pattern="01[3-9][0-9]{8}"
                    required
                    disabled={loading || googleLoading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reg-password" className="form-label">
                  Password <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <div className="form-input-wrapper">
                  <LockIcon size={18} className="form-input-icon" />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input form-input-with-icon"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleFieldChange('password')}
                    autoComplete="new-password"
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
                <PasswordStrengthMeter password={formData.password} />
              </div>

              <div className="form-group">
                <label htmlFor="reg-confirm-password" className="form-label">
                  Confirm Password <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <div className="form-input-wrapper">
                  <LockIcon size={18} className="form-input-icon" />
                  <input
                    id="reg-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input form-input-with-icon"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleFieldChange('confirmPassword')}
                    autoComplete="new-password"
                    required
                    disabled={loading || googleLoading}
                  />
                </div>
              </div>
            </div>

            {/* Benefits Reminder */}
            <div className="partner-benefits-card">
              <h4 className="partner-benefits-title">
                <CheckCircleIcon size={18} color="var(--color-success)" />
                What you get
              </h4>
              <ul className="partner-benefits-list">
                <li>100% free to join — no monthly fees, no commission</li>
                <li>SEO-optimized store page that ranks on Google</li>
                <li>Real-time order notifications via push, sound & more</li>
                <li>Powerful analytics dashboard</li>
                <li>Earnable business certificates</li>
              </ul>
            </div>

            {/* Terms */}
            <label className="auth-checkbox auth-terms">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                required
              />
              <span>
                I agree to FlashCart's Terms of Service and Privacy Policy.
                I confirm that I am the authorized representative of this business.
              </span>
            </label>

            <button
              type="submit"
              className={`btn btn-primary btn-block btn-lg ${loading ? 'btn-loading' : ''}`}
              disabled={loading || googleLoading || !acceptTerms}
            >
              Register My Business
            </button>
          </form>

          <div className="auth-footer">
            <span>Already have a partner account?</span>
            <Link to="/login" className="auth-link auth-link-bold">
              Sign in
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
      </div>
    </>
  );
};

export default PartnerRegister;
