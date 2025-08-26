"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Mail,
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
  signature?: string
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

  const [showOnboardingModal, setShowOnboardingModal] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(1)
  const [onboardingLoading, setOnboardingLoading] = useState(false)
  const [policyDocuments, setPolicyDocuments] = useState<any[]>([])
  const [picklistData, setPicklistData] = useState<any[]>([])
  const [onboardingData, setOnboardingData] = useState({
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
    emergencyContact: {
      contactName: "",
      businessName: "",
      address: "",
      phoneNumber: "",
      email: "",
      notes: "",
    },
    pets: [] as any[],
    policyAcknowledgments: {} as any,
    signature: "",
  })

  useEffect(() => {
    setProfessionalName("Professional") // Placeholder
  }, [uniqueUrl])

  const [pets, setPets] = useState<any[]>([])
  const [onboardingStatus, setOnboardingStatus] = useState<any>(null)

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

      if (Array.isArray(data) && data.length > 0 && data[0].invalid_email) {
        setError(
          "No matching email on file - please make sure you have completed customer intake or directly reach out to your Critter Professional",
        )
        return
      }

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
            sleep_instructions: petInfo.sleep_instructions || petData.sleep_instructions,
            play_instructions: petInfo.play_instructions || petData.play_instructions,
            general_health_notes: petInfo.general_health_notes || petData.general_health_notes,
            general_feeding_notes: petInfo.general_feeding_notes || petData.general_feeding_notes,
            general_exercise_and_play_notes:
              petInfo.general_exercise_and_play_notes || petData.general_exercise_and_play_notes,
            general_grooming_and_cleaning_notes:
              petInfo.general_grooming_and_cleaning_notes || petData.general_grooming_and_cleaning_notes,
            general_behavioral_notes: petInfo.general_behavioral_notes || petData.general_behavioral_notes,
            interactions_with_adults_notes:
              petInfo.interactions_with_adults_notes || petData.interactions_with_adults_notes,
            interactions_with_kids_notes: petInfo.interactions_with_kids_notes || petData.interactions_with_kids_notes,
            interactions_with_animals_notes:
              petInfo.interactions_with_animals_notes || petData.interactions_with_animals_notes,
            miscellaneous_notes: petInfo.miscellaneous_notes || petData.miscellaneous_notes,
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
        let signature = ""

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
            signature = item.signature || ""
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
          signature,
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
                </div>
              )}

              {selectedOnboardingSubSection === "policy-documentation" && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-900 font-body mb-4">Policy Documentation</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Policies Signed</p>
                      <p className="text-gray-900">{customerData?.criteria_status?.policies_signed ? "Yes" : "No"}</p>
                    </div>
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
                          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 4 0 01-4 4zM7 3H5a2 2 0 00-2 2v12a4 4 0 004 4h2a2 2 0 002-2V5a2 2 0 00-2-2z"
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
              </div>
            </div>
          </div>
        )

      default:
        return <div>Section not found</div>
    }
  }

  const renderCareInstructionField = (label: string, value: string | undefined, icon: React.ReactNode) => {
    if (!value || value.trim() === "") return null

    return (
      <div className="flex gap-3 p-4 bg-gray-50 rounded-lg">
        <div className="text-[#E75837] mt-0.5">{icon}</div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 font-body mb-1">{label}</h4>
          <p className="text-gray-700 font-body text-sm leading-relaxed">{value}</p>
        </div>
      </div>
    )
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

  const isOnboardingIncomplete = () => {
    if (!customerData?.criteria_status) return false

    return (
      !customerData.criteria_status.personal_info_complete ||
      !customerData.criteria_status.pets_created ||
      !customerData.criteria_status.emergency_contacts_added ||
      !customerData.criteria_status.policies_signed
    )
  }

  const handleCompleteOnboarding = async () => {
    setOnboardingLoading(true)
    setShowOnboardingModal(true)
    setOnboardingStep(1)

    try {
      const webhookUrl = getWebhookEndpoint("CUSTOMER_HUB")
      logWebhookUsage("CUSTOMER_HUB", "run_onboarding")

      const payload = {
        action: "run_onboarding",
        unique_url: uniqueUrl,
        customer_email: email,
        timestamp: new Date().toISOString(),
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const data = await response.json()

        console.log("[v0] Onboarding data received:", data)

        const picklists = data.filter((item: any) => item.table_name && item.picklist_type)
        setPicklistData(picklists)

        let policies: any[] = []
        data.forEach((item: any) => {
          if (item.signed_urls && Array.isArray(item.signed_urls)) {
            policies = [...policies, ...item.signed_urls]
          }
        })
        console.log("[v0] Extracted policy documents:", policies)
        setPolicyDocuments(policies)

        // Extract user information
        const userInfo = data.find((item: any) => item.email && item.user_type)
        if (userInfo?.supporting_details?.personal_info) {
          setOnboardingData((prev) => ({
            ...prev,
            personalInfo: {
              firstName: userInfo.supporting_details.personal_info.first_name || "",
              lastName: userInfo.supporting_details.personal_info.last_name || "",
              email: userInfo.supporting_details.personal_info.email || "",
              phone: "", // Phone not in current data structure
            },
          }))
        }

        const petsData = data.filter((item: any) => item.name && item.pet_type)
        const processedPets = petsData.map((pet: any) => ({
          // Preserve original ID for comparison
          id: pet.id,
          name: pet.name,
          pet_type: pet.pet_type,
          breed_name: pet.breed_name,
          sex: pet.pet_sex,
          weight: pet.weight || "",
          spayed_neutered: pet.spayed_or_neutered,
          birth_date: pet.birthdate,
          chip_id: pet.chip_id,
          // Mark as existing for tracking
          isExisting: true,
        }))

        setOnboardingData((prev) => ({
          ...prev,
          pets: processedPets,
        }))

        const emergencyContacts = petsData.flatMap(
          (pet: any) => pet.contacts?.filter((contact: any) => contact.contact_type === "Emergency Contact") || [],
        )

        const processedEmergencyContacts = emergencyContacts.map((contact: any) => ({
          // Preserve original ID for comparison
          id: contact.id,
          contactName: contact.contact_name || "",
          businessName: contact.business_name || "",
          address: contact.address || "",
          phoneNumber: contact.phone_number || "",
          email: contact.email || "",
          notes: contact.notes || "",
          // Mark as existing for tracking
          isExisting: true,
        }))

        setOnboardingData((prev) => ({
          ...prev,
          emergencyContacts: processedEmergencyContacts,
        }))
      }
    } catch (error) {
      console.error("Error fetching onboarding data:", error)
    } finally {
      setOnboardingLoading(false)
    }
  }

  const getPetTypes = () => {
    return picklistData.filter((item: any) => item.picklist_type === "type")
  }

  const getBreedsByType = (petType: string) => {
    console.log("[v0] Getting breeds for pet type:", petType)
    console.log("[v0] Available picklist data:", picklistData)

    const typeItem = getPetTypes().find((item: any) => item.label === petType)
    console.log("[v0] Found type item:", typeItem)

    if (!typeItem) return []

    const expectedCategory = typeItem.label
    console.log("[v0] Looking for category:", expectedCategory)

    const breeds = picklistData.filter(
      (item: any) => item.picklist_type === "breed" && item.category === expectedCategory,
    )

    console.log("[v0] Found breeds:", breeds)
    return breeds
  }

  const handleOnboardingNext = () => {
    if (onboardingStep < 4) {
      setOnboardingStep(onboardingStep + 1)
    }
  }

  const handleOnboardingPrev = () => {
    if (onboardingStep > 1) {
      setOnboardingStep(onboardingStep - 1)
    }
  }

  const sanitizeAddressForSQL = (address: string) => {
    if (!address) return address
    return address
      .replace(/[,;'"]/g, "") // Remove commas, semicolons, and quotes
      .replace(/[^\w\s\-.#]/g, "") // Keep only alphanumeric, spaces, hyphens, periods, and hash symbols
      .trim()
  }

  const handleOnboardingSubmit = async () => {
    setOnboardingLoading(true)

    try {
      const webhookUrl = getWebhookEndpoint("CUSTOMER_HUB")
      logWebhookUsage("CUSTOMER_HUB", "submit_onboarding")

      // Track original data for comparison
      const originalData = {
        personalInfo: customerData?.supporting_details?.personal_info || {},
        pets: customerData?.pets || [],
        emergencyContacts: customerData?.emergency_contacts || [],
      }

      // Helper function to compare objects and detect changes
      const hasChanges = (original: any, current: any, fieldsToCheck: string[]) => {
        return fieldsToCheck.some((field) => {
          const originalValue = original[field] || ""
          const currentValue = current[field] || ""
          return originalValue !== currentValue
        })
      }

      // Analyze personal information changes
      const personalInfoAnalysis = () => {
        const originalPersonal = originalData.personalInfo
        const currentPersonal = onboardingData.personalInfo

        const fieldsToCheck = ["first_name", "last_name", "email", "phone"]
        const personalHasChanges = hasChanges(
          {
            first_name: originalPersonal.first_name,
            last_name: originalPersonal.last_name,
            email: originalPersonal.email,
            phone: originalPersonal.phone,
          },
          {
            first_name: currentPersonal.firstName,
            last_name: currentPersonal.lastName,
            email: currentPersonal.email,
            phone: currentPersonal.phone,
          },
          fieldsToCheck,
        )

        if (!personalHasChanges && (originalPersonal.first_name || originalPersonal.last_name)) {
          return null // No changes to existing data
        }

        return {
          action: originalPersonal.first_name || originalPersonal.last_name ? "update" : "create",
          changes: {
            first_name: currentPersonal.firstName,
            last_name: currentPersonal.lastName,
            email: currentPersonal.email,
            phone: currentPersonal.phone,
          },
          database_fields: {
            table: "users",
            primary_key: "id",
            fields_to_update: ["first_name", "last_name", "email", "phone"],
          },
        }
      }

      const petAnalysis = () => {
        const changedPets = []

        for (const currentPet of onboardingData.pets) {
          // Check if this pet has an existing ID (was loaded from database)
          if (!currentPet.id || !currentPet.isExisting) {
            // This is a new pet created during onboarding (no existing ID)
            const petTypeItem = getPetTypes().find((item: any) => item.label === currentPet.pet_type)
            const breedItem = getBreedsByType(currentPet.pet_type).find(
              (item: any) => item.label === currentPet.breed_name,
            )

            changedPets.push({
              action: "create",
              pet_data: {
                name: currentPet.name,
                pet_type: currentPet.pet_type,
                pet_type_id: petTypeItem?.value || null,
                breed_name: currentPet.breed_name,
                breed_id: breedItem?.value || null,
                sex: currentPet.sex,
                weight: currentPet.weight,
                spayed_neutered: currentPet.spayed_neutered,
                birth_date: currentPet.birth_date,
                chip_id: currentPet.chip_id,
              },
              database_fields: {
                table: "pets",
                primary_key: "id",
                fields_to_update: "all_fields",
              },
            })
          } else {
            // This is an existing pet - find the original data for comparison
            const originalPet = originalData.pets.find((p: any) => p.id === currentPet.id)

            if (originalPet) {
              // Check if existing pet has changes
              const petFieldsToCheck = [
                "name",
                "pet_type",
                "breed_name",
                "sex",
                "weight",
                "spayed_neutered",
                "birth_date",
                "chip_id",
              ]
              const petHasChanges = hasChanges(
                {
                  name: originalPet.name,
                  pet_type: originalPet.pet_type,
                  breed_name: originalPet.breed_name,
                  sex: originalPet.pet_sex,
                  weight: originalPet.weight || "",
                  spayed_neutered: originalPet.spayed_or_neutered,
                  birth_date: originalPet.birthdate,
                  chip_id: originalPet.chip_id,
                },
                {
                  name: currentPet.name,
                  pet_type: currentPet.pet_type,
                  breed_name: currentPet.breed_name,
                  sex: currentPet.sex,
                  weight: currentPet.weight,
                  spayed_neutered: currentPet.spayed_neutered,
                  birth_date: currentPet.birth_date,
                  chip_id: currentPet.chip_id,
                },
                petFieldsToCheck,
              )

              // Only include in submission if there are actual changes
              if (petHasChanges) {
                const petTypeItem = getPetTypes().find((item: any) => item.label === currentPet.pet_type)
                const breedItem = getBreedsByType(currentPet.pet_type).find(
                  (item: any) => item.label === currentPet.breed_name,
                )

                changedPets.push({
                  action: "update",
                  pet_data: {
                    id: currentPet.id,
                    name: currentPet.name,
                    pet_type: currentPet.pet_type,
                    pet_type_id: petTypeItem?.value || null,
                    breed_name: currentPet.breed_name,
                    breed_id: breedItem?.value || null,
                    sex: currentPet.sex,
                    weight: currentPet.weight,
                    spayed_neutered: currentPet.spayed_neutered,
                    birth_date: currentPet.birth_date,
                    chip_id: currentPet.chip_id,
                  },
                  database_fields: {
                    table: "pets",
                    primary_key: "id",
                    fields_to_update: [
                      "name",
                      "pet_type",
                      "breed_name",
                      "sex",
                      "weight",
                      "spayed_neutered",
                      "birth_date",
                      "chip_id",
                    ],
                  },
                })
              }
              // If no changes detected, pet is excluded from submission
            }
          }
        }

        return changedPets
      }

      const emergencyContactAnalysis = () => {
        const changedContacts = []

        // Check for new emergency contacts in the emergencyContacts array
        if (onboardingData.emergencyContacts && onboardingData.emergencyContacts.length > 0) {
          for (const currentContact of onboardingData.emergencyContacts) {
            // Skip existing contacts (those with isExisting flag)
            if (currentContact.isExisting) {
              continue
            }

            // This is a new contact if it has data and no isExisting flag
            if (currentContact.contactName) {
              changedContacts.push({
                action: "create",
                contact_data: {
                  contact_name: currentContact.contactName,
                  business_name: currentContact.businessName,
                  address: sanitizeAddressForSQL(currentContact.address), // Sanitize address for SQL
                  phone_number: currentContact.phoneNumber,
                  email: currentContact.email,
                  notes: currentContact.notes,
                },
                database_fields: {
                  table: "pet_contacts",
                  primary_key: "id",
                  fields_to_update: ["contact_name", "business_name", "address", "phone_number", "email", "notes"],
                },
              })
            }
          }
        }

        // Also check the single emergencyContact field for backward compatibility
        const originalContact = originalData.emergencyContacts[0] || {}
        const currentContact = onboardingData.emergencyContact

        if (currentContact.contactName) {
          const contactFieldsToCheck = ["contact_name", "business_name", "address", "phone_number", "email", "notes"]
          const contactHasChanges = hasChanges(
            {
              contact_name: originalContact.contact_name,
              business_name: originalContact.business_name,
              address: originalContact.address,
              phone_number: originalContact.phone_number,
              email: originalContact.email,
              notes: originalContact.notes,
            },
            {
              contact_name: currentContact.contactName,
              business_name: currentContact.businessName,
              address: currentContact.address,
              phone_number: currentContact.phoneNumber,
              email: currentContact.email,
              notes: currentContact.notes,
            },
            contactFieldsToCheck,
          )

          if (contactHasChanges || !originalContact.contact_name) {
            changedContacts.push({
              action: originalContact.contact_name ? "update" : "create",
              contact_data: {
                contact_name: currentContact.contactName,
                business_name: currentContact.businessName,
                address: sanitizeAddressForSQL(currentContact.address), // Sanitize address for SQL
                phone_number: currentContact.phoneNumber,
                email: currentContact.email,
                notes: currentContact.notes,
              },
              database_fields: {
                table: "pet_contacts",
                primary_key: "id",
                fields_to_update: ["contact_name", "business_name", "address", "phone_number", "email", "notes"],
              },
            })
          }
        }

        return changedContacts
      }

      // Build submission analysis with only changed data
      const submissionAnalysis: any = {}

      const personalInfo = personalInfoAnalysis()
      if (personalInfo) {
        submissionAnalysis.personal_information = personalInfo
      }

      const pets = petAnalysis()
      if (pets.length > 0) {
        submissionAnalysis.pets = pets
      }

      const emergencyContact = emergencyContactAnalysis()
      if (emergencyContact.length > 0) {
        submissionAnalysis.emergency_contacts = emergencyContact
      }

      // Policy acknowledgments are always new
      if (Object.keys(onboardingData.policyAcknowledgments).length > 0) {
        submissionAnalysis.policy_acknowledgments = {
          action: "create",
          policies: Object.keys(onboardingData.policyAcknowledgments).map((policyId) => ({
            policy_id: Number.parseInt(policyId),
            acknowledged: onboardingData.policyAcknowledgments[policyId],
            signature: onboardingData.signature,
            acknowledged_at: new Date().toISOString(),
          })),
          database_fields: {
            table: "business_policy_acknowledgments",
            primary_key: "id",
            fields_to_update: ["policy_id", "user_id", "signed", "signed_at", "signature"],
          },
        }
      }

      const payload = {
        action: "submit_onboarding",
        unique_url: uniqueUrl,
        customer_email: email,
        submission_analysis: submissionAnalysis,
        raw_onboarding_data: onboardingData, // Keep original data for reference
        timestamp: new Date().toISOString(),
        metadata: {
          total_pets: onboardingData.pets.length,
          new_pets: pets.filter((p) => p.action === "create").length,
          updated_pets: pets.filter((p) => p.action === "update").length,
          unchanged_pets: onboardingData.pets.length - pets.length,
          has_emergency_contact: !!(
            onboardingData.emergencyContact.contactName ||
            (onboardingData.emergencyContacts &&
              onboardingData.emergencyContacts.some((c) => c.contactName && !c.isExisting))
          ),
          policies_acknowledged: Object.keys(onboardingData.policyAcknowledgments).length,
          signature_provided: !!onboardingData.signature,
        },
      }

      console.log("[v0] Submitting onboarding with analysis:", payload)

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const updatedData = await response.json()
        console.log("[v0] Onboarding submission successful, received updated data:", updatedData)

        if (
          updatedData.status === "onboarding_submitted_successfully" ||
          updatedData.message === "onboarding_submitted_successfully" ||
          (Array.isArray(updatedData) &&
            updatedData.some((item) => item.output === "onboarding_submitted_successfully"))
        ) {
          try {
            console.log("[v0] Sending reinitialize_customer_hub webhook...")

            const reinitializePayload = {
              action: "reinitialize_customer_hub",
              unique_url: uniqueUrl,
              customer_email: email,
              timestamp: new Date().toISOString(),
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            }

            const reinitializeResponse = await fetch(webhookUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(reinitializePayload),
            })

            if (reinitializeResponse.ok) {
              const reinitializedData = await reinitializeResponse.json()
              console.log("[v0] Customer hub reinitialized successfully:", reinitializedData)

              if (Array.isArray(reinitializedData) && reinitializedData.length > 0) {
                // Extract pets data from the response
                const petsData = reinitializedData.filter((item: any) => item.id && item.name)
                if (petsData.length > 0) {
                  setPets(petsData)
                }

                const onboardingData = reinitializedData.find((item: any) => item.onboarding_complete !== undefined)
                if (onboardingData) {
                  setCustomerData((prevData: any) => ({
                    ...prevData,
                    onboarding_complete: onboardingData.onboarding_complete,
                    criteria_status: onboardingData.criteria_status,
                    supporting_details: onboardingData.supporting_details,
                  }))
                }
              }
            } else {
              console.error("Failed to reinitialize customer hub:", reinitializeResponse.statusText)
            }
          } catch (reinitializeError) {
            console.error("Error reinitializing customer hub:", reinitializeError)
          }
        }

        setShowOnboardingModal(false)
        setOnboardingStep(1)

        // window.location.reload()
      } else {
        console.error("Failed to submit onboarding:", response.statusText)
        alert("Failed to submit onboarding. Please try again.")
      }
    } catch (error) {
      console.error("Error submitting onboarding:", error)
      alert("An error occurred while submitting. Please try again.")
    } finally {
      setOnboardingLoading(false)
    }
  }

  return (
    <>
      {step === "email" && (
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Welcome, Critter Customer!</h2>
              <p className="text-gray-600 mt-2">Please enter your email to access your Customer Hub.</p>
            </div>
            <form onSubmit={handleEmailSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email Address
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
              <div className="flex items-center justify-between">
                <button
                  className="bg-[#E75837] hover:bg-[#333333] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait...
                    </>
                  ) : (
                    "Continue"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {step === "code" && (
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Verification Code</h2>
              <p className="text-gray-600 mt-2">
                A verification code has been sent to your email address. Please enter it below.
              </p>
            </div>
            <form onSubmit={handleCodeSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="code">
                  Verification Code
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="code"
                  type="text"
                  placeholder="Enter code"
                  value={validationCode}
                  onChange={(e) => setValidationCode(e.target.value)}
                />
              </div>
              {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
              <div className="flex items-center justify-between">
                <button
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="button"
                  onClick={resetForm}
                >
                  Back
                </button>
                <button
                  className="bg-[#E75837] hover:bg-[#333333] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait...
                    </>
                  ) : (
                    "Verify"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {step === "data" && customerData && (
        <div className="container mx-auto py-10">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 font-body">
                Welcome to Your Customer Hub, {professionalName}!
              </h1>
              <p className="text-gray-600 font-body">Here you can manage your pets, appointments, and invoices.</p>
            </div>
            <div className="space-x-3">
              <Link href="/" className="text-[#E75837] hover:underline font-body">
                <ArrowLeft className="inline-block w-4 h-4 mr-1" />
                Back to Home
              </Link>
              <button
                onClick={resetForm}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded font-body"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Onboarding Banner */}
          {customerData.onboarding_complete === false && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.824-1.36 3.589 0l8 14.035a1.5 1.5 0 01-1.743 2.307H3.905a1.5 1.5 0 01-1.743-2.307l8-14.035zM11 5a1 1 0 11-2 0 1 1 0 012 0zm-1 6a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong className="font-bold">Onboarding Incomplete:</strong> Please complete your onboarding
                    process to ensure we have all the necessary information.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tabs Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab("pets")}
                className={`py-2 px-4 font-medium text-sm ${
                  activeTab === "pets"
                    ? "border-b-2 border-[#E75837] text-[#E75837]"
                    : "border-b-2 border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Pets
              </button>
              <button
                onClick={() => setActiveTab("appointments")}
                className={`py-2 px-4 font-medium text-sm ${
                  activeTab === "appointments"
                    ? "border-b-2 border-[#E75837] text-[#E75837]"
                    : "border-b-2 border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Appointments
              </button>
              <button
                onClick={() => setActiveTab("invoices")}
                className={`py-2 px-4 font-medium text-sm ${
                  activeTab === "invoices"
                    ? "border-b-2 border-[#E75837] text-[#E75837]"
                    : "border-b-2 border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Invoices
              </button>
              <button
                onClick={() => setActiveTab("onboarding")}
                className={`py-2 px-4 font-medium text-sm ${
                  activeTab === "onboarding"
                    ? "border-b-2 border-[#E75837] text-[#E75837]"
                    : "border-b-2 border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Onboarding
              </button>
            </nav>
          </div>

          {/* Pets Tab Content */}
          {activeTab === "pets" && (
            <div className="space-y-6">
              {customerData.pets.length > 0 ? (
                customerData.pets.map((pet: any) => (
                  <div key={pet.pet_id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="mr-2">{getPetIcon(pet.pet_type)}</span>
                          <h2 className="text-xl font-semibold text-gray-800 font-body">{pet.pet_name}</h2>
                        </div>
                        <button
                          onClick={() => togglePetExpansion(pet.pet_id)}
                          className="text-gray-600 hover:text-gray-800 focus:outline-none"
                        >
                          {expandedPet === pet.pet_id ? (
                            <ChevronUp className="w-6 h-6" />
                          ) : (
                            <ChevronDown className="w-6 h-6" />
                          )}
                        </button>
                      </div>
                      <p className="text-gray-600 font-body">
                        {pet.pet_type} • {pet.breed_name}
                      </p>
                    </div>

                    {expandedPet === pet.pet_id && (
                      <div className="border-t border-gray-200">
                        <nav className="flex space-x-4 bg-gray-50 px-6 py-3">
                          <button
                            onClick={() => setSelectedPetSection("general")}
                            className={`px-3 py-2 rounded-md text-sm font-medium ${
                              selectedPetSection === "general"
                                ? "bg-[#E75837] text-white"
                                : "text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            General
                          </button>
                          <button
                            onClick={() => setSelectedPetSection("health")}
                            className={`px-3 py-2 rounded-md text-sm font-medium ${
                              selectedPetSection === "health"
                                ? "bg-[#E75837] text-white"
                                : "text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            Health
                          </button>
                          <button
                            onClick={() => setSelectedPetSection("food")}
                            className={`px-3 py-2 rounded-md text-sm font-medium ${
                              selectedPetSection === "food"
                                ? "bg-[#E75837] text-white"
                                : "text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            Food
                          </button>
                          <button
                            onClick={() => setSelectedPetSection("vaccine-overview")}
                            className={`px-3 py-2 rounded-md text-sm font-medium ${
                              selectedPetSection === "vaccine-overview"
                                ? "bg-[#E75837] text-white"
                                : "text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            Vaccine Overview
                          </button>
                          <button
                            onClick={() => setSelectedPetSection("care-plan-report")}
                            className={`px-3 py-2 rounded-md text-sm font-medium ${
                              selectedPetSection === "care-plan-report"
                                ? "bg-[#E75837] text-white"
                                : "text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            Care Plan Report
                          </button>
                        </nav>
                        <div className="p-6">{renderPetProfileSection(pet, selectedPetSection)}</div>
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

          {/* Appointments Tab Content */}
          {activeTab === "appointments" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setAppointmentView("calendar")}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      appointmentView === "calendar" ? "bg-[#E75837] text-white" : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Calendar View
                  </button>
                  <button
                    onClick={() => setAppointmentView("list")}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      appointmentView === "list" ? "bg-[#E75837] text-white" : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    List View
                  </button>
                </div>
                {appointmentView === "calendar" && (
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                      className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-semibold text-gray-800 font-body">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <button
                      onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                      className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {appointmentView === "calendar" && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="grid grid-cols-7 bg-gray-100">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div key={day} className="py-2 text-center text-gray-700 font-semibold font-body">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7">
                    {calendarDays.map((day) => {
                      const bookingsForDay = getBookingsForDate(day)
                      const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                      return (
                        <div
                          key={day.toISOString()}
                          className={`p-2 border-r border-b border-gray-200 ${isCurrentMonth ? "" : "text-gray-400"}`}
                        >
                          <div className="text-sm text-gray-700 font-body">{day.getDate()}</div>
                          {bookingsForDay.map((booking) => (
                            <div
                              key={booking.booking_id}
                              className={`mt-1 px-2 py-1 rounded-full text-xs font-medium ${getServiceTypeColor(
                                booking.service_types,
                              )}`}
                            >
                              {booking.start_formatted} - {booking.service_names}
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {appointmentView === "list" && customerData.bookings.length > 0 ? (
                <div className="space-y-4">
                  {customerData.bookings.map((booking: any) => (
                    <div key={booking.booking_id} className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-800 font-body">
                          {booking.booking_date_formatted} - {booking.day_of_week}
                        </h3>
                        <span className="text-gray-600 font-body">
                          {booking.start_formatted} - {booking.end_formatted}
                        </span>
                      </div>
                      <p className="text-gray-600 font-body">
                        <span className="font-medium">Professional:</span> {booking.professional_name}
                      </p>
                      <p className="text-gray-600 font-body">
                        <span className="font-medium">Customer:</span> {booking.customer_first_name}{" "}
                        {booking.customer_last_name}
                      </p>
                      <p className="text-gray-600 font-body">
                        <span className="font-medium">Services:</span> {booking.service_names}
                      </p>
                      <div className="flex items-center mt-4">
                        <Mail className="w-4 h-4 text-gray-500 mr-2" />
                        <a
                          href={`mailto:${customerData.email}`}
                          className="text-sm text-[#E75837] hover:underline font-body"
                        >
                          Contact Customer
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-body">No appointments scheduled</p>
                </div>
              )}
            </div>
          )}

          {/* Invoices Tab Content */}
          {activeTab === "invoices" && (
            <div className="space-y-6">
              {customerData.invoices && customerData.invoices.length > 0 ? (
                customerData.invoices.map((invoice: any) => (
                  <div key={invoice.invoice_number} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-800 font-body">
                        Invoice #{invoice.invoice_number}
                      </h3>
                      <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded ${getStatusBadgeStyle(invoice.status)}`}
                      >
                        {invoice.status}
                      </span>
                    </div>
                    <p className="text-gray-600 font-body">
                      <span className="font-medium">Due Date:</span> {new Date(invoice.due_date).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600 font-body">
                      <span className="font-medium">Amount:</span> ${invoice.amount}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-body">No invoices found</p>
                </div>
              )}

              {customerData.payment_instructions && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 font-body mb-4">Payment Instructions</h4>
                  <p className="text-gray-700 font-body">{customerData.payment_instructions}</p>
                </div>
              )}
            </div>
          )}

          {/* Onboarding Tab Content */}
          {activeTab === "onboarding" && (
            <div>
              {renderPetProfileSection(customerData, "onboarding")}

              {/* Complete Onboarding Button */}
              {isOnboardingIncomplete() && (
                <div className="mt-8">
                  <button
                    onClick={handleCompleteOnboarding}
                    className="bg-[#E75837] hover:bg-[#333333] text-white font-bold py-3 px-6 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E75837]"
                    disabled={onboardingLoading}
                  >
                    {onboardingLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Complete Onboarding"
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Onboarding Modal */}
          {showOnboardingModal && (
            <div className="fixed z-10 inset-0 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                  <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                  &#8203;
                </span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                          Complete Your Onboarding
                        </h3>
                        <div className="mt-2">
                          {onboardingStep === 1 && (
                            <div>
                              <h4 className="text-md font-semibold text-gray-900 font-body mb-4">
                                Personal Information
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label htmlFor="firstName" className="block text-gray-700 text-sm font-bold mb-2">
                                    First Name
                                  </label>
                                  <input
                                    type="text"
                                    id="firstName"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={onboardingData.personalInfo.firstName}
                                    onChange={(e) =>
                                      setOnboardingData((prev) => ({
                                        ...prev,
                                        personalInfo: { ...prev.personalInfo, firstName: e.target.value },
                                      }))
                                    }
                                  />
                                </div>
                                <div>
                                  <label htmlFor="lastName" className="block text-gray-700 text-sm font-bold mb-2">
                                    Last Name
                                  </label>
                                  <input
                                    type="text"
                                    id="lastName"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={onboardingData.personalInfo.lastName}
                                    onChange={(e) =>
                                      setOnboardingData((prev) => ({
                                        ...prev,
                                        personalInfo: { ...prev.personalInfo, lastName: e.target.value },
                                      }))
                                    }
                                  />
                                </div>
                                <div>
                                  <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                                    Email
                                  </label>
                                  <input
                                    type="email"
                                    id="email"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={onboardingData.personalInfo.email}
                                    onChange={(e) =>
                                      setOnboardingData((prev) => ({
                                        ...prev,
                                        personalInfo: { ...prev.personalInfo, email: e.target.value },
                                      }))
                                    }
                                  />
                                </div>
                                <div>
                                  <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">
                                    Phone Number
                                  </label>
                                  <input
                                    type="tel"
                                    id="phone"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={onboardingData.personalInfo.phone}
                                    onChange={(e) =>
                                      setOnboardingData((prev) => ({
                                        ...prev,
                                        personalInfo: { ...prev.personalInfo, phone: e.target.value },
                                      }))
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {onboardingStep === 2 && (
                            <div>
                              <h4 className="text-md font-semibold text-gray-900 font-body mb-4">Pet Information</h4>
                              <div className="space-y-4">
                                {onboardingData.pets.map((pet: any, index: number) => (
                                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                    <h5 className="font-semibold text-gray-900 font-body mb-2">Pet #{index + 1}</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label
                                          htmlFor={`petName-${index}`}
                                          className="block text-gray-700 text-sm font-bold mb-2"
                                        >
                                          Pet Name
                                        </label>
                                        <input
                                          type="text"
                                          id={`petName-${index}`}
                                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                          value={pet.name}
                                          onChange={(e) => {
                                            const newPets = [...onboardingData.pets]
                                            newPets[index] = { ...pet, name: e.target.value }
                                            setOnboardingData((prev) => ({ ...prev, pets: newPets }))
                                          }}
                                        />
                                      </div>
                                      <div>
                                        <label
                                          htmlFor={`petType-${index}`}
                                          className="block text-gray-700 text-sm font-bold mb-2"
                                        >
                                          Pet Type
                                        </label>
                                        <select
                                          id={`petType-${index}`}
                                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                          value={pet.pet_type}
                                          onChange={(e) => {
                                            const newPets = [...onboardingData.pets]
                                            newPets[index] = { ...pet, pet_type: e.target.value }
                                            setOnboardingData((prev) => ({ ...prev, pets: newPets }))
                                          }}
                                        >
                                          <option value="">Select Type</option>
                                          {getPetTypes().map((type: any) => (
                                            <option key={type.value} value={type.label}>
                                              {type.label}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                      <div>
                                        <label
                                          htmlFor={`breedName-${index}`}
                                          className="block text-gray-700 text-sm font-bold mb-2"
                                        >
                                          Breed
                                        </label>
                                        <select
                                          id={`breedName-${index}`}
                                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                          value={pet.breed_name}
                                          onChange={(e) => {
                                            const newPets = [...onboardingData.pets]
                                            newPets[index] = { ...pet, breed_name: e.target.value }
                                            setOnboardingData((prev) => ({ ...prev, pets: newPets }))
                                          }}
                                          disabled={!pet.pet_type}
                                        >
                                          <option value="">Select Breed</option>
                                          {getBreedsByType(pet.pet_type).map((breed: any) => (
                                            <option key={breed.value} value={breed.label}>
                                              {breed.label}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                      <div>
                                        <label
                                          htmlFor={`petSex-${index}`}
                                          className="block text-gray-700 text-sm font-bold mb-2"
                                        >
                                          Sex
                                        </label>
                                        <select
                                          id={`petSex-${index}`}
                                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                          value={pet.sex}
                                          onChange={(e) => {
                                            const newPets = [...onboardingData.pets]
                                            newPets[index] = { ...pet, sex: e.target.value }
                                            setOnboardingData((prev) => ({ ...prev, pets: newPets }))
                                          }}
                                        >
                                          <option value="">Select Sex</option>
                                          <option value="Male">Male</option>
                                          <option value="Female">Female</option>
                                        </select>
                                      </div>
                                      <div>
                                        <label
                                          htmlFor={`petWeight-${index}`}
                                          className="block text-gray-700 text-sm font-bold mb-2"
                                        >
                                          Weight
                                        </label>
                                        <input
                                          type="number"
                                          id={`petWeight-${index}`}
                                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                          value={pet.weight}
                                          onChange={(e) => {
                                            const newPets = [...onboardingData.pets]
                                            newPets[index] = { ...pet, weight: e.target.value }
                                            setOnboardingData((prev) => ({ ...prev, pets: newPets }))
                                          }}
                                        />
                                      </div>
                                      <div>
                                        <label
                                          htmlFor={`petSpayedNeutered-${index}`}
                                          className="block text-gray-700 text-sm font-bold mb-2"
                                        >
                                          Spayed/Neutered
                                        </label>
                                        <select
                                          id={`petSpayedNeutered-${index}`}
                                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                          value={pet.spayed_neutered}
                                          onChange={(e) => {
                                            const newPets = [...onboardingData.pets]
                                            newPets[index] = { ...pet, spayed_neutered: e.target.value }
                                            setOnboardingData((prev) => ({ ...prev, pets: newPets }))
                                          }}
                                        >
                                          <option value="">Select Option</option>
                                          <option value="Yes">Yes</option>
                                          <option value="No">No</option>
                                        </select>
                                      </div>
                                      <div>
                                        <label
                                          htmlFor={`petBirthDate-${index}`}
                                          className="block text-gray-700 text-sm font-bold mb-2"
                                        >
                                          Birth Date
                                        </label>
                                        <input
                                          type="date"
                                          id={`petBirthDate-${index}`}
                                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                          value={pet.birth_date}
                                          onChange={(e) => {
                                            const newPets = [...onboardingData.pets]
                                            newPets[index] = { ...pet, birth_date: e.target.value }
                                            setOnboardingData((prev) => ({ ...prev, pets: newPets }))
                                          }}
                                        />
                                      </div>
                                      <div>
                                        <label
                                          htmlFor={`petChipId-${index}`}
                                          className="block text-gray-700 text-sm font-bold mb-2"
                                        >
                                          Chip ID
                                        </label>
                                        <input
                                          type="text"
                                          id={`petChipId-${index}`}
                                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                          value={pet.chip_id}
                                          onChange={(e) => {
                                            const newPets = [...onboardingData.pets]
                                            newPets[index] = { ...pet, chip_id: e.target.value }
                                            setOnboardingData((prev) => ({ ...prev, pets: newPets }))
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {onboardingStep === 3 && (
                            <div>
                              <h4 className="text-md font-semibold text-gray-900 font-body mb-4">
                                Emergency Contact Information
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label htmlFor="contactName" className="block text-gray-700 text-sm font-bold mb-2">
                                    Contact Name
                                  </label>
                                  <input
                                    type="text"
                                    id="contactName"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={onboardingData.emergencyContact.contactName}
                                    onChange={(e) =>
                                      setOnboardingData((prev) => ({
                                        ...prev,
                                        emergencyContact: { ...prev.emergencyContact, contactName: e.target.value },
                                      }))
                                    }
                                  />
                                </div>
                                <div>
                                  <label htmlFor="businessName" className="block text-gray-700 text-sm font-bold mb-2">
                                    Business Name
                                  </label>
                                  <input
                                    type="text"
                                    id="businessName"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={onboardingData.emergencyContact.businessName}
                                    onChange={(e) =>
                                      setOnboardingData((prev) => ({
                                        ...prev,
                                        emergencyContact: { ...prev.emergencyContact, businessName: e.target.value },
                                      }))
                                    }
                                  />
                                </div>
                                <div>
                                  <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">
                                    Address
                                  </label>
                                  <input
                                    type="text"
                                    id="address"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={onboardingData.emergencyContact.address}
                                    onChange={(e) =>
                                      setOnboardingData((prev) => ({
                                        ...prev,
                                        emergencyContact: { ...prev.emergencyContact, address: e.target.value },
                                      }))
                                    }
                                  />
                                </div>
                                <div>
                                  <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-bold mb-2">
                                    Phone Number
                                  </label>
                                  <input
                                    type="tel"
                                    id="phoneNumber"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={onboardingData.emergencyContact.phoneNumber}
                                    onChange={(e) =>
                                      setOnboardingData((prev) => ({
                                        ...prev,
                                        emergencyContact: { ...prev.emergencyContact, phoneNumber: e.target.value },
                                      }))
                                    }
                                  />
                                </div>
                                <div>
                                  <label htmlFor="emailContact" className="block text-gray-700 text-sm font-bold mb-2">
                                    Email
                                  </label>
                                  <input
                                    type="email"
                                    id="emailContact"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={onboardingData.emergencyContact.email}
                                    onChange={(e) =>
                                      setOnboardingData((prev) => ({
                                        ...prev,
                                        emergencyContact: { ...prev.emergencyContact, email: e.target.value },
                                      }))
                                    }
                                  />
                                </div>
                                <div>
                                  <label htmlFor="notes" className="block text-gray-700 text-sm font-bold mb-2">
                                    Notes
                                  </label>
                                  <textarea
                                    id="notes"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={onboardingData.emergencyContact.notes}
                                    onChange={(e) =>
                                      setOnboardingData((prev) => ({
                                        ...prev,
                                        emergencyContact: { ...prev.emergencyContact, notes: e.target.value },
                                      }))
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {onboardingStep === 4 && (
                            <div>
                              <h4 className="text-md font-semibold text-gray-900 font-body mb-4">
                                Policy Documentation
                              </h4>
                              <div className="space-y-4">
                                {policyDocuments.map((policy: any, index: number) => (
                                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h5 className="font-semibold text-gray-900 font-body">{policy.policy_name}</h5>
                                        <a
                                          href={policy.signed_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-[#E75837] hover:underline font-body"
                                        >
                                          View Document
                                        </a>
                                      </div>
                                      <label className="inline-flex items-center mt-3">
                                        <input
                                          type="checkbox"
                                          className="form-checkbox h-5 w-5 text-[#E75837]"
                                          checked={onboardingData.policyAcknowledgments[policy.policy_id] || false}
                                          onChange={(e) => {
                                            setOnboardingData((prev) => ({
                                              ...prev,
                                              policyAcknowledgments: {
                                                ...prev.policyAcknowledgments,
                                                [policy.policy_id]: e.target.checked,
                                              },
                                            }))
                                          }}
                                        />
                                        <span className="ml-2 text-gray-700 font-body">
                                          I acknowledge that I have read and agree to the terms.
                                        </span>
                                      </label>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-4">
                                <label htmlFor="signature" className="block text-gray-700 text-sm font-bold mb-2">
                                  Signature
                                </label>
                                <input
                                  type="text"
                                  id="signature"
                                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                  value={onboardingData.signature}
                                  onChange={(e) =>
                                    setOnboardingData((prev) => ({
                                      ...prev,
                                      signature: e.target.value,
                                    }))
                                  }
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    {onboardingStep === 1 && (
                      <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-500 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={() => setShowOnboardingModal(false)}
                      >
                        Cancel
                      </button>
                    )}
                    {onboardingStep > 1 && (
                      <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-500 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={handleOnboardingPrev}
                      >
                        Previous
                      </button>
                    )}
                    {onboardingStep < 4 && (
                      <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#E75837] text-base font-medium text-white hover:bg-[#333333] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E75837] sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={handleOnboardingNext}
                      >
                        Next
                      </button>
                    )}
                    {onboardingStep === 4 && (
                      <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#E75837] text-base font-medium text-white hover:bg-[#333333] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E75837] sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={handleOnboardingSubmit}
                        disabled={onboardingLoading}
                      >
                        {onboardingLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
