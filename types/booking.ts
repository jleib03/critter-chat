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
