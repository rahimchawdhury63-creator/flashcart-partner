// main.jsx — Partner Portal entry. Mounts <App/>, imports styles, fixes Leaflet icons.

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Master stylesheet (imports all style modules).
import './styles/partner.css'

// Fix Leaflet default marker icons when bundled (use CDN assets).
import L from 'leaflet'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Register the custom service worker for PWA + background notifications.
// (OneSignal registers its own worker separately.)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration is best-effort.
    })
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
