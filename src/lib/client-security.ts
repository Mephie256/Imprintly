/**
 * Client-side security utilities to prevent tampering and bypass attempts
 */

// Detect if developer tools are open
let devToolsOpen = false
let devToolsOpenTime = 0

const detectDevTools = () => {
  const threshold = 160

  if (
    window.outerHeight - window.innerHeight > threshold ||
    window.outerWidth - window.innerWidth > threshold
  ) {
    if (!devToolsOpen) {
      devToolsOpen = true
      devToolsOpenTime = Date.now()
      console.warn('🔍 Developer tools detected')
    }
  } else {
    devToolsOpen = false
  }
}

// Monitor for console tampering
const originalConsole = { ...console }
let consoleTampered = false

const detectConsoleTampering = () => {
  if (console.log !== originalConsole.log) {
    consoleTampered = true
    console.warn('🚫 Console tampering detected')
  }
}

// Detect script injection attempts
const detectScriptInjection = () => {
  const scripts = document.querySelectorAll('script')
  const suspiciousPatterns = [
    'fetch.*api.*usage',
    'XMLHttpRequest.*increment',
    'eval\\(',
    'Function\\(',
    'setTimeout.*fetch',
    'setInterval.*api',
  ]

  scripts.forEach((script) => {
    if (script.src && !script.src.startsWith(window.location.origin)) {
      console.warn('🚫 External script detected:', script.src)
    }

    if (script.textContent) {
      suspiciousPatterns.forEach((pattern) => {
        if (script.textContent && new RegExp(pattern, 'i').test(script.textContent)) {
          console.warn('🚫 Suspicious script pattern detected:', pattern)
        }
      })
    }
  })
}

// Monitor network requests (client-side only)
let originalFetch: typeof fetch
let suspiciousRequests = 0

const initializeFetchMonitoring = () => {
  if (typeof window === 'undefined') return

  // Skip fetch monitoring in development mode
  if (process.env.NODE_ENV === 'development') {
    return
  }

  originalFetch = window.fetch

  window.fetch = function (...args) {
    const url = args[0]?.toString() || ''

    // Monitor usage-related API calls
    if (
      url.includes('/api/increment-usage') ||
      url.includes('/api/validate-usage')
    ) {
      const stack = new Error().stack || ''

      // Check if request is coming from expected locations
      if (
        !stack.includes('TextBehindCreator') &&
        !stack.includes('usage-security')
      ) {
        suspiciousRequests++
        console.warn('🚫 Suspicious API request detected:', url)
        console.warn('Call stack:', stack)

        if (suspiciousRequests > 3) {
          console.error(
            '🚨 Multiple suspicious requests detected - potential bypass attempt'
          )
          return Promise.reject(new Error('Request blocked for security'))
        }
      }
    }

    return originalFetch.apply(this, args)
  }
}

// Detect local storage tampering (client-side only)
const monitorLocalStorage = () => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined')
    return

  const originalSetItem = localStorage.setItem
  const originalGetItem = localStorage.getItem

  localStorage.setItem = function (key, value) {
    if (
      key.includes('usage') ||
      key.includes('limit') ||
      key.includes('subscription')
    ) {
      console.warn('🚫 Attempt to modify usage-related localStorage:', key)
    }
    return originalSetItem.call(this, key, value)
  }

  localStorage.getItem = function (key) {
    const value = originalGetItem.call(this, key)
    if (key.includes('usage') && value) {
      // Validate that usage data hasn't been tampered with
      try {
        const parsed = JSON.parse(value)
        if (typeof parsed === 'object' && parsed.usage_count !== undefined) {
          // Additional validation could be added here
        }
      } catch (e) {
        console.warn('🚫 Invalid usage data in localStorage')
      }
    }
    return value
  }
}

// Detect React DevTools and state manipulation (client-side only)
const detectReactDevTools = () => {
  if (typeof window === 'undefined') return

  if ((window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.warn('🔍 React DevTools detected')
  }
}

// Monitor for DOM manipulation (client-side only)
const monitorDOMChanges = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element

            // Check for injected scripts
            if (element.tagName === 'SCRIPT') {
              console.warn('🚫 Script injection detected:', element)
            }

            // Check for suspicious attributes
            if (
              element.hasAttribute('onclick') ||
              element.hasAttribute('onload')
            ) {
              console.warn('🚫 Suspicious event handler detected:', element)
            }
          }
        })
      }
    })
  })

  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  }
}

// Initialize security monitoring
export const initializeClientSecurity = () => {
  if (typeof window === 'undefined') return

  // Disable security monitoring in development mode
  if (process.env.NODE_ENV === 'development') {
    return
  }

  // Start monitoring
  setInterval(detectDevTools, 1000)
  setInterval(detectConsoleTampering, 5000)
  setInterval(detectScriptInjection, 10000)

  // Initialize client-side monitoring
  initializeFetchMonitoring()
  monitorLocalStorage()
  detectReactDevTools()
  monitorDOMChanges()
}

// Security validation for critical operations
export const validateSecurityContext = (): boolean => {
  if (typeof window === 'undefined') return true // Allow on server-side

  // Always pass in development mode
  if (process.env.NODE_ENV === 'development') {
    return true
  }

  const securityChecks = [
    !consoleTampered,
    suspiciousRequests < 3,
    !devToolsOpen || Date.now() - devToolsOpenTime < 30000, // Allow brief dev tools usage
  ]

  const passed = securityChecks.every((check) => check)

  if (!passed) {
    console.warn('🚫 Security validation failed')
  }

  return passed
}

// Generate secure request headers
export const getSecureHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  }

  // Add client-side security header only in browser
  if (typeof window !== 'undefined') {
    headers['X-Client-Security'] = btoa(Date.now().toString())
  }

  return headers
}

// Obfuscated usage check (makes it harder to find and bypass)
export const performSecurityCheck = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Randomize timing to make automation harder
    const delay = Math.random() * 1000 + 500

    setTimeout(() => {
      const isSecure = validateSecurityContext()
      resolve(isSecure)
    }, delay)
  })
}
