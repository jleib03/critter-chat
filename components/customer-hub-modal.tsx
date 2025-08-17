"use client"

import type React from "react"

import { useState } from "react"
import { X, Mail, User, Calendar, Heart, Loader2 } from "lucide-react"
import { getWebhookEndpoint, logWebhookUsage } from "../types/webhook-endpoints"

interface CustomerHubModalProps {
  isOpen: boolean
  onClose: () => void
  uniqueUrl: string
  professionalName: string
}

interface CustomerData {
  customer_name: string
  email: string
  phone?: string
  pets: Array<{
    name: string
    type: string
    breed?: string
  }>
  upcoming_bookings: Array<{
    service_name: string
    date: string
    time: string
    status: string
  }>
}

export default function CustomerHubModal({ isOpen, onClose, uniqueUrl, professionalName }: CustomerHubModalProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [customerData, setCustomerData] = useState<CustomerData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const webhookUrl = getWebhookEndpoint("CUSTOMER_HUB")
      logWebhookUsage("CUSTOMER_HUB", "initialize_customer_hub")

      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

      const payload = {
        action: "initialize_customer_hub",
        unique_url: uniqueUrl,
        professional_name: professionalName,
        customer_email: email.trim(),
        timestamp: new Date().toISOString(),
        timezone: userTimezone,
      }

      console.log("Sending customer hub webhook:", payload)

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log("Customer hub response:", data)

      // Parse the response data
      if (data && (data.customer_name || data.email)) {
        setCustomerData(data)
      } else {
        setError("No customer information found for this email address.")
      }
    } catch (err) {
      console.error("Error fetching customer data:", err)
      setError("Unable to retrieve customer information. Please check your email and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetModal = () => {
    setEmail("")
    setCustomerData(null)
    setError(null)
    setIsLoading(false)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#E75837] to-[#d04e30] p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold header-font">Customer Portal</h2>
              <p className="text-white/90 body-font">Access your booking information</p>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {!customerData ? (
            /* Email Input Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 body-font">
                  Enter your email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E75837] focus:border-transparent body-font"
                    required
                    disabled={isLoading}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2 body-font">
                  We'll look up your booking history and pet information
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 body-font">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full bg-[#E75837] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#d04e30] disabled:opacity-50 disabled:cursor-not-allowed transition-colors body-font flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Looking up your information...
                  </>
                ) : (
                  <>
                    <User className="w-5 h-5" />
                    Access My Portal
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Customer Information Display */
            <div className="space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 header-font flex items-center gap-2">
                  <User className="w-5 h-5 text-[#E75837]" />
                  Customer Information
                </h3>
                <div className="space-y-1">
                  <p className="body-font">
                    <strong>Name:</strong> {customerData.customer_name}
                  </p>
                  <p className="body-font">
                    <strong>Email:</strong> {customerData.email}
                  </p>
                  {customerData.phone && (
                    <p className="body-font">
                      <strong>Phone:</strong> {customerData.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Pet Information */}
              {customerData.pets && customerData.pets.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 header-font flex items-center gap-2">
                    <Heart className="w-5 h-5 text-[#E75837]" />
                    Your Pets
                  </h3>
                  <div className="space-y-2">
                    {customerData.pets.map((pet, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="font-medium body-font">{pet.name}</p>
                        <p className="text-sm text-gray-600 body-font">
                          {pet.type}
                          {pet.breed ? ` • ${pet.breed}` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Bookings */}
              {customerData.upcoming_bookings && customerData.upcoming_bookings.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 header-font flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#E75837]" />
                    Upcoming Appointments
                  </h3>
                  <div className="space-y-2">
                    {customerData.upcoming_bookings.map((booking, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium body-font">{booking.service_name}</p>
                            <p className="text-sm text-gray-600 body-font">
                              {booking.date} at {booking.time}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              booking.status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No upcoming bookings message */}
              {(!customerData.upcoming_bookings || customerData.upcoming_bookings.length === 0) && (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 body-font">No upcoming appointments scheduled</p>
                </div>
              )}

              {/* Back button */}
              <button
                onClick={resetModal}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors body-font"
              >
                Look up different email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
