# 📋 Project Document for **Imprintly**

### _Make Your Mark on Every Image_

---

## ✅ Summary

**Imprintly** is a SaaS platform where users can generate stunning images by adding their custom text — such as names, quotes, or Bible verses — on high-quality backgrounds. The free tier allows up to 3 image generations, after which users can upgrade via Stripe for unlimited access.

---

## 🧪 Key Features

### 👥 User Features

- Sign up / Log in with Clerk (email, Google, etc.)
- Upload or select from template backgrounds
- Add, customize, and position text overlay
- Download the image
- Track generation usage (max 3 on free tier)
- Upgrade to unlimited access with Stripe
- View generation history

### 🔓 Free Tier

- 3 image generations total
- Limited template gallery

### 💫 Paid Tier (via Stripe)

- Unlimited generations
- Premium template gallery
- Priority support

### 💰 Pricing

- \$10/month
- \$30/year
  (Billing handled via **Stripe Checkout**)

---

## 🧱 Tech Stack (All Free)

| Component            | Tool                    | Free Tier | Notes                               |
| -------------------- | ----------------------- | --------- | ----------------------------------- |
| **Frontend**         | Next.js + Tailwind CSS  | ✅ Yes    | SSR, fast dev                       |
| **Authentication**   | Clerk.dev               | ✅ Yes    | Easy social + email auth            |
| **Image Generation** | HTML5 Canvas / Konva.js | ✅ Yes    | Programmatic image + text rendering |
| **Database**         | Supabase (PostgreSQL)   | ✅ Yes    | Tracks user data & limits           |
| **Storage**          | Supabase Storage        | ✅ Yes    | Save generated images               |
| **Payments**         | Stripe + Webhooks       | ✅ Yes    | Subscription logic                  |
| **Hosting**          | Vercel                  | ✅ Yes    | Best for Next.js                    |
| **Analytics**        | Plausible (or PostHog)  | ✅ Yes    | Optional                            |

---

## 🔐 Authentication Flow (Clerk)

- Sign in/sign up via Clerk (email/password, Google, etc.)
- Use Clerk `user.id` for linking user data in Supabase
- Protect routes like `/generate`, `/account` with Clerk's auth wrapper
- Use Clerk hooks for session/user

---

## 🧠 Database Schema (Supabase)

### `users`

| Field                | Type    | Description                    |
| -------------------- | ------- | ------------------------------ |
| `id`                 | UUID    | Primary key (matches Clerk ID) |
| `email`              | Text    | From Clerk                     |
| `image_count`        | Integer | Tracks usage                   |
| `is_subscribed`      | Boolean | Stripe logic                   |
| `stripe_customer_id` | Text    | For Stripe                     |

### `images`

| Field        | Type      | Description           |
| ------------ | --------- | --------------------- |
| `id`         | UUID      | Primary key           |
| `user_id`    | UUID      | FK to users           |
| `image_url`  | Text      | Cloud or Supabase URL |
| `text`       | Text      | User text             |
| `created_at` | Timestamp | For history           |

---

## 📟 Stripe Billing Logic

1. User clicks "Upgrade"
2. Redirect to **Stripe Checkout** session
3. On success:

   - Webhook updates `is_subscribed = true`
   - Save `stripe_customer_id`

4. On cancelation:

   - Webhook updates `is_subscribed = false`

Stripe also manages:

- Monthly/yearly billing
- Proration
- Cancelations
- Billing portal

---

## ⚙️ Generation Logic

Use **HTML5 Canvas** (or `react-konva`) to:

- Load a base image
- Render text on top with styles (fonts, size, position)
- Allow preview
- Save as PNG and upload to Supabase

Track:

- Free tier: Limit to 3 generations
- Paid tier: Unlimited

---

## 💽 Page Structure (Routes)

| Route       | Purpose                                 |
| ----------- | --------------------------------------- |
| `/`         | Landing page (CTA, pricing, demo)       |
| `/sign-in`  | Clerk sign in                           |
| `/sign-up`  | Clerk sign up                           |
| `/generate` | Main editor (canvas, image, text input) |
| `/dashboard`| User dashboard and project management   |
| `/account`  | Billing info, usage, upgrade            |
| `/history`  | View past generations                   |
| `/success`  | Stripe success redirect                 |
| `/cancel`   | Stripe cancel redirect                  |

---

## 🧱 Folder Structure (Next.js + Clerk + Tailwind)

```
/app
  /generate
  /dashboard
  /account
  /history
/components
  AuthWrapper.tsx
  ImageEditor.tsx
  FontSelector.tsx
  NavBar.tsx
/lib
  stripe.ts
  supabase.ts
  utils.ts
/pages
  api/
    stripe/
      webhook.ts
/public
/styles
  globals.css
```

---

## 🔄 MVP Development Plan

| Phase | Feature                              | Tools                      |
| ----- | ------------------------------------ | -------------------------- |
| 1     | Auth (Clerk)                         | Clerk                      |
| 2     | Image upload + text overlay (Canvas) | HTML5 Canvas / Konva       |
| 3     | Save/download image                  | Canvas.toBlob + Supabase   |
| 4     | Track user generation count          | Supabase DB                |
| 5     | Limit to 3 free generations          | Supabase Logic + Guards    |
| 6     | Stripe Checkout + Webhook            | Stripe                     |
| 7     | Protected routes for paid features   | Clerk + user.is_subscribed |

---

## ✨ Latest Features Added

### 🎨 Massive Font Library (130+ Fonts)

Comprehensive collection of professional fonts from Google Fonts and web-safe sources:

**Font Categories:**

- **Sans-serif (30+ fonts)**: Inter, Roboto, Open Sans, Lato, Montserrat, Poppins, Nunito, Source Sans Pro, Raleway, Ubuntu, Work Sans, Barlow, DM Sans, Manrope, Rubik, Noto Sans, PT Sans, Oxygen, Karla, Hind, Fira Sans, Dosis, Cabin, Quicksand, Varela Round, Titillium Web, Exo, Arimo, Asap, Catamaran, Heebo, IBM Plex Sans, Libre Franklin, and more

- **Serif (25+ fonts)**: Playfair Display, Merriweather, Crimson Text, Lora, Cormorant Garamond, EB Garamond, Libre Baskerville, PT Serif, Noto Serif, Source Serif Pro, Bitter, Domine, Vollkorn, Alegreya, Cardo, Gentium Basic, Neuton, Old Standard TT, Rokkitt, Spectral, Tinos, Zilla Slab, IBM Plex Serif, Frank Ruhl Libre, and more

- **Display (28+ fonts)**: Oswald, Bebas Neue, Anton, Righteous, Fredoka One, Bangers, Bungee, Russo One, Archivo Black, Fjalla One, Alfa Slab One, Squada One, Passion One, Staatliches, Saira Condensed, Yanone Kaffeesatz, Comfortaa, Orbitron, Exo 2, Audiowide, Black Ops One, Creepster, Monoton, Bungee Shade, Faster One, Megrim, Poiret One, Syncopate

- **Script & Handwriting (28+ fonts)**: Dancing Script, Pacifico, Great Vibes, Satisfy, Kaushan Script, Lobster, Caveat, Amatic SC, Indie Flower, Shadows Into Light, Permanent Marker, Courgette, Handlee, Kalam, Patrick Hand, Architects Daughter, Cookie, Allura, Alex Brush, Tangerine, Pinyon Script, Sacramento, Yellowtail, Parisienne, Homemade Apple, Reenie Beanie, Gloria Hallelujah, Coming Soon

- **Monospace (12+ fonts)**: Fira Code, Source Code Pro, JetBrains Mono, Space Mono, Roboto Mono, Ubuntu Mono, Inconsolata, PT Mono, Cousine, Anonymous Pro, Overpass Mono, IBM Plex Mono

- **Web-Safe (11 fonts)**: Arial, Helvetica, Verdana, Tahoma, Trebuchet MS, Times New Roman, Georgia, Times, Courier New, Courier, Monaco

**Technical Features:**

- **Dynamic Loading**: Google Fonts loaded on-demand for optimal performance
- **Font Fallbacks**: Ensures compatibility across all devices and browsers
- **CSS Variable Support**: Proper integration with Next.js font optimization
- **Real-time Font Preview**: See font changes instantly in the editor
- **Categorized Selection**: Fonts organized by type (Sans-serif, Serif, Display, Script, Monospace)
- **Font Preview Panel**: Live preview of selected font with sample text
- **Performance Optimized**: Only loads fonts when actually used
- **Cross-browser Compatible**: Works on all modern browsers and devices

### 🎛️ Enhanced UI Controls

- **Professional Toggle Switches**: Modern UI for enabling/disabling features
- **Object Detection Status**: Real-time feedback on detected objects
- **Smart Placement Indicators**: Visual feedback for auto-placement feature
- **Enhanced Font Selection**: Categorized font dropdown with live preview

---

## 📊 Future Enhancements

- AI text suggestion (e.g. motivational quote generator)
- Templates with pre-styled themes
- User dashboard with analytics
- Advanced object masking options
- Custom font uploads
- Batch processing capabilities

---

**Project Name: Imprintly**
**Tagline:** _Make Your Mark on Every Image_
