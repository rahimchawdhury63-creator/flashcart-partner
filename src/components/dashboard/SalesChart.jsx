// SalesChart.jsx — 7-day revenue line chart using Recharts.
import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useLanguage } from '../../hooks/useLanguage'

export default function SalesChart({ data }) {
  const { t } = useLanguage()
  return (
    <div className="card card-body">
      <h3 style={{ marginTop: 0 }}>{t('salesChart')}</h3>
      <div style={{ width: '100%', height: 240 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="date" fontSize={12} stroke="#718096" />
            <YAxis fontSize={12} stroke="#718096" />
            <Tooltip formatter={(v) => `৳${v}`} />
            <Line type="monotone" dataKey="revenue" stroke="#1A6B3C" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
