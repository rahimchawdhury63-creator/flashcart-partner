// orderNotify.js — Sends a OneSignal push to a partner when a new order arrives.
// NOTE: This calls the OneSignal REST API directly from the client for simplicity
// (the platform has no backend). For production hardening, move this REST call into
// a Cloudflare Pages Function so the REST API key is never shipped to browsers.

import { ONESIGNAL_APP_ID } from '../onesignal'

// REST API key — used to authorize push sends.
const ONESIGNAL_REST_API_KEY =
  'os_v2_app_fcnmycu73zbv5kwxvsu4blfjrxjhpbu4dp6ezx562jjsbpk3dpjrvuvypwzlfxhw2yta4qiupjmijw735zwj5nv6c3mx36ximt7un2q'

/**
 * Trigger a push notification to a partner for a new order.
 * @param {object} params
 * @param {string} [params.playerId] - the partner's OneSignal subscription id
 * @param {string} [params.externalId] - the partner's Firebase uid (fallback target)
 * @param {object} params.order - { orderId, total, customerName }
 * @returns {Promise<boolean>} success
 */
export async function sendOrderPush({ playerId, externalId, order }) {
  // Build the targeting block: prefer player id, else external id.
  const target = playerId
    ? { include_player_ids: [playerId] }
    : externalId
    ? { include_external_user_ids: [externalId] }
    : null
  if (!target) return false

  const body = {
    app_id: ONESIGNAL_APP_ID,
    ...target,
    headings: { en: 'New Order Received!', bn: 'নতুন অর্ডার পেয়েছেন!' },
    contents: {
      en: `Order #${order.orderId} — ৳${order.total} from ${order.customerName}`,
      bn: `অর্ডার #${order.orderId} — ৳${order.total} — ${order.customerName}`,
    },
    url: `https://partner.flashcart.bsdc.info.bd/orders/${order.id || ''}`,
    data: { orderId: order.id, type: 'new_order' },
  }

  try {
    const res = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(body),
    })
    return res.ok
  } catch {
    return false
  }
}
