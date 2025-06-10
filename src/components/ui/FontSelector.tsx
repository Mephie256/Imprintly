'use client'

import { useState, useEffect } from 'react'
import { Type } from 'lucide-react'

interface FontSelectorProps {
  selectedFont: string
  onFontChange: (font: string) => void
}

// Comprehensive font library like Canva
const fonts = [
  // Sans Serif - Clean & Modern
  //Service and Complex
  { name: 'Inter', family: 'var(--font-inter)', category: 'Sans Serif' },
  { name: 'Roboto', family: 'var(--font-roboto)', category: 'Sans Serif' },
  {
    name: 'Open Sans',
    family: 'var(--font-open-sans)',
    category: 'Sans Serif',
  },
  {
    name: 'Montserrat',
    family: 'var(--font-montserrat)',
    category: 'Sans Serif',
  },
  { name: 'Poppins', family: 'var(--font-poppins)', category: 'Sans Serif' },
  { name: 'Lato', family: 'var(--font-lato)', category: 'Sans Serif' },
  {
    name: 'Source Sans 3',
    family: 'Source Sans 3, sans-serif',
    category: 'Sans Serif',
  },
  { name: 'Nunito', family: 'Nunito, sans-serif', category: 'Sans Serif' },
  { name: 'Raleway', family: 'Raleway, sans-serif', category: 'Sans Serif' },
  {
    name: 'Work Sans',
    family: 'Work Sans, sans-serif',
    category: 'Sans Serif',
  },
  { name: 'Rubik', family: 'Rubik, sans-serif', category: 'Sans Serif' },
  {
    name: 'Fira Sans',
    family: 'Fira Sans, sans-serif',
    category: 'Sans Serif',
  },
  { name: 'PT Sans', family: 'PT Sans, sans-serif', category: 'Sans Serif' },
  { name: 'Ubuntu', family: 'Ubuntu, sans-serif', category: 'Sans Serif' },
  {
    name: 'Noto Sans',
    family: 'Noto Sans, sans-serif',
    category: 'Sans Serif',
  },
  { name: 'Barlow', family: 'Barlow, sans-serif', category: 'Sans Serif' },
  { name: 'DM Sans', family: 'DM Sans, sans-serif', category: 'Sans Serif' },
  { name: 'Manrope', family: 'Manrope, sans-serif', category: 'Sans Serif' },
  {
    name: 'Quicksand',
    family: 'Quicksand, sans-serif',
    category: 'Sans Serif',
  },
  { name: 'Karla', family: 'Karla, sans-serif', category: 'Sans Serif' },
  { name: 'Oxygen', family: 'Oxygen, sans-serif', category: 'Sans Serif' },
  { name: 'Hind', family: 'Hind, sans-serif', category: 'Sans Serif' },
  { name: 'Nunito', family: 'Nunito, sans-serif', category: 'Sans Serif' },
  { name: 'Outfit', family: 'Outfit, sans-serif', category: 'Sans Serif' },
  {
    name: 'Plus Jakarta Sans',
    family: 'Plus Jakarta Sans, sans-serif',
    category: 'Sans Serif',
  },

  // Serif - Classic & Elegant
  {
    name: 'Playfair Display',
    family: 'var(--font-playfair-display)',
    category: 'Serif',
  },
  {
    name: 'Merriweather',
    family: 'var(--font-merriweather)',
    category: 'Serif',
  },
  { name: 'Georgia', family: 'Georgia, serif', category: 'Serif' },
  {
    name: 'Times New Roman',
    family: 'Times New Roman, serif',
    category: 'Serif',
  },
  { name: 'Crimson Text', family: 'Crimson Text, serif', category: 'Serif' },
  {
    name: 'Libre Baskerville',
    family: 'Libre Baskerville, serif',
    category: 'Serif',
  },
  {
    name: 'Cormorant Garamond',
    family: 'Cormorant Garamond, serif',
    category: 'Serif',
  },
  { name: 'EB Garamond', family: 'EB Garamond, serif', category: 'Serif' },
  { name: 'Lora', family: 'Lora, serif', category: 'Serif' },
  { name: 'PT Serif', family: 'PT Serif, serif', category: 'Serif' },
  { name: 'Bitter', family: 'Bitter, serif', category: 'Serif' },
  { name: 'Domine', family: 'Domine, serif', category: 'Serif' },
  { name: 'Spectral', family: 'Spectral, serif', category: 'Serif' },
  { name: 'Newsreader', family: 'Newsreader, serif', category: 'Serif' },
  { name: 'Literata', family: 'Literata, serif', category: 'Serif' },

  // Display - Bold & Impactful
  { name: 'Oswald', family: 'var(--font-oswald)', category: 'Display' },
  { name: 'Bebas Neue', family: 'var(--font-bebas-neue)', category: 'Display' },
  { name: 'Anton', family: 'Anton, sans-serif', category: 'Display' },
  { name: 'Fjalla One', family: 'Fjalla One, sans-serif', category: 'Display' },
  { name: 'Russo One', family: 'Russo One, sans-serif', category: 'Display' },
  { name: 'Bangers', family: 'Bangers, cursive', category: 'Display' },
  { name: 'Fredoka', family: 'Fredoka, sans-serif', category: 'Display' },
  { name: 'Righteous', family: 'Righteous, cursive', category: 'Display' },
  { name: 'Bungee', family: 'Bungee, cursive', category: 'Display' },
  {
    name: 'Alfa Slab One',
    family: 'Alfa Slab One, cursive',
    category: 'Display',
  },
  {
    name: 'Archivo Black',
    family: 'Archivo Black, sans-serif',
    category: 'Display',
  },
  {
    name: 'Black Ops One',
    family: 'Black Ops One, cursive',
    category: 'Display',
  },
  { name: 'Orbitron', family: 'Orbitron, sans-serif', category: 'Display' },
  { name: 'Exo 2', family: 'Exo 2, sans-serif', category: 'Display' },
  {
    name: 'Abril Fatface',
    family: 'Abril Fatface, cursive',
    category: 'Display',
  },
  { name: 'Ultra', family: 'Ultra, serif', category: 'Display' },
  {
    name: 'Pathway Gothic One',
    family: 'Pathway Gothic One, sans-serif',
    category: 'Display',
  },

  // Script - Elegant & Decorative
  {
    name: 'Dancing Script',
    family: 'var(--font-dancing-script)',
    category: 'Script',
  },
  { name: 'Pacifico', family: 'var(--font-pacifico)', category: 'Script' },
  { name: 'Great Vibes', family: 'Great Vibes, cursive', category: 'Script' },
  { name: 'Satisfy', family: 'Satisfy, cursive', category: 'Script' },
  {
    name: 'Kaushan Script',
    family: 'Kaushan Script, cursive',
    category: 'Script',
  },
  { name: 'Lobster', family: 'Lobster, cursive', category: 'Script' },
  { name: 'Caveat', family: 'Caveat, cursive', category: 'Script' },
  { name: 'Amatic SC', family: 'Amatic SC, cursive', category: 'Script' },
  { name: 'Indie Flower', family: 'Indie Flower, cursive', category: 'Script' },
  {
    name: 'Shadows Into Light',
    family: 'Shadows Into Light, cursive',
    category: 'Script',
  },
  { name: 'Courgette', family: 'Courgette, cursive', category: 'Script' },
  { name: 'Allura', family: 'Allura, cursive', category: 'Script' },
  { name: 'Sacramento', family: 'Sacramento, cursive', category: 'Script' },
  { name: 'Tangerine', family: 'Tangerine, cursive', category: 'Script' },
  { name: 'Bad Script', family: 'Bad Script, cursive', category: 'Script' },

  // Monospace - Technical & Modern
  { name: 'Fira Code', family: 'var(--font-fira-code)', category: 'Monospace' },
  {
    name: 'JetBrains Mono',
    family: 'JetBrains Mono, monospace',
    category: 'Monospace',
  },
  {
    name: 'Source Code Pro',
    family: 'Source Code Pro, monospace',
    category: 'Monospace',
  },
  {
    name: 'Courier New',
    family: 'Courier New, monospace',
    category: 'Monospace',
  },
  {
    name: 'Space Mono',
    family: 'Space Mono, monospace',
    category: 'Monospace',
  },
  {
    name: 'Roboto Mono',
    family: 'Roboto Mono, monospace',
    category: 'Monospace',
  },
  {
    name: 'Inconsolata',
    family: 'Inconsolata, monospace',
    category: 'Monospace',
  },
  {
    name: 'IBM Plex Mono',
    family: 'IBM Plex Mono, monospace',
    category: 'Monospace',
  },
]

// Simple and reliable Google Fonts loader
const loadGoogleFont = (fontName: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // Skip pre-loaded fonts
    const preloadedFonts = [
      'Inter',
      'Roboto',
      'Open Sans',
      'Montserrat',
      'Poppins',
      'Lato',
      'Playfair Display',
      'Merriweather',
      'Oswald',
      'Bebas Neue',
      'Dancing Script',
      'Pacifico',
      'Fira Code',
    ]

    if (preloadedFonts.includes(fontName)) {
      console.log(`⏭️ Skipping pre-loaded font: ${fontName}`)
      resolve(true)
      return
    }

    // Skip system fonts
    const systemFonts = [
      'Georgia',
      'Times New Roman',
      'Courier New',
      'Arial',
      'Helvetica',
    ]
    if (systemFonts.includes(fontName)) {
      console.log(`⏭️ Skipping system font: ${fontName}`)
      resolve(true)
      return
    }

    try {
      // Simple URL encoding for Google Fonts
      const urlFontName = fontName.replace(/\s+/g, '+')
      const fontUrl = `https://fonts.googleapis.com/css2?family=${urlFontName}:wght@300;400;500;600;700;800;900&display=swap`

      // Check if already loaded
      const existingLink = document.querySelector(
        `link[href*="${urlFontName}"]`
      )
      if (existingLink) {
        console.log(`⏭️ Font already loaded: ${fontName}`)
        resolve(true)
        return
      }

      // Create link element
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = fontUrl

      link.onload = () => {
        console.log(`✅ Font loaded successfully: ${fontName}`)

        // Test if font is actually available
        setTimeout(() => {
          if (document.fonts && document.fonts.check) {
            const isAvailable = document.fonts.check(`16px "${fontName}"`)
            console.log(
              `🔍 Font availability test for "${fontName}": ${isAvailable}`
            )
            resolve(isAvailable)
          } else {
            resolve(true)
          }
        }, 100)
      }

      link.onerror = (error) => {
        console.error(`❌ Failed to load font: ${fontName}`, error)
        console.error(`❌ Failed URL: ${fontUrl}`)
        if (link.parentNode) {
          link.parentNode.removeChild(link)
        }
        resolve(false)
      }

      document.head.appendChild(link)
      console.log(`🔄 Loading font: ${fontName} from URL: ${fontUrl}`)
    } catch (error) {
      console.error(`❌ Error loading font ${fontName}:`, error)
      resolve(false)
    }
  })
}

export default function FontSelector({
  selectedFont,
  onFontChange,
}: FontSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchTerm, setSearchTerm] = useState('')

  const categories = [
    'All',
    'Sans Serif',
    'Serif',
    'Display',
    'Script',
    'Monospace',
  ]

  // Test and preload fonts on component mount
  useEffect(() => {
    // Test with a simple font first
    console.log('🧪 Testing font loading with Nunito...')
    loadGoogleFont('Nunito')

    // Load a few essential fonts
    const essentialFonts = [
      'Source Sans 3',
      'Nunito',
      'Raleway',
      'Work Sans',
      'Rubik',
      'Anton',
      'Bangers',
      'Great Vibes',
      'JetBrains Mono',
    ]

    setTimeout(() => {
      essentialFonts.forEach((font) => {
        console.log(`Loading essential font: ${font}`)
        loadGoogleFont(font)
      })
    }, 500)
  }, [])

  const filteredFonts = fonts.filter((font) => {
    const matchesCategory =
      selectedCategory === 'All' || font.category === selectedCategory
    const matchesSearch = font.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Load font when selected with immediate application
  const handleFontChange = (fontName: string) => {
    console.log(`🎯 FONT SELECTOR: User selected font: ${fontName}`)

    // Load the font and apply it immediately
    loadGoogleFont(fontName).then((success) => {
      if (success) {
        console.log(`✅ FONT SELECTOR: Font loaded successfully: ${fontName}`)
      } else {
        console.warn(`⚠️ FONT SELECTOR: Font failed to load: ${fontName}`)
      }
    })

    onFontChange(fontName)
  }

  return (
    <div className="space-y-3">
      {/* Header - Canva Style */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-white">Font</span>
        </div>
        <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded-md">
          {filteredFonts.length}
        </span>
      </div>

      {/* Search - App Style */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search fonts"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 bg-white/10 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500/50 focus:bg-white/15 focus:outline-none text-sm transition-all"
        />
      </div>

      {/* Category Pills - App Style */}
      <div className="flex flex-wrap gap-1.5">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
              selectedCategory === category
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300 border border-white/10'
            }`}>
            {category}
          </button>
        ))}
      </div>

      {/* Font List - Canva Style */}
      <div className="space-y-1 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {filteredFonts.length > 0 ? (
          filteredFonts.map((font) => {
            const isSelected = selectedFont === font.name

            return (
              <button
                key={font.name}
                onClick={() => handleFontChange(font.name)}
                className={`
                  w-full p-3 rounded-lg transition-all duration-200 text-left group relative overflow-hidden
                  ${
                    isSelected
                      ? 'bg-emerald-600/20 border border-emerald-500/50 shadow-lg shadow-emerald-600/10'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-gray-600/50'
                  }
                `}>
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r"></div>
                )}

                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-sm font-medium ${
                      isSelected ? 'text-white' : 'text-gray-300'
                    }`}>
                    {font.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-emerald-500/30 text-emerald-200'
                          : 'bg-gray-700/50 text-gray-500'
                      }`}>
                      {font.category}
                    </span>
                    {isSelected && (
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>

                <div
                  className={`text-lg transition-colors ${
                    isSelected
                      ? 'text-white'
                      : 'text-gray-400 group-hover:text-gray-300'
                  }`}
                  style={{ fontFamily: `"${font.name}", ${font.family}` }}
                  onMouseEnter={() => {
                    // Load font when user hovers over it for preview
                    loadGoogleFont(font.name)
                  }}>
                  The quick brown fox
                </div>
              </button>
            )
          })
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-800/30 rounded-full flex items-center justify-center">
              <Type className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-sm font-medium">No fonts found</p>
            <p className="text-xs text-gray-600 mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
        <div className="text-sm text-emerald-300 font-medium mb-1">
          🎨 Professional Fonts
        </div>
        <div className="text-xs text-gray-400">
          {fonts.length}+ professional fonts with dynamic loading. Search and
          filter by category.
        </div>
      </div>
    </div>
  )
}
