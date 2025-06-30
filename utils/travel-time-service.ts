import type { Location, TravelTimeMatrix } from "@/types/geo-scheduling"
import type { Coordinates } from "@/types/geo-scheduling"

export interface TravelTimeResult {
  duration: number // in minutes
  distance: number // in miles
}

export class TravelTimeService {
  private static instance: TravelTimeService
  private apiKey: string
  private cache: Map<string, TravelTimeResult> = new Map()

  private constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  public static getInstance(apiKey: string): TravelTimeService {
    if (!TravelTimeService.instance) {
      TravelTimeService.instance = new TravelTimeService(apiKey)
    }
    return TravelTimeService.instance
  }

  async calculateTravelTime(
    origin: Coordinates,
    destination: Coordinates,
    departureTime?: Date,
  ): Promise<TravelTimeResult | null> {
    // Create cache key
    const cacheKey = `${origin.lat},${origin.lng}-${destination.lat},${destination.lng}`

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    try {
      // Calculate straight-line distance first
      const distance = this.calculateHaversineDistance(origin, destination)

      // For demo purposes, estimate travel time based on distance
      // In production, you would use Google Maps Distance Matrix API
      const mockResult = this.getMockTravelTime(distance)

      this.cache.set(cacheKey, mockResult)
      return mockResult

      // Production Google Maps API call would look like:
      // const response = await fetch(
      //   `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&key=${this.apiKey}&departure_time=${departureTime?.getTime() || 'now'}`
      // )
      // const data = await response.json()
      // if (data.rows && data.rows[0] && data.rows[0].elements && data.rows[0].elements[0]) {
      //   const element = data.rows[0].elements[0]
      //   if (element.status === 'OK') {
      //     const result: TravelTimeResult = {
      //       duration: Math.ceil(element.duration.value / 60),
      //       distance: Math.round(element.distance.value * 0.000621371 * 100) / 100,
      //     }
      //     this.cache.set(cacheKey, result)
      //     return result
      //   }
      // }
    } catch (error) {
      console.error("Travel time calculation error:", error)
      return null
    }
  }

  async calculateTravelTimeMatrix(origins: Location[], destinations: Location[]): Promise<TravelTimeMatrix> {
    const matrix: TravelTimeResult[][] = []

    for (const origin of origins) {
      const row: TravelTimeResult[] = []
      for (const destination of destinations) {
        const result = await this.calculateTravelTime(origin, destination)
        if (result) {
          row.push(result)
        }
      }
      matrix.push(row)
    }

    return {
      origins,
      destinations,
      matrix,
    }
  }

  private calculateHaversineDistance(point1: Coordinates, point2: Coordinates): number {
    const R = 3959 // Earth's radius in miles
    const dLat = this.toRadians(point2.lat - point1.lat)
    const dLng = this.toRadians(point2.lng - point1.lng)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.lat)) *
        Math.cos(this.toRadians(point2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private estimateTravelTime(distanceInMiles: number): number {
    // Estimate travel time based on distance
    // Assumes average speed of 25 mph in urban areas
    const averageSpeed = 25 // mph
    const timeInHours = distanceInMiles / averageSpeed
    const timeInMinutes = Math.round(timeInHours * 60)

    // Add buffer time for stops, traffic, etc.
    const bufferTime = Math.max(5, Math.round(timeInMinutes * 0.2))

    return Math.max(5, timeInMinutes + bufferTime) // Minimum 5 minutes
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  private getMockTravelTime(distanceMiles: number): TravelTimeResult {
    // Estimate travel time based on distance
    // Assume average speed of 25 mph in city (accounting for traffic, stops, etc.)
    const baseMinutes = Math.ceil((distanceMiles / 25) * 60)

    // Add some randomness for realism (±20%)
    const variance = 0.2
    const randomFactor = 1 + (Math.random() * variance * 2 - variance)
    const adjustedMinutes = Math.max(1, Math.ceil(baseMinutes * randomFactor))

    // Add traffic delay for longer distances
    const trafficDelay = distanceMiles > 5 ? Math.ceil(distanceMiles * 0.5) : 0

    return {
      duration: adjustedMinutes,
      distance: Math.round(distanceMiles * 100) / 100,
    }
  }

  clearCache(): void {
    this.cache.clear()
  }
}
