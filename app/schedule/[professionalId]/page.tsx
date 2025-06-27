"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ServiceSelectorBar } from "@/components/schedule/service-selector-bar"
import { WeeklyCalendar } from "@/components/schedule/weekly-calendar"
import { CustomerForm } from "@/components/schedule/customer-form"
import { PetSelection } from "@/components/schedule/pet-selection"
import { BookingConfirmation } from "@/components/schedule/booking-confirmation"
import { BookingTypeSelection } from "@/components/schedule/booking-type-selection"
import type { BookingType, RecurringConfig } from "@/components/schedule/booking-type-selection"
import type {
  Service,
  WorkingDay,
  BookingData,
  SelectedTimeSlot,
  CustomerInfo,
  Pet,
  PetResponse,
} from "@/types/schedule"
import type { ProfessionalConfig } from "@/types/professional-config"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, AlertCircle } from "lucide-react"

type Step = "booking-type" | "services" | "calendar" | "customer" | "pets" | "confirmation"

type NotificationPreference = "1_hour" | "1_day" | "1_week"

export default function SchedulePage() {
  const params = useParams()
  const professionalId = params.professionalId as string
  const { toast } = useToast()

  // State management
  const [currentStep, setCurrentStep] = useState<Step>("booking-type")
  const [bookingType, setBookingType] = useState<BookingType>("one-time")
  const [recurringConfig, setRecurringConfig] = useState<RecurringConfig | null>(null)
  const [selectedServices, setSelectedServices] = useState<Service[]>([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<SelectedTimeSlot | null>(null)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [selectedNotifications, setSelectedNotifications] = useState<NotificationPreference[]>([])
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)

  // Data from API
  const [services, setServices] = useState<Service[]>([])
  const [workingDays, setWorkingDays] = useState<WorkingDay[]>([])
  const [bookingData, setBookingData] = useState<BookingData[]>([])
  const [pets, setPets] = useState<Pet[]>([])
  const [professionalConfig, setProfessionalConfig] = useState<ProfessionalConfig | null>(null)
  const [professionalName, setProfessionalName] = useState<string>("")

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL
        if (!webhookUrl) {
          throw new Error("Webhook URL not configured")
        }

        const payload = {
          action: "get_professional_config",
          professional_id: professionalId,
        }

        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          setServices(data.services || [])
          setWorkingDays(data.working_days || [])
          setBookingData(data.booking_data || [])
          setProfessionalConfig(data.professional_config || null)
          setProfessionalName(data.professional_name || "Professional")
        } else {
          throw new Error(data.message || "Failed to load professional data")
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError(error instanceof Error ? error.message : "An error occurred")
        toast({
          title: "Error",
          description: "Failed to load professional information. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (professionalId) {
      fetchData()
    }
  }, [professionalId, toast])

  // Determine booking type based on professional config
  const determineBookingType = () => {
    if (!professionalConfig?.booking_preferences) return "direct"

    const { allow_direct_booking, require_approval } = professionalConfig.booking_preferences

    if (allow_direct_booking === true) {
      return "direct"
    } else if (allow_direct_booking === false && require_approval === true) {
      return "request"
    }

    return "direct" // Default fallback
  }

  const isDirectBooking = determineBookingType() === "direct"

  // Group services by category
  const servicesByCategory = services.reduce(
    (acc, service) => {
      const category = service.category || "Other"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(service)
      return acc
    },
    {} as { [category: string]: Service[] },
  )

  // Event handlers
  const handleBookingTypeSelect = (type: BookingType, config?: RecurringConfig) => {
    setBookingType(type)
    setRecurringConfig(config || null)
    setCurrentStep("services")
  }

  const handleServiceSelect = (service: Service) => {
    setSelectedServices((prev) => {
      const isSelected = prev.some((s) => s.name === service.name)
      if (isSelected) {
        return prev.filter((s) => s.name !== service.name)
      } else {
        return [...prev, service]
      }
    })
  }

  const handleServicesContinue = () => {
    if (selectedServices.length > 0) {
      setCurrentStep("calendar")
    }
  }

  const handleTimeSlotSelect = (slot: SelectedTimeSlot) => {
    setSelectedTimeSlot(slot)
  }

  const handleCalendarContinue = () => {
    if (selectedTimeSlot) {
      setCurrentStep("customer")
    }
  }

  const handlePetsReceived = (customerInfo: CustomerInfo, petResponse: PetResponse) => {
    setCustomerInfo(customerInfo)
    setPets(petResponse.pets || [])
    setCurrentStep("pets")
  }

  const handlePetSelect = (pet: Pet, notifications: NotificationPreference[]) => {
    setSelectedPet(pet)
    setSelectedNotifications(notifications)
    setCurrentStep("confirmation")
  }

  // Navigation handlers
  const handleBackToBookingType = () => setCurrentStep("booking-type")
  const handleBackToServices = () => setCurrentStep("services")
  const handleBackToCalendar = () => setCurrentStep("calendar")
  const handleBackToCustomer = () => setCurrentStep("customer")

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-[#E75837] to-[#d14a2a] rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 header-font mb-2">Loading Booking System</h2>
            <p className="text-gray-600 body-font">Setting up your appointment booking experience...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 header-font mb-2">Unable to Load</h2>
            <p className="text-gray-600 body-font mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#E75837] hover:bg-[#d14a2a] text-white px-6 py-3 rounded-xl body-font transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {[
              { key: "booking-type", label: "Type", icon: "📅" },
              { key: "services", label: "Services", icon: "🛠️" },
              { key: "calendar", label: "Time", icon: "⏰" },
              { key: "customer", label: "Info", icon: "👤" },
              { key: "pets", label: "Pet", icon: "🐾" },
              { key: "confirmation", label: "Confirm", icon: "✅" },
            ].map((step, index) => {
              const isActive = currentStep === step.key
              const isCompleted =
                ["booking-type", "services", "calendar", "customer", "pets", "confirmation"].indexOf(currentStep) >
                index

              return (
                <div key={step.key} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-br from-[#E75837] to-[#d14a2a] text-white shadow-lg scale-110"
                        : isCompleted
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <span className="text-lg">{step.icon}</span>
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p
                      className={`text-sm font-semibold body-font ${
                        isActive ? "text-[#E75837]" : isCompleted ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                  {index < 5 && (
                    <div
                      className={`w-8 h-0.5 mx-4 transition-colors duration-200 ${
                        isCompleted ? "bg-green-300" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-6xl mx-auto">
          {currentStep === "booking-type" && (
            <BookingTypeSelection professionalName={professionalName} onBookingTypeSelect={handleBookingTypeSelect} />
          )}

          {currentStep === "services" && (
            <div className="space-y-8">
              <ServiceSelectorBar
                servicesByCategory={servicesByCategory}
                selectedServices={selectedServices}
                onServiceSelect={handleServiceSelect}
                onContinue={selectedServices.length > 0 ? handleServicesContinue : undefined}
              />
            </div>
          )}

          {currentStep === "calendar" && (
            <div className="space-y-8">
              <ServiceSelectorBar
                servicesByCategory={servicesByCategory}
                selectedServices={selectedServices}
                onServiceSelect={handleServiceSelect}
                summaryOnly={true}
              />
              <WeeklyCalendar
                workingDays={workingDays}
                bookingData={bookingData}
                selectedServices={selectedServices}
                onTimeSlotSelect={handleTimeSlotSelect}
                selectedTimeSlot={selectedTimeSlot}
                professionalId={professionalId}
                professionalConfig={professionalConfig}
                bookingType={bookingType}
                recurringConfig={recurringConfig}
              />
              {selectedTimeSlot && (
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-t-2xl shadow-lg">
                  <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <div>
                      <p className="text-sm text-gray-500 body-font">Selected time</p>
                      <p className="text-lg font-bold text-gray-900 body-font">
                        {selectedTimeSlot.dayOfWeek}, {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
                      </p>
                    </div>
                    <button
                      onClick={handleCalendarContinue}
                      className="bg-gradient-to-r from-[#E75837] to-[#d14a2a] hover:from-[#d14a2a] hover:to-[#c13e26] text-white px-8 py-3 rounded-xl body-font shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      Continue to Customer Info
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === "customer" && selectedTimeSlot && (
            <CustomerForm
              selectedServices={selectedServices}
              selectedTimeSlot={selectedTimeSlot}
              professionalId={professionalId}
              professionalName={professionalName}
              sessionId={sessionId}
              onPetsReceived={handlePetsReceived}
              onBack={handleBackToCalendar}
              bookingType={bookingType}
              recurringConfig={recurringConfig}
              isDirectBooking={isDirectBooking}
            />
          )}

          {currentStep === "pets" && customerInfo && selectedTimeSlot && (
            <PetSelection
              pets={pets}
              customerInfo={customerInfo}
              selectedServices={selectedServices}
              selectedTimeSlot={selectedTimeSlot}
              professionalName={professionalName}
              isDirectBooking={isDirectBooking}
              onPetSelect={handlePetSelect}
              onBack={handleBackToCustomer}
            />
          )}

          {currentStep === "confirmation" && customerInfo && selectedTimeSlot && selectedPet && (
            <BookingConfirmation
              customerInfo={customerInfo}
              selectedServices={selectedServices}
              selectedTimeSlot={selectedTimeSlot}
              selectedPet={selectedPet}
              selectedNotifications={selectedNotifications}
              professionalId={professionalId}
              professionalName={professionalName}
              sessionId={sessionId}
              bookingType={bookingType}
              recurringConfig={recurringConfig}
              isDirectBooking={isDirectBooking}
            />
          )}
        </div>
      </div>
    </div>
  )
}
