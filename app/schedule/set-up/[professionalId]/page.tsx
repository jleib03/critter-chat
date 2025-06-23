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
import { Trash2, Plus, Users, Clock, Shield, Calendar, ExternalLink } from "lucide-react"
import { loadProfessionalConfig, saveProfessionalConfig } from "@/utils/professional-config"
import type { ProfessionalConfig, Employee, BlockedTime } from "@/types/professional-config"
import { DEFAULT_WORKING_DAYS, DEFAULT_CAPACITY_RULES } from "@/types/professional-config"

export default function ProfessionalSetupPage() {
  const params = useParams()
  const professionalId = params.professionalId as string

  const [config, setConfig] = useState<ProfessionalConfig>({
    professionalId,
    businessName: "",
    employees: [],
    capacityRules: DEFAULT_CAPACITY_RULES,
    blockedTimes: [],
    lastUpdated: new Date().toISOString(),
  })

  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    name: "",
    role: "",
    email: "",
    isActive: true,
    workingDays: [...DEFAULT_WORKING_DAYS],
    services: [],
  })

  const [newBlockedTime, setNewBlockedTime] = useState<Partial<BlockedTime>>({
    date: "",
    startTime: "09:00",
    endTime: "17:00",
    reason: "",
    isRecurring: false,
  })

  const [activeTab, setActiveTab] = useState("business")
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")

  // Load existing configuration
  useEffect(() => {
    const existingConfig = loadProfessionalConfig(professionalId)
    if (existingConfig) {
      setConfig(existingConfig)
    }
  }, [professionalId])

  const handleSave = () => {
    setSaveStatus("saving")
    const updatedConfig = {
      ...config,
      lastUpdated: new Date().toISOString(),
    }

    const success = saveProfessionalConfig(updatedConfig)
    if (success) {
      setConfig(updatedConfig)
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2000)
    } else {
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
    }
  }

  const addEmployee = () => {
    if (!newEmployee.name || !newEmployee.role) return

    const employee: Employee = {
      id: `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newEmployee.name,
      role: newEmployee.role,
      email: newEmployee.email || "",
      isActive: newEmployee.isActive ?? true,
      workingDays: newEmployee.workingDays || [...DEFAULT_WORKING_DAYS],
      services: newEmployee.services || [],
    }

    setConfig((prev) => ({
      ...prev,
      employees: [...prev.employees, employee],
    }))

    setNewEmployee({
      name: "",
      role: "",
      email: "",
      isActive: true,
      workingDays: [...DEFAULT_WORKING_DAYS],
      services: [],
    })
  }

  const removeEmployee = (employeeId: string) => {
    setConfig((prev) => ({
      ...prev,
      employees: prev.employees.filter((emp) => emp.id !== employeeId),
    }))
  }

  const updateEmployee = (employeeId: string, updates: Partial<Employee>) => {
    setConfig((prev) => ({
      ...prev,
      employees: prev.employees.map((emp) => (emp.id === employeeId ? { ...emp, ...updates } : emp)),
    }))
  }

  const addBlockedTime = () => {
    if (!newBlockedTime.date || !newBlockedTime.startTime || !newBlockedTime.endTime) return

    const blockedTime: BlockedTime = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: newBlockedTime.date,
      startTime: newBlockedTime.startTime,
      endTime: newBlockedTime.endTime,
      reason: newBlockedTime.reason || "",
      employeeId: newBlockedTime.employeeId,
      isRecurring: newBlockedTime.isRecurring ?? false,
      recurrencePattern: newBlockedTime.recurrencePattern,
    }

    setConfig((prev) => ({
      ...prev,
      blockedTimes: [...prev.blockedTimes, blockedTime],
    }))

    setNewBlockedTime({
      date: "",
      startTime: "09:00",
      endTime: "17:00",
      reason: "",
      isRecurring: false,
    })
  }

  const removeBlockedTime = (blockedTimeId: string) => {
    setConfig((prev) => ({
      ...prev,
      blockedTimes: prev.blockedTimes.filter((bt) => bt.id !== blockedTimeId),
    }))
  }

  const getSaveButtonText = () => {
    switch (saveStatus) {
      case "saving":
        return "Saving..."
      case "saved":
        return "✓ Saved"
      case "error":
        return "Error - Try Again"
      default:
        return "Save Configuration"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-[#E75837] mb-2 header-font">Team & Capacity Setup</h1>
              <p className="text-gray-600 body-font">Configure your team, working hours, and booking capacity rules.</p>
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
              <Button
                onClick={handleSave}
                disabled={saveStatus === "saving"}
                className={`${
                  saveStatus === "saved"
                    ? "bg-green-600 hover:bg-green-700"
                    : saveStatus === "error"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-[#E75837] hover:bg-[#d14a2a]"
                }`}
              >
                {getSaveButtonText()}
              </Button>
            </div>
          </div>
        </div>

        {/* Configuration Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="business" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Business Info
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team Management
            </TabsTrigger>
            <TabsTrigger value="capacity" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Capacity Rules
            </TabsTrigger>
            <TabsTrigger value="blocked" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Blocked Time
            </TabsTrigger>
          </TabsList>

          {/* Business Info Tab */}
          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle className="header-font">Business Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="businessName" className="body-font">
                    Business Name
                  </Label>
                  <Input
                    id="businessName"
                    value={config.businessName}
                    onChange={(e) => setConfig((prev) => ({ ...prev, businessName: e.target.value }))}
                    placeholder="Enter your business name"
                    className="body-font"
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2 header-font">Professional ID</h4>
                  <p className="text-blue-700 body-font text-sm">
                    Your unique professional ID: <code className="bg-blue-100 px-2 py-1 rounded">{professionalId}</code>
                  </p>
                  <p className="text-blue-600 body-font text-xs mt-2">
                    This ID is used in your booking URLs and webhook configurations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Management Tab */}
          <TabsContent value="team">
            <div className="space-y-6">
              {/* Add New Employee */}
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
                {config.employees.map((employee) => (
                  <Card key={employee.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="header-font text-lg">{employee.name}</CardTitle>
                          <p className="text-gray-600 body-font">{employee.role}</p>
                          {employee.email && <p className="text-gray-500 body-font text-sm">{employee.email}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`active-${employee.id}`} className="body-font text-sm">
                              Active
                            </Label>
                            <Switch
                              id={`active-${employee.id}`}
                              checked={employee.isActive}
                              onCheckedChange={(checked) => updateEmployee(employee.id, { isActive: checked })}
                            />
                          </div>
                          <Button variant="outline" size="sm" onClick={() => removeEmployee(employee.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <h4 className="font-medium header-font">Working Hours</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {employee.workingDays.map((day, dayIndex) => (
                            <div key={day.day} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                              <Switch
                                checked={day.isWorking}
                                onCheckedChange={(checked) => {
                                  const updatedDays = [...employee.workingDays]
                                  updatedDays[dayIndex] = { ...day, isWorking: checked }
                                  updateEmployee(employee.id, { workingDays: updatedDays })
                                }}
                              />
                              <span className="text-sm font-medium body-font w-12">{day.day.slice(0, 3)}</span>
                              {day.isWorking && (
                                <div className="flex items-center gap-1">
                                  <Input
                                    type="time"
                                    value={day.start}
                                    onChange={(e) => {
                                      const updatedDays = [...employee.workingDays]
                                      updatedDays[dayIndex] = { ...day, start: e.target.value }
                                      updateEmployee(employee.id, { workingDays: updatedDays })
                                    }}
                                    className="w-20 h-8 text-xs"
                                  />
                                  <span className="text-xs text-gray-500">-</span>
                                  <Input
                                    type="time"
                                    value={day.end}
                                    onChange={(e) => {
                                      const updatedDays = [...employee.workingDays]
                                      updatedDays[dayIndex] = { ...day, end: e.target.value }
                                      updateEmployee(employee.id, { workingDays: updatedDays })
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

                {config.employees.length === 0 && (
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
                      value={config.capacityRules.maxConcurrentBookings}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          capacityRules: {
                            ...prev.capacityRules,
                            maxConcurrentBookings: Number.parseInt(e.target.value) || 1,
                          },
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
                      value={config.capacityRules.bufferTimeBetweenBookings}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          capacityRules: {
                            ...prev.capacityRules,
                            bufferTimeBetweenBookings: Number.parseInt(e.target.value) || 0,
                          },
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
                      value={config.capacityRules.maxBookingsPerDay}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          capacityRules: {
                            ...prev.capacityRules,
                            maxBookingsPerDay: Number.parseInt(e.target.value) || 1,
                          },
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
                        checked={config.capacityRules.allowOverlapping}
                        onCheckedChange={(checked) =>
                          setConfig((prev) => ({
                            ...prev,
                            capacityRules: { ...prev.capacityRules, allowOverlapping: checked },
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
                        checked={config.capacityRules.requireAllEmployeesForService}
                        onCheckedChange={(checked) =>
                          setConfig((prev) => ({
                            ...prev,
                            capacityRules: { ...prev.capacityRules, requireAllEmployeesForService: checked },
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blocked Time Tab */}
          <TabsContent value="blocked">
            <div className="space-y-6">
              {/* Add Blocked Time */}
              <Card>
                <CardHeader>
                  <CardTitle className="header-font">Block Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <Label htmlFor="blockDate" className="body-font">
                        Date *
                      </Label>
                      <Input
                        id="blockDate"
                        type="date"
                        value={newBlockedTime.date}
                        onChange={(e) => setNewBlockedTime((prev) => ({ ...prev, date: e.target.value }))}
                        className="body-font"
                      />
                    </div>
                    <div>
                      <Label htmlFor="blockStart" className="body-font">
                        Start Time *
                      </Label>
                      <Input
                        id="blockStart"
                        type="time"
                        value={newBlockedTime.startTime}
                        onChange={(e) => setNewBlockedTime((prev) => ({ ...prev, startTime: e.target.value }))}
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
                        value={newBlockedTime.endTime}
                        onChange={(e) => setNewBlockedTime((prev) => ({ ...prev, endTime: e.target.value }))}
                        className="body-font"
                      />
                    </div>
                    <div>
                      <Label htmlFor="blockEmployee" className="body-font">
                        Specific Employee
                      </Label>
                      <Select
                        value={newBlockedTime.employeeId || "all"}
                        onValueChange={(value) =>
                          setNewBlockedTime((prev) => ({
                            ...prev,
                            employeeId: value === "all" ? undefined : value,
                          }))
                        }
                      >
                        <SelectTrigger className="body-font">
                          <SelectValue placeholder="All employees" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All employees</SelectItem>
                          {config.employees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <Label htmlFor="blockReason" className="body-font">
                      Reason
                    </Label>
                    <Textarea
                      id="blockReason"
                      value={newBlockedTime.reason}
                      onChange={(e) => setNewBlockedTime((prev) => ({ ...prev, reason: e.target.value }))}
                      placeholder="e.g., Personal appointment, Training, Vacation"
                      className="body-font"
                    />
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="isRecurring"
                        checked={newBlockedTime.isRecurring}
                        onCheckedChange={(checked) => setNewBlockedTime((prev) => ({ ...prev, isRecurring: checked }))}
                      />
                      <Label htmlFor="isRecurring" className="body-font">
                        Recurring
                      </Label>
                    </div>

                    {newBlockedTime.isRecurring && (
                      <Select
                        value={newBlockedTime.recurrencePattern || "weekly"}
                        onValueChange={(value) =>
                          setNewBlockedTime((prev) => ({
                            ...prev,
                            recurrencePattern: value as "weekly" | "monthly",
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

                  <Button
                    onClick={addBlockedTime}
                    disabled={!newBlockedTime.date || !newBlockedTime.startTime || !newBlockedTime.endTime}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Block Time
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Blocked Times */}
              <div className="space-y-4">
                {config.blockedTimes.map((blockedTime) => (
                  <Card key={blockedTime.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
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
                            {blockedTime.isRecurring && (
                              <Badge variant="secondary" className="text-xs">
                                {blockedTime.recurrencePattern}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="body-font">
                              {blockedTime.startTime} - {blockedTime.endTime}
                            </span>
                          </div>
                          {blockedTime.employeeId && (
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-500" />
                              <span className="body-font">
                                {config.employees.find((emp) => emp.id === blockedTime.employeeId)?.name ||
                                  "Unknown Employee"}
                              </span>
                            </div>
                          )}
                          {blockedTime.reason && (
                            <p className="text-gray-600 body-font text-sm">{blockedTime.reason}</p>
                          )}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => removeBlockedTime(blockedTime.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {config.blockedTimes.length === 0 && (
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
