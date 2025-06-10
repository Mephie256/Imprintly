import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { syncUserWithSupabase } from '@/lib/user-service'

export async function POST(req: NextRequest) {
  const debugInfo: any = {
    step: '',
    data: {},
    errors: [],
  }

  try {
    const { fullName, emailAddress, password, testSupabaseSync } =
      await req.json()

    debugInfo.step = 'Input validation'
    debugInfo.data.input = {
      fullName,
      emailAddress,
      password: '***',
      testSupabaseSync,
    }

    console.log('=== SIGNUP DEBUG START ===')
    console.log('Test signup request:', debugInfo.data.input)

    // Split the full name
    const trimmedName = fullName.trim()
    const nameParts = trimmedName
      .split(/\s+/)
      .filter((part: string) => part.length > 0)

    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    debugInfo.step = 'Name parsing'
    debugInfo.data.nameParsing = {
      trimmedName,
      nameParts,
      firstName,
      lastName,
      hasLastName: !!lastName && lastName.trim() !== '',
    }

    console.log('Parsed name:', debugInfo.data.nameParsing)

    // Validate that we have at least a first name
    if (!firstName || firstName.trim() === '') {
      debugInfo.errors.push('No first name provided')
      return NextResponse.json(
        {
          error: 'Please enter at least your first name.',
          debug: debugInfo,
        },
        { status: 400 }
      )
    }

    // Prepare user data for Clerk Admin API - use correct format from official docs
    const clerkUserData: any = {
      emailAddress: [emailAddress], // Array of strings, not objects
      password,
    }

    // Add name fields if available - use camelCase as per official docs
    if (firstName && firstName.trim() !== '') {
      clerkUserData.firstName = firstName.trim()
    }

    if (lastName && lastName.trim() !== '') {
      clerkUserData.lastName = lastName.trim()
    }

    debugInfo.step = 'Clerk user data preparation'
    debugInfo.data.clerkUserData = { ...clerkUserData, password: '***' }

    console.log('Clerk user data to create:', debugInfo.data.clerkUserData)

    try {
      debugInfo.step = 'Clerk user creation'

      // Test creating user with Clerk
      const client = await clerkClient()
      const user = await client.users.createUser(clerkUserData)

      debugInfo.data.clerkUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddresses: user.emailAddresses?.map((e) => e.emailAddress),
        imageUrl: user.imageUrl,
      }

      console.log('User created successfully:', debugInfo.data.clerkUser)

      // Test Supabase sync if requested
      if (testSupabaseSync) {
        debugInfo.step = 'Supabase sync test'

        try {
          console.log('Testing Supabase sync...')
          const syncResult = await syncUserWithSupabase(user)

          debugInfo.data.supabaseSync = {
            success: !!syncResult,
            result: syncResult,
          }

          console.log('Supabase sync result:', debugInfo.data.supabaseSync)
        } catch (syncError: any) {
          debugInfo.errors.push(`Supabase sync error: ${syncError.message}`)
          debugInfo.data.supabaseSyncError = {
            message: syncError.message,
            stack: syncError.stack,
          }
          console.error('Supabase sync error:', syncError)
        }
      }

      console.log('=== SIGNUP DEBUG END ===')

      return NextResponse.json({
        success: true,
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        message: 'User created successfully',
        debug: debugInfo,
      })
    } catch (clerkError: any) {
      debugInfo.step = 'Clerk error handling'
      debugInfo.errors.push(`Clerk API error: ${clerkError.message}`)
      debugInfo.data.clerkError = {
        message: clerkError.message,
        errors: clerkError.errors,
        status: clerkError.status,
        clerkTraceId: clerkError.clerkTraceId,
        longMessage: clerkError.longMessage,
      }

      console.error('Clerk error details:', debugInfo.data.clerkError)

      return NextResponse.json(
        {
          error: 'Clerk API error',
          details: clerkError.message,
          clerkErrors: clerkError.errors,
          debug: debugInfo,
        },
        { status: 400 }
      )
    }
  } catch (error: any) {
    debugInfo.step = 'General error handling'
    debugInfo.errors.push(`General error: ${error.message}`)
    debugInfo.data.generalError = {
      message: error.message,
      stack: error.stack,
    }

    console.error('Test signup error:', error)
    console.log('=== SIGNUP DEBUG END (ERROR) ===')

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message,
        debug: debugInfo,
      },
      { status: 500 }
    )
  }
}
