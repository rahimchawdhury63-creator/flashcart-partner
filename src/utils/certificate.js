// certificate.js — Browser-based certificate image generation using Canvas API.
// Used to award milestone certificates (100 orders, 1000 orders) to partners.

/**
 * Render a milestone certificate to a canvas and return a PNG data URL.
 * @param {object} opts
 * @param {string} opts.storeName
 * @param {string} opts.title - e.g. "100 Orders Achievement"
 * @param {string} opts.subtitle - e.g. "Awarded for delivering 100 orders"
 * @param {string} [opts.date]
 * @returns {string} data URL (image/png)
 */
export function generateCertificate({ storeName, title, subtitle, date }) {
  const W = 1200
  const H = 850
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // Background.
  ctx.fillStyle = '#F8FAF9'
  ctx.fillRect(0, 0, W, H)

  // Outer border (brand green).
  ctx.strokeStyle = '#1A6B3C'
  ctx.lineWidth = 12
  ctx.strokeRect(30, 30, W - 60, H - 60)

  // Inner accent border (amber).
  ctx.strokeStyle = '#F4A823'
  ctx.lineWidth = 3
  ctx.strokeRect(55, 55, W - 110, H - 110)

  // Brand header.
  ctx.fillStyle = '#1A6B3C'
  ctx.textAlign = 'center'
  ctx.font = 'bold 44px Inter, sans-serif'
  ctx.fillText('FlashCart Bangladesh', W / 2, 160)

  ctx.fillStyle = '#718096'
  ctx.font = '22px Inter, sans-serif'
  ctx.fillText('Certificate of Achievement', W / 2, 205)

  // Title.
  ctx.fillStyle = '#1A1A1A'
  ctx.font = 'bold 56px Inter, sans-serif'
  ctx.fillText(title, W / 2, 360)

  // "Awarded to".
  ctx.fillStyle = '#4A5568'
  ctx.font = '24px Inter, sans-serif'
  ctx.fillText('This certificate is proudly awarded to', W / 2, 440)

  // Store name.
  ctx.fillStyle = '#1A6B3C'
  ctx.font = 'bold 48px "Hind Siliguri", Inter, sans-serif'
  ctx.fillText(storeName, W / 2, 510)

  // Subtitle.
  ctx.fillStyle = '#4A5568'
  ctx.font = '22px Inter, sans-serif'
  ctx.fillText(subtitle, W / 2, 565)

  // Date.
  ctx.fillStyle = '#718096'
  ctx.font = '20px Inter, sans-serif'
  ctx.fillText(date || new Date().toLocaleDateString('en-GB'), W / 2, 690)

  // Footer credit.
  ctx.fillStyle = '#718096'
  ctx.font = '18px Inter, sans-serif'
  ctx.fillText('Powered by Bangladesh Software Development Community', W / 2, 760)

  return canvas.toDataURL('image/png')
}

/**
 * Trigger a download of a generated certificate.
 * @param {string} dataUrl
 * @param {string} filename
 */
export function downloadCertificate(dataUrl, filename = 'flashcart-certificate.png') {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

/**
 * Determine which milestone certificates a store has earned.
 * @param {number} totalOrders
 * @returns {Array<{id:string,title:string,subtitle:string,earned:boolean,threshold:number}>}
 */
export function getMilestones(totalOrders = 0) {
  return [
    { id: 'orders-100', title: '100 Orders', subtitle: 'Awarded for successfully delivering 100 orders', threshold: 100, earned: totalOrders >= 100 },
    { id: 'orders-500', title: '500 Orders', subtitle: 'Awarded for successfully delivering 500 orders', threshold: 500, earned: totalOrders >= 500 },
    { id: 'orders-1000', title: '1000 Orders', subtitle: 'Awarded for successfully delivering 1000 orders', threshold: 1000, earned: totalOrders >= 1000 },
  ]
}
