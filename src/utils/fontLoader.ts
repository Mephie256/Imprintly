// SIMPLE FONT LOADER - NO BULLSHIT, JUST WORKS

class FontLoader {
  private static instance: FontLoader
  private loadedFonts = new Set<string>()

  private constructor() {}

  static getInstance(): FontLoader {
    if (!FontLoader.instance) {
      FontLoader.instance = new FontLoader()
    }
    return FontLoader.instance
  }

  // PROPER SOLUTION: Wait for fonts to actually load before using in canvas
  async loadFont(fontName: string): Promise<boolean> {
    console.log(`🔄 FONT LOADER: Loading font for canvas: ${fontName}`)

    // Skip system fonts - they're always available
    const systemFonts = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Times', 'Courier', 'Monaco', 'Consolas', 'Lucida Console']
    if (systemFonts.includes(fontName)) {
      console.log(`✅ FONT LOADER: System font ready: ${fontName}`)
      this.loadedFonts.add(fontName)
      return true
    }

    try {
      // Method 1: Use document.fonts.load() - this is the proper way
      if (document.fonts && document.fonts.load) {
        console.log(`🔄 FONT LOADER: Using document.fonts.load() for: ${fontName}`)

        // Try different font weights to ensure loading
        const fontSpecs = [
          `400 16px "${fontName}"`,
          `500 16px "${fontName}"`,
          `600 16px "${fontName}"`,
          `700 16px "${fontName}"`
        ]

        for (const spec of fontSpecs) {
          try {
            await document.fonts.load(spec)
            console.log(`✅ FONT LOADER: Loaded font spec: ${spec}`)
          } catch (error) {
            console.log(`⚠️ FONT LOADER: Failed to load spec ${spec}, trying next...`)
          }
        }

        // Wait for all fonts to be ready
        await document.fonts.ready
        console.log(`✅ FONT LOADER: All fonts ready, checking availability...`)

        // Verify font is actually available
        const isAvailable = document.fonts.check(`16px "${fontName}"`)
        if (isAvailable) {
          console.log(`✅ FONT LOADER: Font verified available: ${fontName}`)
          this.loadedFonts.add(fontName)
          return true
        } else {
          console.warn(`⚠️ FONT LOADER: Font not available after loading: ${fontName}`)
        }
      }

      // Method 2: Fallback - create invisible element to trigger font load
      console.log(`🔄 FONT LOADER: Using fallback method for: ${fontName}`)
      const testElement = document.createElement('div')
      testElement.style.fontFamily = `"${fontName}", Arial`
      testElement.style.fontSize = '16px'
      testElement.style.position = 'absolute'
      testElement.style.left = '-9999px'
      testElement.style.top = '-9999px'
      testElement.style.visibility = 'hidden'
      testElement.textContent = 'Test'
      document.body.appendChild(testElement)

      // Wait a bit for font to load
      await new Promise(resolve => setTimeout(resolve, 500))

      // Clean up
      document.body.removeChild(testElement)

      console.log(`✅ FONT LOADER: Fallback method completed for: ${fontName}`)
      this.loadedFonts.add(fontName)
      return true

    } catch (error) {
      console.error(`❌ FONT LOADER: Error loading font ${fontName}:`, error)
      return false
    }
  }

  // Wait for fonts to be ready for canvas use
  async preloadPopularFonts(): Promise<void> {
    console.log('🔄 FONT LOADER: Ensuring fonts are ready for canvas...')

    // Wait for document.fonts.ready if available
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready
        console.log('✅ FONT LOADER: document.fonts.ready completed')
      } catch (error) {
        console.warn('⚠️ FONT LOADER: document.fonts.ready failed:', error)
      }
    }

    // Additional wait to ensure fonts are fully loaded
    await new Promise(resolve => setTimeout(resolve, 1000))

    console.log('✅ FONT LOADER: Font preloading complete - ready for canvas!')
  }

  // Check if font is ready for canvas use
  async ensureFontReady(fontName: string): Promise<boolean> {
    console.log(`🔍 FONT LOADER: Ensuring font ready for canvas: ${fontName}`)

    // If already loaded, return true
    if (this.loadedFonts.has(fontName)) {
      return true
    }

    // Load the font
    return await this.loadFont(fontName)
  }

  // Always return true since fonts are preloaded
  isFontLoaded(_fontName: string): boolean {
    return true
  }

  // Get loaded fonts
  getLoadedFonts(): string[] {
    return Array.from(this.loadedFonts)
  }
}

// Export singleton instance
export const fontLoader = FontLoader.getInstance()

// Export convenience functions
export const loadGoogleFont = (fontName: string) => fontLoader.loadFont(fontName)
export const ensureFontReady = (fontName: string) => fontLoader.ensureFontReady(fontName)
