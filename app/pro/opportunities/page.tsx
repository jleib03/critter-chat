"use client"

import { useState, useEffect } from "react"
import { DEMO_SERVICE_REQUEST, DEMO_MATCH_REASONING } from "../../../utils/demo-data"

interface ServiceOpportunity {
  id: string
  tier: 1 | 2 | 3
  customerName: string
  pets: Array<{
    name: string
    type: string
    breed: string
    age: number
    specialNeeds: string[]
    medications: string[]
    specialInstructions: string
  }>
  services: string[]
  location: {
    distance: number
    area: string
    fullAddress: string
  }
  timing: {
    urgency: string
    preferredDate?: string
    preferredTime?: string
  }
  budget: {
    min: number
    max: number
    flexible: boolean
  }
  whySelected: {
    primary: string[]
    secondary: string[]
    concerns: string[]
  }
  estimatedEarnings: string
  postedAt: string
  expiresAt: string
  claimsRemaining: number
  totalClaims: number
  status: "available" | "claimed" | "expired"
  matchScore: number
  customerNotes: string
}

export default function ProfessionalOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<ServiceOpportunity[]>([])
  const [selectedTier, setSelectedTier] = useState<1 | 2 | 3>(1)
  const [claimingOpportunity, setClaimingOpportunity] = useState<string | null>(null)
  
  const [professionalProfile] = useState({
    name: "Dr. Maria Rodriguez",
    specialties: ["Post-Surgical Care", "German Shepherd Specialist", "Veterinary Physical Therapy", "Large Breed Expert"],
    rating: 4.9,
    totalJobs: 156,
    responseRate: 98,
    tier1Opportunities: 12,
    tier2Opportunities: 8,
    totalEarnings: "$15,240",
  })

  useEffect(() => {
    // Convert demo data to opportunities format
    const demoOpportunity: ServiceOpportunity = {
      id: DEMO_SERVICE_REQUEST.id,
      tier: 1,
      customerName: `${DEMO_SERVICE_REQUEST.contactInfo.firstName} ${DEMO_SERVICE_REQUEST.contactInfo.lastName.charAt(0)}.`,
      pets: DEMO_SERVICE_REQUEST.pets.map(pet => ({
        name: pet.name,
        type: pet.type,
        breed: pet.breed,
        age: pet.age,
        specialNeeds: pet.specialNeeds,
        medications: pet.medications,
        specialInstructions: pet.preferences.specialInstructions,
      })),
      services: DEMO_SERVICE_REQUEST.services,
      location: {
        distance: 0.8,
        area: "Lincoln Park",
        fullAddress: `${DEMO_SERVICE_REQUEST.location.city}, ${DEMO_SERVICE_REQUEST.location.state}`,
      },
      timing: {
        urgency: DEMO_SERVICE_REQUEST.timing.urgency,
        preferredDate: DEMO_SERVICE_REQUEST.timing.preferredDate,
        preferredTime: DEMO_SERVICE_REQUEST.timing.preferredTime,
      },
      budget: DEMO_SERVICE_REQUEST.budget,
      whySelected: DEMO_MATCH_REASONING.prof_maria_rodriguez,
      estimatedEarnings: "$150-200",
      postedAt: DEMO_SERVICE_REQUEST.createdAt,
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
      claimsRemaining: 2,
      totalClaims: 3,
      status: "available",
      matchScore: 96,
      customerNotes: DEMO_SERVICE_REQUEST.additionalNotes,
    }

    // Add a second tier 2 opportunity for demo
    const tier2Opportunity: ServiceOpportunity = {
      id: "req_20240110_002",
      tier: 2,
      customerName
