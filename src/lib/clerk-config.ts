/**
 * Clerk Configuration
 *
 * This file contains configuration options for Clerk authentication.
 * It helps manage password validation and security settings.
 */

export const clerkConfig = {
  // Appearance configuration
  appearance: {
    variables: {
      colorPrimary: '#10b981',
      colorText: '#111827',
      colorTextSecondary: '#6b7280',
      colorBackground: '#ffffff',
      colorInputBackground: '#ffffff',
      colorInputText: '#111827',
    },
    elements: {
      formButtonPrimary: 'bg-emerald-500 hover:bg-emerald-600 text-white',
      card: 'shadow-xl border border-gray-200',
      headerTitle: 'text-gray-900',
      headerSubtitle: 'text-gray-600',
      socialButtonsBlockButton: 'border border-gray-200 hover:bg-gray-50',
      formFieldInput:
        'border border-gray-200 focus:border-emerald-400 focus:ring-emerald-500/20',
      footerActionLink: 'text-emerald-600 hover:text-emerald-700',
    },
  },

  // Sign up configuration
  signUp: {
    // Custom password validation (client-side)
    passwordValidation: {
      minLength: 8,
      requireUppercase: false,
      requireLowercase: false,
      requireNumbers: false,
      requireSpecialChars: false,
    },
  },

  // Error message mappings for better UX
  errorMessages: {
    passwordBreach:
      'Please choose a different password for your account security.',
    passwordWeak: 'Password must be at least 8 characters long.',
    passwordGeneric: 'Please choose a stronger password.',
    emailInvalid: 'Please enter a valid email address.',
    emailTaken: 'An account with this email already exists.',
    verificationFailed: 'Invalid verification code. Please try again.',
    networkError: 'Network error. Please check your connection and try again.',
  },
}

/**
 * Helper function to handle Clerk errors with user-friendly messages
 */
export function handleClerkError(error: any): string {
  const errorMessage =
    error.errors?.[0]?.longMessage ||
    error.errors?.[0]?.message ||
    error.message ||
    'An unexpected error occurred'

  // Map common Clerk errors to user-friendly messages
  if (errorMessage.includes('data breach') || errorMessage.includes('breach')) {
    return clerkConfig.errorMessages.passwordBreach
  }

  if (errorMessage.includes('password') && errorMessage.includes('weak')) {
    return clerkConfig.errorMessages.passwordWeak
  }

  if (errorMessage.includes('password')) {
    return clerkConfig.errorMessages.passwordGeneric
  }

  if (errorMessage.includes('email') && errorMessage.includes('invalid')) {
    return clerkConfig.errorMessages.emailInvalid
  }

  if (errorMessage.includes('email') && errorMessage.includes('exists')) {
    return clerkConfig.errorMessages.emailTaken
  }

  if (errorMessage.includes('verification') || errorMessage.includes('code')) {
    return clerkConfig.errorMessages.verificationFailed
  }

  if (errorMessage.includes('network') || errorMessage.includes('connection')) {
    return clerkConfig.errorMessages.networkError
  }

  // Return the original message if no mapping found
  return errorMessage
}

/**
 * Client-side password validation
 */
export function validatePassword(password: string): {
  isValid: boolean
  message?: string
} {
  const config = clerkConfig.signUp.passwordValidation

  // Allow empty password during typing
  if (password.length === 0) {
    return { isValid: true }
  }

  if (password.length < config.minLength) {
    return {
      isValid: false,
      message: `Password must be at least ${config.minLength} characters long.`,
    }
  }

  // Check for common weak passwords
  const commonWeakPasswords = [
    'password',
    'password123',
    '123456',
    '123456789',
    'qwerty',
    'abc123',
    'password1',
    'admin',
    'letmein',
    'welcome',
  ]

  if (commonWeakPasswords.includes(password.toLowerCase())) {
    return {
      isValid: false,
      message: 'Please choose a more unique password.',
    }
  }

  // Check for basic strength requirements
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /\d/.test(password)

  if (password.length >= 8 && hasLetter && hasNumber) {
    return { isValid: true }
  }

  if (!hasLetter || !hasNumber) {
    return {
      isValid: false,
      message: 'Password should contain both letters and numbers.',
    }
  }

  return { isValid: true }
}

/**
 * Client-side name validation
 */
export function validateName(name: string): {
  isValid: boolean
  message?: string
} {
  // Allow empty name during typing
  if (name.length === 0) {
    return { isValid: true }
  }

  if (name.length < 2) {
    return {
      isValid: false,
      message: 'Name must be at least 2 characters long.',
    }
  }

  // Check for invalid characters (numbers, special characters except spaces, hyphens, apostrophes)
  const validNamePattern = /^[a-zA-Z\s\-']+$/
  if (!validNamePattern.test(name)) {
    return {
      isValid: false,
      message:
        'Name can only contain letters, spaces, hyphens, and apostrophes.',
    }
  }

  // Check for reasonable length
  if (name.length > 50) {
    return {
      isValid: false,
      message: 'Name must be less than 50 characters.',
    }
  }

  // Check that it's not just spaces
  if (name.trim().length === 0) {
    return {
      isValid: false,
      message: 'Please enter a valid name.',
    }
  }

  return { isValid: true }
}

/**
 * Helper function to split full name into first and last name
 */
export function splitFullName(fullName: string): {
  firstName: string
  lastName: string
} {
  const trimmedName = fullName.trim()

  // Handle empty or whitespace-only names
  if (!trimmedName) {
    return {
      firstName: '',
      lastName: '',
    }
  }

  const nameParts = trimmedName.split(/\s+/).filter((part) => part.length > 0)

  if (nameParts.length === 0) {
    return {
      firstName: '',
      lastName: '',
    }
  }

  if (nameParts.length === 1) {
    return {
      firstName: nameParts[0],
      lastName: '',
    }
  }

  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(' ')

  return {
    firstName,
    lastName,
  }
}

/**
 * Check if error is related to password breach detection
 */
export function isPasswordBreachError(error: any): boolean {
  const errorMessage =
    error.errors?.[0]?.longMessage ||
    error.errors?.[0]?.message ||
    error.message ||
    ''
  return errorMessage.includes('data breach') || errorMessage.includes('breach')
}
