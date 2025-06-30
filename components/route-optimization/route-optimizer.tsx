"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Clock, Route, Users, TrendingUp, AlertTriangle, CheckCircle, Navigation } from "lucide-react"
import type { GeoBooking, GeoEmployee, ScheduleOptimizationResult, RouteOptimization } from "@/types/geo-scheduling"
import { RouteOptimizationService } from "@/utils/route-optimization-service"
import { TravelTimeService } from "@/utils/travel-time-service"
import { GeocodingService } from "@/utils/geocoding-service"

type RouteOptimizerProps = {
  bookings: GeoBooking[]
  employees: GeoEmployee[]
  selectedDate: string
  onOptimizationComplete?: (result: ScheduleOptimizationResult) => void
}

export function RouteOptimizer({ bookings, employees, selectedDate, onOptimizationComplete }: RouteOptimizerProps) {
  const [optimizationResult, setOptimizationResult] = useState<ScheduleOptimizationResult | null>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<RouteOptimization | null>(null)

  const optimizeRoutes = async () => {
    setIsOptimizing(true)
    try {
      // Initialize services (in production, you'd get API key from environment)
      const geocodingService = GeocodingService.getInstance("demo-key")
      const travelTimeService = TravelTimeService.getInstance("demo-key")
      const routeOptimizer = new RouteOptimizationService(travelTimeService)

      // Optimize the schedule
      const result = await routeOptimizer.optimizeScheduleForDate(selectedDate, bookings, employees)

      setOptimizationResult(result)
      onOptimizationComplete?.(result)
    } catch (error) {
      console.error("Route optimization failed:", error)
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
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Route className="w-5 h-5" />
                Route Optimization
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Optimize employee routes for {selectedDate} • {bookings.length} bookings • {employees.length} employees
              </p>
            </div>
            <Button
              onClick={optimizeRoutes}
              disabled={isOptimizing || bookings.length === 0}
              className="bg-[#E75837] hover:bg-[#d14a2e]"
            >
              {isOptimizing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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
        </CardHeader>
      </Card>

      {/* Results */}
      {optimizationResult && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="routes">Route Details</TabsTrigger>
            <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
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

            {/* Route Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Route Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {optimizationResult.routes.map((route) => (
                    <div
                      key={route.employee_id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedRoute(route)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#E75837] text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {route.employee_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{route.employee_name}</p>
                          <p className="text-sm text-gray-600">
                            {route.bookings.length} bookings • {formatTime(route.total_day_duration)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getEfficiencyBadgeVariant(route.efficiency_score)}>
                          {route.efficiency_score}% efficient
                        </Badge>
                        <div className="text-sm text-gray-500">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {formatTime(route.total_travel_time)} travel
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="routes" className="space-y-4">
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
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Service Time:</span>
                      <span className="ml-2 font-medium">{formatTime(route.total_service_time)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Travel Time:</span>
                      <span className="ml-2 font-medium">{formatTime(route.total_travel_time)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Duration:</span>
                      <span className="ml-2 font-medium">{formatTime(route.total_day_duration)}</span>
                    </div>
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
                          {booking.estimated_travel_time && (
                            <p className="text-gray-500">+{formatTime(booking.estimated_travel_time)} travel</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="unassigned" className="space-y-4">
            {optimizationResult.unassigned_bookings.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    Unassigned Bookings ({optimizationResult.unassigned_bookings.length})
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    These bookings could not be assigned to any employee due to capacity or skill constraints.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {optimizationResult.unassigned_bookings.map((booking) => (
                      <div
                        key={booking.booking_id}
                        className="flex items-center gap-3 p-3 border rounded-lg bg-orange-50"
                      >
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
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
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All Bookings Assigned!</h3>
                  <p className="text-gray-600">Every booking has been successfully assigned to an employee.</p>
                </CardContent>
              </Card>
            )}
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
  )
}
