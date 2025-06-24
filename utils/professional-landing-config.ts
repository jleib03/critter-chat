// Utility for loading professional landing page data
const WEBHOOK_URL = "https://jleib03.app.n8n.cloud/webhook/803d260b-1b17-4abf-8079-2d40225c29b0"

export interface ProfessionalLandingData {
  professional_id: string
  name: string
  tagline: string
  description: string
  location: {
    address: string
    city: string
    state: string
    zip: string
  }
  contact: {
    phone: string
    email: string
  }
  working_hours: {
    [key: string]: {
      open: string
      close: string
      isOpen: boolean
    }
  }
  services: string[]
  specialties: string[]
  rating: number
  total_reviews: number
  years_experience: number
  certifications: string[]
}

export async function loadProfessionalLandingData(professionalId: string): Promise<ProfessionalLandingData | null> {
  try {
    console.log("🚀 Loading professional landing data for ID:", professionalId)
    console.log("🔗 Using webhook URL:", WEBHOOK_URL)

    const payload = {
      action: "external_page_initialization",
      professionalId: professionalId,
    }

    console.log("📤 Sending payload:", JSON.stringify(payload, null, 2))

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    console.log("📡 Response status:", response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Professional landing data webhook error:", errorText)
      return null
    }

    const data = await response.json()
    console.log("📥 Raw professional landing response:", JSON.stringify(data, null, 2))

    // Parse the response - expecting array format like other webhooks
    if (Array.isArray(data) && data.length > 0) {
      const professionalData = data[0]
      console.log("🔍 Parsing professional data:", professionalData)

      if (professionalData) {
        // Parse working hours if it's a JSON string
        let workingHours = {}
        try {
          if (typeof professionalData.working_hours === "string") {
            workingHours = JSON.parse(professionalData.working_hours)
          } else if (professionalData.working_hours) {
            workingHours = professionalData.working_hours
          }
        } catch (error) {
          console.error("Error parsing working hours:", error)
          // Use default working hours
          workingHours = {
            monday: { open: "9:00 AM", close: "6:00 PM", isOpen: true },
            tuesday: { open: "9:00 AM", close: "6:00 PM", isOpen: true },
            wednesday: { open: "9:00 AM", close: "6:00 PM", isOpen: true },
            thursday: { open: "9:00 AM", close: "6:00 PM", isOpen: true },
            friday: { open: "9:00 AM", close: "6:00 PM", isOpen: true },
            saturday: { open: "9:00 AM", close: "4:00 PM", isOpen: true },
            sunday: { open: "Closed", close: "Closed", isOpen: false },
          }
        }

        // Parse services and specialties if they're JSON strings
        let services = []
        let specialties = []
        let certifications = []

        try {
          services =
            typeof professionalData.services === "string"
              ? JSON.parse(professionalData.services)
              : professionalData.services || []
        } catch (error) {
          console.error("Error parsing services:", error)
          services = ["Full Service Grooming", "Bath & Brush", "Nail Trimming"]
        }

        try {
          specialties =
            typeof professionalData.specialties === "string"
              ? JSON.parse(professionalData.specialties)
              : professionalData.specialties || []
        } catch (error) {
          console.error("Error parsing specialties:", error)
          specialties = ["Professional Pet Care", "Experienced Service"]
        }

        try {
          certifications =
            typeof professionalData.certifications === "string"
              ? JSON.parse(professionalData.certifications)
              : professionalData.certifications || []
        } catch (error) {
          console.error("Error parsing certifications:", error)
          certifications = ["Certified Professional", "Licensed Pet Care Provider"]
        }

        const landingData: ProfessionalLandingData = {
          professional_id: professionalData.professional_id || professionalId,
          name: professionalData.name || professionalData.business_name || "Professional Pet Services",
          tagline: professionalData.tagline || professionalData.business_tagline || "Quality pet care services",
          description:
            professionalData.description ||
            professionalData.business_description ||
            "Professional pet care services with experienced staff.",
          location: {
            address: professionalData.address || professionalData.business_address || "123 Main Street",
            city: professionalData.city || professionalData.business_city || "Your City",
            state: professionalData.state || professionalData.business_state || "State",
            zip: professionalData.zip || professionalData.business_zip || "12345",
          },
          contact: {
            phone: professionalData.phone || professionalData.business_phone || "(555) 123-4567",
            email: professionalData.email || professionalData.business_email || "info@business.com",
          },
          working_hours: workingHours,
          services: services,
          specialties: specialties,
          rating: Number.parseFloat(professionalData.rating) || 4.8,
          total_reviews: Number.parseInt(professionalData.total_reviews) || 50,
          years_experience: Number.parseInt(professionalData.years_experience) || 5,
          certifications: certifications,
        }

        console.log("✅ Final parsed landing data:", JSON.stringify(landingData, null, 2))
        return landingData
      }
    }

    console.log("⚠️ No valid professional landing data found in response")
    return null
  } catch (error) {
    console.error("💥 Error loading professional landing data:", error)
    return null
  }
}

// Fallback data in case webhook fails
export function getDefaultProfessionalData(professionalId: string): ProfessionalLandingData {
  return {
    professional_id: professionalId,
    name: "Professional Pet Services",
    tagline: "Quality pet care services",
    description: "Professional pet care services with experienced and caring staff dedicated to your pet's wellbeing.",
    location: {
      address: "123 Main Street",
      city: "Your City",
      state: "State",
      zip: "12345",
    },
    contact: {
      phone: "(555) 123-4567",
      email: "info@petservices.com",
    },
    working_hours: {
      monday: { open: "9:00 AM", close: "6:00 PM", isOpen: true },
      tuesday: { open: "9:00 AM", close: "6:00 PM", isOpen: true },
      wednesday: { open: "9:00 AM", close: "6:00 PM", isOpen: true },
      thursday: { open: "9:00 AM", close: "6:00 PM", isOpen: true },
      friday: { open: "9:00 AM", close: "6:00 PM", isOpen: true },
      saturday: { open: "9:00 AM", close: "4:00 PM", isOpen: true },
      sunday: { open: "Closed", close: "Closed", isOpen: false },
    },
    services: ["Professional Pet Care", "Grooming Services", "Health Checkups"],
    specialties: ["Experienced Care", "Professional Service"],
    rating: 4.8,
    total_reviews: 50,
    years_experience: 5,
    certifications: ["Certified Professional", "Licensed Pet Care Provider"],
  }
}
