"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Phone, Mail, Clock, Calendar, Users, Loader2, AlertCircle, ExternalLink } from "lucide-react"
import { BookingPage } from "@/components/booking-page"
import type { GetConfigWebhookPayload } from "@/types/webhook-config"

interface ProfessionalData {
  professionalId: string
  businessName: string
  name: string
  tagline: string
  description: string
  location: string
  phone: string
  email: string
  profileImage: string
  services: Array<{
    id: string
    name: string
    description: string
    duration: number
    price: number
    category: string
  }>
  workingHours: Array<{
    day: string
    start: string
    end: string
    isWorking: boolean
  }>
  bookingPreferences: {
    booking_system: string
    allow_direct_booking: boolean
    require_approval: boolean
    online_booking_enabled: boolean
    custom_instructions: string
  }
}

const DEFAULT_WORKING_HOURS = [
  { day: "Monday", start: "09:00", end: "17:00", isWorking: true },
  { day: "Tuesday", start: "09:00", end: "17:00", isWorking: true },
  { day: "Wednesday", start: "09:00", end: "17:00", isWorking: true },
  { day: "Thursday", start: "09:00", end: "17:00", isWorking: true },
  { day: "Friday", start: "09:00", end: "17:00", isWorking: true },
  { day: "Saturday", start: "09:00", end: "15:00", isWorking: false },
  { day: "Sunday", start: "09:00", end: "15:00", isWorking: false },
]

const DEFAULT_SERVICES = [
  {
    id: "dog-walking-30",
    name: "Dog Walking - 30",
    description: "30-minute neighborhood walk for your dog",
    duration: 30,
    price: 25.0,
    category: "Dog Walking",
  },
  {
    id: "dog-walking-60",
    name: "Dog Walking - 60",
    description: "60-minute extended walk and exercise session",
    duration: 60,
    price: 45.0,
    category: "Dog Walking",
  },
  {
    id: "pet-sitting",
    name: "Pet Sitting",
    description: "In-home pet care and companionship",
    duration: 120,
    price: 75.0,
    category: "Pet Sitting",
  },
  {
    id: "basic-grooming",
    name: "Basic Grooming",
    description: "Bath, brush, nail trim, and ear cleaning",
    duration: 90,
    price: 65.0,
    category: "Grooming",
  },
]

export default function ProfessionalLandingPage() {
  const params = useParams()
  const professionalId = params.professionalId as string
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showBooking, setShowBooking] = useState(false)
  const [professionalData, setProfessionalData] = useState<ProfessionalData | null>(null)

  // Generate session ID
  const generateSessionId = () => {
    return `landing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Load professional configuration
  const loadProfessionalData = async () => {
    try {
      setLoading(true)
      setError(null)

      const webhookUrl = "https://jleib03.app.n8n.cloud/webhook/5671c1dd-48f6-47a9-85ac-4e20cf261520"

      const payload: GetConfigWebhookPayload = {
        action: "get_professional_config",
        professional_id: professionalId,
        session_id: generateSessionId(),
        timestamp: new Date().toISOString(),
      }

      console.log("Loading professional data:", payload)

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()
      console.log("Professional data response:", data)

      // Default professional data
      const professionalInfo: ProfessionalData = {
        professionalId,
        businessName: "Critter Pet Services",
        name: "Professional Pet Care Provider",
        tagline: "Trusted pet care services in your neighborhood",
        description: "Providing reliable and loving care for your pets with years of experience in pet care services.",
        location: "Local Area",
        phone: "(555) 123-4567",
        email: "contact@critterpetservices.com",
        profileImage: "/placeholder-user.jpg",
        services: DEFAULT_SERVICES,
        workingHours: DEFAULT_WORKING_HOURS,
        bookingPreferences: {
          booking_system: "direct_booking",
          allow_direct_booking: true,
          require_approval: false,
          online_booking_enabled: true,
          custom_instructions: "",
        },
      }

      // Parse webhook response
      if (Array.isArray(data)) {
        const structured = data.find((item) => item.webhook_response && item.webhook_response.success)

        if (structured) {
          const config = structured.webhook_response.config_data

          // Update with actual data from webhook
          if (config.business_name) {
            professionalInfo.businessName = config.business_name
          }

          // Booking preferences
          if (config.booking_preferences) {
            const prefs = config.booking_preferences
            professionalInfo.bookingPreferences = {
              booking_system: prefs.booking_type || prefs.booking_system || "direct_booking",
              allow_direct_booking: prefs.allow_direct_booking ?? true,
              require_approval: prefs.require_approval ?? false,
              online_booking_enabled: prefs.online_booking_enabled ?? true,
              custom_instructions: prefs.custom_instructions || "",
            }
          }

          // Working hours from employees (if available)
          if (config.employees && Array.isArray(config.employees) && config.employees.length > 0) {
            const firstEmployee = config.employees[0]
            if (firstEmployee.working_days) {
              professionalInfo.workingHours = firstEmployee.working_days.map((day: any) => ({
                day: day.day,
                start: day.start_time.slice(0, 5),
                end: day.end_time.slice(0, 5),
                isWorking: day.is_working,
              }))
            }
          }
        }
      }

      setProfessionalData(professionalInfo)
    } catch (err) {
      console.error("Error loading professional data:", err)
      setError("Failed to load professional information. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (professionalId) {
      loadProfessionalData()
    }
  }, [professionalId])

  const handleBookNow = () => {
    if (!professionalData?.bookingPreferences.online_booking_enabled) {
      toast({
        title: "Online Booking Disabled",
        description: "Please contact this professional directly to schedule an appointment.",
        variant: "destructive",
        duration: 5000,
      })
      return
    }

    setShowBooking(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#E75837]" />
          <p className="text-gray-600">Loading professional information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Profile</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadProfessionalData} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (showBooking && professionalData) {
    return (
      <BookingPage
        professionalId={professionalId}
        professionalData={professionalData}
        onBack={() => setShowBooking(false)}
      />
    )
  }

  if (!professionalData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Professional not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <Avatar className="w-24 h-24 md:w-32 md:h-32">
                <AvatarImage src={professionalData.profileImage || "/placeholder.svg"} alt={professionalData.name} />
                <AvatarFallback className="text-2xl bg-[#E75837] text-white">
                  {professionalData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1">
              <div className="mb-4">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{professionalData.businessName}</h1>
                <p className="text-xl text-gray-600 mb-3">{professionalData.tagline}</p>
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">{professionalData.description}</p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleBookNow}
                  className="bg-[#E75837] hover:bg-[#d14a2a] text-white px-8 py-3 text-lg"
                  disabled={!professionalData.bookingPreferences.online_booking_enabled}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  {professionalData.bookingPreferences.online_booking_enabled ? "Book Now" : "Contact for Booking"}
                </Button>

                <a
                  href={`/schedule/set-up/${professionalId}`}
                  className="flex items-center gap-2 px-6 py-3 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Setup Booking Experience
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#E75837]" />
                  Services Offered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {professionalData.services.map((service) => (
                    <div key={service.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{service.name}</h3>
                        <div className="text-right">
                          <div className="text-xl font-bold text-[#E75837]">${service.price.toFixed(2)}</div>
                          <div className="text-sm text-gray-500">{service.duration} minutes</div>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-2">{service.description}</p>
                      <Badge variant="secondary" className="text-xs">
                        {service.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Custom Instructions */}
            {professionalData.bookingPreferences.custom_instructions && (
              <Card>
                <CardHeader>
                  <CardTitle>Booking Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {professionalData.bookingPreferences.custom_instructions}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{professionalData.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{professionalData.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{professionalData.email}</span>
                </div>
              </CardContent>
            </Card>

            {/* Working Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#E75837]" />
                  Working Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {professionalData.workingHours.map((schedule) => (
                    <div key={schedule.day} className="flex justify-between items-center py-1">
                      <span className="font-medium text-gray-700">{schedule.day}</span>
                      <span className="text-gray-600">
                        {schedule.isWorking ? `${schedule.start} - ${schedule.end}` : "Closed"}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Booking Status */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Online Booking</span>
                    <Badge
                      variant={professionalData.bookingPreferences.online_booking_enabled ? "default" : "secondary"}
                      className={professionalData.bookingPreferences.online_booking_enabled ? "bg-green-500" : ""}
                    >
                      {professionalData.bookingPreferences.online_booking_enabled ? "Available" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Booking Type</span>
                    <Badge variant="outline">
                      {professionalData.bookingPreferences.booking_system === "direct_booking" && "Direct Booking"}
                      {professionalData.bookingPreferences.booking_system === "request_to_book" && "Request to Book"}
                      {professionalData.bookingPreferences.booking_system === "no_online_booking" && "App Only"}
                    </Badge>
                  </div>
                  {professionalData.bookingPreferences.require_approval && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Approval Required</span>
                      <Badge variant="secondary">Yes</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
