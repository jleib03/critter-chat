import type { GeoLocation, TravelTimeMatrix } from "@/types/geo-scheduling"

export class TravelTimeService {
  private static instance: TravelTimeService
  private cache: TravelTimeMatrix = {}
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  static getInstance(apiKey?: string): TravelTimeService {
    if (!TravelTimeService.instance) {
      if (!apiKey) {
        throw new Error("API key required for first initialization")
      }
      TravelTimeService.instance = new TravelTimeService(apiKey)
    }
    return TravelTimeService.instance
  }

  private getLocationKey(location: GeoLocation): string {
    return `${location.lat.toFixed(4)},${location.lng.toFixed(4)}`
  }

  async calculateTravelTime(
    from: GeoLocation,
    to: GeoLocation,
    departureTime?: Date,
  ): Promise<{ duration_minutes: number; distance_miles: number } | null> {
    const fromKey = this.getLocationKey(from)
    const toKey = this.getLocationKey(to)

    // Check cache first
    if (this.cache[fromKey]?.[toKey]) {
      const cached = this.cache[fromKey][toKey]
      // Use cached data if it's less than 1 hour old
      const cacheAge = Date.now() - new Date(cached.cached_at).getTime()
      if (cacheAge < 60 * 60 * 1000) {
        return {
          duration_minutes: cached.duration_minutes,
          distance_miles: cached.distance_miles,
        }
      }
    }

    try {
      // For demo purposes, we'll calculate estimated travel time based on distance
      const result = this.calculateEstimatedTravelTime(from, to)

      // Cache the result
      if (!this.cache[fromKey]) {
        this.cache[fromKey] = {}
      }
      this.cache[fromKey][toKey] = {
        duration_minutes: result.duration_minutes,
        distance_miles: result.distance_miles,
        cached_at: new Date().toISOString(),
      }

      // Real implementation would use Google Maps Distance Matrix API:
      // const response = await fetch(
      //   `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${from.lat},${from.lng}&destinations=${to.lat},${to.lng}&key=${this.apiKey}&departure_time=${departureTime?.getTime() || 'now'}`
      // )
      // const data = await response.json()
      // if (data.rows && data.rows[0].elements && data.rows[0].elements[0].status === 'OK') {
      //   const element = data.rows[0].elements[0]
      //   return {
      //     duration_minutes: Math.ceil(element.duration_in_traffic?.value || element.duration.value) / 60,
      //     distance_miles: element.distance.value * 0.000621371 // meters to miles
      //   }
      // }

      return result
    } catch (error) {
      console.error("Travel time calculation error:", error)
      return null
    }
  }

  private calculateEstimatedTravelTime(
    from: GeoLocation,
    to: GeoLocation,
  ): { duration_minutes: number; distance_miles: number } {
    // Calculate distance using Haversine formula
    const R = 3959 // Earth's radius in miles
    const dLat = this.toRadians(to.lat - from.lat)
    const dLng = this.toRadians(to.lng - from.lng)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(from.lat)) * Math.cos(this.toRadians(to.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance_miles = R * c

    // Estimate travel time based on distance and average speed
    // Assume average speed of 25 mph in urban areas (accounting for traffic, stops, etc.)
    const average_speed_mph = 25
    const duration_minutes = Math.ceil((distance_miles / average_speed_mph) * 60)

    return {
      duration_minutes: Math.max(duration_minutes, 5), // Minimum 5 minutes
      distance_miles: Math.round(distance_miles * 100) / 100, // Round to 2 decimal places
    }
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  async calculateTravelMatrix(
    locations: GeoLocation[],
  ): Promise<{ [fromIndex: number]: { [toIndex: number]: { duration_minutes: number; distance_miles: number } } }> {
    const matrix: { [fromIndex: number]: { [toIndex: number]: { duration_minutes: number; distance_miles: number } } } =
      {}

    for (let i = 0; i < locations.length; i++) {
      matrix[i] = {}
      for (let j = 0; j < locations.length; j++) {
        if (i === j) {
          matrix[i][j] = { duration_minutes: 0, distance_miles: 0 }
        } else {
          const result = await this.calculateTravelTime(locations[i], locations[j])
          matrix[i][j] = result || { duration_minutes: 999, distance_miles: 999 }
        }
      }
    }

    return matrix
  }
}
