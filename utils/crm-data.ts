import { getWebhookEndpoint, logWebhookUsage } from "../types/webhook-endpoints"
import type { CRMData, CRMStats } from "../types/crm-types"

// Initialize CRM data by calling the webhook
export async function initializeCRMData(professionalId: string): Promise<CRMData | null> {
  try {
    const webhookUrl = getWebhookEndpoint("CRM_INITIALIZATION")
    logWebhookUsage("CRM_INITIALIZATION", "initialize_crm")

    console.log("🚀 Initializing CRM data for professional:", professionalId)
    console.log("🔗 Using webhook URL:", webhookUrl)

    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    const payload = {
      action: "initialize_crm",
      professionalId: professionalId,
      timestamp: new Date().toISOString(),
      timezone: userTimezone,
    }

    console.log("📤 Sending payload:", JSON.stringify(payload, null, 2))

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
      body: JSON.stringify(payload),
    })

    console.log("📡 Response status:", response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ CRM initialization webhook error:", errorText)
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const rawData = await response.json()
    console.log("📥 Raw CRM response:", JSON.stringify(rawData, null, 2))

    if (Array.isArray(rawData) && rawData.length >= 4) {
      const [petCareData, bookingsData, invoicesData, onboardingData] = rawData

      const crmData: CRMData = {
        petCare: Array.isArray(petCareData) ? petCareData : [],
        bookings: Array.isArray(bookingsData) ? bookingsData : [],
        invoices: invoicesData || { invoices: [], payment_instructions: "" },
        onboarding: onboardingData || {
          email: "",
          user_type: "",
          onboarding_complete: false,
          criteria_status: {
            pets_created: false,
            policies_signed: false,
            personal_info_complete: false,
            emergency_contacts_added: false,
          },
          supporting_details: {
            pets: { count: 0, details: [] },
            policies: { details: [], total_policies: 0, signed_policies: 0 },
            personal_info: { email: "", last_name: "", first_name: "" },
            emergency_contacts: { count: 0, details: [] },
          },
        },
        lastUpdated: new Date().toISOString(),
        professionalId: professionalId,
      }

      // Store the data in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("crm_data", JSON.stringify(crmData))
        localStorage.setItem("crm_professional_id", professionalId)
      }

      console.log("✅ CRM data initialized and stored successfully")
      return crmData
    }

    console.log("⚠️ No valid CRM data found in response")
    return null
  } catch (error) {
    console.error("💥 Error initializing CRM data:", error)
    throw error
  }
}

// Get stored CRM data from localStorage
export function getCRMData(): CRMData | null {
  if (typeof window === "undefined") return null

  const rawData = localStorage.getItem("crm_data")
  return rawData ? JSON.parse(rawData) : null
}

export function calculateCRMStats(data: CRMData): CRMStats {
  const uniqueCustomers = new Set()

  // Get unique customers from bookings
  data.bookings.forEach((booking) => {
    uniqueCustomers.add(booking.customer_email)
  })

  // Get recent bookings (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentBookings = data.bookings.filter((booking) => new Date(booking.booking_date) >= thirtyDaysAgo).length

  // Get exotic pets (non-dog, non-cat)
  const exoticPets = data.petCare.filter((pet) => !["Dog", "Cat"].includes(pet.pet_type)).length

  // Get recurring clients (customers with multiple bookings)
  const customerBookingCounts = new Map()
  data.bookings.forEach((booking) => {
    const count = customerBookingCounts.get(booking.customer_email) || 0
    customerBookingCounts.set(booking.customer_email, count + 1)
  })

  const recurringClients = Array.from(customerBookingCounts.values()).filter((count) => count > 1).length

  return {
    totalCustomers: uniqueCustomers.size,
    totalPets: data.petCare.length,
    totalBookings: data.bookings.length,
    activeCustomers: uniqueCustomers.size, // All customers with bookings are considered active
    completedOnboarding: data.onboarding.onboarding_complete ? 1 : 0,
    recentBookings,
    exoticPets,
    recurringClients,
  }
}

export function getInactiveCustomers(data: CRMData, daysSince = 60): string[] {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysSince)

  const customerLastBooking = new Map()

  // Find last booking date for each customer
  data.bookings.forEach((booking) => {
    const bookingDate = new Date(booking.booking_date)
    const currentLast = customerLastBooking.get(booking.customer_email)

    if (!currentLast || bookingDate > currentLast) {
      customerLastBooking.set(booking.customer_email, bookingDate)
    }
  })

  // Return customers whose last booking was before cutoff
  return Array.from(customerLastBooking.entries())
    .filter(([email, lastDate]) => lastDate < cutoffDate)
    .map(([email]) => email)
}

export function getCustomersByPetType(data: CRMData, petType: string): string[] {
  const customerEmails = new Set<string>()

  // Find pets of specified type
  const matchingPets = data.petCare.filter((pet) => pet.pet_type.toLowerCase().includes(petType.toLowerCase()))

  // Get customer emails from pet contacts
  matchingPets.forEach((pet) => {
    pet.contacts.forEach((contact) => {
      customerEmails.add(contact.email)
    })
  })

  return Array.from(customerEmails)
}

export function getRepeatCustomers(data: CRMData): string[] {
  const customerBookingCounts = new Map()

  data.bookings.forEach((booking) => {
    const count = customerBookingCounts.get(booking.customer_email) || 0
    customerBookingCounts.set(booking.customer_email, count + 1)
  })

  return Array.from(customerBookingCounts.entries())
    .filter(([email, count]) => count >= 2)
    .map(([email]) => email)
}

// Get professional ID from localStorage
export function getCRMProfessionalId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("crm_professional_id")
}

// Clear CRM data from localStorage
export function clearCRMData(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("crm_data")
    localStorage.removeItem("crm_professional_id")
  }
}
