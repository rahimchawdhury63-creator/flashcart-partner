// usePartnerStore.js — Loads and caches the logged-in partner's store + menu.
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { fetchMyStore, fetchItems, fetchMenuCategories } from '../utils/partnerService'

export function usePartnerStore() {
  const { user, isLoggedIn } = useAuth()
  const [store, setStore] = useState(null)
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Reload all store data for the current partner.
  const reload = useCallback(async () => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    const s = await fetchMyStore(user.uid)
    setStore(s)
    if (s) {
      const [its, cats] = await Promise.all([fetchItems(s.id), fetchMenuCategories(s.id)])
      setItems(its)
      setCategories(cats)
    }
    setLoading(false)
  }, [user])

  useEffect(() => { if (isLoggedIn) reload() }, [isLoggedIn, reload])

  return { store, items, categories, loading, reload, setStore }
}
