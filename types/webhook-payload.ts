// Webhook payload types for professional configuration updates

export type WebhookConfigPayload = {
  action: "professional_config_updated"
  professional_id: string
  timestamp: string
  config_data: {
    professional_id: string
    business_name: string
    last_updated: string
    employees: WebhookEmployee[]
    capacity_rules: WebhookCapacityRules
    blocked_times: WebhookBlockedTime[]
  }
}

export type WebhookEmployee = {
  employee_id: string
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
  blocked_time_id: string
  employee_id?: string
  employee_name?: string
  date: string
  start_time: string
  end_time: string
  reason?: string
  is_recurring: boolean
  recurrence_pattern?: "weekly" | "monthly"
}

// Example webhook payload structure
export const EXAMPLE_WEBHOOK_PAYLOAD: WebhookConfigPayload = {
  action: "professional_config_updated",
  professional_id: "prof_123",
  timestamp: "2024-01-15T10:30:00Z",
  config_data: {
    professional_id: "prof_123",
    business_name: "Happy Paws Veterinary Clinic",
    last_updated: "2024-01-15T10:30:00Z",
    employees: [
      {
        employee_id: "emp_001",
        name: "Dr. Sarah Johnson",
        role: "Veterinarian",
        email: "sarah@happypaws.com",
        is_active: true,
        working_days: [
          { day: "Monday", start_time: "09:00", end_time: "17:00", is_working: true },
          { day: "Tuesday", start_time: "09:00", end_time: "17:00", is_working: true },
          { day: "Wednesday", start_time: "09:00", end_time: "17:00", is_working: true },
          { day: "Thursday", start_time: "09:00", end_time: "17:00", is_working: true },
          { day: "Friday", start_time: "09:00", end_time: "17:00", is_working: true },
          { day: "Saturday", start_time: "09:00", end_time: "15:00", is_working: false },
          { day: "Sunday", start_time: "09:00", end_time: "15:00", is_working: false },
        ],
        services: ["General Checkup", "Vaccinations", "Surgery"],
      },
    ],
    capacity_rules: {
      max_concurrent_bookings: 2,
      buffer_time_between_bookings: 15,
      max_bookings_per_day: 12,
      allow_overlapping: false,
      require_all_employees_for_service: false,
    },
    blocked_times: [
      {
        blocked_time_id: "block_001",
        employee_id: "emp_001",
        employee_name: "Dr. Sarah Johnson",
        date: "2024-01-20",
        start_time: "12:00",
        end_time: "13:00",
        reason: "Lunch break",
        is_recurring: true,
        recurrence_pattern: "weekly",
      },
    ],
  },
}
