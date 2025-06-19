export type WorkingDay = {
  day: string
  start: string
  end: string
}

export type BookingData = {
  booking_id: string | null
  start: string | null
  end: string | null
  start_local: string | null
  start_formatted: string
  end_local: string | null
  end_formatted: string | null
  timezone_used: string
  is_recurring: boolean | null
  occurrence_type: string | null
  professional_id: string
  customer_id: string | null
  customer_first_name: string | null
  customer_last_name: string | null
  customer_email: string | null
  professional_name: string
  booking_date: string
  booking_date_formatted: string
  day_of_week: string
  week_number: string
}

export type Service = {
  name: string
  description: string
  duration_unit: string
  duration_number: number
  customer_cost: string
  customer_cost_currency: string
}

export type ServicesByCategory = {
  [category: string]: Service[]
}

export type WebhookResponse = {
  professional_info: {
    professional_id: string
    professional_name: string
    data_generated: string
  }
  schedule: {
    has_data: boolean
    working_days: WorkingDay[]
  }
  bookings: {
    summary: {
      total_days_checked: number
      actual_bookings: number
      available_days: number
    }
    all_booking_data: BookingData[]
  }
  services: {
    total_received: number
    unique_services: number
    services_by_category: ServicesByCategory
    all_unique_services: Service[]
  }
}

export type SelectedTimeSlot = {
  date: string
  startTime: string
  endTime: string
  dayOfWeek: string
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
  breed?: string
  age?: string
  weight?: string
  special_notes?: string
}

export type PetResponse = {
  customer_found: boolean
  customer_id?: string
  pets: Pet[]
  message?: string
}
