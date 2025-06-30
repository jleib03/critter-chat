"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, Users, Route, TrendingUp, AlertCircle, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import RouteMap from "@/components/route-optimization/route-map"
import type { GeoBooking, GeoEmployee, OptimizedRoute } from "@/types/geo-scheduling"
import { geocodeAddress } from "@/utils/geocoding-service"
import { optimizeRoutes } from "@/utils/route-optimization-service"

export default function RouteOptimizationPage() {
  const params = useParams()
  const professionalId = params.professionalId as string

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bookings, setBookings] = useState<GeoBooking[]>([])
  const [employees, setEmployees] = useState<GeoEmployee[]>([])
  const [optimizedRoutes, setOptimizedRoutes] = useState<OptimizedRoute[]>([])
  const [hasOptimized, setHasOptimized] = useState(false)

  const WEBHOOK_URL = "https://jleib03.app.n8n.cloud/webhook-test/5671c1dd-48f6-47a9-85ac-4e20cf261520"

  const loadBookingsAndEmployees = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("🚀 Loading bookings and employees for route optimization...")

      const sessionId = `route_opt_${professionalId}_${Date.now()}`

      // Load bookings for the selected date
      const bookingsPayload = {
        action: "get_bookings_for_route_optimization",
        professional_id: professionalId,
        date: selectedDate,
        timestamp: new Date().toISOString(),
        request_type: "route_optimization",
        session_id: sessionId,
      }

      console.log("📤 Sending bookings request:", bookingsPayload)

      const bookingsResponse = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Source": "critter-route-optimization",
        },
        body: JSON.stringify(bookingsPayload),
      })

      if (!bookingsResponse.ok) {
        throw new Error(`Failed to load bookings: ${bookingsResponse.status}`)
      }

      const bookingsData = await bookingsResponse.json()
      console.log("📥 Received bookings data:", bookingsData)

      // Load employee configuration
      const employeesPayload = {
        action: "get_employees_for_route_optimization",
        professional_id: professionalId,
        timestamp: new Date().toISOString(),
        request_type: "route_optimization",
        session_id: sessionId,
      }

      console.log("📤 Sending employees request:", employeesPayload)

      const employeesResponse = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Source": "critter-route-optimization",
        },
        body: JSON.stringify(employeesPayload),
      })

      if (!employeesResponse.ok) {
        throw new Error(`Failed to load employees: ${employeesResponse.status}`)
      }

      const employeesData = await employeesResponse.json()
      console.log("📥 Received employees data:", employeesData)

      // Process and geocode the data
      await processBookingsAndEmployees(bookingsData, employeesData)
    } catch (error) {
      console.error("❌ Error loading data:", error)
      setError(error instanceof Error ? error.message : "Failed to load data")
    } finally {
      setIsLoading(false)
    }
  }

  const processBookingsAndEmployees = async (bookingsData: any, employeesData: any) => {
    try {
      // Process bookings - convert to GeoBooking format
      const processedBookings: GeoBooking[] = []

      if (Array.isArray(bookingsData)) {
        for (const booking of bookingsData) {
          try {
            const coordinates = await geocodeAddress(booking.customer_address || booking.address)
            processedBookings.push({
              id: booking.id || booking.booking_id,
              customerId: booking.customer_id,
              customerName: booking.customer_name || booking.name,
              serviceType: booking.service_type || booking.service,
              startTime: booking.start_time || booking.time,
              endTime: booking.end_time,
              duration: booking.duration || 60,
              location: {
                address: booking.customer_address || booking.address,
                coordinates: coordinates,
              },
              requiredSkills: booking.required_skills || [booking.service_type || booking.service],
              priority: booking.priority || "medium",
              notes: booking.notes,
            })
          } catch (geocodeError) {
            console.warn(`Failed to geocode address for booking ${booking.id}:`, geocodeError)
            // Still add booking with default coordinates
            processedBookings.push({
              id: booking.id || booking.booking_id,
              customerId: booking.customer_id,
              customerName: booking.customer_name || booking.name,
              serviceType: booking.service_type || booking.service,
              startTime: booking.start_time || booking.time,
              endTime: booking.end_time,
              duration: booking.duration || 60,
              location: {
                address: booking.customer_address || booking.address,
                coordinates: { lat: 40.7128, lng: -74.006 }, // Default NYC coordinates
              },
              requiredSkills: booking.required_skills || [booking.service_type || booking.service],
              priority: booking.priority || "medium",
              notes: booking.notes,
            })
          }
        }
      }

      // Process employees - convert to GeoEmployee format
      const processedEmployees: GeoEmployee[] = []

      if (Array.isArray(employeesData)) {
        for (const employee of employeesData) {
          try {
            const homeCoordinates = await geocodeAddress(employee.home_address || employee.address || "New York, NY")
            processedEmployees.push({
              id: employee.id || employee.employee_id,
              name: employee.name,
              skills: employee.skills || employee.services || [],
              workingHours: {
                start: employee.start_time || "09:00",
                end: employee.end_time || "17:00",
              },
              maxBookingsPerDay: employee.max_bookings || employee.capacity || 8,
              homeLocation: {
                address: employee.home_address || employee.address || "New York, NY",
                coordinates: homeCoordinates,
              },
              serviceRadius: employee.service_radius || 25,
              vehicleType: employee.vehicle_type || "car",
            })
          } catch (geocodeError) {
            console.warn(`Failed to geocode address for employee ${employee.id}:`, geocodeError)
            // Still add employee with default coordinates
            processedEmployees.push({
              id: employee.id || employee.employee_id,
              name: employee.name,
              skills: employee.skills || employee.services || [],
              workingHours: {
                start: employee.start_time || "09:00",
                end: employee.end_time || "17:00",
              },
              maxBookingsPerDay: employee.max_bookings || employee.capacity || 8,
              homeLocation: {
                address: employee.home_address || employee.address || "New York, NY",
                coordinates: { lat: 40.7128, lng: -74.006 },
              },
              serviceRadius: employee.service_radius || 25,
              vehicleType: employee.vehicle_type || "car",
            })
          }
        }
      }

      console.log("✅ Processed bookings:", processedBookings)
      console.log("✅ Processed employees:", processedEmployees)

      setBookings(processedBookings)
      setEmployees(processedEmployees)
    } catch (error) {
      console.error("❌ Error processing data:", error)
      throw error
    }
  }

  const handleOptimizeRoutes = async () => {
    if (bookings.length === 0 || employees.length === 0) {
      setError("No bookings or employees found for optimization")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log("🔄 Optimizing routes...")
      const routes = await optimizeRoutes(bookings, employees)
      console.log("✅ Optimization complete:", routes)

      setOptimizedRoutes(routes)
      setHasOptimized(true)
    } catch (error) {
      console.error("❌ Optimization error:", error)
      setError(error instanceof Error ? error.message : "Failed to optimize routes")
    } finally {
      setIsLoading(false)
    }
  }

  const totalBookings = bookings.length
  const totalEmployees = employees.length
  const averageEfficiency =
    optimizedRoutes.length > 0
      ? Math.round(optimizedRoutes.reduce((sum, route) => sum + route.efficiency, 0) / optimizedRoutes.length)
      : 0

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Route className="w-6 h-6 text-white" />
                </div>
                Route Optimization
              </h1>
              <p className="text-gray-600 mt-2">Intelligent route planning for maximum efficiency</p>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1">
              Professional ID: <code className="ml-1 font-mono">{professionalId}</code>
            </Badge>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Route Optimization Active</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Optimization Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="date">Select Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={loadBookingsAndEmployees} disabled={isLoading} variant="outline">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      Load Data
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleOptimizeRoutes}
                  disabled={isLoading || bookings.length === 0 || employees.length === 0}
                  className="bg-[#16A085] hover:bg-[#138f7a]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Route className="w-4 h-4 mr-2" />
                      Optimize Routes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Error: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{totalEmployees}</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Optimized Routes</p>
                  <p className="text-2xl font-bold text-gray-900">{optimizedRoutes.length}</p>
                </div>
                <Route className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Efficiency</p>
                  <p className="text-2xl font-bold text-gray-900">{averageEfficiency}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        {hasOptimized && optimizedRoutes.length > 0 ? (
          <Tabs defaultValue="map" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="map">Route Map</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Route Details</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="map">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Optimized Route Map
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RouteMap routes={optimizedRoutes} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Route Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {optimizedRoutes.map((route) => (
                        <div
                          key={route.employeeId}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{route.employeeName}</p>
                            <p className="text-sm text-gray-600">{route.bookings.length} bookings</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{route.efficiency}% efficient</p>
                            <p className="text-sm text-gray-600">{Math.round(route.totalTravelTime)} min travel</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Efficiency Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Service Time:</span>
                        <span className="font-medium">
                          {Math.round(optimizedRoutes.reduce((sum, route) => sum + route.totalServiceTime, 0))} min
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Travel Time:</span>
                        <span className="font-medium">
                          {Math.round(optimizedRoutes.reduce((sum, route) => sum + route.totalTravelTime, 0))} min
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Efficiency:</span>
                        <span className="font-medium">{averageEfficiency}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="details">
              <div className="space-y-6">
                {optimizedRoutes.map((route) => (
                  <Card key={route.employeeId}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{route.employeeName}</span>
                        <Badge variant="outline">{route.efficiency}% Efficient</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {route.bookings.map((booking, index) => (
                          <div key={booking.id} className="flex items-center gap-4 p-3 border rounded-lg">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{booking.customerName}</p>
                              <p className="text-sm text-gray-600">{booking.serviceType}</p>
                              <p className="text-sm text-gray-500">{booking.location.address}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{booking.startTime}</p>
                              <p className="text-sm text-gray-600">{booking.duration} min</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recommendations">
              <Card>
                <CardHeader>
                  <CardTitle>Optimization Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">✅ Well Optimized</h4>
                      <p className="text-sm text-green-700">
                        Routes with efficiency above 75% are well optimized and should maintain good profitability.
                      </p>
                    </div>

                    {optimizedRoutes.some((route) => route.efficiency < 60) && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="font-medium text-yellow-800 mb-2">⚠️ Consider Adjustments</h4>
                        <p className="text-sm text-yellow-700">
                          Some routes have low efficiency. Consider adjusting service areas or employee assignments.
                        </p>
                      </div>
                    )}

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">💡 Optimization Tips</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Group bookings by geographic area when possible</li>
                        <li>• Consider employee skill specialization for better efficiency</li>
                        <li>• Schedule high-priority bookings during optimal travel times</li>
                        <li>• Review service areas to minimize travel distances</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Route className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Optimize Routes</h3>
                <p className="text-gray-600 mb-4">
                  Select a date and load your bookings and employee data to get started with route optimization.
                </p>
                <Button
                  onClick={loadBookingsAndEmployees}
                  disabled={isLoading}
                  className="bg-[#16A085] hover:bg-[#138f7a]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading Data...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      Load Data & Get Started
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
