// CRM-specific webhook endpoints for data consumption
export const CRM_ENDPOINTS = {
  // Customer data endpoints
  GET_CUSTOMERS: "https://jleib03.app.n8n.cloud/webhook/crm-customers",
  GET_CUSTOMER_DETAILS: "https://jleib03.app.n8n.cloud/webhook/crm-customer-details",
  GET_CUSTOMER_BOOKINGS: "https://jleib03.app.n8n.cloud/webhook/crm-customer-bookings",

  // Campaign data endpoints
  GET_CAMPAIGN_AUDIENCES: "https://jleib03.app.n8n.cloud/webhook/crm-campaign-audiences",
  GET_INACTIVE_CUSTOMERS: "https://jleib03.app.n8n.cloud/webhook/crm-inactive-customers",
  GET_REPEAT_CUSTOMERS: "https://jleib03.app.n8n.cloud/webhook/crm-repeat-customers",
  GET_PET_TYPE_CUSTOMERS: "https://jleib03.app.n8n.cloud/webhook/crm-pet-type-customers",

  // Analytics endpoints
  GET_CAMPAIGN_STATS: "https://jleib03.app.n8n.cloud/webhook/crm-campaign-stats",
  GET_EMAIL_METRICS: "https://jleib03.app.n8n.cloud/webhook/crm-email-metrics",
} as const

// Data types for CRM API responses
export interface CRMCustomer {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  lastBookingDate?: string
  totalBookings: number
  totalSpent: number
  pets: CRMPet[]
  tags: string[]
  createdAt: string
}

export interface CRMPet {
  id: string
  name: string
  type: string
  breed?: string
  age?: number
  specialNeeds?: string[]
}

export interface CRMCampaignAudience {
  id: string
  name: string
  description: string
  customerCount: number
  criteria: {
    lastBookingDays?: number
    petTypes?: string[]
    bookingCount?: { min?: number; max?: number }
    totalSpent?: { min?: number; max?: number }
    tags?: string[]
  }
}

export interface CRMEmailMetrics {
  campaignId: string
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  unsubscribed: number
  openRate: number
  clickRate: number
  deliveryRate: number
}
