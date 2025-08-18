export type SelectionOption = {
  name: string
  description?: string
  details?: string[]
  selected?: boolean
  category?: string
}

export type SelectionType = "professional" | "service" | "pet" | "confirmation" | null

export type ServiceItem = {
  name: string
  category: string
  details: string[]
}

export type ProfessionalItem = {
  name: string
  email?: string
  details?: string[]
}

export type PetItem = {
  name: string
  type: string
}

export type ListItem = {
  title: string
  content: string
}

export type StructuredMessage = {
  type: string
  intro?: string
  items?: ServiceItem[] | ProfessionalItem[] | PetItem[] | ListItem[]
  footer?: string
  text?: string
}

export type Message = {
  text: string
  isUser: boolean
  htmlMessage?: string
}

export type OnboardingFormData = {
  professionalName: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  pets: PetFormData[]
}

export type PetFormData = {
  name: string
  type: string
  breed: string
  age: string
  isSpayedOrNeutered: boolean
  notes: string
  sex?: string | null
  birthMonth?: string | null
  birthDay?: string | null
  birthYear?: string | null
  weight?: string | null
}

export type ServiceSelectionData = {
  services: string[]
  date: string
  time: string
  timezone: string
  notes: string
  isRecurring?: boolean
  recurringFrequency?: string | null
  recurringEndDate?: string | null
  isMultiDay?: boolean
  endDate?: string | null
}
