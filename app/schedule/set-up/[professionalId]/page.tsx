"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Loader2,
  Trash2,
  Plus,
  Users,
  Clock,
  Shield,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Settings,
  Smartphone,
} from "lucide-react"
import type {
  GetConfigWebhookPayload,
  SaveConfigWebhookPayload,
  WebhookEmployee,
  WebhookBlockedTime,
  WebhookCapacityRules,
} from "@/types/webhook-config"

const DEFAULT_WORKING_DAYS = [
  { day: "Monday", start_time: "09:00", end_time: "17:00", is_working: true },
  { day: "Tuesday", start_time: "09:00", end_time: "17:00", is_working: true },
  { day: "Wednesday", start_time: "09:00", end_time: "17:00", is_working: true },
  { day: "Thursday", start_time: "09:00", end_time: "17:00", is_working: true },
  { day: "Friday", start_time: "09:00", end_time: "17:00", is_working: true },
  { day: "Saturday", start_time: "09:00", end_time: "15:00", is_working: false },
  { day: "Sunday", start_time: "09:00", end_time: "15:00", is_working: false },
]

const DEFAULT_CAPACITY_RULES: WebhookCapacityRules = {
  max_concurrent_bookings: 1,
  buffer_time_between_bookings: 15,
  max_bookings_per_day: 8,
  allow_overlapping: false,
  require_all_employees_for_service: false,
}

const DEFAULT_BOOKING_PREFERENCES = {
  booking_system: "direct_booking", // Internal frontend field
  allow_direct_booking: true,
  require_approval: false,
  online_booking_enabled: true,
  custom_instructions: "",
}

export default function ProfessionalSetupPage() {
  const params = useParams()
  const professionalId = params.professionalId as string

  // State management
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("booking")

  // Configuration state
  const [businessName, setBusinessName] = useState("")
  const [bookingPreferences, setBookingPreferences] = useState(DEFAULT_BOOKING_PREFERENCES)
  const [employees, setEmployees] = useState<WebhookEmployee[]>([])
  const [capacityRules, setCapacityRules] = useState<WebhookCapacityRules>(DEFAULT_CAPACITY_RULES)
  const [blockedTimes, setBlockedTimes] = useState<WebhookBlockedTime[]>([])
  const [lastUpdated, setLastUpdated] = useState<string>("")

  // Form state for adding new items
  const [newEmployee, setNewEmployee] = useState<Partial<WebhookEmployee>>({
    name: "",
    role: "",
    email: "",
    is_active: true,
    working_days: [...DEFAULT_WORKING_DAYS],
    services: [],
  })

  const [newBlockedTime, setNewBlockedTime] = useState<Partial<WebhookBlockedTime>>({
    date: "",
    start_time: "09:00",
    end_time: "17:00",
    reason: "",
    is_recurring: false,
  })

  // Generate session ID
  const generateSessionId = () => {
    return `setup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Helper function to map booking_system to booking_type for webhook
  const mapBookingSystemToBookingType = (bookingSystem: string) => {
    switch (bookingSystem) {
      case "direct_booking":
        return "direct_booking"
      case "request_to_book":
        return "request_to_book"
      case "no_online_booking":
        return "no_online_booking"
      default:
        return "direct_booking"
    }
  }

  // Helper function to map booking_type from webhook to booking_system for frontend
  const mapBookingTypeToBookingSystem = (bookingType: string) => {
    switch (bookingType) {
      case "direct_booking":
        return "direct_booking"
      case "request_to_book":
        return "request_to_book"
      case "no_online_booking":
        return "no_online_booking"
      default:
        return "direct_booking"
    }
  }

  // Load existing configuration
  const loadConfiguration = async () => {
    try {
      setLoading(true)
      setError(null)

      const webhookUrl = "https://jleib03.app.n8n.cloud/webhook/5671c1dd-48f6-47a9-85ac-4e20cf261520"

      const payload: GetConfigWebhookPayload = {
        action: "get_professional_config",
        professional_id: professionalId,
        session_id: generateSessionId(),
        timestamp: new Date().toISOString(),
      }

      console.log("Loading professional configuration:", payload)

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Raw webhook response:", data)

      // Process the webhook response - handle both structured and raw formats
      if (Array.isArray(data)) {
        console.log("Processing array response with", data.length, "items")

        // Look for structured webhook_response objects first
        const webhookResponses = data.filter((item) => item.webhook_response && item.webhook_response.success)

        if (webhookResponses.length > 0) {
          // Use the most recent webhook response (last one in array)
          const latestResponse = webhookResponses[webhookResponses.length - 1]
          const configData = latestResponse.webhook_response.config_data

          console.log("Found structured webhook response:", configData)

          // Process structured configuration data
          setBusinessName(configData.business_name || "")
          setLastUpdated(configData.last_updated || new Date().toISOString())

          // Process booking preferences - handle both old and new formats
          if (configData.booking_preferences) {
            const prefs = configData.booking_preferences
            setBookingPreferences({
              booking_system: mapBookingTypeToBookingSystem(
                prefs.booking_type || prefs.booking_system || "direct_booking",
              ),
              allow_direct_booking: prefs.allow_direct_booking ?? true,
              require_approval: prefs.require_approval ?? false,
              online_booking_enabled: prefs.online_booking_enabled ?? true,
              custom_instructions: prefs.custom_instructions || "",
            })
          }

          // Process employees from structured data
          if (configData.employees && Array.isArray(configData.employees)) {
            console.log("Loading employees from structured config:", configData.employees.length)

            // Convert structured employees to frontend format
            const processedEmployees: WebhookEmployee[] = configData.employees.map((emp: any) => {
              // Process each employee's individual working days
              const workingDays = emp.working_days
                ? emp.working_days.map((day: any) => ({
                    day: day.day,
                    start_time: day.start_time.substring(0, 5), // Convert "08:00:00" to "08:00"
                    end_time: day.end_time.substring(0, 5), // Convert "20:00:00" to "20:00"
                    is_working: day.is_working,
                  }))
                : [...DEFAULT_WORKING_DAYS]

              // Fill in missing days if the employee doesn't have all 7 days
              const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
              const existingDays = workingDays.map((d: any) => d.day)

              dayNames.forEach((dayName) => {
                if (!existingDays.includes(dayName)) {
                  workingDays.push({
                    day: dayName,
                    start_time: "09:00",
                    end_time: "17:00",
                    is_working: false,
                  })
                }
              })

              // Sort working days to ensure consistent order
              const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
              workingDays.sort((a: any, b: any) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day))

              console.log(`Processing employee ${emp.name} with ${workingDays.length} working days:`, workingDays)

              return {
                employee_id: emp.employee_id,
                name: emp.name,
                role: emp.role || "Staff Member",
                email: emp.email || "",
                is_active: emp.is_active ?? true,
                working_days: workingDays,
                services: emp.services || [],
              }
            })

            setEmployees(processedEmployees)
            console.log("Processed structured employees:", processedEmployees.length)
          }

          // Process capacity rules from structured data
          if (configData.capacity_rules) {
            setCapacityRules(configData.capacity_rules)
          }

          // Process blocked times from structured data
          if (configData.blocked_times && Array.isArray(configData.blocked_times)) {
            setBlockedTimes(configData.blocked_times)
          }
        } else {
          // Fallback to defaults for new configurations
          console.log("No existing configuration found, using defaults")
          setBusinessName("")
          setBookingPreferences(DEFAULT_BOOKING_PREFERENCES)
          setEmployees([])
          setCapacityRules(DEFAULT_CAPACITY_RULES)
          setBlockedTimes([])
          setLastUpdated(new Date().toISOString())
        }

        console.log("Configuration loaded successfully")
      } else {
        console.log("Unexpected response format:", data)
        // Fallback to defaults
        setBusinessName("")
        setBookingPreferences(DEFAULT_BOOKING_PREFERENCES)
        setEmployees([])
        setCapacityRules(DEFAULT_CAPACITY_RULES)
        setBlockedTimes([])
      }
    } catch (err) {
      console.error("Error loading configuration:", err)
      setError("Failed to load configuration. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Save configuration
  const saveConfiguration = async () => {
    try {
      setSaving(true)
      setError(null)

      const webhookUrl = "https://jleib03.app.n8n.cloud/webhook/5671c1dd-48f6-47a9-85ac-4e20cf261520"

      // Prepare booking preferences with proper booking_type mapping
      const bookingPreferencesForWebhook = {
        booking_type: mapBookingSystemToBookingType(bookingPreferences.booking_system), // Map to booking_type for webhook
        allow_direct_booking: bookingPreferences.allow_direct_booking,
        require_approval: bookingPreferences.require_approval,
        online_booking_enabled: bookingPreferences.online_booking_enabled,
        custom_instructions: bookingPreferences.custom_instructions,
      }

      const payload: SaveConfigWebhookPayload = {
        action: "save_professional_config",
        professional_id: professionalId,
        session_id: generateSessionId(),
        timestamp: new Date().toISOString(),
        config_data: {
          business_name: businessName,
          booking_preferences: bookingPreferencesForWebhook, // Send with booking_type
          employees: employees,
          capacity_rules: capacityRules,
          blocked_times: blockedTimes,
        },
      }

      console.log("Saving professional configuration:", payload)
      console.log("Booking preferences being sent:", bookingPreferencesForWebhook)

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Save response:", data)

      // Handle the new response format with "load successful" messages
      if (Array.isArray(data)) {
        const successCount = data.filter((item) => item.output === "load successful").length

        if (successCount > 0) {
          setLastUpdated(new Date().toISOString())
          console.log(`Configuration saved successfully: ${successCount} operations completed`)

          // Show success message briefly
          setTimeout(() => {
            // Could add a success toast here
          }, 2000)
        } else {
          throw new Error("Save operation did not complete successfully")
        }
      } else {
        // Fallback for other response formats
        const saveResponse = data[0] || data

        if (saveResponse.success || saveResponse.output === "load successful") {
          setLastUpdated(new Date().toISOString())
          console.log("Configuration saved successfully:", saveResponse.message || saveResponse.output)
        } else {
          throw new Error(saveResponse.message || "Failed to save configuration")
        }
      }
    } catch (err) {
      console.error("Error saving configuration:", err)
      setError(err instanceof Error ? err.message : "Failed to save configuration")
    } finally {
      setSaving(false)
    }
  }

  // Load configuration on mount
  useEffect(() => {
    if (professionalId) {
      loadConfiguration()
    }
  }, [professionalId])

  // Employee management functions
  const addEmployee = () => {
    if (!newEmployee.name || !newEmployee.role) return

    const employee: WebhookEmployee = {
      employee_id: `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newEmployee.name,
      role: newEmployee.role,
      email: newEmployee.email || "",
      is_active: newEmployee.is_active ?? true,
      working_days: newEmployee.working_days || [...DEFAULT_WORKING_DAYS],
      services: newEmployee.services || [],
    }

    setEmployees((prev) => [...prev, employee])
    setNewEmployee({
      name: "",
      role: "",
      email: "",
      is_active: true,
      working_days: [...DEFAULT_WORKING_DAYS],
      services: [],
    })
  }

  const removeEmployee = (employeeId: string) => {
    setEmployees((prev) => prev.filter((emp) => emp.employee_id !== employeeId))
  }

  const updateEmployee = (employeeId: string, updates: Partial<WebhookEmployee>) => {
    setEmployees((prev) => prev.map((emp) => (emp.employee_id === employeeId ? { ...emp, ...updates } : emp)))
  }

  // Blocked time management functions
  const addBlockedTime = () => {
    if (!newBlockedTime.date || !newBlockedTime.start_time || !newBlockedTime.end_time) return

    const blockedTime: WebhookBlockedTime = {
      blocked_time_id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      employee_id: newBlockedTime.employee_id,
      date: newBlockedTime.date,
      start_time: newBlockedTime.start_time,
      end_time: newBlockedTime.end_time,
      reason: newBlockedTime.reason || "",
      is_recurring: newBlockedTime.is_recurring ?? false,
      recurrence_pattern: newBlockedTime.recurrence_pattern,
    }

    setBlockedTimes((prev) => [...prev, blockedTime])
    setNewBlockedTime({
      date: "",
      start_time: "09:00",
      end_time: "17:00",
      reason: "",
      is_recurring: false,
    })
  }

  const removeBlockedTime = (blockedTimeId: string) => {
    setBlockedTimes((prev) => prev.filter((bt) => bt.blocked_time_id !== blockedTimeId))
  }

  // Booking preference handlers
  const updateBookingPreferences = (updates: Partial<typeof DEFAULT_BOOKING_PREFERENCES>) => {
    setBookingPreferences((prev) => ({ ...prev, ...updates }))
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#E75837]" />
          <p className="text-gray-600 body-font">Loading configuration...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-800 mb-2 header-font">Configuration Error</h2>
            <p className="text-red-600 body-font mb-4">{error}</p>
            <Button onClick={loadConfiguration} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-[#E75837] mb-2 header-font">Booking Experience Setup</h1>
              <p className="text-gray-600 body-font">Configure how customers will book appointments with you.</p>
              {lastUpdated && (
                <p className="text-sm text-gray-500 body-font mt-2">
                  Last updated: {new Date(lastUpdated).toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <a
                href={`/schedule/${professionalId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors body-font"
              >
                <ExternalLink className="w-4 h-4" />
                Preview Booking Page
              </a>
              <Button onClick={saveConfiguration} disabled={saving} className="bg-[#E75837] hover:bg-[#d14a2a]">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Configuration"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Configuration Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="booking" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Booking Experience
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team ({employees.length})
            </TabsTrigger>
            <TabsTrigger value="capacity" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Capacity Rules
            </TabsTrigger>
            <TabsTrigger value="blocked" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Blocked Time ({blockedTimes.length})
            </TabsTrigger>
          </TabsList>

          {/* Booking Experience Tab */}
          <TabsContent value="booking">
            <div className="space-y-6">
              {/* Professional ID Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="header-font">Professional Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2 header-font">Professional ID</h4>
                    <p className="text-blue-700 body-font text-sm">
                      Your unique professional ID:{" "}
                      <code className="bg-blue-100 px-2 py-1 rounded">{professionalId}</code>
                    </p>
                    <p className="text-blue-600 body-font text-xs mt-2">
                      This ID is used in your booking URLs and webhook configurations.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Experience Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="header-font">Choose Your Booking Experience</CardTitle>
                  <p className="text-gray-600 body-font">
                    Select how customers will interact with your booking system.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup
                    value={bookingPreferences.booking_system}
                    onValueChange={(value) => {
                      const bookingSystem = value as "direct_booking" | "request_to_book" | "no_online_booking"
                      updateBookingPreferences({
                        booking_system: bookingSystem,
                        allow_direct_booking: bookingSystem === "direct_booking",
                        require_approval: bookingSystem === "request_to_book",
                        online_booking_enabled: bookingSystem !== "no_online_booking",
                      })
                    }}
                    className="space-y-4"
                  >
                    {/* Direct Booking Option */}
                    <div
                      className={`flex items-start space-x-3 p-4 border rounded-lg transition-colors ${
                        bookingPreferences.booking_system === "direct_booking"
                          ? "border-green-500 bg-green-50 ring-2 ring-green-200"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <RadioGroupItem value="direct_booking" id="direct_booking" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <Label htmlFor="direct_booking" className="text-lg font-semibold header-font">
                            Direct Booking
                          </Label>
                          <Badge variant="secondary" className="text-xs">
                            Recommended
                          </Badge>
                          {bookingPreferences.booking_system === "direct_booking" && (
                            <Badge className="text-xs bg-green-500 text-white">Currently Selected</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 body-font text-sm">
                          Allow existing customers to create bookings without the need for you to review and approve.
                          Bookings are automatically confirmed and added to your schedule.
                        </p>
                        <div className="mt-2 text-xs text-gray-500 body-font">
                          ✓ Instant confirmation • ✓ Automated scheduling • ✓ Best customer experience
                        </div>
                      </div>
                    </div>

                    {/* Request to Book Option */}
                    <div
                      className={`flex items-start space-x-3 p-4 border rounded-lg transition-colors ${
                        bookingPreferences.booking_system === "request_to_book"
                          ? "border-orange-500 bg-orange-50 ring-2 ring-orange-200"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <RadioGroupItem value="request_to_book" id="request_to_book" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-5 h-5 text-orange-500" />
                          <Label htmlFor="request_to_book" className="text-lg font-semibold header-font">
                            Request to Book
                          </Label>
                          {bookingPreferences.booking_system === "request_to_book" && (
                            <Badge className="text-xs bg-orange-500 text-white">Currently Selected</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 body-font text-sm">
                          Allow customers to create booking requests that will land in your Critter profile for review.
                          You can approve or decline each request before it becomes a confirmed booking.
                        </p>
                        <div className="mt-2 text-xs text-gray-500 body-font">
                          ✓ Manual approval • ✓ Full control • ✓ Review before confirmation
                        </div>
                      </div>
                    </div>

                    {/* No Online Booking Option */}
                    <div
                      className={`flex items-start space-x-3 p-4 border rounded-lg transition-colors ${
                        bookingPreferences.booking_system === "no_online_booking"
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <RadioGroupItem value="no_online_booking" id="no_online_booking" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Smartphone className="w-5 h-5 text-blue-500" />
                          <Label htmlFor="no_online_booking" className="text-lg font-semibold header-font">
                            No Online Booking
                          </Label>
                          {bookingPreferences.booking_system === "no_online_booking" && (
                            <Badge className="text-xs bg-blue-500 text-white">Currently Selected</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 body-font text-sm">
                          Require customers to login to the Critter app and request bookings directly within the
                          application. No public booking page will be available.
                        </p>
                        <div className="mt-2 text-xs text-gray-500 body-font">
                          ✓ App-only booking • ✓ Maximum privacy • ✓ Existing customer relationships
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Team Management Tab */}
          <TabsContent value="team">
            <div className="space-y-6">
              {/* Add New Employee Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="header-font">Add Team Member</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label htmlFor="empName" className="body-font">
                        Name *
                      </Label>
                      <Input
                        id="empName"
                        value={newEmployee.name}
                        onChange={(e) => setNewEmployee((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Employee name"
                        className="body-font"
                      />
                    </div>
                    <div>
                      <Label htmlFor="empRole" className="body-font">
                        Role *
                      </Label>
                      <Input
                        id="empRole"
                        value={newEmployee.role}
                        onChange={(e) => setNewEmployee((prev) => ({ ...prev, role: e.target.value }))}
                        placeholder="e.g., Veterinarian, Groomer"
                        className="body-font"
                      />
                    </div>
                    <div>
                      <Label htmlFor="empEmail" className="body-font">
                        Email
                      </Label>
                      <Input
                        id="empEmail"
                        type="email"
                        value={newEmployee.email}
                        onChange={(e) => setNewEmployee((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="employee@example.com"
                        className="body-font"
                      />
                    </div>
                  </div>
                  <Button onClick={addEmployee} disabled={!newEmployee.name || !newEmployee.role}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Team Member
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Employees */}
              <div className="space-y-4">
                {employees.map((employee) => (
                  <Card key={employee.employee_id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="header-font text-lg">{employee.name}</CardTitle>
                          <p className="text-gray-600 body-font">{employee.role}</p>
                          {employee.email && <p className="text-gray-500 body-font text-sm">{employee.email}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`active-${employee.employee_id}`} className="body-font text-sm">
                              Active
                            </Label>
                            <Switch
                              id={`active-${employee.employee_id}`}
                              checked={employee.is_active}
                              onCheckedChange={(checked) =>
                                updateEmployee(employee.employee_id!, { is_active: checked })
                              }
                            />
                          </div>
                          <Button variant="outline" size="sm" onClick={() => removeEmployee(employee.employee_id!)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <h4 className="font-medium header-font">Working Hours</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {employee.working_days.map((day, dayIndex) => (
                            <div key={day.day} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                              <Switch
                                checked={day.is_working}
                                onCheckedChange={(checked) => {
                                  const updatedDays = [...employee.working_days]
                                  updatedDays[dayIndex] = { ...day, is_working: checked }
                                  updateEmployee(employee.employee_id!, { working_days: updatedDays })
                                }}
                              />
                              <span className="text-sm font-medium body-font w-12">{day.day.slice(0, 3)}</span>
                              {day.is_working && (
                                <div className="flex items-center gap-1">
                                  <Input
                                    type="time"
                                    value={day.start_time}
                                    onChange={(e) => {
                                      const updatedDays = [...employee.working_days]
                                      updatedDays[dayIndex] = { ...day, start_time: e.target.value }
                                      updateEmployee(employee.employee_id!, { working_days: updatedDays })
                                    }}
                                    className="w-20 h-8 text-xs"
                                  />
                                  <span className="text-xs text-gray-500">-</span>
                                  <Input
                                    type="time"
                                    value={day.end_time}
                                    onChange={(e) => {
                                      const updatedDays = [...employee.working_days]
                                      updatedDays[dayIndex] = { ...day, end_time: e.target.value }
                                      updateEmployee(employee.employee_id!, { working_days: updatedDays })
                                    }}
                                    className="w-20 h-8 text-xs"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>\
