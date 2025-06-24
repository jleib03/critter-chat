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
    website?: string
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

// Helper function to format time from 24-hour to 12-hour format
function formatTime(time24: string): string {
  if (!time24) return "9:00 AM"

  const [hours, minutes] = time24.split(":")
  const hour = Number.parseInt(hours)
  const ampm = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 || 12

  return `${hour12}:${minutes} ${ampm}`
}

// Helper function to format phone number
function formatPhoneNumber(phone: string): string {
  if (!phone) return "(555) 123-4567"

  // Remove all non-digits
  const digits = phone.replace(/\D/g, "")

  // Format as (XXX) XXX-XXXX
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  return phone // Return original if not 10 digits
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

    // Parse the response - expecting array format with multiple service records
    if (Array.isArray(data) && data.length > 0) {
      const firstRecord = data[0]
      console.log("🔍 Parsing professional data from first record:", firstRecord)

      // Extract business information from the first record (all records have same business info)
      const businessInfo = {
        business_id: firstRecord.business_id,
        business_name: firstRecord.business_name,
        tagline: firstRecord.tagline,
        business_description: firstRecord.business_description,
        primary_email: firstRecord.primary_email,
        primary_phone_number: firstRecord.primary_phone_number,
        address: firstRecord.address,
        website: firstRecord.website,
        service_area_zip_code: firstRecord.service_area_zip_code,
        // Working hours
        monday_start: firstRecord.monday_start,
        monday_end: firstRecord.monday_end,
        tuesday_start: firstRecord.tuesday_start,
        tuesday_end: firstRecord.tuesday_end,
        wednesday_start: firstRecord.wednesday_start,
        wednesday_end: firstRecord.wednesday_end,
        thursday_start: firstRecord.thursday_start,
        thursday_end: firstRecord.thursday_end,
        friday_start: firstRecord.friday_start,
        friday_end: firstRecord.friday_end,
        saturday_start: firstRecord.saturday_start,
        saturday_end: firstRecord.saturday_end,
        sunday_start: firstRecord.sunday_start,
        sunday_end: firstRecord.sunday_end,
      }

      // Extract all services from all records
      const services: string[] = []
      const serviceTypes = new Set<string>()

      data.forEach((record: any) => {
        if (record.service_name && record.available_to_customer) {
          services.push(record.service_name)
          if (record.service_type_name) {
            serviceTypes.add(record.service_type_name)
          }
        }
      })

      console.log("📋 Extracted services:", services)
      console.log("🏷️ Service types:", Array.from(serviceTypes))

      // Build working hours object
      const workingHours = {
        monday: {
          open: formatTime(businessInfo.monday_start),
          close: formatTime(businessInfo.monday_end),
          isOpen: !!(businessInfo.monday_start && businessInfo.monday_end),
        },
        tuesday: {
          open: formatTime(businessInfo.tuesday_start),
          close: formatTime(businessInfo.tuesday_end),
          isOpen: !!(businessInfo.tuesday_start && businessInfo.tuesday_end),
        },
        wednesday: {
          open: formatTime(businessInfo.wednesday_start),
          close: formatTime(businessInfo.wednesday_end),
          isOpen: !!(businessInfo.wednesday_start && businessInfo.wednesday_end),
        },
        thursday: {
          open: formatTime(businessInfo.thursday_start),
          close: formatTime(businessInfo.thursday_end),
          isOpen: !!(businessInfo.thursday_start && businessInfo.thursday_end),
        },
        friday: {
          open: formatTime(businessInfo.friday_start),
          close: formatTime(businessInfo.friday_end),
          isOpen: !!(businessInfo.friday_start && businessInfo.friday_end),
        },
        saturday: {
          open: formatTime(businessInfo.saturday_start),
          close: formatTime(businessInfo.saturday_end),
          isOpen: !!(businessInfo.saturday_start && businessInfo.saturday_end),
        },
        sunday: {
          open: formatTime(businessInfo.sunday_start),
          close: formatTime(businessInfo.sunday_end),
          isOpen: !!(businessInfo.sunday_start && businessInfo.sunday_end),
        },
      }

      // Create specialties from service types and business context
      const specialties = Array.from(serviceTypes)
      if (businessInfo.tagline && businessInfo.tagline.includes("Chicago")) {
        specialties.push("Chicago Area Service")
      }
      if (services.some((s) => s.toLowerCase().includes("small"))) {
        specialties.push("Small Dog Specialist")
      }
      if (services.some((s) => s.toLowerCase().includes("large"))) {
        specialties.push("Large Dog Care")
      }
      if (services.some((s) => s.toLowerCase().includes("boarding"))) {
        specialties.push("Pet Boarding")
      }

      // Determine location info
      let city = "Chicago"
      let state = "IL"
      if (businessInfo.service_area_zip_code === "60611") {
        city = "Chicago"
        state = "IL"
      }

      const landingData: ProfessionalLandingData = {
        professional_id: businessInfo.business_id || professionalId,
        name: businessInfo.business_name || "Professional Pet Services",
        tagline: businessInfo.tagline || "Quality pet care services",
        description:
          businessInfo.business_description ||
          `Professional ${Array.from(serviceTypes).join(" and ").toLowerCase()} services with experienced staff. We offer a full range of services including ${services.slice(0, 3).join(", ")} and more.`,
        location: {
          address: businessInfo.address || `Service Area: ${businessInfo.service_area_zip_code || "Local Area"}`,
          city: city,
          state: state,
          zip: businessInfo.service_area_zip_code || "60611",
        },
        contact: {
          phone: formatPhoneNumber(businessInfo.primary_phone_number),
          email: businessInfo.primary_email || "info@business.com",
          website: businessInfo.website || undefined,
        },
        working_hours: workingHours,
        services: services,
        specialties: specialties,
        rating: 4.9, // Default - could be calculated from reviews if available
        total_reviews: 127, // Default - could come from review data
        years_experience: 8, // Default - could be calculated from business_created date
        certifications: [
          "Licensed Pet Care Provider",
          "Professional Service Provider",
          "Critter Verified Professional",
        ],
      }

      console.log("✅ Final parsed landing data:", JSON.stringify(landingData, null, 2))
      return landingData
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
      address: "Service Area: Local",
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
    services: ["Professional Pet Care", "Quality Service"],
    specialties: ["Experienced Care", "Professional Service"],
    rating: 4.8,
    total_reviews: 50,
    years_experience: 5,
    certifications: ["Certified Professional", "Licensed Pet Care Provider"],
  }
}
