export type ServiceType =
  | "grooming"
  | "pet_sitting"
  | "dog_walking"
  | "overnight_care"
  | "pet_transport"
  | "vet_visits"
  | "training"
  | "emergency_care"
  | "medication_admin"
  | "exercise_programs"

export type PetSize = "small" | "medium" | "large" | "extra_large"
export type PetTemperament = "calm" | "energetic" | "anxious" | "aggressive" | "social" | "shy"
export type UrgencyLevel = "asap" | "today" | "this_week" | "flexible"

export interface Pet {
  id: string
  name: string
  type: "dog" | "cat" | "bird" | "rabbit" | "other"
  breed: string
  age: number
  size: PetSize
  weight: number
  temperament: PetTemperament[]
  specialNeeds: string[]
  medications: string[]
  vetInfo: {
    clinicName: string
    phone: string
    address: string
  }
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  preferences: {
    favoriteActivities: string[]
    dislikes: string[]
    specialInstructions: string
  }
}

export interface ServiceRequest {
  id: string
  customerId: string
  pets: Pet[]
  services: ServiceType[]
  location: {
    address: string
    city: string
    state: string
    zipCode: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  timing: {
    urgency: UrgencyLevel
    preferredDate?: string
    preferredTime?: string
    duration?: number
    recurring?: {
      frequency: "daily" | "weekly" | "monthly"
      endDate?: string
    }
  }
  budget: {
    min: number
    max: number
    flexible: boolean
  }
  preferences: {
    professionalType: "individual" | "team" | "no_preference"
    genderPreference?: "male" | "female" | "no_preference"
    experienceLevel: "any" | "experienced" | "expert"
    specialRequirements: string[]
  }
  additionalNotes: string
  contactInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    preferredContact: "email" | "phone" | "text"
  }
  createdAt: string
  status: "pending" | "matched" | "claimed" | "in_progress" | "completed" | "cancelled"
}

export interface ProfessionalTeamMember {
  name: string
  role: string
  specialties: string[]
}

export interface MatchedProfessional {
  id: string
  name: string
  type: "individual_specialist" | "multi_service_team" | "premium_concierge"
  rating: number
  totalReviews: number
  matchScore: number
  specialties: string[]
  services: ServiceType[]
  location: {
    distance: number
    area: string
  }
  availability: {
    canAccommodate: boolean
    nextAvailable: string
    flexibility: "low" | "medium" | "high" | "very_high"
  }
  team: ProfessionalTeamMember[]
  pricing: {
    estimatedCost: string
    structure: "hourly" | "service_based" | "package" | "concierge_package" | "hourly_plus_services"
  }
  responseTime: string
  claimStatus: "available" | "claimed" | "unavailable"
  claimedBy?: string
  claimedAt?: string
}

export interface ServiceMatch {
  requestId: string
  professionalId: string
  matchScore: number
  matchReasons: string[]
  estimatedCost: number
  canAccommodate: boolean
  responseTime: number
  createdAt: string
}

export interface ClaimRequest {
  professionalId: string
  requestId: string
  proposedCost: number
  proposedSchedule: {
    startDate: string
    startTime: string
    duration: number
  }
  message: string
  claimedAt: string
}
