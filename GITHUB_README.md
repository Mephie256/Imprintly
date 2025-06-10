# Imprintify - Text Overlay Image Generator

## Overview

Imprintify is a SaaS platform where users can generate stunning images by adding custom text — such as names, quotes, or Bible verses — on high-quality backgrounds. The application features a free tier with limited generations and a premium subscription model powered by Stripe.

## Features

- User authentication with Clerk (email, Google OAuth)
- Background image upload or template selection
- Text customization and positioning
- Image download
- Usage tracking and limits
- Premium subscription via Stripe
- Project history and management

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS 4
- **Authentication**: Clerk.dev
- **Database**: Supabase
- **Payments**: Stripe
- **Image Processing**: Fabric.js, HTML5 Canvas

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Clerk account for authentication
- Supabase account for database
- Stripe account for payments (optional for development)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/imprintify.git
   cd imprintify
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/custom-login
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/custom-signup
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
   
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Stripe (Optional for development)
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   STRIPE_MONTHLY_PRICE_ID=your_stripe_monthly_price_id
   STRIPE_YEARLY_PRICE_ID=your_stripe_yearly_price_id
   ```

4. Run the development server
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Database Setup

Run the SQL scripts in the `database` folder to set up your Supabase database schema.

## Deployment

### Deploying to Vercel

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Configure the environment variables in Vercel
4. Deploy

## License

This project is licensed under the MIT License - see the LICENSE file for details.