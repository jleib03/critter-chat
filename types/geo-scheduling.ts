export interface Coordinates {
  lat: number
  lng: number
}

export interface Location {
  address: string
  coordinates: Coordinates
}

export interface GeoBooking {
  id: string
  customerId: string
  customerName: string
  serviceType: string
  startTime: string
  endTime?: string
  duration: number // in minutes
  location: Location
  requiredSkills: string[]
  priority: "low" | "medium" | "high"
  notes?: string
}

export interface GeoEmployee {
  id: string
  name: string
  skills: string[]
  workingHours: {
    start: string // "09:00"
    end: string // "17:00"
  }
  maxBookingsPerDay: number
  homeLocation: Location
  serviceRadius: number // in miles
  vehicleType?: "car" | "van" | "truck"
}

export interface OptimizedRoute {
  employeeId: string
  employeeName: string
  bookings: GeoBooking[]
  totalTravelTime: number // in minutes
  totalServiceTime: number // in minutes
  efficiency: number // percentage (service time / total time)
  estimatedFuelCost?: number
}

export interface RouteOptimizationResult {
  routes: OptimizedRoute[]
  unassignedBookings: GeoBooking[]
  totalEfficiency: number
  recommendations: string[]
}
