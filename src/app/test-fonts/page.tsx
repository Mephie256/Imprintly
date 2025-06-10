'use client'

import { useEffect, useState } from 'react'

// Deep debugging font loader
const loadFont = (fontName: string): Promise<boolean> => {
  return new Promise((resolve) => {
    console.log(`🔍 DEEP DEBUG: Starting font load for "${fontName}"`)

    const urlFontName = fontName.replace(/\s+/g, '+')
    const fontUrl = `https://fonts.googleapis.com/css2?family=${urlFontName}:wght@300;400;500;600;700;800;900&display=swap`

    console.log(`🔗 DEEP DEBUG: Font URL: ${fontUrl}`)

    // Check if already exists
    const existing = document.querySelector(`link[href*="${urlFontName}"]`)
    if (existing) {
      console.log(`⏭️ DEEP DEBUG: Font already loaded: ${fontName}`)
      resolve(true)
      return
    }

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = fontUrl
    link.crossOrigin = 'anonymous'

    let resolved = false

    link.onload = () => {
      console.log(`✅ DEEP DEBUG: Font CSS loaded: ${fontName}`)

      // Wait for font to be ready
      setTimeout(() => {
        if (document.fonts && document.fonts.check) {
          const isAvailable = document.fonts.check(`16px "${fontName}"`)
          console.log(
            `🔍 DEEP DEBUG: Font check result for "${fontName}": ${isAvailable}`
          )
          if (!resolved) {
            resolved = true
            resolve(isAvailable)
          }
        } else {
          console.log(`✅ DEEP DEBUG: Font loaded (no check API): ${fontName}`)
          if (!resolved) {
            resolved = true
            resolve(true)
          }
        }
      }, 200)
    }

    link.onerror = (error) => {
      console.error(`❌ DEEP DEBUG: Font load error for ${fontName}:`, error)
      console.error(`❌ DEEP DEBUG: Failed URL: ${fontUrl}`)
      if (!resolved) {
        resolved = true
        resolve(false)
      }
    }

    // Timeout
    setTimeout(() => {
      if (!resolved) {
        console.warn(`⏰ DEEP DEBUG: Font load timeout: ${fontName}`)
        resolved = true
        resolve(false)
      }
    }, 8000)

    document.head.appendChild(link)
    console.log(`🚀 DEEP DEBUG: Font link added to DOM: ${fontName}`)
  })
}

const testFonts = [
  'Nunito',
  'Source Sans 3',
  'Raleway',
  'Anton',
  'Great Vibes',
  'JetBrains Mono',
  'Bangers',
  'Fredoka',
  'Plus Jakarta Sans',
]

export default function TestFontsPage() {
  const [loadedFonts, setLoadedFonts] = useState<string[]>([])

  useEffect(() => {
    console.log('🚀 STARTING FONT LOADING TEST')

    // Load test fonts one by one with detailed logging
    const loadFontsSequentially = async () => {
      for (const font of testFonts) {
        console.log(`\n📝 Testing font: ${font}`)
        try {
          const success = await loadFont(font)
          if (success) {
            console.log(`✅ SUCCESS: ${font}`)
            setLoadedFonts((prev) => [...prev, font])
          } else {
            console.log(`❌ FAILED: ${font}`)
          }
        } catch (error) {
          console.error(`💥 EXCEPTION loading ${font}:`, error)
        }

        // Small delay between fonts
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
      console.log('🏁 FONT LOADING TEST COMPLETE')
    }

    loadFontsSequentially()
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          Font Loading Deep Debug Test
        </h1>

        <div className="mb-8 p-4 bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold mb-2">Manual Test:</h3>
          <button
            onClick={async () => {
              console.log('🔧 MANUAL TEST: Loading Nunito...')
              const success = await loadFont('Nunito')
              console.log(`🔧 MANUAL TEST RESULT: ${success}`)
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg mr-4">
            Test Load Nunito
          </button>
          <button
            onClick={() => {
              console.log('🔍 CHECKING ALL LOADED FONTS IN DOM:')
              const links = document.querySelectorAll(
                'link[href*="fonts.googleapis.com"]'
              )
              console.log(`Found ${links.length} Google Font links:`)
              links.forEach((link, i) => {
                console.log(`${i + 1}. ${(link as HTMLLinkElement).href}`)
              })
            }}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg mr-4">
            Check DOM Links
          </button>
          <button
            onClick={() => {
              console.log('🧪 DIRECT CSS INJECTION TEST:')
              const css = `@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800;900&display=swap');`
              const style = document.createElement('style')
              style.textContent = css
              document.head.appendChild(style)
              console.log('✅ Direct CSS injected')

              setTimeout(() => {
                const testDiv = document.createElement('div')
                testDiv.style.fontFamily = 'Nunito, sans-serif'
                testDiv.style.fontSize = '16px'
                testDiv.textContent = 'Test'
                document.body.appendChild(testDiv)

                const computedStyle = window.getComputedStyle(testDiv)
                console.log(
                  `🔍 Computed font family: ${computedStyle.fontFamily}`
                )
                document.body.removeChild(testDiv)
              }, 1000)
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg">
            Direct CSS Test
          </button>
        </div>

        <div className="space-y-6">
          {testFonts.map((font) => (
            <div key={font} className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">{font}</h3>
              <div
                className="text-2xl"
                style={{ fontFamily: `"${font}", sans-serif` }}>
                The quick brown fox jumps over the lazy dog
              </div>
              <div className="text-sm text-gray-400 mt-2">
                Status:{' '}
                {loadedFonts.includes(font) ? '✅ Loaded' : '⏳ Loading...'}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <p className="text-sm text-gray-300">
            Check browser console for font loading logs.
          </p>
          <p className="text-sm text-gray-300">
            Loaded fonts: {loadedFonts.length} / {testFonts.length}
          </p>
        </div>
      </div>
    </div>
  )
}
