"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { GeoBooking, GeoEmployee } from "@/types/geo-scheduling"
import { RouteOptimizationService } from "@/utils/route-optimization-service"
import { TravelTimeService } from "@/utils/travel-time-service"
import { GeocodingService } from "@/utils/geocoding-service"

export function RouteTest() {
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runTest = async () => {
    setIsLoading(true)
    try {
      // Create test data
      const geocodingService = GeocodingService.getInstance("demo-key")

      // Test bookings
      const testBookings: GeoBooking[] = []
      const addresses = ["123 Main St, Austin, TX", "456 Oak Ave, Austin, TX", "789 Pine Rd, Austin, TX"]

      for (let i = 0; i < addresses.length; i++) {
        const location = await geocodingService.geocodeAddress(addresses[i])
        if (location) {
          testBookings.push({
            booking_id: `test_${i}`,
            customer: {
              customer_id: `cust_${i}`,
              first_name: `Customer`,
              last_name: `${i + 1}`,
              email: `customer${i + 1}@test.com`,
              location: location,
            },
            services: ["Grooming"],
            date: "2025-06-30",
            start_time: `${9 + i}:00`,
            end_time: `${10 + i}:00`,
            duration_minutes: 60,
            location: location,
          })
        }
      }

      // Test employees
      const testEmployees: GeoEmployee[] = [
        {
          employee_id: "emp_1",
          name: "Test Employee 1",
          services: ["Grooming", "Nail Trimming"],
          working_hours: { start: "08:00", end: "18:00" },
          service_area_radius: 15,
          max_bookings_per_day: 8,
          home_base: {
            address: "Austin, TX",
            lat: 30.2672,
            lng: -97.7431,
          },
        },
      ]

      // Run optimization
      const travelTimeService = TravelTimeService.getInstance("demo-key")
      const routeOptimizer = new RouteOptimizationService(travelTimeService)

      const optimizationResult = await routeOptimizer.optimizeScheduleForDate("2025-06-30", testBookings, testEmployees)

      setResult(optimizationResult)
    } catch (error) {
      console.error("Test failed:", error)
      setResult({ error: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Route Optimization Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTest} disabled={isLoading}>
          {isLoading ? "Running Test..." : "Test Route Optimization"}
        </Button>

        {result && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Test Result:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
