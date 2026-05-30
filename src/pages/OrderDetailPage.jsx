// OrderDetailPage.jsx — Single order: status flow actions + invoice.

import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import SEOHead from '../components/common/SEOHead'
import LoadingSpinner from '../components/common/LoadingSpinner'
import InvoiceView from '../components/orders/InvoiceView'
import { useOrders } from '../hooks/useOrders'
import { useAuth } from '../hooks/useAuth'
import { usePartnerStore } from '../hooks/usePartnerStore'
import { useLanguage } from '../hooks/useLanguage'
import { fetchOrder, updateOrderStatus } from '../utils/partnerService'
import { IconPhone, IconCheck, IconClose } from '../components/svgs'
import toast from 'react-hot-toast'

// The forward status flow and the next action label per status.
const NEXT = {
  placed: { next: 'confirmed', label: 'Accept Order' },
  confirmed: { next: 'preparing', label: 'Mark Preparing' },
  preparing: { next: 'out_for_delivery', label: 'Out for Delivery' },
  out_for_delivery: { next: 'delivered', label: 'Mark Delivered' },
}

export default function OrderDetailPage() {
  const { orderId } = useParams()
  const { user } = useAuth()
  const { acknowledge, reloadOrders } = useOrders()
  const { store } = usePartnerStore()
  const { t, pick } = useLanguage()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)

  const load = async () => {
    const o = await fetchOrder(orderId)
    setOrder(o)
    setLoading(false)
  }
  useEffect(() => {
    load()
    // Opening the detail acknowledges/clears the "new" badge.
    acknowledge(orderId)
  }, [orderId]) // eslint-disable-line

  if (loading) return <LoadingSpinner large />
  if (!order) {
    return (
      <div className="partner-main" style={{ textAlign: 'center' }}>
        <SEOHead title="Order Not Found" description="Order not found." />
        <h2>{t('noResults')}</h2>
        <Link to="/orders" className="btn btn-primary">{t('orders')}</Link>
      </div>
    )
  }

  // Advance the order to the next status.
  const advance = async () => {
    const step = NEXT[order.status]
    if (!step) return
    setWorking(true)
    try {
      await updateOrderStatus(order.id, user.uid, step.next, order)
      toast.success(`Order ${step.next.replace(/_/g, ' ')}`)
      await load()
      reloadOrders()
    } catch { toast.error('Could not update order') } finally { setWorking(false) }
  }

  // Reject (cancel) the order.
  const reject = async () => {
    if (!window.confirm('Reject this order?')) return
    setWorking(true)
    try {
      await updateOrderStatus(order.id, user.uid, 'cancelled', order)
      toast.success('Order rejected')
      await load()
      reloadOrders()
    } catch { toast.error('Could not reject') } finally { setWorking(false) }
  }

  const step = NEXT[order.status]

  return (
    <div className="partner-main">
      <SEOHead title={`Order ${order.orderId}`} description="Order details." />
      <div className="flex justify-between items-center mb-2">
        <h2 style={{ margin: 0 }}>Order {order.orderId}</h2>
        <span className="badge badge-primary">{order.status}</span>
      </div>

      {/* Customer */}
      <div className="card card-body mb-2">
        <h3 style={{ marginTop: 0 }}>{t('customer')}</h3>
        <p style={{ margin: 0 }}>{order.customerName}</p>
        <p className="text-secondary" style={{ margin: '2px 0' }}>{order.deliveryAddress?.address}</p>
        <a className="btn btn-outline btn-sm mt-1" href={`tel:${order.customerPhone}`}>
          <IconPhone size={16} /> {order.customerPhone}
        </a>
      </div>

      {/* Action buttons */}
      {order.status !== 'delivered' && order.status !== 'cancelled' && (
        <div className="flex gap-2 mb-2 flex-wrap">
          {step && (
            <button className="btn btn-primary" onClick={advance} disabled={working}>
              <IconCheck size={18} /> {step.label}
            </button>
          )}
          {order.status === 'placed' && (
            <button className="btn btn-outline" onClick={reject} disabled={working} style={{ color: 'var(--color-error)' }}>
              <IconClose size={18} /> {t('reject')}
            </button>
          )}
        </div>
      )}

      <InvoiceView order={order} storeName={pick(store?.name) || 'Your Store'} />
    </div>
  )
}
