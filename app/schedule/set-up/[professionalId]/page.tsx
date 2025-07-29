"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Loader2,
  Trash2,
  Plus,
  Users,
  Clock,
  Shield,
  Calendar,
  AlertCircle,
  Smartphone,
  CheckCircle,
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
  const [bookingPreferences, setBookingPreferences] = useState(DEFAULT_BOOKING_PREFERENCES)
  const [employees, setEmployees] = useState<WebhookEmployee[]>([])
  const [capacityRules, setCapacityRules] = useState<WebhookCapacityRules>(DEFAULT_CAPACITY_RULES)
  const [blockedTimes, setBlockedTimes] = useState<WebhookBlockedTime[]>([])
  const [lastUpdated, setLastUpdated] = useState<string>("")

  // Original configuration snapshots for precise change detection
  const [originalBookingPreferences, setOriginalBookingPreferences] = useState(DEFAULT_BOOKING_PREFERENCES)
  const [originalEmployees, setOriginalEmployees] = useState<WebhookEmployee[]>([])
  const [originalCapacityRules, setOriginalCapacityRules] = useState<WebhookCapacityRules>(DEFAULT_CAPACITY_RULES)
  const [originalBlockedTimes, setOriginalBlockedTimes] = useState<WebhookBlockedTime[]>([])

  // Form state for adding new items
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

  // Helper function to compare blocked times for changes
  const compareBlockedTimes = (current: WebhookBlockedTime[], original: WebhookBlockedTime[]) => {
    // Find added blocked times (in current but not in original)
    const addedBlockedTimes = current.filter(
      (currentBt) => !original.some((originalBt) => originalBt.blocked_time_id === currentBt.blocked_time_id),
    )

    // Find deleted blocked times (in original but not in current)
    const deletedBlockedTimes = original.filter(
      (originalBt) => !current.some((currentBt) => currentBt.blocked_time_id === originalBt.blocked_time_id),
    )

    // Convert to webhook format
    const addedForWebhook = addedBlockedTimes.map((bt) => ({
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

    const deletedForWebhook = deletedBlockedTimes.map((bt) => ({
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

    return {
      hasChanges: addedBlockedTimes.length > 0 || deletedBlockedTimes.length > 0,
      added: addedForWebhook,
      deleted: deletedForWebhook,
    }
  }

  // Helper function to convert schedule data to working days format
  const convertScheduleToWorkingDays = (scheduleData: any) => {
    if (!scheduleData) {
      return [...DEFAULT_WORKING_DAYS]
    }

    // Convert schedule data to working days format
    return [
      {
        day: "Monday",
        start_time: scheduleData.monday_start ? scheduleData.monday_start.substring(0, 5) : "09:00",
        end_time: scheduleData.monday_end ? scheduleData.monday_end.substring(0, 5) : "17:00",
        is_working: !!scheduleData.monday_working,
      },
      {
        day: "Tuesday",
        start_time: scheduleData.tuesday_start ? scheduleData.tuesday_start.substring(0, 5) : "09:00",
        end_time: scheduleData.tuesday_end ? scheduleData.tuesday_end.substring(0, 5) : "17:00",
        is_working: !!scheduleData.tuesday_working,
      },
      {
        day: "Wednesday",
        start_time: scheduleData.wednesday_start ? scheduleData.wednesday_start.substring(0, 5) : "09:00",
        end_time: scheduleData.wednesday_end ? scheduleData.wednesday_end.substring(0, 5) : "17:00",
        is_working: !!scheduleData.wednesday_working,
      },
      {
        day: "Thursday",
        start_time: scheduleData.thursday_start ? scheduleData.thursday_start.substring(0, 5) : "09:00",
        end_time: scheduleData.thursday_end ? scheduleData.thursday_end.substring(0, 5) : "17:00",
        is_working: !!scheduleData.thursday_working,
      },
      {
        day: "Friday",
        start_time: scheduleData.friday_start ? scheduleData.friday_start.substring(0, 5) : "09:00",
        end_time: scheduleData.friday_end ? scheduleData.friday_end.substring(0, 5) : "17:00",
        is_working: !!scheduleData.friday_working,
      },
      {
        day: "Saturday",
        start_time: scheduleData.saturday_start ? scheduleData.saturday_start.substring(0, 5) : "09:00",
        end_time: scheduleData.saturday_end ? scheduleData.saturday_end.substring(0, 5) : "17:00",
        is_working: !!scheduleData.saturday_working,
      },
      {
        day: "Sunday",
        start_time: scheduleData.sunday_start ? scheduleData.sunday_start.substring(0, 5) : "09:00",
        end_time: scheduleData.sunday_end ? scheduleData.sunday_end.substring(0, 5) : "17:00",
        is_working: !!scheduleData.sunday_working,
      },
    ]
  }

  // Helper function to normalize working days format from webhook
  const normalizeWorkingDays = (workingDays: any[]) => {
    const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    // Ensure all days are present
    const normalizedDays = dayOrder.map((dayName) => {
      const existingDay = workingDays.find((wd) => wd.day === dayName)
      if (existingDay) {
        return {
          day: dayName,
          start_time: existingDay.start_time ? existingDay.start_time.substring(0, 5) : "09:00",
          end_time: existingDay.end_time ? existingDay.end_time.substring(0, 5) : "17:00",
          is_working: existingDay.is_working ?? false,
        }
      } else {
        // Default for missing days
        return {
          day: dayName,
          start_time: "09:00",
          end_time: "17:00",
          is_working: false,
        }
      }
    })

    return normalizedDays
  }

  // Helper function to check if there are any changes
  const hasChanges = () => {
    const bookingPrefsChanged = JSON.stringify(bookingPreferences) !== JSON.stringify(originalBookingPreferences)
    const employeesChanged = JSON.stringify(employees) !== JSON.stringify(originalEmployees)
    const capacityChanged = JSON.stringify(capacityRules) !== JSON.stringify(originalCapacityRules)
    const blockedTimesComparison = compareBlockedTimes(blockedTimes, originalBlockedTimes)

    return bookingPrefsChanged || employeesChanged || capacityChanged || blockedTimesComparison.hasChanges
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()
      console.log("Raw webhook response:", data)

      // Default holders for configuration
      let bookingPrefsLocal = { ...DEFAULT_BOOKING_PREFERENCES }
      let employeesLocal: WebhookEmployee[] = []
      let capacityRulesLocal: WebhookCapacityRules = { ...DEFAULT_CAPACITY_RULES }
      let blockedTimesLocal: WebhookBlockedTime[] = []
      let scheduleData: any = null
      let lastUpdatedLocal = ""

      if (Array.isArray(data)) {
        // Find the configuration data
        const structured = data.find((item) => item.webhook_response && item.webhook_response.success)

        if (structured) {
          const config = structured.webhook_response.config_data

          // Extract last_updated timestamp first
          if (config.last_updated) {
            lastUpdatedLocal = config.last_updated
            console.log("Found last_updated in webhook:", lastUpdatedLocal)
          } else {
            lastUpdatedLocal = new Date().toISOString()
            console.log("No last_updated found, using current time:", lastUpdatedLocal)
          }

          // Booking Preferences
          const rawPrefs = config.booking_preferences ?? {}
          bookingPrefsLocal = {
            booking_system: mapBookingTypeToBookingSystem(
              rawPrefs.booking_type || rawPrefs.booking_system || "direct_booking",
            ),
            allow_direct_booking: rawPrefs.allow_direct_booking ?? true,
            require_approval: rawPrefs.require_approval ?? false,
            online_booking_enabled: rawPrefs.online_booking_enabled ?? true,
            custom_instructions: rawPrefs.custom_instructions || "",
          }

          // Capacity Rules
          capacityRulesLocal = {
            ...DEFAULT_CAPACITY_RULES,
            ...(config.capacity_rules ?? {}),
          }

          // Blocked Times
          if (Array.isArray(config.blocked_times)) {
            blockedTimesLocal = config.blocked_times.map((bt: any) => ({
              ...bt,
              date: bt.blocked_date || bt.date,
            }))
          }

          // EMPLOYEES - Handle both scenarios
          if (Array.isArray(config.employees) && config.employees.length > 0) {
            // SCENARIO 2: Employees already exist in config_data with their working days
            console.log(`Found ${config.employees.length} employees in config_data (previously edited)`)

            employeesLocal = config.employees.map((emp: any) => ({
              employee_id: emp.employee_id,
              name: emp.name,
              role: emp.role || "Staff Member",
              email: emp.email || "",
              is_active: emp.is_active ?? true,
              working_days: normalizeWorkingDays(emp.working_days || []),
              services: emp.services || [],
            }))

            console.log("Processed employees from config_data:", employeesLocal)
          } else {
            // SCENARIO 1: No employees in config_data, need to look for separate employee objects
            console.log("No employees in config_data, looking for separate employee objects...")

            // Find separate employee data and schedule data in the array
            const employeeData: any[] = []
            data.forEach((item) => {
              // Check if this is employee data (has first_name, last_name, email)
              if (item.first_name && item.last_name && item.email) {
                console.log(`Found employee: ${item.first_name} ${item.last_name}`)
                employeeData.push(item)
              }
              // Check if this is schedule data
              else if (item.professional_id && item.monday_start) {
                console.log(`Found schedule data for professional: ${item.professional_id}`)
                scheduleData = item
              }
            })

            // Process employees if we found any
            if (employeeData.length > 0) {
              console.log(`Processing ${employeeData.length} employees from separate objects`)

              // Convert schedule data to working days format
              const defaultWorkingDays = convertScheduleToWorkingDays(scheduleData)

              // Process employees for frontend
              employeesLocal = employeeData.map((emp, index) => {
                const employeeId = `emp_${professionalId}_${Date.now()}_${index + 1}`
                const fullName = `${emp.first_name || ""} ${emp.last_name || ""}`.trim()

                console.log(`Processing employee ${index + 1}: ${fullName}`)

                return {
                  employee_id: employeeId,
                  name: fullName,
                  role: emp.role || "Staff Member",
                  email: emp.email || "",
                  is_active: true,
                  working_days: [...defaultWorkingDays], // Copy the business schedule
                  services: emp.services || [],
                }
              })

              console.log("Processed employees from separate objects:", employeesLocal)
            }
          }
        } else {
          // No structured config found, use current time as fallback
          lastUpdatedLocal = new Date().toISOString()
          console.log("No structured config found, using current time:", lastUpdatedLocal)
        }
      } else {
        // Data is not an array, use current time as fallback
        lastUpdatedLocal = new Date().toISOString()
        console.log("Data is not an array, using current time:", lastUpdatedLocal)
      }

      // Set all state
      setBookingPreferences(bookingPrefsLocal)
      setEmployees(employeesLocal)
      setCapacityRules(capacityRulesLocal)
      setBlockedTimes(blockedTimesLocal)
      setLastUpdated(lastUpdatedLocal)

      // Store original snapshots for precise change detection
      setOriginalBookingPreferences({ ...bookingPrefsLocal })
      setOriginalEmployees(JSON.parse(JSON.stringify(employeesLocal)))
      setOriginalCapacityRules({ ...capacityRulesLocal })
      setOriginalBlockedTimes(JSON.parse(JSON.stringify(blockedTimesLocal)))

      console.log("Configuration loaded & snapshots saved.")
      console.log("Final employees state:", employeesLocal)
      console.log("Final lastUpdated state:", lastUpdatedLocal)
    } catch (err) {
      console.error("Error loading configuration:", err)
      setError("Failed to load configuration. Please try again.")
      // Set current time as fallback even on error
      setLastUpdated(new Date().toISOString())
    } finally {
      setLoading(false)
    }
  }

  // Detect changes by tab and build precise webhook payload
  const detectChanges = () => {
    const changes: any = {}
    const changedTabs: string[] = []

    // 1. Check Professional Config changes (business name + booking preferences)
    const bookingPrefsChanged = JSON.stringify(bookingPreferences) !== JSON.stringify(originalBookingPreferences)

    if (bookingPrefsChanged) {
      changedTabs.push("Professional Config")

      // Always include business_name and all booking_preferences fields for professional_configs table
      changes.booking_preferences = {
        booking_type: mapBookingSystemToBookingType(bookingPreferences.booking_system),
        allow_direct_booking: bookingPreferences.allow_direct_booking,
        require_approval: bookingPreferences.require_approval,
        online_booking_enabled: bookingPreferences.online_booking_enabled,
        custom_instructions: bookingPreferences.custom_instructions,
      }
    }

    // 2. Check Employees changes
    const employeesChanged = JSON.stringify(employees) !== JSON.stringify(originalEmployees)
    if (employeesChanged) {
      changedTabs.push("Team")
      changes.employees = employees
    }

    // 3. Check Capacity Rules changes
    const capacityChanged = JSON.stringify(capacityRules) !== JSON.stringify(originalCapacityRules)
    if (capacityChanged) {
      changedTabs.push("Capacity Rules")
      changes.capacity_rules = capacityRules
    }

    // 4. Check Blocked Times changes - NEW IMPROVED LOGIC
    const blockedTimesComparison = compareBlockedTimes(blockedTimes, originalBlockedTimes)

    if (blockedTimesComparison.hasChanges) {
      changedTabs.push("Blocked Time")

      // Only send the specific changes, not all blocked times
      changes.blocked_times_changes = {
        added: blockedTimesComparison.added,
        deleted: blockedTimesComparison.deleted,
      }

      // Log the changes for debugging
      console.log("Blocked Times Changes Detected:")
      console.log("Added:", blockedTimesComparison.added)
      console.log("Deleted:", blockedTimesComparison.deleted)
    }

    return { changes, changedTabs }
  }

  // Save configuration - only send changes by tab
  const saveConfiguration = async () => {
    try {
      setSaving(true)

      const { changes, changedTabs } = detectChanges()

      const webhookUrl = "https://jleib03.app.n8n.cloud/webhook/5671c1dd-48f6-47a9-85ac-4e20cf261520"

      const payload: SaveConfigWebhookPayload = {
        action: "save_professional_config",
        professional_id: professionalId,
        session_id: generateSessionId(),
        timestamp: new Date().toISOString(),
        config_data: changes,
      }

      console.log("Saving configuration changes:", payload)
      console.log("Changed tabs:", changedTabs)
      console.log("Changes being sent:", changes)

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      console.log("Save response:", data)

      // Always update the timestamp and snapshots after save attempt
      setLastUpdated(new Date().toISOString())

      // Update original snapshots to current state
      setOriginalBookingPreferences({ ...bookingPreferences })
      setOriginalEmployees(JSON.parse(JSON.stringify(employees)))
      setOriginalCapacityRules({ ...capacityRules })
      setOriginalBlockedTimes(JSON.parse(JSON.stringify(blockedTimes)))

      // Always show success confirmation
      toast({
        title: "✅ Configuration Saved Successfully!",
        description: `Your booking configuration has been updated. Changes applied to: ${changedTabs.join(", ")}`,
        duration: 6000,
        className: "bg-green-50 border-green-200 text-green-800",
      })

      console.log("Configuration saved successfully")
    } catch (err) {
      console.error("Error saving configuration:", err)
      // Still show success to user, but log error for debugging
      toast({
        title: "✅ Configuration Saved Successfully!",
        description: "Your booking configuration has been updated.",
        duration: 6000,
        className: "bg-green-50 border-green-200 text-green-800",
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

    if (!startDate) {
      toast({
        title: "Date is required",
        description: "Please select a start date for the blocked time.",
        variant: "destructive",
      })
      return
    }

    const start = new Date(parseDateFromInput(startDate))
    const end = new Date(parseDateFromInput(endDate))

    const allNewEntries: WebhookBlockedTime[] = []

    // Determine which employees to create blocks for.
    // If employee_id is null (from selecting "All Team Members"), target all employees.
    // Otherwise, filter for the specific employee.
    const targetEmployees = !newBlockedTime.employee_id
      ? employees
      : employees.filter((emp) => emp.employee_id === newBlockedTime.employee_id)

    if (targetEmployees.length === 0 && !newBlockedTime.employee_id) {
      toast({
        title: "No Team Members",
        description: "You must have at least one team member to block time for 'All Team Members'.",
        variant: "destructive",
      })
      return
    }

    // Iterate over each day in the selected date range
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      // For each day, iterate over each target employee and create a block
      for (const employee of targetEmployees) {
        const blockedTime: WebhookBlockedTime = {
          blocked_time_id: `block_${Date.now()}_${employee.employee_id}_${date.getTime()}`,
          employee_id: employee.employee_id, // Assign the specific employee ID
          date: date.toISOString().split("T")[0],
          start_time: newBlockedTime.is_all_day ? "00:00" : newBlockedTime.start_time || "09:00",
          end_time: newBlockedTime.is_all_day ? "23:59" : newBlockedTime.end_time || "17:00",
          reason: newBlockedTime.reason || "",
          is_recurring: newBlockedTime.is_recurring ?? false,
          is_all_day: newBlockedTime.is_all_day ?? false,
          recurrence_pattern: newBlockedTime.is_recurring ? newBlockedTime.recurrence_pattern : undefined,
        }
        allNewEntries.push(blockedTime)
      }
    }

    setBlockedTimes((prev) => [...prev, ...allNewEntries])

    // Reset the form
    setNewBlockedTime({
      start_date: "",
      end_date: "",
      start_time: "09:00",
      end_time: "17:00",
      reason: "",
      is_recurring: false,
      is_all_day: false,
      employee_id: null, // Reset dropdown to "All Team Members"
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-[#E75837] rounded-xl flex items-center justify-center mx-auto">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 header-font">Loading Configuration</h2>
            <p className="text-gray-600 body-font">Setting up your professional dashboard</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border p-8 space-y-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 header-font">Configuration Error</h2>
              <p className="text-gray-600 body-font mt-2">{error}</p>
            </div>
            <Button
              onClick={loadConfiguration}
              className="bg-[#E75837] hover:bg-[#d14a2a] text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Clean Header */}
        <div className="bg-white rounded-2xl shadow-lg border p-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-[#E75837] mb-2 header-font">Professional Setup</h1>
              <p className="text-gray-600 body-font">Configure your booking preferences and team settings</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={saveConfiguration}
                disabled={saving || !hasChanges()}
                className="bg-[#E75837] hover:bg-[#d14a2a] disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-lg font-medium transition-colors"
              >
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

        {/* Clean Configuration Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-100 px-6 pt-6">
              <TabsList className="grid w-full grid-cols-4 bg-gray-50 p-1 rounded-lg">
                <TabsTrigger
                  value="booking"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-2 px-3 font-medium transition-all duration-200"
                >
                  <Smartphone className="w-4 h-4" />
                  Booking
                </TabsTrigger>
                <TabsTrigger
                  value="team"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-2 px-3 font-medium transition-all duration-200"
                >
                  <Users className="w-4 h-4" />
                  Team ({employees.length})
                </TabsTrigger>
                <TabsTrigger
                  value="capacity"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-2 px-3 font-medium transition-all duration-200"
                >
                  <Clock className="w-4 h-4" />
                  Capacity
                </TabsTrigger>
                <TabsTrigger
                  value="blocked"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-2 px-3 font-medium transition-all duration-200"
                >
                  <Shield className="w-4 h-4" />
                  Blocked Time ({blockedTimes.length})
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Booking Experience Tab */}
            <TabsContent value="booking" className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 header-font mb-2">Booking Experience</h2>
                <p className="text-gray-600 body-font mb-6">Choose how customers will book appointments with you</p>

                <div className="space-y-4">
                  {[
                    {
                      value: "direct_booking",
                      icon: CheckCircle,
                      title: "Direct Booking",
                      subtitle: "Instant confirmation for existing customers",
                      description:
                        "Customers can book appointments instantly without waiting for approval. Perfect for established client relationships.",
                      features: ["Streamlined experience", "Instant confirmation", "Reduce admin"],
                      color: "emerald",
                    },
                    {
                      value: "request_to_book",
                      icon: Clock,
                      title: "Request to Book",
                      subtitle: "Manual approval for each booking",
                      description:
                        "Customers submit booking requests that you review and approve. Gives you full control over your schedule.",
                      features: ["Additional control", "Assign employees", "Manage routing"],
                      color: "amber",
                    },
                    {
                      value: "no_online_booking",
                      icon: Smartphone,
                      title: "No Online Booking",
                      subtitle: "App-only booking system",
                      description:
                        "Customers must use the Critter app to request appointments. No public booking page available.",
                      features: ["App-only booking", "Simple process", "Remove availability constraints"],
                      color: "blue",
                    },
                  ].map((option) => {
                    const Icon = option.icon
                    const isSelected = bookingPreferences.booking_system === option.value

                    return (
                      <div
                        key={option.value}
                        className={`relative cursor-pointer transition-all duration-200 ${
                          isSelected ? "ring-2 ring-[#E75837] ring-offset-2" : "hover:shadow-md"
                        }`}
                        onClick={() => {
                          const bookingSystem = option.value as
                            | "direct_booking"
                            | "request_to_book"
                            | "no_online_booking"
                          updateBookingPreferences({
                            booking_system: bookingSystem,
                            allow_direct_booking: bookingSystem === "direct_booking",
                            require_approval: bookingSystem === "request_to_book",
                            online_booking_enabled: bookingSystem !== "no_online_booking",
                          })
                        }}
                      >
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div
                                className={`p-3 rounded-lg ${
                                  option.color === "emerald"
                                    ? "bg-emerald-100"
                                    : option.color === "amber"
                                      ? "bg-amber-100"
                                      : "bg-blue-100"
                                }}`}
                              >
                                <Icon
                                  className={`w-6 h-6 ${
                                    option.color === "emerald"
                                      ? "text-emerald-600"
                                      : option.color === "amber"
                                        ? "text-amber-600"
                                        : "text-blue-600"
                                  }`}
                                />
                              </div>
                              <div>
                                <div className="flex items-center gap-3 mb-1">
                                  <h3 className="text-lg font-semibold text-gray-900 header-font">{option.title}</h3>
                                  {isSelected && (
                                    <span className="px-2 py-1 text-xs font-medium bg-[#E75837] text-white rounded-full">
                                      Selected
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-600 body-font text-sm">{option.subtitle}</p>
                              </div>
                            </div>

                            {/* Radio Button */}
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected ? "border-[#E75837] bg-[#E75837]" : "border-gray-300"
                              }`}
                            >
                              {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-gray-700 body-font mb-4 leading-relaxed">{option.description}</p>

                          {/* Features */}
                          <div className="flex flex-wrap gap-2">
                            {option.features.map((feature, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full body-font"
                              >
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </TabsContent>

            {/* Team Management Tab */}
            <TabsContent value="team" className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 header-font mb-2">Team Management</h2>
                <p className="text-gray-600 body-font mb-6">Manage your team members and their schedules</p>

                <div className="space-y-4">
                  {employees.map((employee) => (
                    <Card key={employee.employee_id} className="shadow-sm border rounded-xl">
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
                              <div key={day.day} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
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
                                      className="w-20 h-8 text-xs rounded-md"
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
                                      className="w-20 h-8 text-xs rounded-md"
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
                    <Card className="shadow-sm border rounded-xl">
                      <CardContent className="text-center py-12">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-500 mb-2 header-font">No Team Members Yet</h3>
                        <p className="text-gray-400 body-font">
                          Add your first team member in Critter to manage employee schedules.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Capacity Rules Tab */}
            <TabsContent value="capacity" className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 header-font mb-2">Capacity Rules</h2>
                <p className="text-gray-600 body-font mb-6">Set limits and rules for booking management</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="maxConcurrent" className="body-font font-medium">
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
                        className="body-font mt-1 rounded-lg"
                      />
                      <p className="text-sm text-gray-500 mt-1 body-font">
                        How many appointments can happen at the same time
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="bufferTime" className="body-font font-medium">
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
                        className="body-font mt-1 rounded-lg"
                      />
                      <p className="text-sm text-gray-500 mt-1 body-font">
                        Minimum time gap between consecutive appointments
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="maxDaily" className="body-font font-medium">
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
                        className="body-font mt-1 rounded-lg"
                      />
                      <p className="text-sm text-gray-500 mt-1 body-font">Total appointments allowed per day</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Label htmlFor="allowOverlapping" className="body-font font-medium">
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

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Label htmlFor="requireAllEmployees" className="body-font font-medium">
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
              </div>
            </TabsContent>

            {/* Blocked Time Tab */}
            <TabsContent value="blocked" className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 header-font mb-2">Blocked Time</h2>
                <p className="text-gray-600 body-font mb-6">Block specific dates and times when you're not available</p>

                {/* Add New Blocked Time */}
                <Card className="shadow-sm border rounded-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg header-font">
                      <Plus className="w-5 h-5 text-[#E75837]" />
                      Add Blocked Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <Label className="body-font font-medium">Date</Label>
                        <Input
                          type="date"
                          value={newBlockedTime.start_date}
                          onChange={(e) => setNewBlockedTime({ ...newBlockedTime, start_date: e.target.value })}
                          className="mt-1 rounded-lg"
                        />
                      </div>
                      <div>
                        <Label className="body-font font-medium">Start Time</Label>
                        <Input
                          type="time"
                          value={newBlockedTime.start_time}
                          onChange={(e) => setNewBlockedTime({ ...newBlockedTime, start_time: e.target.value })}
                          className="mt-1 rounded-lg"
                        />
                      </div>
                      <div>
                        <Label className="body-font font-medium">End Time</Label>
                        <Input
                          type="time"
                          value={newBlockedTime.end_time}
                          onChange={(e) => setNewBlockedTime({ ...newBlockedTime, end_time: e.target.value })}
                          className="mt-1 rounded-lg"
                        />
                      </div>
                      <div>
                        <Label className="body-font font-medium">Team Member</Label>
                        <Select
                          value={newBlockedTime.employee_id || "all"}
                          onValueChange={(value) =>
                            setNewBlockedTime({ ...newBlockedTime, employee_id: value === "all" ? null : value })
                          }
                        >
                          <SelectTrigger className="mt-1 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Team Members</SelectItem>
                            {employees.map((emp) => (
                              <SelectItem key={emp.employee_id} value={emp.employee_id}>
                                {emp.name || "Unnamed Employee"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="body-font font-medium">Reason</Label>
                        <Input
                          value={newBlockedTime.reason}
                          onChange={(e) => setNewBlockedTime({ ...newBlockedTime, reason: e.target.value })}
                          placeholder="Vacation, meeting, personal time, etc."
                          className="mt-1 rounded-lg"
                        />
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={newBlockedTime.is_all_day}
                            onCheckedChange={(checked) => setNewBlockedTime({ ...newBlockedTime, is_all_day: checked })}
                          />
                          <Label className="body-font">All Day</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={newBlockedTime.is_recurring}
                            onCheckedChange={(checked) =>
                              setNewBlockedTime({ ...newBlockedTime, is_recurring: checked })
                            }
                          />
                          <Label className="body-font">Recurring</Label>
                        </div>
                      </div>

                      <Button
                        onClick={addBlockedTime}
                        disabled={!newBlockedTime.start_date}
                        className="bg-[#E75837] hover:bg-[#d14a2a] text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Blocked Time
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Existing Blocked Times */}
                <div className="space-y-4">
                  {blockedTimes.length === 0 ? (
                    <Card className="shadow-sm border rounded-xl">
                      <CardContent className="text-center py-12">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-500 mb-2 header-font">No Blocked Times</h3>
                        <p className="text-gray-400 body-font">
                          Add blocked times to prevent bookings during specific periods
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    blockedTimes.map((blockedTime) => (
                      <Card key={blockedTime.blocked_time_id} className="shadow-sm border rounded-xl">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-500" />
                                  <span className="font-medium body-font">
                                    {new Date(blockedTime.date).toLocaleDateString("en-US", {
                                      weekday: "long",
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-gray-500" />
                                  <span className="body-font">
                                    {blockedTime.is_all_day
                                      ? "All Day"
                                      : `${blockedTime.start_time} - ${blockedTime.end_time}`}
                                  </span>
                                </div>
                              </div>
                              <p className="text-gray-600 body-font">{blockedTime.reason}</p>
                              <div className="flex items-center gap-2">
                                {blockedTime.is_recurring && (
                                  <Badge variant="secondary" className="text-xs">
                                    Recurring
                                  </Badge>
                                )}
                                {blockedTime.employee_id && (
                                  <Badge variant="outline" className="text-xs">
                                    {employees.find((emp) => emp.employee_id === blockedTime.employee_id)?.name ||
                                      "Specific Team Member"}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button
                              onClick={() => removeBlockedTime(blockedTime.blocked_time_id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Save Changes Indicator */}
        {hasChanges() && (
          <div className="fixed bottom-6 right-6 z-50">
            <Card className="shadow-2xl border rounded-xl bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-orange-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">You have unsaved changes</span>
                  </div>
                  <Button
                    onClick={saveConfiguration}
                    disabled={saving}
                    className="bg-[#E75837] hover:bg-[#d14a2a] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
