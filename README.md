# TRIOLINE TRAVELS — Private Aviation

Ultra-luxury private aviation charter experience and flight dispatch platform.

## Features
- **Cinematic Aircraft Scrollytelling**: GSAP & ScrollTrigger animated cabin window aperture, flight corridor transitions, and telemetry HUD.
- **Flight Booking Suite**: Dynamic corridor selection, instant distance/flight duration/indicative charter pricing calculations, multi-city dynamic leg builder, currency converter (USD, EUR, GBP, NGN), and bespoke catering & ground concierge options.
- **VIP Itinerary Dossier & Dispatch**: Official flight clearance modal, pre-filled WhatsApp concierge dispatch, and print/download itinerary.
- **Fleet Comparison Matrix**: Sovereign (flagship ultra-long range), Continental (super-midsize), and Executive (transcontinental) side-by-side specifications.
- **Responsive**: Fully optimized for mobile devices, tablets, and high-DPI desktop viewports.

---

## Deploying to Vercel

This repository is pre-configured for seamless, zero-config deployment on [Vercel](https://vercel.com).

### Method 1: Git Import (Recommended)
1. Push this repository to **GitHub**, **GitLab**, or **Bitbucket**.
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Click **"Add New..."** → **"Project"** and import your repository.
4. Leave the Framework Preset as **"Other"** (or default) — Vercel reads `vercel.json` automatically:
   - **Root Directory**: `.`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.`
5. Click **Deploy**. Your site will be live on Vercel's global Edge CDN in seconds!

### Method 2: Vercel CLI
```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## Local Development
```bash
# Install dependencies
npm install

# Start local development server
npm run dev
# Server will run at http://localhost:3000
```
