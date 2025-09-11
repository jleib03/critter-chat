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

    let rawData
    try {
      const responseText = await response.text()
      console.log("📄 Raw response text:", responseText.substring(0, 200) + "...")

      if (!responseText.trim()) {
        console.log("⚠️ Empty response from webhook")
        return null
      }

      rawData = JSON.parse(responseText)
      console.log("📥 Raw CRM response:", JSON.stringify(rawData, null, 2))
    } catch (jsonError) {
      console.error("💥 JSON parsing error:", jsonError)
      console.log("⚠️ Using fallback empty data structure")
      return createEmptyDataStructure(professionalId)
    }

    if (Array.isArray(rawData) && rawData.length > 0) {
      // Separate different data types from the mixed array
      const petCareData: any[] = []
      const bookingsData: any[] = []
      let invoicesData: any = { invoices: [], payment_instructions: "" }
      let onboardingData: any = {
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
      }

      // Parse the mixed array
      rawData.forEach((item: any) => {
        if (item && typeof item === "object") {
          // Check if it's a pet care plan (has pet-specific fields)
          if (item.name && item.pet_type && (item.contacts || item.foods !== undefined)) {
            petCareData.push(item)
          }
          // Check if it's a booking (has booking-specific fields)
          else if (item.booking_id && item.customer_email && item.booking_date) {
            bookingsData.push(item)
          }
          // Check if it's invoice data (has invoices array)
          else if (item.invoices !== undefined && item.payment_instructions !== undefined) {
            invoicesData = item
          }
          // Check if it's onboarding data (has onboarding_complete field)
          else if (item.onboarding_complete !== undefined && item.criteria_status) {
            onboardingData = item
          }
        }
      })

      console.log("📊 Parsed data counts:", {
        petCare: petCareData.length,
        bookings: bookingsData.length,
        invoices: Array.isArray(invoicesData.invoices) ? invoicesData.invoices.length : 0,
        onboarding: onboardingData.email ? 1 : 0,
      })

      const crmData: CRMData = {
        petCare: petCareData,
        bookings: bookingsData,
        invoices: invoicesData,
        onboarding: onboardingData,
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
    return createEmptyDataStructure(professionalId)
  } catch (error) {
    console.error("💥 Error initializing CRM data:", error)
    console.log("[v0] CRM initialization error:", error.message)
    return createEmptyDataStructure(professionalId)
  }
}

function createEmptyDataStructure(professionalId: string): CRMData {
  const emptyData: CRMData = {
    petCare: [],
    bookings: [],
    invoices: { invoices: [], payment_instructions: "" },
    onboarding: {
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

  // Store the empty data structure
  if (typeof window !== "undefined") {
    localStorage.setItem("crm_data", JSON.stringify(emptyData))
    localStorage.setItem("crm_professional_id", professionalId)
  }

  return emptyData
}

export function getCRMData(): CRMData | null {
  if (typeof window === "undefined") return null

  try {
    // Check all localStorage keys for debugging
    const allKeys = Object.keys(localStorage)
    console.log("[v0] getCRMData: All localStorage keys:", allKeys)

    const rawData = localStorage.getItem("crm_data")
    console.log("[v0] getCRMData: Raw localStorage data exists:", !!rawData)
    console.log("[v0] getCRMData: Raw data length:", rawData?.length || 0)

    if (!rawData) {
      console.log("[v0] getCRMData: No data found in localStorage")
      // Check if there's a professional ID but no data
      const professionalId = localStorage.getItem("crm_professional_id")
      if (professionalId) {
        console.log("[v0] getCRMData: Found professional ID but no data, this indicates a storage issue")
      }
      return null
    }

    const parsedData = JSON.parse(rawData)
    console.log("[v0] getCRMData: Successfully parsed data:", !!parsedData)
    console.log("[v0] getCRMData: Data structure:", {
      petCare: parsedData?.petCare?.length || 0,
      bookings: parsedData?.bookings?.length || 0,
      professionalId: parsedData?.professionalId,
      lastUpdated: parsedData?.lastUpdated,
    })

    return parsedData
  } catch (error) {
    console.error("[v0] getCRMData: Error parsing stored data:", error)
    return null
  }
}

export async function waitForCRMData(maxAttempts = 10, delayMs = 500): Promise<CRMData | null> {
  console.log(`[v0] waitForCRMData: Starting with ${maxAttempts} attempts, ${delayMs}ms delay`)

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`[v0] waitForCRMData: Attempt ${attempt}/${maxAttempts}`)

    const data = getCRMData()
    if (data) {
      console.log("[v0] waitForCRMData: Data found on attempt", attempt)
      return data
    }

    // Check if we should try to reinitialize
    if (attempt === Math.floor(maxAttempts / 2)) {
      const professionalId = getCRMProfessionalId()
      if (professionalId) {
        console.log("[v0] waitForCRMData: Halfway through attempts, checking if we should reinitialize")
        // Don't reinitialize automatically, just log the situation
        console.log("[v0] waitForCRMData: Professional ID exists but no data - possible storage issue")
      }
    }

    if (attempt < maxAttempts) {
      console.log(`[v0] waitForCRMData: Waiting ${delayMs}ms before retry`)
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }

  console.log("[v0] waitForCRMData: No data found after", maxAttempts, "attempts")
  return null
}

export function isCRMDataAvailable(): boolean {
  if (typeof window === "undefined") return false

  const rawData = localStorage.getItem("crm_data")
  const professionalId = localStorage.getItem("crm_professional_id")

  console.log("[v0] isCRMDataAvailable: Data exists:", !!rawData, "Professional ID exists:", !!professionalId)

  if (!rawData || !professionalId) {
    return false
  }

  try {
    const parsedData = JSON.parse(rawData)
    const isValid =
      parsedData &&
      parsedData.professionalId === professionalId &&
      Array.isArray(parsedData.petCare) &&
      Array.isArray(parsedData.bookings)

    console.log("[v0] isCRMDataAvailable: Data is valid:", isValid)
    return isValid
  } catch (error) {
    console.error("[v0] isCRMDataAvailable: Error parsing data:", error)
    return false
  }
}

// Get stored CRM data from localStorage
// export function getCRMData(): CRMData | null {
//   if (typeof window === "undefined") return null

//   try {
//     const rawData = localStorage.getItem("crm_data")
//     console.log("[v0] getCRMData: Raw localStorage data exists:", !!rawData)

//     if (!rawData) {
//       console.log("[v0] getCRMData: No data found in localStorage")
//       return null
//     }

//     const parsedData = JSON.parse(rawData)
//     console.log("[v0] getCRMData: Successfully parsed data:", !!parsedData)
//     console.log("[v0] getCRMData: Data structure:", {
//       petCare: parsedData?.petCare?.length || 0,
//       bookings: parsedData?.bookings?.length || 0,
//       professionalId: parsedData?.professionalId,
//     })

//     return parsedData
//   } catch (error) {
//     console.error("[v0] getCRMData: Error parsing stored data:", error)
//     return null
//   }
// }

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
