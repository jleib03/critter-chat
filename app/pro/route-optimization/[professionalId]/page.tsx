"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  MapPin,
  Route,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Navigation,
  CalendarIcon,
  Loader2,
  ArrowLeft,
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import Header from "@/components/header"
import { RouteMap } from "@/components/route-optimization/route-map"
import type { GeoBooking, GeoEmployee, ScheduleOptimizationResult } from "@/types/geo-scheduling"
import { RouteOptimizationService } from "@/utils/route-optimization-service"
import { TravelTimeService } from "@/utils/travel-time-service"
import { GeocodingService } from "@/utils/geocoding-service"

export default function RouteOptimizationPage() {
  const params = useParams()
  const professionalId = params.professionalId as string

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [bookings, setBookings] = useState<GeoBooking[]>([])
  const [employees, setEmployees] = useState<GeoEmployee[]>([])
  const [optimizationResult, setOptimizationResult] = useState<ScheduleOptimizationResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userTimezone, setUserTimezone] = useState<string>("")

  const WEBHOOK_URL = "https://jleib03.app.n8n.cloud/webhook-test/5671c1dd-48f6-47a9-85ac-4e20cf261520"

  useEffect(() => {
    // Get user's timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    setUserTimezone(timezone)
  }, [])

  useEffect(() => {
    if (userTimezone) {
      loadData()
    }
  }, [professionalId, selectedDate, userTimezone])

  const loadData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Load bookings and employee data from webhook
      const webhookData = await loadWebhookData(format(selectedDate, "yyyy-MM-dd"))

      // Parse the webhook response
      const { geoBookings, geoEmployees } = await parseWebhookResponse(webhookData)

      setBookings(geoBookings)
      setEmployees(geoEmployees)
    } catch (err) {
      console.error("Error loading data:", err)
      setError("Failed to load booking and employee data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getTimezoneInfo = () => {
    const now = new Date()
    const timezone = userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone
    const offsetMinutes = now.getTimezoneOffset()
    const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60)
    const offsetMins = Math.abs(offsetMinutes) % 60
    const offsetSign = offsetMinutes <= 0 ? "+" : "-"

    return {
      timezone: timezone,
      timezone_offset: `${offsetSign}${offsetHours.toString().padStart(2, "0")}:${offsetMins.toString().padStart(2, "0")}`,
      timezone_offset_hours: offsetMinutes <= 0 ? offsetHours : -offsetHours,
      timezone_offset_minutes: offsetMinutes <= 0 ? offsetMins : -offsetMins,
      local_time: now.toISOString(),
      local_date: format(now, "yyyy-MM-dd"),
      local_time_formatted: format(now, "HH:mm:ss"),
    }
  }

  const loadWebhookData = async (date: string) => {
    try {
      const timezoneInfo = getTimezoneInfo()
      const selectedDateInTimezone = new Date(selectedDate)

      const payload = {
        action: "get_bookings_for_route_optimization",
        professional_id: professionalId,
        date: date,
        selected_date: format(selectedDate, "yyyy-MM-dd"),
        selected_date_local: selectedDateInTimezone.toISOString(),
        timestamp: new Date().toISOString(),
        request_type: "route_optimization",
        session_id: `route_opt_${professionalId}_${Date.now()}`,
        user_timezone: timezoneInfo.timezone,
        timezone_offset: timezoneInfo.timezone_offset,
        timezone_offset_hours: timezoneInfo.timezone_offset_hours,
        timezone_offset_minutes: timezoneInfo.timezone_offset_minutes,
        local_time: timezoneInfo.local_time,
        local_date: timezoneInfo.local_date,
        local_time_formatted: timezoneInfo.local_time_formatted,
        browser_info: {
          user_agent: typeof window !== "undefined" ? window.navigator.userAgent : "",
          language: typeof window !== "undefined" ? window.navigator.language : "",
          timezone: timezoneInfo.timezone,
        },
      }

      console.log("Sending route optimization request with timezone info:", payload)

      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Source": "critter-route-optimization",
          "X-User-Timezone": timezoneInfo.timezone,
          "X-Timezone-Offset": timezoneInfo.timezone_offset,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Route optimization response:", data)
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error("Error loading webhook data:", error)
      return []
    }
  }

  const parseWebhookResponse = async (data: any[]) => {
    const geoBookings: GeoBooking[] = []
    const geoEmployees: GeoEmployee[] = []

    // Filter and process different types of data from the webhook response
    for (const item of data) {
      // Check if this is a booking (has booking_id and customer info)
      if (item.booking_id && item.customer_first_name && item.customer_last_name) {
        // Only include bookings for the selected date
        const bookingDate = format(selectedDate, "yyyy-MM-dd")
        if (item.booking_date_formatted === bookingDate) {
          const geoBooking = await convertToGeoBooking(item)
          if (geoBooking) {
            geoBookings.push(geoBooking)
          }
        }
      }
      // Check if this is an employee (has first_name, last_name, email)
      else if (item.first_name && item.last_name && item.email && !item.professional_id) {
        const geoEmployee = convertToGeoEmployee(item)
        if (geoEmployee) {
          geoEmployees.push(geoEmployee)
        }
      }
    }

    console.log(`Parsed ${geoBookings.length} bookings and ${geoEmployees.length} employees`)
    return { geoBookings, geoEmployees }
  }

  const convertToGeoBooking = async (booking: any): Promise<GeoBooking | null> => {
    // For demo purposes, we'll use placeholder addresses since the webhook doesn't include customer addresses
    // In a real implementation, you'd need to fetch customer addresses from your database
    const demoAddresses = [
      "123 Main St, Austin, TX 78701",
      "456 Oak Ave, Austin, TX 78702",
      "789 Pine Rd, Austin, TX 78703",
      "321 Elm St, Austin, TX 78704",
      "654 Cedar Ln, Austin, TX 78705",
      "987 Maple Dr, Austin, TX 78706",
      "147 Birch Way, Austin, TX 78707",
      "258 Willow St, Austin, TX 78708",
    ]

    // Use customer ID to consistently assign the same address to the same customer
    const customerIndex = booking.customer_id
      ? Number.parseInt(booking.customer_id) % demoAddresses.length
      : Math.floor(Math.random() * demoAddresses.length)

    const customerAddress = demoAddresses[customerIndex]

    try {
      const geocodingService = GeocodingService.getInstance("demo-key")
      const location = await geocodingService.geocodeAddress(customerAddress)

      if (!location) return null

      // Parse start and end times more robustly
      let startTime = "09:00"
      let endTime = "10:00"

      if (booking.start_formatted) {
        const timeMatch = booking.start_formatted.match(/(\d{1,2}:\d{2})/)
        if (timeMatch) {
          startTime = timeMatch[1]
        }
      }

      if (booking.end_formatted) {
        const timeMatch = booking.end_formatted.match(/(\d{1,2}:\d{2})/)
        if (timeMatch) {
          endTime = timeMatch[1]
        }
      }

      // Calculate duration more safely
      const startDate = new Date(`2000-01-01T${startTime}:00`)
      const endDate = new Date(`2000-01-01T${endTime}:00`)
      let durationMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60)

      // Default to 60 minutes if calculation fails
      if (isNaN(durationMinutes) || durationMinutes <= 0) {
        durationMinutes = 60
      }

      return {
        booking_id: booking.booking_id,
        customer: {
          customer_id: booking.customer_id || "unknown",
          first_name: booking.customer_first_name,
          last_name: booking.customer_last_name,
          email: booking.customer_email || "",
          location: location,
        },
        services: ["Grooming"], // Default service since not specified in webhook
        date: format(selectedDate, "yyyy-MM-dd"),
        start_time: startTime,
        end_time: endTime,
        duration_minutes: durationMinutes,
        location: location,
      }
    } catch (error) {
      console.error("Error converting booking:", error)
      return null
    }
  }

  const convertToGeoEmployee = (employee: any): GeoEmployee => {
    return {
      employee_id: `emp_${employee.first_name}_${employee.last_name}`.replace(/\s+/g, "_"),
      name: `${employee.first_name} ${employee.last_name}`,
      services: ["Grooming", "Nail Trimming", "Ear Cleaning"], // Default services
      working_hours: {
        start: "08:00",
        end: "18:00",
      },
      service_area_radius: 15, // Default 15 mile radius
      max_bookings_per_day: 8, // Default max bookings
      home_base: {
        address: "Austin, TX", // Default location
        lat: 30.2672 + (Math.random() * 0.1 - 0.05), // Random location near Austin
        lng: -97.7431 + (Math.random() * 0.1 - 0.05),
      },
    }
  }

  const optimizeRoutes = async () => {
    if (bookings.length === 0 || employees.length === 0) {
      setError("No bookings or employees available for optimization")
      return
    }

    setIsOptimizing(true)
    setError(null)

    try {
      const travelTimeService = TravelTimeService.getInstance("demo-key")
      const routeOptimizer = new RouteOptimizationService(travelTimeService)

      const result = await routeOptimizer.optimizeScheduleForDate(
        format(selectedDate, "yyyy-MM-dd"),
        bookings,
        employees,
      )

      setOptimizationResult(result)
    } catch (err) {
      console.error("Route optimization failed:", err)
      setError("Route optimization failed. Please try again.")
    } finally {
      setIsOptimizing(false)
    }
  }

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getEfficiencyColor = (score: number): string => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getEfficiencyBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "destructive"
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3]">
      <Header />

      <main className="pt-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Link
                href="/pro/set-up"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Setup
              </Link>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Route Optimization</h1>
                <p className="text-gray-600">
                  Professional ID: {professionalId} • Optimize employee routes for maximum efficiency
                  {userTimezone && <span className="ml-2 text-sm text-gray-500">• Timezone: {userTimezone}</span>}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[240px] justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(selectedDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Button
                  onClick={optimizeRoutes}
                  disabled={isOptimizing || isLoading || bookings.length === 0}
                  className="bg-[#16A085] hover:bg-[#138f7a]"
                >
                  {isOptimizing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4 mr-2" />
                      Optimize Routes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <Card>
              <CardContent className="p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#16A085]" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Data</h3>
                <p className="text-gray-600">Fetching bookings and employee information...</p>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <h3 className="font-medium text-red-800">Error</h3>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Summary */}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <CalendarIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Bookings for {format(selectedDate, "MMM d")}</p>
                      <p className="text-2xl font-bold">{bookings.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Available Employees</p>
                      <p className="text-2xl font-bold">{employees.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Route className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Optimization Status</p>
                      <p className="text-lg font-medium">{optimizationResult ? "Complete" : "Ready to Optimize"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results */}
          {optimizationResult && (
            <Tabs defaultValue="map" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="map">Route Map</TabsTrigger>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Route Details</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="map" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Route Visualization
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Interactive map showing optimized employee routes and customer locations
                    </p>
                  </CardHeader>
                  <CardContent>
                    <RouteMap routes={optimizationResult.routes} />
                  </CardContent>
                </Card>

                {/* Route Assignment Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Route Assignments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3 font-medium">Employee</th>
                            <th className="text-left p-3 font-medium">Bookings</th>
                            <th className="text-left p-3 font-medium">Service Time</th>
                            <th className="text-left p-3 font-medium">Travel Time</th>
                            <th className="text-left p-3 font-medium">Efficiency</th>
                            <th className="text-left p-3 font-medium">Route</th>
                          </tr>
                        </thead>
                        <tbody>
                          {optimizationResult.routes.map((route, index) => (
                            <tr key={route.employee_id} className="border-b hover:bg-gray-50">
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: ["#E75837", "#16A085", "#745E25", "#94ABD6"][index % 4] }}
                                  />
                                  <span className="font-medium">{route.employee_name}</span>
                                </div>
                              </td>
                              <td className="p-3">{route.bookings.length}</td>
                              <td className="p-3">{formatTime(route.total_service_time)}</td>
                              <td className="p-3">{formatTime(route.total_travel_time)}</td>
                              <td className="p-3">
                                <Badge variant={getEfficiencyBadgeVariant(route.efficiency_score)}>
                                  {route.efficiency_score}%
                                </Badge>
                              </td>
                              <td className="p-3">
                                <div className="text-sm text-gray-600">
                                  {route.bookings.map((booking, i) => (
                                    <div key={booking.booking_id}>
                                      {i + 1}. {booking.customer.first_name} {booking.customer.last_name} (
                                      {booking.start_time})
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="overview" className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Active Routes</p>
                          <p className="text-2xl font-bold">{optimizationResult.routes.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-600">Assigned Bookings</p>
                          <p className="text-2xl font-bold">
                            {optimizationResult.routes.reduce((sum, route) => sum + route.bookings.length, 0)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        <div>
                          <p className="text-sm text-gray-600">Unassigned</p>
                          <p className="text-2xl font-bold">{optimizationResult.unassigned_bookings.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp
                          className={`w-4 h-4 ${getEfficiencyColor(optimizationResult.total_efficiency_score)}`}
                        />
                        <div>
                          <p className="text-sm text-gray-600">Efficiency Score</p>
                          <p
                            className={`text-2xl font-bold ${getEfficiencyColor(optimizationResult.total_efficiency_score)}`}
                          >
                            {optimizationResult.total_efficiency_score}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                {optimizationResult.routes.map((route) => (
                  <Card key={route.employee_id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[#E75837] text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {route.employee_name.charAt(0)}
                          </div>
                          {route.employee_name}
                        </CardTitle>
                        <Badge variant={getEfficiencyBadgeVariant(route.efficiency_score)}>
                          {route.efficiency_score}% efficient
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {route.bookings.map((booking, index) => (
                          <div key={booking.booking_id} className="flex items-center gap-3 p-3 border rounded-lg">
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </div>
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <div className="flex-1">
                              <p className="font-medium">
                                {booking.customer.first_name} {booking.customer.last_name}
                              </p>
                              <p className="text-sm text-gray-600">{booking.location.address}</p>
                              <p className="text-sm text-gray-500">
                                {booking.services.join(", ")} • {formatTime(booking.duration_minutes)}
                              </p>
                            </div>
                            <div className="text-right text-sm">
                              <p className="font-medium">
                                {booking.start_time} - {booking.end_time}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Optimization Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {optimizationResult.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                          <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5" />
                          <p className="text-sm">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  )
}
