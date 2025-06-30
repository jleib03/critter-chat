import type { GeoBooking, GeoEmployee, RouteOptimization, ScheduleOptimizationResult } from "@/types/geo-scheduling"
import type { TravelTimeService } from "./travel-time-service"

export class RouteOptimizationService {
  private travelTimeService: TravelTimeService

  constructor(travelTimeService: TravelTimeService) {
    this.travelTimeService = travelTimeService
  }

  async optimizeScheduleForDate(
    date: string,
    bookings: GeoBooking[],
    employees: GeoEmployee[],
  ): Promise<ScheduleOptimizationResult> {
    if (bookings.length === 0) {
      return {
        date,
        routes: [],
        unassigned_bookings: [],
        total_efficiency_score: 0,
        recommendations: ["No bookings found for this date."],
      }
    }

    if (employees.length === 0) {
      return {
        date,
        routes: [],
        unassigned_bookings: bookings,
        total_efficiency_score: 0,
        recommendations: ["No employees available. Please add employees to optimize routes."],
      }
    }

    const dayBookings = bookings.filter((booking) => booking.date === date)
    const availableEmployees = employees.filter((emp) => this.isEmployeeWorkingOnDate(emp, date))

    console.log(`Optimizing ${dayBookings.length} bookings for ${availableEmployees.length} employees on ${date}`)

    if (availableEmployees.length === 0) {
      return {
        date,
        routes: [],
        unassigned_bookings: dayBookings,
        total_efficiency_score: 0,
        recommendations: ["No employees are working on this date. Please check employee schedules."],
      }
    }

    // Step 1: Group bookings by service compatibility
    const serviceGroups = this.groupBookingsByServices(dayBookings, availableEmployees)

    // Step 2: Optimize routes for each employee
    const routes: RouteOptimization[] = []
    const unassignedBookings: GeoBooking[] = []

    for (const employee of availableEmployees) {
      const compatibleBookings = dayBookings.filter((booking) => this.canEmployeeHandleBooking(employee, booking))

      if (compatibleBookings.length === 0) continue

      const optimizedRoute = await this.optimizeRouteForEmployee(employee, compatibleBookings)

      if (optimizedRoute.bookings.length > 0) {
        routes.push(optimizedRoute)

        // Remove assigned bookings from the pool
        optimizedRoute.bookings.forEach((assignedBooking) => {
          const index = dayBookings.findIndex((b) => b.booking_id === assignedBooking.booking_id)
          if (index > -1) {
            dayBookings.splice(index, 1)
          }
        })
      }
    }

    // Any remaining bookings are unassigned
    unassignedBookings.push(...dayBookings)

    // Calculate overall efficiency
    const totalEfficiencyScore = this.calculateOverallEfficiency(routes)

    // Generate recommendations
    const recommendations = this.generateRecommendations(routes, unassignedBookings)

    return {
      date,
      routes,
      unassigned_bookings: unassignedBookings,
      total_efficiency_score: totalEfficiencyScore,
      recommendations,
    }
  }

  private async optimizeRouteForEmployee(employee: GeoEmployee, bookings: GeoBooking[]): Promise<RouteOptimization> {
    // Filter bookings that fit within employee's working hours and capacity
    const feasibleBookings = this.filterFeasibleBookings(employee, bookings)

    if (feasibleBookings.length === 0) {
      return {
        employee_id: employee.employee_id,
        employee_name: employee.name,
        bookings: [],
        total_travel_time: 0,
        total_service_time: 0,
        total_day_duration: 0,
        efficiency_score: 0,
        route_coordinates: [],
      }
    }

    // Use a simplified version of the Traveling Salesman Problem (TSP)
    const optimizedBookings = await this.solveTSP(employee, feasibleBookings)

    // Calculate route metrics
    const routeMetrics = await this.calculateRouteMetrics(employee, optimizedBookings)

    return {
      employee_id: employee.employee_id,
      employee_name: employee.name,
      bookings: optimizedBookings,
      ...routeMetrics,
      route_coordinates: optimizedBookings.map((b) => b.location),
    }
  }

  private async solveTSP(employee: GeoEmployee, bookings: GeoBooking[]): Promise<GeoBooking[]> {
    if (bookings.length <= 1) return bookings

    // For small numbers of bookings, we can try different permutations
    if (bookings.length <= 6) {
      return await this.bruteForceOptimization(employee, bookings)
    }

    // For larger numbers, use nearest neighbor heuristic
    return await this.nearestNeighborOptimization(employee, bookings)
  }

  private async bruteForceOptimization(employee: GeoEmployee, bookings: GeoBooking[]): Promise<GeoBooking[]> {
    const permutations = this.generatePermutations(bookings)
    let bestRoute = bookings
    let bestTotalTime = Number.POSITIVE_INFINITY

    for (const permutation of permutations) {
      const totalTime = await this.calculateTotalRouteTime(employee, permutation)
      if (totalTime < bestTotalTime) {
        bestTotalTime = totalTime
        bestRoute = permutation
      }
    }

    return bestRoute
  }

  private async nearestNeighborOptimization(employee: GeoEmployee, bookings: GeoBooking[]): Promise<GeoBooking[]> {
    const unvisited = [...bookings]
    const route: GeoBooking[] = []

    // Start with the booking closest to employee's home base (if available)
    let currentLocation = employee.home_base || bookings[0].location

    while (unvisited.length > 0) {
      let nearestBooking = unvisited[0]
      let shortestTime = Number.POSITIVE_INFINITY

      for (const booking of unvisited) {
        const travelTime = await this.travelTimeService.calculateTravelTime(currentLocation, booking.location)
        if (travelTime && travelTime.duration_minutes < shortestTime) {
          shortestTime = travelTime.duration_minutes
          nearestBooking = booking
        }
      }

      route.push(nearestBooking)
      currentLocation = nearestBooking.location
      unvisited.splice(unvisited.indexOf(nearestBooking), 1)
    }

    return route
  }

  private async calculateTotalRouteTime(employee: GeoEmployee, bookings: GeoBooking[]): Promise<number> {
    if (bookings.length === 0) return 0

    let totalTime = 0
    let currentLocation = employee.home_base || bookings[0].location

    for (const booking of bookings) {
      const travelTime = await this.travelTimeService.calculateTravelTime(currentLocation, booking.location)
      totalTime += (travelTime?.duration_minutes || 0) + booking.duration_minutes
      currentLocation = booking.location
    }

    return totalTime
  }

  private async calculateRouteMetrics(employee: GeoEmployee, bookings: GeoBooking[]) {
    let totalTravelTime = 0
    let totalServiceTime = 0
    let currentLocation = employee.home_base || (bookings.length > 0 ? bookings[0].location : null)

    if (!currentLocation || bookings.length === 0) {
      return {
        total_travel_time: 0,
        total_service_time: 0,
        total_day_duration: 0,
        efficiency_score: 0,
      }
    }

    for (const booking of bookings) {
      const travelTime = await this.travelTimeService.calculateTravelTime(currentLocation, booking.location)
      totalTravelTime += travelTime?.duration_minutes || 0
      totalServiceTime += booking.duration_minutes
      currentLocation = booking.location
    }

    const totalDayDuration = totalTravelTime + totalServiceTime
    const efficiencyScore = (totalServiceTime / (totalDayDuration || 1)) * 100 // Percentage of time spent on actual service

    return {
      total_travel_time: totalTravelTime,
      total_service_time: totalServiceTime,
      total_day_duration: totalDayDuration,
      efficiency_score: Math.round(efficiencyScore * 100) / 100,
    }
  }

  private filterFeasibleBookings(employee: GeoEmployee, bookings: GeoBooking[]): GeoBooking[] {
    return bookings
      .filter((booking) => this.canEmployeeHandleBooking(employee, booking))
      .slice(0, employee.max_bookings_per_day) // Respect daily booking limit
  }

  private canEmployeeHandleBooking(employee: GeoEmployee, booking: GeoBooking): boolean {
    // Check if employee can perform the required services
    const canPerformServices = booking.services.every((service) =>
      employee.services.some(
        (empService) =>
          empService.toLowerCase().includes(service.toLowerCase()) ||
          service.toLowerCase().includes(empService.toLowerCase()),
      ),
    )

    // Check if booking time fits within working hours
    const bookingStart = this.timeToMinutes(booking.start_time)
    const bookingEnd = this.timeToMinutes(booking.end_time)
    const workStart = this.timeToMinutes(employee.working_hours.start)
    const workEnd = this.timeToMinutes(employee.working_hours.end)

    const fitsWorkingHours = bookingStart >= workStart && bookingEnd <= workEnd

    return canPerformServices && fitsWorkingHours
  }

  private timeToMinutes(timeStr: string): number {
    try {
      const [hours, minutes] = timeStr.split(":").map(Number)
      if (isNaN(hours) || isNaN(minutes)) {
        console.warn(`Invalid time format: ${timeStr}, defaulting to 9:00`)
        return 9 * 60 // Default to 9:00 AM
      }
      return hours * 60 + minutes
    } catch (error) {
      console.warn(`Error parsing time: ${timeStr}, defaulting to 9:00`)
      return 9 * 60 // Default to 9:00 AM
    }
  }

  private isEmployeeWorkingOnDate(employee: GeoEmployee, date: string): boolean {
    // For now, assume all employees work every day
    // In a real implementation, you'd check employee schedules
    return true
  }

  private groupBookingsByServices(bookings: GeoBooking[], employees: GeoEmployee[]) {
    // Group bookings by required services for better assignment
    const groups: { [serviceKey: string]: GeoBooking[] } = {}

    bookings.forEach((booking) => {
      const serviceKey = booking.services.sort().join(",")
      if (!groups[serviceKey]) {
        groups[serviceKey] = []
      }
      groups[serviceKey].push(booking)
    })

    return groups
  }

  private calculateOverallEfficiency(routes: RouteOptimization[]): number {
    if (routes.length === 0) return 0

    const totalEfficiency = routes.reduce((sum, route) => sum + route.efficiency_score, 0)
    return Math.round((totalEfficiency / routes.length) * 100) / 100
  }

  private generateRecommendations(routes: RouteOptimization[], unassignedBookings: GeoBooking[]): string[] {
    const recommendations: string[] = []

    if (unassignedBookings.length > 0) {
      recommendations.push(
        `${unassignedBookings.length} bookings could not be assigned. Consider hiring additional staff or extending working hours.`,
      )
    }

    const lowEfficiencyRoutes = routes.filter((route) => route.efficiency_score < 60)
    if (lowEfficiencyRoutes.length > 0) {
      recommendations.push(
        `${lowEfficiencyRoutes.length} routes have low efficiency (<60%). Consider clustering bookings by geographic area.`,
      )
    }

    const highTravelTimeRoutes = routes.filter((route) => route.total_travel_time > route.total_service_time)
    if (highTravelTimeRoutes.length > 0) {
      recommendations.push(
        `${highTravelTimeRoutes.length} routes spend more time traveling than servicing. Consider geographic service areas.`,
      )
    }

    if (recommendations.length === 0) {
      recommendations.push("Schedule is well optimized! All routes have good efficiency scores.")
    }

    return recommendations
  }

  private generatePermutations<T>(array: T[]): T[][] {
    if (array.length <= 1) return [array]

    const permutations: T[][] = []
    for (let i = 0; i < array.length; i++) {
      const rest = array.slice(0, i).concat(array.slice(i + 1))
      const restPermutations = this.generatePermutations(rest)
      for (const perm of restPermutations) {
        permutations.push([array[i], ...perm])
      }
    }
    return permutations
  }
}
