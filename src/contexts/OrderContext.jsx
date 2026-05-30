// OrderContext.jsx — Real-time order feed + new-order alerting.
// Subscribes to the partner's Realtime DB order node and fires the full alert stack:
// audio chime, tab-title badge/blink, native system notification, and an in-app banner.

import React, { createContext, useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { listenForOrders, fetchOrders, markOrderSeen } from '../utils/partnerService'
import {
  playOrderAlert,
  updateTabTitle,
  startTitleBlink,
  stopTitleBlink,
  showNativeNotification,
} from '../utils/notifications'

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
      // Skip the very first snapshot (initial load) so we don't chime for old orders.
      if (!firstSnapshot.current) {
        for (const o of newOnes) {
          if (!seenIds.current.has(o.id)) {
            seenIds.current.add(o.id)
            playOrderAlert()
            showNativeNotification('New Order Received!', {
              body: `Order ${o.orderId || ''} — ৳${o.total} from ${o.customerName}`,
              url: `/orders/${o.id}`,
            })
            // Refresh the Firestore list so dashboards update.
            reloadOrders()
          }
        }
      } else {
        // Seed seenIds so existing new orders don't re-alert later.
        newOnes.forEach((o) => seenIds.current.add(o.id))
        firstSnapshot.current = false
      }
    })
    return () => unsub && unsub()
  }, [user, reloadOrders])

  // Keep the tab title badge + blink in sync with the unseen count.
  useEffect(() => {
    updateTabTitle(newCount)
    if (newCount > 0) startTitleBlink(newCount)
    else stopTitleBlink()
    return () => stopTitleBlink()
  }, [newCount])

  // Page Visibility API: when partner returns to the tab, refresh orders.
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') reloadOrders() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [reloadOrders])

  // Mark a single order as seen (clears the isNew flag in Realtime DB).
  const acknowledge = useCallback(async (orderId) => {
    if (!user) return
    await markOrderSeen(user.uid, orderId)
  }, [user])

  // Mark ALL currently-new orders as seen.
  const acknowledgeAll = useCallback(async () => {
    if (!user) return
    const ids = Object.entries(liveOrders).filter(([, v]) => v?.isNew).map(([id]) => id)
    await Promise.all(ids.map((id) => markOrderSeen(user.uid, id)))
  }, [user, liveOrders])

  return (
    <OrderContext.Provider
      value={{
        orders, liveOrders, newCount, latestNew, loading,
        reloadOrders, acknowledge, acknowledgeAll,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}
