import { createSupabaseBrowserClient } from './supabase'

export interface Template {
  id: string
  title: string
  description: string | null
  preview_url: string
  overlay_config: Record<string, any>
  category: string
  is_premium: boolean
  created_at: string
  updated_at: string
  usage_count: number
}

/**
 * Gets all templates
 */
export async function getTemplates(
  category?: string,
  includePremium: boolean = false
): Promise<Template[]> {
  try {
    const supabase = createSupabaseBrowserClient()

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl || supabaseUrl.includes('your_supabase')) {
      console.warn('Supabase not configured. Returning mock templates.')
      // Return mock templates for development
      const mockTemplates: Template[] = [
        {
          id: 'mock-template-1',
          title: 'Simple Text Overlay',
          description: 'Clean and minimal text overlay',
          preview_url:
            'https://via.placeholder.com/400x300/10b981/ffffff?text=Simple+Text',
          overlay_config: {
            text: 'Sample Text',
            fontSize: 48,
            color: '#ffffff',
            position: { x: 50, y: 50 },
          },
          category: 'basic',
          is_premium: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          usage_count: 150,
        },
        {
          id: 'mock-template-2',
          title: 'Bold Title',
          description: 'Eye-catching bold title overlay',
          preview_url:
            'https://via.placeholder.com/400x300/3b82f6/ffffff?text=Bold+Title',
          overlay_config: {
            text: 'BOLD TITLE',
            fontSize: 72,
            color: '#000000',
            fontWeight: 'bold',
            position: { x: 50, y: 30 },
          },
          category: 'titles',
          is_premium: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          usage_count: 89,
        },
        {
          id: 'mock-template-3',
          title: 'Premium Gradient',
          description: 'Beautiful gradient text effect',
          preview_url:
            'https://via.placeholder.com/400x300/f59e0b/ffffff?text=Premium+Gradient',
          overlay_config: {
            text: 'Gradient Text',
            fontSize: 56,
            gradient: { from: '#ff6b6b', to: '#4ecdc4' },
            position: { x: 50, y: 50 },
          },
          category: 'premium',
          is_premium: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          usage_count: 45,
        },
      ]

      let filteredTemplates = mockTemplates

      if (category) {
        filteredTemplates = filteredTemplates.filter(
          (t) => t.category === category
        )
      }

      if (!includePremium) {
        filteredTemplates = filteredTemplates.filter((t) => !t.is_premium)
      }

      return filteredTemplates
    }

    let query = supabase
      .from('templates')
      .select('*')
      .order('usage_count', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    if (!includePremium) {
      query = query.eq('is_premium', false)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching templates:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error getting templates:', error)
    return []
  }
}

/**
 * Gets a specific template by ID
 */
export async function getTemplate(
  templateId: string
): Promise<Template | null> {
  try {
    const supabase = createSupabaseBrowserClient()

    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (error) {
      console.error('Error fetching template:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error getting template:', error)
    return null
  }
}

/**
 * Gets templates by category
 */
export async function getTemplatesByCategory(
  category: string,
  includePremium: boolean = false
): Promise<Template[]> {
  try {
    const supabase = createSupabaseBrowserClient()

    let query = supabase
      .from('templates')
      .select('*')
      .eq('category', category)
      .order('usage_count', { ascending: false })

    if (!includePremium) {
      query = query.eq('is_premium', false)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching templates by category:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error getting templates by category:', error)
    return []
  }
}

/**
 * Gets premium templates
 */
export async function getPremiumTemplates(): Promise<Template[]> {
  try {
    const supabase = createSupabaseBrowserClient()

    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('is_premium', true)
      .order('usage_count', { ascending: false })

    if (error) {
      console.error('Error fetching premium templates:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error getting premium templates:', error)
    return []
  }
}

/**
 * Increments template usage count
 */
export async function incrementTemplateUsage(
  templateId: string
): Promise<boolean> {
  try {
    const supabase = createSupabaseBrowserClient()

    // Get current usage count
    const { data: template, error: fetchError } = await supabase
      .from('templates')
      .select('usage_count')
      .eq('id', templateId)
      .single()

    if (fetchError || !template) {
      console.error('Error fetching template for usage count:', fetchError)
      return false
    }

    // Increment usage count
    const { error } = await supabase
      .from('templates')
      .update({ usage_count: template.usage_count + 1 })
      .eq('id', templateId)

    if (error) {
      console.error('Error incrementing template usage:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error incrementing template usage:', error)
    return false
  }
}

/**
 * Gets template categories
 */
export async function getTemplateCategories(): Promise<string[]> {
  try {
    const supabase = createSupabaseBrowserClient()

    const { data, error } = await supabase
      .from('templates')
      .select('category')
      .order('category')

    if (error) {
      console.error('Error fetching template categories:', error)
      return []
    }

    // Get unique categories
    const categories = [...new Set(data?.map((item) => item.category) || [])]
    return categories
  } catch (error) {
    console.error('Error getting template categories:', error)
    return []
  }
}

/**
 * Searches templates by title or description
 */
export async function searchTemplates(
  query: string,
  includePremium: boolean = false
): Promise<Template[]> {
  try {
    const supabase = createSupabaseBrowserClient()

    let queryBuilder = supabase
      .from('templates')
      .select('*')
      .or(`title.ilike.%${query}%, description.ilike.%${query}%`)
      .order('usage_count', { ascending: false })

    if (!includePremium) {
      queryBuilder = queryBuilder.eq('is_premium', false)
    }

    const { data, error } = await queryBuilder.limit(50)

    if (error) {
      console.error('Error searching templates:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error searching templates:', error)
    return []
  }
}
