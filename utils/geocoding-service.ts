import type { Location } from "@/types/geo-scheduling"

export class GeocodingService {
  private static instance: GeocodingService
  private apiKey: string
  private cache: Map<string, Location> = new Map()

  private constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  public static getInstance(apiKey: string): GeocodingService {
    if (!GeocodingService.instance) {
      GeocodingService.instance = new GeocodingService(apiKey)
    }
    return GeocodingService.instance
  }

  async geocodeAddress(address: string): Promise<Location | null> {
    // Check cache first
    const cacheKey = address.toLowerCase().trim()
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    try {
      // For demo purposes, we'll use mock geocoding
      // In production, you would use Google Maps Geocoding API
      const mockLocation = this.generateMockLocation(address)

      // Cache the result
      this.cache.set(cacheKey, mockLocation)

      return mockLocation
    } catch (error) {
      console.error("Geocoding failed for address:", address, error)
      return null
    }
  }

  private generateMockLocation(address: string): Location {
    // Generate mock coordinates around Austin, TX area
    const baseLatitude = 30.2672
    const baseLongitude = -97.7431

    // Create some variation based on address hash
    const hash = this.simpleHash(address)
    const latOffset = ((hash % 100) - 50) * 0.002 // ~0.1 degree variation
    const lngOffset = (((hash * 7) % 100) - 50) * 0.002

    return {
      address: address,
      lat: baseLatitude + latOffset,
      lng: baseLongitude + lngOffset,
    }
  }

  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  async batchGeocode(addresses: string[]): Promise<(Location | null)[]> {
    const results = await Promise.all(addresses.map((address) => this.geocodeAddress(address)))
    return results
  }
}
