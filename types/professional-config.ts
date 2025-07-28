export type Employee = {
  id: string
  name: string
  role: string
  email?: string
  isActive: boolean
  workingDays: WorkingDay[]
  services: string[] // Services this employee can perform
}

export type WorkingDay = {
  day: string
  start: string
  end: string
  isWorking: boolean
}

export type CapacityRule = {
  maxConcurrentBookings: number
  bufferTimeBetweenBookings: number // in minutes
  maxBookingsPerDay: number
  allowOverlapping: boolean
  requireAllEmployeesForService: boolean
}

export type BlockedTime = {
  id: string
  date: string
  startTime: string
  endTime: string
  reason: string
  employeeId?: string // If specific to an employee, otherwise affects all
  isRecurring: boolean
  recurrencePattern?: "weekly" | "monthly"
}

export type ProfessionalConfig = {
  professionalId: string
  businessName: string
  employees: Employee[]
  capacityRules: CapacityRule
  blockedTimes: BlockedTime[]
  lastUpdated: string
}

// Default working days template
export const DEFAULT_WORKING_DAYS: WorkingDay[] = [
  { day: "Monday", start: "09:00", end: "17:00", isWorking: true },
  { day: "Tuesday", start: "09:00", end: "17:00", isWorking: true },
  { day: "Wednesday", start: "09:00", end: "17:00", isWorking: true },
  { day: "Thursday", start: "09:00", end: "17:00", isWorking: true },
  { day: "Friday", start: "09:00", end: "17:00", isWorking: true },
  { day: "Saturday", start: "09:00", end: "15:00", isWorking: false },
  { day: "Sunday", start: "09:00", end: "15:00", isWorking: false },
]

export const DEFAULT_CAPACITY_RULES: CapacityRule = {
  maxConcurrentBookings: 1,
  bufferTimeBetweenBookings: 15,
  maxBookingsPerDay: 8,
  allowOverlapping: false,
  requireAllEmployeesForService: false,
}
