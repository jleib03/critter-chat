// Utility for loading professional landing page data - always fresh, no caching
const WEBHOOK_URL = "https://jleib03.app.n8n.cloud/webhook/803d260b-1b17-4abf-8079-2d40225c29b0"

export interface ServiceItem {
  id: string
  name: string
  description: string
  duration: string
  cost: string
  type: string
  type_display: string
  sort_order: number
}

export interface ServiceGroup {
  type: string
  type_display: string
  services: ServiceItem[]
}

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
  services: ServiceItem[]
  service_groups: ServiceGroup[]
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

// Helper function to format duration
function formatDuration(duration: number, unit: string): string {
  if (unit.toLowerCase() === "hours") {
    return duration === 1 ? "1 hour" : `${duration} hours`
  } else if (unit.toLowerCase() === "minutes") {
    return duration === 1 ? "1 minute" : `${duration} minutes`
  } else if (unit.toLowerCase() === "days") {
    return duration === 1 ? "1 day" : `${duration} days`
  }
  return `${duration} ${unit.toLowerCase()}`
}

// Helper function to get service type display name
function getServiceTypeDisplayName(serviceType: string): string {
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

// Helper function to parse location from service areas and business info
function parseLocationInfo(businessData: any): { address: string; city: string; state: string; zip: string } {
  console.log("🗺️ Parsing location info:", {
    business_name: businessData.business?.business_name,
    tagline: businessData.business?.tagline,
    service_areas: businessData.service_areas,
  })

  let address = ""
  let city = "Local Area"
  let state = ""
  let zip = ""

  // Check service areas for zip codes
  if (businessData.service_areas && businessData.service_areas.length > 0) {
    const serviceAreas = businessData.service_areas
    console.log("📮 Found service areas:", serviceAreas)

    // If we have multiple service areas, join them
    if (serviceAreas.length > 1) {
      address = `Service Areas: ${serviceAreas.join(", ")}`
      zip = serviceAreas[0] // Use first zip as primary
    } else {
      const firstServiceArea = serviceAreas[0]

      // If it's a 5-digit zip code, show it as service area
      if (/^\d{5}$/.test(firstServiceArea)) {
        address = `Service Area: ${firstServiceArea}`
        zip = firstServiceArea
        city = firstServiceArea // Use zip as city for display
      } else {
        // If it's a description, use it as the address
        address = firstServiceArea
      }
    }

    console.log("📍 Set address from service areas:", address)
  }

  // Try to extract location info from business name for city/state context
  if (businessData.business?.business_name) {
    const businessName = businessData.business.business_name.toLowerCase()
    console.log("🏢 Checking business name for location context:", businessName)

    if (businessName.includes("chicago")) {
      state = "IL"
      console.log("🏢 Inferred state from business name - IL")
    } else if (businessName.includes("summerton")) {
      state = "SC"
      console.log("🏢 Inferred state from business name - SC")
    } else if (businessName.includes("dayton")) {
      state = "OH"
      console.log("🏢 Inferred state from business name - OH")
    }
  }

  // Try to extract location info from tagline for city/state context
  if (businessData.business?.tagline) {
    const tagline = businessData.business.tagline.toLowerCase()
    console.log("🏷️ Checking tagline for location context:", tagline)

    if (tagline.includes("chicago")) {
      state = "IL"
      console.log("🏷️ Inferred state from tagline - IL")
    } else if (tagline.includes("summerton")) {
      state = "SC"
      console.log("🏷️ Inferred state from tagline - SC")
    } else if (tagline.includes("dayton")) {
      state = "OH"
      console.log("🏷️ Inferred state from tagline - OH")
    }
  }

  // Set default address if we don't have one
  if (!address) {
    address = "Service Area"
  }

  const result = { address, city, state, zip }
  console.log("📍 Final parsed location:", result)
  return result
}

export async function loadProfessionalLandingData(
  professionalId: string,
  forceRefresh = false,
): Promise<ProfessionalLandingData | null> {
  try {
    console.log("🚀 Loading professional landing data for ID:", professionalId)
    console.log("🌐 Always fetching fresh data from webhook...")
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
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
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

    // Parse the new simplified response format
    if (Array.isArray(data) && data.length > 0) {
      const firstRecord = data[0]
      console.log("🔍 Parsing professional data from first record:", firstRecord)

      const businessData = firstRecord.business_data
      if (!businessData) {
        console.error("❌ No business_data found in response")
        return null
      }

      const business = businessData.business
      const schedule = businessData.schedule
      const services = businessData.services || []
      const serviceAreas = businessData.service_areas || []

      console.log("🏢 Business info:", business)
      console.log("📅 Schedule info:", schedule)
      console.log("🛠️ Services info:", services)
      console.log("📍 Service areas:", serviceAreas)

      // Extract and format services
      const formattedServices: ServiceItem[] = []
      const serviceTypes = new Set<string>()

      services.forEach((service: any) => {
        if (service.service_name && service.available_to_customer) {
          const serviceItem: ServiceItem = {
            id: service.service_id.toString(),
            name: service.service_name,
            description: service.service_description || "",
            duration: formatDuration(service.duration_number, service.duration_unit),
            cost: service.customer_cost ? `$${service.customer_cost}` : "",
            type: service.service_type_name || "General",
            type_display: getServiceTypeDisplayName(service.service_type_name || "General"),
            sort_order: service.service_sort_order || 999,
          }

          formattedServices.push(serviceItem)
          serviceTypes.add(service.service_type_name || "General")
        }
      })

      // Sort services by sort_order
      formattedServices.sort((a, b) => a.sort_order - b.sort_order)

      // Group services by type
      const serviceGroups: ServiceGroup[] = []
      serviceTypes.forEach((type) => {
        const typeServices = formattedServices.filter((service) => service.type === type)
        if (typeServices.length > 0) {
          serviceGroups.push({
            type: type,
            type_display: getServiceTypeDisplayName(type),
            services: typeServices,
          })
        }
      })

      console.log("📋 Extracted services:", formattedServices)
      console.log("🏷️ Service groups:", serviceGroups)

      // Build working hours object from schedule
      const workingHours = {
        monday: {
          open: formatTime(schedule?.monday_start),
          close: formatTime(schedule?.monday_end),
          isOpen: !!(schedule?.monday_start && schedule?.monday_end),
        },
        tuesday: {
          open: formatTime(schedule?.tuesday_start),
          close: formatTime(schedule?.tuesday_end),
          isOpen: !!(schedule?.tuesday_start && schedule?.tuesday_end),
        },
        wednesday: {
          open: formatTime(schedule?.wednesday_start),
          close: formatTime(schedule?.wednesday_end),
          isOpen: !!(schedule?.wednesday_start && schedule?.wednesday_end),
        },
        thursday: {
          open: formatTime(schedule?.thursday_start),
          close: formatTime(schedule?.thursday_end),
          isOpen: !!(schedule?.thursday_start && schedule?.thursday_end),
        },
        friday: {
          open: formatTime(schedule?.friday_start),
          close: formatTime(schedule?.friday_end),
          isOpen: !!(schedule?.friday_start && schedule?.friday_end),
        },
        saturday: {
          open: formatTime(schedule?.saturday_start),
          close: formatTime(schedule?.saturday_end),
          isOpen: !!(schedule?.saturday_start && schedule?.saturday_end),
        },
        sunday: {
          open: formatTime(schedule?.sunday_start),
          close: formatTime(schedule?.sunday_end),
          isOpen: !!(schedule?.sunday_start && schedule?.sunday_end),
        },
      }

      // Create specialties from service types and business context
      const specialties = Array.from(serviceTypes).map((type) => getServiceTypeDisplayName(type))
      if (business?.tagline && business.tagline.toLowerCase().includes("chicago")) {
        specialties.push("Chicago Area Service")
      }
      if (formattedServices.some((s) => s.name.toLowerCase().includes("small"))) {
        specialties.push("Small Dog Specialist")
      }
      if (formattedServices.some((s) => s.name.toLowerCase().includes("large"))) {
        specialties.push("Large Dog Care")
      }

      // Parse location information
      const locationInfo = parseLocationInfo({ business, service_areas: serviceAreas })

      const landingData: ProfessionalLandingData = {
        professional_id: business?.business_id?.toString() || professionalId,
        name: business?.business_name || "Professional Pet Services",
        tagline: business?.tagline || "Quality pet care services",
        description:
          business?.business_description ||
          `Professional ${Array.from(serviceTypes)
            .map((type) => getServiceTypeDisplayName(type))
            .join(" and ")
            .toLowerCase()} services with experienced staff. We offer a full range of services including ${formattedServices
            .slice(0, 3)
            .map((s) => s.name)
            .join(", ")} and more.`,
        location: locationInfo,
        contact: {
          phone: formatPhoneNumber(business?.primary_phone_number),
          email: business?.primary_email || "info@business.com",
          website: business?.website || undefined,
        },
        working_hours: workingHours,
        services: formattedServices,
        service_groups: serviceGroups,
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
    services: [],
    service_groups: [],
    specialties: ["Experienced Care", "Professional Service"],
    rating: 4.8,
    total_reviews: 50,
    years_experience: 5,
    certifications: ["Certified Professional", "Licensed Pet Care Provider"],
  }
}

// Legacy functions for compatibility - no longer used but kept to avoid breaking changes
export function clearProfessionalCache(professionalId: string): void {
  console.log("🗑️ Cache clearing not needed - always using fresh data")
}

export function clearAllProfessionalCaches(): void {
  console.log("🗑️ Cache clearing not needed - always using fresh data")
}
