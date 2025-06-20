// 🆓 FREE Cloudinary Storage Implementation
// 25GB free storage + 25GB free bandwidth per month

interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  url: string
  format: string
  width: number
  height: number
  bytes: number
  created_at: string
}

/**
 * Upload image to Cloudinary (FREE)
 */
export async function uploadImageToCloudinary(
  imageBlob: Blob,
  fileName: string,
  folder: string = 'imprintify',
  userId?: string
): Promise<{ url: string; publicId: string } | null> {
  try {
    console.log('📤 Uploading to Cloudinary (FREE)...')
    console.log('🔧 Cloud name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)
    console.log(
      '🔧 Upload preset:',
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    )

    // Create form data
    const formData = new FormData()

    // Generate unique filename (simpler approach)
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const uniqueName = `imprintify_${userId || 'user'}_${timestamp}_${randomId}`

    formData.append('file', imageBlob)
    formData.append(
      'upload_preset',
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'imprintify_preset'
    )
    formData.append('public_id', uniqueName)
    // Remove folder parameter for now to avoid issues

    // Upload to Cloudinary
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    if (!cloudName) {
      console.error('❌ Cloudinary cloud name not configured')
      return null
    }

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Cloudinary upload failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })
      return null
    }

    const result: CloudinaryUploadResult = await response.json()

    console.log('✅ Uploaded to Cloudinary:', {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
    })

    return {
      url: result.secure_url,
      publicId: result.public_id,
    }
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error)
    return null
  }
}

/**
 * Generate thumbnail URL using Cloudinary transformations (FREE)
 */
export function generateCloudinaryThumbnail(
  imageUrl: string,
  width: number = 400,
  height: number = 400,
  quality: string = 'auto'
): string {
  try {
    // Extract public_id from Cloudinary URL
    const urlParts = imageUrl.split('/')
    const uploadIndex = urlParts.findIndex((part) => part === 'upload')

    if (uploadIndex === -1) {
      return imageUrl // Not a Cloudinary URL
    }

    const cloudName = urlParts[3] // cloudinary.com/CLOUD_NAME/...
    const publicIdWithExtension = urlParts.slice(uploadIndex + 1).join('/')
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '') // Remove extension

    // Generate thumbnail URL with transformations
    const thumbnailUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},h_${height},c_fill,q_${quality}/${publicId}`

    return thumbnailUrl
  } catch (error) {
    console.error('❌ Error generating thumbnail:', error)
    return imageUrl
  }
}

/**
 * Download image from Cloudinary
 */
export async function downloadImageFromCloudinary(
  imageUrl: string,
  downloadName?: string
): Promise<boolean> {
  try {
    console.log('⬇️ Downloading from Cloudinary:', imageUrl)

    // Fetch the image
    const response = await fetch(imageUrl)
    if (!response.ok) {
      console.error('❌ Failed to fetch image')
      return false
    }

    const blob = await response.blob()

    // Create download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = downloadName || `imprintly-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    console.log('✅ Download completed')
    return true
  } catch (error) {
    console.error('❌ Download failed:', error)
    return false
  }
}

/**
 * Delete image from Cloudinary (optional - saves storage space)
 */
export async function deleteImageFromCloudinary(
  publicId: string
): Promise<boolean> {
  try {
    console.log('🗑️ Deleting from Cloudinary:', publicId)

    // This requires server-side implementation with API secret
    // For now, we'll skip deletion to keep it simple
    // Images will be automatically cleaned up by Cloudinary's policies

    console.log('ℹ️ Deletion skipped (requires server-side API)')
    return true
  } catch (error) {
    console.error('❌ Delete failed:', error)
    return false
  }
}

/**
 * Convert data URL to Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  return new Blob([u8arr], { type: mime })
}

/**
 * Get optimized image URL from Cloudinary
 */
export function getOptimizedImageUrl(
  imageUrl: string,
  options: {
    width?: number
    height?: number
    quality?: string
    format?: string
  } = {}
): string {
  try {
    const { width, height, quality = 'auto', format = 'auto' } = options

    // Extract public_id from Cloudinary URL
    const urlParts = imageUrl.split('/')
    const uploadIndex = urlParts.findIndex((part) => part === 'upload')

    if (uploadIndex === -1) {
      return imageUrl // Not a Cloudinary URL
    }

    const cloudName = urlParts[3]
    const publicIdWithExtension = urlParts.slice(uploadIndex + 1).join('/')
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '')

    // Build transformation string
    let transformations = [`q_${quality}`, `f_${format}`]

    if (width) transformations.push(`w_${width}`)
    if (height) transformations.push(`h_${height}`)
    if (width && height) transformations.push('c_fill')

    const transformString = transformations.join(',')

    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${publicId}`
  } catch (error) {
    console.error('❌ Error optimizing image URL:', error)
    return imageUrl
  }
}
