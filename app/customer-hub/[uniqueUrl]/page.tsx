"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Mail,
  User,
  Calendar,
  Heart,
  Loader2,
  Dog,
  Cat,
  Fish,
  Bird,
  ChevronLeft,
  ChevronRight,
  Plus,
  Shield,
  FileText,
} from "lucide-react"
import { getWebhookEndpoint, logWebhookUsage } from "../../../types/webhook-endpoints"

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
  service_types?: string
  service_names?: string
}

interface Invoice {
  invoice_number: string
  status: string
  due_date: string
  amount: string
}

interface CustomerData {
  pets: Pet[]
  bookings: Booking[]
  invoices?: Invoice[]
  payment_instructions?: string
}

export default function CustomerHubPage() {
  const params = useParams()
  const router = useRouter()
  const uniqueUrl = params.uniqueUrl as string

  const [email, setEmail] = useState("")
  const [validationCode, setValidationCode] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [step, setStep] = useState<"email" | "code" | "data">("email")
  const [isLoading, setIsLoading] = useState(false)
  const [customerData, setCustomerData] = useState<CustomerData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [professionalName, setProfessionalName] = useState("")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activeTab, setActiveTab] = useState<"pets" | "appointments" | "invoices">("pets")

  useEffect(() => {
    setProfessionalName("Professional") // Placeholder
  }, [uniqueUrl])

  const getPetIcon = (petType: string) => {
    const type = petType.toLowerCase()
    if (type.includes("dog")) return <Dog className="w-5 h-5" />
    if (type.includes("cat")) return <Cat className="w-5 h-5" />
    if (type.includes("fish")) return <Fish className="w-5 h-5" />
    if (type.includes("bird")) return <Bird className="w-5 h-5" />
    return <Heart className="w-5 h-5" />
  }

  const getServiceTypeColor = (serviceTypes: string) => {
    const types = serviceTypes?.toLowerCase() || ""
    if (types.includes("walking")) return "bg-green-100 border-green-300 text-green-800"
    if (types.includes("grooming")) return "bg-purple-100 border-purple-300 text-purple-800"
    if (types.includes("drop-in")) return "bg-blue-100 border-blue-300 text-blue-800"
    if (types.includes("other")) return "bg-orange-100 border-orange-300 text-orange-800"
    return "bg-gray-100 border-gray-300 text-gray-800"
  }

  const getStatusBadgeStyle = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower === "overdue") return "bg-red-100 text-red-800 border-red-200"
    if (statusLower === "paid") return "bg-green-100 text-green-800 border-green-200"
    if (statusLower === "cancelled") return "bg-gray-100 text-gray-800 border-gray-200"
    return "bg-blue-100 text-blue-800 border-blue-200"
  }

  const convertToUserTimezone = (utcTime: string) => {
    if (!utcTime || typeof utcTime !== "string") {
      return "Invalid time"
    }

    try {
      const date = new Date(utcTime)
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return "Invalid time"
      }

      return date.toLocaleString("en-US", {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    } catch (error) {
      console.error("[v0] Error converting timezone:", error, "for time:", utcTime)
      return "Invalid time"
    }
  }

  const generateCalendarDays = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const current = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return days
  }

  const getBookingsForDate = (date: Date) => {
    if (!customerData?.bookings) return []

    if (!date || isNaN(date.getTime())) {
      return []
    }

    try {
      const dateStr = date.toISOString().split("T")[0]
      return customerData.bookings.filter((booking) => {
        if (!booking.start || typeof booking.start !== "string") {
          return false
        }

        try {
          const bookingDate = new Date(booking.start)
          // Check if the booking date is valid
          if (isNaN(bookingDate.getTime())) {
            return false
          }

          const bookingDateStr = bookingDate.toISOString().split("T")[0]
          return bookingDateStr === dateStr
        } catch (error) {
          console.error("[v0] Error parsing booking date:", error, "for booking:", booking.booking_id)
          return false
        }
      })
    } catch (error) {
      console.error("[v0] Error in getBookingsForDate:", error)
      return []
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const webhookUrl = getWebhookEndpoint("CUSTOMER_HUB")
      logWebhookUsage("CUSTOMER_HUB", "validate_email")

      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

      const payload = {
        action: "validate_email",
        unique_url: uniqueUrl,
        professional_name: professionalName,
        customer_email: email.trim(),
        timestamp: new Date().toISOString(),
        timezone: userTimezone,
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      if (Array.isArray(data) && data.length > 0 && data[0].random_code) {
        setGeneratedCode(data[0].random_code)
        setStep("code")
      } else {
        throw new Error("Invalid response format")
      }
    } catch (err) {
      console.error("Error validating email:", err)
      setError("Unable to send validation code. Please check your email and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validationCode.trim()) return

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
        generated_code: generatedCode,
        user_submitted_code: validationCode.trim(),
        timestamp: new Date().toISOString(),
        timezone: userTimezone,
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (Array.isArray(data) && data.length > 0 && data[0].Output === "Incorrect Code, Please Try Again") {
        setError("Incorrect code, please try again or go back and request a new code")
        return
      }

      if (Array.isArray(data) && data.length > 0) {
        console.log("[v0] Full webhook response:", JSON.stringify(data, null, 2))

        const firstItem = data[0]
        console.log("[v0] First item:", JSON.stringify(firstItem, null, 2))

        const pets = firstItem?.pets || []
        const lastItem = data[data.length - 1]
        const invoices = lastItem?.invoices || []
        const payment_instructions = lastItem?.payment_instructions || ""
        console.log("[v0] Extracted invoices:", JSON.stringify(invoices, null, 2))

        const bookings = data.slice(1, -1) || []

        setCustomerData({
          pets,
          bookings,
          invoices,
          payment_instructions,
        })
        setStep("data")
      } else {
        setError("Incorrect validation code. Please try again.")
      }
    } catch (err) {
      console.error("Error validating code:", err)
      setError("Incorrect validation code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setEmail("")
    setValidationCode("")
    setGeneratedCode("")
    setStep("email")
    setCustomerData(null)
    setError(null)
    setIsLoading(false)
  }

  const calendarDays = generateCalendarDays(currentDate)
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#E75837] to-[#d04e30] text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold header-font">Customer Portal</h1>
                <p className="text-white/90 body-font">Access your booking information and pet details</p>
              </div>
            </div>
            {step === "data" && customerData && (
              <Link
                href={`/schedule/${uniqueUrl}`}
                className="bg-white text-[#E75837] py-2 px-6 rounded-lg font-medium hover:bg-gray-100 transition-colors body-font flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Appointment
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {step === "email" && (
          /* Email Input Form */
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <form onSubmit={handleEmailSubmit} className="space-y-6">
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
                    We'll send you a verification code to access your information
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
                      Sending verification code...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Send Verification Code
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {step === "code" && (
          /* Validation Code Input Form */
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-6">
                <Shield className="w-12 h-12 text-[#E75837] mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 header-font">Check Your Email</h2>
                <p className="text-gray-600 body-font mt-2">
                  We've sent a verification code to <span className="font-medium">{email}</span>
                </p>
              </div>

              <form onSubmit={handleCodeSubmit} className="space-y-6">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2 body-font">
                    Enter verification code
                  </label>
                  <input
                    type="text"
                    id="code"
                    value={validationCode}
                    onChange={(e) => setValidationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E75837] focus:border-transparent body-font text-center text-lg tracking-widest"
                    required
                    disabled={isLoading}
                    maxLength={6}
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 body-font">{error}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={isLoading || !validationCode.trim()}
                    className="w-full bg-[#E75837] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#d04e30] disabled:opacity-50 disabled:cursor-not-allowed transition-colors body-font flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Verifying code...
                      </>
                    ) : (
                      <>
                        <User className="w-5 h-5" />
                        Access My Portal
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors body-font"
                  >
                    Use Different Email
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {step === "data" && customerData && (
          /* Customer Information Display */
          <div className="space-y-8">
            {/* Tabbed Navigation */}
            <div className="bg-white rounded-2xl shadow-lg">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-8 pt-6">
                  <button
                    onClick={() => setActiveTab("pets")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === "pets"
                        ? "border-[#E75837] text-[#E75837]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      Pets
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("appointments")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === "appointments"
                        ? "border-[#E75837] text-[#E75837]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Appointments
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("invoices")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === "invoices"
                        ? "border-[#E75837] text-[#E75837]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Invoices
                    </div>
                  </button>
                </nav>
              </div>

              <div className="p-8">
                {activeTab === "pets" && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 header-font flex items-center gap-3">
                      <Heart className="w-8 h-8 text-[#E75837]" />
                      Your Pets
                    </h2>
                    {customerData.pets && customerData.pets.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {customerData.pets.map((pet) => (
                          <div
                            key={pet.pet_id}
                            className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-xl p-6 border border-orange-200"
                          >
                            <div className="flex items-center gap-4">
                              <div className="text-[#E75837] bg-white p-3 rounded-full">{getPetIcon(pet.pet_type)}</div>
                              <div>
                                <p className="font-bold text-xl body-font text-gray-900">{pet.pet_name}</p>
                                <p className="text-gray-600 body-font">{pet.pet_type}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 body-font text-xl">No pets registered</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "appointments" && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 header-font flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-[#E75837]" />
                        Your Appointments
                      </h2>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() =>
                            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
                          }
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h3 className="text-lg font-semibold body-font min-w-[200px] text-center">
                          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h3>
                        <button
                          onClick={() =>
                            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
                          }
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {customerData.bookings && customerData.bookings.length > 0 ? (
                      <>
                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1 mb-4">
                          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                            <div key={day} className="p-3 text-center font-semibold text-gray-600 body-font">
                              {day}
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                          {calendarDays.map((day, index) => {
                            const bookings = getBookingsForDate(day)
                            const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                            const isToday = day.toDateString() === new Date().toDateString()

                            return (
                              <div
                                key={index}
                                className={`min-h-[100px] p-2 border border-gray-200 ${
                                  isCurrentMonth ? "bg-white" : "bg-gray-50"
                                } ${isToday ? "ring-2 ring-[#E75837]" : ""}`}
                              >
                                <div
                                  className={`text-sm font-medium mb-1 ${isCurrentMonth ? "text-gray-900" : "text-gray-400"}`}
                                >
                                  {day.getDate()}
                                </div>
                                <div className="space-y-1">
                                  {bookings.map((booking) => (
                                    <div
                                      key={booking.booking_id}
                                      className={`text-xs p-1 rounded border ${getServiceTypeColor(booking.service_types || "")}`}
                                    >
                                      <div className="font-medium truncate">{convertToUserTimezone(booking.start)}</div>
                                      <div className="truncate">{booking.service_names || "Appointment"}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* Legend */}
                        <div className="mt-6 flex flex-wrap gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                            <span className="text-sm body-font">Walking</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded"></div>
                            <span className="text-sm body-font">Grooming</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                            <span className="text-sm body-font">Drop-in</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
                            <span className="text-sm body-font">Other</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 body-font text-xl mb-2">No upcoming appointments scheduled</p>
                        <p className="text-gray-500 body-font">Contact us to book your next appointment!</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "invoices" && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 header-font flex items-center gap-3">
                        <FileText className="w-8 h-8 text-[#E75837]" />
                        Invoices
                      </h2>
                    </div>

                    {customerData.invoices && customerData.invoices.length > 0 ? (
                      <div className="space-y-4">
                        {customerData.invoices.map((invoice) => (
                          <div
                            key={invoice.invoice_number}
                            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-4 mb-2">
                                  <h3 className="text-lg font-bold text-gray-900 body-font">{invoice.amount}</h3>
                                  <span className="text-gray-600 body-font">Due {invoice.due_date}</span>
                                </div>
                                <p className="text-gray-600 body-font">Invoice #{invoice.invoice_number}</p>
                              </div>
                              <div className="flex-shrink-0">
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeStyle(
                                    invoice.status,
                                  )}`}
                                >
                                  {invoice.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}

                        {customerData.payment_instructions && (
                          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-blue-800 body-font text-sm">
                              <strong>Payment Instructions:</strong> {customerData.payment_instructions}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 body-font text-xl">No invoices found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Back button */}
            <div className="text-center">
              <button
                onClick={resetForm}
                className="bg-gray-100 text-gray-700 py-3 px-8 rounded-lg font-medium hover:bg-gray-200 transition-colors body-font"
              >
                Look up different email
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
