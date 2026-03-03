# Earth Carbon Registry - Production Deployment Guide

## Prerequisites

- Node.js 18.x or higher
- Firebase project with admin access
- Razorpay LIVE account credentials
- Domain DNS configured (registryearthcarbon.org)

## Environment Setup

### 1. Production Environment Variables

Copy `.env.production` and fill in the values:

| Variable | Source |
|---|---|
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay Dashboard (LIVE mode) > API Keys |
| `RAZORPAY_KEY_SECRET` | Razorpay Dashboard (LIVE mode) > API Keys |
| `FIREBASE_PRIVATE_KEY` | Firebase Console > Project Settings > Service Accounts > Generate Key |
| `FIREBASE_CLIENT_EMAIL` | Same service account JSON file |

**Critical**: `RAZORPAY_SIMULATION_MODE` must be `false` in production.

### 2. Firebase Configuration

**Deploy Firestore Rules:**
```bash
firebase deploy --only firestore:rules
```

**Deploy Storage CORS:**
```bash
gsutil cors set cors.json gs://earthcarbonregistry-1e6ba.firebasestorage.app
```

**Authorized Domains:**
Firebase Console > Authentication > Settings > Authorized Domains:
- Add `registryearthcarbon.org`

**Initialize Counter:**
Firestore > Collection `meta` > Document `registryCounter`:
```json
{ "count": 0 }
```

### 3. Create Admin User

Firestore > Collection `users` > Document matching admin's UID:
```json
{
  "email": "admin@example.com",
  "displayName": "Admin Name",
  "role": "admin",
  "createdAt": "2026-03-03T00:00:00.000Z"
}
```

### 4. Razorpay Setup

1. Login to Razorpay Dashboard in LIVE mode
2. Settings > API Keys > Generate Live Keys
3. Keys start with `rzp_live_` (not `rzp_test_`)
4. Update `.env.production` with live keys

## Build & Deploy

```bash
npm install
npm run build
```

### Firebase App Hosting
```bash
firebase deploy --only hosting
```

### Vercel
```bash
vercel --prod
```

## Post-Deployment Checklist

- [ ] Google Sign-In works
- [ ] Test payment with real Razorpay
- [ ] Registry ID increments correctly (ECF-0001, ECF-0002...)
- [ ] QR codes generate and scan properly
- [ ] Social media share previews render
- [ ] Admin panel accessible with admin account
- [ ] Mobile responsive on iOS and Android
- [ ] SSL certificate active (HTTPS)

## Troubleshooting

### Payment fails with "Invalid signature"
- Verify `RAZORPAY_KEY_SECRET` matches the dashboard
- Ensure using LIVE keys, not test keys

### Registry ID not incrementing
- Verify Firestore rules are deployed (Admin SDK bypasses rules)
- Check Admin SDK credentials are correct

### Social share preview is blank
- Verify Open Graph meta tags in page source
- Use https://www.opengraph.xyz/ to debug
- Social platforms cache previews for 24-48 hours
