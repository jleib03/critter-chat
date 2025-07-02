import type { ServiceRequest, MatchedProfessional } from "../types/concierge"

// Shared demo data that stays consistent across all views
export const DEMO_SERVICE_REQUEST: ServiceRequest = {
  id: "req_20240110_001",
  customerId: "cust_sarah_johnson",
  pets: [
    {
      id: "pet_luna_001",
      name: "Luna",
      type: "dog",
      breed: "German Shepherd",
      age: 3,
      size: "large",
      weight: 75,
      temperament: ["energetic", "social"],
      specialNeeds: ["Hip dysplasia monitoring", "Post-surgical recovery"],
      medications: ["Carprofen 75mg twice daily", "Joint supplement"],
      vetInfo: {
        clinicName: "Lincoln Park Animal Hospital",
        phone: "(312) 555-0123",
        address: "2665 N Lincoln Ave, Chicago, IL 60614",
      },
      emergencyContact: {
        name: "Sarah Johnson",
        phone: "(312) 555-0456",
        relationship: "Owner",
      },
      preferences: {
        favoriteActivities: ["Gentle walks", "Swimming therapy", "Mental stimulation games"],
        dislikes: ["Loud noises", "Rough play", "Stairs"],
        specialInstructions:
          "Luna is 2 weeks post-op from hip surgery. Needs gentle exercise only - no running or jumping. Very sweet but can be anxious with new people. Responds well to treats and calm energy.",
      },
    },
  ],
  services: ["dog_walking", "pet_sitting", "medication_admin"],
  location: {
    address: "456 N Lake Shore Dr",
    city: "Chicago",
    state: "IL",
    zipCode: "60611",
    coordinates: {
      lat: 41.8947,
      lng: -87.6197,
    },
  },
  timing: {
    urgency: "this_week",
    preferredDate: "2024-01-15",
    preferredTime: "14:00",
  },
  budget: {
    min: 100,
    max: 200,
    flexible: true,
  },
  preferences: {
    professionalType: "no_preference",
    experienceLevel: "expert",
    specialRequirements: ["Post-surgical experience", "Large dog handling", "German Shepherd familiarity"],
  },
  additionalNotes:
    "Luna is recovering from hip surgery and needs someone very experienced with post-operative care. She's usually very friendly but may be more cautious while healing. I work from home but need help with her midday care and gentle exercise routine.",
  contactInfo: {
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@email.com",
    phone: "(312) 555-0456",
    preferredContact: "phone",
  },
  createdAt: "2024-01-10T10:30:00Z",
  status: "pending",
}

export const DEMO_MATCHED_PROFESSIONALS: MatchedProfessional[] = [
  {
    id: "prof_maria_rodriguez",
    name: "Dr. Maria Rodriguez - Canine Rehabilitation Specialists",
    type: "premium_concierge",
    rating: 4.9,
    totalReviews: 156,
    matchScore: 96,
    specialties: [
      "Post-Surgical Care",
      "German Shepherd Specialist",
      "Veterinary Physical Therapy",
      "Large Breed Expert",
    ],
    services: ["dog_walking", "pet_sitting", "medication_admin", "vet_visits", "exercise_programs"],
    location: {
      distance: 0.8,
      area: "Lincoln Park",
    },
    availability: {
      canAccommodate: true,
      nextAvailable: "Today, 2:00 PM",
      flexibility: "very_high",
    },
    team: [
      {
        name: "Dr. Maria Rodriguez",
        role: "Veterinary Rehabilitation Specialist",
        specialties: ["Post-Surgical Care", "Physical Therapy", "Pain Management"],
      },
      {
        name: "James Chen",
        role: "Certified Canine Therapist",
        specialties: ["Exercise Programs", "Large Breed Handling", "Behavioral Support"],
      },
    ],
    pricing: {
      estimatedCost: "$150-200",
      structure: "concierge_package",
    },
    responseTime: "< 15 minutes",
    claimStatus: "available",
  },
  {
    id: "prof_chicago_k9_team",
    name: "Chicago K9 Care Collective",
    type: "multi_service_team",
    rating: 4.7,
    totalReviews: 234,
    matchScore: 89,
    specialties: ["Large Dogs", "Team Care", "Medical Support", "Flexible Scheduling"],
    services: ["dog_walking", "pet_sitting", "medication_admin", "overnight_care"],
    location: {
      distance: 1.2,
      area: "Old Town",
    },
    availability: {
      canAccommodate: true,
      nextAvailable: "Tomorrow, 9:00 AM",
      flexibility: "high",
    },
    team: [
      {
        name: "Lisa Park",
        role: "Lead Pet Care Specialist",
        specialties: ["Medical Administration", "Large Dog Handling"],
      },
      {
        name: "Mike Thompson",
        role: "Dog Walker & Exercise Specialist",
        specialties: ["Gentle Exercise", "Post-Op Care"],
      },
      {
        name: "Amanda Foster",
        role: "Pet Sitter",
        specialties: ["In-Home Care", "Medication Management"],
      },
    ],
    pricing: {
      estimatedCost: "$120-160",
      structure: "service_based",
    },
    responseTime: "< 30 minutes",
    claimStatus: "available",
  },
  {
    id: "prof_jake_walker",
    name: "Jake's Neighborhood Pet Services",
    type: "individual_specialist",
    rating: 4.5,
    totalReviews: 89,
    specialties: ["Dog Walking", "Local Service", "Reliable Care"],
    services: ["dog_walking", "pet_sitting"],
    location: {
      distance: 0.5,
      area: "Lincoln Park",
    },
    availability: {
      canAccommodate: true,
      nextAvailable: "Today, 4:00 PM",
      flexibility: "medium",
    },
    team: [
      {
        name: "Jake Williams",
        role: "Professional Dog Walker",
        specialties: ["Daily Walks", "Pet Sitting", "Neighborhood Service"],
      },
    ],
    pricing: {
      estimatedCost: "$80-120",
      structure: "hourly",
    },
    responseTime: "< 45 minutes",
    claimStatus: "available",
  },
]

export const DEMO_MATCH_REASONING = {
  prof_maria_rodriguez: {
    tier: 1,
    primary: [
      "Veterinary background with specialized post-surgical rehabilitation experience",
      "German Shepherd breed specialist - owns and trains GSDs professionally",
      "Successfully managed 12 similar hip dysplasia recovery cases in past 6 months",
      "Located 0.8 miles from customer in same Lincoln Park neighborhood",
      "Available within customer's preferred timeframe (today 2:00 PM)",
    ],
    secondary: [
      "Premium concierge service tier matches customer's flexible budget ($150-200 range)",
      "Excellent customer reviews specifically mentioning post-op care (4.9/5 stars)",
      "Team approach with certified canine therapist for comprehensive care",
      "Very high flexibility rating for scheduling adjustments",
    ],
    concerns: [],
  },
  prof_chicago_k9_team: {
    tier: 1,
    primary: [
      "Team approach allows for consistent care coverage during recovery period",
      "Strong large dog experience - 65% of their client base are large breeds",
      "Medical support capabilities with medication administration experience",
      "Flexible scheduling matches customer's work-from-home needs",
    ],
    secondary: [
      "Good rating and extensive review history (4.7/5, 234 reviews)",
      "Reasonable distance from customer (1.2 miles in Old Town)",
      "Service-based pricing structure fits within customer budget",
      "Next-day availability works with 'this week' urgency",
    ],
    concerns: [
      "No specific post-surgical specialization mentioned in profile",
      "Team approach may lack the continuity preferred for medical recovery",
    ],
  },
  prof_jake_walker: {
    tier: 2,
    primary: [
      "Excellent proximity to customer (0.5 miles, same neighborhood)",
      "Available same day, matching urgency preference",
      "Budget-friendly option within customer's range",
    ],
    secondary: [
      "Local neighborhood knowledge and established client base",
      "Reliable service history with consistent reviews",
      "Simple, straightforward care approach",
    ],
    concerns: [
      "Limited experience with post-surgical or medical care",
      "No specialized training in large breed handling mentioned",
      "Individual provider may lack backup coverage for ongoing care",
      "Lower rating compared to other tier options (4.5 vs 4.7-4.9)",
    ],
  },
}

export const DEMO_TIMESTAMPS = {
  requestSubmitted: "2024-01-10T10:30:00Z",
  aiAnalysisStarted: "2024-01-10T10:32:00Z",
  aiAnalysisCompleted: "2024-01-10T10:34:00Z",
  tier1Routed: "2024-01-10T10:35:00Z",
  professionalNotified: "2024-01-10T10:36:00Z",
  expectedResponse: "2024-01-10T12:00:00Z",
}

// Helper function to get time elapsed
export function getTimeElapsed(timestamp: string): string {
  const now = new Date()
  const past = new Date(timestamp)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMins / 60)

  if (diffHours > 0) {
    return `${diffHours}h ${diffMins % 60}m ago`
  }
  return `${diffMins}m ago`
}

// Helper function to format time remaining
export function getTimeRemaining(timestamp: string): string {
  const now = new Date()
  const future = new Date(timestamp)
  const diffMs = future.getTime() - now.getTime()

  if (diffMs <= 0) return "Expired"

  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMins / 60)

  if (diffHours > 0) {
    return `${diffHours}h ${diffMins % 60}m remaining`
  }
  return `${diffMins}m remaining`
}
