// Utility functions for working with CRM raw data on the frontend

import { getWebhookEndpoint, logWebhookUsage } from "../types/webhook-endpoints"

export interface CRMCustomer {
  customer_id: string
  name: string
  email: string
  phone?: string
  created_date: string
  last_booking_date?: string
  total_bookings: number
}

export interface CRMBooking {
  booking_id: string
  customer_id: string
  service_type: string
  booking_date: string
  status: string
  amount?: number
}

export interface CRMPet {
  pet_id: string
  customer_id: string
  name: string
  species: string
  breed?: string
  age?: number
}

export interface CRMRawData {
  customers: CRMCustomer[]
  bookings: CRMBooking[]
  pets: CRMPet[]
  professional_id: string
}

// Initialize CRM data by calling the webhook
export async function initializeCRMData(professionalId: string): Promise<CRMRawData | null> {
  try {
    const webhookUrl = getWebhookEndpoint("CRM_INITIALIZATION")
    logWebhookUsage("CRM_INITIALIZATION", "initialize_crm")

    console.log("🚀 Initializing CRM data for professional:", professionalId)
    console.log("🔗 Using webhook URL:", webhookUrl)

    const payload = {
      action: "initialize_crm",
      professionalId: professionalId,
      timestamp: new Date().toISOString(),
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

    const data = await response.json()
    console.log("📥 Raw CRM response:", JSON.stringify(data, null, 2))

    // Parse the response - expecting array format like other webhooks
    if (Array.isArray(data) && data.length > 0) {
      const crmData = data[0]
      console.log("🔍 Parsing CRM data from first record:", crmData)

      // Store the data in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("crm_raw_data", JSON.stringify(crmData))
        localStorage.setItem("crm_professional_id", professionalId)
      }

      console.log("✅ CRM data initialized and stored successfully")
      return crmData as CRMRawData
    }

    console.log("⚠️ No valid CRM data found in response")
    return null
  } catch (error) {
    console.error("💥 Error initializing CRM data:", error)
    throw error
  }
}

// Get stored CRM data from localStorage
export function getCRMData(): CRMRawData | null {
  if (typeof window === "undefined") return null

  const rawData = localStorage.getItem("crm_raw_data")
  return rawData ? JSON.parse(rawData) : null
}

// Get professional ID from localStorage
export function getCRMProfessionalId(): string | null {
  if (typeof window === "undefined") return null

  return localStorage.getItem("crm_professional_id")
}

// Filter customers who haven't booked in X days
export function getInactiveCustomers(data: CRMRawData, daysSince = 60): CRMCustomer[] {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysSince)

  return data.customers.filter((customer) => {
    if (!customer.last_booking_date) return true

    const lastBooking = new Date(customer.last_booking_date)
    return lastBooking < cutoffDate
  })
}

// Filter customers by pet species (exotic pets, dogs, cats, etc.)
export function getCustomersByPetSpecies(data: CRMRawData, species: string): CRMCustomer[] {
  const customerIdsWithSpecies = data.pets
    .filter((pet) => pet.species.toLowerCase().includes(species.toLowerCase()))
    .map((pet) => pet.customer_id)

  return data.customers.filter((customer) => customerIdsWithSpecies.includes(customer.customer_id))
}

// Filter customers by booking frequency (first-time, repeat, etc.)
export function getCustomersByBookingFrequency(
  data: CRMRawData,
  frequency: "first-time" | "repeat" | "frequent",
): CRMCustomer[] {
  return data.customers.filter((customer) => {
    switch (frequency) {
      case "first-time":
        return customer.total_bookings === 1
      case "repeat":
        return customer.total_bookings >= 2 && customer.total_bookings <= 5
      case "frequent":
        return customer.total_bookings > 5
      default:
        return false
    }
  })
}

// Get customers by date range
export function getCustomersByDateRange(data: CRMRawData, startDate: Date, endDate: Date): CRMCustomer[] {
  return data.customers.filter((customer) => {
    const customerDate = new Date(customer.created_date)
    return customerDate >= startDate && customerDate <= endDate
  })
}

// Get campaign audience size for preview
export function getCampaignAudienceSize(
  data: CRMRawData,
  filters: {
    inactive_days?: number
    pet_species?: string
    booking_frequency?: "first-time" | "repeat" | "frequent"
    date_range?: { start: Date; end: Date }
  },
): number {
  let customers = data.customers

  if (filters.inactive_days) {
    customers = getInactiveCustomers(data, filters.inactive_days)
  }

  if (filters.pet_species) {
    const speciesCustomers = getCustomersByPetSpecies(data, filters.pet_species)
    customers = customers.filter((c) => speciesCustomers.some((sc) => sc.customer_id === c.customer_id))
  }

  if (filters.booking_frequency) {
    const frequencyCustomers = getCustomersByBookingFrequency(data, filters.booking_frequency)
    customers = customers.filter((c) => frequencyCustomers.some((fc) => fc.customer_id === c.customer_id))
  }

  if (filters.date_range) {
    const dateCustomers = getCustomersByDateRange(data, filters.date_range.start, filters.date_range.end)
    customers = customers.filter((c) => dateCustomers.some((dc) => dc.customer_id === c.customer_id))
  }

  return customers.length
}

// Clear CRM data from localStorage
export function clearCRMData(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("crm_raw_data")
    localStorage.removeItem("crm_professional_id")
  }
}
