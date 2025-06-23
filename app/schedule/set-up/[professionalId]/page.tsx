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
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Users, Settings, Clock, Calendar, Save, Eye, AlertCircle } from "lucide-react"
import type { ProfessionalConfig, Employee, WorkingDay, BlockedTime } from "@/types/professional-config"

export default function ProfessionalSetupPage() {
  const params = useParams()
  const professionalId = params.professionalId as string

  const [config, setConfig] = useState<ProfessionalConfig>({
    professionalId,
    businessName: "",
    employees: [],
    capacityRules: {
      maxConcurrentBookings: 1,
      bufferTimeBetweenBookings: 15,
      maxBookingsPerDay: 8,
      allowOverlapping: false,
      requireAllEmployeesForService: false,
    },
    blockedTimes: [],
    lastUpdated: new Date().toISOString(),
  })

  const [activeTab, setActiveTab] = useState("employees")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Load configuration from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem(`professional_config_${professionalId}`)
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig)
        setConfig(parsedConfig)
      } catch (error) {
        console.error("Error loading saved configuration:", error)
      }
    }
  }, [professionalId])

  // Save configuration to localStorage
  const saveConfiguration = async () => {
    setSaving(true)
    try {
      const updatedConfig = {
        ...config,
        lastUpdated: new Date().toISOString(),
      }
      localStorage.setItem(`professional_config_${professionalId}`, JSON.stringify(updatedConfig))
      setConfig(updatedConfig)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error("Error saving configuration:", error)
    } finally {
      setSaving(false)
    }
  }

  // Employee management functions
  const addEmployee = () => {
    const newEmployee: Employee = {
      id: `emp_${Date.now()}`,
      name: "",
      role: "",
      email: "",
      isActive: true,
      workingDays: [
        { day: "Monday", start: "09:00", end: "17:00", isWorking: true },
        { day: "Tuesday", start: "09:00", end: "17:00", isWorking: true },
        { day: "Wednesday", start: "09:00", end: "17:00", isWorking: true },
        { day: "Thursday", start: "09:00", end: "17:00", isWorking: true },
        { day: "Friday", start: "09:00", end: "17:00", isWorking: true },
        { day: "Saturday", start: "09:00", end: "15:00", isWorking: false },
        { day: "Sunday", start: "09:00", end: "15:00", isWorking: false },
      ],
      services: [],
    }
    setConfig((prev) => ({
      ...prev,
      employees: [...prev.employees, newEmployee],
    }))
  }

  const updateEmployee = (employeeId: string, updates: Partial<Employee>) => {
    setConfig((prev) => ({
      ...prev,
      employees: prev.employees.map((emp) => (emp.id === employeeId ? { ...emp, ...updates } : emp)),
    }))
  }

  const deleteEmployee = (employeeId: string) => {
    setConfig((prev) => ({
      ...prev,
      employees: prev.employees.filter((emp) => emp.id !== employeeId),
    }))
  }

  const updateEmployeeWorkingDay = (employeeId: string, dayIndex: number, updates: Partial<WorkingDay>) => {
    setConfig((prev) => ({
      ...prev,
      employees: prev.employees.map((emp) =>
        emp.id === employeeId
          ? {
              ...emp,
              workingDays: emp.workingDays.map((day, index) => (index === dayIndex ? { ...day, ...updates } : day)),
            }
          : emp,
      ),
    }))
  }

  // Blocked time management
  const addBlockedTime = () => {
    const newBlockedTime: BlockedTime = {
      id: `blocked_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "10:00",
      reason: "",
      isRecurring: false,
    }
    setConfig((prev) => ({
      ...prev,
      blockedTimes: [...prev.blockedTimes, newBlockedTime],
    }))
  }

  const updateBlockedTime = (blockedTimeId: string, updates: Partial<BlockedTime>) => {
    setConfig((prev) => ({
      ...prev,
      blockedTimes: prev.blockedTimes.map((bt) => (bt.id === blockedTimeId ? { ...bt, ...updates } : bt)),
    }))
  }

  const deleteBlockedTime = (blockedTimeId: string) => {
    setConfig((prev) => ({
      ...prev,
      blockedTimes: prev.blockedTimes.filter((bt) => bt.id !== blockedTimeId),
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#E75837] mb-2 header-font">Schedule Configuration</h1>
              <p className="text-gray-600 body-font">
                Configure your team, capacity rules, and blocked time for Professional ID: {professionalId}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => window.open(`/schedule/${professionalId}`, "_blank")}>
                <Eye className="w-4 h-4 mr-2" />
                Preview Schedule
              </Button>
              <Button onClick={saveConfiguration} disabled={saving} className="bg-[#E75837] hover:bg-[#d14a2a]">
                {saving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Configuration
                  </>
                )}
              </Button>
            </div>
          </div>

          {saved && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm body-font">✓ Configuration saved successfully!</p>
            </div>
          )}
        </div>

        {/* Configuration Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="business" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Business Info
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team ({config.employees.length})
            </TabsTrigger>
            <TabsTrigger value="capacity" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Capacity Rules
            </TabsTrigger>
            <TabsTrigger value="blocked" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Blocked Time ({config.blockedTimes.length})
            </TabsTrigger>
          </TabsList>

          {/* Business Information Tab */}
          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={config.businessName}
                    onChange={(e) => setConfig((prev) => ({ ...prev, businessName: e.target.value }))}
                    placeholder="Enter your business name"
                  />
                </div>
                <div>
                  <Label>Professional ID</Label>
                  <Input value={professionalId} disabled />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Team Members
                    </CardTitle>
                    <Button onClick={addEmployee} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Employee
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {config.employees.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 body-font">No team members added yet.</p>
                      <Button onClick={addEmployee} variant="outline" className="mt-4">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Employee
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {config.employees.map((employee, index) => (
                        <Card key={employee.id} className="border-l-4 border-l-[#E75837]">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div>
                                  <h3 className="font-semibold header-font">
                                    {employee.name || `Employee ${index + 1}`}
                                  </h3>
                                  <p className="text-sm text-gray-500 body-font">{employee.role}</p>
                                </div>
                                <Badge variant={employee.isActive ? "default" : "secondary"}>
                                  {employee.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteEmployee(employee.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <Label>Name</Label>
                                <Input
                                  value={employee.name}
                                  onChange={(e) => updateEmployee(employee.id, { name: e.target.value })}
                                  placeholder="Employee name"
                                />
                              </div>
                              <div>
                                <Label>Role</Label>
                                <Input
                                  value={employee.role}
                                  onChange={(e) => updateEmployee(employee.id, { role: e.target.value })}
                                  placeholder="Job title/role"
                                />
                              </div>
                              <div>
                                <Label>Email (Optional)</Label>
                                <Input
                                  value={employee.email || ""}
                                  onChange={(e) => updateEmployee(employee.id, { email: e.target.value })}
                                  placeholder="employee@email.com"
                                  type="email"
                                />
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={employee.isActive}
                                onCheckedChange={(checked) => updateEmployee(employee.id, { isActive: checked })}
                              />
                              <Label>Active (can receive bookings)</Label>
                            </div>

                            <Separator />

                            {/* Working Hours */}
                            <div>
                              <h4 className="font-medium mb-3 header-font">Working Hours</h4>
                              <div className="space-y-3">
                                {employee.workingDays.map((day, dayIndex) => (
                                  <div key={day.day} className="flex items-center gap-4">
                                    <div className="w-20">
                                      <Label className="text-sm">{day.day}</Label>
                                    </div>
                                    <Switch
                                      checked={day.isWorking}
                                      onCheckedChange={(checked) =>
                                        updateEmployeeWorkingDay(employee.id, dayIndex, { isWorking: checked })
                                      }
                                    />
                                    {day.isWorking && (
                                      <>
                                        <Input
                                          type="time"
                                          value={day.start}
                                          onChange={(e) =>
                                            updateEmployeeWorkingDay(employee.id, dayIndex, { start: e.target.value })
                                          }
                                          className="w-32"
                                        />
                                        <span className="text-gray-500">to</span>
                                        <Input
                                          type="time"
                                          value={day.end}
                                          onChange={(e) =>
                                            updateEmployeeWorkingDay(employee.id, dayIndex, { end: e.target.value })
                                          }
                                          className="w-32"
                                        />
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Capacity Rules Tab */}
          <TabsContent value="capacity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Capacity Management Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="maxConcurrent">Maximum Concurrent Bookings</Label>
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
                    />
                    <p className="text-sm text-gray-500 mt-1">How many appointments can happen at the same time</p>
                  </div>

                  <div>
                    <Label htmlFor="bufferTime">Buffer Time Between Bookings (minutes)</Label>
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
                    />
                    <p className="text-sm text-gray-500 mt-1">Minimum time between consecutive appointments</p>
                  </div>

                  <div>
                    <Label htmlFor="maxPerDay">Maximum Bookings Per Day</Label>
                    <Input
                      id="maxPerDay"
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
                    />
                    <p className="text-sm text-gray-500 mt-1">Total appointments allowed per day</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.capacityRules.allowOverlapping}
                      onCheckedChange={(checked) =>
                        setConfig((prev) => ({
                          ...prev,
                          capacityRules: {
                            ...prev.capacityRules,
                            allowOverlapping: checked,
                          },
                        }))
                      }
                    />
                    <Label>Allow Overlapping Appointments</Label>
                  </div>
                  <p className="text-sm text-gray-500 ml-6">
                    When enabled, appointments can overlap if you have multiple team members
                  </p>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.capacityRules.requireAllEmployeesForService}
                      onCheckedChange={(checked) =>
                        setConfig((prev) => ({
                          ...prev,
                          capacityRules: {
                            ...prev.capacityRules,
                            requireAllEmployeesForService: checked,
                          },
                        }))
                      }
                    />
                    <Label>Require All Team Members for Services</Label>
                  </div>
                  <p className="text-sm text-gray-500 ml-6">
                    When enabled, all active team members must be available for a booking
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blocked Time Tab */}
          <TabsContent value="blocked">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Blocked Time Periods
                  </CardTitle>
                  <Button onClick={addBlockedTime} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Blocked Time
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {config.blockedTimes.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 body-font">No blocked time periods set.</p>
                    <Button onClick={addBlockedTime} variant="outline" className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Blocked Time
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {config.blockedTimes.map((blockedTime) => (
                      <Card key={blockedTime.id} className="border-l-4 border-l-red-500">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-red-500" />
                              <span className="font-medium">Blocked Time</span>
                              {blockedTime.isRecurring && <Badge variant="outline">Recurring</Badge>}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteBlockedTime(blockedTime.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <Label>Date</Label>
                              <Input
                                type="date"
                                value={blockedTime.date}
                                onChange={(e) => updateBlockedTime(blockedTime.id, { date: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label>Start Time</Label>
                              <Input
                                type="time"
                                value={blockedTime.startTime}
                                onChange={(e) => updateBlockedTime(blockedTime.id, { startTime: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label>End Time</Label>
                              <Input
                                type="time"
                                value={blockedTime.endTime}
                                onChange={(e) => updateBlockedTime(blockedTime.id, { endTime: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label>Reason</Label>
                              <Input
                                value={blockedTime.reason}
                                onChange={(e) => updateBlockedTime(blockedTime.id, { reason: e.target.value })}
                                placeholder="Meeting, vacation, etc."
                              />
                            </div>
                          </div>

                          <div className="mt-4 flex items-center space-x-2">
                            <Switch
                              checked={blockedTime.isRecurring}
                              onCheckedChange={(checked) => updateBlockedTime(blockedTime.id, { isRecurring: checked })}
                            />
                            <Label>Recurring</Label>
                            {blockedTime.isRecurring && (
                              <Select
                                value={blockedTime.recurrencePattern}
                                onValueChange={(value: "weekly" | "monthly") =>
                                  updateBlockedTime(blockedTime.id, { recurrencePattern: value })
                                }
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Pattern" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
