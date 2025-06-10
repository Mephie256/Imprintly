import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

// Types for our database schema
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          clerk_user_id: string
          email: string
          first_name: string | null
          last_name: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          subscription_tier: 'free' | 'monthly' | 'yearly'
          usage_count: number
          preferences: Record<string, any> | null
        }
        Insert: {
          id?: string
          clerk_user_id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          subscription_tier?: 'free' | 'monthly' | 'yearly'
          usage_count?: number
          preferences?: Record<string, any> | null
        }
        Update: {
          id?: string
          clerk_user_id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          subscription_tier?: 'free' | 'monthly' | 'yearly'
          usage_count?: number
          preferences?: Record<string, any> | null
        }
      }
      projects: {
        Row: {
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
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          image_url: string
          overlay_config: Record<string, any>
          created_at?: string
          updated_at?: string
          is_public?: boolean
          tags?: string[] | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          image_url?: string
          overlay_config?: Record<string, any>
          created_at?: string
          updated_at?: string
          is_public?: boolean
          tags?: string[] | null
        }
      }
      templates: {
        Row: {
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
        Insert: {
          id?: string
          title: string
          description?: string | null
          preview_url: string
          overlay_config: Record<string, any>
          category: string
          is_premium?: boolean
          created_at?: string
          updated_at?: string
          usage_count?: number
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          preview_url?: string
          overlay_config?: Record<string, any>
          category?: string
          is_premium?: boolean
          created_at?: string
          updated_at?: string
          usage_count?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_tier: 'free' | 'monthly' | 'yearly'
    }
  }
}

// Browser client for client-side operations
export const createSupabaseBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes('your_supabase')
  ) {
    console.warn(
      'Supabase environment variables not configured. Using mock client.'
    )
    // Return a mock client that won't cause errors
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              single: () => Promise.resolve({ data: null, error: null }),
            }),
          }),
        }),
        delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
        order: () => ({
          limit: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
    } as any
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Server client for server-side operations (with service role key)
export const createSupabaseServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (
    !supabaseUrl ||
    !supabaseServiceKey ||
    supabaseUrl.includes('your_supabase')
  ) {
    console.warn(
      'Supabase server environment variables not configured. Using mock client.'
    )
    // Return a mock client that won't cause errors
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              single: () => Promise.resolve({ data: null, error: null }),
            }),
          }),
        }),
        delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
      }),
    } as any
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Default browser client
export const supabase = createSupabaseBrowserClient()
