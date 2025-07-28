import { Scissors, Heart, Home, MapPin, Stethoscope, Car, Users, Clock, Star, Shield, Zap, Coffee } from "lucide-react"

// Service type to icon mapping
export const getServiceIcon = (serviceType: string) => {
  const type = serviceType.toLowerCase()

  switch (type) {
    case "grooming":
      return Scissors
    case "boarding":
      return Home
    case "sitting":
    case "pet sitting":
      return Users
    case "walking":
    case "dog walking":
      return MapPin
    case "veterinary":
    case "vet":
    case "medical":
      return Stethoscope
    case "transport":
    case "transportation":
      return Car
    case "training":
      return Star
    case "emergency":
      return Shield
    case "daycare":
      return Clock
    case "specialty":
      return Zap
    case "consultation":
      return Coffee
    default:
      return Heart
  }
}

// Service type to color mapping
export const getServiceColor = (serviceType: string) => {
  const type = serviceType.toLowerCase()

  switch (type) {
    case "grooming":
      return "text-[#E75837]" // Orange
    case "boarding":
      return "text-[#745E25]" // Brown
    case "sitting":
    case "pet sitting":
      return "text-[#94ABD6]" // Blue
    case "walking":
    case "dog walking":
      return "text-green-600"
    case "veterinary":
    case "vet":
    case "medical":
      return "text-red-600"
    case "transport":
    case "transportation":
      return "text-purple-600"
    case "training":
      return "text-yellow-600"
    case "emergency":
      return "text-red-700"
    case "daycare":
      return "text-blue-600"
    case "specialty":
      return "text-indigo-600"
    case "consultation":
      return "text-gray-600"
    default:
      return "text-[#E75837]"
  }
}

// Service type display names
export const getServiceTypeDisplayName = (serviceType: string) => {
  const type = serviceType.toLowerCase()

  switch (type) {
    case "grooming":
      return "Grooming Services"
    case "boarding":
      return "Boarding & Lodging"
    case "sitting":
    case "pet sitting":
      return "Pet Sitting"
    case "walking":
    case "dog walking":
      return "Dog Walking"
    case "veterinary":
    case "vet":
    case "medical":
      return "Veterinary Care"
    case "transport":
    case "transportation":
      return "Pet Transportation"
    case "training":
      return "Training & Behavior"
    case "emergency":
      return "Emergency Services"
    case "daycare":
      return "Pet Daycare"
    case "specialty":
      return "Specialty Services"
    case "consultation":
      return "Consultations"
    default:
      return serviceType
  }
}
