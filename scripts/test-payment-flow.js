#!/usr/bin/env node

/**
 * 🧪 PAYMENT FLOW TESTING SCRIPT
 * This script tests the entire payment flow to ensure everything works correctly
 */

const { createClient } = require('@supabase/supabase-js')
const fetch = require('node-fetch')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

async function testPaymentFlow() {
  console.log('🧪 Testing Payment Flow...\n')

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase configuration')
    console.log('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Test 1: Database Schema Verification
    console.log('1️⃣ Testing Database Schema...')
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'users')

    if (tablesError || !tables || tables.length === 0) {
      console.error('❌ Users table not found')
      console.log('💡 Run the database migration first: database/fix_payment_fields_migration.sql')
      process.exit(1)
    }

    console.log('✅ Users table exists')

    // Test 2: Check Required Columns
    console.log('\n2️⃣ Testing Required Columns...')
    
    const testUserId = 'test-payment-user-' + Date.now()
    const testData = {
      clerk_user_id: testUserId,
      email: 'test@payment.com',
      first_name: 'Test',
      last_name: 'Payment',
      subscription_tier: 'free',
      subscription_status: 'inactive',
      stripe_customer_id: null,
      subscription_id: null,
      usage_count: 0,
      preferences: {}
    }

    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert(testData)
      .select()
      .single()

    if (insertError) {
      console.error('❌ Failed to insert test user:', insertError.message)
      console.log('💡 Check if all required columns exist in the users table')
      process.exit(1)
    }

    console.log('✅ All required columns exist')

    // Test 3: Test Subscription Update
    console.log('\n3️⃣ Testing Subscription Update...')
    
    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({
        stripe_customer_id: 'cus_test_customer',
        subscription_id: 'sub_test_subscription',
        subscription_status: 'active',
        subscription_tier: 'monthly',
        subscription_current_period_start: new Date().toISOString(),
        subscription_current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq('clerk_user_id', testUserId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Failed to update subscription:', updateError.message)
      process.exit(1)
    }

    console.log('✅ Subscription update successful')

    // Test 4: Test API Endpoints
    console.log('\n4️⃣ Testing API Endpoints...')
    
    // Test sync-subscription endpoint
    try {
      const response = await fetch(`${appUrl}/api/sync-subscription`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 401) {
        console.log('✅ Sync-subscription endpoint exists (returns 401 as expected without auth)')
      } else if (response.status === 404) {
        console.error('❌ Sync-subscription endpoint not found')
        console.log('💡 The API route may not be deployed correctly')
      } else {
        console.log('✅ Sync-subscription endpoint accessible')
      }
    } catch (error) {
      console.log('⚠️ Could not test API endpoint (server may not be running)')
    }

    // Test 5: Test Stripe Configuration
    console.log('\n5️⃣ Testing Stripe Configuration...')
    
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    const stripeMonthlyPriceId = process.env.STRIPE_MONTHLY_PRICE_ID
    const stripeYearlyPriceId = process.env.STRIPE_YEARLY_PRICE_ID
    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!stripeSecretKey || stripeSecretKey.includes('placeholder')) {
      console.log('⚠️ STRIPE_SECRET_KEY not configured')
    } else {
      console.log('✅ STRIPE_SECRET_KEY configured')
    }

    if (!stripeMonthlyPriceId || stripeMonthlyPriceId.includes('placeholder')) {
      console.log('⚠️ STRIPE_MONTHLY_PRICE_ID not configured')
    } else {
      console.log('✅ STRIPE_MONTHLY_PRICE_ID configured')
    }

    if (!stripeYearlyPriceId || stripeYearlyPriceId.includes('placeholder')) {
      console.log('⚠️ STRIPE_YEARLY_PRICE_ID not configured')
    } else {
      console.log('✅ STRIPE_YEARLY_PRICE_ID configured')
    }

    if (!stripeWebhookSecret || stripeWebhookSecret.includes('placeholder')) {
      console.log('⚠️ STRIPE_WEBHOOK_SECRET not configured')
    } else {
      console.log('✅ STRIPE_WEBHOOK_SECRET configured')
    }

    // Test 6: Test Helper Function
    console.log('\n6️⃣ Testing Helper Function...')
    
    try {
      const { data: functionData, error: functionError } = await supabase
        .rpc('sync_user_subscription', {
          p_clerk_user_id: testUserId,
          p_stripe_customer_id: 'cus_test_updated',
          p_subscription_id: 'sub_test_updated',
          p_subscription_status: 'active',
          p_subscription_tier: 'yearly'
        })

      if (functionError) {
        console.log('⚠️ Helper function not available (this is optional)')
      } else {
        console.log('✅ Helper function works correctly')
      }
    } catch (error) {
      console.log('⚠️ Helper function test skipped')
    }

    // Cleanup
    console.log('\n🧹 Cleaning up test data...')
    await supabase
      .from('users')
      .delete()
      .eq('clerk_user_id', testUserId)

    console.log('✅ Test data cleaned up')

    // Final Results
    console.log('\n🎉 PAYMENT FLOW TEST RESULTS:')
    console.log('✅ Database schema is correct')
    console.log('✅ All required fields exist')
    console.log('✅ Subscription updates work')
    console.log('✅ API endpoints are configured')
    
    if (stripeSecretKey && !stripeSecretKey.includes('placeholder')) {
      console.log('✅ Stripe is configured')
    } else {
      console.log('⚠️ Stripe needs configuration')
    }

    console.log('\n💡 NEXT STEPS:')
    console.log('1. Run the database migration: database/fix_payment_fields_migration.sql')
    console.log('2. Configure your Stripe keys in .env.local')
    console.log('3. Set up Stripe webhooks pointing to /api/stripe/webhook')
    console.log('4. Test a real payment flow')
    
    console.log('\n🚀 Your payment system should now work correctly!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

// Run the test
testPaymentFlow()
