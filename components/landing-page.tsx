"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface Location {
  city: string
  state: string
}

interface Contact {
  phone: string
  email: string
  website: string
}

interface ProfessionalData {
  id: string
  name: string
  tagline: string
  location: Location
  contact: Contact
  specialties: string[]
  // Add other fields as needed
}

// Placeholder function for loading professional data (replace with your actual implementation)
const loadProfessionalLandingData = async (
  professionalId: string,
  forceRefresh: boolean,
): Promise<ProfessionalData | null> => {
  // Simulate an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate different scenarios based on professionalId
      if (professionalId === "valid-id") {
        resolve({
          id: "valid-id",
          name: "Example Professional",
          tagline: "Your trusted expert",
          location: { city: "Anytown", state: "CA" },
          contact: { phone: "555-123-4567", email: "info@example.com", website: "example.com" },
          specialties: ["Expertise 1", "Expertise 2"],
        })
      } else if (professionalId === "empty-id") {
        resolve(null) // Simulate no data returned
      } else {
        throw new Error("Failed to load data") // Simulate an error
      }
    }, 500)
  })
}

const getDefaultProfessionalData = (professionalId: string): ProfessionalData => {
  return {
    id: professionalId,
    name: "Default Professional",
    tagline: "General Services",
    location: { city: "Unknown", state: "Unknown" },
    contact: { phone: "N/A", email: "N/A", website: "N/A" },
    specialties: ["General Service"],
  }
}

interface LandingPageProps {
  professionalId: string
  forceRefresh?: boolean
}

const LandingPage: React.FC<LandingPageProps> = ({ professionalId, forceRefresh = false }) => {
  const [professionalData, setProfessionalData] = useState<ProfessionalData | null>(null)

  useEffect(() => {
    const loadData = async () => {
      console.log("🔄 Loading professional data for ID:", professionalId)

      try {
        const data = await loadProfessionalLandingData(professionalId, forceRefresh)

        if (data) {
          console.log("✅ Successfully loaded professional data:", data.name)
          setProfessionalData(data)
        } else {
          console.log("⚠️ No data returned from webhook, using fallback data")
          const fallbackData = getDefaultProfessionalData(professionalId)

          // Try to preserve any known information about this professional
          if (professionalId === "sally-grooming" || professionalId.includes("sally")) {
            fallbackData.name = "Sally Grooming"
            fallbackData.tagline = "Professional Pet Grooming Services"
            fallbackData.location.city = "Chicago"
            fallbackData.location.state = "IL"
            fallbackData.contact.phone = "(847) 707-5040"
            fallbackData.contact.email = "critterdoggroomer@gmail.com"
            fallbackData.contact.website = "critter.pet"
            fallbackData.specialties = [
              "Grooming Services",
              "Chicago Area Service",
              "Small Dog Specialist",
              "Large Dog Care",
            ]
          }

          setProfessionalData(fallbackData)
        }
      } catch (error) {
        console.error("💥 Error loading professional data:", error)
        setProfessionalData(getDefaultProfessionalData(professionalId))
      }
    }

    loadData()
  }, [professionalId, forceRefresh])

  if (!professionalData) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>{professionalData.name}</h1>
      <p>{professionalData.tagline}</p>
      <p>
        Location: {professionalData.location.city}, {professionalData.location.state}
      </p>
      <p>
        Contact: {professionalData.contact.phone}, {professionalData.contact.email}, {professionalData.contact.website}
      </p>
      <ul>
        {professionalData.specialties.map((specialty, index) => (
          <li key={index}>{specialty}</li>
        ))}
      </ul>
    </div>
  )
}

export default LandingPage
