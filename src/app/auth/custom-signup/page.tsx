'use client'

import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import Image from 'next/image'

import {
  handleClerkError,
  validatePassword,
  validateName,
  splitFullName,
  isPasswordBreachError,
} from '@/lib/clerk-config'

// This comment is added to force re-evaluation by TypeScript language server
export default function CustomSignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isOAuthLoading, setIsOAuthLoading] = useState(false)
  const [error, setError] = useState('')
  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [verificationSuccess, setVerificationSuccess] = useState(false)
  const [nameValidation, setNameValidation] = useState<{
    isValid: boolean
    message?: string
  }>({ isValid: true })
  const [passwordValidation, setPasswordValidation] = useState<{
    isValid: boolean
    message?: string
  }>({ isValid: true })

  // Handle name change with real-time validation
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setFullName(newName)

    // Validate name in real-time
    const validation = validateName(newName)
    setNameValidation(validation)
  }

  // Handle password change with real-time validation
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setPassword(newPassword)

    // Validate password in real-time
    const validation = validatePassword(newPassword)
    setPasswordValidation(validation)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Split the full name into first and last name for Clerk
      const { firstName, lastName } = splitFullName(fullName)

      // Validate that we have at least a first name
      if (!firstName || firstName.trim() === '') {
        setError('Please enter at least your first name.')
        return
      }

      // Prepare user data for Clerk client-side API - use camelCase
      // Start with minimal required fields
      const clerkUserData: any = {
        emailAddress,
        password,
      }

      // Only add name fields if they exist and are not empty
      // This prevents sending empty string values which might cause issues
      if (firstName && firstName.trim() !== '') {
        clerkUserData.firstName = firstName.trim()
        console.log('Adding firstName:', firstName.trim())
      }

      if (lastName && lastName.trim() !== '') {
        clerkUserData.lastName = lastName.trim()
        console.log('Adding lastName:', lastName.trim())
      }

      console.log(
        'Creating Clerk user with data (client-side API):',
        clerkUserData
      )

      // Try to create the user with the prepared data
      let result
      try {
        result = await signUp.create(clerkUserData)
      } catch (nameError: any) {
        // If we get a parameter error related to names, try without name fields
        if (
          nameError.errors &&
          nameError.errors.some(
            (error: any) =>
              error.message &&
              (error.message.includes('first_name is not a valid parameter') ||
                error.message.includes('last_name is not a valid parameter') ||
                error.message.includes('firstName is not a valid parameter') ||
                error.message.includes('lastName is not a valid parameter'))
          )
        ) {
          console.log(
            'Name parameter error detected, trying without name fields...'
          )

          // Try again with just email and password
          const minimalUserData = {
            emailAddress,
            password,
          }

          console.log('Retrying with minimal data:', minimalUserData)
          result = await signUp.create(minimalUserData)
        } else {
          // Re-throw the error if it's not related to name parameters
          throw nameError
        }
      }

      if (result.status === 'complete') {
        // If we successfully created the user but without name fields,
        // try to update the user with name information
        if (
          (firstName && firstName.trim() !== '') ||
          (lastName && lastName.trim() !== '')
        ) {
          try {
            console.log('Attempting to update user with name information...')
            await result.update({
              firstName: firstName?.trim() || undefined,
              lastName: lastName?.trim() || undefined,
            })
            console.log('Successfully updated user with name information')
          } catch (updateError) {
            console.warn(
              'Could not update user with name information:',
              updateError
            )
            // Don't fail the signup process if name update fails
          }
        }

        await setActive({ session: result.createdSessionId })
        router.push('/dashboard')
      } else if (result.status === 'missing_requirements') {
        // Check if email verification is required
        if (result.unverifiedFields.includes('email_address')) {
          await signUp.prepareEmailAddressVerification({
            strategy: 'email_code',
          })
          setPendingVerification(true)
        }
      }
    } catch (err: any) {
      console.error('Signup error:', err)
      console.error('Error details:', {
        message: err.message,
        errors: err.errors,
        status: err.status,
        clerkTraceId: err.clerkTraceId,
      })

      // Check for specific parameter errors
      if (
        err.errors &&
        err.errors.some(
          (error: any) =>
            error.message &&
            (error.message.includes('last_name is not a valid parameter') ||
              error.message.includes('first_name is not a valid parameter'))
        )
      ) {
        setError(
          'There was an issue with the name format. Please try entering just your first name.'
        )
        return
      }

      // Use the centralized error handler
      const userFriendlyMessage = handleClerkError(err)

      // If it's a password breach error, we can provide additional guidance
      if (isPasswordBreachError(err)) {
        console.warn(
          'Password breach detected - this may be a false positive from Clerk'
        )
        setError(
          'Please try a different password. For security, we check passwords against known data breaches.'
        )
      } else {
        setError(userFriendlyMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signUp) {
      console.error('Clerk not loaded or signUp not available')
      return
    }

    // Validate code format
    if (!code || code.trim().length !== 6) {
      setError('Please enter a valid 6-digit verification code')
      return
    }

    setIsLoading(true)
    setError('')

    console.log('=== EMAIL VERIFICATION START ===')
    console.log('Attempting verification with code:', code.replace(/./g, '*'))
    console.log('SignUp status before verification:', signUp.status)
    console.log('SignUp unverified fields:', signUp.unverifiedFields)

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: code.trim(),
      })

      console.log('Verification result:', {
        status: result.status,
        createdSessionId: result.createdSessionId ? 'present' : 'missing',
        createdUserId: result.createdUserId ? 'present' : 'missing',
        unverifiedFields: result.unverifiedFields,
        missingFields: result.missingFields,
        verifications: result.verifications,
        nextStep: (result as any).nextStep,
      })

      // Log the complete result object for debugging
      console.log(
        'Complete verification result object:',
        JSON.stringify(result, null, 2)
      )

      if (result.status === 'complete') {
        console.log('✅ Verification complete, activating session...')

        // Ensure we have a session to activate
        if (!result.createdSessionId) {
          console.error('❌ No session ID found in completed signup')
          setError(
            'Verification completed but no session was created. Please try signing in.'
          )
          return
        }

        try {
          // Show success state immediately
          setVerificationSuccess(true)

          // Activate the session
          await setActive({ session: result.createdSessionId })
          console.log('✅ Session activated successfully')

          // Small delay to show success state and ensure session is fully activated
          await new Promise((resolve) => setTimeout(resolve, 1000))

          // Redirect to dashboard
          console.log('🔄 Redirecting to dashboard...')
          router.push('/dashboard')
        } catch (sessionError: any) {
          console.error('❌ Error activating session:', sessionError)
          setError(
            'Verification successful but failed to activate session. Please try signing in.'
          )
        }
      } else if (result.status === 'missing_requirements') {
        console.log('⚠️ Additional verification required')
        console.log('Missing fields:', result.missingFields)
        console.log('Unverified fields:', result.unverifiedFields)

        // Check if email is still unverified
        if (result.unverifiedFields && result.unverifiedFields.includes('email_address')) {
          setError(
            'Email verification is still pending. Please check your email for a new code.'
          )
          // Optionally resend verification email
          try {
            await signUp.prepareEmailAddressVerification({
              strategy: 'email_code',
            })
            console.log('📧 New verification email sent')
          } catch (resendError) {
            console.error('Failed to resend verification email:', resendError)
          }
        } else {
          // Email is verified but other requirements are missing
          console.log('✅ Email verified, but other requirements missing')

          // Try to complete the signup by updating with any missing information
          try {
            console.log('🔄 Attempting to complete signup with current data...')

            // Get the current user data from the form
            const { firstName, lastName } = splitFullName(fullName)

            // Try to update the signup with any missing user data
            const updateData: any = {}

            // Add name fields if they're missing and we have them
            if (result.missingFields?.includes('first_name') && firstName) {
              updateData.firstName = firstName.trim()
            }
            if (result.missingFields?.includes('last_name') && lastName) {
              updateData.lastName = lastName.trim()
            }

            console.log('Updating signup with data:', updateData)

            let updateResult
            if (Object.keys(updateData).length > 0) {
              updateResult = await signUp.update(updateData)
              console.log('Update result:', updateResult.status)
            } else {
              // Try to complete without additional data
              updateResult = result
            }

            // Check if the update completed the signup
            if (updateResult.status === 'complete') {
              console.log('✅ Signup completed after update!')

              if (updateResult.createdSessionId) {
                setVerificationSuccess(true)
                await setActive({ session: updateResult.createdSessionId })
                await new Promise((resolve) => setTimeout(resolve, 1000))
                router.push('/dashboard')
                return
              }
            } else {
              console.log(
                '⚠️ Signup still not complete after update:',
                updateResult.status
              )
              setError(
                `Additional information required. Missing: ${
                  result.missingFields?.join(', ') || 'unknown fields'
                }`
              )
            }
          } catch (updateError: any) {
            console.error('❌ Failed to complete signup:', updateError)
            setError(
              `Unable to complete signup. Missing: ${
                result.missingFields?.join(', ') || 'required fields'
              }`
            )
          }
        }
      } else {
        console.log('⚠️ Unexpected verification status:', result.status)
        setError(
          `Verification returned unexpected status: ${result.status}. Please try again.`
        )
      }
    } catch (err: any) {
      console.error('❌ Verification error:', err)
      console.error('Error details:', {
        message: err.message,
        errors: err.errors,
        status: err.status,
        clerkTraceId: err.clerkTraceId,
      })

      // Handle specific error cases
      if (err.errors && err.errors.length > 0) {
        const errorMessage =
          err.errors[0]?.longMessage || err.errors[0]?.message

        if (errorMessage?.includes('already been verified')) {
          console.log('⚠️ Code already used - verification may have succeeded')
          setError(
            'This verification code has already been used. If you just verified, please wait a moment and try refreshing the page.'
          )

          // Check if signup is actually complete
          if (signUp.status === 'complete' && signUp.createdSessionId) {
            console.log(
              '🔄 Signup appears complete, attempting to activate session...'
            )
            try {
              await setActive({ session: signUp.createdSessionId })
              router.push('/dashboard')
              return
            } catch (sessionError) {
              console.error(
                'Failed to activate existing session:',
                sessionError
              )
            }
          }
        } else if (errorMessage?.includes('expired')) {
          setError('Verification code has expired. Please request a new code.')
          // Optionally resend verification email
          try {
            await signUp.prepareEmailAddressVerification({
              strategy: 'email_code',
            })
            console.log('📧 New verification email sent due to expiration')
          } catch (resendError) {
            console.error('Failed to resend verification email:', resendError)
          }
        } else if (
          errorMessage?.includes('invalid') ||
          errorMessage?.includes('incorrect')
        ) {
          setError(
            'Invalid verification code. Please check your email and try again.'
          )
        } else {
          setError(errorMessage || 'Verification failed. Please try again.')
        }
      } else {
        setError(
          'Network error during verification. Please check your connection and try again.'
        )
      }
    } finally {
      setIsLoading(false)
      console.log('=== EMAIL VERIFICATION END ===')
    }
  }

  const handleResendCode = async () => {
    if (!isLoaded || !signUp || isResending || resendCooldown > 0) {
      return
    }

    setIsResending(true)
    setError('')

    try {
      console.log('📧 Resending verification email...')
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Start cooldown timer (60 seconds)
      setResendCooldown(60)
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      console.log('✅ Verification email resent successfully')
    } catch (err: any) {
      console.error('❌ Failed to resend verification email:', err)
      setError('Failed to resend verification code. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  const handleOAuthSignUp = async (strategy: 'oauth_google') => {
    if (!isLoaded) {
      return
    }

    setIsOAuthLoading(true)
    setError('')

    try {
      console.log('🔄 Starting Google OAuth signup...')
      const result = await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard', // Fixed: redirect to dashboard instead of root
      })
      console.log('OAuth redirect initiated:', result)
    } catch (err: any) {
      console.error('OAuth error:', err)
      console.error(
        'OAuth error details:',
        err.errors?.[0]?.longMessage || err.message
      )
      setError('Failed to sign up with Google. Please try again.')
    } finally {
      // Note: We don't reset loading state here because the page will redirect
      // If there's an error, the loading state will be reset
      if (error) {
        setIsOAuthLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900 text-gray-300 modern-background auth-page">
      <div className="flex bg-white rounded-3xl shadow-2xl overflow-hidden max-w-5xl w-full max-h-[90vh] border border-white/20">
        {/* Left side - Form */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            {!pendingVerification ? (
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Create your account 👋
                </h1>
                <p className="text-gray-600">
                  Please enter your details to get started
                </p>
              </div>
            ) : (
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Check your email 📧
                </h1>
                <p className="text-gray-600">We sent you a verification code</p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
                {error}
              </div>
            )}

            {verificationSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm">
                ✅ Email verified successfully! Redirecting to dashboard...
              </div>
            )}

            {!pendingVerification && (
              <>
                <button
                  onClick={() => handleOAuthSignUp('oauth_google')}
                  disabled={isOAuthLoading || isLoading}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-2xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 mb-6 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isOAuthLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connecting to Google...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Sign up with Google
                    </>
                  )}
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">or</span>
                  </div>
                </div>
              </>
            )}

            {!pendingVerification ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={fullName}
                    onChange={handleNameChange}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 transition-all duration-200 text-gray-900 ${
                      nameValidation.isValid
                        ? 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
                        : 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    }`}
                    required
                    disabled={isLoading}
                  />
                  {!nameValidation.isValid && nameValidation.message && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {nameValidation.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-gray-900"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="Create a strong password"
                      className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 transition-all duration-200 pr-12 text-gray-900 ${
                        passwordValidation.isValid
                          ? 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
                          : 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      }`}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                      disabled={isLoading}>
                      {showPassword ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {!passwordValidation.isValid &&
                    passwordValidation.message && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {passwordValidation.message}
                      </p>
                    )}
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-2xl text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerification} className="space-y-5">
                <div>
                  <label
                    htmlFor="code"
                    className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="000000"
                    className="w-full px-4 py-3 text-xl text-gray-900 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-center tracking-[0.5em] font-mono"
                    required
                    disabled={isLoading}
                    maxLength={6}
                  />
                  <p className="mt-2 text-sm text-gray-600">
                    We sent a 6-digit code to{' '}
                    <span className="font-medium">{emailAddress}</span>
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-2xl text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    'Verify Email'
                  )}
                </button>
                <div className="flex flex-col space-y-3 mt-6">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isResending || resendCooldown > 0}
                    className="w-full py-3 text-sm text-emerald-600 hover:text-emerald-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                    {isResending ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-emerald-600 inline"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : resendCooldown > 0 ? (
                      `Resend code in ${resendCooldown}s`
                    ) : (
                      '📧 Resend verification code'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPendingVerification(false)}
                    className="w-full py-3 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 font-medium">
                    ← Back to signup
                  </button>
                </div>
              </form>
            )}

            <div className="text-center mt-6">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <a
                  href="/auth/custom-login"
                  className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors duration-200">
                  Sign In
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Beautiful landscape image */}
        <div className="hidden md:block md:w-1/2 p-4">
          <div className="relative overflow-hidden rounded-3xl h-full">
            <img
              src="/landscape-hero.png"
              alt="Beautiful landscape with terraced fields"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
