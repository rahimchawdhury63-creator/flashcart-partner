// partnerService.js — Firestore + Realtime DB operations for the Partner Portal.
// Manages the partner's store, menu, orders (live), reviews and stats.

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { ref, onValue, update as rtdbUpdate, remove as rtdbRemove } from 'firebase/database'
import { db, realtimeDb } from '../firebase'
import { slugify } from './seo'

// --- Store ---

/**
 * Fetch the store owned by a partner (by partnerId). Returns null if none yet.
 * @param {string} partnerId
 */
export async function fetchMyStore(partnerId) {
  try {
    const snap = await getDocs(query(collection(db, 'stores'), where('partnerId', '==', partnerId)))
    if (!snap.empty) {
      const d = snap.docs[0]
      return { id: d.id, ...d.data() }
    }
  } catch {
    /* ignore */
  }
  return null
}

/**
 * Create a store for a partner during onboarding.
 * @param {string} partnerId
 * @param {object} data - store fields (name {bn,en}, category, etc.)
 * @returns {Promise<string>} new store id
 */
export async function createStore(partnerId, data) {
  // Generate a URL-friendly unique slug from the English name.
  const baseSlug = slugify(data.name?.en || data.name?.bn || 'store')
  const slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 8999)}`

  const payload = {
    partnerId,
    slug,
    totalOrders: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalRatings: 0,
    recentOrders: 0,
    profileCompleteness: 60,
    isOpen: true,
    isAcceptingOrders: true,
    isVerified: false,
    isFeatured: false,
    deliveryFee: 0,
    deliveryTime: 45,
    minOrder: 0,
    deliveryRadius: 10,
    allBangladeshDelivery: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...data,
  }
  const docRef = await addDoc(collection(db, 'stores'), payload)
  // Mirror live status to Realtime DB.
  try {
    await rtdbUpdate(ref(realtimeDb, `storeStatus/${docRef.id}`), {
      isOpen: true,
      isAcceptingOrders: true,
      updatedAt: Date.now(),
    })
  } catch {
    /* ignore */
  }
  return docRef.id
}

/**
 * Update store fields and refresh the live status mirror.
 * @param {string} storeId
 * @param {object} updates
 */
export async function updateStore(storeId, updates) {
  await updateDoc(doc(db, 'stores', storeId), { ...updates, updatedAt: serverTimestamp() })
  if ('isOpen' in updates || 'isAcceptingOrders' in updates) {
    try {
      await rtdbUpdate(ref(realtimeDb, `storeStatus/${storeId}`), {
        ...(updates.isOpen != null ? { isOpen: updates.isOpen } : {}),
        ...(updates.isAcceptingOrders != null ? { isAcceptingOrders: updates.isAcceptingOrders } : {}),
        updatedAt: Date.now(),
      })
    } catch {
      /* ignore */
    }
  }
}

// --- Menu categories ---

export async function fetchMenuCategories(storeId) {
  try {
    const snap = await getDocs(query(collection(db, 'menuCategories'), where('storeId', '==', storeId)))
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (a.order || 0) - (b.order || 0))
  } catch {
    return []
  }
}

export async function addMenuCategory(storeId, name, order = 1) {
  const ref2 = await addDoc(collection(db, 'menuCategories'), {
    storeId, name, order, isActive: true, createdAt: serverTimestamp(),
  })
  return ref2.id
}

export async function deleteMenuCategory(categoryId) {
  await deleteDoc(doc(db, 'menuCategories', categoryId))
}

// --- Items ---

export async function fetchItems(storeId) {
  try {
    const snap = await getDocs(query(collection(db, 'items'), where('storeId', '==', storeId)))
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch {
    return []
  }
}

export async function fetchItem(itemId) {
  const snap = await getDoc(doc(db, 'items', itemId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

/**
 * Create or update an item. If itemId is provided, updates; else creates.
 * @param {string} storeId
 * @param {object} data
 * @param {string} [itemId]
 */
export async function saveItem(storeId, data, itemId) {
  const slug = data.slug || slugify(data.name?.en || data.name?.bn || 'item')
  if (itemId) {
    await updateDoc(doc(db, 'items', itemId), { ...data, slug, updatedAt: serverTimestamp() })
    return itemId
  }
  const ref2 = await addDoc(collection(db, 'items'), {
    storeId, slug,
    totalOrders: 0, averageRating: 0, totalRatings: 0, views: 0,
    isAvailable: true, isFeatured: false, isBestseller: false,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    ...data,
  })
  return ref2.id
}

export async function deleteItem(itemId) {
  await deleteDoc(doc(db, 'items', itemId))
}

// --- Orders (Firestore source of truth + Realtime DB live feed) ---

/**
 * Fetch all orders for a partner from Firestore (most recent first).
 * @param {string} partnerId
 */
export async function fetchOrders(partnerId) {
  try {
    const snap = await getDocs(
      query(collection(db, 'orders'), where('partnerId', '==', partnerId), orderBy('createdAt', 'desc'))
    )
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch {
    return []
  }
}

export async function fetchOrder(orderId) {
  const snap = await getDoc(doc(db, 'orders', orderId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

/**
 * Subscribe to the partner's live order feed in Realtime DB.
 * Returns an unsubscribe function.
 * @param {string} partnerId
 * @param {(orders: object) => void} callback - receives the orders object/null
 */
export function listenForOrders(partnerId, callback) {
  const ordersRef = ref(realtimeDb, `orders/${partnerId}`)
  return onValue(ordersRef, (snapshot) => callback(snapshot.val()))
}

/**
 * Update an order's status (and append to its status history).
 * Also clears the Realtime DB "isNew" flag when partner acts on it.
 * @param {string} orderId
 * @param {string} partnerId
 * @param {string} status
 * @param {object} order - current order (for history append)
 */
export async function updateOrderStatus(orderId, partnerId, status, order) {
  const history = Array.isArray(order?.statusHistory) ? order.statusHistory : []
  await updateDoc(doc(db, 'orders', orderId), {
    status,
    statusHistory: [...history, { status, timestamp: Date.now(), note: '' }],
    updatedAt: serverTimestamp(),
  })
  // Update the live mirror.
  try {
    await rtdbUpdate(ref(realtimeDb, `orders/${partnerId}/${orderId}`), { status, isNew: false })
  } catch {
    /* ignore */
  }
}

/**
 * Mark a live order as seen (clears the isNew badge) without changing status.
 * @param {string} partnerId
 * @param {string} orderId
 */
export async function markOrderSeen(partnerId, orderId) {
  try {
    await rtdbUpdate(ref(realtimeDb, `orders/${partnerId}/${orderId}`), { isNew: false })
  } catch {
    /* ignore */
  }
}

// --- Reviews ---

export async function fetchReviews(storeId) {
  try {
    const snap = await getDocs(
      query(collection(db, 'reviews'), where('storeId', '==', storeId), orderBy('createdAt', 'desc'))
    )
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch {
    return []
  }
}

export async function replyToReview(reviewId, reply) {
  await updateDoc(doc(db, 'reviews', reviewId), { partnerReply: reply })
}
