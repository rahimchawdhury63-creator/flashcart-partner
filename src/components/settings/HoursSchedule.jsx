// HoursSchedule.jsx — Day-by-day opening hours editor.
import React from 'react'

const DAYS = [
  ['monday', 'Monday'], ['tuesday', 'Tuesday'], ['wednesday', 'Wednesday'],
  ['thursday', 'Thursday'], ['friday', 'Friday'], ['saturday', 'Saturday'], ['sunday', 'Sunday'],
]

export default function HoursSchedule({ hours, onChange }) {
  // Update one field of one day's schedule.
  const setDay = (day, patch) => {
    onChange({ ...hours, [day]: { ...(hours[day] || {}), ...patch } })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {DAYS.map(([key, label]) => {
        const d = hours[key] || { open: '09:00', close: '22:00', isOpen: true }
        return (
          <div key={key} className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
            <label className="switch">
              <input type="checkbox" checked={!!d.isOpen} onChange={(e) => setDay(key, { isOpen: e.target.checked })} />
              <span className="slider" />
            </label>
            <span style={{ width: 90, fontWeight: 500, fontSize: '0.88rem' }}>{label}</span>
            {d.isOpen ? (
              <>
                <input type="time" className="form-input" style={{ width: 'auto' }} value={d.open || '09:00'}
                  onChange={(e) => setDay(key, { open: e.target.value })} />
                <span>—</span>
                <input type="time" className="form-input" style={{ width: 'auto' }} value={d.close || '22:00'}
                  onChange={(e) => setDay(key, { close: e.target.value })} />
              </>
            ) : <span className="text-light">Closed</span>}
          </div>
        )
      })}
    </div>
  )
}
