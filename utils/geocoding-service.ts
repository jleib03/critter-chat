import type { Coordinates } from "@/types/geo-scheduling"

export class GeocodingService {
  private static instance: GeocodingService
  private apiKey: string
  private cache: Map<string, Coordinates> = new Map()

  private constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  public static getInstance(apiKey: string): GeocodingService {
    if (!GeocodingService.instance) {
      GeocodingService.instance = new GeocodingService(apiKey)
    }
    return GeocodingService.instance
  }

  async geocodeAddress(address: string): Promise<Coordinates | null> {
    // Check cache first
    const cacheKey = address.toLowerCase().trim()
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    try {
      // For demo purposes, we'll use mock geocoding
      // In production, you would use Google Maps Geocoding API
      const mockCoordinates = await this.generateMockCoordinates(address)

      // Cache the result
      this.cache.set(cacheKey, mockCoordinates)

      return mockCoordinates
    } catch (error) {
      console.error("Geocoding failed for address:", address, error)
      return null
    }
  }

  private async generateMockCoordinates(address: string): Promise<Coordinates> {
    // Mock geocoding service - replace with Google Maps Geocoding API in production
    const mockCoordinates: { [key: string]: Coordinates } = {
      "new york": { lat: 40.7128, lng: -74.006 },
      brooklyn: { lat: 40.6782, lng: -73.9442 },
      manhattan: { lat: 40.7831, lng: -73.9712 },
      queens: { lat: 40.7282, lng: -73.7949 },
      bronx: { lat: 40.8448, lng: -73.8648 },
      "staten island": { lat: 40.5795, lng: -74.1502 },
    }

    // Simple address matching
    const addressLower = address.toLowerCase()
    for (const [key, coords] of Object.entries(mockCoordinates)) {
      if (addressLower.includes(key)) {
        // Add some random variation to make it more realistic
        return {
          lat: coords.lat + (Math.random() - 0.5) * 0.1,
          lng: coords.lng + (Math.random() - 0.5) * 0.1,
        }
      }
    }

    // Default to NYC with random variation
    return {
      lat: 40.7128 + (Math.random() - 0.5) * 0.2,
      lng: -74.006 + (Math.random() - 0.5) * 0.2,
    }
  }

  async batchGeocode(addresses: string[]): Promise<(Coordinates | null)[]> {
    const results = await Promise.all(addresses.map((address) => this.geocodeAddress(address)))
    return results
  }
}
