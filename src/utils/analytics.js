// analytics.js — SEO scoring + sales analytics helpers for the partner dashboard.

/**
 * Compute an SEO score (0-100) for a store based on profile completeness factors.
 * Returns the score plus actionable tips.
 * @param {object} store
 * @param {object[]} items
 * @returns {{score:number, tips:string[]}}
 */
export function computeSeoScore(store, items = []) {
  let score = 0
  const tips = []

  // Name (both languages) — 12
  if (store?.name?.en && store?.name?.bn) score += 12
  else tips.push('Add your store name in both Bangla and English.')

  // Description (both languages, length) — 14
  const descLen = (store?.description?.en?.length || 0) + (store?.description?.bn?.length || 0)
  if (descLen >= 120) score += 14
  else tips.push('Write a longer description (120+ chars) in both languages.')

  // Logo + banner — 12
  if (store?.logo) score += 6; else tips.push('Upload a store logo.')
  if (store?.banner) score += 6; else tips.push('Upload a store banner image.')

  // Location set — 10
  if (store?.lat != null && store?.lng != null) score += 10
  else tips.push('Set your store location on the map.')

  // Contact — 8
  if (store?.phone) score += 8; else tips.push('Add a contact phone number.')

  // SEO keywords — 10
  if ((store?.seoKeywords?.length || 0) >= 3) score += 10
  else tips.push('Add at least 3 SEO keywords.')

  // Items count — 24 (more items = better ranking & richer page)
  if (items.length >= 10) score += 24
  else if (items.length >= 5) { score += 14; tips.push('Add more items (10+) to improve ranking.') }
  else { tips.push('Add at least 5 menu items to improve your page.') }

  // Item images — 10
  const withImages = items.filter((i) => i.image).length
  if (items.length && withImages === items.length) score += 10
  else if (items.length) tips.push('Add images to every item for better engagement.')

  return { score: Math.min(100, score), tips }
}

/**
 * Build a Google SERP-style title and description preview for a store.
 * @param {object} store
 * @param {(o:any)=>string} pick - language picker
 * @param {string} categoryLabel
 */
export function serpPreview(store, pick, categoryLabel) {
  const name = pick(store?.name) || 'Your Store'
  const title = `${name} — ${categoryLabel} Delivery in ${store?.upazila || 'Bangladesh'} | FlashCart`
  const desc =
    pick(store?.seoDescription) ||
    `${name} delivers to ${store?.upazila || 'your area'}. Order online with cash on delivery. ${store?.averageRating || 0} stars.`
  const url = `flashcart.bsdc.info.bd › store › ${store?.slug || 'your-store'}`
  return { title: title.slice(0, 60), desc: desc.slice(0, 155), url }
}

/**
 * Aggregate orders into a per-day sales series for charts.
 * @param {object[]} orders - each must have createdAt (Firestore Timestamp or number) and total
 * @param {number} days - how many days back
 * @returns {Array<{date:string, revenue:number, orders:number}>}
 */
export function salesSeries(orders, days = 7) {
  const series = []
  const today = new Date()
  // Build empty buckets for the last N days.
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    series.push({ date: key.slice(5), _key: key, revenue: 0, orders: 0 })
  }
  // Fill buckets from orders.
  for (const o of orders) {
    const ts = o.createdAt?.seconds ? o.createdAt.seconds * 1000 : o.createdAt
    if (!ts) continue
    const key = new Date(ts).toISOString().slice(0, 10)
    const bucket = series.find((s) => s._key === key)
    if (bucket && o.status !== 'cancelled') {
      bucket.revenue += o.total || 0
      bucket.orders += 1
    }
  }
  return series
}

/**
 * Compute top-selling items from a list of orders.
 * @param {object[]} orders
 * @param {number} topN
 */
export function topSellingItems(orders, topN = 5) {
  const map = {}
  for (const o of orders) {
    if (o.status === 'cancelled') continue
    for (const it of o.items || []) {
      const name = typeof it.name === 'object' ? it.name.en || it.name.bn : it.name
      map[name] = (map[name] || 0) + it.quantity
    }
  }
  return Object.entries(map)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, topN)
}
