// Update the ConfigWebhookResponse to handle your actual response format
export interface ConfigWebhookResponse {
  success: boolean
  message?: string
  config_data?: {
    professional_id: string
    business_name?: string
    last_updated?: string
    created_at?: string
    webhook_status?: string
    employees?: WebhookEmployee[]
    capacity_rules?: WebhookCapacityRules
    blocked_times?: WebhookBlockedTime[]
  }
  // Handle direct employee data from your webhook
  employees?: WebhookEmployee[]
  // Handle other possible response formats
  [key: string]: any
}

// Add a type for the raw employee data you're receiving
export interface RawEmployeeData {
  first_name: string
  last_name: string
  email: string
}

// Add a type for the raw schedule data
export interface RawScheduleData {
  professional_id: string
  monday_start: string
  monday_end: string
  tuesday_start: string
  tuesday_end: string
  wednesday_start: string
  wednesday_end: string
  thursday_start: string
  thursday_end: string
  friday_start: string
  friday_end: string
  saturday_start: string
  saturday_end: string
  sunday_start: string
  sunday_end: string
  monday_working: string
  tuesday_working: string
  wednesday_working: string
  thursday_working: string
  friday_working: string
  saturday_working: string
  sunday_working: string
}
