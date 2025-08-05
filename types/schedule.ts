export type SelectedTimeSlot = {
  date: string
  startTime: string
  endTime: string
  dayOfWeek: string
  availableSlots?: number
  totalCapacity?: number
  availableEmployees?: number
  employeeNames?: string
  existingBookingsCount?: number
}

export type WorkingDay = {
  day: string
  start: string
  end: string
  isWorking: boolean
}

export type BookingData = {
  booking_id?: string | null
  start?: string | null
  end?: string | null
  start_local?: string | null
  start_formatted?: string
  end_local?: string | null
  end_formatted?: string | null
  timezone_used?: string
  timezone_offset_hours?: string | null
  timezone_offset_minutes?: string | null
  is_recurring?: boolean | null
  occurrence_type?: string | null
  professional_id?: string
  customer_id?: string | null
  assignee_id?: string | null
  customer_first_name?: string | null
  customer_last_name?: string | null
  customer_email?: string | null
  professional_name?: string
  booking_date?: string
  booking_date_local?: string
  booking_date_formatted?: string
  day_of_week?: string
  month_year?: string
  week_number?: string
  month_number?: string
  quarter?: string
}

export type Service = {
  service_id: string
  name: string
  description: string
  duration_unit: string
  duration_number: number
  customer_cost: string
  customer_cost_currency: string
}

export type CustomerInfo = {
  firstName: string
  lastName: string
  email: string
}

export type Pet = {
  pet_id: string
  pet_name: string
  pet_type: string
  breed: string
  age: string
  weight: string
  special_notes: string
}

export type PetResponse = {
  pets: Pet[]
}

export type WebhookResponse = {
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
  // Booking data entries
  booking_id?: string | null
  start?: string | null
  end?: string | null
  start_local?: string | null
  start_formatted?: string
  end_local?: string | null
  end_formatted?: string | null
  timezone_used?: string
  timezone_offset_hours?: string | null
  timezone_offset_minutes?: string | null
  is_recurring?: boolean | null
  occurrence_type?: string | null
  customer_id?: string | null
  assignee_id?: string | null
  customer_first_name?: string | null
  customer_last_name?: string | null
  customer_email?: string | null
  professional_name?: string
  booking_date?: string
  booking_date_local?: string
  booking_date_formatted?: string
  day_of_week?: string
  month_year?: string
  week_number?: string
  month_number?: string
  quarter?: string
  // Service data
  service_id?: string
  name?: string
  description?: string
  duration_unit?: string
  duration_number?: number
  customer_cost?: string
  customer_cost_currency?: string
  // Webhook response with config
  webhook_response?: {
    success: boolean
    config_data: {
      employees: Array<{
        name: string
        role: string
        email: string
        services: string[]
        is_active: boolean
        employee_id: string
        working_days: Array<{
          day: string
          end_time: string
          is_working: boolean
          start_time: string
        }>
      }>
      created_at: string
      last_updated: string
      blocked_times: any[]
      business_name: string
      capacity_rules: {
        allow_overlapping: boolean
        max_bookings_per_day: number
        max_concurrent_bookings: number
        buffer_time_between_bookings: number
        require_all_employees_for_service: boolean
      }
      webhook_status: string
      professional_id: string
    }
  }
  // Add these fields to the WebhookResponse type
  business_name?: string
  booking_type?: "direct_booking" | "request_to_book" | "no_online_booking"
  allow_direct_booking?: boolean
  require_approval?: boolean
  online_booking_enabled?: boolean
  updated_at?: string
}

export type ParsedWebhookData = {
  professional_info: {
    professional_id: string
    professional_name: string
  }
  schedule: {
    working_days: WorkingDay[]
  }
  bookings: {
    all_booking_data: BookingData[]
  }
  services: {
    services_by_category: {
      [category: string]: Service[]
    }
  }
  config?: {
    employees: Array<{
      name: string
      role: string
      email: string
      services: string[]
      is_active: boolean
      employee_id: string
      working_days: Array<{
        day: string
        end_time: string
        is_working: boolean
        start_time: string
      }>
    }>
    capacity_rules: {
      allow_overlapping: boolean
      max_bookings_per_day: number
      max_concurrent_bookings: number
      buffer_time_between_bookings: number
      require_all_employees_for_service: boolean
    }
    blocked_times: any[]
    business_name: string
  }
  booking_preferences: {
    business_name?: string
    booking_system?: string
    allow_direct_booking?: boolean
    require_approval?: boolean
    online_booking_enabled?: boolean
  } | null
  show_prices: boolean
}

export type RecurringConfig = {
  frequency: number
  unit: "day" | "week" | "month"
  endDate: string
  totalAppointments: number
  // Add these fields to preserve original user selections
  daysOfWeek?: string[]
  selectedDays?: string[]
  originalEndDate?: string
}

export type SelectedServices = Service[]

export type TotalBookingInfo = {
  totalDuration: number
  totalCost: number
}

export type ServiceSelection = {
  [key: string]: boolean
}

export type BookingSummary = {
  totalDuration: number
  totalCost: number
  serviceNames: string[]
}

export type MultiServiceBooking = {
  booking_id?: string | null
  start?: string | null
  end?: string | null
  start_local?: string | null
  start_formatted?: string
  end_local?: string | null
  end_formatted?: string | null
  timezone_used?: string
  timezone_offset_hours?: string | null
  timezone_offset_minutes?: string | null
  is_recurring?: boolean | null
  occurrence_type?: string | null
  professional_id?: string
  customer_id?: string | null
  assignee_id?: string | null
  customer_first_name?: string | null
  customer_last_name?: string | null
  customer_email?: string | null
  professional_name?: string
  booking_date?: string
  booking_date_local?: string
  booking_date_formatted?: string
  day_of_week?: string
  month_year?: string
  week_number?: string
  month_number?: string
  quarter?: string
  services?: Service[]
}
