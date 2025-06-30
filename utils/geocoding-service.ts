export type GeocodingResult = {
  address: string
  formatted_address: string
  lat: number
  lng: number
  place_id?: string
}

export class GeocodingService {
  private static instance: GeocodingService
  private apiKey: string
  private cache: Map<string, GeocodingResult> = new Map()

  private constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  static getInstance(apiKey: string): GeocodingService {
    if (!GeocodingService.instance) {
      GeocodingService.instance = new GeocodingService(apiKey)
    }
    return GeocodingService.instance
  }

  async geocodeAddress(address: string): Promise<GeocodingResult | null> {
    // Check cache first
    const cacheKey = address.toLowerCase().trim()
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    try {
      // For demo purposes, we'll use mock data based on common addresses
      const mockResult = this.getMockGeocodingResult(address)
      if (mockResult) {
        this.cache.set(cacheKey, mockResult)
        return mockResult
      }

      // In production, you would use Google Maps Geocoding API:
      // const response = await fetch(
      //   `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`
      // )
      // const data = await response.json()
      // if (data.results && data.results.length > 0) {
      //   const result = data.results[0]
      //   const geocodingResult: GeocodingResult = {
      //     address: address,
      //     formatted_address: result.formatted_address,
      //     lat: result.geometry.location.lat,
      //     lng: result.geometry.location.lng,
      //     place_id: result.place_id
      //   }
      //   this.cache.set(cacheKey, geocodingResult)
      //   return geocodingResult
      // }

      return null
    } catch (error) {
      console.error("Geocoding error:", error)
      return null
    }
  }

  private getMockGeocodingResult(address: string): GeocodingResult | null {
    const addressLower = address.toLowerCase()

    // Mock data for common cities and patterns
    if (addressLower.includes("austin") || addressLower.includes("tx")) {
      const baseCoords = { lat: 30.2672, lng: -97.7431 }
      const offset = Math.random() * 0.1 - 0.05 // Random offset within ~3 miles

      return {
        address: address,
        formatted_address: `${address}, Austin, TX, USA`,
        lat: baseCoords.lat + offset,
        lng: baseCoords.lng + offset,
        place_id: `mock_${Date.now()}_${Math.random()}`,
      }
    }

    if (addressLower.includes("chicago") || addressLower.includes("il")) {
      const baseCoords = { lat: 41.8781, lng: -87.6298 }
      const offset = Math.random() * 0.1 - 0.05

      return {
        address: address,
        formatted_address: `${address}, Chicago, IL, USA`,
        lat: baseCoords.lat + offset,
        lng: baseCoords.lng + offset,
        place_id: `mock_${Date.now()}_${Math.random()}`,
      }
    }

    if (addressLower.includes("new york") || addressLower.includes("ny")) {
      const baseCoords = { lat: 40.7128, lng: -74.006 }
      const offset = Math.random() * 0.1 - 0.05

      return {
        address: address,
        formatted_address: `${address}, New York, NY, USA`,
        lat: baseCoords.lat + offset,
        lng: baseCoords.lng + offset,
        place_id: `mock_${Date.now()}_${Math.random()}`,
      }
    }

    // Default fallback for any address
    const baseCoords = { lat: 39.8283, lng: -98.5795 } // Geographic center of US
    const offset = Math.random() * 2 - 1 // Larger random offset

    return {
      address: address,
      formatted_address: `${address}, USA`,
      lat: baseCoords.lat + offset,
      lng: baseCoords.lng + offset,
      place_id: `mock_${Date.now()}_${Math.random()}`,
    }
  }

  async batchGeocode(addresses: string[]): Promise<(GeocodingResult | null)[]> {
    const results = await Promise.all(addresses.map((address) => this.geocodeAddress(address)))
    return results
  }

  clearCache(): void {
    this.cache.clear()
  }
}
