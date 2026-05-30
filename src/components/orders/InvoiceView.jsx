// InvoiceView.jsx — Printable invoice for an order (uses window.print()).
import React from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import { IconReceipt } from '../svgs'

export default function InvoiceView({ order, storeName }) {
  const { pick } = useLanguage()
  // Trigger the browser print dialog (acts as PDF "download" on Android).
  const print = () => window.print()

  return (
    <div className="card card-body">
      <div className="flex justify-between items-center">
        <h3 style={{ margin: 0 }}><IconReceipt size={18} /> Invoice</h3>
        <button className="btn btn-outline btn-sm" onClick={print}>Print / Save PDF</button>
      </div>
      <div id="invoice" className="mt-2">
        <p style={{ margin: 0 }}><strong>{storeName}</strong></p>
        <p className="text-light" style={{ margin: 0, fontSize: '0.82rem' }}>FlashCart Order {order.orderId}</p>
        <div className="divider" />
        {order.items?.map((it) => (
          <div key={it.itemId} className="flex justify-between" style={{ fontSize: '0.88rem' }}>
            <span>{pick(it.name)} × {it.quantity}</span>
            <span>৳{it.price * it.quantity}</span>
          </div>
        ))}
        <div className="divider" />
        <div className="flex justify-between"><span>Subtotal</span><span>৳{order.subtotal}</span></div>
        <div className="flex justify-between"><span>Delivery</span><span>৳{order.deliveryFee}</span></div>
        <div className="flex justify-between"><strong>Total (COD)</strong><strong>৳{order.total}</strong></div>
        <div className="divider" />
        <p style={{ margin: 0, fontSize: '0.82rem' }}>{order.customerName} · {order.customerPhone}</p>
        <p className="text-light" style={{ margin: 0, fontSize: '0.82rem' }}>{order.deliveryAddress?.address}</p>
      </div>
    </div>
  )
}
