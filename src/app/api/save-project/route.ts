import { NextRequest, NextResponse } from 'next/server'
import {
  validateUsagePermissions,
  validateRequestSecurity,
} from '@/lib/usage-security'
import { createSupabaseServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // 1. Validate request security
    if (!validateRequestSecurity(request)) {
      console.warn('🚫 Security validation failed for save project')
      return NextResponse.json(
        { error: 'Request validation failed' },
        { status: 403 }
      )
    }

    // 2. Validate user permissions (but don't require usage check for saving)
    const validation = await validateUsagePermissions(request, false)

    if (!validation.success) {
      console.warn(
        '🚫 User validation failed for save project:',
        validation.error
      )
      return NextResponse.json(
        { error: validation.error },
        { status: validation.statusCode || 403 }
      )
    }

    const body = await request.json()
    const { background_image, text_elements, canvas_size, generated_image } =
      body

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl || supabaseUrl.includes('your_supabase')) {
      // Return mock response for development
      return NextResponse.json({
        success: true,
        project_id: `mock-project-${Date.now()}`,
        message: 'Project saved (mock)',
      })
    }

    const supabase = createSupabaseServerClient()

    // Get userId from validation result
    const userId = validation.userId

    // Get user profile to ensure user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()

    if (userError || !user) {
      console.error('Error fetching user:', userError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create project record
    const projectData = {
      user_id: user.id,
      title: `Project ${new Date().toLocaleDateString()}`,
      description: `Generated on ${new Date().toLocaleString()}`,
      background_image_url: background_image,
      text_elements: text_elements,
      canvas_settings: canvas_size,
      generated_image_url: generated_image,
      status: 'completed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single()

    if (projectError) {
      console.error('Error saving project:', projectError)
      return NextResponse.json(
        { error: 'Failed to save project' },
        { status: 500 }
      )
    }

    // Update user's project count (optional analytics)
    await supabase.rpc('increment_user_projects', { user_id: user.id })

    return NextResponse.json({
      success: true,
      project_id: project.id,
      project: project,
      message: 'Project saved successfully',
    })
  } catch (error) {
    console.error('Error in save-project API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
