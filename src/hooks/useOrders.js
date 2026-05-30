// useOrders.js — Access the real-time order context.
import { useContext } from 'react'
import { OrderContext } from '../contexts/OrderContext'
export function useOrders() {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error('useOrders must be used within an OrderProvider')
  return ctx
}
