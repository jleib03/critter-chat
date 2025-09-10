import { CRM_ENDPOINTS, type CRMCustomer, type CRMCampaignAudience, type CRMEmailMetrics } from "@/types/crm-endpoints"

// Base API utility for CRM webhook calls
async function callCRMWebhook<T>(endpoint: string, data?: any): Promise<T> {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data || {}),
    })

    if (!response.ok) {
      throw new Error(`CRM API Error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("[v0] CRM API call failed:", error)
    throw error
  }
}

// Customer data functions
export async function getAllCustomers(professionalId: string): Promise<CRMCustomer[]> {
  return callCRMWebhook<CRMCustomer[]>(CRM_ENDPOINTS.GET_CUSTOMERS, {
    professionalId,
  })
}

export async function getCustomerDetails(customerId: string): Promise<CRMCustomer> {
  return callCRMWebhook<CRMCustomer>(CRM_ENDPOINTS.GET_CUSTOMER_DETAILS, {
    customerId,
  })
}

export async function getCustomerBookings(customerId: string) {
  return callCRMWebhook(CRM_ENDPOINTS.GET_CUSTOMER_BOOKINGS, {
    customerId,
  })
}

// Campaign audience functions
export async function getInactiveCustomers(professionalId: string, daysSinceLastBooking = 60): Promise<CRMCustomer[]> {
  return callCRMWebhook<CRMCustomer[]>(CRM_ENDPOINTS.GET_INACTIVE_CUSTOMERS, {
    professionalId,
    daysSinceLastBooking,
  })
}

export async function getRepeatCustomers(professionalId: string, minBookings = 2): Promise<CRMCustomer[]> {
  return callCRMWebhook<CRMCustomer[]>(CRM_ENDPOINTS.GET_REPEAT_CUSTOMERS, {
    professionalId,
    minBookings,
  })
}

export async function getCustomersByPetType(professionalId: string, petTypes: string[]): Promise<CRMCustomer[]> {
  return callCRMWebhook<CRMCustomer[]>(CRM_ENDPOINTS.GET_PET_TYPE_CUSTOMERS, {
    professionalId,
    petTypes,
  })
}

// Campaign analytics functions
export async function getCampaignAudiences(professionalId: string): Promise<CRMCampaignAudience[]> {
  return callCRMWebhook<CRMCampaignAudience[]>(CRM_ENDPOINTS.GET_CAMPAIGN_AUDIENCES, {
    professionalId,
  })
}

export async function getEmailMetrics(campaignId: string): Promise<CRMEmailMetrics> {
  return callCRMWebhook<CRMEmailMetrics>(CRM_ENDPOINTS.GET_EMAIL_METRICS, {
    campaignId,
  })
}

// Custom audience builder
export async function buildCustomAudience(
  professionalId: string,
  criteria: {
    lastBookingDays?: number
    petTypes?: string[]
    bookingCountMin?: number
    bookingCountMax?: number
    totalSpentMin?: number
    totalSpentMax?: number
    tags?: string[]
  },
): Promise<CRMCustomer[]> {
  return callCRMWebhook<CRMCustomer[]>(CRM_ENDPOINTS.GET_CAMPAIGN_AUDIENCES, {
    professionalId,
    criteria,
  })
}
