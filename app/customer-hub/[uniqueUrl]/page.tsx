"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  FileText,
  ChevronDown,
  ChevronUp,
  Pill,
  Utensils,
  AlertTriangle,
  Scale,
  Cookie,
} from "lucide-react"
import { getWebhookEndpoint, logWebhookUsage } from "../../../types/webhook-endpoints"

interface Pet {
  pet_name: string
  pet_id: string
  pet_type: string
  birthdate?: string
  chip_id?: string
  spayed_or_neutered?: string
  sex?: string
  breed_name?: string
  gotcha_date?: string
  contacts?: Array<{
    contact_name: string
    contact_type: string
    email: string
  }>
  foods?: Array<{
    food_name: string
    food_type: string
    photo_filename?: string
  }>
  treats?: Array<{
    treat_name: string
    treat_type: string
  }>
  weights?: Array<{
    date: string
    weight: string
    weight_units: string
  }>
  supplies?: Array<{
    supply_name: string
    notes: string
  }>
  medications?: Array<{
    medication_name: string
    purpose: string
    delivery_method: string
  }>
  conditions?: Array<{
    condition_name: string
    notes: string
    start_date: string
  }>
  allergies?: Array<any>
  feeding_schedule?: Array<{
    time: string
    amount: string
    food_name: string
    instructions: string
  }>
  medication_schedule?: Array<{
    amount: string
    schedule_times: string[]
  }>
  walk_schedule?: Array<{
    start_time: string
    instructions: string
    typical_length_minutes: number
  }>
  grooming_schedule?: Array<{
    activity_name: string
    frequency?: string
    instructions: string
  }>
  sleep_instructions?: string
  play_instructions?: string
  general_health_notes?: string
  general_feeding_notes?: string
  general_exercise_and_play_notes?: string
  general_grooming_and_cleaning_notes?: string
  general_behavioral_notes?: string
  interactions_with_adults_notes?: string
  interactions_with_kids_notes?: string
  interactions_with_animals_notes?: string
  miscellaneous_notes?: string
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
  onboarding_complete?: boolean
  criteria_status?: {
    personal_info_complete?: boolean
    pets_created?: boolean
    emergency_contacts_added?: boolean
    policies_signed?: boolean
  }
  supporting_details?: {
    pets?: {
      count?: number
      details?: Array<{
        name?: string
        type?: string
      }>
    }
    email?: string
    user_type?: string
    emergency_contacts?: Array<any>
  }
  email?: string
  user_type?: string
}

export default function CustomerHub({ params }: { params: { uniqueUrl: string } }) {
  const [activeTab, setActiveTab] = useState<"pets" | "appointments" | "invoices" | "onboarding">("pets")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [customerData, setCustomerData] = useState<CustomerData | null>(null)
  const [expandedPet, setExpandedPet] = useState<string | null>(null)
  const [selectedPetSection, setSelectedPetSection] = useState<string>("general")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [appointmentView, setAppointmentView] = useState<"calendar" | "list">("calendar")
  const [step, setStep] = useState<"email" | "code" | "data">("email")

  const router = useRouter()
  const uniqueUrl = params.uniqueUrl as string

  const [validationCode, setValidationCode] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [professionalName, setProfessionalName] = useState("")

  const [selectedSection, setSelectedSection] = useState<
    "general" | "health" | "food" | "vaccine-overview" | "care-plan-report"
  >("general")
  const [selectedHealthSubSection, setSelectedHealthTab] = useState<
    "medications" | "conditions" | "allergies" | "weight"
  >("medications")
  const [selectedFoodSubSection, setSelectedFoodTab] = useState<"food" | "treats">("food")

  const [selectedOnboardingSubSection, setSelectedOnboardingSection] = useState<
    "user-information" | "pets" | "emergency-contact" | "policy-documentation"
  >("user-information")

  const [showCarePlan, setShowCarePlan] = useState<string | null>(null)

  const [showOnboardingForm, setShowOnboardingForm] = useState<string | null>(null)
  const [emergencyContactForm, setEmergencyContactForm] = useState({
    contact_name: "",
    business_name: "",
    address: "",
    phone_number: "",
    email: "",
    notes: "",
  })
  const [policyDocuments, setPolicyDocuments] = useState<any[]>([])
  const [acknowledgedPolicies, setAcknowledgedPolicies] = useState<string[]>([])

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

  const convertToUserTimezone = (utcTime: string): string => {
    if (!utcTime || utcTime.trim() === "") return ""

    try {
      // Handle different time formats
      let date: Date

      // If it's just a time (like "14:00:00"), assume it's today in UTC
      if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(utcTime)) {
        const today = new Date()
        const [hours, minutes] = utcTime.split(":").map(Number)
        date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), hours, minutes))
      } else {
        // Try to parse as full datetime
        date = new Date(utcTime)
      }

      if (isNaN(date.getTime())) {
        return utcTime // Return original if can't parse
      }

      // Format as 12-hour time with AM/PM in user's timezone
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
    } catch (error) {
      return utcTime // Return original if conversion fails
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

        const basicPets = firstItem?.pets || []
        console.log("[v0] Basic pets from first item:", JSON.stringify(basicPets, null, 2))

        const detailedPetItems = data.filter((item) => item.pet && item.pet.pet_id)
        console.log("[v0] Detailed pet items:", JSON.stringify(detailedPetItems, null, 2))

        const petItems = data.filter((item) => {
          // Check if item has pet data with required fields
          return (
            (item.pet_name && item.pet_name.trim() !== "") ||
            (item.name && item.name.trim() !== "") ||
            (item.pet && item.pet.pet_name && item.pet.pet_name.trim() !== "")
          )
        })

        const pets = petItems.map((petData: any) => {
          // Handle different pet data structures
          const petInfo = petData.pet || petData

          return {
            pet_name: petInfo.pet_name || petData.name || "",
            pet_id: petInfo.pet_id || petData.id || "",
            pet_type: petInfo.pet_type || petData.pet_type || "",
            birthdate: petInfo.birthdate || petData.birthdate,
            chip_id: petInfo.chip_id || petData.chip_id,
            spayed_or_neutered: petInfo.spayed_or_neutered || petData.spayed_or_neutered,
            sex: petInfo.pet_sex || petData.pet_sex,
            breed_name: petInfo.breed_name || petData.breed_name,
            gotcha_date: petInfo.gotcha_date || petData.gotcha_date,
            contacts: petData.contacts || [],
            foods: petData.foods || [],
            treats: petData.treats || [],
            weights: petData.weights || [],
            supplies: petData.supplies || [],
            medications: petData.medications || [],
            conditions: petData.conditions || [],
            allergies: petData.allergies || [],
            feeding_schedule: petData.feeding_schedule || [],
            medication_schedule: petData.medication_schedule || [],
            walk_schedule: petData.walk_schedule || [],
            grooming_schedule: petData.grooming_schedule || [],
            sleep_instructions: petData.sleep_instructions,
            play_instructions: petData.play_instructions,
            general_health_notes: petData.general_health_notes,
            general_feeding_notes: petData.general_feeding_notes,
            general_exercise_and_play_notes: petData.general_exercise_and_play_notes,
            general_grooming_and_cleaning_notes: petData.general_grooming_and_cleaning_notes,
            general_behavioral_notes: petData.general_behavioral_notes,
            interactions_with_adults_notes: petData.interactions_with_adults_notes,
            interactions_with_kids_notes: petData.interactions_with_kids_notes,
            interactions_with_animals_notes: petData.interactions_with_animals_notes,
            miscellaneous_notes: petData.miscellaneous_notes,
          }
        })

        console.log("[v0] Final processed pets:", JSON.stringify(pets, null, 2))

        let invoices: Invoice[] = []
        let payment_instructions = ""
        let onboarding_complete = false
        let criteria_status = {}
        let supporting_details = {}
        let email = ""
        let user_type = ""

        // Search through all items to find invoices
        for (const item of data) {
          if (item.invoices && Array.isArray(item.invoices)) {
            invoices = item.invoices
            payment_instructions = item.payment_instructions || ""
            break
          }
        }

        for (const item of data) {
          if (item.onboarding_complete !== undefined) {
            onboarding_complete = item.onboarding_complete
            criteria_status = item.criteria_status || {}
            supporting_details = item.supporting_details || {}
            email = item.email || ""
            user_type = item.user_type || ""
            break
          }
        }

        console.log("[v0] Extracted invoices:", JSON.stringify(invoices, null, 2))

        const bookings = data.filter((item) => item.booking_id && !item.pet && !item.invoices) || []

        setCustomerData({
          pets,
          bookings,
          invoices,
          payment_instructions,
          onboarding_complete,
          criteria_status,
          supporting_details,
          email,
          user_type,
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

  const togglePetExpansion = (petId: string) => {
    setExpandedPet(expandedPet === petId ? null : petId)
    if (expandedPet !== petId) {
      setSelectedPetSection("general")
    }
  }

  const renderPetProfileSection = (pet: any, section: string) => {
    switch (section) {
      case "general":
        return (
          <div className="space-y-6">
            {/* Basic Pet Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 font-body mb-1">Name</h4>
                <p className="text-gray-700 font-body">{pet.pet_name}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 font-body mb-1">Type</h4>
                <p className="text-gray-700 font-body">{pet.pet_type}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 font-body mb-1">Sex</h4>
                <p className="text-gray-700 font-body">{pet.sex || "Not specified"}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 font-body mb-1">Breed</h4>
                <p className="text-gray-700 font-body">{pet.breed_name || "Not specified"}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 font-body mb-1">Spayed/Neutered</h4>
                <p className="text-gray-700 font-body">{pet.spayed_or_neutered || "Not specified"}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 font-body mb-1">Chip ID</h4>
                <p className="text-gray-700 font-body">{pet.chip_id || "Not specified"}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 font-body mb-1">Birthdate</h4>
                <p className="text-gray-700 font-body">
                  {pet.birthdate ? new Date(pet.birthdate).toLocaleDateString() : "Not specified"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 font-body mb-1">Gotcha Date</h4>
                <p className="text-gray-700 font-body">
                  {pet.gotcha_date ? new Date(pet.gotcha_date).toLocaleDateString() : "Not specified"}
                </p>
              </div>
            </div>

            {/* Contacts */}
            {pet.contacts && pet.contacts.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 font-body mb-4">Contacts</h3>
                <div className="space-y-3">
                  {pet.contacts.map((contact: any, index: number) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 font-body">{contact.contact_name}</h4>
                          <p className="text-gray-600 font-body text-sm">{contact.contact_type}</p>
                          {contact.email && <p className="text-gray-600 font-body text-sm">{contact.email}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Supplies */}
            {pet.supplies && pet.supplies.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 font-body mb-4">Supplies</h3>
                <div className="space-y-3">
                  {pet.supplies.map((supply: any, index: number) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 font-body">{supply.supply_name}</h4>
                          <p className="text-gray-600 font-body text-sm">{supply.supply_type}</p>
                          {supply.usage_notes && (
                            <p className="text-gray-600 font-body text-sm mt-1">{supply.usage_notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Behavioral Notes */}
            {(pet.sleep_instructions || pet.play_instructions || pet.behavioral_notes) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 font-body mb-4">Behavioral Notes</h3>
                <div className="space-y-3">
                  {pet.sleep_instructions && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 font-body mb-2">Sleep Instructions</h4>
                      <p className="text-gray-700 font-body">{pet.sleep_instructions}</p>
                    </div>
                  )}
                  {pet.play_instructions && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 font-body mb-2">Play Instructions</h4>
                      <p className="text-gray-700 font-body">{pet.play_instructions}</p>
                    </div>
                  )}
                  {pet.behavioral_notes && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 font-body mb-2">Behavioral Notes</h4>
                      <p className="text-gray-700 font-body">{pet.behavioral_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )

      case "health":
        return (
          <div className="space-y-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setSelectedHealthTab("medications")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedHealthSubSection === "medications"
                      ? "border-[#E75837] text-[#E75837]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Medications
                </button>
                <button
                  onClick={() => setSelectedHealthTab("conditions")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedHealthSubSection === "conditions"
                      ? "border-[#E75837] text-[#E75837]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Conditions
                </button>
                <button
                  onClick={() => setSelectedHealthTab("allergies")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedHealthSubSection === "allergies"
                      ? "border-[#E75837] text-[#E75837]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Allergies
                </button>
                <button
                  onClick={() => setSelectedHealthTab("weight")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedHealthSubSection === "weight"
                      ? "border-[#E75837] text-[#E75837]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Weight
                </button>
              </nav>
            </div>

            <div className="space-y-4">
              {selectedHealthSubSection === "medications" && (
                <div className="space-y-3">
                  {pet.medications && pet.medications.length > 0 ? (
                    pet.medications.map((medication: any, index: number) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900 font-body">{medication.medication_name}</h4>
                            <p className="text-gray-600 font-body text-sm mt-1">
                              {medication.delivery_method} • {medication.purpose}
                            </p>
                          </div>
                          <span
                            className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                              medication.purpose === "Preventative"
                                ? "bg-green-100 text-green-800"
                                : medication.purpose === "Allergies"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {medication.purpose}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Pill className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-body">No medications recorded</p>
                    </div>
                  )}
                </div>
              )}

              {selectedHealthSubSection === "conditions" && (
                <div className="space-y-3">
                  {pet.conditions && pet.conditions.length > 0 ? (
                    pet.conditions.map((condition: any, index: number) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900 font-body">{condition.condition_name}</h4>
                            <p className="text-gray-600 font-body text-sm mt-1">{condition.notes}</p>
                            <p className="text-gray-500 font-body text-xs mt-1">
                              Started: {new Date(condition.start_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-body">No conditions recorded</p>
                    </div>
                  )}
                </div>
              )}

              {selectedHealthSubSection === "allergies" && (
                <div className="space-y-3">
                  {pet.allergies && pet.allergies.length > 0 ? (
                    pet.allergies.map((allergy: any, index: number) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900 font-body">{allergy.allergy_name}</h4>
                            <p className="text-gray-600 font-body text-sm mt-1">{allergy.notes}</p>
                          </div>
                          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            Allergy
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-body">No allergies recorded</p>
                    </div>
                  )}
                </div>
              )}

              {selectedHealthSubSection === "weight" && (
                <div className="space-y-3">
                  {pet.weights && pet.weights.length > 0 ? (
                    pet.weights.map((weight: any, index: number) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900 font-body">
                              {weight.weight} {weight.weight_units}
                            </h4>
                            <p className="text-gray-600 font-body text-sm mt-1">
                              Recorded: {new Date(weight.date).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            Weight Record
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Scale className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-body">No weight records available</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )

      case "food":
        return (
          <div className="space-y-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setSelectedFoodTab("food")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedFoodSubSection === "food"
                      ? "border-[#E75837] text-[#E75837]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Food
                </button>
                <button
                  onClick={() => setSelectedFoodTab("treats")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedFoodSubSection === "treats"
                      ? "border-[#E75837] text-[#E75837]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Treats
                </button>
              </nav>
            </div>

            <div className="space-y-4">
              {selectedFoodSubSection === "food" && (
                <div className="space-y-3">
                  {pet.foods && pet.foods.length > 0 ? (
                    pet.foods.map((food: any, index: number) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900 font-body">{food.food_name}</h4>
                            <p className="text-gray-600 font-body text-sm mt-1">{food.food_type}</p>
                          </div>
                          <span
                            className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                              food.food_type === "Dry Food"
                                ? "bg-amber-100 text-amber-800"
                                : food.food_type === "Wet Food"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                            }`}
                          >
                            {food.food_type}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Utensils className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-body">No food information recorded</p>
                    </div>
                  )}
                </div>
              )}

              {selectedFoodSubSection === "treats" && (
                <div className="space-y-3">
                  {pet.treats && pet.treats.length > 0 ? (
                    pet.treats.map((treat: any, index: number) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900 font-body">{treat.treat_name}</h4>
                            <p className="text-gray-600 font-body text-sm mt-1">{treat.treat_type}</p>
                          </div>
                          <span className="bg-pink-100 text-pink-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            {treat.treat_type}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Cookie className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-body">No treat information recorded</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )

      case "onboarding":
        return (
          <div className="space-y-6">
            {/* Overall Onboarding Status */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 font-body">Onboarding Status</h3>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    customerData?.onboarding_complete ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {customerData?.onboarding_complete ? "Complete" : "In Progress"}
                </div>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div
                    className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                      customerData?.criteria_status?.personal_info_complete
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900">User Info</p>
                  <p className="text-xs text-gray-500">
                    {customerData?.criteria_status?.personal_info_complete ? "Complete" : "Pending"}
                  </p>
                </div>

                <div className="text-center">
                  <div
                    className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                      customerData?.criteria_status?.pets_created
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Pets</p>
                  <p className="text-xs text-gray-500">
                    {customerData?.criteria_status?.pets_created ? "Complete" : "Pending"}
                  </p>
                </div>

                <div className="text-center">
                  <div
                    className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                      customerData?.criteria_status?.emergency_contacts_added
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Emergency</p>
                  <p className="text-xs text-gray-500">
                    {customerData?.criteria_status?.emergency_contacts_added ? "Complete" : "Pending"}
                  </p>
                </div>

                <div className="text-center">
                  <div
                    className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                      customerData?.criteria_status?.policies_signed
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Policies</p>
                  <p className="text-xs text-gray-500">
                    {customerData?.criteria_status?.policies_signed ? "Complete" : "Pending"}
                  </p>
                </div>
              </div>
            </div>

            {/* Sub-tabs Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setSelectedOnboardingSection("user-information")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedOnboardingSubSection === "user-information"
                      ? "border-[#E75837] text-[#E75837]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  User Information
                </button>
                <button
                  onClick={() => setSelectedOnboardingSection("pets")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedOnboardingSubSection === "pets"
                      ? "border-[#E75837] text-[#E75837]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Pets
                </button>
                <button
                  onClick={() => setSelectedOnboardingSection("emergency-contact")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedOnboardingSubSection === "emergency-contact"
                      ? "border-[#E75837] text-[#E75837]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Emergency Contact
                </button>
                <button
                  onClick={() => setSelectedOnboardingSection("policy-documentation")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedOnboardingSubSection === "policy-documentation"
                      ? "border-[#E75837] text-[#E75837]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Policy Documentation
                </button>
              </nav>
            </div>

            {/* Sub-section Content */}
            <div className="space-y-4">
              {selectedOnboardingSubSection === "user-information" && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-900 font-body mb-4">User Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-gray-900">{customerData?.email || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">User Type</p>
                      <p className="text-gray-900">{customerData?.user_type || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <p className="text-gray-900">
                        {customerData?.criteria_status?.personal_info_complete ? "Complete" : "Incomplete"}
                      </p>
                    </div>
                  </div>
                  {!customerData?.criteria_status?.personal_info_complete && (
                    <div className="mt-4">
                      <button
                        onClick={() => setShowOnboardingForm("user-information")}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        Start Section
                      </button>
                    </div>
                  )}
                </div>
              )}

              {selectedOnboardingSubSection === "pets" && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-900 font-body mb-4">Pet Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Pets Created</p>
                      <p className="text-gray-900">{customerData?.criteria_status?.pets_created ? "Yes" : "No"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Pet Count</p>
                      <p className="text-gray-900">{customerData?.pets?.length || 0}</p>
                    </div>
                  </div>
                  {customerData?.pets && customerData?.pets.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-500 mb-2">Pet Details</p>
                      <div className="space-y-2">
                        {customerData.pets.map((pet: any, index: number) => (
                          <div key={index} className="bg-white p-3 rounded border">
                            <p className="font-medium">{pet.pet_name || "Unnamed Pet"}</p>
                            <p className="text-sm text-gray-600">
                              {pet.pet_type || "Type not specified"} {pet.breed_name ? `• ${pet.breed_name}` : ""}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {!customerData?.criteria_status?.pets_created && (
                    <div className="mt-4">
                      <button
                        onClick={() => setShowOnboardingForm("pets")}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        Start Section
                      </button>
                    </div>
                  )}
                </div>
              )}

              {selectedOnboardingSubSection === "emergency-contact" && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-900 font-body mb-4">Emergency Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <p className="text-gray-900">
                        {customerData?.criteria_status?.emergency_contacts_added ? "Added" : "Not Added"}
                      </p>
                    </div>
                  </div>
                  {!customerData?.criteria_status?.emergency_contacts_added && (
                    <div className="mt-4">
                      <button
                        onClick={() => setShowOnboardingForm("emergency-contact")}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        Start Section
                      </button>
                    </div>
                  )}
                </div>
              )}

              {selectedOnboardingSubSection === "policy-documentation" && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Review and Sign Policies</h3>
                  {console.log("[v0] Rendering policy documents:", policyDocuments)}
                  <div className="space-y-4 mb-6">
                    {policyDocuments.map((doc: any, index: number) => (
                      <div key={doc.policy_id || index} className="border border-gray-200 rounded-lg p-4">
                        {console.log("[v0] Rendering document:", doc)}
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-lg">{doc.name}</h4>
                          <a
                            href={`https://your-aws-bucket.s3.amazonaws.com/${doc.document_filename}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#E75837] hover:text-[#E75837]/80 text-sm font-medium flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            View Document
                          </a>
                        </div>
                        {doc.description && <p className="text-sm text-gray-600 mb-3">{doc.description}</p>}
                        <div className="bg-gray-50 p-3 rounded border">
                          <label className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={acknowledgedPolicies.includes(doc.policy_id.toString())}
                              onChange={(e) => {
                                const policyId = doc.policy_id.toString()
                                if (e.target.checked) {
                                  setAcknowledgedPolicies([...acknowledgedPolicies, policyId])
                                } else {
                                  setAcknowledgedPolicies(acknowledgedPolicies.filter((id) => id !== policyId))
                                }
                              }}
                              className="mt-1 h-4 w-4 text-[#E75837] focus:ring-[#E75837] border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">
                              I have read, understood, and agree to the terms outlined in this {doc.name.toLowerCase()}.
                              I acknowledge that I am legally bound by these terms.
                            </span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowOnboardingForm(null)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const webhookUrl = getWebhookEndpoint("CUSTOMER_HUB")
                          logWebhookUsage("CUSTOMER_HUB", "customer_hub_onboarding")

                          const response = await fetch(webhookUrl, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              action: "customer_hub_onboarding",
                              unique_url: uniqueUrl,
                              section: "policies",
                              data: {
                                acknowledged_policy_ids: acknowledgedPolicies.map((id) => Number.parseInt(id)),
                                signed: true,
                              },
                            }),
                          })
                          if (response.ok) {
                            setShowOnboardingForm(null)
                            setPolicyDocuments([])
                            setAcknowledgedPolicies([])
                            window.location.reload() // Re-initialize hub
                          } else {
                            throw new Error("Failed to submit policy acknowledgments")
                          }
                        } catch (error) {
                          console.error("Error submitting policies:", error)
                          alert("Failed to submit policy acknowledgments. Please try again.")
                        }
                      }}
                      disabled={acknowledgedPolicies.length !== policyDocuments.length}
                      className="px-4 py-2 bg-[#E75837] text-white rounded-lg hover:bg-[#E75837]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sign All Policies ({acknowledgedPolicies.length}/{policyDocuments.length})
                    </button>
                  </div>
                </div>
              )}

              {(showOnboardingForm === "user-information" || showOnboardingForm === "pets") && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    {showOnboardingForm === "user-information"
                      ? "Complete Personal Information"
                      : "Add Pet Information"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    This section will use similar forms to the existing pet management functionality. Implementation can
                    reuse existing components from the pet onboarding flow.
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowOnboardingForm(null)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setShowOnboardingForm(null)}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {showOnboardingForm === "policies" && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Review and Sign Policies</h3>
                  {console.log("[v0] Rendering policy documents:", policyDocuments)}
                  <div className="space-y-4 mb-6">
                    {policyDocuments.map((doc: any, index: number) => (
                      <div key={doc.policy_id || index} className="border border-gray-200 rounded-lg p-4">
                        {console.log("[v0] Rendering document:", doc)}
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-lg">{doc.name}</h4>
                          <a
                            href={`https://your-aws-bucket.s3.amazonaws.com/${doc.document_filename}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#E75837] hover:text-[#E75837]/80 text-sm font-medium flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            View Document
                          </a>
                        </div>
                        {doc.description && <p className="text-sm text-gray-600 mb-3">{doc.description}</p>}
                        <div className="bg-gray-50 p-3 rounded border">
                          <label className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={acknowledgedPolicies.includes(doc.policy_id.toString())}
                              onChange={(e) => {
                                const policyId = doc.policy_id.toString()
                                if (e.target.checked) {
                                  setAcknowledgedPolicies([...acknowledgedPolicies, policyId])
                                } else {
                                  setAcknowledgedPolicies(acknowledgedPolicies.filter((id) => id !== policyId))
                                }
                              }}
                              className="mt-1 h-4 w-4 text-[#E75837] focus:ring-[#E75837] border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">
                              I have read, understood, and agree to the terms outlined in this {doc.name.toLowerCase()}.
                              I acknowledge that I am legally bound by these terms.
                            </span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowOnboardingForm(null)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const webhookUrl = getWebhookEndpoint("CUSTOMER_HUB")
                          logWebhookUsage("CUSTOMER_HUB", "customer_hub_onboarding")

                          const response = await fetch(webhookUrl, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              action: "customer_hub_onboarding",
                              unique_url: uniqueUrl,
                              section: "policies",
                              data: {
                                acknowledged_policy_ids: acknowledgedPolicies.map((id) => Number.parseInt(id)),
                                signed: true,
                              },
                            }),
                          })
                          if (response.ok) {
                            setShowOnboardingForm(null)
                            setPolicyDocuments([])
                            setAcknowledgedPolicies([])
                            window.location.reload() // Re-initialize hub
                          } else {
                            throw new Error("Failed to submit policy acknowledgments")
                          }
                        } catch (error) {
                          console.error("Error submitting policies:", error)
                          alert("Failed to submit policy acknowledgments. Please try again.")
                        }
                      }}
                      disabled={acknowledgedPolicies.length !== policyDocuments.length}
                      className="px-4 py-2 bg-[#E75837] text-white rounded-lg hover:bg-[#E75837]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sign All Policies ({acknowledgedPolicies.length}/{policyDocuments.length})
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case "vaccine-overview":
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 font-body">Vaccine Overview</h3>
                  <p className="text-gray-600 font-body">Vaccination records and schedule for {pet.pet_name}</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-gray-700 font-body">
                  Vaccine information will be displayed here when available from the veterinary records.
                </p>
              </div>
            </div>
          </div>
        )

      case "care-plan-report":
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 font-body">Daily Care Plan</h3>
                  <p className="text-gray-600 font-body">Daily schedule and care instructions for {pet.pet_name}</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Feeding Schedule */}
                {pet.feeding_schedule && pet.feeding_schedule.length > 0 && (
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 font-body mb-3 flex items-center">
                      <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                      </svg>
                      Feeding Schedule
                    </h4>
                    {pet.feeding_schedule.map((feeding: any, index: number) => (
                      <div key={index} className="border-l-4 border-gray-300 pl-4 py-2">
                        <p className="font-medium text-gray-900 font-body">
                          {convertToUserTimezone(feeding.time)} - {feeding.amount} {feeding.food_name}
                        </p>
                        {feeding.instructions && (
                          <p className="text-gray-600 font-body text-sm mt-1">{feeding.instructions}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Walk Schedule */}
                {pet.walk_schedule && pet.walk_schedule.length > 0 && (
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 font-body mb-3 flex items-center">
                      <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Walk Schedule
                    </h4>
                    {pet.walk_schedule.map((walk: any, index: number) => (
                      <div key={index} className="border-l-4 border-gray-300 pl-4 py-2">
                        <p className="font-medium text-gray-900 font-body">
                          {convertToUserTimezone(walk.start_time)} - {walk.duration}
                        </p>
                        {walk.instructions && (
                          <p className="text-gray-600 font-body text-sm mt-1">{walk.instructions}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Grooming Schedule */}
                {pet.grooming_schedule && pet.grooming_schedule.length > 0 && (
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 font-body mb-3 flex items-center">
                      <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 4 0 01-4 4zM7 3H5a2 2 0 00-2 2v12a4 4 0 004 4h2a2 2 0 002-2V5a2 2 2 0 00-2-2z"
                        />
                      </svg>
                      Grooming Schedule
                    </h4>
                    {pet.grooming_schedule.map((grooming: any, index: number) => (
                      <div key={index} className="border-l-4 border-gray-300 pl-4 py-2">
                        <p className="font-medium text-gray-900 font-body">
                          {grooming.activity_name}
                          {grooming.frequency ? ` - ${grooming.frequency}` : ""}
                        </p>
                        {grooming.instructions && (
                          <p className="text-gray-600 font-body text-sm mt-1">{grooming.instructions}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* General Notes */}
                {(pet.general_health_notes ||
                  pet.general_feeding_notes ||
                  pet.general_exercise_and_play_notes ||
                  pet.general_grooming_and_cleaning_notes ||
                  pet.general_behavioral_notes ||
                  pet.interactions_with_adults_notes ||
                  pet.interactions_with_kids_notes ||
                  pet.interactions_with_animals_notes ||
                  pet.miscellaneous_notes) && (
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 font-body mb-3 flex items-center">
                      <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      Additional Notes
                    </h4>
                    {pet.general_health_notes && (
                      <div className="border-l-4 border-gray-300 pl-4 py-2">
                        <h5 className="font-medium text-gray-900 font-body">General Health Notes</h5>
                        <p className="text-gray-600 font-body text-sm mt-1">{pet.general_health_notes}</p>
                      </div>
                    )}
                    {pet.general_feeding_notes && (
                      <div className="border-l-4 border-gray-300 pl-4 py-2">
                        <h5 className="font-medium text-gray-900 font-body">General Feeding Notes</h5>
                        <p className="text-gray-600 font-body text-sm mt-1">{pet.general_feeding_notes}</p>
                      </div>
                    )}
                    {pet.general_exercise_and_play_notes && (
                      <div className="border-l-4 border-gray-300 pl-4 py-2">
                        <h5 className="font-medium text-gray-900 font-body">General Exercise and Play Notes</h5>
                        <p className="text-gray-600 font-body text-sm mt-1">{pet.general_exercise_and_play_notes}</p>
                      </div>
                    )}
                    {pet.general_grooming_and_cleaning_notes && (
                      <div className="border-l-4 border-gray-300 pl-4 py-2">
                        <h5 className="font-medium text-gray-900 font-body">General Grooming and Cleaning Notes</h5>
                        <p className="text-gray-600 font-body text-sm mt-1">
                          {pet.general_grooming_and_cleaning_notes}
                        </p>
                      </div>
                    )}
                    {pet.general_behavioral_notes && (
                      <div className="border-l-4 border-gray-300 pl-4 py-2">
                        <h5 className="font-medium text-gray-900 font-body">General Behavioral Notes</h5>
                        <p className="text-gray-600 font-body text-sm mt-1">{pet.general_behavioral_notes}</p>
                      </div>
                    )}
                    {pet.interactions_with_adults_notes && (
                      <div className="border-l-4 border-gray-300 pl-4 py-2">
                        <h5 className="font-medium text-gray-900 font-body">Interactions with Adults Notes</h5>
                        <p className="text-gray-600 font-body text-sm mt-1">{pet.interactions_with_adults_notes}</p>
                      </div>
                    )}
                    {pet.interactions_with_kids_notes && (
                      <div className="border-l-4 border-gray-300 pl-4 py-2">
                        <h5 className="font-medium text-gray-900 font-body">Interactions with Kids Notes</h5>
                        <p className="text-gray-600 font-body text-sm mt-1">{pet.interactions_with_kids_notes}</p>
                      </div>
                    )}
                    {pet.interactions_with_animals_notes && (
                      <div className="border-l-4 border-gray-300 pl-4 py-2">
                        <h5 className="font-medium text-gray-900 font-body">Interactions with Animals Notes</h5>
                        <p className="text-gray-600 font-body text-sm mt-1">{pet.interactions_with_animals_notes}</p>
                      </div>
                    )}
                    {pet.miscellaneous_notes && (
                      <div className="border-l-4 border-gray-300 pl-4 py-2">
                        <h5 className="font-medium text-gray-900 font-body">Miscellaneous Notes</h5>
                        <p className="text-gray-600 font-body text-sm mt-1">{pet.miscellaneous_notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      default:
        return <div className="text-gray-600">No content available for this section.</div>
    }
  }

  return (
    <div className="container mx-auto py-10">
      {/* Back Button */}
      <Link href="/" className="inline-flex items-center mb-6 text-gray-600 hover:text-gray-800">
        <ArrowLeft className="mr-2 h-5 w-5" />
        Back to Home
      </Link>

      {/* Title and Tabs */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 font-body">Customer Hub</h1>
        <p className="text-gray-500 font-body">Welcome to your personalized customer portal.</p>
      </div>

      {/* Email/Code Form */}
      {step === "email" && (
        <div className="max-w-md mx-auto">
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  id="email"
                  className="shadow-sm focus:ring-[#E75837] focus:border-[#E75837] block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#E75837] hover:bg-[#E75837]/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E75837]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Validation Code"
                )}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </form>
        </div>
      )}

      {step === "code" && (
        <div className="max-w-md mx-auto">
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Validation Code
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="code"
                  className="shadow-sm focus:ring-[#E75837] focus:border-[#E75837] block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter code"
                  value={validationCode}
                  onChange={(e) => setValidationCode(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#E75837] hover:bg-[#E75837]/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E75837]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Code"
                )}
              </button>
            </div>
            <button onClick={resetForm} className="text-sm text-gray-500 hover:text-gray-700 focus:outline-none">
              ← Back to Email
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </form>
        </div>
      )}

      {/* Main Content */}
      {step === "data" && customerData && (
        <div className="space-y-8">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("pets")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "pets"
                    ? "border-[#E75837] text-[#E75837]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Pets
              </button>
              <button
                onClick={() => setActiveTab("appointments")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "appointments"
                    ? "border-[#E75837] text-[#E75837]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Appointments
              </button>
              <button
                onClick={() => setActiveTab("invoices")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "invoices"
                    ? "border-[#E75837] text-[#E75837]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Invoices
              </button>
              {customerData.onboarding_complete === false && (
                <button
                  onClick={() => setActiveTab("onboarding")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "onboarding"
                      ? "border-[#E75837] text-[#E75837]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Onboarding
                </button>
              )}
            </nav>
          </div>

          {/* Pets Tab */}
          {activeTab === "pets" && (
            <div className="space-y-6">
              {customerData.pets.length > 0 ? (
                customerData.pets.map((pet: Pet) => (
                  <div key={pet.pet_id} className="bg-white shadow overflow-hidden rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 font-body">
                          {pet.pet_name}
                          {getPetIcon(pet.pet_type)}
                        </h3>
                        <button
                          onClick={() => togglePetExpansion(pet.pet_id)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E75837]"
                        >
                          {expandedPet === pet.pet_id ? (
                            <>
                              <ChevronUp className="mr-2 h-5 w-5" />
                              Collapse
                            </>
                          ) : (
                            <>
                              <ChevronDown className="mr-2 h-5 w-5" />
                              Expand
                            </>
                          )}
                        </button>
                      </div>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500 font-body">
                        {pet.pet_type} • {pet.breed_name}
                      </p>
                    </div>
                    {expandedPet === pet.pet_id && (
                      <div className="border-t border-gray-200">
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Pet Profile Sections</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            <div className="flex space-x-4">
                              <button
                                onClick={() => setSelectedPetSection("general")}
                                className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E75837] ${
                                  selectedPetSection === "general" ? "bg-gray-100" : ""
                                }`}
                              >
                                General
                              </button>
                              <button
                                onClick={() => setSelectedPetSection("health")}
                                className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E75837] ${
                                  selectedPetSection === "health" ? "bg-gray-100" : ""
                                }`}
                              >
                                Health
                              </button>
                              <button
                                onClick={() => setSelectedPetSection("food")}
                                className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E75837] ${
                                  selectedPetSection === "food" ? "bg-gray-100" : ""
                                }`}
                              >
                                Food
                              </button>
                              <button
                                onClick={() => setSelectedPetSection("vaccine-overview")}
                                className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E75837] ${
                                  selectedPetSection === "vaccine-overview" ? "bg-gray-100" : ""
                                }`}
                              >
                                Vaccine Overview
                              </button>
                              <button
                                onClick={() => setSelectedPetSection("care-plan-report")}
                                className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E75837] ${
                                  selectedPetSection === "care-plan-report" ? "bg-gray-100" : ""
                                }`}
                              >
                                Daily Care Plan
                              </button>
                            </div>
                          </dd>
                        </div>
                        <div className="px-4 py-5 sm:px-6">{renderPetProfileSection(pet, selectedPetSection)}</div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Dog className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-body">No pets recorded</p>
                </div>
              )}
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === "appointments" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 font-body">Appointments</h2>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setAppointmentView("calendar")}
                    className={`px-3 py-2 rounded-md font-medium text-sm ${
                      appointmentView === "calendar"
                        ? "bg-[#E75837] text-white hover:bg-[#E75837]/80"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Calendar
                  </button>
                  <button
                    onClick={() => setAppointmentView("list")}
                    className={`px-3 py-2 rounded-md font-medium text-sm ${
                      appointmentView === "list"
                        ? "bg-[#E75837] text-white hover:bg-[#E75837]/80"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    List
                  </button>
                </div>
              </div>

              {appointmentView === "calendar" && (
                <div className="bg-white shadow overflow-hidden rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 font-body">
                        {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            const newDate = new Date(currentDate)
                            newDate.setMonth(currentDate.getMonth() - 1)
                            setCurrentDate(newDate)
                          }}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            const newDate = new Date(currentDate)
                            newDate.setMonth(currentDate.getMonth() + 1)
                            setCurrentDate(newDate)
                          }}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <div key={day} className="text-center text-gray-500 font-body">
                          {day}
                        </div>
                      ))}

                      {generateCalendarDays(currentDate).map((day, index) => {
                        const bookingsForDay = getBookingsForDate(day)
                        const isToday =
                          day.getDate() === new Date().getDate() &&
                          day.getMonth() === new Date().getMonth() &&
                          day.getFullYear() === new Date().getFullYear()
                        const isCurrentMonth = day.getMonth() === currentDate.getMonth()

                        return (
                          <div
                            key={index}
                            className={`relative p-2 rounded-md ${
                              isToday ? "bg-[#E75837] text-white" : "bg-gray-100 text-gray-700"
                            } ${!isCurrentMonth ? "opacity-50" : ""}`}
                          >
                            <div className="text-sm text-center font-body">{day.getDate()}</div>
                            {bookingsForDay.length > 0 && (
                              <div className="absolute bottom-1 left-0 w-full px-1">
                                {bookingsForDay.map((booking) => (
                                  <div
                                    key={booking.booking_id}
                                    className={`text-xs font-medium text-white py-0.5 px-1 rounded-full mt-1 ${getServiceTypeColor(
                                      booking.service_types || "",
                                    )}`}
                                  >
                                    {convertToUserTimezone(booking.start)} - {booking.professional_name}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {appointmentView === "list" && (
                <div className="bg-white shadow overflow-hidden rounded-lg">
                  <ul className="divide-y divide-gray-200">
                    {customerData.bookings.length > 0 ? (
                      customerData.bookings.map((booking: Booking) => (
                        <li key={booking.booking_id}>
                          <a href="#" className="block hover:bg-gray-50">
                            <div className="px-4 py-4 sm:px-6">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-indigo-600 truncate font-body">
                                  {booking.professional_name}
                                </p>
                                <div className="ml-2 flex-shrink-0">
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-medium ${getServiceTypeColor(
                                      booking.service_types || "",
                                    )}`}
                                  >
                                    {booking.service_types}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-2 sm:flex sm:justify-between">
                                <div className="sm:flex">
                                  <p className="flex items-center text-sm text-gray-500 font-body">
                                    <User className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                    {booking.customer_first_name} {booking.customer_last_name}
                                  </p>
                                  <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6 font-body">
                                    <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                    <time dateTime={booking.start}>{booking.booking_date_formatted}</time>
                                  </p>
                                </div>
                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 font-body">
                                  <Mail className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                  {convertToUserTimezone(booking.start)} - {convertToUserTimezone(booking.end)}
                                </div>
                              </div>
                            </div>
                          </a>
                        </li>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 font-body">No appointments scheduled</p>
                      </div>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === "invoices" && (
            <div className="space-y-6">
              {customerData.invoices && customerData.invoices.length > 0 ? (
                <div className="bg-white shadow overflow-hidden rounded-lg">
                  <ul className="divide-y divide-gray-200">
                    {customerData.invoices.map((invoice: Invoice) => (
                      <li key={invoice.invoice_number}>
                        <a href="#" className="block hover:bg-gray-50">
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-indigo-600 truncate font-body">
                                Invoice #{invoice.invoice_number}
                              </p>
                              <div className="ml-2 flex-shrink-0">
                                <span
                                  className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadgeStyle(invoice.status)}`}
                                >
                                  {invoice.status}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <p className="flex items-center text-sm text-gray-500 font-body">
                                  <FileText className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                  Due Date: {new Date(invoice.due_date).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 font-body">
                                <Scale className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                Amount: ${invoice.amount}
                              </div>
                            </div>
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-body">No invoices available</p>
                </div>
              )}

              {customerData.payment_instructions && (
                <div className="bg-white shadow overflow-hidden rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg font-medium text-gray-900 font-body">Payment Instructions</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500 font-body">
                      {customerData.payment_instructions}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Onboarding Tab */}
          {activeTab === "onboarding" && renderPetProfileSection(null, "onboarding")}
        </div>
      )}
    </div>
  )
}
