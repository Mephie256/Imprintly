import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    console.log('=== DATABASE VERIFICATION START ===')
    
    const supabase = createSupabaseServerClient()
    const results: any = {
      supabaseConfigured: false,
      tablesExist: {},
      tableStructures: {},
      errors: []
    }

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('your_supabase')) {
      results.errors.push('Supabase environment variables not configured')
      return NextResponse.json({
        configured: false,
        message: 'Supabase not configured',
        results
      })
    }

    results.supabaseConfigured = true
    console.log('Supabase configuration found')

    // Check if tables exist
    const tablesToCheck = ['users', 'projects', 'templates']
    
    for (const tableName of tablesToCheck) {
      try {
        console.log(`Checking table: ${tableName}`)
        
        // Try to query the table structure
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)

        if (error) {
          console.error(`Error querying ${tableName}:`, error)
          results.tablesExist[tableName] = false
          results.errors.push(`Table ${tableName} error: ${error.message}`)
        } else {
          results.tablesExist[tableName] = true
          console.log(`Table ${tableName} exists and is accessible`)
        }
      } catch (err: any) {
        console.error(`Exception checking ${tableName}:`, err)
        results.tablesExist[tableName] = false
        results.errors.push(`Table ${tableName} exception: ${err.message}`)
      }
    }

    // Get detailed table structure for users table
    if (results.tablesExist.users) {
      try {
        console.log('Getting users table structure...')
        
        // Try to get table info using information_schema
        const { data: columns, error: columnsError } = await supabase
          .rpc('get_table_columns', { table_name: 'users' })
          .single()

        if (columnsError) {
          console.log('RPC not available, trying direct query...')
          
          // Fallback: try to insert a test record to see what columns are expected
          const testData = {
            clerk_user_id: 'test-verification-id',
            email: 'test@verification.com',
            first_name: 'Test',
            last_name: 'User',
            full_name: 'Test User',
            subscription_tier: 'free',
            usage_count: 0,
            preferences: {}
          }

          const { error: insertError } = await supabase
            .from('users')
            .insert(testData)

          if (insertError) {
            results.tableStructures.users = {
              error: insertError.message,
              details: insertError.details,
              hint: insertError.hint
            }
          } else {
            // Clean up test record
            await supabase
              .from('users')
              .delete()
              .eq('clerk_user_id', 'test-verification-id')
            
            results.tableStructures.users = {
              status: 'Insert test successful - table structure appears correct'
            }
          }
        } else {
          results.tableStructures.users = columns
        }
      } catch (err: any) {
        console.error('Error getting table structure:', err)
        results.tableStructures.users = {
          error: err.message
        }
      }
    }

    // Test basic operations
    if (results.tablesExist.users) {
      try {
        console.log('Testing basic operations...')
        
        // Test count query
        const { count, error: countError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })

        if (countError) {
          results.errors.push(`Count query error: ${countError.message}`)
        } else {
          results.userCount = count
          console.log(`Users table has ${count} records`)
        }
      } catch (err: any) {
        results.errors.push(`Basic operations error: ${err.message}`)
      }
    }

    console.log('=== DATABASE VERIFICATION END ===')

    return NextResponse.json({
      configured: results.supabaseConfigured,
      allTablesExist: Object.values(results.tablesExist).every(exists => exists),
      message: results.errors.length === 0 ? 'Database verification successful' : 'Issues found',
      results
    })

  } catch (error: any) {
    console.error('Database verification error:', error)
    return NextResponse.json({
      configured: false,
      error: 'Verification failed',
      details: error.message
    }, { status: 500 })
  }
}
