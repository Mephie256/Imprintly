import { createSupabaseBrowserClient } from './supabase'
import {
  uploadImageToCloudinary,
  dataUrlToBlob,
  generateCloudinaryThumbnail,
  downloadImageFromCloudinary,
} from './cloudinary-storage'

export interface Project {
  id: string
  user_id: string
  title: string
  description: string | null
  image_url: string
  overlay_config: Record<string, any>
  created_at: string
  updated_at: string
  is_public: boolean
  tags: string[] | null
}

export interface CreateProjectData {
  title: string
  description?: string
  image_url: string
  overlay_config: Record<string, any>
  is_public?: boolean
  tags?: string[]
}

export interface UpdateProjectData {
  title?: string
  description?: string
  image_url?: string
  overlay_config?: Record<string, any>
  is_public?: boolean
  tags?: string[]
}

/**
 * Creates a new project for the user
 */
export async function createProject(
  clerkUserId: string,
  projectData: CreateProjectData
): Promise<Project | null> {
  try {
    console.log('🔄 Creating project for user:', clerkUserId)
    console.log('📝 Project data:', projectData)

    const supabase = createSupabaseBrowserClient()

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    console.log('🔗 Supabase URL:', supabaseUrl ? 'Configured' : 'Missing')

    if (!supabaseUrl || supabaseUrl.includes('your_supabase')) {
      console.warn('⚠️ Supabase not configured. Creating mock project.')
      // Return a mock project for development
      const mockProject: Project = {
        id: `mock-project-${Date.now()}`,
        user_id: 'mock-user-id',
        title: projectData.title,
        description: projectData.description || null,
        image_url: projectData.image_url,
        overlay_config: projectData.overlay_config,
        is_public: projectData.is_public || false,
        tags: projectData.tags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      console.log('✅ Mock project created:', mockProject)
      return mockProject
    }

    // First get the user's Supabase ID
    console.log('👤 Looking up user in Supabase...')
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (userError) {
      console.error('❌ Error finding user:', userError)
      console.log(
        '💡 User might not be synced to Supabase yet. Try signing out and back in.'
      )
      return null
    }

    if (!user) {
      console.error('❌ User not found in Supabase database')
      console.log(
        '💡 User needs to be synced. Try refreshing the page or signing out/in.'
      )
      return null
    }

    console.log('✅ User found in Supabase:', user.id)

    // Insert the project
    console.log('💾 Inserting project into database...')
    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        title: projectData.title,
        description: projectData.description || null,
        image_url: projectData.image_url,
        overlay_config: projectData.overlay_config,
        is_public: projectData.is_public || false,
        tags: projectData.tags || [],
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating project:', error)
      console.log('💡 Check RLS policies and database permissions')
      return null
    }

    console.log('✅ Project created successfully:', data)
    return data
  } catch (error) {
    console.error('❌ Unexpected error creating project:', error)
    return null
  }
}

/**
 * Gets all projects for a user
 */
export async function getUserProjects(clerkUserId: string): Promise<Project[]> {
  try {
    const supabase = createSupabaseBrowserClient()

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl || supabaseUrl.includes('your_supabase')) {
      console.warn('Supabase not configured. Returning empty projects array.')
      return []
    }

    // Get user's Supabase ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (userError || !user) {
      console.error('Error finding user:', userError)
      return []
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching user projects:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error getting user projects:', error)
    return []
  }
}

/**
 * Gets a specific project by ID
 */
export async function getProject(projectId: string): Promise<Project | null> {
  try {
    const supabase = createSupabaseBrowserClient()

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (error) {
      console.error('Error fetching project:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error getting project:', error)
    return null
  }
}

/**
 * Updates a project
 */
export async function updateProject(
  projectId: string,
  updateData: UpdateProjectData
): Promise<Project | null> {
  try {
    const supabase = createSupabaseBrowserClient()

    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select()
      .single()

    if (error) {
      console.error('Error updating project:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error updating project:', error)
    return null
  }
}

/**
 * Deletes a project
 */
export async function deleteProject(projectId: string): Promise<boolean> {
  try {
    const supabase = createSupabaseBrowserClient()

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl || supabaseUrl.includes('your_supabase')) {
      console.warn('Supabase not configured. Cannot delete project.')
      return false
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (error) {
      console.error('Error deleting project:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting project:', error)
    return false
  }
}

/**
 * Gets public projects for discovery
 */
export async function getPublicProjects(
  limit: number = 20
): Promise<Project[]> {
  try {
    const supabase = createSupabaseBrowserClient()

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching public projects:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error getting public projects:', error)
    return []
  }
}

/**
 * Searches projects by title or tags
 */
export async function searchProjects(
  query: string,
  clerkUserId?: string
): Promise<Project[]> {
  try {
    const supabase = createSupabaseBrowserClient()

    let queryBuilder = supabase
      .from('projects')
      .select('*')
      .or(`title.ilike.%${query}%, tags.cs.{${query}}`)

    // If user ID provided, search only their projects, otherwise search public projects
    if (clerkUserId) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_user_id', clerkUserId)
        .single()

      if (userError || !user) {
        console.error('Error finding user:', userError)
        return []
      }

      queryBuilder = queryBuilder.eq('user_id', user.id)
    } else {
      queryBuilder = queryBuilder.eq('is_public', true)
    }

    const { data, error } = await queryBuilder
      .order('updated_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error searching projects:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error searching projects:', error)
    return []
  }
}

/**
 * Duplicates a project
 */
export async function duplicateProject(
  projectId: string,
  clerkUserId: string
): Promise<Project | null> {
  try {
    const originalProject = await getProject(projectId)

    if (!originalProject) {
      return null
    }

    const duplicatedProject = await createProject(clerkUserId, {
      title: `${originalProject.title} (Copy)`,
      description: originalProject.description || undefined,
      image_url: originalProject.image_url,
      overlay_config: originalProject.overlay_config,
      tags: originalProject.tags || [],
      is_public: false,
    })

    return duplicatedProject
  } catch (error) {
    console.error('Error duplicating project:', error)
    return null
  }
}

/**
 * Generates the final image with text-behind-object effect
 */
export async function generateProjectImage(
  project: Project,
  options?: {
    width?: number
    height?: number
    quality?: number
  }
): Promise<string | null> {
  try {
    // Extract text overlay config from project
    const overlayConfig = project.overlay_config as any

    if (!overlayConfig || !overlayConfig.text) {
      console.error('❌ No text overlay config found in project')
      throw new Error(
        'Project data is incomplete. No text found in overlay configuration.'
      )
    }

    console.log('🎨 Generating text-behind-object effect...')
    console.log('📊 Project data:', {
      title: project.title,
      imageUrl: project.image_url,
      overlayConfig: overlayConfig,
    })

    // Import background removal function
    const { removeBackground } = await import('@imgly/background-removal')

    // Create canvas for rendering
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Could not get canvas context')
    }

    // Load the original image
    const bgImg = new Image()
    bgImg.crossOrigin = 'anonymous'

    return new Promise(async (resolve, reject) => {
      bgImg.onload = async () => {
        try {
          console.log('🖼️ Background image loaded successfully')

          // Set canvas dimensions
          const targetWidth = options?.width || Math.min(bgImg.width, 1920)
          const targetHeight = options?.height || Math.min(bgImg.height, 1080)

          // Maintain aspect ratio
          const aspectRatio = bgImg.width / bgImg.height
          let outputWidth = targetWidth
          let outputHeight = outputWidth / aspectRatio

          if (outputHeight > targetHeight) {
            outputHeight = targetHeight
            outputWidth = outputHeight * aspectRatio
          }

          canvas.width = outputWidth
          canvas.height = outputHeight

          console.log(`📐 Canvas dimensions: ${outputWidth}x${outputHeight}`)

          // Step 1: Draw background image
          ctx.drawImage(bgImg, 0, 0, outputWidth, outputHeight)
          console.log('✅ Step 1: Background image drawn')

          // Step 2: Draw text
          ctx.save()
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'

          // Font configuration
          const fontFamily = overlayConfig.fontFamily || 'Inter, sans-serif'
          const baseFontSize = overlayConfig.fontSize || 48

          // Scale font size for output resolution
          const maxDimension = Math.max(outputWidth, outputHeight)
          const scaleFactor = maxDimension / 1000
          let fontSize = baseFontSize * Math.max(scaleFactor, 0.3)

          const fontStyleString =
            overlayConfig.fontStyle === 'italic' ? 'italic ' : ''
          const fontWeight = overlayConfig.fontWeight || '400'
          ctx.font = `${fontStyleString}${fontWeight} ${fontSize}px ${fontFamily}`

          // Auto-scale text to fit
          const measuredWidth = ctx.measureText(overlayConfig.text).width
          const targetTextWidth = outputWidth * 0.9
          if (measuredWidth > targetTextWidth) {
            fontSize *= targetTextWidth / measuredWidth
            ctx.font = `${fontStyleString}${fontWeight} ${fontSize}px ${fontFamily}`
          }

          // Text styling
          ctx.fillStyle = overlayConfig.color || '#ffffff'
          ctx.globalAlpha = overlayConfig.opacity || 1

          // Text position
          const x = (outputWidth * (overlayConfig.position?.x || 50)) / 100
          const y = (outputHeight * (overlayConfig.position?.y || 50)) / 100

          console.log(
            `📝 Drawing text: "${overlayConfig.text}" at (${x}, ${y}) with font size ${fontSize}`
          )

          // Apply rotation if specified
          if (overlayConfig.rotation && overlayConfig.rotation !== 0) {
            ctx.translate(x, y)
            ctx.rotate((overlayConfig.rotation * Math.PI) / 180)
            ctx.fillText(overlayConfig.text, 0, 0)
            ctx.rotate((-overlayConfig.rotation * Math.PI) / 180)
            ctx.translate(-x, -y)
          } else {
            ctx.fillText(overlayConfig.text, x, y)
          }

          ctx.restore()
          console.log('✅ Step 2: Text drawn successfully')

          // Step 3: Remove background and draw foreground
          console.log('🔄 Step 3: Starting background removal...')

          try {
            const blob = await removeBackground(project.image_url)
            console.log('✅ Background removal completed')

            const processedUrl = URL.createObjectURL(blob)

            const fgImg = new Image()
            fgImg.onload = () => {
              console.log('✅ Foreground image loaded, drawing over text...')

              // Draw the foreground (subject) over the text
              ctx.drawImage(fgImg, 0, 0, outputWidth, outputHeight)

              // Convert to data URL
              const quality = options?.quality || 0.95
              const dataUrl = canvas.toDataURL('image/png', quality)

              // Clean up
              URL.revokeObjectURL(processedUrl)

              console.log(
                '✅ Text-behind-object effect generated successfully!'
              )
              resolve(dataUrl)
            }

            fgImg.onerror = () => {
              console.error('❌ Failed to load processed foreground image')
              URL.revokeObjectURL(processedUrl)

              // Fallback: return image with text overlay (no behind effect)
              const dataUrl = canvas.toDataURL(
                'image/png',
                options?.quality || 0.95
              )
              console.log('⚠️ Fallback: Returning image with text overlay only')
              resolve(dataUrl)
            }

            fgImg.src = processedUrl
          } catch (bgRemovalError) {
            console.error('❌ Background removal failed:', bgRemovalError)

            // Fallback: return image with text overlay (no behind effect)
            const dataUrl = canvas.toDataURL(
              'image/png',
              options?.quality || 0.95
            )
            console.log('⚠️ Fallback: Returning image with text overlay only')
            resolve(dataUrl)
          }
        } catch (error) {
          console.error('❌ Error in image generation process:', error)
          reject(error)
        }
      }

      bgImg.onerror = () => {
        console.error(
          '❌ Failed to load background image from:',
          project.image_url
        )
        reject(new Error('Failed to load background image'))
      }

      console.log('🔄 Loading background image from:', project.image_url)
      bgImg.src = project.image_url
    })
  } catch (error) {
    console.error('❌ Error generating project image:', error)
    throw error // Don't return fallback, throw error so we can debug
  }
}

/**
 * Saves generated image to storage and updates project
 */
export async function saveGeneratedImageToStorage(
  projectId: string,
  imageDataUrl: string,
  clerkUserId: string,
  metadata?: {
    title?: string
    description?: string
    overlayConfig?: Record<string, any>
  }
): Promise<{ imageUrl: string; thumbnailUrl: string } | null> {
  try {
    console.log('💾 Saving generated image to Cloudinary (FREE)...')

    // Convert data URL to blob
    const imageBlob = dataUrlToBlob(imageDataUrl)

    // Upload main image to Cloudinary
    const imageResult = await uploadImageToCloudinary(
      imageBlob,
      `${metadata?.title || 'generated'}_${Date.now()}.png`,
      'imprintify/generated',
      clerkUserId
    )

    if (!imageResult) {
      console.error('❌ Failed to upload main image to Cloudinary')
      return null
    }

    // Generate thumbnail URL using Cloudinary transformations (no separate upload needed!)
    const thumbnailUrl = generateCloudinaryThumbnail(
      imageResult.url,
      400,
      400,
      'auto'
    )

    // Update project with new image URLs
    console.log(
      '🔄 Updating project with generated image URL:',
      imageResult.url
    )
    const updatedProject = await updateProject(projectId, {
      image_url: imageResult.url,
      overlay_config: metadata?.overlayConfig || {},
    })

    if (!updatedProject) {
      console.error('❌ Failed to update project with new image URLs')
      return null
    }

    console.log(
      '✅ Project updated successfully with new image URL:',
      updatedProject.image_url
    )

    console.log('✅ Generated image saved to Cloudinary successfully')
    return {
      imageUrl: imageResult.url,
      thumbnailUrl: thumbnailUrl,
    }
  } catch (error) {
    console.error('❌ Error saving generated image:', error)
    return null
  }
}

/**
 * Downloads a project as an image
 */
export async function downloadProject(
  project: Project,
  filename?: string
): Promise<boolean> {
  try {
    console.log('📥 Starting download for project:', project.title)
    console.log('🔍 Image URL:', project.image_url)

    // Check if project has a Cloudinary URL
    if (project.image_url && project.image_url.includes('cloudinary.com')) {
      console.log('☁️ Downloading from Cloudinary...')
      // Download directly from Cloudinary
      const downloadName =
        filename ||
        `imprintly-${Date.now()}.png`

      return await downloadImageFromCloudinary(project.image_url, downloadName)
    }

    // For auto-saved projects or projects without valid URLs, generate the image
    console.log('🎨 Generating image from project data...')

    // Check if we have overlay config
    if (!project.overlay_config) {
      console.error('❌ No overlay config found in project')
      throw new Error('Project data is incomplete. Cannot generate image.')
    }

    // For auto-saved projects, we need to ask user to re-upload the image
    if (
      !project.image_url ||
      project.image_url.startsWith('blob:') ||
      project.image_url === 'auto-saved-download'
    ) {
      throw new Error(
        'This auto-saved project needs the original image to be re-uploaded. Please go to Create page and upload your image again.'
      )
    }

    // Fallback: Generate the final image with text overlay
    const imageDataUrl = await generateProjectImage(project, {
      width: 1920,
      height: 1080,
      quality: 0.95,
    })

    if (!imageDataUrl) {
      console.error('❌ Failed to generate image')
      throw new Error('Failed to generate image from project data.')
    }

    // Import download utility
    const { downloadDataUrl } = await import('./image-processor')

    // Generate filename
    const defaultFilename = `imprintly-${Date.now()}.jpg`

    console.log('⬇️ Downloading generated image...')
    // Download the image
    downloadDataUrl(imageDataUrl, filename || defaultFilename)

    return true
  } catch (error) {
    console.error('❌ Download error:', error)
    throw error // Re-throw to show user the specific error message
  }
}

/**
 * Gets project statistics for a user
 */
export async function getUserProjectStats(clerkUserId: string): Promise<{
  totalProjects: number
  publicProjects: number
  privateProjects: number
  totalViews: number
}> {
  try {
    const projects = await getUserProjects(clerkUserId)

    const stats = {
      totalProjects: projects.length,
      publicProjects: projects.filter((p) => p.is_public).length,
      privateProjects: projects.filter((p) => !p.is_public).length,
      totalViews: 0, // Would need a views table to track this
    }

    return stats
  } catch (error) {
    console.error('Error getting user project stats:', error)
    return {
      totalProjects: 0,
      publicProjects: 0,
      privateProjects: 0,
      totalViews: 0,
    }
  }
}
