import { createSupabaseServerClient, createSupabaseBrowserClient } from './supabase'

// Storage bucket configuration
export const STORAGE_BUCKET = 'user-images'
export const STORAGE_FOLDERS = {
  PROJECTS: 'projects',
  GENERATED: 'generated',
  THUMBNAILS: 'thumbnails'
} as const

/**
 * Upload image to Supabase Storage
 */
export async function uploadImageToStorage(
  imageBlob: Blob,
  fileName: string,
  folder: string = STORAGE_FOLDERS.GENERATED,
  userId?: string
): Promise<{ url: string; path: string } | null> {
  try {
    const supabase = createSupabaseBrowserClient()
    
    // Create unique file path
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const fileExtension = fileName.split('.').pop() || 'png'
    const uniqueFileName = `${timestamp}_${randomId}.${fileExtension}`
    const filePath = userId 
      ? `${folder}/${userId}/${uniqueFileName}`
      : `${folder}/${uniqueFileName}`

    console.log('📤 Uploading image to storage:', filePath)

    // Upload file to storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, imageBlob, {
        cacheControl: '3600',
        upsert: false,
        contentType: imageBlob.type || 'image/png'
      })

    if (error) {
      console.error('❌ Storage upload error:', error)
      return null
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath)

    if (!urlData?.publicUrl) {
      console.error('❌ Failed to get public URL')
      return null
    }

    console.log('✅ Image uploaded successfully:', urlData.publicUrl)

    return {
      url: urlData.publicUrl,
      path: filePath
    }

  } catch (error) {
    console.error('❌ Upload failed:', error)
    return null
  }
}

/**
 * Download image from storage
 */
export async function downloadImageFromStorage(
  filePath: string,
  downloadName?: string
): Promise<boolean> {
  try {
    const supabase = createSupabaseBrowserClient()

    console.log('⬇️ Downloading image:', filePath)

    // Download file from storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(filePath)

    if (error || !data) {
      console.error('❌ Download error:', error)
      return false
    }

    // Create download link
    const url = URL.createObjectURL(data)
    const link = document.createElement('a')
    link.href = url
    link.download = downloadName || filePath.split('/').pop() || 'image.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    console.log('✅ Image downloaded successfully')
    return true

  } catch (error) {
    console.error('❌ Download failed:', error)
    return false
  }
}

/**
 * Delete image from storage
 */
export async function deleteImageFromStorage(filePath: string): Promise<boolean> {
  try {
    const supabase = createSupabaseBrowserClient()

    console.log('🗑️ Deleting image:', filePath)

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath])

    if (error) {
      console.error('❌ Delete error:', error)
      return false
    }

    console.log('✅ Image deleted successfully')
    return true

  } catch (error) {
    console.error('❌ Delete failed:', error)
    return false
  }
}

/**
 * Get signed URL for private access (if needed)
 */
export async function getSignedUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const supabase = createSupabaseBrowserClient()

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(filePath, expiresIn)

    if (error || !data?.signedUrl) {
      console.error('❌ Signed URL error:', error)
      return null
    }

    return data.signedUrl

  } catch (error) {
    console.error('❌ Signed URL failed:', error)
    return null
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
 * Generate thumbnail from image
 */
export async function generateThumbnail(
  imageBlob: Blob,
  maxWidth: number = 300,
  maxHeight: number = 300,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate thumbnail dimensions
      let { width, height } = img
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }

      canvas.width = width
      canvas.height = height

      // Draw resized image
      ctx?.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to generate thumbnail'))
          }
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(imageBlob)
  })
}
