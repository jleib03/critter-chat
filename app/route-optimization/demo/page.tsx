"use client"

import { useState } from "react"
import { RouteOptimizer } from "@/components/route-optimization/route-optimizer"
import type { GeoBooking, GeoEmployee } from "@/types/geo-scheduling"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

// Sample data for demonstration
const sampleEmployees: GeoEmployee[] = [
  {
    employee_id: "emp1",
    name: "Sarah Johnson",
    services: ["Dog Grooming", "Cat Grooming", "Nail Trimming"],
    working_hours: { start: "08:00", end: "17:00" },
    service_area_radius: 15,
    max_bookings_per_day: 6,
    home_base: {
      address: "123 Main St, Austin, TX",
      lat: 30.2672,
      lng: -97.7431,
    },
  },
  {
    employee_id: "emp2",
    name: "Mike Chen",
    services: ["Dog Walking", "Pet Sitting", "Dog Grooming"],
    working_hours: { start: "09:00", end: "18:00" },
    service_area_radius: 20,
    max_bookings_per_day: 8,
    home_base: {
      address: "456 Oak Ave, Austin, TX",
      lat: 30.3072,
      lng: -97.7531,
    },
  },
  {
    employee_id: "emp3",
    name: "Lisa Rodriguez",
    services: ["Cat Grooming", "Pet Sitting", "Nail Trimming"],
    working_hours: { start: "07:00", end: "16:00" },
    service_area_radius: 12,
    max_bookings_per_day: 5,
    home_base: {
      address: "789 Pine St, Austin, TX",
      lat: 30.2472,
      lng: -97.7631,
    },
  },
]

const sampleBookings: GeoBooking[] = [
  {
    booking_id: "book1",
    customer: {
      customer_id: "cust1",
      first_name: "John",
      last_name: "Smith",
      email: "john@example.com",
      location: {
        address: "1001 Congress Ave, Austin, TX",
        lat: 30.264,
        lng: -97.7469,
      },
    },
    services: ["Dog Grooming"],
    date: "2024-01-15",
    start_time: "09:00",
    end_time: "10:30",
    duration_minutes: 90,
    location: {
      address: "1001 Congress Ave, Austin, TX",
      lat: 30.264,
      lng: -97.7469,
    },
  },
  {
    booking_id: "book2",
    customer: {
      customer_id: "cust2",
      first_name: "Emma",
      last_name: "Davis",
      email: "emma@example.com",
      location: {
        address: "2002 Guadalupe St, Austin, TX",
        lat: 30.2849,
        lng: -97.7341,
      },
    },
    services: ["Cat Grooming", "Nail Trimming"],
    date: "2024-01-15",
    start_time: "11:00",
    end_time: "12:00",
    duration_minutes: 60,
    location: {
      address: "2002 Guadalupe St, Austin, TX",
      lat: 30.2849,
      lng: -97.7341,
    },
  },
  {
    booking_id: "book3",
    customer: {
      customer_id: "cust3",
      first_name: "Robert",
      last_name: "Wilson",
      email: "robert@example.com",
      location: {
        address: "3003 South Lamar, Austin, TX",
        lat: 30.25,
        lng: -97.7667,
      },
    },
    services: ["Dog Walking"],
    date: "2024-01-15",
    start_time: "14:00",
    end_time: "15:00",
    duration_minutes: 60,
    location: {
      address: "3003 South Lamar, Austin, TX",
      lat: 30.25,
      lng: -97.7667,
    },
  },
  {
    booking_id: "book4",
    customer: {
      customer_id: "cust4",
      first_name: "Maria",
      last_name: "Garcia",
      email: "maria@example.com",
      location: {
        address: "4004 East 6th St, Austin, TX",
        lat: 30.2672,
        lng: -97.7261,
      },
    },
    services: ["Pet Sitting"],
    date: "2024-01-15",
    start_time: "10:00",
    end_time: "12:00",
    duration_minutes: 120,
    location: {
      address: "4004 East 6th St, Austin, TX",
      lat: 30.2672,
      lng: -97.7261,
    },
  },
  {
    booking_id: "book5",
    customer: {
      customer_id: "cust5",
      first_name: "David",
      last_name: "Brown",
      email: "david@example.com",
      location: {
        address: "5005 North Loop, Austin, TX",
        lat: 30.3072,
        lng: -97.7431,
      },
    },
    services: ["Dog Grooming"],
    date: "2024-01-15",
    start_time: "13:00",
    end_time: "14:30",
    duration_minutes: 90,
    location: {
      address: "5005 North Loop, Austin, TX",
      lat: 30.3072,
      lng: -97.7431,
    },
  },
]

export default function RouteOptimizationDemo() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date("2024-01-15"))
  const [optimizationResult, setOptimizationResult] = useState(null)

  const dateString = format(selectedDate, "yyyy-MM-dd")

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Route Optimization Demo</h1>
          <p className="text-gray-600">Intelligent scheduling and route optimization for field service teams</p>
        </div>

        {/* Date Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Sample Data Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Sample Employees ({sampleEmployees.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sampleEmployees.map((employee) => (
                  <div key={employee.employee_id} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-gray-600">
                        {employee.services.slice(0, 2).join(", ")}
                        {employee.services.length > 2 && ` +${employee.services.length - 2} more`}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {employee.working_hours.start} - {employee.working_hours.end}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sample Bookings ({sampleBookings.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sampleBookings.map((booking) => (
                  <div key={booking.booking_id} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <p className="font-medium">
                        {booking.customer.first_name} {booking.customer.last_name}
                      </p>
                      <p className="text-sm text-gray-600">{booking.services.join(", ")}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.start_time} - {booking.end_time}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Route Optimizer */}
        <RouteOptimizer
          bookings={sampleBookings}
          employees={sampleEmployees}
          selectedDate={dateString}
          onOptimizationComplete={setOptimizationResult}
        />
      </div>
    </div>
  )
}
