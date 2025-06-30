export interface Location {
  address: string
  lat: number
  lng: number
}

export interface GeoCustomer {
  customer_id: string
  first_name: string
  last_name: string
  email: string
  location: Location
}

export interface GeoBooking {
  booking_id: string
  customer: GeoCustomer
  services: string[]
  date: string
  start_time: string
  end_time: string
  duration_minutes: number
  location: Location
}

export interface GeoEmployee {
  employee_id: string
  name: string
  services: string[]
  working_hours: {
    start: string
    end: string
  }
  service_area_radius: number // in miles
  max_bookings_per_day: number
  home_base: Location
  current_location?: Location
}

export interface OptimizedRoute {
  employee_id: string
  employee_name: string
  bookings: GeoBooking[]
  total_travel_time: number // in minutes
  total_service_time: number // in minutes
  efficiency_score: number // percentage
  route_coordinates: Location[]
}

export interface ScheduleOptimizationResult {
  date: string
  routes: OptimizedRoute[]
  unassigned_bookings: GeoBooking[]
  total_efficiency_score: number
  total_time_saved?: number
  recommendations: string[]
}

export interface TravelTimeMatrix {
  origins: Location[]
  destinations: Location[]
  durations: number[][] // in minutes
  distances: number[][] // in miles
}
