'use client'

import { useState } from 'react'

export default function TestSignupPage() {
  const [fullName, setFullName] = useState('')
  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [testSupabaseSync, setTestSupabaseSync] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/test-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          emailAddress,
          password,
          testSupabaseSync,
        }),
      })

      const data = await response.json()
      setResult({
        status: response.status,
        data,
      })
    } catch (error) {
      setResult({
        status: 'error',
        data: { error: 'Network error', details: error },
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Signup Process</h1>

        <form onSubmit={handleTest} className="space-y-6 mb-8">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              placeholder="john@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              placeholder="Password123"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="testSupabaseSync"
              checked={testSupabaseSync}
              onChange={(e) => setTestSupabaseSync(e.target.checked)}
              className="w-4 h-4 text-emerald-600 bg-gray-800 border-gray-600 rounded focus:ring-emerald-500"
            />
            <label htmlFor="testSupabaseSync" className="text-sm font-medium">
              Test Supabase sync after user creation
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50">
            {loading ? 'Testing...' : 'Test Signup'}
          </button>
        </form>

        {result && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Test Result</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="font-medium">Status:</span>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    result.status === 200 ? 'bg-green-600' : 'bg-red-600'
                  }`}>
                  {result.status}
                </span>
              </div>

              {result.data.success && (
                <div className="bg-green-900/50 p-4 rounded">
                  <h3 className="font-semibold text-green-400 mb-2">
                    ✅ Success
                  </h3>
                  <p>
                    <strong>User ID:</strong> {result.data.userId}
                  </p>
                  <p>
                    <strong>Name:</strong> {result.data.firstName}{' '}
                    {result.data.lastName}
                  </p>
                </div>
              )}

              {result.data.error && (
                <div className="bg-red-900/50 p-4 rounded">
                  <h3 className="font-semibold text-red-400 mb-2">❌ Error</h3>
                  <p>
                    <strong>Error:</strong> {result.data.error}
                  </p>
                  <p>
                    <strong>Details:</strong> {result.data.details}
                  </p>
                </div>
              )}

              {result.data.debug && (
                <div className="bg-blue-900/50 p-4 rounded">
                  <h3 className="font-semibold text-blue-400 mb-2">
                    🔍 Debug Information
                  </h3>
                  <p>
                    <strong>Last Step:</strong> {result.data.debug.step}
                  </p>
                  {result.data.debug.errors.length > 0 && (
                    <div className="mt-2">
                      <strong>Errors:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {result.data.debug.errors.map(
                          (error: string, index: number) => (
                            <li key={index} className="text-red-300">
                              {error}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div>
                <strong>Full Response:</strong>
                <pre className="mt-2 p-4 bg-gray-900 rounded text-sm overflow-auto max-h-96">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-900/50 rounded-lg">
          <h3 className="font-semibold mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Enter test data in the form above</li>
            <li>Click "Test Signup" to test the Clerk user creation process</li>
            <li>Check the result to see if there are any parameter errors</li>
            <li>Check the browser console for detailed logs</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
