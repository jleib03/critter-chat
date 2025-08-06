"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Trash2, PlusCircle, ChevronDown, ChevronUp, Loader2, Save, Settings, Users, Clock, Ban } from 'lucide-react'
import { getWebhookEndpoint, logWebhookUsage } from "@/types/webhook-endpoints"
import Header from "../../../../components/header"
import type { ProfessionalConfig, Employee, WorkingDay, CapacityRules, BlockedTime, BookingPreferences } from "@/types/professional-config"

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2)
  const minutes = i % 2 === 0 ? "00" : "30"
  const hour12 = hours % 12 === 0 ? 12 : hours % 12
  const period = hours >= 12 ? "PM" : "AM"
  return `${hour12}:${minutes} ${period}`
})

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

export default function ProfessionalScheduleSetup() {
  const params = useParams()
  const professionalId = params.professionalId as string

  const [config, setConfig] = useState<ProfessionalConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeSections, setActiveSections] = useState({
    bookingPrefs: true,
    employees: false,
    capacity: false,
    blockedTimes: false,
  })

  const toggleSection = (section: keyof typeof activeSections) => {
    setActiveSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const initializeDefaultConfig = useCallback(() => {
    return {
      professionalId: professionalId,
      businessName: "My Pet Service",
      employees: [],
      capacityRules: {
        maxConcurrentBookings: 1,
        bufferTimeBetweenBookings: 15,
        maxBookingsPerDay: 10,
        allowOverlapping: false,
        requireAllEmployeesForService: false,
      },
      blockedTimes: [],
      bookingPreferences: {
        business_name: "My Pet Service",
        booking_system: "direct_booking",
        allow_direct_booking: true,
        require_approval: false,
        online_booking_enabled: true,
        show_prices: true,
      },
      lastUpdated: new Date().toISOString(),
    }
  }, [professionalId])

  const loadConfiguration = useCallback(async () => {
    if (!professionalId) return
    setIsLoading(true)
    setError(null)
    try {
      const webhookUrl = getWebhookEndpoint("PROFESSIONAL_CONFIG")
      logWebhookUsage("PROFESSIONAL_CONFIG", "get_professional_config")

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "get_professional_config",
          professional_id: professionalId,
        }),
      })

      if (!response.ok) {
        if (response.status === 404) {
          // If not found, initialize with a default config
          console.log(`No config found for professional ID ${professionalId}. Initializing default config.`)
          setConfig(initializeDefaultConfig())
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Loaded config data:", data)

      const configData = Array.isArray(data) && data.length > 0 ? data[0] : data
      
      if (!configData || Object.keys(configData).length === 0) {
        console.log(`Empty config received for professional ID ${professionalId}. Initializing default config.`)
        setConfig(initializeDefaultConfig())
        return
      }

      const mappedConfig: ProfessionalConfig = {
        professionalId: configData.professional_id || professionalId,
        businessName: configData.business_name || "My Pet Service",
        employees:
          configData.employees?.map((emp: any) => ({
            id: emp.employee_id,
            name: emp.name,
            role: emp.role,
            email: emp.email,
            isActive: emp.is_active,
            workingDays:
              emp.working_days?.map((wd: any) => ({
                day: wd.day,
                start: wd.start_time,
                end: wd.end_time,
                isWorking: wd.is_working,
              })) || daysOfWeek.map(day => ({ day, start: '09:00 AM', end: '05:00 PM', isWorking: !['Saturday', 'Sunday'].includes(day) })),
            services: emp.services || [],
          })) || [],
        capacityRules: {
          maxConcurrentBookings: configData.capacity_rules?.max_concurrent_bookings || 1,
          bufferTimeBetweenBookings: configData.capacity_rules?.buffer_time_between_bookings || 0,
          maxBookingsPerDay: configData.capacity_rules?.max_bookings_per_day || 10,
          allowOverlapping: configData.capacity_rules?.allow_overlapping || false,
          requireAllEmployeesForService: configData.capacity_rules?.require_all_employees_for_service || false,
        },
        blockedTimes:
          configData.blocked_times?.map((bt: any) => ({
            id: bt.blocked_time_id,
            date: bt.blocked_date,
            startTime: bt.start_time,
            endTime: bt.end_time,
            reason: bt.reason,
            employeeId: bt.employee_id,
            isRecurring: bt.is_recurring,
            recurrencePattern: bt.recurrence_pattern,
            isAllDay: bt.is_all_day,
          })) || [],
        bookingPreferences: {
          business_name: configData.booking_preferences?.business_name || "My Pet Service",
          booking_system: configData.booking_preferences?.booking_system || "direct_booking",
          allow_direct_booking: configData.booking_preferences?.allow_direct_booking ?? true,
          require_approval: configData.booking_preferences?.require_approval ?? false,
          online_booking_enabled: configData.booking_preferences?.online_booking_enabled ?? true,
          show_prices: configData.booking_preferences?.show_prices ?? true,
        },
        lastUpdated: new Date().toISOString(),
      }
      setConfig(mappedConfig)
    } catch (err) {
      console.error("Failed to load configuration:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred.")
      setConfig(initializeDefaultConfig())
    } finally {
      setIsLoading(false)
    }
  }, [professionalId, initializeDefaultConfig])

  useEffect(() => {
    loadConfiguration()
  }, [loadConfiguration])

  const handleBookingPrefChange = (field: keyof BookingPreferences, value: any) => {
    setConfig((prev) =>
      prev ? { ...prev, bookingPreferences: { ...prev.bookingPreferences, [field]: value } } : null
    )
  }

  const handleEmployeeChange = (employeeId: string, field: keyof Employee, value: any) => {
    setConfig((prev) =>
      prev ? { ...prev, employees: prev.employees.map((emp) => emp.id === employeeId ? { ...emp, [field]: value } : emp) } : null
    )
  }

  const handleWorkingDayChange = (employeeId: string, day: string, field: keyof WorkingDay, value: any) => {
    setConfig((prev) =>
      prev ? {
        ...prev,
        employees: prev.employees.map((emp) =>
          emp.id === employeeId ? {
            ...emp,
            workingDays: emp.workingDays.map((wd) => wd.day === day ? { ...wd, [field]: value } : wd),
          } : emp
        ),
      } : null
    )
  }

  const addEmployee = () => {
    const newEmployee: Employee = {
      id: `emp_${Date.now()}`,
      name: "New Employee",
      role: "Groomer",
      email: "",
      isActive: true,
      workingDays: daysOfWeek.map((day) => ({
        day,
        start: "09:00 AM",
        end: "05:00 PM",
        isWorking: day !== "Saturday" && day !== "Sunday",
      })),
      services: [],
    }
    setConfig((prev) =>
      prev ? { ...prev, employees: [...prev.employees, newEmployee] } : null
    )
  }

  const removeEmployee = (employeeId: string) => {
    setConfig((prev) =>
      prev ? { ...prev, employees: prev.employees.filter((emp) => emp.id !== employeeId) } : null
    )
  }

  const handleCapacityRuleChange = (field: keyof CapacityRules, value: any) => {
    setConfig((prev) =>
      prev ? { ...prev, capacityRules: { ...prev.capacityRules, [field]: value } } : null
    )
  }

  const addBlockedTime = () => {
    const newBlockedTime: BlockedTime = {
      id: `bt_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      startTime: "12:00 PM",
      endTime: "01:00 PM",
      reason: "Lunch Break",
      isRecurring: false,
      isAllDay: false,
    }
    setConfig((prev) =>
      prev ? { ...prev, blockedTimes: [...prev.blockedTimes, newBlockedTime] } : null
    )
  }

  const removeBlockedTime = (blockedTimeId: string) => {
    setConfig((prev) =>
      prev ? { ...prev, blockedTimes: prev.blockedTimes.filter((bt) => bt.id !== blockedTimeId) } : null
    )
  }

  const handleBlockedTimeChange = (blockedTimeId: string, field: keyof BlockedTime, value: any) => {
    setConfig((prev) =>
      prev ? { ...prev, blockedTimes: prev.blockedTimes.map((bt) => bt.id === blockedTimeId ? { ...bt, [field]: value } : bt) } : null
    )
  }

  const saveConfiguration = async () => {
    if (!config) return
    setIsSaving(true)
    try {
      const webhookUrl = getWebhookEndpoint("PROFESSIONAL_CONFIG")
      logWebhookUsage("PROFESSIONAL_CONFIG", "save_professional_config")

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_professional_config",
          professional_id: professionalId,
          config_data: config,
        }),
      })

      if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`)
      }

      const result = await response.json()
      console.log("Save result:", result)

      toast({
        title: "Configuration Saved",
        description: "Your settings have been successfully updated.",
      })
    } catch (err) {
      console.error("Failed to save configuration:", err)
      toast({
        title: "Save Failed",
        description: err instanceof Error ? err.message : "Could not save settings.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#E75837]" />
        <p className="ml-4 text-lg">Loading Configuration...</p>
      </div>
    )
  }

  if (error || !config) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Failed to Load Configuration</h2>
          <p className="text-gray-700 mb-6">There was an error fetching the schedule settings for Professional ID: <strong>{professionalId}</strong>.</p>
          <p className="text-sm text-gray-500 mb-6">Error details: {error}</p>
          <Button onClick={loadConfiguration} className="bg-[#E75837] hover:bg-[#d14a2a]">
            <Save className="mr-2 h-4 w-4" />
            Retry Loading
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 header-font">
            Schedule & Booking Setup
          </h1>
          <p className="text-gray-600 mt-1 body-font">
            Manage your availability, booking rules, and team members for Professional ID: <strong>{professionalId}</strong>
          </p>
        </header>

        <div className="space-y-6">
          {/* Booking Preferences */}
          <Card>
            <CardHeader
              className="flex flex-row justify-between items-center cursor-pointer"
              onClick={() => toggleSection("bookingPrefs")}
            >
              <div>
                <CardTitle className="flex items-center gap-2 text-xl header-font">
                  <Settings className="w-5 h-5" />
                  Booking Preferences
                </CardTitle>
                <CardDescription className="body-font">
                  Control how customers book with you.
                </CardDescription>
              </div>
              {activeSections.bookingPrefs ? <ChevronUp /> : <ChevronDown />}
            </CardHeader>
            {activeSections.bookingPrefs && (
              <CardContent className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={config.bookingPreferences.business_name}
                      onChange={(e) => handleBookingPrefChange("business_name", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bookingSystem">Booking System</Label>
                    <Select
                      value={config.bookingPreferences.booking_system}
                      onValueChange={(value) => handleBookingPrefChange("booking_system", value)}
                    >
                      <SelectTrigger><SelectValue placeholder="Select system" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="direct_booking">Direct Booking</SelectItem>
                        <SelectItem value="request_booking">Request Booking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <Label htmlFor="onlineBookingEnabled">Enable Online Booking</Label>
                    <Switch
                      id="onlineBookingEnabled"
                      checked={config.bookingPreferences.online_booking_enabled}
                      onCheckedChange={(checked) => handleBookingPrefChange("online_booking_enabled", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <Label htmlFor="allowDirectBooking">Allow Direct Booking (no approval needed)</Label>
                    <Switch
                      id="allowDirectBooking"
                      checked={config.bookingPreferences.allow_direct_booking}
                      onCheckedChange={(checked) => handleBookingPrefChange("allow_direct_booking", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <Label htmlFor="requireApproval">Require Approval for All Bookings</Label>
                    <Switch
                      id="requireApproval"
                      checked={config.bookingPreferences.require_approval}
                      onCheckedChange={(checked) => handleBookingPrefChange("require_approval", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <Label htmlFor="showPrices">Show Prices to Customers</Label>
                    <Switch
                      id="showPrices"
                      checked={config.bookingPreferences.show_prices}
                      onCheckedChange={(checked) => handleBookingPrefChange("show_prices", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Employees */}
          <Card>
            <CardHeader
              className="flex flex-row justify-between items-center cursor-pointer"
              onClick={() => toggleSection("employees")}
            >
              <div>
                <CardTitle className="flex items-center gap-2 text-xl header-font">
                  <Users className="w-5 h-5" />
                  Team Members & Availability
                </CardTitle>
                <CardDescription className="body-font">
                  Manage your team and their working hours.
                </CardDescription>
              </div>
              {activeSections.employees ? <ChevronUp /> : <ChevronDown />}
            </CardHeader>
            {activeSections.employees && (
              <CardContent className="space-y-6 pt-4">
                {config.employees.map((employee) => (
                  <div key={employee.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
                        <div>
                          <Label htmlFor={`emp-name-${employee.id}`}>Name</Label>
                          <Input id={`emp-name-${employee.id}`} value={employee.name} onChange={(e) => handleEmployeeChange(employee.id, "name", e.target.value)} />
                        </div>
                        <div>
                          <Label htmlFor={`emp-role-${employee.id}`}>Role</Label>
                          <Input id={`emp-role-${employee.id}`} value={employee.role} onChange={(e) => handleEmployeeChange(employee.id, "role", e.target.value)} />
                        </div>
                        <div>
                          <Label htmlFor={`emp-email-${employee.id}`}>Email</Label>
                          <Input id={`emp-email-${employee.id}`} type="email" value={employee.email} onChange={(e) => handleEmployeeChange(employee.id, "email", e.target.value)} />
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="ml-4" onClick={() => removeEmployee(employee.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label>Working Hours</Label>
                      {employee.workingDays.map((day) => (
                        <div key={day.day} className="flex items-center gap-4 p-2 bg-gray-50 rounded">
                          <Switch checked={day.isWorking} onCheckedChange={(checked) => handleWorkingDayChange(employee.id, day.day, "isWorking", checked)} />
                          <span className="w-24">{day.day}</span>
                          <Select value={day.start} onValueChange={(value) => handleWorkingDayChange(employee.id, day.day, "start", value)} disabled={!day.isWorking}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {timeOptions.map((time) => (<SelectItem key={time} value={time}>{time}</SelectItem>))}
                            </SelectContent>
                          </Select>
                          <span>to</span>
                          <Select value={day.end} onValueChange={(value) => handleWorkingDayChange(employee.id, day.day, "end", value)} disabled={!day.isWorking}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {timeOptions.map((time) => (<SelectItem key={time} value={time}>{time}</SelectItem>))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={addEmployee}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Team Member
                </Button>
              </CardContent>
            )}
          </Card>

          {/* Capacity Rules */}
          <Card>
            <CardHeader
              className="flex flex-row justify-between items-center cursor-pointer"
              onClick={() => toggleSection("capacity")}
            >
              <div>
                <CardTitle className="flex items-center gap-2 text-xl header-font">
                  <Clock className="w-5 h-5" />
                  Capacity Rules
                </CardTitle>
                <CardDescription className="body-font">
                  Define how many bookings you can handle.
                </CardDescription>
              </div>
              {activeSections.capacity ? <ChevronUp /> : <ChevronDown />}
            </CardHeader>
            {activeSections.capacity && (
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div>
                  <Label>Max Concurrent Bookings</Label>
                  <Input type="number" value={config.capacityRules.maxConcurrentBookings} onChange={(e) => handleCapacityRuleChange("maxConcurrentBookings", parseInt(e.target.value) || 0)} />
                </div>
                <div>
                  <Label>Buffer Time Between Bookings (minutes)</Label>
                  <Input type="number" value={config.capacityRules.bufferTimeBetweenBookings} onChange={(e) => handleCapacityRuleChange("bufferTimeBetweenBookings", parseInt(e.target.value) || 0)} />
                </div>
                <div>
                  <Label>Max Bookings Per Day</Label>
                  <Input type="number" value={config.capacityRules.maxBookingsPerDay} onChange={(e) => handleCapacityRuleChange("maxBookingsPerDay", parseInt(e.target.value) || 0)} />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <Label>Allow Overlapping Bookings</Label>
                  <Switch checked={config.capacityRules.allowOverlapping} onCheckedChange={(checked) => handleCapacityRuleChange("allowOverlapping", checked)} />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Blocked Times */}
          <Card>
            <CardHeader
              className="flex flex-row justify-between items-center cursor-pointer"
              onClick={() => toggleSection("blockedTimes")}
            >
              <div>
                <CardTitle className="flex items-center gap-2 text-xl header-font">
                  <Ban className="w-5 h-5" />
                  Blocked Times
                </CardTitle>
                <CardDescription className="body-font">
                  Set specific times you are unavailable.
                </CardDescription>
              </div>
              {activeSections.blockedTimes ? <ChevronUp /> : <ChevronDown />}
            </CardHeader>
            {activeSections.blockedTimes && (
              <CardContent className="space-y-4 pt-4">
                {config.blockedTimes.map((bt) => (
                  <div key={bt.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end p-3 bg-gray-50 rounded">
                    <div className="md:col-span-2">
                      <Label>Date</Label>
                      <Input type="date" value={bt.date} onChange={(e) => handleBlockedTimeChange(bt.id, "date", e.target.value)} />
                    </div>
                    <div>
                      <Label>Start Time</Label>
                      <Input type="time" value={bt.startTime} onChange={(e) => handleBlockedTimeChange(bt.id, "startTime", e.target.value)} />
                    </div>
                    <div>
                      <Label>End Time</Label>
                      <Input type="time" value={bt.endTime} onChange={(e) => handleBlockedTimeChange(bt.id, "endTime", e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => removeBlockedTime(bt.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="md:col-span-5">
                      <Label>Reason</Label>
                      <Input value={bt.reason} onChange={(e) => handleBlockedTimeChange(bt.id, "reason", e.target.value)} />
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={addBlockedTime}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Blocked Time
                </Button>
              </CardContent>
            )}
          </Card>
        </div>

        <footer className="mt-8 pt-8 border-t">
          <div className="flex justify-end">
            <Button onClick={saveConfiguration} disabled={isSaving} size="lg" className="bg-[#E75837] hover:bg-[#d14a2a]">
              {isSaving ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (<Save className="mr-2 h-4 w-4" />)}
              Save Configuration
            </Button>
          </div>
        </footer>
      </div>
    </div>
  )
}
