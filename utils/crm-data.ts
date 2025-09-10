// Utility functions for working with CRM raw data on the frontend

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
