import type {
  GeoBooking,
  GeoEmployee,
  OptimizedRoute,
  ScheduleOptimizationResult,
  Location,
} from "@/types/geo-scheduling"
import { calculateTravelTime } from "./travel-time-service"

export class RouteOptimizationService {
  private travelTimeService: any

  constructor(travelTimeService: any) {
    this.travelTimeService = travelTimeService
  }

  async optimizeScheduleForDate(
    date: string,
    bookings: GeoBooking[],
    employees: GeoEmployee[],
  ): Promise<ScheduleOptimizationResult> {
    console.log(`Optimizing routes for ${date} with ${bookings.length} bookings and ${employees.length} employees`)

    // Filter bookings for the specific date
    const dayBookings = bookings.filter((booking) => booking.date === date)

    // Initialize result
    const routes: OptimizedRoute[] = []
    const unassignedBookings: GeoBooking[] = []

    // Create employee availability map
    const employeeBookings: Map<string, GeoBooking[]> = new Map()
    employees.forEach((emp) => employeeBookings.set(emp.employee_id, []))

    // Assign bookings to employees
    for (const booking of dayBookings) {
      const bestEmployee = await this.findBestEmployeeForBooking(booking, employees, employeeBookings)

      if (bestEmployee) {
        employeeBookings.get(bestEmployee.employee_id)!.push(booking)
      } else {
        unassignedBookings.push(booking)
      }
    }

    // Optimize routes for each employee
    for (const employee of employees) {
      const employeeBookingList = employeeBookings.get(employee.employee_id) || []

      if (employeeBookingList.length > 0) {
        const optimizedRoute = await this.optimizeEmployeeRoute(employee, employeeBookingList)
        routes.push(optimizedRoute)
      }
    }

    // Calculate overall efficiency
    const totalEfficiency = this.calculateOverallEfficiency(routes)

    // Generate recommendations
    const recommendations = this.generateRecommendations(routes, unassignedBookings)

    return {
      date,
      routes,
      unassigned_bookings: unassignedBookings,
      total_efficiency_score: totalEfficiency,
      total_time_saved: this.calculateTimeSaved(routes),
      recommendations,
    }
  }

  private async findBestEmployeeForBooking(
    booking: GeoBooking,
    employees: GeoEmployee[],
    currentAssignments: Map<string, GeoBooking[]>,
  ): Promise<GeoEmployee | null> {
    let bestEmployee: GeoEmployee | null = null
    let bestScore = -1

    for (const employee of employees) {
      // Check if employee can perform the service
      const canPerformService = booking.services.some((service) => employee.services.includes(service))

      if (!canPerformService) continue

      // Check capacity constraints
      const currentBookings = currentAssignments.get(employee.employee_id) || []
      if (currentBookings.length >= employee.max_bookings_per_day) continue

      // Check if booking is within service area
      const distanceToCustomer = await this.calculateDistance(employee.home_base, booking.location)

      if (distanceToCustomer > employee.service_area_radius) continue

      // Calculate score based on proximity and current workload
      const proximityScore = Math.max(0, 100 - distanceToCustomer * 5)
      const workloadScore = Math.max(0, 100 - currentBookings.length * 10)
      const totalScore = (proximityScore + workloadScore) / 2

      if (totalScore > bestScore) {
        bestScore = totalScore
        bestEmployee = employee
      }
    }

    return bestEmployee
  }

  private async optimizeEmployeeRoute(employee: GeoEmployee, bookings: GeoBooking[]): Promise<OptimizedRoute> {
    // Sort bookings by time first
    const sortedBookings = [...bookings].sort((a, b) => a.start_time.localeCompare(b.start_time))

    // For small numbers of bookings, use simple optimization
    // For larger numbers, you might want to implement more sophisticated algorithms
    let optimizedBookings = sortedBookings

    if (bookings.length > 2) {
      optimizedBookings = await this.solveTSP(employee.home_base, sortedBookings)
    }

    // Calculate route metrics
    const totalServiceTime = optimizedBookings.reduce((sum, booking) => sum + booking.duration_minutes, 0)

    const totalTravelTime = await this.calculateRouteTravelTime(employee.home_base, optimizedBookings)

    const efficiencyScore = this.calculateEfficiencyScore(totalServiceTime, totalTravelTime)

    // Generate route coordinates
    const routeCoordinates = [employee.home_base, ...optimizedBookings.map((booking) => booking.location)]

    return {
      employee_id: employee.employee_id,
      employee_name: employee.name,
      bookings: optimizedBookings,
      total_travel_time: totalTravelTime,
      total_service_time: totalServiceTime,
      efficiency_score: efficiencyScore,
      route_coordinates: routeCoordinates,
    }
  }

  private async solveTSP(homeBase: Location, bookings: GeoBooking[]): Promise<GeoBooking[]> {
    // Simple nearest neighbor algorithm for TSP
    // In production, you might want to use more sophisticated algorithms

    if (bookings.length <= 1) return bookings

    const unvisited = [...bookings]
    const route: GeoBooking[] = []
    let currentLocation = homeBase

    while (unvisited.length > 0) {
      let nearestIndex = 0
      let nearestDistance = await this.calculateDistance(currentLocation, unvisited[0].location)

      for (let i = 1; i < unvisited.length; i++) {
        const distance = await this.calculateDistance(currentLocation, unvisited[i].location)
        if (distance < nearestDistance) {
          nearestDistance = distance
          nearestIndex = i
        }
      }

      const nearestBooking = unvisited.splice(nearestIndex, 1)[0]
      route.push(nearestBooking)
      currentLocation = nearestBooking.location
    }

    return route
  }

  private async calculateRouteTravelTime(homeBase: Location, bookings: GeoBooking[]): Promise<number> {
    if (bookings.length === 0) return 0

    let totalTime = 0
    let currentLocation = homeBase

    for (const booking of bookings) {
      const travelTime = await this.travelTimeService.calculateTravelTime(currentLocation, booking.location)
      totalTime += travelTime
      currentLocation = booking.location
    }

    return totalTime
  }

  private async calculateDistance(point1: Location, point2: Location): Promise<number> {
    // Haversine formula
    const R = 3959 // Earth's radius in miles
    const dLat = this.toRadians(point2.lat - point1.lat)
    const dLon = this.toRadians(point2.lng - point1.lng)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.lat)) *
        Math.cos(this.toRadians(point2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  private calculateEfficiencyScore(serviceTime: number, travelTime: number): number {
    if (serviceTime + travelTime === 0) return 0
    const efficiency = (serviceTime / (serviceTime + travelTime)) * 100
    return Math.round(efficiency)
  }

  private calculateOverallEfficiency(routes: OptimizedRoute[]): number {
    if (routes.length === 0) return 0

    const totalEfficiency = routes.reduce((sum, route) => sum + route.efficiency_score, 0)
    return Math.round(totalEfficiency / routes.length)
  }

  private calculateTimeSaved(routes: OptimizedRoute[]): number {
    // Estimate time saved compared to unoptimized routes
    // This is a simplified calculation
    const totalTravelTime = routes.reduce((sum, route) => sum + route.total_travel_time, 0)
    const estimatedUnoptimizedTime = totalTravelTime * 1.3 // Assume 30% more time without optimization
    return Math.round(estimatedUnoptimizedTime - totalTravelTime)
  }

  private generateRecommendations(routes: OptimizedRoute[], unassignedBookings: GeoBooking[]): string[] {
    const recommendations: string[] = []

    // Check for unassigned bookings
    if (unassignedBookings.length > 0) {
      recommendations.push(
        `${unassignedBookings.length} booking(s) could not be assigned. Consider hiring additional staff or expanding service areas.`,
      )
    }

    // Check for low efficiency routes
    const lowEfficiencyRoutes = routes.filter((route) => route.efficiency_score < 60)
    if (lowEfficiencyRoutes.length > 0) {
      recommendations.push(
        `${lowEfficiencyRoutes.length} route(s) have low efficiency. Consider redistributing bookings or adjusting service areas.`,
      )
    }

    // Check for overloaded employees
    const overloadedRoutes = routes.filter((route) => route.bookings.length > 6)
    if (overloadedRoutes.length > 0) {
      recommendations.push(
        `${overloadedRoutes.length} employee(s) have heavy schedules. Consider balancing workload across team members.`,
      )
    }

    // Check for underutilized employees
    const underutilizedRoutes = routes.filter((route) => route.bookings.length < 3)
    if (underutilizedRoutes.length > 0) {
      recommendations.push(
        `${underutilizedRoutes.length} employee(s) have light schedules. Consider assigning additional bookings or adjusting availability.`,
      )
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Routes are well optimized! All employees have balanced schedules with good efficiency scores.",
      )
    }

    return recommendations
  }
}

function canEmployeeHandleBooking(employee: GeoEmployee, booking: GeoBooking): boolean {
  // Check if employee has required skills
  const hasRequiredSkills = booking.requiredSkills.some((skill) => employee.skills.includes(skill))

  if (!hasRequiredSkills) return false

  // Check if booking is within service radius (simplified check)
  // In production, you'd calculate actual distance
  return true
}

async function calculateRouteMetrics(
  employee: GeoEmployee,
  bookings: GeoBooking[],
): Promise<{ totalTravelTime: number; totalServiceTime: number }> {
  let totalTravelTime = 0
  let totalServiceTime = 0

  let currentLocation = employee.homeLocation.coordinates

  for (const booking of bookings) {
    // Add travel time to this booking
    const travelTime = await calculateTravelTime(currentLocation, booking.location.coordinates)
    totalTravelTime += travelTime.duration

    // Add service time
    totalServiceTime += booking.duration

    // Update current location
    currentLocation = booking.location.coordinates
  }

  // Add travel time back to home base
  if (bookings.length > 0) {
    const returnTravelTime = await calculateTravelTime(currentLocation, employee.homeLocation.coordinates)
    totalTravelTime += returnTravelTime.duration
  }

  return { totalTravelTime, totalServiceTime }
}
