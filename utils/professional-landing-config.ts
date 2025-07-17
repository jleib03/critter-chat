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
    const locationInfo = parseLocationFromWebhookData(data)
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
