'use client'

// Import all fonts like the fix folder does - CANVA COMPETITOR QUALITY
import '@/app/fonts.css'

import { useEffect, useRef, useState, useCallback } from 'react'
import { removeBackground } from '@imgly/background-removal'
import {
  ArrowLeft,
  Download,
  Save,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Crown,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import {
  createProject,
  saveGeneratedImageToStorage,
} from '@/lib/project-service'
import { syncUserWithSupabase } from '@/lib/user-service'
import {
  useUserProfile,
  useUsageLimits,
  useHasPremiumAccess,
} from '@/contexts/UserContext'
import {
  initializeClientSecurity,
  performSecurityCheck,
  getSecureHeaders,
} from '@/lib/client-security'
import Dropzone from './ui/Dropzone'
import StyleSelector from './ui/StyleSelector'
import FontSelector from './ui/FontSelector'
import TextControls from './ui/TextControls'
import AdvancedTextControls from './ui/AdvancedTextControls'
import TextEffects from './ui/TextEffects'
import TextEditModal from './ui/TextEditModal'
import DownloadModal from './ui/DownloadModal'
import SaveSuccessAnimation from './ui/SaveSuccessAnimation'
import UpgradeModal from './ui/UpgradeModal'

export default function TextBehindCreator() {
  const router = useRouter()
  const { user } = useUser()
  const {
    incrementUsage,
    refreshUserProfile,
    userProfile,
    loading: profileLoading,
  } = useUserProfile()
  const { currentUsage, currentLimit, hasReachedLimit, remainingUsage } =
    useUsageLimits()
  const hasPremiumAccess = useHasPremiumAccess()

  // Initialize client-side security monitoring
  useEffect(() => {
    initializeClientSecurity()
  }, [])

  const canvasRef = useRef<HTMLCanvasElement>(null)

  // State management
  const [loading, setLoading] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [processedImageSrc, setProcessedImageSrc] = useState<string | null>(
    null
  )
  const [canvasReady, setCanvasReady] = useState(false)
  const [text, setText] = useState('Your Text Here')
  const [font, setFont] = useState('Inter')
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 })
  const [customFontSize, setCustomFontSize] = useState(80)
  const [textRotation, setTextRotation] = useState(0)
  const [textSelected, setTextSelected] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [textBounds, setTextBounds] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  })
  const [isEditingText, setIsEditingText] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  // Style controls
  const [textColor, setTextColor] = useState('#FFFFFF')
  const [textOpacity, setTextOpacity] = useState(1)
  const [fontWeight, setFontWeight] = useState('700')
  const [fontStyle, setFontStyle] = useState('normal')
  const [textDecoration, setTextDecoration] = useState('none')

  // Advanced text effects (Pro features from fix folder)
  const [letterSpacing, setLetterSpacing] = useState(0)
  const [tiltX, setTiltX] = useState(0)
  const [tiltY, setTiltY] = useState(0)
  const [textEffect, setTextEffect] = useState<
    'none' | 'shadow' | 'outline' | 'glow' | 'liquid-glass'
  >('none')
  const [glowColor, setGlowColor] = useState('#00ffff')
  const [saving, setSaving] = useState(false)
  const [projectTitle, setProjectTitle] = useState('Untitled Project')
  const [showSaveAnimation, setShowSaveAnimation] = useState(false)
  const [showAutoSaveNotification, setShowAutoSaveNotification] =
    useState(false)
  const [hasBeenAutoSaved, setHasBeenAutoSaved] = useState(false)
  const [hasIncrementedUsage, setHasIncrementedUsage] = useState(false)
  const [showUsageNotification, setShowUsageNotification] = useState(false)
  const [showLimitReachedModal, setShowLimitReachedModal] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Zoom functionality
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)

  // Watermark logo image
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize professional font loading
  useEffect(() => {
    console.log(
      '🎨 TEXT BEHIND CREATOR: Initialized with bulletproof font system!'
    )
  }, [])

  // Font loading is handled by FontSelector component
  // Text effects are now included in drawCompositeImage dependencies for live updates

  // Zoom functions
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev * 1.2, 3)) // Max 3x zoom
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev / 1.2, 0.5)) // Min 0.5x zoom
  }

  const handleResetZoom = () => {
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
  }

  // Pan functions
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      // Middle mouse or Ctrl+click for panning
      setIsPanning(true)
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
      e.preventDefault()
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      setZoomLevel((prev) => Math.max(0.5, Math.min(3, prev * delta)))
    }
  }

  // Secure usage validation before processing
  const validateUsageBeforeProcessing = async (): Promise<boolean> => {
    try {
      // Premium users always pass validation
      if (hasPremiumAccess) {
        console.log('✅ Premium user - bypassing usage validation')
        return true
      }

      // In development mode, skip server validation if client says it's OK
      if (process.env.NODE_ENV === 'development') {
        // Only check client-side limits in development for free users
        if (hasReachedLimit && !hasPremiumAccess) {
          setShowLimitReachedModal(true)
          return false
        }
        return true
      }

      // Perform security check before making request
      const isSecure = await performSecurityCheck()
      if (!isSecure) {
        console.warn('🚫 Security check failed')
        setShowLimitReachedModal(true)
        return false
      }

      const response = await fetch('/api/validate-usage', {
        method: 'POST',
        headers: getSecureHeaders(),
      })

      const data = await response.json()

      if (!data.canCreate) {
        console.log('🚫 Server-side usage validation failed:', data.error)
        setShowLimitReachedModal(true)
        return false
      }

      console.log('✅ Server-side usage validation passed')
      return true
    } catch (error) {
      console.error('❌ Usage validation error:', error)

      // Premium users don't get blocked by validation errors
      if (hasPremiumAccess) {
        console.log('✅ Premium user - bypassing validation error')
        return true
      }

      // In development, don't block on validation errors
      if (process.env.NODE_ENV === 'development') {
        return true
      }

      setShowLimitReachedModal(true)
      return false
    }
  }

  // Handle image selection and background removal
  const setSelectedImage = async (file?: File) => {
    if (file) {
      // Premium users skip all usage checks
      if (hasPremiumAccess) {
        console.log('✅ Premium user - proceeding with image processing')
      } else {
        // Don't check limits if profile is still loading
        if (profileLoading || !userProfile) {
          // Skip usage check while loading
        } else {
          // Check limits when profile is loaded (both dev and production)
          if (hasReachedLimit && !hasPremiumAccess) {
            setShowLimitReachedModal(true)
            return
          }
        }

        // Server-side validation for security (free users only)
        const canProceed = await validateUsageBeforeProcessing()
        if (!canProceed) {
          return
        }
      }

      setLoading(true)
      console.log(
        `Processing image: ${file.name} (${(file.size / 1024 / 1024).toFixed(
          2
        )}MB)`
      )

      const reader = new FileReader()

      reader.onload = async (e) => {
        const src = e.target?.result as string
        setImageSrc(src)
        setHasBeenAutoSaved(false) // Reset auto-save status for new image
        setHasIncrementedUsage(false) // Reset usage increment for new image

        try {
          // Create an image to check dimensions
          const img = new Image()
          img.onload = async () => {
            console.log(`Image dimensions: ${img.width}x${img.height}px`)

            try {
              const blob = await removeBackground(src)
              const processedUrl = URL.createObjectURL(blob)
              setProcessedImageSrc(processedUrl)
              setCanvasReady(true)
              console.log('Background removal completed successfully')
            } catch (error) {
              console.error('Background removal failed:', error)
              console.log('Using original image as fallback')
              setProcessedImageSrc(src)
              setCanvasReady(true)
            } finally {
              setLoading(false)
            }
          }

          img.onerror = (error) => {
            console.error('Failed to load image:', error)
            console.error('Image source:', src)
            setLoading(false)
            // Show user-friendly error
            alert(
              '❌ Failed to load the selected image. Please try a different image or check your internet connection.'
            )
          }

          img.src = src
        } catch (error) {
          console.error('Image processing failed:', error)
          setLoading(false)
        }
      }

      reader.onerror = () => {
        console.error('Failed to read file')
        setLoading(false)
      }

      reader.readAsDataURL(file)
    }
  }

  // ADVANCED GLASS MORPHISM TEXT EFFECT - Based on your CSS example
  const renderLiquidGlass = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    fontSize: number,
    textOpacity: number,
    letterSpacing: number
  ) => {
    ctx.save()

    // LAYER 1: Glass Background - INCREASED OPACITY FOR VISIBILITY
    const glassBase = ctx.createLinearGradient(0, y - fontSize, 0, y + fontSize)
    glassBase.addColorStop(0, 'rgba(255, 255, 255, 0.6)')
    glassBase.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)')
    glassBase.addColorStop(1, 'rgba(255, 255, 255, 0.6)')

    ctx.fillStyle = glassBase
    ctx.globalAlpha = textOpacity

    // Glass shadow (box-shadow: 0 6px 6px rgba(0, 0, 0, 0.2))
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
    ctx.shadowBlur = 6
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 6

    // Render base glass layer
    renderTextLayer(ctx, text, x, y, letterSpacing)

    // LAYER 2: Glass Specular Highlights - INCREASED VISIBILITY
    ctx.shadowColor = 'transparent'
    ctx.globalCompositeOperation = 'screen'

    // Top highlight
    const topHighlight = ctx.createLinearGradient(
      0,
      y - fontSize * 0.6,
      0,
      y - fontSize * 0.2
    )
    topHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
    topHighlight.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)')
    topHighlight.addColorStop(1, 'rgba(255, 255, 255, 0.0)')

    ctx.fillStyle = topHighlight
    ctx.globalAlpha = textOpacity * 0.8
    renderTextLayer(ctx, text, x, y, letterSpacing)

    // LAYER 3: Inner Glass Highlight - INCREASED VISIBILITY
    ctx.globalCompositeOperation = 'overlay'
    const innerHighlight = ctx.createLinearGradient(
      0,
      y - fontSize * 0.3,
      0,
      y + fontSize * 0.1
    )
    innerHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
    innerHighlight.addColorStop(1, 'rgba(255, 255, 255, 0.3)')

    ctx.fillStyle = innerHighlight
    ctx.globalAlpha = textOpacity * 0.7
    renderTextLayer(ctx, text, x, y, letterSpacing)

    // LAYER 4: Glass Edge Definition - INCREASED VISIBILITY
    ctx.globalCompositeOperation = 'source-over'
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.lineWidth = 2
    ctx.globalAlpha = textOpacity
    ctx.shadowColor = 'transparent'

    // Render glass edge
    if (letterSpacing === 0) {
      ctx.strokeText(text, x, y)
    } else {
      const chars = text.split('')
      let currentX =
        x -
        (ctx.measureText(text).width + (chars.length - 1) * letterSpacing) / 2
      chars.forEach((char) => {
        const charWidth = ctx.measureText(char).width
        ctx.strokeText(char, currentX + charWidth / 2, y)
        currentX += charWidth + letterSpacing
      })
    }

    // LAYER 5: Subtle Depth Shadow - INCREASED VISIBILITY
    ctx.globalCompositeOperation = 'multiply'
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.globalAlpha = textOpacity * 0.5
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
    ctx.shadowBlur = 20
    ctx.shadowOffsetY = 4

    renderTextLayer(ctx, text, x, y, letterSpacing)

    ctx.restore()
  }

  // Helper function to render text with letter spacing
  const renderTextLayer = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    letterSpacing: number
  ) => {
    if (letterSpacing === 0) {
      ctx.fillText(text, x, y)
    } else {
      const chars = text.split('')
      let currentX =
        x -
        (ctx.measureText(text).width + (chars.length - 1) * letterSpacing) / 2
      chars.forEach((char) => {
        const charWidth = ctx.measureText(char).width
        ctx.fillText(char, currentX + charWidth / 2, y)
        currentX += charWidth + letterSpacing
      })
    }
  }

  // Apply text effects to canvas context
  const applyTextEffect = (
    ctx: CanvasRenderingContext2D,
    effect: 'none' | 'shadow' | 'outline' | 'glow' | 'liquid-glass',
    textColor: string,
    textOpacity: number,
    textY?: number,
    fontSize?: number,
    customGlowColor?: string
  ) => {
    ctx.globalAlpha = textOpacity

    switch (effect) {
      case 'none':
        ctx.fillStyle = textColor
        break

      case 'shadow':
        ctx.fillStyle = textColor
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
        ctx.shadowBlur = 4
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2
        break

      case 'outline':
        ctx.strokeStyle = textColor
        ctx.lineWidth = 3
        ctx.fillStyle = 'transparent'
        break

      case 'glow':
        ctx.fillStyle = textColor
        ctx.shadowColor = customGlowColor || '#00ffff'
        ctx.shadowBlur = 20
        break

      case 'liquid-glass':
        // This will be handled by renderLiquidGlass function
        ctx.fillStyle = 'transparent'
        break
    }
  }

  const drawCompositeImage = useCallback(async () => {
    if (!canvasRef.current || !canvasReady || !imageSrc || !processedImageSrc)
      return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.error('❌ Failed to get canvas 2D context')
      return
    }

    try {
      const bgImg = new Image()
      bgImg.onload = async () => {
        // Calculate optimal canvas size based on viewport and container
        const containerWidth =
          window.innerWidth < 1024
            ? window.innerWidth * 0.9
            : window.innerWidth * 0.6 // Mobile: 90%, Desktop: 60%
        const containerHeight =
          window.innerWidth < 1024
            ? window.innerHeight * 0.5
            : window.innerHeight * 0.65 // Mobile: 50%, Desktop: 65%

        // Set reasonable maximum dimensions for performance
        const maxDisplayWidth = Math.min(containerWidth, 800)
        const maxDisplayHeight = Math.min(containerHeight, 600)

        const aspectRatio = bgImg.width / bgImg.height
        let displayWidth = bgImg.width
        let displayHeight = bgImg.height

        // Scale down if image is too large for display
        if (
          displayWidth > maxDisplayWidth ||
          displayHeight > maxDisplayHeight
        ) {
          if (
            displayWidth / maxDisplayWidth >
            displayHeight / maxDisplayHeight
          ) {
            // Width is the limiting factor
            displayWidth = maxDisplayWidth
            displayHeight = displayWidth / aspectRatio
          } else {
            // Height is the limiting factor
            displayHeight = maxDisplayHeight
            displayWidth = displayHeight * aspectRatio
          }
        }

        // Ensure minimum size for usability
        const minSize = 300
        if (displayWidth < minSize || displayHeight < minSize) {
          if (aspectRatio > 1) {
            displayWidth = minSize
            displayHeight = minSize / aspectRatio
          } else {
            displayHeight = minSize
            displayWidth = minSize * aspectRatio
          }
        }

        canvas.width = Math.round(displayWidth)
        canvas.height = Math.round(displayHeight)

        // Debug logging
        console.log(`Canvas sizing:
        Original image: ${bgImg.width}x${bgImg.height}
        Container space: ${containerWidth.toFixed(0)}x${containerHeight.toFixed(
          0
        )}
        Max display: ${maxDisplayWidth.toFixed(0)}x${maxDisplayHeight.toFixed(
          0
        )}
        Final canvas: ${canvas.width}x${canvas.height}
        Aspect ratio: ${aspectRatio.toFixed(2)}`)

        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height)

        ctx.save()
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        // Apply 3D tilt effects (Pro feature from fix folder)
        if (hasPremiumAccess && (tiltX !== 0 || tiltY !== 0)) {
          const centerX = canvas.width / 2
          const centerY = canvas.height / 2

          // Move to center for transformation
          ctx.translate(centerX, centerY)

          // Apply 3D perspective transformation
          const tiltXRad = (tiltX * Math.PI) / 180
          const tiltYRad = (tiltY * Math.PI) / 180

          // Create 3D transformation matrix
          const cosX = Math.cos(tiltXRad)
          const sinX = Math.sin(tiltXRad)
          const cosY = Math.cos(tiltYRad)
          const sinY = Math.sin(tiltYRad)

          // Apply perspective transformation
          ctx.transform(cosY, sinX * sinY, -sinY, cosX * cosY, 0, 0)

          // Move back from center
          ctx.translate(-centerX, -centerY)
        }

        // Enhanced font mapping with fallbacks and better support
        const fontMap: Record<string, string> = {
          // Core fonts (pre-loaded via Next.js)
          Inter: 'var(--font-inter), Inter, system-ui, sans-serif',
          Roboto: 'var(--font-roboto), Roboto, sans-serif',
          'Open Sans': 'var(--font-open-sans), "Open Sans", sans-serif',
          Montserrat: 'var(--font-montserrat), Montserrat, sans-serif',
          Poppins: 'var(--font-poppins), Poppins, sans-serif',
          Lato: 'var(--font-lato), Lato, sans-serif',
          'Playfair Display':
            'var(--font-playfair-display), "Playfair Display", serif',
          Merriweather: 'var(--font-merriweather), Merriweather, serif',
          Oswald: 'var(--font-oswald), Oswald, sans-serif',
          'Bebas Neue': 'var(--font-bebas-neue), "Bebas Neue", sans-serif',
          'Dancing Script':
            'var(--font-dancing-script), "Dancing Script", cursive',
          Pacifico: 'var(--font-pacifico), Pacifico, cursive',
          'Fira Code': 'var(--font-fira-code), "Fira Code", monospace',

          // Google Fonts (dynamically loaded)
          'Source Sans 3': '"Source Sans 3", sans-serif',
          Nunito: 'Nunito, sans-serif',
          Raleway: 'Raleway, sans-serif',
          'Work Sans': '"Work Sans", sans-serif',
          Rubik: 'Rubik, sans-serif',
          'Fira Sans': '"Fira Sans", sans-serif',
          'PT Sans': '"PT Sans", sans-serif',
          Ubuntu: 'Ubuntu, sans-serif',
          'Noto Sans': '"Noto Sans", sans-serif',
          Barlow: 'Barlow, sans-serif',
          'DM Sans': '"DM Sans", sans-serif',
          Manrope: 'Manrope, sans-serif',
          Quicksand: 'Quicksand, sans-serif',
          Karla: 'Karla, sans-serif',
          Oxygen: 'Oxygen, sans-serif',
          Hind: 'Hind, sans-serif',

          // Serif fonts
          Georgia: 'Georgia, serif',
          'Times New Roman': '"Times New Roman", serif',
          'Crimson Text': '"Crimson Text", serif',
          'Libre Baskerville': '"Libre Baskerville", serif',
          'Cormorant Garamond': '"Cormorant Garamond", serif',
          'EB Garamond': '"EB Garamond", serif',
          Lora: 'Lora, serif',
          'PT Serif': '"PT Serif", serif',
          Bitter: 'Bitter, serif',
          Domine: 'Domine, serif',

          // Display fonts
          Anton: 'Anton, sans-serif',
          'Fjalla One': '"Fjalla One", sans-serif',
          'Russo One': '"Russo One", sans-serif',
          Bangers: 'Bangers, cursive',
          Fredoka: '"Fredoka", sans-serif',
          Righteous: 'Righteous, cursive',
          Bungee: 'Bungee, cursive',
          'Alfa Slab One': '"Alfa Slab One", cursive',
          'Archivo Black': '"Archivo Black", sans-serif',
          'Black Ops One': '"Black Ops One", cursive',
          Orbitron: 'Orbitron, sans-serif',
          'Exo 2': '"Exo 2", sans-serif',

          // Script fonts
          'Great Vibes': '"Great Vibes", cursive',
          Satisfy: 'Satisfy, cursive',
          'Kaushan Script': '"Kaushan Script", cursive',
          Lobster: 'Lobster, cursive',
          Caveat: 'Caveat, cursive',
          'Amatic SC': '"Amatic SC", cursive',
          'Indie Flower': '"Indie Flower", cursive',
          'Shadows Into Light': '"Shadows Into Light", cursive',
          Courgette: 'Courgette, cursive',
          Allura: 'Allura, cursive',

          // Monospace fonts
          'JetBrains Mono': '"JetBrains Mono", monospace',
          'Source Code Pro': '"Source Code Pro", monospace',
          'Courier New': '"Courier New", monospace',
          'Space Mono': '"Space Mono", monospace',
          'Roboto Mono': '"Roboto Mono", monospace',
        }

        // Enhanced font handling with fallbacks and debugging
        const fontFamily =
          fontMap[font] || 'var(--font-inter), Inter, system-ui, sans-serif'

        console.log(`🎨 CANVAS FONT DEBUG: Selected font: "${font}"`)
        console.log(`🎨 CANVAS FONT DEBUG: Font family: "${fontFamily}"`)
        console.log(
          `🎨 CANVAS FONT DEBUG: Font exists in map: ${!!fontMap[font]}`
        )

        let baseFontSize = customFontSize

        // Improved scaling for all resolutions - scale based on the larger dimension
        const maxDimension = Math.max(canvas.width, canvas.height)
        const scaleFactor = maxDimension / 1000 // Base on 1000px as reference
        let fontSize = baseFontSize * Math.max(scaleFactor, 0.3) // Lower minimum for very small images

        const fontStyleString = fontStyle === 'italic' ? 'italic ' : ''

        // PROPER FONT LOADING CHECK - Wait for font to be ready
        const systemFonts = [
          'Georgia',
          'Times New Roman',
          'Courier New',
          'Arial',
          'Helvetica',
        ]
        const preloadedFonts = [
          'Inter',
          'Roboto',
          'Open Sans',
          'Montserrat',
          'Poppins',
          'Lato',
        ]

        let fontReady = true
        if (!systemFonts.includes(font) && !preloadedFonts.includes(font)) {
          // For Google Fonts, ensure they're loaded before using
          try {
            if (document.fonts && document.fonts.load) {
              // Force load the font if not already loaded
              await document.fonts.load(`16px "${font}"`)
              console.log(`✅ CANVAS FONT DEBUG: Font force-loaded: ${font}`)
            }

            // Check if font is now available
            if (document.fonts && document.fonts.check(`16px "${font}"`)) {
              console.log(
                `✅ CANVAS FONT DEBUG: Font verified available: ${font}`
              )
              fontReady = true
            } else {
              console.log(
                `⚠️ CANVAS FONT DEBUG: Font still not available: ${font}`
              )
              fontReady = false
            }
          } catch (error) {
            console.warn(
              `⚠️ CANVAS FONT DEBUG: Font load failed: ${font}`,
              error
            )
            fontReady = false
          }
        }

        // Font will be loaded by FontSelector - just use it directly

        // Try to set font with error handling and detailed debugging
        const fontString = `${fontStyleString}${fontWeight} ${fontSize}px ${fontFamily}`
        console.log(
          `🎨 CANVAS FONT DEBUG: Setting font string: "${fontString}" (ready: ${fontReady})`
        )

        try {
          ctx.font = fontString

          // Verify font was applied correctly
          const appliedFont = ctx.font
          console.log(`🎨 CANVAS FONT DEBUG: Applied font: "${appliedFont}"`)

          // Check if the font actually changed from default
          const testFont = `${fontStyleString}${fontWeight} ${fontSize}px serif`
          ctx.font = testFont
          const defaultFont = ctx.font
          ctx.font = fontString
          const finalFont = ctx.font

          const systemFonts = [
            'Georgia',
            'Times New Roman',
            'Courier New',
            'Arial',
            'Helvetica',
          ]
          if (finalFont === defaultFont && !systemFonts.includes(font)) {
            console.warn(`⚠️ Font may not be available: ${font}`)
            console.warn(`⚠️ Expected: ${fontString}`)
            console.warn(`⚠️ Got: ${appliedFont}`)
            // Fallback to a safe font
            const fallbackFont = `${fontStyleString}${fontWeight} ${fontSize}px Inter, system-ui, sans-serif`
            ctx.font = fallbackFont
            console.log(
              `🔄 CANVAS FONT DEBUG: Using fallback: "${fallbackFont}"`
            )
          } else {
            console.log(`✅ CANVAS FONT DEBUG: Font applied successfully!`)
          }
        } catch (error) {
          console.error(`❌ Error setting font ${font}:`, error)
          // Use safe fallback
          const fallbackFont = `${fontStyleString}${fontWeight} ${fontSize}px Inter, system-ui, sans-serif`
          ctx.font = fallbackFont
          console.log(`🔄 CANVAS FONT DEBUG: Error fallback: "${fallbackFont}"`)
        }

        const measuredWidth = ctx.measureText(text).width
        const targetWidth = canvas.width * 0.9
        if (measuredWidth > targetWidth) {
          fontSize *= targetWidth / measuredWidth
          ctx.font = `${fontStyleString}${fontWeight} ${fontSize}px ${fontFamily}`
        }

        const x = (canvas.width * textPosition.x) / 100
        const y = (canvas.height * textPosition.y) / 100

        // Apply text effects
        applyTextEffect(
          ctx,
          textEffect,
          textColor,
          textOpacity,
          y,
          fontSize,
          glowColor
        )

        const textMetrics = ctx.measureText(text)
        const boundsWidth = textMetrics.width
        const boundsHeight = fontSize

        setTextBounds({
          x: x - boundsWidth / 2,
          y: y - boundsHeight / 2,
          width: boundsWidth,
          height: boundsHeight,
        })

        // Enhanced text rendering with letter spacing support (Pro feature from fix folder)
        const renderTextWithLetterSpacing = (
          ctx: CanvasRenderingContext2D,
          text: string,
          x: number,
          y: number,
          letterSpacing: number
        ) => {
          if (letterSpacing === 0 || !hasPremiumAccess) {
            // Standard rendering for free users or when letter spacing is 0
            if (textEffect === 'outline') {
              ctx.strokeText(text, x, y)
            } else {
              ctx.fillText(text, x, y)
            }
            return
          }

          // Pro feature: Render with letter spacing (exact implementation from fix folder)
          const chars = text.split('')
          let currentX = 0

          // Calculate total width to center properly
          const totalWidth = chars.reduce((width, char, i) => {
            const charWidth = ctx.measureText(char).width
            return (
              width + charWidth + (i < chars.length - 1 ? letterSpacing : 0)
            )
          }, 0)

          // Start position (centered)
          currentX = x - totalWidth / 2

          // Draw each character with spacing
          chars.forEach((char) => {
            const charWidth = ctx.measureText(char).width
            if (textEffect === 'outline') {
              ctx.strokeText(char, currentX + charWidth / 2, y)
            } else {
              ctx.fillText(char, currentX + charWidth / 2, y)
            }
            currentX += charWidth + letterSpacing
          })
        }

        if (textEffect === 'liquid-glass') {
          // Use special liquid glass rendering
          if (textRotation !== 0) {
            ctx.translate(x, y)
            ctx.rotate((textRotation * Math.PI) / 180)
            renderLiquidGlass(
              ctx,
              text,
              0,
              0,
              fontSize,
              textOpacity,
              letterSpacing
            )
            ctx.rotate((-textRotation * Math.PI) / 180)
            ctx.translate(-x, -y)
          } else {
            renderLiquidGlass(
              ctx,
              text,
              x,
              y,
              fontSize,
              textOpacity,
              letterSpacing
            )
          }
        } else {
          // Use normal text rendering
          if (textRotation !== 0) {
            ctx.translate(x, y)
            ctx.rotate((textRotation * Math.PI) / 180)
            renderTextWithLetterSpacing(ctx, text, 0, 0, letterSpacing)
            ctx.rotate((-textRotation * Math.PI) / 180)
            ctx.translate(-x, -y)
          } else {
            renderTextWithLetterSpacing(ctx, text, x, y, letterSpacing)
          }
        }

        ctx.restore()

        const fgImg = new Image()
        fgImg.onload = () => {
          try {
            ctx.drawImage(fgImg, 0, 0, canvas.width, canvas.height)

            // Add watermark for free users in preview
            addWatermark(ctx, canvas)
          } catch (error) {
            console.error('❌ Error drawing foreground image:', error)
          }
        }
        fgImg.onerror = (error) => {
          console.error('❌ Failed to load processed image:', error)
        }
        fgImg.src = processedImageSrc
      }

      bgImg.onerror = (error) => {
        console.error('❌ Failed to load background image:', error)
      }
      bgImg.src = imageSrc
    } catch (error) {
      console.error('❌ Error in drawCompositeImage:', error)
    }
  }, [
    canvasReady,
    imageSrc,
    processedImageSrc,
    text,
    font,
    textPosition,
    customFontSize,
    textRotation,
    textColor,
    textOpacity,
    fontWeight,
    fontStyle,
    textDecoration,
    letterSpacing,
    tiltX,
    tiltY,
    textEffect,
    glowColor,
    logoImage,
    hasPremiumAccess,
  ])

  // Draw composite image on canvas
  useEffect(() => {
    if (canvasReady) {
      drawCompositeImage().catch((error) => {
        console.error('❌ Error in drawCompositeImage:', error)
      })
    }
  }, [drawCompositeImage, canvasReady])

  // Increment usage when first text-behind effect is generated
  useEffect(() => {
    const shouldIncrementUsage =
      canvasReady &&
      imageSrc &&
      processedImageSrc &&
      text.trim() &&
      !hasIncrementedUsage

    if (shouldIncrementUsage) {
      console.log(
        '🎯 First text-behind effect generated! Incrementing usage securely...'
      )

      // Use the secure UserContext increment function
      incrementUsage().then((success) => {
        if (success) {
          setHasIncrementedUsage(true)
          setShowUsageNotification(true)
          setTimeout(() => setShowUsageNotification(false), 3000)
          console.log('✅ Usage incremented successfully via UserContext')

          // Refresh user profile to ensure dashboard updates immediately
          setTimeout(() => {
            refreshUserProfile()
          }, 500)
        } else {
          console.warn('⚠️ Failed to increment usage via UserContext')
          // Check if it's a limit issue and show modal
          if (hasReachedLimit && !hasPremiumAccess) {
            setShowLimitReachedModal(true)
          }
        }
      })
    }
  }, [
    canvasReady,
    imageSrc,
    processedImageSrc,
    text,
    hasIncrementedUsage,
    incrementUsage,
    refreshUserProfile,
    hasReachedLimit,
    hasPremiumAccess,
  ])

  // Auto-save project when downloading
  const autoSaveOnDownload = async () => {
    if (!user) {
      console.log('❌ Auto-save skipped: No user logged in')
      return null
    }

    if (!imageSrc) {
      console.log('❌ Auto-save skipped: No image uploaded')
      return null
    }

    if (!text.trim()) {
      console.log('❌ Auto-save skipped: No text content')
      return null
    }

    try {
      console.log('💾 Starting auto-save on download...')
      console.log('User ID:', user.id)
      console.log('Text:', text.substring(0, 30) + '...')

      // Sync user with Supabase if needed
      console.log('🔄 Syncing user with Supabase...')
      await syncUserWithSupabase(user)

      // Create project data with proper structure
      const projectData = {
        title: `${text.substring(0, 30).trim()}${
          text.length > 30 ? '...' : ''
        } - Text Behind Effect`,
        description: `Text behind effect created with "${text.substring(
          0,
          100
        )}${text.length > 100 ? '...' : ''}" - Auto-saved on download`,
        image_url: imageSrc, // Use the actual image URL
        overlay_config: {
          text,
          fontSize: customFontSize,
          fontFamily: font,
          color: textColor,
          position: textPosition,
          rotation: textRotation,
          opacity: textOpacity,
          fontWeight,
          fontStyle,
          textDecoration,
          letterSpacing,
          tiltX,
          tiltY,
        },
        tags: ['auto-saved', 'text-behind-effect', 'download'],
        is_public: false,
      }

      console.log('📝 Project data prepared:', projectData)

      // Save project to database
      console.log('💾 Saving to database...')
      const project = await createProject(user.id, projectData)

      if (project) {
        console.log('✅ Project auto-saved successfully! ID:', project.id)

        // Generate the final image with text overlay (same as save button)
        console.log('📸 Generating final image for auto-save...')
        if (canvasRef.current) {
          const generatedImageDataUrl = canvasRef.current.toDataURL(
            'image/png',
            0.95
          )

          // Save the generated image to storage (same as save button)
          console.log('💾 Uploading generated image to storage...')
          const storageResult = await saveGeneratedImageToStorage(
            project.id,
            generatedImageDataUrl,
            user.id,
            {
              title: projectData.title,
              description: projectData.description,
              overlayConfig: projectData.overlay_config,
            }
          )

          if (storageResult) {
            console.log('✅ Generated image saved to storage:', storageResult)
            console.log('🔄 Final project image URL:', storageResult.imageUrl)
          } else {
            console.warn('⚠️ Project auto-saved but image upload failed')
          }
        }

        // Show success notification and mark as auto-saved
        setShowAutoSaveNotification(true)
        setHasBeenAutoSaved(true)
        setTimeout(() => setShowAutoSaveNotification(false), 4000)

        return project
      } else {
        console.error('❌ Project creation returned null')
      }
    } catch (error) {
      console.error('❌ Auto-save on download failed:', error)
      console.error('Error details:', error)
    }

    return null
  }

  // Load logo image on component mount
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setLogoImage(img)
    }
    img.onerror = () => {
      console.warn('Failed to load logo image for watermark')
    }
    img.src = '/ionc.png'
  }, [])

  // Add watermark for free users - NO BACKGROUND, REAL LOGO (ionc.png), BEAUTIFUL FONTS
  const addWatermark = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ) => {
    // Only add watermark for free users
    if (hasPremiumAccess) return

    ctx.save()

    // Watermark positioning - bottom right corner
    const baseSize = Math.min(canvas.width, canvas.height) * 0.08 // 8% of smallest dimension
    const logoSize = baseSize
    const padding = baseSize * 0.3
    const x = canvas.width - logoSize - padding
    const y = canvas.height - logoSize - padding

    // REAL IMPRINTLY LOGO - Use preloaded ionc.png
    const logoX = x
    const logoY = y

    // Beautiful text with mixed fonts - RENDER TEXT FIRST
    const textStartX = logoX + logoSize + padding * 0.8
    const textCenterY = logoY + logoSize / 2

    // "Created with" in elegant script font
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.font = `italic ${
      baseSize * 0.35
    }px "Dancing Script", "Brush Script MT", cursive`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'

    // Add subtle text shadow for readability
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
    ctx.shadowBlur = baseSize * 0.1
    ctx.shadowOffsetX = 1
    ctx.shadowOffsetY = 1

    ctx.fillText('Created with', textStartX, textCenterY - baseSize * 0.25)

    // "Imprintly" in bold modern font with emerald color
    ctx.fillStyle = '#10b981' // emerald-500
    ctx.font = `bold ${baseSize * 0.5}px "Inter", "Helvetica Neue", sans-serif`
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)'
    ctx.shadowBlur = baseSize * 0.08
    ctx.shadowOffsetX = 1
    ctx.shadowOffsetY = 1

    ctx.fillText('Imprintly', textStartX, textCenterY + baseSize * 0.15)

    // Add subtle decorative element
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(textStartX, textCenterY - baseSize * 0.05)
    ctx.lineTo(
      textStartX + ctx.measureText('Imprintly').width,
      textCenterY - baseSize * 0.05
    )
    ctx.stroke()

    // Reset shadow and styles for logo
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    // NOW RENDER THE LOGO
    if (logoImage) {
      // Add glow effect around the logo
      ctx.shadowColor = 'rgba(16, 185, 129, 0.6)'
      ctx.shadowBlur = logoSize * 0.2
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      // Draw the actual logo image
      ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize)
    } else {
      // Fallback: Simple gradient circle if logo hasn't loaded
      const logoGradient = ctx.createLinearGradient(
        logoX,
        logoY,
        logoX + logoSize,
        logoY + logoSize
      )
      logoGradient.addColorStop(0, '#10b981')
      logoGradient.addColorStop(1, '#059669')

      ctx.fillStyle = logoGradient
      ctx.beginPath()
      ctx.arc(
        logoX + logoSize / 2,
        logoY + logoSize / 2,
        logoSize / 2,
        0,
        Math.PI * 2
      )
      ctx.fill()

      // Add "I" letter as fallback
      ctx.fillStyle = 'white'
      ctx.font = `bold ${logoSize * 0.6}px "Inter", sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('I', logoX + logoSize / 2, logoY + logoSize / 2)
    }

    ctx.restore()
  }

  // Handle download with compression
  const handleDownload = async (
    format: 'png' | 'jpeg' = 'jpeg',
    quality: number = 0.8,
    maxWidth: number = 1920
  ) => {
    if (!canvasRef.current || !imageSrc || !processedImageSrc) return

    // Start download progress
    setIsDownloading(true)
    setDownloadProgress(0)

    try {
      // Progress: 10% - Starting canvas creation
      setDownloadProgress(10)

      // Create a new canvas for the high-quality output using original image dimensions
      const outputCanvas = document.createElement('canvas')
      const outputCtx = outputCanvas.getContext('2d')
      if (!outputCtx) {
        setIsDownloading(false)
        return
      }

      // Progress: 20% - Loading background image
      setDownloadProgress(20)

      const bgImg = new Image()
      bgImg.onload = async () => {
        // Progress: 40% - Background loaded, calculating dimensions
        setDownloadProgress(40)

        // Calculate optimal dimensions while maintaining aspect ratio
        const aspectRatio = bgImg.width / bgImg.height
        let outputWidth = Math.min(bgImg.width, maxWidth)
        let outputHeight = outputWidth / aspectRatio

        // If height is still too large, scale down based on height
        const maxHeight = 1080
        if (outputHeight > maxHeight) {
          outputHeight = maxHeight
          outputWidth = outputHeight * aspectRatio
        }

        outputCanvas.width = outputWidth
        outputCanvas.height = outputHeight

        // Progress: 50% - Drawing background
        setDownloadProgress(50)

        // Draw the background image at full quality
        outputCtx.drawImage(bgImg, 0, 0, outputWidth, outputHeight)

        // Progress: 60% - Rendering text
        setDownloadProgress(60)

        // Redraw text with proper scaling for high-quality output
        outputCtx.save()
        outputCtx.textAlign = 'center'
        outputCtx.textBaseline = 'middle'

        // Apply 3D tilt effects for download (Pro feature from fix folder)
        if (hasPremiumAccess && (tiltX !== 0 || tiltY !== 0)) {
          const centerX = outputWidth / 2
          const centerY = outputHeight / 2

          // Move to center for transformation
          outputCtx.translate(centerX, centerY)

          // Apply 3D perspective transformation
          const tiltXRad = (tiltX * Math.PI) / 180
          const tiltYRad = (tiltY * Math.PI) / 180

          // Create 3D transformation matrix
          const cosX = Math.cos(tiltXRad)
          const sinX = Math.sin(tiltXRad)
          const cosY = Math.cos(tiltYRad)
          const sinY = Math.sin(tiltYRad)

          // Apply perspective transformation
          outputCtx.transform(cosY, sinX * sinY, -sinY, cosX * cosY, 0, 0)

          // Move back from center
          outputCtx.translate(-centerX, -centerY)
        }

        // Use the same enhanced font mapping for consistent rendering
        const fontMap: Record<string, string> = {
          // Core fonts (pre-loaded via Next.js)
          Inter: 'var(--font-inter), Inter, system-ui, sans-serif',
          Roboto: 'var(--font-roboto), Roboto, sans-serif',
          'Open Sans': 'var(--font-open-sans), "Open Sans", sans-serif',
          Montserrat: 'var(--font-montserrat), Montserrat, sans-serif',
          Poppins: 'var(--font-poppins), Poppins, sans-serif',
          Lato: 'var(--font-lato), Lato, sans-serif',
          'Playfair Display':
            'var(--font-playfair-display), "Playfair Display", serif',
          Merriweather: 'var(--font-merriweather), Merriweather, serif',
          Oswald: 'var(--font-oswald), Oswald, sans-serif',
          'Bebas Neue': 'var(--font-bebas-neue), "Bebas Neue", sans-serif',
          'Dancing Script':
            'var(--font-dancing-script), "Dancing Script", cursive',
          Pacifico: 'var(--font-pacifico), Pacifico, cursive',
          'Fira Code': 'var(--font-fira-code), "Fira Code", monospace',

          // Google Fonts (dynamically loaded)
          'Source Sans 3': '"Source Sans 3", sans-serif',
          Nunito: 'Nunito, sans-serif',
          Raleway: 'Raleway, sans-serif',
          'Work Sans': '"Work Sans", sans-serif',
          Rubik: 'Rubik, sans-serif',
          'Fira Sans': '"Fira Sans", sans-serif',
          'PT Sans': '"PT Sans", sans-serif',
          Ubuntu: 'Ubuntu, sans-serif',
          'Noto Sans': '"Noto Sans", sans-serif',
          Barlow: 'Barlow, sans-serif',
          'DM Sans': '"DM Sans", sans-serif',
          Manrope: 'Manrope, sans-serif',
          Quicksand: 'Quicksand, sans-serif',
          Karla: 'Karla, sans-serif',
          Oxygen: 'Oxygen, sans-serif',
          Hind: 'Hind, sans-serif',

          // Serif fonts
          Georgia: 'Georgia, serif',
          'Times New Roman': '"Times New Roman", serif',
          'Crimson Text': '"Crimson Text", serif',
          'Libre Baskerville': '"Libre Baskerville", serif',
          'Cormorant Garamond': '"Cormorant Garamond", serif',
          'EB Garamond': '"EB Garamond", serif',
          Lora: 'Lora, serif',
          'PT Serif': '"PT Serif", serif',
          Bitter: 'Bitter, serif',
          Domine: 'Domine, serif',

          // Display fonts
          Anton: 'Anton, sans-serif',
          'Fjalla One': '"Fjalla One", sans-serif',
          'Russo One': '"Russo One", sans-serif',
          Bangers: 'Bangers, cursive',
          Fredoka: '"Fredoka", sans-serif',
          Righteous: 'Righteous, cursive',
          Bungee: 'Bungee, cursive',
          'Alfa Slab One': '"Alfa Slab One", cursive',
          'Archivo Black': '"Archivo Black", sans-serif',
          'Black Ops One': '"Black Ops One", cursive',
          Orbitron: 'Orbitron, sans-serif',
          'Exo 2': '"Exo 2", sans-serif',

          // Script fonts
          'Great Vibes': '"Great Vibes", cursive',
          Satisfy: 'Satisfy, cursive',
          'Kaushan Script': '"Kaushan Script", cursive',
          Lobster: 'Lobster, cursive',
          Caveat: 'Caveat, cursive',
          'Amatic SC': '"Amatic SC", cursive',
          'Indie Flower': '"Indie Flower", cursive',
          'Shadows Into Light': '"Shadows Into Light", cursive',
          Courgette: 'Courgette, cursive',
          Allura: 'Allura, cursive',

          // Monospace fonts
          'JetBrains Mono': '"JetBrains Mono", monospace',
          'Source Code Pro': '"Source Code Pro", monospace',
          'Courier New': '"Courier New", monospace',
          'Space Mono': '"Space Mono", monospace',
          'Roboto Mono': '"Roboto Mono", monospace',
        }

        // Enhanced font handling with fallbacks for download
        const fontFamily =
          fontMap[font] || 'var(--font-inter), Inter, system-ui, sans-serif'
        let baseFontSize = customFontSize

        // Scale font size for output resolution
        const maxDimension = Math.max(outputWidth, outputHeight)
        const scaleFactor = maxDimension / 1000
        let fontSize = baseFontSize * Math.max(scaleFactor, 0.3)

        const fontStyleString = fontStyle === 'italic' ? 'italic ' : ''

        // Font will be loaded by FontSelector - just use it directly for download

        // Try to set font with error handling for download
        try {
          outputCtx.font = `${fontStyleString}${fontWeight} ${fontSize}px ${fontFamily}`

          // Verify font was applied correctly
          const appliedFont = outputCtx.font
          if (
            !appliedFont.includes(fontWeight) &&
            !appliedFont.includes(fontSize.toString())
          ) {
            console.warn(
              `⚠️ Download font may not have applied correctly: ${font}`
            )
            // Fallback to a safe font
            outputCtx.font = `${fontStyleString}${fontWeight} ${fontSize}px Inter, system-ui, sans-serif`
          }
        } catch (error) {
          console.error(`❌ Error setting download font ${font}:`, error)
          // Use safe fallback
          outputCtx.font = `${fontStyleString}${fontWeight} ${fontSize}px Inter, system-ui, sans-serif`
        }

        const measuredWidth = outputCtx.measureText(text).width
        const targetWidth = outputWidth * 0.9
        if (measuredWidth > targetWidth) {
          fontSize *= targetWidth / measuredWidth
          outputCtx.font = `${fontStyleString}${fontWeight} ${fontSize}px ${fontFamily}`
        }

        const x = (outputWidth * textPosition.x) / 100
        const y = (outputHeight * textPosition.y) / 100

        // Apply text effects for download
        applyTextEffect(
          outputCtx,
          textEffect,
          textColor,
          textOpacity,
          y,
          fontSize,
          glowColor
        )

        // Enhanced download text rendering with letter spacing support (Pro feature from fix folder)
        const renderDownloadTextWithLetterSpacing = (
          ctx: CanvasRenderingContext2D,
          text: string,
          x: number,
          y: number,
          letterSpacing: number
        ) => {
          if (letterSpacing === 0 || !hasPremiumAccess) {
            // Standard rendering for free users or when letter spacing is 0
            if (textEffect === 'outline') {
              ctx.strokeText(text, x, y)
            } else {
              ctx.fillText(text, x, y)
            }
            return
          }

          // Pro feature: Render with letter spacing (exact implementation from fix folder)
          const chars = text.split('')
          let currentX = 0

          // Calculate total width to center properly
          const totalWidth = chars.reduce((width, char, i) => {
            const charWidth = ctx.measureText(char).width
            return (
              width + charWidth + (i < chars.length - 1 ? letterSpacing : 0)
            )
          }, 0)

          // Start position (centered)
          currentX = x - totalWidth / 2

          // Draw each character with spacing
          chars.forEach((char) => {
            const charWidth = ctx.measureText(char).width
            if (textEffect === 'outline') {
              ctx.strokeText(char, currentX + charWidth / 2, y)
            } else {
              ctx.fillText(char, currentX + charWidth / 2, y)
            }
            currentX += charWidth + letterSpacing
          })
        }

        if (textEffect === 'liquid-glass') {
          // Use special liquid glass rendering for download
          if (textRotation !== 0) {
            outputCtx.translate(x, y)
            outputCtx.rotate((textRotation * Math.PI) / 180)
            renderLiquidGlass(
              outputCtx,
              text,
              0,
              0,
              fontSize,
              textOpacity,
              letterSpacing
            )
            outputCtx.rotate((-textRotation * Math.PI) / 180)
            outputCtx.translate(-x, -y)
          } else {
            renderLiquidGlass(
              outputCtx,
              text,
              x,
              y,
              fontSize,
              textOpacity,
              letterSpacing
            )
          }
        } else {
          // Use normal text rendering for download
          if (textRotation !== 0) {
            outputCtx.translate(x, y)
            outputCtx.rotate((textRotation * Math.PI) / 180)
            renderDownloadTextWithLetterSpacing(
              outputCtx,
              text,
              0,
              0,
              letterSpacing
            )
            outputCtx.rotate((-textRotation * Math.PI) / 180)
            outputCtx.translate(-x, -y)
          } else {
            renderDownloadTextWithLetterSpacing(
              outputCtx,
              text,
              x,
              y,
              letterSpacing
            )
          }
        }

        outputCtx.restore()

        // Progress: 70% - Loading foreground image
        setDownloadProgress(70)

        // Draw the foreground image
        const fgImg = new Image()
        fgImg.onload = async () => {
          // Progress: 80% - Drawing foreground
          setDownloadProgress(80)

          outputCtx.drawImage(fgImg, 0, 0, outputWidth, outputHeight)

          // Progress: 82% - Adding watermark for free users
          setDownloadProgress(82)

          // Add watermark for free users only
          addWatermark(outputCtx, outputCanvas)

          // Progress: 85% - Converting to image format
          setDownloadProgress(85)

          // Convert to blob with compression
          const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'
          const dataURL = outputCanvas.toDataURL(mimeType, quality)

          // Calculate approximate file size
          const base64Length = dataURL.split(',')[1].length
          const fileSizeKB = Math.round((base64Length * 0.75) / 1024)

          console.log(
            `Download: ${outputWidth}x${outputHeight}, ${format.toUpperCase()}, ~${fileSizeKB}KB`
          )

          // Progress: 90% - Auto-saving project
          setDownloadProgress(90)

          // Auto-save project AFTER image is ready
          console.log('💾 Starting auto-save on download...')
          await autoSaveOnDownload()

          // Progress: 95% - Preparing download
          setDownloadProgress(95)

          const link = document.createElement('a')
          link.download = `imprintly-${Date.now()}.${format}`
          link.href = dataURL
          link.click()

          // Progress: 100% - Download complete
          setDownloadProgress(100)

          console.log('✅ Download completed with auto-save!')

          // Reset download state after a short delay
          setTimeout(() => {
            setIsDownloading(false)
            setDownloadProgress(0)
          }, 1000)
        }
        fgImg.src = processedImageSrc
      }
      bgImg.src = imageSrc
    } catch (error) {
      console.error('❌ Download failed:', error)
      setIsDownloading(false)
      setDownloadProgress(0)
      alert('Download failed. Please try again.')
    }
  }

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const mouseX = (e.clientX - rect.left) * scaleX
    const mouseY = (e.clientY - rect.top) * scaleY

    if (
      mouseX >= textBounds.x &&
      mouseX <= textBounds.x + textBounds.width &&
      mouseY >= textBounds.y &&
      mouseY <= textBounds.y + textBounds.height
    ) {
      setTextSelected(true)
      setIsDragging(true)
      setDragStart({ x: mouseX, y: mouseY })
    } else {
      setTextSelected(false)
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const mouseX = (e.clientX - rect.left) * scaleX
    const mouseY = (e.clientY - rect.top) * scaleY

    const deltaX = mouseX - dragStart.x
    const deltaY = mouseY - dragStart.y

    const newX = Math.max(
      0,
      Math.min(100, textPosition.x + (deltaX / canvas.width) * 100)
    )
    const newY = Math.max(
      0,
      Math.min(100, textPosition.y + (deltaY / canvas.height) * 100)
    )

    setTextPosition({ x: newX, y: newY })
    setDragStart({ x: mouseX, y: mouseY })
  }

  const handleCanvasMouseUp = () => {
    setIsDragging(false)
  }

  // Touch event handlers for mobile support
  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const touch = e.touches[0]
    const touchX = (touch.clientX - rect.left) * scaleX
    const touchY = (touch.clientY - rect.top) * scaleY

    if (
      touchX >= textBounds.x &&
      touchX <= textBounds.x + textBounds.width &&
      touchY >= textBounds.y &&
      touchY <= textBounds.y + textBounds.height
    ) {
      setTextSelected(true)
      setIsDragging(true)
      setDragStart({ x: touchX, y: touchY })
    } else {
      setTextSelected(false)
    }
  }

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDragging || !canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const touch = e.touches[0]
    const touchX = (touch.clientX - rect.left) * scaleX
    const touchY = (touch.clientY - rect.top) * scaleY

    const deltaX = touchX - dragStart.x
    const deltaY = touchY - dragStart.y

    const newX = Math.max(
      0,
      Math.min(100, textPosition.x + (deltaX / canvas.width) * 100)
    )
    const newY = Math.max(
      0,
      Math.min(100, textPosition.y + (deltaY / canvas.height) * 100)
    )

    setTextPosition({ x: newX, y: newY })
    setDragStart({ x: touchX, y: touchY })
  }

  const handleCanvasTouchEnd = () => {
    setIsDragging(false)
  }

  const handleCanvasDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const mouseX = (e.clientX - rect.left) * scaleX
    const mouseY = (e.clientY - rect.top) * scaleY

    if (
      mouseX >= textBounds.x &&
      mouseX <= textBounds.x + textBounds.width &&
      mouseY >= textBounds.y &&
      mouseY <= textBounds.y + textBounds.height
    ) {
      setIsEditingText(true)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!textSelected) return

    const step = e.shiftKey ? 10 : 1

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        setTextPosition((prev) => ({ ...prev, x: Math.max(0, prev.x - step) }))
        break
      case 'ArrowRight':
        e.preventDefault()
        setTextPosition((prev) => ({
          ...prev,
          x: Math.min(100, prev.x + step),
        }))
        break
      case 'ArrowUp':
        e.preventDefault()
        setTextPosition((prev) => ({ ...prev, y: Math.max(0, prev.y - step) }))
        break
      case 'ArrowDown':
        e.preventDefault()
        setTextPosition((prev) => ({
          ...prev,
          y: Math.min(100, prev.y + step),
        }))
        break
      case 'Delete':
      case 'Backspace':
        e.preventDefault()
        setText('')
        break
    }
  }

  const handleTextSave = (newText: string) => {
    setText(newText)
    setIsEditingText(false)
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [textSelected, textPosition])

  // Handle window resize to recalculate canvas size
  useEffect(() => {
    const handleResize = () => {
      if (canvasReady) {
        drawCompositeImage()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [canvasReady, drawCompositeImage])

  const handleReset = () => {
    setImageSrc(null)
    setProcessedImageSrc(null)
    setCanvasReady(false)
    setText('Your Text Here')
    setFont('Inter')
    setTextPosition({ x: 50, y: 50 })
    setCustomFontSize(80)
    setTextRotation(0)
    setTextSelected(false)
    setIsDragging(false)
    setIsEditingText(false)
    setShowDownloadModal(false)
    setHasBeenAutoSaved(false) // Reset auto-save status
    setTextBounds({ x: 0, y: 0, width: 0, height: 0 })
    setTextColor('#FFFFFF')
    setTextOpacity(1)
    setFontWeight('700')
    setFontStyle('normal')
    setTextDecoration('none')
    setTextEffect('none')
    setGlowColor('#00ffff')
  }

  const handleSaveProject = async () => {
    if (!user || !imageSrc || !canvasRef.current) {
      alert('Please sign in and upload an image first')
      return
    }

    setSaving(true)

    try {
      console.log('Starting project save...')
      console.log('User ID:', user.id)
      console.log('Image source:', imageSrc ? 'Available' : 'Missing')

      // First, ensure user is synced to Supabase
      console.log('🔄 Syncing user to Supabase...')
      const syncedUser = await syncUserWithSupabase(user)
      console.log('✅ User sync result:', syncedUser ? 'Success' : 'Failed')

      const projectTitle = `Text Behind Project ${new Date().toLocaleDateString()}`

      const projectData = {
        title: projectTitle,
        description: `Text: "${text}" with ${font} font`,
        image_url: 'generating...', // Placeholder - will be updated with generated image
        overlay_config: {
          text,
          fontSize: customFontSize,
          fontFamily: font,
          color: textColor,
          position: textPosition,
          rotation: textRotation,
          opacity: textOpacity,
          fontWeight,
          fontStyle,
          textDecoration,
          letterSpacing,
          tiltX,
          tiltY,
        },
        tags: ['text-behind', 'ai-generated'],
        is_public: false,
      }

      console.log('Project data:', projectData)

      const project = await createProject(user.id, projectData)

      console.log('Project save result:', project)

      if (!project) {
        console.error(
          'Project save returned null - check browser console for Supabase errors'
        )
        alert(
          'Failed to save project. Please check the browser console for details and ensure Supabase is configured.'
        )
        return
      }

      // Generate the final image with text overlay
      console.log('📸 Generating final image...')
      const canvas = canvasRef.current
      const generatedImageDataUrl = canvas.toDataURL('image/png', 0.95)

      // Save the generated image to storage
      console.log('💾 Uploading generated image to storage...')

      const storageResult = await saveGeneratedImageToStorage(
        project.id,
        generatedImageDataUrl,
        user.id,
        {
          title: projectTitle,
          description: projectData.description,
          overlayConfig: projectData.overlay_config,
        }
      )

      if (storageResult) {
        console.log('✅ Generated image saved to storage:', storageResult)
        console.log(
          '🔄 Final project image URL should be:',
          storageResult.imageUrl
        )

        // Show beautiful save animation instead of ugly alert
        setShowSaveAnimation(true)
      } else {
        console.warn('⚠️ Project saved but image upload failed')

        // Show beautiful save animation even if upload failed
        setShowSaveAnimation(true)
      }
    } catch (error) {
      console.error('Error saving project:', error)
      // TODO: Create a beautiful error animation too
      alert(
        `❌ Failed to save project: ${
          error instanceof Error ? error.message : 'Unknown error'
        }\n\nPlease try again or check your internet connection.`
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative z-10 min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Premium Header - Mobile First */}
      <div className="bg-gray-950/90 backdrop-blur-xl border-b border-gray-800/50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 sm:py-6 gap-4">
            {/* Left Section - Navigation & Status */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="group flex items-center gap-2 text-gray-300 hover:text-white transition-all duration-300 bg-gray-800/50 hover:bg-gray-700/50 px-3 sm:px-4 py-2.5 rounded-2xl border border-gray-700/50 hover:border-gray-600/50 hover:shadow-lg hover:scale-[1.02]">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="font-semibold text-sm sm:text-base">Back</span>
              </button>

              {/* Pro Status - Premium Design */}
              {!hasPremiumAccess ? (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="group flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2.5 rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] border border-emerald-400/20">
                  <Crown className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-bold text-sm">Upgrade Pro</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 text-yellow-400 px-4 py-2.5 rounded-2xl border border-yellow-500/20 shadow-lg shadow-yellow-500/10">
                  <Crown className="w-4 h-4" />
                  <span className="font-bold text-sm">Pro Member</span>
                </div>
              )}
            </div>

            {/* Center - Title */}
            <div className="text-center sm:flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent mb-1">
                Text Behind Creator
              </h1>
              <p className="text-gray-400 text-sm sm:text-base font-medium hidden sm:block">
                Create stunning text-behind-subject effects with AI
              </p>
            </div>

            {/* Right Section - Action Buttons (Hidden on Mobile, Visible on Desktop) */}
            <div className="hidden lg:flex items-center gap-3">
              {canvasReady && (
                <>
                  <button
                    onClick={handleReset}
                    className="group px-4 py-2.5 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-2xl transition-all duration-300 border border-gray-700/50 hover:border-gray-600/50 font-semibold text-sm hover:scale-[1.02] hover:shadow-lg">
                    <span className="group-hover:scale-105 inline-block transition-transform duration-300">
                      Reset
                    </span>
                  </button>

                  {!hasBeenAutoSaved && (
                    <button
                      onClick={handleSaveProject}
                      disabled={saving}
                      className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-blue-800 disabled:to-blue-900 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 font-semibold text-sm hover:scale-[1.02]">
                      <Save className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      <span>{saving ? 'Saving...' : 'Save Project'}</span>
                    </button>
                  )}

                  {hasBeenAutoSaved && (
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl shadow-lg shadow-emerald-500/10">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-sm font-bold">Auto-Saved</span>
                    </div>
                  )}

                  <button
                    onClick={() => setShowDownloadModal(true)}
                    disabled={isDownloading}
                    className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-emerald-800 disabled:to-emerald-900 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 font-semibold text-sm hover:scale-[1.02]">
                    {isDownloading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Download className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                    )}
                    <span>{isDownloading ? 'Downloading...' : 'Download'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {!imageSrc ? (
        // Premium Upload State - Mobile First
        <div className="flex items-center justify-center min-h-[calc(100vh-120px)] p-4 sm:p-6 lg:p-8 relative">
          {/* Premium Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-emerald-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 sm:w-48 h-32 sm:h-48 bg-blue-500/3 rounded-full blur-2xl"></div>
          </div>

          <div className="max-w-6xl w-full relative z-10">
            <div className="text-center mb-8 sm:mb-12">
              {/* Premium Badge */}
              <div className="inline-flex items-center bg-gradient-to-r from-emerald-500/10 to-emerald-400/10 backdrop-blur-xl text-emerald-400 text-sm sm:text-base font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-2xl mb-6 sm:mb-8 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                    clipRule="evenodd"
                  />
                </svg>
                AI-Powered Background Separation
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent">
                  Create Stunning
                </span>
                <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                  Text Behind Effects
                </span>
              </h2>

              <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed font-medium">
                Upload any image and we'll automatically separate the foreground
                subject, allowing you to place text behind it for professional,
                eye-catching visuals that stand out.
              </p>

              {/* Premium Feature Cards - Mobile First */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 max-w-5xl mx-auto">
                <div className="group bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-gray-700/50 hover:border-emerald-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10 hover:scale-[1.02]">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-white font-bold text-lg sm:text-xl mb-3 text-center">
                    Any Resolution
                  </h3>
                  <p className="text-gray-400 text-sm sm:text-base text-center leading-relaxed">
                    Works with all image sizes and resolutions for perfect
                    results
                  </p>
                </div>

                <div className="group bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:scale-[1.02]">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-white font-bold text-lg sm:text-xl mb-3 text-center">
                    AI Processing
                  </h3>
                  <p className="text-gray-400 text-sm sm:text-base text-center leading-relaxed">
                    Advanced AI background removal technology for precise
                    results
                  </p>
                </div>

                <div className="group bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 hover:scale-[1.02]">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-7 h-7 sm:w-8 sm:h-8 text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-white font-bold text-lg sm:text-xl mb-3 text-center">
                    Full Control
                  </h3>
                  <p className="text-gray-400 text-sm sm:text-base text-center leading-relaxed">
                    Customize fonts, colors, and positioning with precision
                  </p>
                </div>
              </div>
            </div>

            <Dropzone
              onFileSelect={setSelectedImage}
              loading={loading}
              disabled={
                !profileLoading &&
                !!userProfile &&
                hasReachedLimit &&
                !hasPremiumAccess
              }
              disabledMessage={`You've reached your limit of ${currentLimit} free generations per month`}
            />
          </div>
        </div>
      ) : (
        // Mobile-First Editor Layout - Image First, Controls Below on Mobile, Side-by-Side on Desktop
        <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)]">
          {/* Canvas Area - Mobile: Full Width First, Desktop: Flex-1 Left Side */}
          <div className="w-full lg:flex-1 flex items-center justify-center p-3 sm:p-4 lg:p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/50 relative h-[60vh] lg:h-full order-1 lg:order-1">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                  backgroundSize: '20px 20px',
                }}></div>
            </div>

            {loading ? (
              <div className="text-center relative z-10">
                <div className="relative mb-8">
                  <div className="animate-spin rounded-full h-20 w-20 border-4 border-emerald-500/20 border-t-emerald-500 mx-auto"></div>
                  <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-pulse"></div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 max-w-md mx-auto">
                  <p className="text-white text-xl font-semibold mb-3">
                    Processing Image
                  </p>
                  <p className="text-emerald-300 text-sm mb-4">
                    🤖 AI is separating the foreground subject from the
                    background
                  </p>
                  <div className="space-y-2 text-xs text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span>Analyzing image composition</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div
                        className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"
                        style={{ animationDelay: '0.5s' }}></div>
                      <span>Detecting foreground subjects</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div
                        className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"
                        style={{ animationDelay: '1s' }}></div>
                      <span>Creating text-behind effect</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center relative">
                {/* Canvas Container with Zoom & Pan - Canva-style centering */}
                <div
                  ref={containerRef}
                  className="w-full h-full overflow-hidden relative cursor-grab active:cursor-grabbing flex items-center justify-center"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onWheel={handleWheel}
                  style={{ cursor: isPanning ? 'grabbing' : 'grab' }}>
                  <div
                    className="relative group"
                    style={{
                      transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                      transformOrigin: 'center center',
                      transition: isPanning
                        ? 'none'
                        : 'transform 0.2s ease-out',
                    }}>
                    <canvas
                      ref={canvasRef}
                      onMouseDown={handleCanvasMouseDown}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                      onMouseLeave={handleCanvasMouseUp}
                      onDoubleClick={handleCanvasDoubleClick}
                      onTouchStart={handleCanvasTouchStart}
                      onTouchMove={handleCanvasTouchMove}
                      onTouchEnd={handleCanvasTouchEnd}
                      className={`border-2 border-white/20 rounded-2xl shadow-2xl transition-all duration-300 hover:border-emerald-500/30 hover:shadow-emerald-500/10 max-w-full max-h-full ${
                        isDragging
                          ? 'cursor-grabbing'
                          : textSelected
                          ? 'cursor-grab'
                          : 'cursor-pointer'
                      }`}
                      style={{ touchAction: 'none' }}
                    />

                    {/* Enhanced Text selection indicator */}
                    {textSelected && canvasRef.current && (
                      <div
                        className="absolute border-2 border-emerald-400 border-dashed pointer-events-none animate-pulse"
                        style={{
                          left: `${
                            (textBounds.x / canvasRef.current.width) * 100
                          }%`,
                          top: `${
                            (textBounds.y / canvasRef.current.height) * 100
                          }%`,
                          width: `${
                            (textBounds.width / canvasRef.current.width) * 100
                          }%`,
                          height: `${
                            (textBounds.height / canvasRef.current.height) * 100
                          }%`,
                        }}>
                        {/* Enhanced corner handles */}
                        <div className="absolute -top-2 -left-2 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-lg"></div>
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-lg"></div>
                        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-lg"></div>
                        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-lg"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Status indicator - App Style */}
                <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-md rounded-xl shadow-lg border border-white/10 px-4 py-3 max-w-sm">
                  {textSelected ? (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg"></div>
                      <div>
                        <div className="font-semibold text-white">
                          Text Selected
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Drag to move • Double-click to edit • Use zoom for
                          precision
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <div>
                        <div className="font-semibold text-white">
                          Ready to Edit
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Click on text to select and customize
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Canvas info indicator - App Style */}
                <div className="absolute top-6 right-6 bg-black/80 backdrop-blur-md rounded-xl shadow-lg border border-white/10 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <div>
                      <div className="text-sm font-semibold text-white">
                        Text Behind Effect
                      </div>
                      {canvasRef.current && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          {canvasRef.current.width}×{canvasRef.current.height}px
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls Panel - Mobile: Below Canvas, Desktop: Right Sidebar */}
          <div className="w-full bg-white/5 backdrop-blur-sm border-t border-white/10 order-2 lg:order-2 lg:w-96 lg:border-t-0 lg:border-l lg:max-h-none">
            {/* Mobile: Collapsible sections, Desktop: Full panel */}
            <div className="max-h-[45vh] lg:max-h-full overflow-y-auto">
              {/* Touch-Friendly Panel Header */}
              <div className="p-4 sm:p-5 lg:p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg lg:text-xl font-bold text-white">
                        Text Controls
                      </h3>
                      <p className="text-sm text-gray-400 hidden sm:block">
                        Customize your text-behind effect
                      </p>
                    </div>
                  </div>
                  {/* Mobile: Show current text preview */}
                  <div className="sm:hidden bg-white/10 px-3 py-1 rounded-lg">
                    <span className="text-xs text-emerald-300 font-medium">
                      {text.length > 15 ? text.substring(0, 15) + '...' : text}
                    </span>
                  </div>
                </div>
              </div>

              {/* Touch-Friendly Controls Content */}
              <div className="p-4 sm:p-5 lg:p-6 space-y-6 sm:space-y-8 lg:space-y-10 pb-24 lg:pb-6">
                <TextControls
                  text={text}
                  setText={setText}
                  position={textPosition}
                  setPosition={setTextPosition}
                  fontSize={customFontSize}
                  setFontSize={setCustomFontSize}
                  rotation={textRotation}
                  setRotation={setTextRotation}
                  disabled={
                    !profileLoading &&
                    !!userProfile &&
                    hasReachedLimit &&
                    !hasPremiumAccess
                  }
                  disabledMessage="Upgrade to Pro to edit text"
                />

                <FontSelector selectedFont={font} onFontChange={setFont} />

                {/* Text Effects - MOVED UP FOR EASY ACCESS */}
                <TextEffects
                  textEffect={textEffect}
                  onTextEffectChange={setTextEffect}
                  glowColor={glowColor}
                  onGlowColorChange={setGlowColor}
                  disabled={hasReachedLimit}
                  disabledMessage={`You've reached your limit of ${currentLimit} free generations per month`}
                />

                {/* Zoom Controls */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ZoomIn className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-semibold text-white">
                        Zoom
                      </span>
                    </div>
                    <span className="text-xs text-emerald-300 bg-emerald-500/20 px-2 py-1 rounded-md">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* Zoom Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={handleZoomIn}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/50 rounded-lg transition-all duration-200 group"
                        title="Zoom In (Ctrl + Scroll)">
                        <ZoomIn className="w-4 h-4 text-gray-300 group-hover:text-emerald-400" />
                        <span className="text-sm text-gray-300 group-hover:text-white">
                          In
                        </span>
                      </button>

                      <button
                        onClick={handleZoomOut}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/50 rounded-lg transition-all duration-200 group"
                        title="Zoom Out (Ctrl + Scroll)">
                        <ZoomOut className="w-4 h-4 text-gray-300 group-hover:text-emerald-400" />
                        <span className="text-sm text-gray-300 group-hover:text-white">
                          Out
                        </span>
                      </button>

                      <button
                        onClick={handleResetZoom}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/50 rounded-lg transition-all duration-200 group"
                        title="Reset Zoom & Pan">
                        <RotateCcw className="w-4 h-4 text-gray-300 group-hover:text-emerald-400" />
                        <span className="text-sm text-gray-300 group-hover:text-white">
                          Reset
                        </span>
                      </button>
                    </div>

                    {/* Zoom Instructions */}
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                      <div className="text-xs text-emerald-300 font-medium mb-1">
                        💡 Zoom Tips
                      </div>
                      <div className="text-xs text-gray-400 space-y-1">
                        <div>• Ctrl + Scroll to zoom</div>
                        <div>• Ctrl + Drag to pan around</div>
                        <div>• Use zoom for precise positioning</div>
                      </div>
                    </div>
                  </div>
                </div>

                <StyleSelector
                  selectedColor={textColor}
                  onColorChange={setTextColor}
                  opacity={textOpacity}
                  onOpacityChange={setTextOpacity}
                  fontWeight={fontWeight}
                  onFontWeightChange={setFontWeight}
                  fontStyle={fontStyle}
                  onFontStyleChange={setFontStyle}
                  textDecoration={textDecoration}
                  onTextDecorationChange={setTextDecoration}
                />

                {/* Advanced Text Controls - Pro Features from Fix Folder */}
                <AdvancedTextControls
                  letterSpacing={letterSpacing}
                  setLetterSpacing={setLetterSpacing}
                  tiltX={tiltX}
                  setTiltX={setTiltX}
                  tiltY={tiltY}
                  setTiltY={setTiltY}
                  disabled={hasReachedLimit}
                  disabledMessage={`You've reached your limit of ${currentLimit} free generations per month`}
                />

                {/* Quick Actions */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Quick Actions
                  </h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => setTextPosition({ x: 50, y: 50 })}
                      className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
                      Center Text
                    </button>
                    <button
                      onClick={() => setTextRotation(0)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
                      Reset Rotation
                    </button>
                    <button
                      onClick={() => setIsEditingText(true)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
                      Edit Text Content
                    </button>
                    <button
                      onClick={handleResetZoom}
                      className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
                      Reset Zoom & Pan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile-First Sticky Action Bar */}
          {canvasReady && (
            <div className="fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur-xl border-t border-gray-800/50 p-4 z-40 lg:hidden">
              <div className="flex items-center justify-center gap-3 max-w-sm mx-auto">
                {!hasBeenAutoSaved && (
                  <button
                    onClick={handleSaveProject}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-blue-800 disabled:to-blue-900 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-300 shadow-lg shadow-blue-500/25 font-bold text-sm min-h-[48px] active:scale-95">
                    <Save className="w-5 h-5" />
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                  </button>
                )}

                {hasBeenAutoSaved && (
                  <div className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl shadow-lg shadow-emerald-500/10 min-h-[48px]">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="font-bold text-sm">Saved</span>
                  </div>
                )}

                <button
                  onClick={() => setShowDownloadModal(true)}
                  disabled={isDownloading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-emerald-800 disabled:to-emerald-900 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-500/25 font-bold text-sm min-h-[48px] active:scale-95">
                  {isDownloading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                  <span>{isDownloading ? 'Processing...' : 'Download'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Text Edit Modal */}
      <TextEditModal
        isOpen={isEditingText}
        onClose={() => setIsEditingText(false)}
        text={text}
        onSave={handleTextSave}
      />

      {/* Download Modal */}
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        onDownload={handleDownload}
        hasPremiumAccess={hasPremiumAccess}
      />

      {/* Download Progress Overlay */}
      {isDownloading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gray-800 border border-white/20 rounded-2xl p-8 w-full max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Download className="w-8 h-8 text-emerald-400" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                Preparing Your Download
              </h3>

              <p className="text-gray-400 mb-6">
                Processing your image with high quality settings...
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-3 mb-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  {downloadProgress < 20 && 'Initializing...'}
                  {downloadProgress >= 20 &&
                    downloadProgress < 40 &&
                    'Loading image...'}
                  {downloadProgress >= 40 &&
                    downloadProgress < 50 &&
                    'Calculating dimensions...'}
                  {downloadProgress >= 50 &&
                    downloadProgress < 60 &&
                    'Drawing background...'}
                  {downloadProgress >= 60 &&
                    downloadProgress < 70 &&
                    'Rendering text...'}
                  {downloadProgress >= 70 &&
                    downloadProgress < 80 &&
                    'Loading foreground...'}
                  {downloadProgress >= 80 &&
                    downloadProgress < 85 &&
                    'Drawing foreground...'}
                  {downloadProgress >= 85 &&
                    downloadProgress < 90 &&
                    'Converting to image...'}
                  {downloadProgress >= 90 &&
                    downloadProgress < 95 &&
                    'Auto-saving project...'}
                  {downloadProgress >= 95 &&
                    downloadProgress < 100 &&
                    'Preparing download...'}
                  {downloadProgress >= 100 && 'Complete!'}
                </span>
                <span className="text-emerald-400 font-medium">
                  {downloadProgress}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Beautiful Save Success Animation */}
      <SaveSuccessAnimation
        isVisible={showSaveAnimation}
        onComplete={() => {
          setShowSaveAnimation(false)
          router.push('/dashboard')
        }}
        projectTitle={projectTitle}
      />

      {/* Auto-Save Notification */}
      {showAutoSaveNotification && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-emerald-500/90 backdrop-blur-sm text-white px-6 py-4 rounded-2xl shadow-2xl border border-emerald-400/20 max-w-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-sm">Project Auto-Saved!</div>
                <div className="text-emerald-100 text-xs">
                  Your work has been saved to dashboard
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Usage Increment Notification */}
      {showUsageNotification && (
        <div className="fixed top-6 left-6 z-50 animate-in slide-in-from-left duration-300">
          <div className="bg-blue-500/90 backdrop-blur-sm text-white px-6 py-4 rounded-2xl shadow-2xl border border-blue-400/20 max-w-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-sm">Usage Updated!</div>
                <div className="text-blue-100 text-xs">
                  Image generation counted towards your plan
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />

      {/* Limit Reached Modal */}
      {showLimitReachedModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900/95 backdrop-blur-md rounded-3xl shadow-2xl border border-red-500/30 max-w-md w-full">
            {/* Header */}
            <div className="p-6 text-center border-b border-white/10">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Monthly Limit Reached
              </h2>
              <p className="text-gray-400">
                You've used all {currentLimit} of your free generations this
                month
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-semibold">
                      Current Usage
                    </div>
                    <div className="text-red-300 text-sm">
                      {currentUsage} / {currentLimit} generations used
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full w-full"></div>
                </div>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Upgrade to Continue Creating
                </h3>
                <p className="text-gray-400 text-sm">
                  Get unlimited generations and unlock all premium features
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowLimitReachedModal(false)
                    setShowUpgradeModal(true)
                  }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                  <Crown className="w-4 h-4" />
                  Upgrade to Pro
                </button>

                <button
                  onClick={() => setShowLimitReachedModal(false)}
                  className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 font-medium border border-white/20">
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
