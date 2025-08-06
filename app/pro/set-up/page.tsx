"use client"

import { useState, useEffect, useCallback } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Trash2, PlusCircle, Copy, ChevronDown, ChevronUp, Loader2, Save, Settings, Users, Clock, Ban, ArrowRight, Eye, Globe, LinkIcon } from 'lucide-react'
import { getWebhookEndpoint, logWebhookUsage } from "@/types/webhook-endpoints"
import Header from "../../../components/header"
import PasswordProtection from "../../../components/password-protection"
import { useRouter } from "next/navigation"

// ... (types remain the same)
interface WorkingDay {
  day: string
  start: string
  end: string
  isWorking: boolean
}

interface Employee {
  id: string
  name: string
  role: string
  email: string
  isActive: boolean
  workingDays: WorkingDay[]
  services: string[]
}

interface CapacityRules {
  maxConcurrentBookings: number
  bufferTimeBetweenBookings: number
  maxBookingsPerDay: number
  allowOverlapping: boolean
  requireAllEmployeesForService: boolean
}

interface BlockedTime {
  id: string
  date: string
  startTime: string
  endTime: string
  reason: string
  employeeId?: string
  isRecurring: boolean
  recurrencePattern?: string
  isAllDay: boolean
}

interface BookingPreferences {
  business_name: string
  booking_system: "direct_booking" | "request_booking"
  allow_direct_booking: boolean
  require_approval: boolean
  online_booking_enabled: boolean
  show_prices: boolean
}

interface ProfessionalConfig {
  professionalId: string
  businessName: string
  employees: Employee[]
  capacityRules: CapacityRules
  blockedTimes: BlockedTime[]
  bookingPreferences: BookingPreferences
  lastUpdated: string
}

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2)
  const minutes = i % 2 === 0 ? "00" : "30"
  const formattedHours = hours.toString().padStart(2, "0")
  return `${formattedHours}:${minutes}`
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
  const [professionalId, setProfessionalId] = useState("pro_12345") // Replace with actual ID logic
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

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [businessName, setBusinessName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [originalError, setOriginalError] = useState("")
  const [showResults, setShowResults] = useState(false)
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduleProfessionalId, setScheduleProfessionalId] = useState("")
  const [scheduleError, setScheduleError] = useState("")
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewUniqueUrl, setPreviewUniqueUrl] = useState("")
  const [previewError, setPreviewError] = useState("")

  // Custom URL states
  const [customUrl, setCustomUrl] = useState("")
  const [isCreatingUrl, setIsCreatingUrl] = useState(false)
  const [urlError, setUrlError] = useState("")
  const [urlSuccess, setUrlSuccess] = useState("")
  const [createdCustomUrl, setCreatedCustomUrl] = useState("")

  const WEBHOOK_URL = "https://jleib03.app.n8n.cloud/webhook/dce0dbdb-2834-4a95-a483-d19042dd49c4"
  const CUSTOM_URL_WEBHOOK = "https://jleib03.app.n8n.cloud/webhook/5671c1dd-48f6-47a9-85ac-4e20cf261520"
  const router = useRouter()

  const toggleSection = (section: keyof typeof activeSections) => {
    setActiveSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const loadConfiguration = useCallback(async () => {
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
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Loaded config data:", data)

      // Find the object containing the configuration
      const configData = data.find((item: any) => item.config_data)?.config_data
      if (!configData) {
        throw new Error("Configuration data not found in response.")
      }

      // Map response to ProfessionalConfig state
      const mappedConfig: ProfessionalConfig = {
        professionalId: configData.professional_id || professionalId,
        businessName: configData.business_name || "",
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
              })) || [],
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
          business_name: configData.booking_preferences?.business_name || "",
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
      setError(
        err instanceof Error ? err.message : "An unknown error occurred.",
      )
      // Initialize with default config on failure
      initializeDefaultConfig()
    } finally {
      setIsLoading(false)
    }
  }, [professionalId])

  const initializeDefaultConfig = () => {
    setConfig({
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
    })
  }

  useEffect(() => {
    loadConfiguration()
  }, [loadConfiguration])

  const handleConfigChange = (
    section: keyof ProfessionalConfig,
    value: any,
  ) => {
    setConfig((prev) => (prev ? { ...prev, [section]: value } : null))
  }

  const handleBookingPrefChange = (
    field: keyof BookingPreferences,
    value: any,
  ) => {
    setConfig((prev) =>
      prev
        ? {
            ...prev,
            bookingPreferences: { ...prev.bookingPreferences, [field]: value },
          }
        : null,
    )
  }

  const handleEmployeeChange = (
    employeeId: string,
    field: keyof Employee,
    value: any,
  ) => {
    setConfig((prev) =>
      prev
        ? {
            ...prev,
            employees: prev.employees.map((emp) =>
              emp.id === employeeId ? { ...emp, [field]: value } : emp,
            ),
          }
        : null,
    )
  }

  const handleWorkingDayChange = (
    employeeId: string,
    day: string,
    field: keyof WorkingDay,
    value: any,
  ) => {
    setConfig((prev) =>
      prev
        ? {
            ...prev,
            employees: prev.employees.map((emp) =>
              emp.id === employeeId
                ? {
                    ...emp,
                    workingDays: emp.workingDays.map((wd) =>
                      wd.day === day ? { ...wd, [field]: value } : wd,
                    ),
                  }
                : emp,
            ),
          }
        : null,
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
        start: "09:00",
        end: "17:00",
        isWorking: day !== "Saturday" && day !== "Sunday",
      })),
      services: [],
    }
    setConfig((prev) =>
      prev ? { ...prev, employees: [...prev.employees, newEmployee] } : null,
    )
  }

  const removeEmployee = (employeeId: string) => {
    setConfig((prev) =>
      prev
        ? {
            ...prev,
            employees: prev.employees.filter((emp) => emp.id !== employeeId),
          }
        : null,
    )
  }

  const handleCapacityRuleChange = (
    field: keyof CapacityRules,
    value: any,
  ) => {
    setConfig((prev) =>
      prev
        ? {
            ...prev,
            capacityRules: { ...prev.capacityRules, [field]: value },
          }
        : null,
    )
  }

  const addBlockedTime = () => {
    const newBlockedTime: BlockedTime = {
      id: `bt_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      startTime: "12:00",
      endTime: "13:00",
      reason: "Lunch Break",
      isRecurring: false,
      isAllDay: false,
    }
    setConfig((prev) =>
      prev
        ? { ...prev, blockedTimes: [...prev.blockedTimes, newBlockedTime] }
        : null,
    )
  }

  const removeBlockedTime = (blockedTimeId: string) => {
    setConfig((prev) =>
      prev
        ? {
            ...prev,
            blockedTimes: prev.blockedTimes.filter(
              (bt) => bt.id !== blockedTimeId,
            ),
          }
        : null,
    )
  }

  const handleBlockedTimeChange = (
    blockedTimeId: string,
    field: keyof BlockedTime,
    value: any,
  ) => {
    setConfig((prev) =>
      prev
        ? {
            ...prev,
            blockedTimes: prev.blockedTimes.map((bt) =>
              bt.id === blockedTimeId ? { ...bt, [field]: value } : bt,
            ),
          }
        : null,
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
        throw new Error(
          `HTTP error! status: ${response.status}, body: ${errorBody}`,
        )
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
        description:
          err instanceof Error ? err.message : "Could not save settings.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // If not authenticated, show password protection
  // if (!isAuthenticated) {
  //   return (
  //     <PasswordProtection
  //       onAuthenticated={() => setIsAuthenticated(true)}
  //       title="Critter Professional Access"
  //       description="Enter your professional password to access setup tools and resources."
  //     />
  //   )
  // }

  const handleSetupClick = () => {
    setShowModal(true)
    setOriginalError("")
    setBusinessName("")
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setOriginalError("")
    setBusinessName("")
    setIsSubmitting(false)
  }

  const handleSubmit = async () => {
    if (!businessName.trim()) {
      setOriginalError("Please enter your business name")
      return
    }

    setIsSubmitting(true)
    setOriginalError("")

    try {
      const payload = {
        action: "get-url",
        businessName: businessName.trim(),
        timestamp: new Date().toISOString(),
        source: "professional_setup_page",
      }

      console.log("Sending request to get professional ID:", payload)

      const response = await fetch(WEBHOOK_URL, {
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
      console.log("Received response:", data)

      // Handle the response format: [{"id":"151"}]
      let professionalId = null

      if (Array.isArray(data) && data.length > 0 && data[0].id) {
        professionalId = data[0].id
      } else if (data.professionalId) {
        professionalId = data.professionalId
      } else if (data.id) {
        professionalId = data.id
      }

      if (professionalId) {
        setProfessionalId(professionalId)
        setShowModal(false)
        setShowResults(true)
      } else {
        setOriginalError("Business not found. Please check the spelling and try again.")
      }
    } catch (error) {
      console.error("Error getting professional ID:", error)
      setOriginalError("There was an error processing your request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateCustomUrl = async () => {
    if (!customUrl.trim()) {
      setUrlError("Please enter a custom URL")
      return
    }

    // Basic URL validation
    const urlPattern = /^[a-zA-Z0-9-_]+$/
    if (!urlPattern.test(customUrl.trim())) {
      setUrlError("URL can only contain letters, numbers, hyphens, and underscores")
      return
    }

    setIsCreatingUrl(true)
    setUrlError("")
    setUrlSuccess("")

    try {
      const payload = {
        action: "create-url",
        professionalId: professionalId,
        customUrl: customUrl.trim(),
        timestamp: new Date().toISOString(),
        source: "professional_setup_page",
      }

      console.log("Sending request to create custom URL:", payload)

      const response = await fetch(CUSTOM_URL_WEBHOOK, {
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
      console.log("Received response:", data)

      // Handle the new response format: [{"status":"success","message":"URL created successfully","url_id":5,"professional_id":"152","unique_url":"sully","date_modified":"2025-07-18T22:09:00.742Z"}]
      let isSuccess = false
      let responseMessage = ""
      let createdUrl = ""

      if (Array.isArray(data) && data.length > 0) {
        const firstItem = data[0]
        if (firstItem.status === "success") {
          isSuccess = true
          responseMessage = firstItem.message || "URL created successfully"
          createdUrl = firstItem.unique_url || customUrl.trim()
        } else {
          responseMessage = firstItem.message || "Failed to create custom URL"
        }
      } else if (data.success) {
        // Fallback for old response format
        isSuccess = true
        responseMessage = data.message || "URL created successfully"
        createdUrl = customUrl.trim()
      } else {
        responseMessage = data.message || "Failed to create custom URL"
      }

      if (isSuccess) {
        setCreatedCustomUrl(createdUrl)
        setUrlSuccess(
          `Custom URL created successfully! Your page is now available at: booking.critter.pet/${createdUrl}`,
        )
        setCustomUrl("")
      } else {
        setUrlError(responseMessage || "Failed to create custom URL. It may already be taken.")
      }
    } catch (error) {
      console.error("Error creating custom URL:", error)
      setUrlError("There was an error creating your custom URL. Please try again.")
    } finally {
      setIsCreatingUrl(false)
    }
  }

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates((prev) => ({ ...prev, [key]: true }))
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [key]: false }))
      }, 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const landingUrl = `https://booking.critter.pet/${professionalId}`

  const handleScheduleSetupClick = () => {
    setShowScheduleModal(true)
    setScheduleError("")
    setScheduleProfessionalId("")
  }

  const handleCloseScheduleModal = () => {
    setShowScheduleModal(false)
    setScheduleError("")
    setScheduleProfessionalId("")
  }

  const handleScheduleSubmit = () => {
    if (!scheduleProfessionalId.trim()) {
      setScheduleError("Please enter your Professional ID")
      return
    }

    // Navigate directly to schedule setup page
    router.push(`/schedule/set-up/${scheduleProfessionalId.trim()}`)
  }

  const handlePreviewClick = () => {
    setShowPreviewModal(true)
    setPreviewError("")
    setPreviewUniqueUrl("")
  }

  const handleClosePreviewModal = () => {
    setShowPreviewModal(false)
    setPreviewError("")
    setPreviewUniqueUrl("")
  }

  const handlePreviewSubmit = () => {
    if (!previewUniqueUrl.trim()) {
      setPreviewError("Please enter your unique URL")
      return
    }

    // Navigate directly to the professional landing page using unique URL
    window.open(`https://booking.critter.pet/${previewUniqueUrl.trim()}`, "_blank")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#E75837]" />
      </div>
    )
  }

  if (error || !config) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-500">Error: {error}</p>
          <Button onClick={loadConfiguration} className="mt-4">
            Retry
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
            Manage your availability, booking rules, and team members.
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
              {activeSections.bookingPrefs ? (
                <ChevronUp />
              ) : (
                <ChevronDown />
              )}
            </CardHeader>
            {activeSections.bookingPrefs && (
              <CardContent className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={config.bookingPreferences.business_name}
                      onChange={(e) =>
                        handleBookingPrefChange("business_name", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="bookingSystem">Booking System</Label>
                    <Select
                      value={config.bookingPreferences.booking_system}
                      onValueChange={(value) =>
                        handleBookingPrefChange("booking_system", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select system" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="direct_booking">
                          Direct Booking
                        </SelectItem>
                        <SelectItem value="request_booking">
                          Request Booking
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <Label htmlFor="onlineBookingEnabled">
                      Enable Online Booking
                    </Label>
                    <Switch
                      id="onlineBookingEnabled"
                      checked={config.bookingPreferences.online_booking_enabled}
                      onCheckedChange={(checked) =>
                        handleBookingPrefChange(
                          "online_booking_enabled",
                          checked,
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <Label htmlFor="allowDirectBooking">
                      Allow Direct Booking (no approval needed)
                    </Label>
                    <Switch
                      id="allowDirectBooking"
                      checked={config.bookingPreferences.allow_direct_booking}
                      onCheckedChange={(checked) =>
                        handleBookingPrefChange(
                          "allow_direct_booking",
                          checked,
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <Label htmlFor="requireApproval">
                      Require Approval for All Bookings
                    </Label>
                    <Switch
                      id="requireApproval"
                      checked={config.bookingPreferences.require_approval}
                      onCheckedChange={(checked) =>
                        handleBookingPrefChange("require_approval", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <Label htmlFor="showPrices">Show Prices to Customers</Label>
                    <Switch
                      id="showPrices"
                      checked={config.bookingPreferences.show_prices}
                      onCheckedChange={(checked) =>
                        handleBookingPrefChange("show_prices", checked)
                      }
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
                  <div
                    key={employee.id}
                    className="p-4 border rounded-lg space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
                        <div>
                          <Label htmlFor={`emp-name-${employee.id}`}>
                            Name
                          </Label>
                          <Input
                            id={`emp-name-${employee.id}`}
                            value={employee.name}
                            onChange={(e) =>
                              handleEmployeeChange(
                                employee.id,
                                "name",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor={`emp-role-${employee.id}`}>
                            Role
                          </Label>
                          <Input
                            id={`emp-role-${employee.id}`}
                            value={employee.role}
                            onChange={(e) =>
                              handleEmployeeChange(
                                employee.id,
                                "role",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor={`emp-email-${employee.id}`}>
                            Email
                          </Label>
                          <Input
                            id={`emp-email-${employee.id}`}
                            type="email"
                            value={employee.email}
                            onChange={(e) =>
                              handleEmployeeChange(
                                employee.id,
                                "email",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-4"
                        onClick={() => removeEmployee(employee.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label>Working Hours</Label>
                      {employee.workingDays.map((day) => (
                        <div
                          key={day.day}
                          className="flex items-center gap-4 p-2 bg-gray-50 rounded"
                        >
                          <Switch
                            checked={day.isWorking}
                            onCheckedChange={(checked) =>
                              handleWorkingDayChange(
                                employee.id,
                                day.day,
                                "isWorking",
                                checked,
                              )
                            }
                          />
                          <span className="w-24">{day.day}</span>
                          <Select
                            value={day.start}
                            onValueChange={(value) =>
                              handleWorkingDayChange(
                                employee.id,
                                day.day,
                                "start",
                                value,
                              )
                            }
                            disabled={!day.isWorking}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span>to</span>
                          <Select
                            value={day.end}
                            onValueChange={(value) =>
                              handleWorkingDayChange(
                                employee.id,
                                day.day,
                                "end",
                                value,
                              )
                            }
                            disabled={!day.isWorking}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
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
                  <Input
                    type="number"
                    value={config.capacityRules.maxConcurrentBookings}
                    onChange={(e) =>
                      handleCapacityRuleChange(
                        "maxConcurrentBookings",
                        parseInt(e.target.value),
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Buffer Time Between Bookings (minutes)</Label>
                  <Input
                    type="number"
                    value={config.capacityRules.bufferTimeBetweenBookings}
                    onChange={(e) =>
                      handleCapacityRuleChange(
                        "bufferTimeBetweenBookings",
                        parseInt(e.target.value),
                    type="number"
                    value={config.capacityRules.bufferTimeBetweenBookings}
                    onChange={(e) =>
                      handleCapacityRuleChange(
                        "bufferTimeBetweenBookings",
                        parseInt(e.target.value),
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Max Bookings Per Day</Label>
                  <Input
                    type="number"
                    value={config.capacityRules.maxBookingsPerDay}
                    onChange={(e) =>
                      handleCapacityRuleChange(
                        "maxBookingsPerDay",
                        parseInt(e.target.value),
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <Label>Allow Overlapping Bookings</Label>
                  <Switch
                    checked={config.capacityRules.allowOverlapping}
                    onCheckedChange={(checked) =>
                      handleCapacityRuleChange("allowOverlapping", checked)
                    }
                  />
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
                  <div
                    key={bt.id}
                    className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end p-3 bg-gray-50 rounded"
                  >
                    <div className="md:col-span-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={bt.date}
                        onChange={(e) =>
                          handleBlockedTimeChange(bt.id, "date", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={bt.startTime}
                        onChange={(e) =>
                          handleBlockedTimeChange(
                            bt.id,
                            "startTime",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={bt.endTime}
                        onChange={(e) =>
                          handleBlockedTimeChange(
                            bt.id,
                            "endTime",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeBlockedTime(bt.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="md:col-span-5">
                      <Label>Reason</Label>
                      <Input
                        value={bt.reason}
                        onChange={(e) =>
                          handleBlockedTimeChange(
                            bt.id,
                            "reason",
                            e.target.value,
                          )
                        }
                      />
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
            <Button
              onClick={saveConfiguration}
              disabled={isSaving}
              size="lg"
              className="bg-[#E75837] hover:bg-[#d14a2a]"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Configuration
            </Button>
          </div>
        </footer>
      </div>
    </div>
  )
}
