"use client"

import type React from "react"

import { useState } from "react"
import { X, Mail, User, Calendar, Heart, Loader2, Dog, Cat, Fish, Bird } from "lucide-react"
import { getWebhookEndpoint, logWebhookUsage } from "../types/webhook-endpoints"

interface CustomerHubModalProps {
  isOpen: boolean
  onClose: () => void
  uniqueUrl: string
  professionalName: string
}

interface Pet {
  pet_name: string
  pet_id: string
  pet_type: string
}

interface Booking {
  booking_id: string
  start: string
  end: string
  start_formatted: string
  end_formatted: string
  booking_date_formatted: string
  day_of_week: string
  professional_name: string
  customer_first_name: string
  customer_last_name: string
  is_recurring: boolean
}

interface CustomerData {
  pets: Pet[]
  bookings: Booking[]
}

export default function CustomerHubModal({ isOpen, onClose, uniqueUrl, professionalName }: CustomerHubModalProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [customerData, setCustomerData] = useState<CustomerData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const getPetIcon = (petType: string) => {
    const type = petType.toLowerCase()
    if (type.includes("dog")) return <Dog className="w-5 h-5" />
    if (type.includes("cat")) return <Cat className="w-5 h-5" />
    if (type.includes("fish")) return <Fish className="w-5 h-5" />
    if (type.includes("bird")) return <Bird className="w-5 h-5" />
    return <Heart className="w-5 h-5" />
  }

  const getBookingColor = (index: number) => {
    const colors = [
      "bg-orange-100 border-orange-300 text-orange-800",
      "bg-purple-100 border-purple-300 text-purple-800",
      "bg-teal-100 border-teal-300 text-teal-800",
      "bg-pink-100 border-pink-300 text-pink-800",
      "bg-blue-100 border-blue-300 text-blue-800",
    ]
    return colors[index % colors.length]
  }

  const groupBookingsByDate = (bookings: Booking[]) => {
    const grouped: { [key: string]: Booking[] } = {}
    bookings.forEach((booking) => {
      const date = booking.booking_date_formatted
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(booking)
    })
    return grouped
  }

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

      if (Array.isArray(data) && data.length > 0) {
        const pets = data[0]?.pets || []
        const bookings = data.slice(1) || []

        setCustomerData({
          pets,
          bookings,
        })
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
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
            <div className="space-y-6 max-h-[70vh] overflow-y-auto">
              {customerData.pets && customerData.pets.length > 0 && (
                <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-6 border border-orange-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 header-font flex items-center gap-2">
                    <Heart className="w-6 h-6 text-[#E75837]" />
                    Your Pets
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customerData.pets.map((pet, index) => (
                      <div key={pet.pet_id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="text-[#E75837]">{getPetIcon(pet.pet_type)}</div>
                          <div>
                            <p className="font-semibold text-lg body-font">{pet.pet_name}</p>
                            <p className="text-gray-600 body-font">{pet.pet_type}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {customerData.bookings && customerData.bookings.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 header-font flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-[#E75837]" />
                    Your Upcoming Appointments
                  </h3>

                  {Object.entries(groupBookingsByDate(customerData.bookings)).map(([date, bookings]) => (
                    <div key={date} className="mb-6 last:mb-0">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 bg-[#E75837] rounded-full"></div>
                        <h4 className="font-semibold text-gray-900 body-font">
                          {new Date(date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </h4>
                      </div>

                      <div className="space-y-3 ml-5">
                        {bookings.map((booking, index) => (
                          <div key={booking.booking_id} className={`rounded-lg p-4 border-2 ${getBookingColor(index)}`}>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-semibold body-font">Appointment with {booking.professional_name}</p>
                                <p className="text-sm body-font mt-1">
                                  {booking.start_formatted} - {booking.end_formatted}
                                </p>
                                {booking.is_recurring && (
                                  <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-white/50 rounded-full">
                                    Recurring
                                  </span>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium body-font">Booking #{booking.booking_id}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No bookings message */}
              {(!customerData.bookings || customerData.bookings.length === 0) && (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 body-font text-lg">No upcoming appointments scheduled</p>
                  <p className="text-gray-500 body-font text-sm mt-1">Contact us to book your next appointment!</p>
                </div>
              )}

              {/* Back button */}
              <button
                onClick={resetModal}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors body-font"
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
