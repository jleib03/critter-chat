"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import {
  Loader2,
  Trash2,
  Plus,
  Users,
  Clock,
  Shield,
  Calendar,
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
  booking_system: "direct_booking",
  allow_direct_booking: true,
  require_approval: false,
  online_booking_enabled: true,
  custom_instructions: "",
}

export default function ProfessionalSetupPage() {
  const params = useParams()
  const professionalId = params.professionalId as string
  const { toast } = useToast()

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
  const [originalConfig, setOriginalConfig] = useState<{
    businessName: string
    bookingPreferences: typeof DEFAULT_BOOKING_PREFERENCES
    employees: WebhookEmployee[]
    capacityRules: WebhookCapacityRules
    blockedTimes: WebhookBlockedTime[]
  } | null>(null)

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
    start_date: "",
    end_date: "",
    start_time: "09:00",
    end_time: "17:00",
    reason: "",
    is_recurring: false,
    is_all_day: false,
  })

  // Generate session ID
  const generateSessionId = () => {
    return `setup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Helper function to format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toISOString().split("T")[0]
  }

  // Helper function to parse date from input (handles timezone correctly)
  const parseDateFromInput = (dateString: string) => {
    if (!dateString) return ""
    // Create date at noon local time to avoid timezone issues
    const [year, month, day] = dateString.split("-").map(Number)
    const date = new Date(year, month - 1, day, 12, 0, 0)
    return date.toISOString().split("T")[0]
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

  // Load configuration
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

      if (Array.isArray(data)) {
        console.log("Processing array response with", data.length, "items")

        const webhookResponses = data.filter((item) => item.webhook_response && item.webhook_response.success)

        if (webhookResponses.length > 0) {
          const latestResponse = webhookResponses[webhookResponses.length - 1]
          const configData = latestResponse.webhook_response.config_data

          console.log("Found structured webhook response:", configData)

          setBusinessName(configData.business_name || "")
          setLastUpdated(configData.last_updated || new Date().toISOString())

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

          if (configData.employees && Array.isArray(configData.employees)) {
            console.log("Loading employees from structured config:", configData.employees.length)

            const processedEmployees: WebhookEmployee[] = configData.employees.map((emp: any) => {
              const workingDays = emp.working_days
                ? emp.working_days.map((day: any) => ({
                    day: day.day,
                    start_time: day.start_time.substring(0, 5),
                    end_time: day.end_time.substring(0, 5),
                    is_working: day.is_working,
                  }))
                : [...DEFAULT_WORKING_DAYS]

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

              const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
              workingDays.sort((a: any, b: any) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day))

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

          if (configData.capacity_rules) {
            setCapacityRules(configData.capacity_rules)
          }

          if (configData.blocked_times && Array.isArray(configData.blocked_times)) {
            // Map blocked_date back to date for internal use
            const processedBlockedTimes = configData.blocked_times.map((bt: any) => ({
              ...bt,
              date: bt.blocked_date || bt.date, // Handle both field names
            }))
            setBlockedTimes(processedBlockedTimes)
          }

          // Store original configuration for change detection
          setOriginalConfig({
            businessName: configData.business_name || "",
            bookingPreferences: {
              booking_system: mapBookingTypeToBookingSystem(
                prefs.booking_type || prefs.booking_system || "direct_booking",
              ),
              allow_direct_booking: prefs.allow_direct_booking ?? true,
              require_approval: prefs.require_approval ?? false,
              online_booking_enabled: prefs.online_booking_enabled ?? true,
              custom_instructions: prefs.custom_instructions || "",
            },
            employees: employees,
            capacityRules: configData.capacity_rules || DEFAULT_CAPACITY_RULES,
            blockedTimes: blockedTimes,
          })

          console.log("Configuration loaded successfully")
        } else {
          console.log("No existing configuration found, using defaults")
          setBusinessName("")
          setBookingPreferences(DEFAULT_BOOKING_PREFERENCES)
          setEmployees([])
          setCapacityRules(DEFAULT_CAPACITY_RULES)
          setBlockedTimes([])
          setLastUpdated(new Date().toISOString())
          setOriginalConfig({
            businessName: "",
            bookingPreferences: DEFAULT_BOOKING_PREFERENCES,
            employees: [],
            capacityRules: DEFAULT_CAPACITY_RULES,
            blockedTimes: [],
          })
        }

        console.log("Configuration loaded successfully")
      } else {
        console.log("Unexpected response format:", data)
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

  // Save configuration - only send changes
  const saveConfiguration = async () => {
    try {
      setSaving(true)
      setError(null)

      if (!originalConfig) {
        throw new Error("Original configuration not loaded")
      }

      const webhookUrl = "https://jleib03.app.n8n.cloud/webhook/5671c1dd-48f6-47a9-85ac-4e20cf261520"

      // Detect changes
      const changes: any = {}

      // Check business name changes
      if (businessName !== originalConfig.businessName) {
        changes.business_name = businessName
      }

      // Check booking preferences changes
      const currentBookingPrefs = {
        booking_type: mapBookingSystemToBookingType(bookingPreferences.booking_system),
        allow_direct_booking: bookingPreferences.allow_direct_booking,
        require_approval: bookingPreferences.require_approval,
        online_booking_enabled: bookingPreferences.online_booking_enabled,
        custom_instructions: bookingPreferences.custom_instructions,
      }

      const originalBookingPrefs = {
        booking_type: mapBookingSystemToBookingType(originalConfig.bookingPreferences.booking_system),
        allow_direct_booking: originalConfig.bookingPreferences.allow_direct_booking,
        require_approval: originalConfig.bookingPreferences.require_approval,
        online_booking_enabled: originalConfig.bookingPreferences.online_booking_enabled,
        custom_instructions: originalConfig.bookingPreferences.custom_instructions,
      }

      if (JSON.stringify(currentBookingPrefs) !== JSON.stringify(originalBookingPrefs)) {
        changes.booking_preferences = currentBookingPrefs
      }

      // Check employees changes
      if (JSON.stringify(employees) !== JSON.stringify(originalConfig.employees)) {
        changes.employees = employees
      }

      // Check capacity rules changes
      if (JSON.stringify(capacityRules) !== JSON.stringify(originalConfig.capacityRules)) {
        changes.capacity_rules = capacityRules
      }

      // Check blocked times changes
      const currentBlockedTimesForWebhook = blockedTimes.map((bt) => ({
        blocked_time_id: bt.blocked_time_id,
        employee_id: bt.employee_id || null,
        blocked_date: bt.date,
        start_time: bt.start_time,
        end_time: bt.end_time,
        reason: bt.reason || "",
        is_recurring: bt.is_recurring || false,
        is_all_day: bt.is_all_day || false,
        recurrence_pattern: bt.is_recurring ? bt.recurrence_pattern || null : null,
      }))

      const originalBlockedTimesForWebhook = originalConfig.blockedTimes.map((bt) => ({
        blocked_time_id: bt.blocked_time_id,
        employee_id: bt.employee_id || null,
        blocked_date: bt.date,
        start_time: bt.start_time,
        end_time: bt.end_time,
        reason: bt.reason || "",
        is_recurring: bt.is_recurring || false,
        is_all_day: bt.is_all_day || false,
        recurrence_pattern: bt.is_recurring ? bt.recurrence_pattern || null : null,
      }))

      if (JSON.stringify(currentBlockedTimesForWebhook) !== JSON.stringify(originalBlockedTimesForWebhook)) {
        changes.blocked_times = currentBlockedTimesForWebhook
      }

      // If no changes detected, show message and return
      if (Object.keys(changes).length === 0) {
        toast({
          title: "No Changes Detected",
          description: "Your configuration is already up to date.",
          duration: 3000,
        })
        return
      }

      const payload: SaveConfigWebhookPayload = {
        action: "save_professional_config",
        professional_id: professionalId,
        session_id: generateSessionId(),
        timestamp: new Date().toISOString(),
        config_data: changes, // Only send changes
      }

      console.log("Saving configuration changes:", payload)
      console.log("Changes detected:", Object.keys(changes))

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

      // Check for successful save
      let saveSuccessful = false

      if (Array.isArray(data)) {
        const successCount = data.filter(
          (item) => item.output === "load successful" || (item.webhook_response && item.webhook_response.success),
        ).length
        saveSuccessful = successCount > 0
      } else {
        const saveResponse = data[0] || data
        saveSuccessful = saveResponse.success || saveResponse.output === "load successful"
      }

      if (saveSuccessful) {
        setLastUpdated(new Date().toISOString())

        // Update original config to current state
        setOriginalConfig({
          businessName,
          bookingPreferences,
          employees,
          capacityRules,
          blockedTimes,
        })

        // Show success toast
        toast({
          title: "✅ Configuration Saved",
          description: `Successfully updated ${Object.keys(changes).length} configuration section(s).`,
          duration: 4000,
        })

        console.log("Configuration saved successfully")
      } else {
        throw new Error("Save operation did not complete successfully")
      }
    } catch (err) {
      console.error("Error saving configuration:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to save configuration"
      setError(errorMessage)

      // Show error toast
      toast({
        title: "❌ Save Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setSaving(false)
    }
  }

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

  // Enhanced blocked time management functions
  const addBlockedTime = () => {
    const startDate = newBlockedTime.start_date
    const endDate = newBlockedTime.end_date || newBlockedTime.start_date

    if (!startDate) return

    // For multi-day blocks, create individual entries for each day
    const start = new Date(parseDateFromInput(startDate))
    const end = new Date(parseDateFromInput(endDate))

    const blockedTimeEntries: WebhookBlockedTime[] = []

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const blockedTime: WebhookBlockedTime = {
        blocked_time_id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${date.getTime()}`,
        employee_id: newBlockedTime.employee_id,
        date: date.toISOString().split("T")[0], // Store as date internally
        start_time: newBlockedTime.is_all_day ? "00:00" : newBlockedTime.start_time || "09:00",
        end_time: newBlockedTime.is_all_day ? "23:59" : newBlockedTime.end_time || "17:00",
        reason: newBlockedTime.reason || "",
        is_recurring: newBlockedTime.is_recurring ?? false,
        is_all_day: newBlockedTime.is_all_day ?? false,
        recurrence_pattern: newBlockedTime.is_recurring ? newBlockedTime.recurrence_pattern : undefined, // Don't set if not recurring
      }
      blockedTimeEntries.push(blockedTime)
    }

    setBlockedTimes((prev) => [...prev, ...blockedTimeEntries])
    setNewBlockedTime({
      start_date: "",
      end_date: "",
      start_time: "09:00",
      end_time: "17:00",
      reason: "",
      is_recurring: false,
      is_all_day: false,
    })
  }

  const removeBlockedTime = (blockedTimeId: string) => {
    setBlockedTimes((prev) => prev.filter((bt) => bt.blocked_time_id !== blockedTimeId))
  }

  const updateBookingPreferences = (updates: Partial<typeof DEFAULT_BOOKING_PREFERENCES>) => {
    setBookingPreferences((prev) => ({ ...prev, ...updates }))
  }

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
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {employees.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-500 mb-2 header-font">No Team Members Yet</h3>
                      <p className="text-gray-400 body-font">Add your first team member to get started.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Capacity Rules Tab */}
          <TabsContent value="capacity">
            <Card>
              <CardHeader>
                <CardTitle className="header-font">Booking Capacity Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="maxConcurrent" className="body-font">
                      Maximum Concurrent Bookings
                    </Label>
                    <Input
                      id="maxConcurrent"
                      type="number"
                      min="1"
                      value={capacityRules.max_concurrent_bookings}
                      onChange={(e) =>
                        setCapacityRules((prev) => ({
                          ...prev,
                          max_concurrent_bookings: Number.parseInt(e.target.value) || 1,
                        }))
                      }
                      className="body-font"
                    />
                    <p className="text-sm text-gray-500 mt-1 body-font">
                      How many appointments can happen at the same time
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="bufferTime" className="body-font">
                      Buffer Time Between Bookings (minutes)
                    </Label>
                    <Input
                      id="bufferTime"
                      type="number"
                      min="0"
                      value={capacityRules.buffer_time_between_bookings}
                      onChange={(e) =>
                        setCapacityRules((prev) => ({
                          ...prev,
                          buffer_time_between_bookings: Number.parseInt(e.target.value) || 0,
                        }))
                      }
                      className="body-font"
                    />
                    <p className="text-sm text-gray-500 mt-1 body-font">
                      Minimum time gap between consecutive appointments
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="maxDaily" className="body-font">
                      Maximum Bookings Per Day
                    </Label>
                    <Input
                      id="maxDaily"
                      type="number"
                      min="1"
                      value={capacityRules.max_bookings_per_day}
                      onChange={(e) =>
                        setCapacityRules((prev) => ({
                          ...prev,
                          max_bookings_per_day: Number.parseInt(e.target.value) || 1,
                        }))
                      }
                      className="body-font"
                    />
                    <p className="text-sm text-gray-500 mt-1 body-font">Total appointments allowed per day</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="allowOverlapping" className="body-font">
                          Allow Overlapping Appointments
                        </Label>
                        <p className="text-sm text-gray-500 body-font">Permit appointments to overlap in time</p>
                      </div>
                      <Switch
                        id="allowOverlapping"
                        checked={capacityRules.allow_overlapping}
                        onCheckedChange={(checked) =>
                          setCapacityRules((prev) => ({
                            ...prev,
                            allow_overlapping: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="requireAllEmployees" className="body-font">
                          Require All Team Members
                        </Label>
                        <p className="text-sm text-gray-500 body-font">All active team members must be available</p>
                      </div>
                      <Switch
                        id="requireAllEmployees"
                        checked={capacityRules.require_all_employees_for_service}
                        onCheckedChange={(checked) =>
                          setCapacityRules((prev) => ({
                            ...prev,
                            require_all_employees_for_service: checked,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Blocked Time Tab */}
          <TabsContent value="blocked">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="header-font">Block Time</CardTitle>
                  <p className="text-gray-600 body-font">
                    Block specific dates and times when you're not available for appointments.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Date Range Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate" className="body-font">
                          Start Date *
                        </Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={newBlockedTime.start_date}
                          onChange={(e) =>
                            setNewBlockedTime((prev) => ({
                              ...prev,
                              start_date: e.target.value,
                              end_date: prev.end_date || e.target.value, // Auto-set end date if not set
                            }))
                          }
                          className="body-font"
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate" className="body-font">
                          End Date (Optional - for multi-day blocks)
                        </Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={newBlockedTime.end_date}
                          onChange={(e) => setNewBlockedTime((prev) => ({ ...prev, end_date: e.target.value }))}
                          min={newBlockedTime.start_date}
                          className="body-font"
                        />
                        <p className="text-xs text-gray-500 mt-1 body-font">
                          Leave empty for single day, or select end date for vacation/multi-day blocks
                        </p>
                      </div>
                    </div>

                    {/* All Day Toggle */}
                    <div className="flex items-center gap-3">
                      <Switch
                        id="allDay"
                        checked={newBlockedTime.is_all_day}
                        onCheckedChange={(checked) => setNewBlockedTime((prev) => ({ ...prev, is_all_day: checked }))}
                      />
                      <Label htmlFor="allDay" className="body-font">
                        All Day Block
                      </Label>
                      <p className="text-sm text-gray-500 body-font">
                        Block the entire day(s) instead of specific times
                      </p>
                    </div>

                    {/* Time Selection (only show if not all day) */}
                    {!newBlockedTime.is_all_day && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="blockStart" className="body-font">
                            Start Time *
                          </Label>
                          <Input
                            id="blockStart"
                            type="time"
                            value={newBlockedTime.start_time}
                            onChange={(e) => setNewBlockedTime((prev) => ({ ...prev, start_time: e.target.value }))}
                            className="body-font"
                          />
                        </div>
                        <div>
                          <Label htmlFor="blockEnd" className="body-font">
                            End Time *
                          </Label>
                          <Input
                            id="blockEnd"
                            type="time"
                            value={newBlockedTime.end_time}
                            onChange={(e) => setNewBlockedTime((prev) => ({ ...prev, end_time: e.target.value }))}
                            className="body-font"
                          />
                        </div>
                      </div>
                    )}

                    {/* Employee Selection */}
                    <div>
                      <Label htmlFor="blockEmployee" className="body-font">
                        Specific Employee (Optional)
                      </Label>
                      <Select
                        value={newBlockedTime.employee_id || "all"}
                        onValueChange={(value) =>
                          setNewBlockedTime((prev) => ({
                            ...prev,
                            employee_id: value === "all" ? undefined : value,
                          }))
                        }
                      >
                        <SelectTrigger className="body-font">
                          <SelectValue placeholder="All employees" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All employees</SelectItem>
                          {employees.map((emp) => (
                            <SelectItem key={emp.employee_id} value={emp.employee_id!}>
                              {emp.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Reason */}
                    <div>
                      <Label htmlFor="blockReason" className="body-font">
                        Reason
                      </Label>
                      <Textarea
                        id="blockReason"
                        value={newBlockedTime.reason}
                        onChange={(e) => setNewBlockedTime((prev) => ({ ...prev, reason: e.target.value }))}
                        placeholder="e.g., Personal appointment, Training, Vacation, Holiday"
                        className="body-font"
                      />
                    </div>

                    {/* Recurring Options */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          id="isRecurring"
                          checked={newBlockedTime.is_recurring}
                          onCheckedChange={(checked) =>
                            setNewBlockedTime((prev) => ({ ...prev, is_recurring: checked }))
                          }
                        />
                        <Label htmlFor="isRecurring" className="body-font">
                          Recurring
                        </Label>
                      </div>

                      {newBlockedTime.is_recurring && (
                        <Select
                          value={newBlockedTime.recurrence_pattern || "weekly"}
                          onValueChange={(value) =>
                            setNewBlockedTime((prev) => ({
                              ...prev,
                              recurrence_pattern: value as "weekly" | "monthly",
                            }))
                          }
                        >
                          <SelectTrigger className="w-32 body-font">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button
                      onClick={addBlockedTime}
                      disabled={!newBlockedTime.start_date}
                      className="bg-[#E75837] hover:bg-[#d14a2a]"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Block Time
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Existing Blocked Times */}
              <div className="space-y-4">
                {blockedTimes.map((blockedTime) => (
                  <Card key={blockedTime.blocked_time_id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="font-medium body-font">
                              {new Date(blockedTime.date + "T12:00:00").toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                            {blockedTime.is_all_day && (
                              <Badge variant="secondary" className="text-xs">
                                All Day
                              </Badge>
                            )}
                            {blockedTime.is_recurring && (
                              <Badge variant="secondary" className="text-xs">
                                {blockedTime.recurrence_pattern}
                              </Badge>
                            )}
                          </div>
                          {!blockedTime.is_all_day && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className="body-font">
                                {blockedTime.start_time} - {blockedTime.end_time}
                              </span>
                            </div>
                          )}
                          {blockedTime.employee_id && (
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-500" />
                              <span className="body-font">
                                {employees.find((emp) => emp.employee_id === blockedTime.employee_id)?.name ||
                                  "Unknown Employee"}
                              </span>
                            </div>
                          )}
                          {blockedTime.reason && (
                            <p className="text-gray-600 body-font text-sm">{blockedTime.reason}</p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeBlockedTime(blockedTime.blocked_time_id!)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {blockedTimes.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-500 mb-2 header-font">No Blocked Time</h3>
                      <p className="text-gray-400 body-font">Block specific times when you're not available.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
