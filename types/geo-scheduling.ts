export type GeoLocation = {
  address: string
  lat: number
  lng: number
  formatted_address?: string
}

export type GeoCustomer = {
  customer_id: string
  first_name: string
  last_name: string
  email: string
  location: GeoLocation
}

export type GeoBooking = {
  booking_id: string
  customer: GeoCustomer
  services: string[]
  date: string
  start_time: string
  end_time: string
  duration_minutes: number
  assigned_employee_id?: string
  estimated_travel_time?: number
  route_order?: number
  location: GeoLocation
}

export type GeoEmployee = {
  employee_id: string
  name: string
  services: string[]
  working_hours: {
    start: string
    end: string
  }
  service_area_radius: number // miles
  home_base?: GeoLocation
  max_bookings_per_day: number
}

export type RouteOptimization = {
  employee_id: string
  employee_name: string
  bookings: GeoBooking[]
  total_travel_time: number
  total_service_time: number
  total_day_duration: number
  efficiency_score: number
  route_coordinates: GeoLocation[]
}

export type ScheduleOptimizationResult = {
  date: string
  routes: RouteOptimization[]
  unassigned_bookings: GeoBooking[]
  total_efficiency_score: number
  recommendations: string[]
}

export type TravelTimeMatrix = {
  [fromLocationKey: string]: {
    [toLocationKey: string]: {
      duration_minutes: number
      distance_miles: number
      cached_at: string
    }
  }
}
