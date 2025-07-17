// Utility for loading professional landing page data with local storage caching
const WEBHOOK_URL = "https://jleib03.app.n8n.cloud/webhook/803d260b-1b17-4abf-8079-2d40225c29b0"

// Cache configuration
const CACHE_KEY_PREFIX = "critter_professional_data_"
const CACHE_EXPIRY_HOURS = 24 // Cache for 24 hours
const CACHE_VERSION = "v2" // Increment this to invalidate all caches

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

interface CachedData {
  data: ProfessionalLandingData
  timestamp: number
  version: string
}

// Helper function to get cache key
function getCacheKey(professionalId: string): string {
  return `${CACHE_KEY_PREFIX}${professionalId}`
}

// Helper function to check if cache is valid
function isCacheValid(cachedItem: CachedData): boolean {
  const now = Date.now()
  const cacheAge = now - cachedItem.timestamp
  const maxAge = CACHE_EXPIRY_HOURS * 60 * 60 * 1000 // Convert hours to milliseconds

  return cachedItem.version === CACHE_VERSION && cacheAge < maxAge
}

// Helper function to get data from local storage
function getFromCache(professionalId: string): ProfessionalLandingData | null {
  try {
    const cacheKey = getCacheKey(professionalId)
    const cachedString = localStorage.getItem(cacheKey)

    if (!cachedString) {
      console.log("📦 No cached data found for professional:", professionalId)
      return null
    }

    const cachedItem: CachedData = JSON.parse(cachedString)

    if (isCacheValid(cachedItem)) {
      console.log("✅ Using cached data for professional:", professionalId)
      console.log("🕒 Cache age:", Math.round((Date.now() - cachedItem.timestamp) / (1000 * 60)), "minutes")
      return cachedItem.data
    } else {
      console.log("⏰ Cache expired for professional:", professionalId)
      localStorage.removeItem(cacheKey)
      return null
    }
  } catch (error) {
    console.error("💥 Error reading from cache:", error)
    return null
  }
}

// Helper function to save data to local storage
function saveToCache(professionalId: string, data: ProfessionalLandingData): void {
  try {
    const cacheKey = getCacheKey(professionalId)
    const cachedItem: CachedData = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    }

    localStorage.setItem(cacheKey, JSON.stringify(cachedItem))
    console.log("💾 Saved professional data to cache:", professionalId)
  } catch (error) {
    console.error("💥 Error saving to cache:", error)
  }
}

// Helper function to clear cache for a specific professional
export function clearProfessionalCache(professionalId: string): void {
  try {
    const cacheKey = getCacheKey(professionalId)
    localStorage.removeItem(cacheKey)
    console.log("🗑️ Cleared cache for professional:", professionalId)
  } catch (error) {
    console.error("💥 Error clearing cache:", error)
  }
}

// Helper function to clear all professional caches
export function clearAllProfessionalCaches(): void {
  try {
    const keys = Object.keys(localStorage)
    const professionalKeys = keys.filter((key) => key.startsWith(CACHE_KEY_PREFIX))

    professionalKeys.forEach((key) => {
      localStorage.removeItem(key)
    })

    console.log("🗑️ Cleared all professional caches:", professionalKeys.length, "items")
  } catch (error) {
    console.error("💥 Error clearing all caches:", error)
  }
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
    case "drop-in":
      return "Drop-In"
    case "other":
      return "Other"
    case "farm care":
      return "Farm Care"
    default:
      return serviceType
  }
}

// Helper function to parse location from address and service area
function parseLocationInfo(businessInfo: any): { address: string; city: string; state: string; zip: string } {
  console.log("🗺️ Parsing location info:", {
    address: businessInfo.address,
    service_area_zip_code: businessInfo.service_area_zip_code,
    business_name: businessInfo.business_name,
  })

  let address = "Service Area"
  let city = "Local Area"
  let state = ""
  let zip = ""

  // Parse address if available
  if (businessInfo.address) {
    const addressLines = businessInfo.address.split("\n")
    address = addressLines[0] || "Service Area"
    console.log("📍 Address lines:", addressLines)

    // Try to parse city, state from second line (e.g., "Summerton, SC 29148")
    if (addressLines.length > 1) {
      const locationLine = addressLines[1].trim()
      console.log("🏙️ Location line:", locationLine)
      const parts = locationLine.split(",")

      if (parts.length >= 2) {
        city = parts[0].trim()
        const stateZipPart = parts[1].trim()
        const stateZipMatch = stateZipPart.match(/^([A-Z]{2})\s*(\d{5})?/)

        if (stateZipMatch) {
          state = stateZipMatch[1]
          zip = stateZipMatch[2] || ""
        }
        console.log("🎯 Parsed from address - City:", city, "State:", state, "Zip:", zip)
      }
    }
  }

  // Use service area zip code if available and no zip found
  if (!zip && businessInfo.service_area_zip_code) {
    // Check if service_area_zip_code is actually a zip code (5 digits) or a description
    const zipMatch = businessInfo.service_area_zip_code.match(/\d{5}/)
    if (zipMatch) {
      zip = zipMatch[0]
      console.log("📮 Found zip in service area:", zip)
    } else {
      // If it's a description like "Summerton and Surrounding Areas", use it as address context
      if (!businessInfo.address) {
        address = `Service Area: ${businessInfo.service_area_zip_code}`
      }
      console.log("📝 Service area description:", businessInfo.service_area_zip_code)
    }
  }

  // If we still don't have city/state, try to infer from service area
  if ((!city || city === "Local Area") && businessInfo.service_area_zip_code) {
    const serviceArea = businessInfo.service_area_zip_code

    // Look for city names in service area description
    if (serviceArea.toLowerCase().includes("summerton")) {
      city = "Summerton"
      state = state || "SC"
      console.log("🔍 Inferred from service area - Summerton, SC")
    } else if (serviceArea.toLowerCase().includes("chicago")) {
      city = "Chicago"
      state = state || "IL"
      console.log("🔍 Inferred from service area - Chicago, IL")
    } else if (serviceArea.toLowerCase().includes("dayton")) {
      city = "Dayton"
      state = state || "OH"
      console.log("🔍 Inferred from service area - Dayton, OH")
    }
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
    console.log("🔄 Force refresh:", forceRefresh)

    // Check cache first (unless force refresh is requested)
    if (!forceRefresh) {
      const cachedData = getFromCache(professionalId)
      if (cachedData) {
        return cachedData
      }
    }

    console.log("🌐 Fetching fresh data from webhook...")
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

      // Extract all services from all records with detailed information
      const services: ServiceItem[] = []
      const serviceTypes = new Set<string>()

      data.forEach((record: any) => {
        if (record.service_name && record.available_to_customer) {
          const serviceItem: ServiceItem = {
            id: record.service_id,
            name: record.service_name,
            description: record.service_description || "",
            duration: formatDuration(record.duration_number, record.duration_unit),
            cost: record.customer_cost ? `$${record.customer_cost}` : "",
            type: record.service_type_name || "General",
            type_display: getServiceTypeDisplayName(record.service_type_name || "General"),
            sort_order: record.service_sort_order || 999,
          }

          services.push(serviceItem)
          serviceTypes.add(record.service_type_name || "General")
        }
      })

      // Sort services by sort_order
      services.sort((a, b) => a.sort_order - b.sort_order)

      // Group services by type
      const serviceGroups: ServiceGroup[] = []
      serviceTypes.forEach((type) => {
        const typeServices = services.filter((service) => service.type === type)
        if (typeServices.length > 0) {
          serviceGroups.push({
            type: type,
            type_display: getServiceTypeDisplayName(type),
            services: typeServices,
          })
        }
      })

      console.log("📋 Extracted services:", services)
      console.log("🏷️ Service groups:", serviceGroups)

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
      const specialties = Array.from(serviceTypes).map((type) => getServiceTypeDisplayName(type))
      if (businessInfo.tagline && businessInfo.tagline.toLowerCase().includes("chicago")) {
        specialties.push("Chicago Area Service")
      }
      if (services.some((s) => s.name.toLowerCase().includes("small"))) {
        specialties.push("Small Dog Specialist")
      }
      if (services.some((s) => s.name.toLowerCase().includes("large"))) {
        specialties.push("Large Dog Care")
      }

      // Parse location information dynamically
      const locationInfo = parseLocationInfo(businessInfo)

      const landingData: ProfessionalLandingData = {
        professional_id: businessInfo.business_id || professionalId,
        name: businessInfo.business_name || "Professional Pet Services",
        tagline: businessInfo.tagline || "Quality pet care services",
        description:
          businessInfo.business_description ||
          `Professional ${Array.from(serviceTypes)
            .map((type) => getServiceTypeDisplayName(type))
            .join(" and ")
            .toLowerCase()} services with experienced staff. We offer a full range of services including ${services
            .slice(0, 3)
            .map((s) => s.name)
            .join(", ")} and more.`,
        location: locationInfo,
        contact: {
          phone: formatPhoneNumber(businessInfo.primary_phone_number),
          email: businessInfo.primary_email || "info@business.com",
          website: businessInfo.website || undefined,
        },
        working_hours: workingHours,
        services: services,
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

      // Save to cache
      saveToCache(professionalId, landingData)

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
