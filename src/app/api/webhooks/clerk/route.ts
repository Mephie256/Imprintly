import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { syncUserWithSupabase } from '@/lib/user-service'

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    console.warn('CLERK_WEBHOOK_SECRET not configured. Webhooks disabled.')
    return NextResponse.json(
      { message: 'Webhooks not configured' },
      { status: 200 }
    )
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  // Get the body
  const payload = await req.text()

  // Create a new Svix instance with your secret
  const wh = new Webhook(webhookSecret)

  let evt: any

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return NextResponse.json(
      { error: 'Error verifying webhook' },
      { status: 400 }
    )
  }

  // Handle the webhook
  const eventType = evt.type
  console.log(`Received webhook: ${eventType}`)

  try {
    switch (eventType) {
      case 'user.created':
      case 'user.updated':
        const user = evt.data
        console.log('Syncing user with Supabase:', user.id)

        // Process sync in background to avoid blocking the webhook response
        syncUserWithSupabase(user)
          .then((syncResult) => {
            if (syncResult) {
              console.log('User synced successfully:', syncResult.id)
            } else {
              console.error('Failed to sync user with Supabase')
            }
          })
          .catch((error) => {
            console.error('Error syncing user:', error)
          })
        break

      case 'user.deleted':
        // Handle user deletion if needed
        console.log('User deleted:', evt.data.id)
        // You might want to soft delete or anonymize user data instead of hard delete
        break

      default:
        console.log(`Unhandled webhook event: ${eventType}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    )
  }
}
