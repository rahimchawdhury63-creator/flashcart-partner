// NotificationContext.jsx — Central control for the partner notification system.
// Manages: OneSignal init + player id, native permission, and the persistent
// "permission prompt loop" that re-asks every 30s until enabled.

import React, { createContext, useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { initOneSignal, promptOneSignal, getPlayerId } from '../onesignal'
import { requestNativePermission, notificationPermission } from '../utils/notifications'

export const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { isLoggedIn, savePlayerId } = useAuth()
  const [permission, setPermission] = useState(notificationPermission())
  const [promptVisible, setPromptVisible] = useState(false)
  const loopRef = useRef(null)

  // Initialize OneSignal once when a partner is logged in.
  useEffect(() => {
    if (!isLoggedIn) return
    let mounted = true
    initOneSignal().then(async () => {
      // If already granted, capture and persist the player id.
      if (notificationPermission() === 'granted') {
        const id = await getPlayerId()
        if (mounted && id) savePlayerId(id)
      }
    })
    return () => { mounted = false }
  }, [isLoggedIn, savePlayerId])

  // Permission prompt loop: when not granted, show modal and retry every 30s.
  useEffect(() => {
    if (!isLoggedIn) return
    const check = () => {
      const perm = notificationPermission()
      setPermission(perm)
      if (perm !== 'granted') {
        setPromptVisible(true)
      } else {
        setPromptVisible(false)
      }
    }
    check()
    loopRef.current = setInterval(check, 30000) // re-check every 30s
    return () => clearInterval(loopRef.current)
  }, [isLoggedIn])

  // Called when the partner clicks "Enable Notifications".
  const enableNotifications = useCallback(async () => {
    // Try OneSignal first, then native as a fallback.
    await initOneSignal()
    let granted = await promptOneSignal()
    if (!granted) {
      const nativePerm = await requestNativePermission()
      granted = nativePerm === 'granted'
    }
    const perm = notificationPermission()
    setPermission(perm)
    if (granted || perm === 'granted') {
      setPromptVisible(false)
      const id = await getPlayerId()
      if (id) savePlayerId(id)
    }
    return granted
  }, [savePlayerId])

  // Allow the user to temporarily dismiss the modal (loop re-shows in 30s).
  const dismissPrompt = useCallback(() => setPromptVisible(false), [])

  return (
    <NotificationContext.Provider
      value={{ permission, promptVisible, enableNotifications, dismissPrompt }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
