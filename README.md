# FlashCart — Partner Portal (flashcart-partner)

Business management dashboard for FlashCart stores in Bangladesh.
This repository is **Application 2 — FlashCart Partner Portal**.

- **Live URL (target):** https://partner.flashcart.bsdc.info.bd
- **Stack:** React 18 + Vite + React Router v6 + Firebase + Leaflet + Recharts + OneSignal
- **Hosting:** Cloudflare Pages (free)
- **Developer:** Rizwan Rahim Chowdhury
- **Powered by:** [Bangladesh Software Development Community](https://www.bsdc.info.bd)

> Shares the **same Firebase project** as the customer app (`flashcart-main`).

---

## The notification system (the core feature)

Partners use Android phones — they must never miss an order. The full alert stack:

1. **OneSignal push** — When a customer places an order, the customer app calls the
   OneSignal REST API targeting this partner (by saved player id, fallback by uid).
   Works when the browser is closed or the phone is locked.
2. **Realtime DB listener** — `OrderContext` subscribes to `orders/{partnerId}` and
   fires instantly on a new order.
3. **Web Audio chime** — a two-tone alert generated in-browser (no audio files).
4. **Tab title badge + blink** — `(3) নতুন অর্ডার | FlashCart Partner`.
5. **Native system notification** — clicking it opens the order.
6. **Sticky banner** — `NotificationBanner` stays until new orders are viewed.
7. **Page Visibility API** — refreshes orders when the partner returns to the tab.
8. **Service worker** (`public/sw.js`) — shows background notifications on push and
   focuses/opens the right order on click.
9. **Permission prompt loop** — `NotificationContext` re-asks every 30s until enabled,
   with a clear explanation and Android instructions if blocked.
10. **PWA** — installable to the home screen (`manifest.json`), works like a native app.

### How the two apps connect
- Customer checkout → writes to Firestore `orders` **and** Realtime DB
  `orders/{partnerId}/{orderId}` (`isNew: true`) **and** sends a OneSignal push.
- Partner dashboard → live listener picks it up, fires the whole alert stack,
  and clears `isNew` once the partner opens the order.

---

## What's implemented

- **Auth** — Google + email/password, partner-role tagging, OneSignal external-id link.
- **Setup Wizard** (`/guide`) — 4-step onboarding (basics → category/contact → location → logo/banner).
- **Dashboard** — KPIs (today's revenue, total orders, rating, profile score), 7-day
  sales chart (Recharts), top-selling items, recent orders, quick actions.
- **Orders** — live list with new-order highlighting, status filter, search, CSV export,
  detail page with accept/reject + status flow + printable invoice.
- **Menu** — categories + items, add/edit form (Bangla + English), ImgBB image upload,
  availability toggle, delete.
- **Settings** — store info, logo/banner, category, contact, location (Leaflet picker),
  delivery radius/fee + all-Bangladesh toggle, day-by-day hours, open/accepting toggles.
- **Analytics & SEO** — SEO score (0-100) with actionable tips, Google SERP preview,
  keyword suggestions, sales chart.
- **Certificates** — Canvas-generated downloadable milestone certificates (100/500/1000
  orders) + business badges.
- **Reviews** — view and reply.
- **Notifications page** — permission status, test alert, explanation.
- **3-language system** + PWA + Cloudflare SPA routing (`404.html`).

---

## Deploy to Cloudflare Pages (Android tablet, no CLI)

1. Push this folder to the GitHub repo `flashcart-partner`.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
3. Build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Add custom domain `partner.flashcart.bsdc.info.bd`.
5. `public/sw.js` and `public/OneSignalSDKWorker.js` are served from the site root
   automatically (required for web push).

### OneSignal setup
- In the OneSignal dashboard, set the site URL to `https://partner.flashcart.bsdc.info.bd`.
- Ensure the App ID matches: `289acc0a-9fde-435e-aad7-aca9c0aca98d`.

> Security note: the REST API key currently lives in client code for simplicity.
> For production, move the push call (`orderNotify.js` in the customer app) into a
> Cloudflare Pages Function and keep the key as a secret env var.

---

© FlashCart Bangladesh. Developed by Rizwan Rahim Chowdhury · Powered by BSDC.
