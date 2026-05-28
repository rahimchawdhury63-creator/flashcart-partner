/**
 * =============================================================================
 * FLASHCART PARTNER — Pending Approval Page
 * =============================================================================
 *
 * Purpose: Shown to partners whose accounts are awaiting admin approval.
 * Friendly message with expected timeline and contact info.
 *
 * Developer: Rizwan Rahim Chowdhury
 * =============================================================================
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/auth/useAuth';
import { useTranslation } from '@/i18n/useTranslation';
import MetaTags from '@/seo/MetaTags';
import {
  ClockIcon,
  MailIcon,
  LogoutIcon,
  FlashCartLogoIcon
} from '@/components/icons';
import '@/pages/auth/ForgotPassword.css';

const PendingApproval = () => {
  const { currentUser, signOut } = useAuth();
  const t = useTranslation();

  return (
    <>
      <MetaTags
        title="Pending Approval"
        description="Your partner account is being reviewed"
        noindex={true}
      />

      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <FlashCartLogoIcon size={56} color="var(--color-primary)" />
            </Link>
            <div className="auth-success-icon" style={{ animation: 'pulse 2s infinite' }}>
              <ClockIcon size={64} color="var(--color-warning)" />
            </div>
            <h1 className="auth-title">Account Pending Approval</h1>
            <p className="auth-subtitle">
              Thank you for registering as a FlashCart partner. Our team is reviewing your account.
              You'll receive an email once approved (usually within 24 hours).
            </p>
          </div>

          <div className="auth-success-actions">
            <a
              href="mailto:support@flashcart.bsdc.info.bd"
              className="btn btn-outline btn-block"
            >
              <MailIcon size={18} />
              Contact Support
            </a>
            <button
              type="button"
              className="btn btn-ghost btn-block"
              onClick={signOut}
            >
              <LogoutIcon size={18} />
              Sign Out
            </button>
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

export default PendingApproval;
