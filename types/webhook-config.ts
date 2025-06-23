// Webhook payload types for professional configuration

export type GetConfigWebhookPayload = {
  action: "get_professional_config"
  professional_id: string
  session_id: string
  timestamp: string
  user_timezone?: any
}

export type SaveConfigWebhookPayload = {
  action: "save_professional_config"
  professional_id: string
  session_id: string
  timestamp: string
  user_timezone?: any
  config_data: {
    business_name: string
    employees: WebhookEmployee[]
    capacity_rules: WebhookCapacityRules
    blocked_times: WebhookBlockedTime[]
  }
}

export type GetScheduleConfigWebhookPayload = {
  action: "get_schedule_config"
  professional_id: string
  session_id: string
  timestamp: string
  user_timezone?: any
}

export type WebhookEmployee = {
  employee_id?: string // Optional for new employees
  name: string
  role: string
  email?: string
  is_active: boolean
  working_days: WebhookWorkingDay[]
  services: string[]
}

export type WebhookWorkingDay = {
  day: string
  start_time: string
  end_time: string
  is_working: boolean
}

export type WebhookCapacityRules = {
  max_concurrent_bookings: number
  buffer_time_between_bookings: number
  max_bookings_per_day: number
  allow_overlapping: boolean
  require_all_employees_for_service: boolean
}

export type WebhookBlockedTime = {
  blocked_time_id?: string // Optional for new blocked times
  employee_id?: string
  date: string
  start_time: string
  end_time: string
  reason?: string
  is_recurring: boolean
  recurrence_pattern?: "weekly" | "monthly"
}

// Response types
export type ConfigWebhookResponse = {
  success: boolean
  message?: string
  config_data?: {
    professional_id: string
    business_name: string
    last_updated: string
    employees: WebhookEmployee[]
    capacity_rules: WebhookCapacityRules
    blocked_times: WebhookBlockedTime[]
  }
}

export type SaveConfigWebhookResponse = {
  success: boolean
  message: string
  config_id?: string
  errors?: string[]
}

// Enhanced schedule response to include config
export type ScheduleWithConfigResponse = {
  // Existing schedule data
  professional_info: any
  services: any
  schedule: any
  bookings: any

  // New professional config data
  professional_config?: {
    business_name: string
    employees: WebhookEmployee[]
    capacity_rules: WebhookCapacityRules
    blocked_times: WebhookBlockedTime[]
    last_updated: string
  }
}
