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
  Plus,
  Shield,
  FileText,
  ChevronDown,
  ChevronUp,
  Pill,
  Utensils,
  AlertTriangle,
  Scale,
  Cookie,
  CheckCircle,
  X,
  PlusCircle,
  MinusCircle,
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
        setError(data[0].invalid_email)
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
        const validPolicies = Object.keys(onboardingData.policyAcknowledgments)
          .filter((policyId) => policyId !== "undefined" && !isNaN(Number(policyId)))
          .map((policyId) => ({
            policy_id: Number.parseInt(policyId),
            acknowledged: onboardingData.policyAcknowledgments[policyId],
            signature: onboardingData.signature,
            acknowledged_at: new Date().toISOString(),
          }))

        if (validPolicies.length > 0) {
          submissionAnalysis.policy_acknowledgments = {
            action: "create",
            policies: validPolicies,
            database_fields: {
              table: "business_policy_acknowledgments",
              primary_key: "id",
              fields_to_update: ["policy_id", "user_id", "signed", "signed_at", "signature"],
            },
          }
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

                  // Update onboarding status to reflect changes immediately
                  setOnboardingStatus(onboardingData.criteria_status)
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#E75837] to-[#d04e30] text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/${uniqueUrl}`)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold font-title">Customer Portal</h1>
                <p className="text-white/90 font-body">Access your booking information and pet details</p>
              </div>
            </div>
            {step === "data" && customerData && (
              <Link
                href={`/schedule/${uniqueUrl}`}
                className="bg-white text-[#E75837] py-2 px-6 rounded-lg font-medium hover:bg-gray-100 transition-colors font-body flex items-center gap-2"
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
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 font-body">
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E75837] focus:border-transparent font-body"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2 font-body">
                    We'll send you a verification code to access your information
                  </p>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 font-body">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="w-full bg-[#E75837] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#d04e30] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-body flex items-center justify-center gap-2"
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
                <h2 className="text-xl font-bold text-gray-900 font-header">Check Your Email</h2>
                <p className="text-gray-600 font-body mt-2">
                  We've sent a verification code to <span className="font-medium">{email}</span>
                </p>
              </div>

              <form onSubmit={handleCodeSubmit} className="space-y-6">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2 font-body">
                    Enter verification code
                  </label>
                  <input
                    type="text"
                    id="code"
                    value={validationCode}
                    onChange={(e) => setValidationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E75837] focus:border-transparent font-body text-center text-lg tracking-widest"
                    required
                    disabled={isLoading}
                    maxLength={6}
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 font-body">{error}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={isLoading || !validationCode.trim()}
                    className="w-full bg-[#E75837] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#d04e30] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-body flex items-center justify-center gap-2"
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
                    className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors font-body"
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
                  <button
                    onClick={() => setActiveTab("onboarding")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === "onboarding"
                        ? "border-[#E75837] text-[#E75837]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Onboarding
                    </div>
                  </button>
                </nav>
              </div>

              <div className="p-8">
                {activeTab === "pets" && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 font-header flex items-center gap-3">
                      <Heart className="w-8 h-8 text-[#E75837]" />
                      Your Pets
                    </h2>
                    {customerData.pets && customerData.pets.length > 0 ? (
                      <div className="space-y-6">
                        {customerData.pets.map((pet) => (
                          <div
                            key={pet.pet_id}
                            className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                          >
                            <button
                              onClick={() => togglePetExpansion(pet.pet_id)}
                              className="w-full p-6 bg-gradient-to-br from-orange-50 to-pink-50 border-b border-orange-200 hover:from-orange-100 hover:to-pink-100 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="w-12 h-12 bg-gradient-to-br from-[#E75837] to-[#D14420] rounded-full flex items-center justify-center shadow-md border-2 border-white">
                                    <div className="text-white">{getPetIcon(pet.pet_type)}</div>
                                  </div>
                                  <div className="text-left">
                                    <h3 className="font-semibold text-gray-900 text-lg header-font">{pet.pet_name}</h3>
                                    <p className="text-gray-600 body-font text-sm">{pet.pet_type}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => togglePetExpansion(pet.pet_id)}
                                  className="text-[#E75837] hover:text-[#E75837]/80 transition-colors"
                                >
                                  {expandedPet === pet.pet_id ? (
                                    <ChevronUp className="h-5 w-5" />
                                  ) : (
                                    <ChevronDown className="h-5 w-5" />
                                  )}
                                </button>
                              </div>
                            </button>

                            {expandedPet === pet.pet_id && (
                              <div className="bg-gray-50">
                                <div className="flex">
                                  {/* Sidebar Navigation */}
                                  <div className="w-48 bg-white border-r border-gray-200 p-4">
                                    <nav className="space-y-2">
                                      <button
                                        onClick={() => setSelectedSection("general")}
                                        className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                                          selectedSection === "general"
                                            ? "bg-[#E75837] text-white"
                                            : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                      >
                                        General
                                      </button>
                                      <button
                                        onClick={() => setSelectedSection("health")}
                                        className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                                          selectedSection === "health"
                                            ? "bg-[#E75837] text-white"
                                            : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                      >
                                        Health
                                      </button>
                                      <button
                                        onClick={() => setSelectedSection("food")}
                                        className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                                          selectedSection === "food"
                                            ? "bg-[#E75837] text-white"
                                            : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                      >
                                        Food
                                      </button>
                                      <button
                                        onClick={() => setSelectedSection("vaccine-overview")}
                                        className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                                          selectedSection === "vaccine-overview"
                                            ? "bg-[#E75837] text-white"
                                            : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                      >
                                        Vaccine Overview
                                      </button>
                                      <button
                                        onClick={() => setSelectedSection("care-plan-report")}
                                        className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                                          selectedSection === "care-plan-report"
                                            ? "bg-[#E75837] text-white"
                                            : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                      >
                                        Care Plan Report
                                      </button>
                                    </nav>
                                  </div>

                                  {/* Main Content */}
                                  <div className="flex-1 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                      <h3 className="text-xl font-bold text-gray-900 font-header capitalize">
                                        {selectedSection === "care-plan-report"
                                          ? "Care Plan Report"
                                          : selectedSection === "vaccine-overview"
                                            ? "Vaccine Overview"
                                            : `${selectedSection} Information`}
                                      </h3>
                                    </div>

                                    {renderPetProfileSection(pet, selectedSection)}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-body text-xl">No pets registered</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "appointments" && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 font-header flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-[#E75837]" />
                        Your Appointments
                      </h2>
                      <div className="flex items-center gap-4">
                        <div className="flex bg-gray-100 rounded-lg p-1">
                          <button
                            onClick={() => setAppointmentView("calendar")}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                              appointmentView === "calendar"
                                ? "bg-white text-[#E75837] shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                          >
                            Calendar
                          </button>
                          <button
                            onClick={() => setAppointmentView("list")}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                              appointmentView === "list"
                                ? "bg-white text-[#E75837] shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                          >
                            List
                          </button>
                        </div>
                        {appointmentView === "calendar" && (
                          <>
                            <button
                              onClick={() =>
                                setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
                              }
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <h3 className="text-lg font-semibold font-body min-w-[200px] text-center">
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
                          </>
                        )}
                      </div>
                    </div>

                    {customerData.bookings && customerData.bookings.length > 0 ? (
                      <>
                        {appointmentView === "calendar" ? (
                          <>
                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-1 mb-4">
                              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                <div key={day} className="p-3 text-center font-semibold text-gray-600 font-body">
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
                                          <div className="font-medium truncate">
                                            {convertToUserTimezone(booking.start)}
                                          </div>
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
                                <span className="text-sm font-body">Walking</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded"></div>
                                <span className="text-sm font-body">Grooming</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                                <span className="text-sm font-body">Drop-in</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
                                <span className="text-sm font-body">Other</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          /* Added list view for appointments */
                          <div className="space-y-4 max-h-[600px] overflow-y-auto">
                            {customerData.bookings
                              .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                              .map((booking) => (
                                <div
                                  key={booking.booking_id}
                                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        <div
                                          className={`w-3 h-3 rounded-full ${
                                            booking.service_types?.toLowerCase().includes("walking")
                                              ? "bg-green-400"
                                              : booking.service_types?.toLowerCase().includes("grooming")
                                                ? "bg-purple-400"
                                                : booking.service_types?.toLowerCase().includes("drop")
                                                  ? "bg-blue-400"
                                                  : "bg-orange-400"
                                          }`}
                                        ></div>
                                        <h3 className="text-lg font-semibold text-gray-900 font-header">
                                          {booking.service_names || "Appointment"}
                                        </h3>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 font-body">
                                        <div>
                                          <span className="font-medium">Date:</span>{" "}
                                          {booking.booking_date_formatted ||
                                            new Date(booking.start).toLocaleDateString()}
                                        </div>
                                        <div>
                                          <span className="font-medium">Day:</span> {booking.day_of_week}
                                        </div>
                                        <div>
                                          <span className="font-medium">Time:</span>{" "}
                                          {convertToUserTimezone(booking.start)} - {convertToUserTimezone(booking.end)}
                                        </div>
                                        <div>
                                          <span className="font-medium">Professional:</span> {booking.professional_name}
                                        </div>
                                        {booking.service_types && (
                                          <div className="md:col-span-2">
                                            <span className="font-medium">Service Type:</span> {booking.service_types}
                                          </div>
                                        )}
                                        {booking.is_recurring && (
                                          <div className="md:col-span-2">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                              Recurring Appointment
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-body text-xl mb-2">No upcoming appointments scheduled</p>
                        <p className="text-gray-500 font-body">Contact us to book your next appointment!</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "invoices" && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 font-header flex items-center gap-3">
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
                                  <h3 className="text-lg font-bold text-gray-900 font-body">{invoice.amount}</h3>
                                  <span className="text-gray-600 font-body">Due {invoice.due_date}</span>
                                </div>
                                <p className="text-gray-600 font-body">Invoice #{invoice.invoice_number}</p>
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
                            <p className="text-blue-800 font-body text-sm">
                              <strong>Payment Instructions:</strong> {customerData.payment_instructions}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-body text-xl">No invoices found</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "onboarding" && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 font-header flex items-center gap-3">
                        <CheckCircle className="w-8 h-8 text-[#E75837]" />
                        Onboarding Status
                      </h2>
                      {isOnboardingIncomplete() && (
                        <button
                          onClick={handleCompleteOnboarding}
                          className="bg-[#E75837] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#E75837]/90 transition-colors"
                        >
                          Complete Onboarding
                        </button>
                      )}
                    </div>

                    {customerData.onboarding_complete !== undefined ? (
                      <div className="space-y-4">
                        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 font-body">Onboarding Progress</h3>
                              <p className="text-gray-600 font-body">
                                {customerData.onboarding_complete
                                  ? "You've completed the onboarding process!"
                                  : "Complete the steps below to finish onboarding."}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              {customerData.onboarding_complete ? (
                                <>
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    Complete
                                  </span>
                                  <button
                                    onClick={handleCompleteOnboarding}
                                    className="bg-[#E75837] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#E75837]/90 transition-colors"
                                  >
                                    Open Onboarding Flow
                                  </button>
                                </>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                  In Progress
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* ... existing Required Steps section ... */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                          <h3 className="text-lg font-bold text-gray-900 font-body mb-4">Required Steps</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <h4 className="text-md font-semibold text-gray-900 font-body mb-1">
                                  Complete Personal Information
                                </h4>
                                <p className="text-gray-600 font-body text-sm mb-2">
                                  Provide your basic contact details.
                                </p>
                                {customerData.criteria_status?.personal_info_complete &&
                                  customerData.supporting_details && (
                                    <div className="text-xs text-gray-500">
                                      <p>Email: {customerData.supporting_details.email}</p>
                                      <p>User Type: {customerData.supporting_details.user_type}</p>
                                    </div>
                                  )}
                              </div>
                              <div>
                                {customerData.criteria_status?.personal_info_complete ? (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    Complete
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                    Incomplete
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <h4 className="text-md font-semibold text-gray-900 font-body mb-1">Add Your Pets</h4>
                                <p className="text-gray-600 font-body text-sm mb-2">
                                  Tell us about your furry friends.
                                </p>
                                {customerData.criteria_status?.pets_created &&
                                  customerData.supporting_details?.pets && (
                                    <div className="text-xs text-gray-500">
                                      <p>
                                        Pets added:{" "}
                                        {customerData.supporting_details.pets.details
                                          ?.map((pet: any) => pet.pet_name)
                                          .join(", ")}
                                      </p>
                                    </div>
                                  )}
                              </div>
                              <div>
                                {customerData.criteria_status?.pets_created ? (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    Complete
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                    Incomplete
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <h4 className="text-md font-semibold text-gray-900 font-body mb-1">
                                  Add Emergency Contact
                                </h4>
                                <p className="text-gray-600 font-body text-sm mb-2">Provide an emergency contact.</p>
                                {customerData.criteria_status?.emergency_contacts_added &&
                                  customerData.supporting_details?.emergency_contacts && (
                                    <div className="text-xs text-gray-500">
                                      <p>
                                        Emergency contacts: {customerData.supporting_details.emergency_contacts.length}{" "}
                                        added
                                      </p>
                                    </div>
                                  )}
                              </div>
                              <div>
                                {customerData.criteria_status?.emergency_contacts_added ? (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    Complete
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                    Incomplete
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <h4 className="text-md font-semibold text-gray-900 font-body mb-1">Sign Policies</h4>
                                <p className="text-gray-600 font-body text-sm mb-2">Review and sign our policies.</p>
                                {customerData.criteria_status?.policies_signed && (
                                  <div className="text-xs text-gray-500">
                                    <p>All required policies signed</p>
                                  </div>
                                )}
                              </div>
                              <div>
                                {customerData.criteria_status?.policies_signed ? (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    Complete
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                    Incomplete
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-body text-xl">No onboarding information found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#E75837] to-[#d04e30] rounded-2xl shadow-lg p-8 text-white">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 font-header">Get More with the Critter App</h3>
                <p className="text-white/90 mb-6 font-body text-lg max-w-2xl mx-auto">
                  If you'd like to build out your care plan, pay invoices, or get timeline updates, download the Critter
                  App.
                </p>

                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-white/95 font-body text-sm leading-relaxed">
                        <span className="font-semibold">First time downloading?</span> Create your account using the
                        same email address from your onboarding. Follow the sign-up instructions and we'll automatically
                        link your account with all the information in your customer hub.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center space-x-4 flex-wrap gap-4">
                  <a
                    href="https://apps.apple.com/us/app/critter-pet-owners-pros/id1630023733"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-black text-white px-6 py-3 rounded-lg flex items-center hover:bg-gray-800 transition-colors"
                  >
                    <div className="mr-3">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M17.0754 12.3674C17.0654 10.4494 18.0434 9.0384 19.9794 8.0774C18.9154 6.5514 17.2734 5.7254 15.1904 5.6294C13.2274 5.5354 11.1044 6.8354 10.3174 6.8354C9.5004 6.8354 7.6364 5.6854 6.1454 5.6854C3.4024 5.7354 0.599365 7.7834 0.599365 11.9574C0.599365 13.3154 0.860365 14.7154 1.3824 16.1574C2.0824 18.0894 4.3584 22.2074 6.7364 22.1334C8.0514 22.1034 8.9784 21.1914 10.6604 21.1914C12.2974 21.1914 13.1544 22.1334 14.6094 22.1334C16.9994 22.0934 19.0384 18.3594 19.6984 16.4214C16.4334 14.8814 17.0754 12.4414 17.0754 12.3674ZM14.0884 3.7974C15.6854 1.9254 15.5174 0.2374 15.4734 0.0374C14.1044 0.1054 12.5074 1.0174 11.6504 2.0374C10.7034 3.1374 10.1834 4.4374 10.3174 5.6054C11.8084 5.7054 13.1784 4.8374 14.0884 3.7974Z"
                          fill="white"
                        />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-xs">Download on the</div>
                      <div className="text-xl font-semibold">App Store</div>
                    </div>
                  </a>

                  <a
                    href="https://play.google.com/store/apps/details?id=com.critterclient&pli=1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-black text-white px-6 py-3 rounded-lg flex items-center hover:bg-gray-800 transition-colors"
                  >
                    <div className="mr-3">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M3.60938 2.60156C3.22656 3.01562 3 3.64844 3 4.46875V19.5312C3 20.3516 3.22656 20.9844 3.60938 21.3984L3.72656 21.5156L13.3594 11.8828V11.5L3.72656 1.48438L3.60938 2.60156Z"
                          fill="#00F076"
                        />
                        <path
                          d="M17.0625 15.5859L13.3594 11.8828V11.5L17.0625 7.79688L17.2031 7.88281L21.6094 10.4062C22.7969 11.0625 22.7969 12.0234 21.6094 12.6797L17.2031 15.5L17.0625 15.5859Z"
                          fill="#FFCF47"
                        />
                        <path
                          d="M17.2031 15.5L13.3594 11.6562L3.60938 21.3984C4.03125 21.8438 4.73438 21.8906 5.53125 21.4453L17.2031 15.5Z"
                          fill="#FF554A"
                        />
                        <path
                          d="M17.2031 7.88281L5.53125 1.9375C4.73438 1.49219 4.03125 1.53906 3.60938 1.98438L13.3594 11.6562L17.2031 7.88281Z"
                          fill="#00AAF0"
                        />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-xs">GET IT ON</div>
                      <div className="text-xl font-semibold">Google Play</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Back button */}
            <div className="text-center">
              <button
                onClick={resetForm}
                className="bg-gray-100 text-gray-700 py-3 px-8 rounded-lg font-medium hover:bg-gray-200 transition-colors font-body"
              >
                Look up different email
              </button>
            </div>
          </div>
        )}

        {showOnboardingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Complete Onboarding</h2>
                  <button onClick={() => setShowOnboardingModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {onboardingLoading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E75837]"></div>
                    <span className="ml-3 text-gray-600">Loading your information...</span>
                  </div>
                )}

                {!onboardingLoading && (
                  <>
                    {/* Progress indicator */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Step {onboardingStep} of 4</span>
                        <span className="text-sm font-medium text-gray-600">
                          {Math.round((onboardingStep / 4) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#E75837] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(onboardingStep / 4) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Step 1: Personal Information */}
                    {onboardingStep === 1 && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                              <input
                                type="text"
                                value={onboardingData.personalInfo.firstName}
                                onChange={(e) =>
                                  setOnboardingData({
                                    ...onboardingData,
                                    personalInfo: { ...onboardingData.personalInfo, firstName: e.target.value },
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E75837] focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                              <input
                                type="text"
                                value={onboardingData.personalInfo.lastName}
                                onChange={(e) =>
                                  setOnboardingData({
                                    ...onboardingData,
                                    personalInfo: { ...onboardingData.personalInfo, lastName: e.target.value },
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E75837] focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                              <input
                                type="email"
                                value={onboardingData.personalInfo.email}
                                onChange={(e) =>
                                  setOnboardingData({
                                    ...onboardingData,
                                    personalInfo: { ...onboardingData.personalInfo, email: e.target.value },
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E75837] focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                              <input
                                type="tel"
                                value={onboardingData.personalInfo.phone}
                                onChange={(e) =>
                                  setOnboardingData({
                                    ...onboardingData,
                                    personalInfo: { ...onboardingData.personalInfo, phone: e.target.value },
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E75837] focus:border-transparent"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Pet Management */}
                    {onboardingStep === 2 && (
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Pet Information</h3>
                            <button
                              onClick={() => {
                                const newPet = {
                                  name: "",
                                  pet_type: "",
                                  breed_name: "",
                                  birthdate: "",
                                  sex: "",
                                  spayed_neutered: "",
                                  weight: "",
                                  chip_id: "",
                                  gotcha_date: "",
                                }
                                setOnboardingData({
                                  ...onboardingData,
                                  pets: [newPet, ...onboardingData.pets],
                                })
                              }}
                              className="flex items-center px-4 py-2 bg-[#E75837] text-white text-sm rounded-lg hover:bg-[#E75837]/90 transition-colors"
                            >
                              <PlusCircle className="w-4 h-4 mr-1" />
                              Add New Pet
                            </button>
                          </div>
                          <p className="text-gray-600 mb-6">
                            Review and manage your pets. This information helps us provide better care.
                          </p>
                          {onboardingData.pets.length > 0 ? (
                            <div className="space-y-6">
                              {onboardingData.pets.map((pet: any, index: number) => (
                                <div key={index} className="p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
                                  {pet.isExisting ? (
                                    // Read-only display for existing pets
                                    <div>
                                      <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-medium text-gray-900">{pet.name}</h4>
                                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                                          Existing Pet
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                          <span className="font-medium text-gray-700">Type:</span>
                                          <p className="text-gray-600">{pet.pet_type || "Not specified"}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Breed:</span>
                                          <p className="text-gray-600">{pet.breed_name || "Not specified"}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Sex:</span>
                                          <p className="text-gray-600">{pet.sex || "Not specified"}</p>
                                        </div>
                                        {pet.weight && (
                                          <div>
                                            <span className="font-medium text-gray-700">Weight:</span>
                                            <p className="text-gray-600">{pet.weight}</p>
                                          </div>
                                        )}
                                        {pet.birthdate && (
                                          <div>
                                            <span className="font-medium text-gray-700">Birth Date:</span>
                                            <p className="text-gray-600">
                                              {new Date(pet.birthdate).toLocaleDateString()}
                                            </p>
                                          </div>
                                        )}
                                        {pet.chip_id && (
                                          <div>
                                            <span className="font-medium text-gray-700">Chip ID:</span>
                                            <p className="text-gray-600">{pet.chip_id}</p>
                                          </div>
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-500 mt-3 italic">
                                        This pet already exists in your account. You can edit pet details in the main
                                        Pets section.
                                      </p>
                                    </div>
                                  ) : (
                                    // Editable form for new pets
                                    <div>
                                      <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-lg font-medium text-gray-900">New Pet #{index + 1}</h4>
                                        <button
                                          onClick={() => {
                                            const updatedPets = onboardingData.pets.filter(
                                              (_: any, i: number) => i !== index,
                                            )
                                            setOnboardingData({ ...onboardingData, pets: updatedPets })
                                          }}
                                          className="text-red-500 hover:text-red-700 flex items-center text-sm"
                                        >
                                          <MinusCircle className="w-4 h-4 mr-1" />
                                          Remove
                                        </button>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Pet Name*
                                          </label>
                                          <input
                                            type="text"
                                            value={pet.name || ""}
                                            onChange={(e) => {
                                              const updatedPets = [...onboardingData.pets]
                                              updatedPets[index] = { ...updatedPets[index], name: e.target.value }
                                              setOnboardingData({ ...onboardingData, pets: updatedPets })
                                            }}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] focus:border-transparent"
                                            placeholder="Pet's name"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Pet Type*
                                          </label>
                                          <select
                                            value={pet.pet_type || ""}
                                            onChange={(e) => {
                                              const updatedPets = [...onboardingData.pets]
                                              updatedPets[index] = {
                                                ...updatedPets[index],
                                                pet_type: e.target.value,
                                                breed_name: "", // Reset breed when type changes
                                              }
                                              setOnboardingData({ ...onboardingData, pets: updatedPets })
                                            }}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] focus:border-transparent"
                                          >
                                            <option value="">Select type</option>
                                            {getPetTypes().map((type: any) => (
                                              <option key={type.value} value={type.label}>
                                                {type.label}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                      </div>

                                      <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Breed/Variety*
                                        </label>
                                        <select
                                          value={pet.breed_name || ""}
                                          onChange={(e) => {
                                            const updatedPets = [...onboardingData.pets]
                                            updatedPets[index] = { ...updatedPets[index], breed_name: e.target.value }
                                            setOnboardingData({ ...onboardingData, pets: updatedPets })
                                          }}
                                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] focus:border-transparent"
                                          disabled={!pet.pet_type}
                                        >
                                          <option value="">Select breed</option>
                                          {pet.pet_type &&
                                            getBreedsByType(pet.pet_type).map((breed: any) => (
                                              <option key={breed.value} value={breed.label}>
                                                {breed.label}
                                              </option>
                                            ))}
                                        </select>
                                        {!pet.pet_type && (
                                          <p className="text-sm text-gray-500 mt-1">Please select a pet type first</p>
                                        )}
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Sex*</label>
                                          <select
                                            value={pet.sex || ""}
                                            onChange={(e) => {
                                              const updatedPets = [...onboardingData.pets]
                                              updatedPets[index] = { ...updatedPets[index], sex: e.target.value }
                                              setOnboardingData({ ...onboardingData, pets: updatedPets })
                                            }}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] focus:border-transparent"
                                            required
                                          >
                                            <option value="">Select sex</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Weight*
                                          </label>
                                          <input
                                            type="text"
                                            value={pet.weight || ""}
                                            onChange={(e) => {
                                              const updatedPets = [...onboardingData.pets]
                                              updatedPets[index] = { ...updatedPets[index], weight: e.target.value }
                                              setOnboardingData({ ...onboardingData, pets: updatedPets })
                                            }}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] focus:border-transparent"
                                            placeholder="e.g., 25 lbs"
                                            required
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Spayed/Neutered*
                                          </label>
                                          <select
                                            value={pet.spayed_neutered || ""}
                                            onChange={(e) => {
                                              const updatedPets = [...onboardingData.pets]
                                              updatedPets[index] = {
                                                ...updatedPets[index],
                                                spayed_neutered: e.target.value,
                                              }
                                              setOnboardingData({ ...onboardingData, pets: updatedPets })
                                            }}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] focus:border-transparent"
                                            required
                                          >
                                            <option value="">Select status</option>
                                            <option value="Yes">Yes</option>
                                            <option value="No">No</option>
                                            <option value="N/A">N/A</option>
                                          </select>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Birth Date
                                          </label>
                                          <div className="grid grid-cols-3 gap-2">
                                            <select
                                              value={pet.birthMonth || ""}
                                              onChange={(e) => {
                                                const updatedPets = [...onboardingData.pets]
                                                updatedPets[index] = {
                                                  ...updatedPets[index],
                                                  birthMonth: e.target.value,
                                                }
                                                setOnboardingData({ ...onboardingData, pets: updatedPets })
                                              }}
                                              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] focus:border-transparent text-sm"
                                            >
                                              <option value="">Month</option>
                                              {Array.from({ length: 12 }, (_, i) => (
                                                <option key={i + 1} value={i + 1}>
                                                  {new Date(0, i).toLocaleString("default", { month: "short" })}
                                                </option>
                                              ))}
                                            </select>
                                            <select
                                              value={pet.birthDay || ""}
                                              onChange={(e) => {
                                                const updatedPets = [...onboardingData.pets]
                                                updatedPets[index] = { ...updatedPets[index], birthDay: e.target.value }
                                                setOnboardingData({ ...onboardingData, pets: updatedPets })
                                              }}
                                              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] focus:border-transparent text-sm"
                                            >
                                              <option value="">Day</option>
                                              {Array.from({ length: 31 }, (_, i) => (
                                                <option key={i + 1} value={i + 1}>
                                                  {i + 1}
                                                </option>
                                              ))}
                                            </select>
                                            <select
                                              value={pet.birthYear || ""}
                                              onChange={(e) => {
                                                const updatedPets = [...onboardingData.pets]
                                                updatedPets[index] = {
                                                  ...updatedPets[index],
                                                  birthYear: e.target.value,
                                                }
                                                setOnboardingData({ ...onboardingData, pets: updatedPets })
                                              }}
                                              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] focus:border-transparent text-sm"
                                            >
                                              <option value="">Year</option>
                                              {Array.from({ length: 30 }, (_, i) => {
                                                const year = new Date().getFullYear() - i
                                                return (
                                                  <option key={year} value={year}>
                                                    {year}
                                                  </option>
                                                )
                                              })}
                                            </select>
                                          </div>
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Important Notes
                                          </label>
                                          <textarea
                                            value={pet.notes || ""}
                                            onChange={(e) => {
                                              const updatedPets = [...onboardingData.pets]
                                              updatedPets[index] = { ...updatedPets[index], notes: e.target.value }
                                              setOnboardingData({ ...onboardingData, pets: updatedPets })
                                            }}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] focus:border-transparent"
                                            placeholder="Any important information your pet professional should know"
                                            rows={3}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <p>No pets added yet. Click "Add New Pet" to get started.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Step 3: Emergency Contact */}
                    {onboardingStep === 3 && (
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Emergency Contact Information</h3>
                            <span className="text-sm text-gray-500">Step 3 of 4</span>
                          </div>
                          <p className="text-gray-600 mb-6">
                            Please provide information for an emergency contact. This will help us in case of unforeseen
                            circumstances.
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name*</label>
                              <input
                                type="text"
                                value={onboardingData.emergencyContact.contactName}
                                onChange={(e) =>
                                  setOnboardingData({
                                    ...onboardingData,
                                    emergencyContact: {
                                      ...onboardingData.emergencyContact,
                                      contactName: e.target.value,
                                    },
                                  })
                                }
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] focus:border-transparent"
                                placeholder="Contact's name"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                              <input
                                type="text"
                                value={onboardingData.emergencyContact.businessName}
                                onChange={(e) =>
                                  setOnboardingData({
                                    ...onboardingData,
                                    emergencyContact: {
                                      ...onboardingData.emergencyContact,
                                      businessName: e.target.value,
                                    },
                                  })
                                }
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] focus:border-transparent"
                                placeholder="Business or organization"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                              <input
                                type="text"
                                value={onboardingData.emergencyContact.address}
                                onChange={(e) =>
                                  setOnboardingData({
                                    ...onboardingData,
                                    emergencyContact: {
                                      ...onboardingData.emergencyContact,
                                      address: e.target.value,
                                    },
                                  })
                                }
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] focus:border-transparent"
                                placeholder="Street address, city, state, zip"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number*</label>
                              <input
                                type="tel"
                                value={onboardingData.emergencyContact.phoneNumber}
                                onChange={(e) =>
                                  setOnboardingData({
                                    ...onboardingData,
                                    emergencyContact: {
                                      ...onboardingData.emergencyContact,
                                      phoneNumber: e.target.value,
                                    },
                                  })
                                }
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] focus:border-transparent"
                                placeholder="Phone number"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                              <input
                                type="email"
                                value={onboardingData.emergencyContact.email}
                                onChange={(e) =>
                                  setOnboardingData({
                                    ...onboardingData,
                                    emergencyContact: {
                                      ...onboardingData.emergencyContact,
                                      email: e.target.value,
                                    },
                                  })
                                }
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] focus:border-transparent"
                                placeholder="Email address"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                              <textarea
                                value={onboardingData.emergencyContact.notes}
                                onChange={(e) =>
                                  setOnboardingData({
                                    ...onboardingData,
                                    emergencyContact: {
                                      ...onboardingData.emergencyContact,
                                      notes: e.target.value,
                                    },
                                  })
                                }
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] focus:border-transparent"
                                placeholder="Any important information"
                                rows={3}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Policy Documentation */}
                    {onboardingStep === 4 && (
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Policy Documentation</h3>
                            <span className="text-sm text-gray-500">Step 4 of 4</span>
                          </div>
                          <p className="text-gray-600 mb-6">
                            Please review and acknowledge the following policies to complete your onboarding process.
                          </p>

                          {policyDocuments.length > 0 ? (
                            <div className="space-y-4">
                              {policyDocuments.map((policy: any) => (
                                <div key={policy.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <h4 className="text-md font-medium text-gray-900">{policy.name}</h4>
                                      <p className="text-gray-500 text-sm">Please review this document</p>
                                    </div>
                                    <a
                                      href={policy.signed_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#E75837] hover:text-[#E75837]/80 transition-colors"
                                    >
                                      View Document
                                    </a>
                                  </div>
                                  <label className="flex items-center mt-3">
                                    <input
                                      type="checkbox"
                                      className="form-checkbox h-5 w-5 text-[#E75837] rounded border-gray-300 focus:ring-2 focus:ring-[#E75837]"
                                      checked={onboardingData.policyAcknowledgments[policy.id] || false}
                                      onChange={(e) => {
                                        setOnboardingData({
                                          ...onboardingData,
                                          policyAcknowledgments: {
                                            ...onboardingData.policyAcknowledgments,
                                            [policy.id]: e.target.checked,
                                          },
                                        })
                                      }}
                                    />
                                    <span className="ml-2 text-gray-700 text-sm">
                                      I acknowledge that I have read and understood this policy.
                                    </span>
                                  </label>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <p>No policy documents found.</p>
                            </div>
                          )}

                          <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Signature*</label>
                            <input
                              type="text"
                              value={onboardingData.signature}
                              onChange={(e) => setOnboardingData({ ...onboardingData, signature: e.target.value })}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E75837] focus:border-transparent"
                              placeholder="Type your full name to sign"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8">
                      <button
                        onClick={handleOnboardingPrev}
                        disabled={onboardingStep === 1}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {onboardingStep < 4 ? (
                        <button
                          onClick={handleOnboardingNext}
                          className="bg-[#E75837] text-white px-6 py-2 rounded-lg hover:bg-[#E75837]/90 transition-colors"
                        >
                          Next
                        </button>
                      ) : (
                        <button
                          onClick={handleOnboardingSubmit}
                          disabled={onboardingLoading}
                          className="bg-[#E75837] text-white px-6 py-2 rounded-lg hover:bg-[#E75837]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {onboardingLoading ? "Submitting..." : "Submit"}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
