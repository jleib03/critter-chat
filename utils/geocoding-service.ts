import type { GeoLocation } from "@/types/geo-scheduling"

export class GeocodingService {
  private static instance: GeocodingService
  private cache = new Map<string, GeoLocation>()
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  static getInstance(apiKey?: string): GeocodingService {
    if (!GeocodingService.instance) {
      if (!apiKey) {
        throw new Error("API key required for first initialization")
      }
      GeocodingService.instance = new GeocodingService(apiKey)
    }
    return GeocodingService.instance
  }

  async geocodeAddress(address: string): Promise<GeoLocation | null> {
    // Check cache first
    const cacheKey = address.toLowerCase().trim()
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    try {
      // For demo purposes, we'll simulate geocoding
      // In production, you'd use Google Maps Geocoding API
      const mockLocation = this.mockGeocode(address)

      if (mockLocation) {
        this.cache.set(cacheKey, mockLocation)
        return mockLocation
      }

      // Real implementation would be:
      // const response = await fetch(
      //   `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`
      // )
      // const data = await response.json()
      // if (data.results && data.results.length > 0) {
      //   const result = data.results[0]
      //   const location: GeoLocation = {
      //     address,
      //     lat: result.geometry.location.lat,
      //     lng: result.geometry.location.lng,
      //     formatted_address: result.formatted_address
      //   }
      //   this.cache.set(cacheKey, location)
      //   return location
      // }

      return null
    } catch (error) {
      console.error("Geocoding error:", error)
      return null
    }
  }

  private mockGeocode(address: string): GeoLocation | null {
    // Mock geocoding for demo - generates realistic coordinates for common cities
    const mockLocations: { [key: string]: { lat: number; lng: number } } = {
      "new york": { lat: 40.7128, lng: -74.006 },
      "los angeles": { lat: 34.0522, lng: -118.2437 },
      chicago: { lat: 41.8781, lng: -87.6298 },
      houston: { lat: 29.7604, lng: -95.3698 },
      phoenix: { lat: 33.4484, lng: -112.074 },
      philadelphia: { lat: 39.9526, lng: -75.1652 },
      "san antonio": { lat: 29.4241, lng: -98.4936 },
      "san diego": { lat: 32.7157, lng: -117.1611 },
      dallas: { lat: 32.7767, lng: -96.797 },
      austin: { lat: 30.2672, lng: -97.7431 },
    }

    const addressLower = address.toLowerCase()

    // Check for city matches
    for (const [city, coords] of Object.entries(mockLocations)) {
      if (addressLower.includes(city)) {
        // Add some random variation to simulate different addresses in the same city
        const latVariation = (Math.random() - 0.5) * 0.1 // ~5 mile radius
        const lngVariation = (Math.random() - 0.5) * 0.1

        return {
          address,
          lat: coords.lat + latVariation,
          lng: coords.lng + lngVariation,
          formatted_address: address,
        }
      }
    }

    // Default to a random location in a general area if no match
    return {
      address,
      lat: 40.7128 + (Math.random() - 0.5) * 0.2,
      lng: -74.006 + (Math.random() - 0.5) * 0.2,
      formatted_address: address,
    }
  }

  async batchGeocode(addresses: string[]): Promise<(GeoLocation | null)[]> {
    const results = await Promise.all(addresses.map((address) => this.geocodeAddress(address)))
    return results
  }
}
