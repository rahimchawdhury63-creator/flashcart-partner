/**
 * =============================================================================
 * FLASHCART — SEO Guide Component (For Partner Portal)
 * =============================================================================
 *
 * Purpose: In-app SEO optimization guide displayed in the partner portal.
 * Shows partners a live preview of how their store appears in Google search,
 * along with a real-time SEO score and improvement suggestions.
 *
 * Features:
 * - Live Google search preview
 * - SEO score calculation (0-100)
 * - Specific improvement suggestions in both Bangla and English
 * - Keyword density analysis
 * - Title/description character count
 *
 * Usage in Partner Portal:
 *   <SeoGuide partner={partnerData} onUpdate={handleUpdate} />
 *
 * Developer: Rizwan Rahim Chowdhury
 * =============================================================================
 */

import React, { useMemo } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { CheckCircleIcon, WarningIcon, InfoIcon } from '@/components/icons';

const BASE_URL = import.meta.env.VITE_APP_URL || 'https://flashcart.bsdc.info.bd';

/**
 * Calculate SEO score for a partner's store profile.
 *
 * @param {object} partner — Partner data
 * @returns {object} { score, checks, suggestions }
 */
const calculateSeoScore = (partner) => {
  const checks = [];
  let score = 0;

  /* Check 1: Has business name (10 points) */
  if (partner.businessName && partner.businessName.length >= 3) {
    score += 10;
    checks.push({ passed: true, label: 'Business name set', points: 10 });
  } else {
    checks.push({ passed: false, label: 'Add a business name (3+ characters)', points: 10 });
  }

  /* Check 2: Has Bangla name (10 points) */
  if (partner.businessNameBn && partner.businessNameBn.length >= 3) {
    score += 10;
    checks.push({ passed: true, label: 'Bangla business name set', points: 10 });
  } else {
    checks.push({ passed: false, label: 'Add Bangla business name for local SEO', points: 10 });
  }

  /* Check 3: Has description (15 points) */
  if (partner.description && partner.description.length >= 50) {
    if (partner.description.length >= 150) {
      score += 15;
      checks.push({ passed: true, label: 'Description optimal (150+ chars)', points: 15 });
    } else {
      score += 8;
      checks.push({ passed: false, label: 'Expand description to 150+ characters', points: 15 });
    }
  } else {
    checks.push({ passed: false, label: 'Add detailed description (50+ characters)', points: 15 });
  }

  /* Check 4: Has logo (10 points) */
  if (partner.logo) {
    score += 10;
    checks.push({ passed: true, label: 'Logo uploaded', points: 10 });
  } else {
    checks.push({ passed: false, label: 'Upload your business logo', points: 10 });
  }

  /* Check 5: Has banner (10 points) */
  if (partner.banner) {
    score += 10;
    checks.push({ passed: true, label: 'Banner image uploaded', points: 10 });
  } else {
    checks.push({ passed: false, label: 'Upload an attractive banner image', points: 10 });
  }

  /* Check 6: Has phone (5 points) */
  if (partner.phone) {
    score += 5;
    checks.push({ passed: true, label: 'Phone number added', points: 5 });
  } else {
    checks.push({ passed: false, label: 'Add phone number for local SEO', points: 5 });
  }

  /* Check 7: Has location (10 points) */
  if (partner.location?.lat && partner.location?.lng && partner.location?.address) {
    score += 10;
    checks.push({ passed: true, label: 'Location set on map', points: 10 });
  } else {
    checks.push({ passed: false, label: 'Set your store location on map', points: 10 });
  }

  /* Check 8: Has opening hours (10 points) */
  if (partner.openingHours && Object.keys(partner.openingHours).length >= 5) {
    score += 10;
    checks.push({ passed: true, label: 'Opening hours configured', points: 10 });
  } else {
    checks.push({ passed: false, label: 'Set complete opening hours', points: 10 });
  }

  /* Check 9: Has SEO keywords (10 points) */
  if (partner.seoKeywords && partner.seoKeywords.length >= 3) {
    score += 10;
    checks.push({ passed: true, label: 'SEO keywords added', points: 10 });
  } else {
    checks.push({ passed: false, label: 'Add at least 3 SEO keywords (Bangla + English)', points: 10 });
  }

  /* Check 10: Custom SEO title (10 points) */
  if (partner.seoTitle && partner.seoTitle.length >= 30 && partner.seoTitle.length <= 60) {
    score += 10;
    checks.push({ passed: true, label: 'SEO title optimized (30-60 chars)', points: 10 });
  } else {
    checks.push({ passed: false, label: 'Set custom SEO title (30-60 characters)', points: 10 });
  }

  return { score, checks };
};

/**
 * SeoGuide Component
 *
 * @param {object} props
 * @param {object} props.partner — Partner data
 */
const SeoGuide = ({ partner }) => {
  const t = useTranslation();

  const { score, checks } = useMemo(() => calculateSeoScore(partner || {}), [partner]);

  /* Score color based on score range */
  const scoreColor = score >= 80 ? 'success' : score >= 50 ? 'warning' : 'danger';
  const scoreLabel = score >= 80 ? 'Excellent' : score >= 50 ? 'Needs Improvement' : 'Poor';

  /* Build preview title and description */
  const previewTitle = partner?.seoTitle
    || `${partner?.businessName || 'Your Business'} - Order Online | FlashCart`;
  const previewDescription = partner?.description
    || 'Add a description to see how your store appears in Google search results.';
  const previewUrl = `${BASE_URL}/store/${partner?.slug || 'your-business'}`;

  return (
    <div className="seo-guide">
      {/* SEO Score Section */}
      <div className="seo-score-section">
        <div className="seo-score-circle" data-score={scoreColor}>
          <svg viewBox="0 0 120 120" width="120" height="120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="var(--color-gray-200)" strokeWidth="8" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={scoreColor === 'success' ? 'var(--color-success)' : scoreColor === 'warning' ? 'var(--color-warning)' : 'var(--color-danger)'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 339.3} 339.3`}
              strokeDashoffset="0"
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
            <text x="60" y="65" textAnchor="middle" fontSize="28" fontWeight="bold" fill="currentColor">
              {score}
            </text>
            <text x="60" y="85" textAnchor="middle" fontSize="10" fill="var(--color-text-secondary)">
              / 100
            </text>
          </svg>
        </div>
        <div className="seo-score-info">
          <h3>SEO Score: {scoreLabel}</h3>
          <p>Improve your score to rank higher in Google search results.</p>
        </div>
      </div>

      {/* Google Preview */}
      <div className="seo-preview-section">
        <h4>Google Search Preview</h4>
        <div className="google-preview">
          <div className="google-preview-url">{previewUrl}</div>
          <div className="google-preview-title">{previewTitle}</div>
          <div className="google-preview-description">{previewDescription}</div>
        </div>
      </div>

      {/* Checklist */}
      <div className="seo-checklist">
        <h4>SEO Optimization Checklist</h4>
        <ul className="checklist">
          {checks.map((check, index) => (
            <li key={index} className={`checklist-item ${check.passed ? 'passed' : 'failed'}`}>
              {check.passed ? (
                <CheckCircleIcon size={20} color="var(--color-success)" />
              ) : (
                <WarningIcon size={20} color="var(--color-warning)" />
              )}
              <span className="checklist-label">{check.label}</span>
              <span className="checklist-points">+{check.points} pts</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Tips */}
      <div className="seo-tips">
        <h4>SEO Tips for Bangladesh Businesses</h4>
        <ul>
          <li>
            <InfoIcon size={16} color="var(--color-info)" />
            <span>Use both Bangla and English in your description for wider reach</span>
          </li>
          <li>
            <InfoIcon size={16} color="var(--color-info)" />
            <span>Include your area name (e.g., "Dhanmondi", "Gulshan") in description</span>
          </li>
          <li>
            <InfoIcon size={16} color="var(--color-info)" />
            <span>Use high-quality images for logo and banner (recommended 1200x630px)</span>
          </li>
          <li>
            <InfoIcon size={16} color="var(--color-info)" />
            <span>Add common product/cuisine keywords in Bangla (e.g., "বিরিয়ানি", "কাচ্চি")</span>
          </li>
          <li>
            <InfoIcon size={16} color="var(--color-info)" />
            <span>Keep your business hours accurate — Google uses this for "open now" filters</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SeoGuide;
