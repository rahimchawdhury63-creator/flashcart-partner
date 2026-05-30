// OrderContext.jsx — Real-time order feed + new-order alerting.
// Subscribes to the partner's Realtime DB order node and fires the full alert stack:
// audio chime, tab-title badge/blink, native system notification, and an in-app banner.

import React, { createContext, useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { listenForOrders, fetchOrders, markOrderSeen } from '../utils/partnerService'
import {
  updateTabTitle,
  startTitleBlink,
  stopTitleBlink,
  showNativeNotification,
} from '../utils/notifications'
import { armAlarm, startAlarm, stopAlarm } from '../utils/alarm'

export const OrderContext = createContext(null)

export function OrderProvider({ children }) {
  const { user, isLoggedIn } = useAuth()
  const [orders, setOrders] = useState([]) // full Firestore order list
  const [liveOrders, setLiveOrders] = useState({}) // realtime feed map
  const [newCount, setNewCount] = useState(0) // count of unseen orders
  const [latestNew, setLatestNew] = useState(null) // newest unseen order (for banner)
  const [loading, setLoading] = useState(true)

  // Tracks ids we've already alerted on, to avoid duplicate chimes.
  const seenIds = useRef(new Set())
  const firstSnapshot = useRef(true)

  // Load the full Firestore order history once.
  const reloadOrders = useCallback(async () => {
    if (!user) return
    const list = await fetchOrders(user.uid)
    setOrders(list)
    setLoading(false)
  }, [user])

  useEffect(() => { if (isLoggedIn) reloadOrders() }, [isLoggedIn, reloadOrders])

  // Subscribe to the live Realtime DB feed.
  useEffect(() => {
    if (!user) return
    const unsub = listenForOrders(user.uid, (data) => {
      const map = data || {}
      setLiveOrders(map)

      // Determine unseen (isNew) orders.
      const newOnes = Object.entries(map)
        .filter(([, v]) => v?.isNew)
        .map(([id, v]) => ({ id, ...v }))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))

      setNewCount(newOnes.length)
      setLatestNew(newOnes[0] || null)

      // Fire alerts for orders we haven't alerted on yet.
      // Skip the very first snapshot (initial load) so we don't ring for old orders.
      if (!firstSnapshot.current) {
        let hasBrandNew = false
        for (const o of newOnes) {
          if (!seenIds.current.has(o.id)) {
            seenIds.current.add(o.id)
            hasBrandNew = true
            showNativeNotification('New Order Received!', {
              body: `Order ${o.orderId || ''} — ৳${o.total} from ${o.customerName}`,
              url: `/orders/${o.id}`,
            })
            // Refresh the Firestore list so dashboards update.
            reloadOrders()
          }
        }
        // Start the CONTINUOUS alarm if there are any unseen orders. It keeps
        // ringing until the partner acknowledges (stopped in the effect below).
        if (hasBrandNew && newOnes.length > 0) startAlarm()
      } else {
        // Seed seenIds so existing new orders don't re-alert later.
        newOnes.forEach((o) => seenIds.current.add(o.id))
        firstSnapshot.current = false
      }
    })
    return () => unsub && unsub()
  }, [user, reloadOrders])

  // Arm (unlock) the alarm audio on the first user gesture, once on mount.
  useEffect(() => {
    armAlarm()
  }, [])

  // Keep the tab title badge + blink + continuous alarm in sync with the count.
  useEffect(() => {
    updateTabTitle(newCount)
    if (newCount > 0) {
      startTitleBlink(newCount)
      // If there are unseen orders, make sure the alarm is ringing. This also
      // re-starts the alarm when the partner returns to the tab with pending orders.
      startAlarm()
    } else {
      stopTitleBlink()
      // No unseen orders -> stop ringing.
      stopAlarm()
    }
    return () => stopTitleBlink()
  }, [newCount])

  // Page Visibility API: when partner returns to the tab, refresh orders.
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') reloadOrders() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [reloadOrders])

  // Manually silence the alarm without marking orders seen (e.g. a "Stop sound"
  // button). The badge stays until orders are actually viewed.
  const silenceAlarm = useCallback(() => stopAlarm(), [])

  // Mark a single order as seen (clears the isNew flag in Realtime DB).
  const acknowledge = useCallback(async (orderId) => {
    if (!user) return
    stopAlarm() // stop ringing instantly for responsiveness
    await markOrderSeen(user.uid, orderId)
  }, [user])

  // Mark ALL currently-new orders as seen.
  const acknowledgeAll = useCallback(async () => {
    if (!user) return
    stopAlarm()
    const ids = Object.entries(liveOrders).filter(([, v]) => v?.isNew).map(([id]) => id)
    await Promise.all(ids.map((id) => markOrderSeen(user.uid, id)))
  }, [user, liveOrders])

  return (
    <OrderContext.Provider
      value={{
        orders, liveOrders, newCount, latestNew, loading,
        reloadOrders, acknowledge, acknowledgeAll, silenceAlarm,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}
