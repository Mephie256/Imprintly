import { type Metadata } from 'next'
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import {
  Geist,
  Geist_Mono,
  Inter,
  Roboto,
  Open_Sans,
  Lato,
  Montserrat,
  Poppins,
  Playfair_Display,
  Merriweather,
  Oswald,
  Dancing_Script,
  Pacifico,
  Fira_Code,
  Bebas_Neue,
} from 'next/font/google'
import './globals.css'
import { UserProvider } from '@/contexts/UserContext'
import DevNotice from '@/components/DevNotice'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const roboto = Roboto({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
})

// Professional fonts for the image editor
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
})

const lato = Lato({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-lato',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
})

const poppins = Poppins({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display',
})

const merriweather = Merriweather({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-merriweather',
})

const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-oswald',
})

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-dancing-script',
})

const pacifico = Pacifico({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-pacifico',
})

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
})

const bebasNeue = Bebas_Neue({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-bebas-neue',
})

export const metadata: Metadata = {
  title: 'Imprintly - AI-Powered Text Behind Effect Creator',
  description:
    'Create stunning text-behind-subject effects with AI-powered background removal. Upload any image and place text behind the subject for professional, eye-catching visuals.',
  keywords:
    'text behind effect, background removal, AI image editing, text overlay, graphic design, photo editing',
  authors: [{ name: 'Imprintly' }],
  creator: 'Imprintly',
  publisher: 'Imprintly',
  robots: 'index, follow',
  openGraph: {
    title: 'Imprintly - AI-Powered Text Behind Effect Creator',
    description:
      'Create stunning text-behind-subject effects with AI-powered background removal.',
    url: 'https://imprintly.com',
    siteName: 'Imprintly',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Imprintly - Text Behind Effect Creator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Imprintly - AI-Powered Text Behind Effect Creator',
    description:
      'Create stunning text-behind-subject effects with AI-powered background removal.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/ionc.png', sizes: '32x32', type: 'image/png' },
      { url: '/ionc.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/ionc.png', sizes: '180x180', type: 'image/png' }],
    other: [
      { url: '/ionc.png', sizes: '192x192', type: 'image/png' },
      { url: '/ionc.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#10b981',
          colorText: '#111827',
          colorTextSecondary: '#6b7280',
          colorBackground: '#ffffff',
          colorInputBackground: '#ffffff',
          colorInputText: '#111827',
        },
        elements: {
          formButtonPrimary: 'bg-emerald-500 hover:bg-emerald-600 text-white',
          card: 'shadow-xl border border-gray-200',
          headerTitle: 'text-gray-900',
          headerSubtitle: 'text-gray-600',
          socialButtonsBlockButton: 'border border-gray-200 hover:bg-gray-50',
          formFieldInput:
            'border border-gray-200 focus:border-emerald-400 focus:ring-emerald-500/20',
          footerActionLink: 'text-emerald-600 hover:text-emerald-700',
        },
      }}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#10b981" />
          {/* Favicon - Using ionc.png */}
          <link rel="icon" type="image/png" href="/ionc.png" />
          <link rel="shortcut icon" href="/ionc.png" />
          <link rel="apple-touch-icon" href="/ionc.png" />
          {/* BULLETPROOF FONT LOADING - ALL FONTS WILL WORK */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Raleway:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Work+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Rubik:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&family=Noto+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Fira+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;0,900;1,300;1,400;1,500;1,700;1,900&family=Manrope:wght@300;400;500;600;700;800&family=Quicksand:wght@300;400;500;600;700&family=Karla:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&family=Oxygen:wght@300;400;700&family=Hind:wght@300;400;500;600;700&family=Barlow:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Outfit:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&family=Space+Grotesk:wght@300;400;500;600;700&family=Public+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Hanken+Grotesk:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=PT+Serif:ital,wght@0,400;0,700;1,400;1,700&family=Crimson+Text:ital,wght@0,400;0,600;1,400;1,600&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700;1,800&family=Bitter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Domine:wght@400;500;600;700&family=Spectral:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&family=Noto+Serif:ital,wght@0,400;0,700;1,400;1,700&family=IBM+Plex+Serif:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Young+Serif:wght@400&family=Instrument+Serif:ital,wght@0,400;1,400&family=Bodoni+Moda:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&family=DM+Serif+Display:ital,wght@0,400;1,400&family=DM+Serif+Text:ital,wght@0,400;1,400&family=Fraunces:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Anton:wght@400&family=Fjalla+One:wght@400&family=Russo+One:wght@400&family=Bangers:wght@400&family=Fredoka:wght@300;400;500;600&family=Righteous:wght@400&family=Bungee:wght@400&family=Alfa+Slab+One:wght@400&family=Archivo+Black:wght@400&family=Black+Ops+One:wght@400&family=Orbitron:wght@400;500;600;700;800;900&family=Exo+2:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Abril+Fatface:wght@400&family=Big+Shoulders+Display:wght@300;400;500;600;700;800;900&family=Cinzel:wght@400;500;600&family=Graduate:wght@400&family=Shrikhand:wght@400&family=Ultra:wght@400&family=Comfortaa:wght@300;400;500;600;700&family=Staatliches:wght@400&family=Saira+Condensed:wght@300;400;500;600;700;800;900&family=Yanone+Kaffeesatz:wght@300;400;500;600;700&family=Passion+One:wght@400;700;900&family=Squada+One:wght@400&family=Poiret+One:wght@400&family=Faster+One:wght@400&family=Megrim:wght@400&family=Syncopate:wght@400;700&family=Monoton:wght@400&family=Audiowide:wght@400&family=Creepster:wght@400&family=Bungee+Shade:wght@400&family=Rubik+Mono+One:wght@400&family=Great+Vibes:wght@400&family=Satisfy:wght@400&family=Kaushan+Script:wght@400&family=Lobster:wght@400&family=Caveat:wght@400;500;600;700&family=Amatic+SC:wght@400;700&family=Indie+Flower:wght@400&family=Shadows+Into+Light:wght@400&family=Courgette:wght@400&family=Allura:wght@400&family=Sacramento:wght@400&family=Tangerine:wght@400;700&family=Bad+Script:wght@400&family=Permanent+Marker:wght@400&family=Architects+Daughter:wght@400&family=Patrick+Hand:wght@400&family=Handlee:wght@400&family=Kalam:wght@300;400;700&family=Cookie:wght@400&family=Alex+Brush:wght@400&family=Pinyon+Script:wght@400&family=Yellowtail:wght@400&family=Parisienne:wght@400&family=Homemade+Apple:wght@400&family=Reenie+Beanie:wght@400&family=Gloria+Hallelujah:wght@400&family=Allison:wght@400&family=Birthstone:wght@400&family=Carattere:wght@400&family=Fasthand:wght@400&family=Inspiration:wght@400&family=Marck+Script:wght@400&family=Mea+Culpa:wght@400&family=Style+Script:wght@400&family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&family=Source+Code+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&family=Roboto+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Inconsolata:wght@300;400;500;600;700;800;900&family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=PT+Mono:wght@400&family=Ubuntu+Mono:ital,wght@0,400;0,700;1,400;1,700&family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&family=Anonymous+Pro:ital,wght@0,400;0,700;1,400;1,700&family=Cutive+Mono:wght@400&family=VT323:wght@400&family=Azeret+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Chivo+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Fragment+Mono:ital,wght@0,400;1,400&family=Martian+Mono:wght@300;400;500;600;700;800&family=Nanum+Gothic+Coding:wght@400;700&family=Spline+Sans+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Xanh+Mono:ital,wght@0,400;1,400&display=swap"
            rel="stylesheet"
          />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${roboto.variable} ${inter.variable} ${openSans.variable} ${lato.variable} ${montserrat.variable} ${poppins.variable} ${playfairDisplay.variable} ${merriweather.variable} ${oswald.variable} ${dancingScript.variable} ${pacifico.variable} ${firaCode.variable} ${bebasNeue.variable} antialiased`}
          suppressHydrationWarning>
          <DevNotice />
          <UserProvider>{children}</UserProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
