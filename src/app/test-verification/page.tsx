'use client'

import { useState } from 'react'
import { useSignUp } from '@clerk/nextjs'

export default function TestVerificationPage() {
  const { signUp, isLoaded } = useSignUp()
  const [testResults, setTestResults] = useState<any[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addResult = (
    test: string,
    status: 'pass' | 'fail' | 'info',
    message: string,
    data?: any
  ) => {
    setTestResults((prev) => [
      ...prev,
      {
        test,
        status,
        message,
        data,
        timestamp: new Date().toISOString(),
      },
    ])
  }

  const runVerificationTests = async () => {
    if (!isLoaded || !signUp) {
      addResult('Setup', 'fail', 'Clerk not loaded or signUp not available')
      return
    }

    setIsRunning(true)
    setTestResults([])

    try {
      // Test 1: Check signUp object state
      addResult('SignUp State', 'info', 'Checking current signUp state', {
        status: signUp.status,
        unverifiedFields: signUp.unverifiedFields,
        missingFields: signUp.missingFields,
        createdSessionId: signUp.createdSessionId ? 'present' : 'missing',
        createdUserId: signUp.createdUserId ? 'present' : 'missing',
        verifications: signUp.verifications,
        emailAddress: signUp.emailAddress,
        firstName: signUp.firstName,
        lastName: signUp.lastName,
        username: signUp.username,
        phoneNumber: signUp.phoneNumber,
      })

      // Test 2: Check if verification is pending
      if (
        signUp.status === 'missing_requirements' &&
        signUp.unverifiedFields.includes('email_address')
      ) {
        addResult(
          'Verification Status',
          'pass',
          'Email verification is pending as expected'
        )

        // Test 3: Check if we can prepare verification
        try {
          await signUp.prepareEmailAddressVerification({
            strategy: 'email_code',
          })
          addResult(
            'Prepare Verification',
            'pass',
            'Successfully prepared email verification'
          )
        } catch (err: any) {
          addResult(
            'Prepare Verification',
            'fail',
            `Failed to prepare verification: ${err.message}`
          )
        }
      } else if (signUp.status === 'complete') {
        addResult('Verification Status', 'info', 'SignUp is already complete', {
          sessionId: signUp.createdSessionId ? 'present' : 'missing',
        })
      } else {
        addResult(
          'Verification Status',
          'info',
          `Unexpected signUp status: ${signUp.status}`
        )
      }

      // Test 4: Test verification attempt with invalid code
      try {
        const result = await signUp.attemptEmailAddressVerification({
          code: '000000',
        })
        addResult('Invalid Code Test', 'info', 'Verification attempt result', {
          status: result.status,
          missingFields: result.missingFields,
          unverifiedFields: result.unverifiedFields,
          verifications: result.verifications,
          error: 'No error (unexpected)',
        })
      } catch (err: any) {
        addResult(
          'Invalid Code Test',
          'pass',
          'Invalid code properly rejected',
          {
            error: err.errors?.[0]?.message || err.message,
            errorCode: err.errors?.[0]?.code,
            clerkTraceId: err.clerkTraceId,
          }
        )
      }

      // Test 5: Check what fields Clerk expects
      addResult(
        'Required Fields Analysis',
        'info',
        'Analyzing what Clerk expects',
        {
          currentData: {
            emailAddress: signUp.emailAddress,
            firstName: signUp.firstName,
            lastName: signUp.lastName,
            username: signUp.username,
            phoneNumber: signUp.phoneNumber,
          },
          missingFields: signUp.missingFields,
          unverifiedFields: signUp.unverifiedFields,
          recommendations: [
            'Check Clerk dashboard settings for required fields',
            'Verify if username or phone number is required',
            'Check if first/last name are mandatory',
            'Ensure all required fields are provided during signup',
          ],
        }
      )
    } catch (error: any) {
      addResult('Test Suite', 'fail', `Test suite failed: ${error.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Email Verification Test Suite
          </h1>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              This page tests the email verification flow to identify and debug
              issues.
            </p>

            <div className="flex space-x-4">
              <button
                onClick={runVerificationTests}
                disabled={isRunning || !isLoaded}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {isRunning ? 'Running Tests...' : 'Run Verification Tests'}
              </button>

              <button
                onClick={clearResults}
                disabled={isRunning}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                Clear Results
              </button>
            </div>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Test Results
              </h2>

              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.status === 'pass'
                      ? 'bg-green-50 border-green-200'
                      : result.status === 'fail'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">
                      {result.status === 'pass'
                        ? '✅'
                        : result.status === 'fail'
                        ? '❌'
                        : 'ℹ️'}{' '}
                      {result.test}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-2">{result.message}</p>

                  {result.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                        View Details
                      </summary>
                      <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">
              Instructions for Testing
            </h3>
            <ol className="list-decimal list-inside text-yellow-700 space-y-1">
              <li>
                First, go to{' '}
                <a href="/auth/custom-signup" className="underline">
                  signup page
                </a>{' '}
                and create an account
              </li>
              <li>
                When you reach the email verification step, come back to this
                page
              </li>
              <li>Run the verification tests to see the current state</li>
              <li>
                Go back to the signup page and test the verification with the
                actual code
              </li>
              <li>
                Check browser console for detailed logs during verification
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
