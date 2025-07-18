"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Loader2, Save, Plus, Trash2, Clock, Users, Calendar, Settings, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface Employee {
  employee_id: string
  name: string
  role: string
  email: string
  is_active: boolean
  working_days: WorkingDay[]
  services: string[]
}

interface WorkingDay {
  day: string
  start_time: string
  end_time: string
  is_working: boolean
}

interface CapacityRule {
  max_concurrent_bookings: number
  buffer_time_between_bookings: number
  max_bookings_per_day: number
  allow_overlapping: boolean
  require_all_employees_for_service: boolean
}

interface BlockedTime {
  blocked_time_id?: string
  blocked_date: string
  start_time: string
  end_time: string
  reason: string
  employee_id?: string
  is_recurring: boolean
  recurrence_pattern?: string
}

interface Service {
  name: string
  description: string
  duration_unit: string
  duration_number: number
  customer_cost: number
  customer_cost_currency: string
}

interface ScheduleConfig {
  professional_id: string
  business_name: string
  employees: Employee[]
  capacity_rules: CapacityRule
  blocked_times: BlockedTime[]
  services: Service[]
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const TIME_OPTIONS = [
  "6:00 AM",
  "6:30 AM",
  "7:00 AM",
  "7:30 AM",
  "8:00 AM",
  "8:30 AM",
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
  "7:30 PM",
  "8:00 PM",
  "8:30 PM",
  "9:00 PM",
  "9:30 PM",
  "10:00 PM",
]

export default function ScheduleSetupPage() {
  const params = useParams()
  const uniqueUrl = params.uniqueUrl as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [config, setConfig] = useState<ScheduleConfig | null>(null)
  const [activeTab, setActiveTab] = useState("employees")

  const WEBHOOK_URL = "https://jleib03.app.n8n.cloud/webhook/5671c1dd-48f6-47a9-85ac-4e20cf261520"

  useEffect(() => {
    loadScheduleConfig()
  }, [uniqueUrl])

  const loadScheduleConfig = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          unique_url: uniqueUrl,
          action: "get_schedule_config",
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Schedule config data:", data)

      if (data && data.length > 0) {
        // Parse the webhook response
        const configData = parseScheduleConfig(data)
        setConfig(configData)
      } else {
        throw new Error("No schedule configuration found")
      }
    } catch (err) {
      console.error("Error loading schedule config:", err)
      setError("Failed to load schedule configuration. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const parseScheduleConfig = (data: any[]): ScheduleConfig => {
    // Find the first entry with professional info
    const professionalEntry = data.find((entry) => entry.professional_id)

    // Find all employee entries
    const employeeEntries = data.filter((entry) => entry.employee_id)

    // Find capacity rules entry
    const capacityEntry = data.find((entry) => entry.max_concurrent_bookings !== undefined)

    // Find blocked times entries
    const blockedTimeEntries = data.filter((entry) => entry.blocked_time_id)

    // Find service entries
    const serviceEntries = data.filter((entry) => entry.name && entry.duration_unit)

    // Parse employees with their working days
    const employees: Employee[] = []
    const employeeMap = new Map<string, Employee>()

    employeeEntries.forEach((entry) => {
      if (!employeeMap.has(entry.employee_id)) {
        employeeMap.set(entry.employee_id, {
          employee_id: entry.employee_id,
          name: entry.name || "Employee",
          role: entry.role || "Staff",
          email: entry.email || "",
          is_active: entry.is_active !== false,
          working_days: [],
          services: entry.services ? entry.services.split(",") : [],
        })
      }

      const employee = employeeMap.get(entry.employee_id)!

      // Add working days
      DAYS_OF_WEEK.forEach((day) => {
        const dayLower = day.toLowerCase()
        const startKey = `${dayLower}_start`
        const endKey = `${dayLower}_end`
        const workingKey = `${dayLower}_working`

        if (entry[startKey] !== undefined) {
          employee.working_days.push({
            day: day,
            start_time: entry[startKey] || "9:00 AM",
            end_time: entry[endKey] || "5:00 PM",
            is_working: entry[workingKey] !== false,
          })
        }
      })
    })

    employees.push(...employeeMap.values())

    // Parse capacity rules
    const capacityRules: CapacityRule = {
      max_concurrent_bookings: capacityEntry?.max_concurrent_bookings || 1,
      buffer_time_between_bookings: capacityEntry?.buffer_time_between_bookings || 0,
      max_bookings_per_day: capacityEntry?.max_bookings_per_day || 10,
      allow_overlapping: capacityEntry?.allow_overlapping || false,
      require_all_employees_for_service: capacityEntry?.require_all_employees_for_service || false,
    }

    // Parse blocked times
    const blockedTimes: BlockedTime[] = blockedTimeEntries.map((entry) => ({
      blocked_time_id: entry.blocked_time_id,
      blocked_date: entry.blocked_date,
      start_time: entry.start_time,
      end_time: entry.end_time,
      reason: entry.reason || "Blocked",
      employee_id: entry.employee_id,
      is_recurring: entry.is_recurring || false,
      recurrence_pattern: entry.recurrence_pattern,
    }))

    // Parse services
    const services: Service[] = serviceEntries.map((entry) => ({
      name: entry.name,
      description: entry.description || "",
      duration_unit: entry.duration_unit,
      duration_number: entry.duration_number,
      customer_cost: entry.customer_cost,
      customer_cost_currency: entry.customer_cost_currency,
    }))

    return {
      professional_id: professionalEntry?.professional_id || uniqueUrl,
      business_name: professionalEntry?.business_name || "Business",
      employees: employees,
      capacity_rules: capacityRules,
      blocked_times: blockedTimes,
      services: services,
    }
  }

  const saveScheduleConfig = async () => {
    if (!config) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          unique_url: uniqueUrl,
          action: "save_schedule_config",
          timestamp: new Date().toISOString(),
          config: config,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("Save result:", result)

      setSuccess("Schedule configuration saved successfully!")
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      console.error("Error saving schedule config:", err)
      setError("Failed to save schedule configuration. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const addEmployee = () => {
    if (!config) return

    const newEmployee: Employee = {
      employee_id: `emp_${Date.now()}`,
      name: "",
      role: "Staff",
      email: "",
      is_active: true,
      working_days: DAYS_OF_WEEK.map((day) => ({
        day,
        start_time: "9:00 AM",
        end_time: "5:00 PM",
        is_working: day !== "Sunday",
      })),
      services: [],
    }

    setConfig({
      ...config,
      employees: [...config.employees, newEmployee],
    })
  }

  const updateEmployee = (employeeId: string, updates: Partial<Employee>) => {
    if (!config) return

    setConfig({
      ...config,
      employees: config.employees.map((emp) => (emp.employee_id === employeeId ? { ...emp, ...updates } : emp)),
    })
  }

  const removeEmployee = (employeeId: string) => {
    if (!config) return

    setConfig({
      ...config,
      employees: config.employees.filter((emp) => emp.employee_id !== employeeId),
    })
  }

  const updateWorkingDay = (employeeId: string, day: string, updates: Partial<WorkingDay>) => {
    if (!config) return

    setConfig({
      ...config,
      employees: config.employees.map((emp) =>
        emp.employee_id === employeeId
          ? {
              ...emp,
              working_days: emp.working_days.map((wd) => (wd.day === day ? { ...wd, ...updates } : wd)),
            }
          : emp,
      ),
    })
  }

  const addBlockedTime = () => {
    if (!config) return

    const newBlockedTime: BlockedTime = {
      blocked_time_id: `block_${Date.now()}`,
      blocked_date: new Date().toISOString().split("T")[0],
      start_time: "9:00 AM",
      end_time: "10:00 AM",
      reason: "Blocked",
      is_recurring: false,
    }

    setConfig({
      ...config,
      blocked_times: [...config.blocked_times, newBlockedTime],
    })
  }

  const updateBlockedTime = (blockedTimeId: string, updates: Partial<BlockedTime>) => {
    if (!config) return

    setConfig({
      ...config,
      blocked_times: config.blocked_times.map((bt) =>
        bt.blocked_time_id === blockedTimeId ? { ...bt, ...updates } : bt,
      ),
    })
  }

  const removeBlockedTime = (blockedTimeId: string) => {
    if (!config) return

    setConfig({
      ...config,
      blocked_times: config.blocked_times.filter((bt) => bt.blocked_time_id !== blockedTimeId),
    })
  }

  const updateCapacityRules = (updates: Partial<CapacityRule>) => {
    if (!config) return

    setConfig({
      ...config,
      capacity_rules: { ...config.capacity_rules, ...updates },
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-[#745E25] rounded-xl flex items-center justify-center mx-auto">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 header-font">Loading Schedule Configuration</h2>
            <p className="text-gray-600 body-font mt-1">Please wait a moment</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border p-8 space-y-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 header-font">Unable to Load Configuration</h2>
              <p className="text-gray-600 body-font mt-2">{error}</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => loadScheduleConfig()} className="flex-1">
                Try Again
              </Button>
              <Button asChild variant="outline" className="flex-1 bg-transparent">
                <Link href="/pro/set-up">Back to Setup</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center mx-auto">
            <Settings className="w-6 h-6 text-gray-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-700 header-font">No Configuration Available</h2>
            <p className="text-gray-500 body-font">Unable to find schedule configuration</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/pro/set-up">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Setup
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-[#745E25] header-font">Schedule Configuration</h1>
                <p className="text-gray-600 body-font">{config.business_name}</p>
              </div>
            </div>
            <Button onClick={saveScheduleConfig} disabled={saving} className="bg-[#745E25] hover:bg-[#5d4a1e]">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </>
              )}
            </Button>
          </div>

          {/* Status Messages */}
          {error && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mt-4 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Configuration Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 p-1 m-6 mb-0">
              <TabsTrigger value="employees" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Team
              </TabsTrigger>
              <TabsTrigger value="capacity" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Capacity
              </TabsTrigger>
              <TabsTrigger value="blocked" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Blocked Times
              </TabsTrigger>
              <TabsTrigger value="services" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Services
              </TabsTrigger>
            </TabsList>

            {/* Team Management */}
            <TabsContent value="employees" className="p-6 pt-4">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold header-font">Team Members</h3>
                    <p className="text-gray-600 body-font">Manage your team and their working schedules</p>
                  </div>
                  <Button onClick={addEmployee} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Employee
                  </Button>
                </div>

                <div className="space-y-4">
                  {config.employees.map((employee) => (
                    <Card key={employee.employee_id}>
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="grid grid-cols-3 gap-4 flex-1">
                              <div>
                                <Label htmlFor={`name-${employee.employee_id}`}>Name</Label>
                                <Input
                                  id={`name-${employee.employee_id}`}
                                  value={employee.name}
                                  onChange={(e) => updateEmployee(employee.employee_id, { name: e.target.value })}
                                  placeholder="Employee name"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`role-${employee.employee_id}`}>Role</Label>
                                <Input
                                  id={`role-${employee.employee_id}`}
                                  value={employee.role}
                                  onChange={(e) => updateEmployee(employee.employee_id, { role: e.target.value })}
                                  placeholder="Role"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`email-${employee.employee_id}`}>Email</Label>
                                <Input
                                  id={`email-${employee.employee_id}`}
                                  type="email"
                                  value={employee.email}
                                  onChange={(e) => updateEmployee(employee.employee_id, { email: e.target.value })}
                                  placeholder="email@example.com"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={employee.is_active}
                                onCheckedChange={(checked) =>
                                  updateEmployee(employee.employee_id, { is_active: checked })
                                }
                              />
                              <Label>Active</Label>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeEmployee(employee.employee_id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium">Working Hours</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                              {employee.working_days.map((workingDay) => (
                                <div key={workingDay.day} className="flex items-center space-x-2 p-3 border rounded-lg">
                                  <Switch
                                    checked={workingDay.is_working}
                                    onCheckedChange={(checked) =>
                                      updateWorkingDay(employee.employee_id, workingDay.day, { is_working: checked })
                                    }
                                  />
                                  <div className="flex-1">
                                    <div className="text-sm font-medium">{workingDay.day}</div>
                                    {workingDay.is_working && (
                                      <div className="flex items-center space-x-1 mt-1">
                                        <Select
                                          value={workingDay.start_time}
                                          onValueChange={(value) =>
                                            updateWorkingDay(employee.employee_id, workingDay.day, {
                                              start_time: value,
                                            })
                                          }
                                        >
                                          <SelectTrigger className="h-8 text-xs">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {TIME_OPTIONS.map((time) => (
                                              <SelectItem key={time} value={time}>
                                                {time}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        <span className="text-xs text-gray-500">to</span>
                                        <Select
                                          value={workingDay.end_time}
                                          onValueChange={(value) =>
                                            updateWorkingDay(employee.employee_id, workingDay.day, { end_time: value })
                                          }
                                        >
                                          <SelectTrigger className="h-8 text-xs">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {TIME_OPTIONS.map((time) => (
                                              <SelectItem key={time} value={time}>
                                                {time}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {config.services.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium">Assigned Services</Label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {config.services.map((service) => (
                                  <Badge
                                    key={service.name}
                                    variant={employee.services.includes(service.name) ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => {
                                      const services = employee.services.includes(service.name)
                                        ? employee.services.filter((s) => s !== service.name)
                                        : [...employee.services, service.name]
                                      updateEmployee(employee.employee_id, { services })
                                    }}
                                  >
                                    {service.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Capacity Rules */}
            <TabsContent value="capacity" className="p-6 pt-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold header-font">Capacity Rules</h3>
                  <p className="text-gray-600 body-font">Configure booking limits and scheduling rules</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Booking Limits</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="max-concurrent">Max Concurrent Bookings</Label>
                        <Input
                          id="max-concurrent"
                          type="number"
                          min="1"
                          value={config.capacity_rules.max_concurrent_bookings}
                          onChange={(e) =>
                            updateCapacityRules({ max_concurrent_bookings: Number.parseInt(e.target.value) || 1 })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="max-daily">Max Bookings Per Day</Label>
                        <Input
                          id="max-daily"
                          type="number"
                          min="1"
                          value={config.capacity_rules.max_bookings_per_day}
                          onChange={(e) =>
                            updateCapacityRules({ max_bookings_per_day: Number.parseInt(e.target.value) || 10 })
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Scheduling Rules</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="buffer-time">Buffer Time Between Bookings (minutes)</Label>
                        <Input
                          id="buffer-time"
                          type="number"
                          min="0"
                          value={config.capacity_rules.buffer_time_between_bookings}
                          onChange={(e) =>
                            updateCapacityRules({ buffer_time_between_bookings: Number.parseInt(e.target.value) || 0 })
                          }
                        />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="allow-overlapping">Allow Overlapping Bookings</Label>
                          <Switch
                            id="allow-overlapping"
                            checked={config.capacity_rules.allow_overlapping}
                            onCheckedChange={(checked) => updateCapacityRules({ allow_overlapping: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="require-all-employees">Require All Employees for Service</Label>
                          <Switch
                            id="require-all-employees"
                            checked={config.capacity_rules.require_all_employees_for_service}
                            onCheckedChange={(checked) =>
                              updateCapacityRules({ require_all_employees_for_service: checked })
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Blocked Times */}
            <TabsContent value="blocked" className="p-6 pt-4">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold header-font">Blocked Times</h3>
                    <p className="text-gray-600 body-font">Block specific times when bookings are not available</p>
                  </div>
                  <Button onClick={addBlockedTime} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Blocked Time
                  </Button>
                </div>

                <div className="space-y-4">
                  {config.blocked_times.map((blockedTime) => (
                    <Card key={blockedTime.blocked_time_id}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                          <div>
                            <Label htmlFor={`date-${blockedTime.blocked_time_id}`}>Date</Label>
                            <Input
                              id={`date-${blockedTime.blocked_time_id}`}
                              type="date"
                              value={blockedTime.blocked_date}
                              onChange={(e) =>
                                updateBlockedTime(blockedTime.blocked_time_id!, { blocked_date: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor={`start-${blockedTime.blocked_time_id}`}>Start Time</Label>
                            <Select
                              value={blockedTime.start_time}
                              onValueChange={(value) =>
                                updateBlockedTime(blockedTime.blocked_time_id!, { start_time: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TIME_OPTIONS.map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor={`end-${blockedTime.blocked_time_id}`}>End Time</Label>
                            <Select
                              value={blockedTime.end_time}
                              onValueChange={(value) =>
                                updateBlockedTime(blockedTime.blocked_time_id!, { end_time: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TIME_OPTIONS.map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor={`reason-${blockedTime.blocked_time_id}`}>Reason</Label>
                            <Input
                              id={`reason-${blockedTime.blocked_time_id}`}
                              value={blockedTime.reason}
                              onChange={(e) =>
                                updateBlockedTime(blockedTime.blocked_time_id!, { reason: e.target.value })
                              }
                              placeholder="Reason for blocking"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={blockedTime.is_recurring}
                                onCheckedChange={(checked) =>
                                  updateBlockedTime(blockedTime.blocked_time_id!, { is_recurring: checked })
                                }
                              />
                              <Label className="text-sm">Recurring</Label>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeBlockedTime(blockedTime.blocked_time_id!)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {blockedTime.is_recurring && (
                          <div className="mt-4">
                            <Label htmlFor={`pattern-${blockedTime.blocked_time_id}`}>Recurrence Pattern</Label>
                            <Select
                              value={blockedTime.recurrence_pattern || "weekly"}
                              onValueChange={(value) =>
                                updateBlockedTime(blockedTime.blocked_time_id!, { recurrence_pattern: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Services */}
            <TabsContent value="services" className="p-6 pt-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold header-font">Services</h3>
                  <p className="text-gray-600 body-font">View and manage your available services</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {config.services.map((service) => (
                    <Card key={service.name}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{service.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-gray-600">{service.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Duration:</span>
                          <span className="font-medium">
                            {service.duration_number} {service.duration_unit}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Cost:</span>
                          <span className="font-medium">
                            {service.customer_cost_currency} {service.customer_cost}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {config.services.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Services Found</h3>
                    <p className="text-gray-500">Services will appear here once they are configured in your system.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
