import { getCacheKey } from "./cache-utils" // Assuming getCacheKey is declared in another file

export async function getProfessionalLandingConfig(professionalId: string) {
  // Force fresh data fetch and clear any cache
  const timestamp = Date.now()
  console.log(`[${timestamp}] Fetching fresh data for professional ID: ${professionalId}`)

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WEBHOOK_URL}?professionalId=${professionalId}&t=${timestamp}`,
      {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )

    if (!response.ok) {
      console.error(`[${timestamp}] HTTP error! status: ${response.status}`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[${timestamp}] Raw webhook response:`, JSON.stringify(data, null, 2))

    // Parse location information from the data
    const locationInfo = parseLocationInfo(data)
    console.log(`[${timestamp}] Parsed location info:`, locationInfo)

    return {
      professionalName: data.business_name || "Professional",
      location: locationInfo,
      services: data.services || [],
      description: data.business_description || "",
      phone: data.phone || "",
      email: data.email || "",
      website: data.website || "",
      hours: data.hours || {},
      pricing: data.pricing || {},
      policies: data.policies || {},
      rawData: data,
    }
  } catch (error) {
    console.error(`[${timestamp}] Error fetching professional config:`, error)
    throw error
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

// Helper function to parse location from address and service area
function parseLocationInfo(businessInfo: any): { address: string; city: string; state: string; zip: string } {
  console.log("🗺️ Parsing location info:", {
    address: businessInfo.address,
    service_area_zip_code: businessInfo.service_area_zip_code,
    business_name: businessInfo.business_name,
  })

  let address = ""
  let city = "Local Area"
  let state = ""
  let zip = ""

  // Parse address if available
  if (businessInfo.address && businessInfo.address.trim()) {
    const addressLines = businessInfo.address.split("\n")
    address = addressLines[0] || ""
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

  // If no specific address, don't show "Service Area" - just show the parsed city/state
  if (!address && city !== "Local Area" && state) {
    address = `${city}, ${state}`
  } else if (!address && city !== "Local Area") {
    address = city
  } else if (!address) {
    address = "Service Area"
  }

  const result = { address, city, state, zip }
  console.log("📍 Final parsed location:", result)
  return result
}

function parseLocationFromWebhookData(data: any): string {
  console.log("Parsing location from webhook data:", JSON.stringify(data, null, 2))

  // Check if we have a specific address
  if (data.address && typeof data.address === "string" && data.address.trim()) {
    console.log("Found specific address:", data.address)
    return data.address
  }

  // If no specific address, try to extract city and state from business_description
  if (data.business_description && typeof data.business_description === "string") {
    console.log("Checking business_description for location:", data.business_description)

    // Look for patterns like "City, State" or "City, ST"
    const cityStatePattern = /([A-Za-z\s]+),\s*([A-Z]{2})\b/g
    const matches = [...data.business_description.matchAll(cityStatePattern)]

    if (matches.length > 0) {
      const lastMatch = matches[matches.length - 1] // Use the last match as it's likely the most relevant
      const city = lastMatch[1].trim()
      const state = lastMatch[2].trim()
      const location = `${city}, ${state}`
      console.log("Extracted city and state from business_description:", location)
      return location
    }

    // Look for just city names followed by common location indicators
    const cityPattern = /(?:in|serving|located in|based in)\s+([A-Za-z\s]+?)(?:\s+area|\s+and|\s*,|\s*\.|\s*$)/gi
    const cityMatches = [...data.business_description.matchAll(cityPattern)]

    if (cityMatches.length > 0) {
      const city = cityMatches[0][1].trim()
      console.log("Extracted city from business_description:", city)
      return city
    }
  }

  // Fallback to other location fields
  if (data.city && data.state) {
    const location = `${data.city}, ${data.state}`
    console.log("Using city and state fields:", location)
    return location
  }

  if (data.city) {
    console.log("Using city field only:", data.city)
    return data.city
  }

  console.log("No location information found, using default")
  return "Location not specified"
}
