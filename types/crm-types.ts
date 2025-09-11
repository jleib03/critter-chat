export interface PetCareData {
  id: string
  name: string
  birthdate: string | null
  pet_type: string
  pet_sex: string
  breed_name: string
  spayed_or_neutered: string
  contacts: Array<{
    email: string
    contact_name: string
    contact_type: string
  }>
  foods: Array<{
    food_name: string
    food_type: string
    photo_filename: string
  }>
  treats: Array<{
    treat_name: string
    treat_type: string
  }>
  medications: Array<{
    purpose: string
    delivery_method: string
    medication_name: string
  }>
  allergies: any[]
  conditions: any[]
  general_health_notes: string
  general_feeding_notes: string
  play_instructions: string
  feeding_schedule: Array<{
    time: string
    amount: string
    food_name: string
    instructions: string
  }>
  medication_schedule: Array<{
    amount: string
    schedule_times: string | null
  }>
  walk_schedule: Array<{
    start_time: string
    instructions: string
    typical_length_minutes: number
  }>
  created: string
}

export interface BookingData {
  booking_id: string
  start: string
  end: string
  start_local: string
  start_formatted: string
  end_formatted: string
  timezone_used: string
  is_recurring: boolean
  professional_id: string
  customer_id: string
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  professional_name: string
  booking_date: string
  booking_date_formatted: string
  day_of_week: string
  pet_id: string
  service_types: string
  service_names: string
  service_count: string
}

export interface InvoiceData {
  invoices: any[]
  payment_instructions: string
}

export interface OnboardingStatus {
  email: string
  user_type: string
  onboarding_complete: boolean
  criteria_status: {
    pets_created: boolean
    policies_signed: boolean
    personal_info_complete: boolean
    emergency_contacts_added: boolean
  }
  supporting_details: {
    pets: {
      count: number
      details: Array<{
        pet_id: number
        pet_name: string
      }>
    }
    policies: {
      details: Array<{
        signed: boolean
        policy_id: number
        signed_at: string
      }>
      total_policies: number
      signed_policies: number
    }
    personal_info: {
      email: string
      last_name: string
      first_name: string
    }
    emergency_contacts: {
      count: number
      details: Array<{
        email: string
        contact_name: string
        contact_type: string
        phone_number: string
        business_name: string
      }>
    }
  }
}

export interface CRMData {
  petCare: PetCareData[]
  bookings: BookingData[]
  invoices: InvoiceData
  onboarding: OnboardingStatus
  lastUpdated: string
  professionalId: string
}

export interface CRMStats {
  totalCustomers: number
  totalPets: number
  totalBookings: number
  activeCustomers: number
  completedOnboarding: number
  recentBookings: number
  exoticPets: number
  recurringClients: number
}
