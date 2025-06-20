/**
 * Image processing utilities for text-behind-subject effects
 */

export interface TextOverlayConfig {
  text: string
  fontSize: number
  fontFamily?: string
  color: string
  position: {
    x: number // percentage from left
    y: number // percentage from top
  }
  rotation?: number
  opacity?: number
  strokeColor?: string
  strokeWidth?: number
  shadow?: {
    color: string
    blur: number
    offsetX: number
    offsetY: number
  }
}

export interface ImageProcessingOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
}

/**
 * Generates an image with text overlay
 */
export async function generateImageWithText(
  imageUrl: string,
  overlayConfig: TextOverlayConfig,
  options: ImageProcessingOptions = {}
): Promise<string | null> {
  try {
    // Create a canvas element
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('Could not get canvas context')
    }

    // Load the base image
    const img = new Image()
    img.crossOrigin = 'anonymous'

    return new Promise((resolve, reject) => {
      img.onload = () => {
        try {
          // Set canvas dimensions
          const targetWidth = options.width || img.width
          const targetHeight = options.height || img.height

          canvas.width = targetWidth
          canvas.height = targetHeight

          // Draw the base image
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

          // Configure text styling
          const fontSize = (overlayConfig.fontSize / 100) * Math.min(targetWidth, targetHeight)
          ctx.font = `${fontSize}px ${overlayConfig.fontFamily || 'Arial'}`
          ctx.fillStyle = overlayConfig.color
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'

          // Apply opacity
          if (overlayConfig.opacity !== undefined) {
            ctx.globalAlpha = overlayConfig.opacity
          }

          // Calculate text position
          const x = (overlayConfig.position.x / 100) * targetWidth
          const y = (overlayConfig.position.y / 100) * targetHeight

          // Apply rotation if specified
          if (overlayConfig.rotation) {
            ctx.save()
            ctx.translate(x, y)
            ctx.rotate((overlayConfig.rotation * Math.PI) / 180)
            ctx.translate(-x, -y)
          }

          // Apply shadow if specified
          if (overlayConfig.shadow) {
            ctx.shadowColor = overlayConfig.shadow.color
            ctx.shadowBlur = overlayConfig.shadow.blur
            ctx.shadowOffsetX = overlayConfig.shadow.offsetX
            ctx.shadowOffsetY = overlayConfig.shadow.offsetY
          }

          // Apply stroke if specified
          if (overlayConfig.strokeColor && overlayConfig.strokeWidth) {
            ctx.strokeStyle = overlayConfig.strokeColor
            ctx.lineWidth = overlayConfig.strokeWidth
            ctx.strokeText(overlayConfig.text, x, y)
          }

          // Draw the text
          ctx.fillText(overlayConfig.text, x, y)

          // Restore context if rotation was applied
          if (overlayConfig.rotation) {
            ctx.restore()
          }

          // Convert canvas to data URL
          const quality = options.quality || 0.9
          const format = options.format || 'jpeg'
          const dataUrl = canvas.toDataURL(`image/${format}`, quality)

          resolve(dataUrl)
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      img.src = imageUrl
    })
  } catch (error) {
    console.error('Error generating image with text:', error)
    return null
  }
}

/**
 * Downloads a data URL as a file
 */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Converts a data URL to a blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',')
  const mime = arr[0].match(/:(.*?);/)![1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  return new Blob([u8arr], { type: mime })
}

/**
 * Uploads a blob to Supabase storage
 */
export async function uploadImageToStorage(
  blob: Blob,
  filename: string,
  bucket: string = 'project-images'
): Promise<string | null> {
  try {
    // This would integrate with Supabase storage
    // For now, return a mock URL
    console.log('Uploading image to storage:', filename)

    // In a real implementation:
    // const { createSupabaseBrowserClient } = await import('./supabase')
    // const supabase = createSupabaseBrowserClient()
    // const { data, error } = await supabase.storage
    //   .from(bucket)
    //   .upload(filename, blob)

    // Mock implementation
    return `https://example.com/storage/${bucket}/${filename}`
  } catch (error) {
    console.error('Error uploading image:', error)
    return null
  }
}

/**
 * Processes and saves a project image
 */
export async function processAndSaveProjectImage(
  imageUrl: string,
  overlayConfig: TextOverlayConfig,
  projectId: string,
  options: ImageProcessingOptions = {}
): Promise<string | null> {
  try {
    // Generate the image with text overlay
    const dataUrl = await generateImageWithText(imageUrl, overlayConfig, options)

    if (!dataUrl) {
      return null
    }

    // Convert to blob
    const blob = dataUrlToBlob(dataUrl)

    // Generate filename
    const filename = `imprintly-${Date.now()}.jpg`

    // Upload to storage
    const uploadedUrl = await uploadImageToStorage(blob, filename)

    return uploadedUrl
  } catch (error) {
    console.error('Error processing and saving project image:', error)
    return null
  }
}

/**
 * Creates a preview of the text overlay without saving
 */
export async function createTextPreview(
  imageUrl: string,
  overlayConfig: TextOverlayConfig
): Promise<string | null> {
  return generateImageWithText(imageUrl, overlayConfig, {
    width: 800,
    height: 600,
    quality: 0.8
  })
}

/**
 * Validates image URL and checks if it's accessible
 */
export function validateImageUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}
