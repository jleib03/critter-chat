export interface WebhookEmployee {
  employee_id: string
  name: string
  role: string
  email?: string
  is_active: boolean
  working_days: {
    day: string
    start_time: string
    end_time: string
    is_working: boolean
  }[]
  services: string[]
}

export interface WebhookCapacityRules {
  max_concurrent_bookings: number
  buffer_time_between_bookings: number
  max_bookings_per_day: number
  allow_overlapping: boolean
  require_all_employees_for_service: boolean
}

export interface WebhookBlockedTime {
  blocked_time_id: string
  employee_id?: string
  date: string // Make sure this is always included
  start_time: string
  end_time: string
  reason: string
  is_recurring: boolean
  is_all_day?: boolean // Add this field
  recurrence_pattern?: "weekly" | "monthly"
}

export interface WebhookBookingPreferences {
  booking_system: "direct_booking" | "request_to_book" | "no_online_booking" // Changed from booking_type
  allow_direct_booking: boolean
  require_approval: boolean
  online_booking_enabled: boolean
  custom_instructions?: string
}

export interface WebhookConfigData {
  business_name: string
  booking_preferences: WebhookBookingPreferences
  employees: WebhookEmployee[]
  capacity_rules: WebhookCapacityRules
  blocked_times: WebhookBlockedTime[]
}

export interface GetConfigWebhookPayload {
  action: "get_professional_config"
  professional_id: string
  session_id: string
  timestamp: string
}

export interface SaveConfigWebhookPayload {
  action: "save_professional_config"
  professional_id: string
  session_id: string
  timestamp: string
  config_data: WebhookConfigData
}

export type WebhookPayload = GetConfigWebhookPayload | SaveConfigWebhookPayload
