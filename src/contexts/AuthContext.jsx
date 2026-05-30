// AuthContext.jsx — Partner authentication. Same Firebase project as the customer app,
// but users created here are tagged with role 'partner' and linked to OneSignal.

import React, { createContext, useState, useEffect, useCallback } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, googleProvider, db } from '../firebase'
import { loginOneSignal } from '../onesignal'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Ensure a Firestore user doc exists, tagged as a partner.
  const ensurePartnerDoc = useCallback(async (fbUser) => {
    const ref = doc(db, 'users', fbUser.uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      const newProfile = {
        uid: fbUser.uid,
        displayName: fbUser.displayName || '',
        email: fbUser.email || '',
        photoURL: fbUser.photoURL || '',
        phoneNumber: '',
        role: 'partner',
        language: 'default',
        oneSignalPlayerId: '',
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
      }
      await setDoc(ref, newProfile)
      setProfile(newProfile)
    } else {
      const data = snap.data()
      // Upgrade role to partner if they registered here.
      if (data.role !== 'partner' && data.role !== 'admin') {
        await setDoc(ref, { role: 'partner' }, { merge: true })
        data.role = 'partner'
      }
      setProfile(data)
      setDoc(ref, { lastActive: serverTimestamp() }, { merge: true }).catch(() => {})
    }
    // Link this partner to OneSignal by external id (their uid).
    loginOneSignal(fbUser.uid)
  }, [])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser)
      if (fbUser) {
        try { await ensurePartnerDoc(fbUser) } catch { /* ignore */ }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [ensurePartnerDoc])

  const loginWithGoogle = useCallback(async () => {
    const res = await signInWithPopup(auth, googleProvider)
    await ensurePartnerDoc(res.user)
    return res.user
  }, [ensurePartnerDoc])

  const loginWithEmail = useCallback((email, password) => signInWithEmailAndPassword(auth, email, password), [])

  const signupWithEmail = useCallback(async (name, email, password) => {
    const res = await createUserWithEmailAndPassword(auth, email, password)
    if (name) await updateProfile(res.user, { displayName: name })
    await ensurePartnerDoc(res.user)
    return res.user
  }, [ensurePartnerDoc])

  const resetPassword = useCallback((email) => sendPasswordResetEmail(auth, email), [])
  const logout = useCallback(() => signOut(auth), [])

  // Persist the OneSignal player id to the partner's profile so orders can target them.
  const savePlayerId = useCallback(async (playerId) => {
    if (!user || !playerId) return
    await setDoc(doc(db, 'users', user.uid), { oneSignalPlayerId: playerId }, { merge: true })
    setProfile((p) => ({ ...p, oneSignalPlayerId: playerId }))
  }, [user])

  const updateUserProfile = useCallback(async (updates) => {
    if (!user) return
    await setDoc(doc(db, 'users', user.uid), { ...updates }, { merge: true })
    setProfile((p) => ({ ...p, ...updates }))
  }, [user])

  return (
    <AuthContext.Provider
      value={{
        user, profile, loading, isLoggedIn: !!user,
        loginWithGoogle, loginWithEmail, signupWithEmail, resetPassword, logout,
        savePlayerId, updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
