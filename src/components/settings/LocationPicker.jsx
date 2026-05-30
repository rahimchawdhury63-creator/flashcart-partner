// LocationPicker.jsx — Leaflet map to pick the store's coordinates by clicking/dragging.
import React, { useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { reverseGeocode, getCurrentLocation } from '../../utils/maps'
import { IconMapPin } from '../svgs'

// Inner component: listens for map clicks and updates the marker position.
function ClickCatcher({ onPick }) {
  useMapEvents({
    click(e) { onPick(e.latlng.lat, e.latlng.lng) },
  })
  return null
}

export default function LocationPicker({ lat, lng, onChange }) {
  // Default to Dhaka if no coords yet.
  const [pos, setPos] = useState([lat || 23.8103, lng || 90.4125])
  const [address, setAddress] = useState('')

  // Update marker + bubble up coords + reverse-geocode address.
  const pick = async (la, ln) => {
    setPos([la, ln])
    onChange?.({ lat: la, lng: ln })
    const addr = await reverseGeocode(la, ln)
    if (addr) setAddress(addr)
  }

  // Use the device's current location.
  const useMyLocation = async () => {
    const c = await getCurrentLocation()
    if (c) pick(c.lat, c.lng)
  }

  return (
    <div>
      <button type="button" className="btn btn-outline btn-sm mb-2" onClick={useMyLocation}>
        <IconMapPin size={16} /> Use my current location
      </button>
      <div className="map-box">
        <MapContainer center={pos} zoom={14} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={pos} />
          <ClickCatcher onPick={pick} />
        </MapContainer>
      </div>
      <p className="form-hint mt-1">Tap on the map to set your exact store location.</p>
      {address && <p className="text-secondary" style={{ fontSize: '0.85rem' }}>{address}</p>}
    </div>
  )
}
