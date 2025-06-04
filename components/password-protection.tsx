"use client"
import { useState } from "react"
import type React from "react"

import { Lock, Eye, EyeOff } from "lucide-react"

// Professional access password - you can change this as needed
const PROFESSIONAL_PASSWORD = "CritterPro2024!"

interface PasswordProtectionProps {
  onAuthenticated: () => void
  title?: string
  description?: string
}

export default function PasswordProtection({
  onAuthenticated,
  title = "Professional Access Required",
  description = "Please enter the professional access password to continue.",
}: PasswordProtectionProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    // Simulate a brief loading state for better UX
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (password === PROFESSIONAL_PASSWORD) {
      onAuthenticated()
    } else {
      setError("Incorrect password. Please try again.")
      setPassword("")
    }

    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Lock Icon */}
          <div className="w-16 h-16 bg-[#94ABD6] rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="h-8 w-8 text-white" />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2 header-font">{title}</h1>
            <p className="text-gray-600 body-font">{description}</p>
          </div>

          {/* Password Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 body-font">
                Professional Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94ABD6] body-font"
                  placeholder="Enter password"
                  disabled={isSubmitting}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {error && <p className="mt-2 text-sm text-red-600 body-font">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !password.trim()}
              className="w-full py-3 bg-[#94ABD6] text-white rounded-lg hover:bg-[#7a94c7] transition-colors font-medium body-font disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Verifying..." : "Access Professional Area"}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 body-font">
              Don't have the password? Contact your Critter administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
