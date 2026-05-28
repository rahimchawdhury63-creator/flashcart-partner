/**
 * =============================================================================
 * FLASHCART — Partner Protected Route Component
 * =============================================================================
 *
 * Purpose: HOC for partner portal routes. Requires:
 * 1. User is authenticated
 * 2. User has a partner document in Firestore
 * 3. Partner account is approved by admin
 *
 * If any check fails, redirects to appropriate page with explanation.
 *
 * Usage (in Partner Portal):
 *   <Route path="/dashboard" element={
 *     <PartnerProtectedRoute>
 *       <PartnerDashboard />
 *     </PartnerProtectedRoute>
 *   } />
 *
 * Developer: Rizwan Rahim Chowdhury
 * =============================================================================
 */

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth/useAuth';
import { db, doc, getDoc } from '@/firebase';

/**
 * PartnerProtectedRoute Component
 *
 * @param {object} props
 * @param {React.ReactNode} props.children — Protected partner content
 * @param {boolean} props.requireApproval — Require admin approval (default: true)
 */
const PartnerProtectedRoute = ({ children, requireApproval = true }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const [partnerData, setPartnerData] = useState(null);
  const [partnerLoading, setPartnerLoading] = useState(true);
  const location = useLocation();

  /* Fetch partner document when user is available */
  useEffect(() => {
    const fetchPartner = async () => {
      if (!currentUser) {
        setPartnerLoading(false);
        return;
      }
      try {
        const partnerRef = doc(db, 'partners', currentUser.uid);
        const snapshot = await getDoc(partnerRef);
        if (snapshot.exists()) {
          setPartnerData(snapshot.data());
        } else {
          setPartnerData(null);
        }
      } catch (err) {
        console.error('[PartnerProtectedRoute] Failed to fetch partner:', err);
        setPartnerData(null);
      } finally {
        setPartnerLoading(false);
      }
    };
    fetchPartner();
  }, [currentUser]);

  /* Show loading state */
  if (authLoading || partnerLoading) {
    return (
      <div className="loader-fullpage">
        <div className="spinner spinner-lg" aria-label="Loading partner data" />
      </div>
    );
  }

  /* Not authenticated — redirect to partner login */
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  /* Authenticated but no partner document — redirect to partner registration */
  if (!partnerData) {
    return <Navigate to="/register" state={{ from: location.pathname }} replace />;
  }

  /* Partner exists but not approved — show pending screen */
  if (requireApproval && !partnerData.isApproved) {
    return <Navigate to="/pending-approval" replace />;
  }

  /* All checks passed — render partner content */
  return children;
};

export default PartnerProtectedRoute;
