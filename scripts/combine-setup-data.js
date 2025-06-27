// n8n Code Node: Combine Setup Data
// This code combines the outputs from Get Schedule Avail, Get Holidays Avail, and Get Employees
// into a single webhook response for the professional setup page

// Declare necessary variables
const $input = {
  all: () => [
    { json: [{ day_of_week: "Monday", start_time: "09:00", end_time: "17:00", is_available: true }] },
    { json: [{ id: 1, date: "2023-12-25", name: "Christmas" }] },
    {
      json: [
        {
          employee_id: 1,
          name: "John Doe",
          role: "Manager",
          email: "john@example.com",
          schedule_data: [{ day_of_week: "Monday", start_time: "09:00", end_time: "17:00", is_available: true }],
        },
      ],
    },
  ],
}

const $ = {
  "Availability Set-Up": [{ json: { professional_id: 123 } }],
}

// Input data from previous nodes:
const scheduleData = $input.all()[0]?.json || []
const holidaysData = $input.all()[1]?.json || []
const employeesData = $input.all()[2]?.json || []

// Get professional_id from the original webhook request
const professionalId = $("Availability Set-Up")[0].json.professional_id

console.log("Processing setup data for professional:", professionalId)
console.log("Schedule records:", scheduleData.length)
console.log("Holiday records:", holidaysData.length)
console.log("Employee records:", employeesData.length)

// Helper function to convert schedule data to working days format
function convertScheduleToWorkingDays(scheduleData) {
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  // Create default working days structure
  const workingDays = daysOfWeek.map((day) => ({
    day: day,
    start_time: "09:00",
    end_time: "17:00",
    is_working: false,
  }))

  // Process schedule data to populate working days
  scheduleData.forEach((schedule) => {
    const dayIndex = daysOfWeek.findIndex((day) => day.toLowerCase() === schedule.day_of_week?.toLowerCase())

    if (dayIndex !== -1) {
      workingDays[dayIndex] = {
        day: daysOfWeek[dayIndex],
        start_time: schedule.start_time || "09:00",
        end_time: schedule.end_time || "17:00",
        is_working: schedule.is_available || false,
      }
    }
  })

  return workingDays
}

// Helper function to convert holidays to blocked times
function convertHolidaysToBlockedTimes(holidaysData) {
  return holidaysData.map((holiday) => ({
    blocked_time_id: `holiday_${holiday.id || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    employee_id: null, // Holidays apply to all employees
    employee_name: null,
    date: holiday.date || holiday.holiday_date,
    start_time: "00:00",
    end_time: "23:59",
    reason: holiday.name || holiday.holiday_name || "Holiday",
    is_recurring: holiday.is_recurring || false,
    recurrence_pattern: holiday.recurrence_pattern || null,
  }))
}

// Helper function to process employee data
function processEmployeeData(employeesData, defaultWorkingDays) {
  return employeesData.map((emp) => {
    // Use employee-specific schedule if available, otherwise use default
    let workingDays = defaultWorkingDays

    // If employee has specific schedule data, use it
    if (emp.schedule_data && Array.isArray(emp.schedule_data)) {
      workingDays = convertScheduleToWorkingDays(emp.schedule_data)
    }

    return {
      employee_id: emp.employee_id || emp.id || `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: emp.name || emp.employee_name || "Unknown Employee",
      role: emp.role || emp.position || "Staff",
      email: emp.email || "",
      is_active: emp.is_active !== false, // Default to true unless explicitly false
      working_days: workingDays,
      services: emp.services || emp.service_list || [],
    }
  })
}

// Convert schedule data to default working days
const defaultWorkingDays = convertScheduleToWorkingDays(scheduleData)

// Process employees with their working schedules
const processedEmployees = processEmployeeData(employeesData, defaultWorkingDays)

// Convert holidays to blocked times
const holidayBlockedTimes = convertHolidaysToBlockedTimes(holidaysData)

// Get business name from employee data or use default
const businessName = employeesData[0]?.business_name || employeesData[0]?.company_name || ""

// Build the complete configuration response
const configResponse = {
  success: true,
  message: "Configuration loaded successfully",
  config_data: {
    professional_id: professionalId,
    business_name: businessName,
    last_updated: new Date().toISOString(),
    created_at: new Date().toISOString(),
    webhook_status: "loaded",

    // Processed employees with working schedules
    employees: processedEmployees,

    // Default capacity rules (can be customized in setup)
    capacity_rules: {
      max_concurrent_bookings: 1,
      buffer_time_between_bookings: 15,
      max_bookings_per_day: 20,
      allow_overlapping: false,
      require_all_employees_for_service: false,
    },

    // Holidays converted to blocked times
    blocked_times: holidayBlockedTimes,
  },

  // Additional metadata for debugging
  metadata: {
    source_data: {
      schedule_records: scheduleData.length,
      holiday_records: holidaysData.length,
      employee_records: employeesData.length,
    },
    processed_at: new Date().toISOString(),
    default_working_days: defaultWorkingDays,
  },
}

// Log the response for debugging
console.log("Generated config response:", JSON.stringify(configResponse, null, 2))

// Function to return the formatted response
function returnResponse(response) {
  return [response]
}

// Call the function to return the response
const finalResponse = returnResponse(configResponse)
console.log("Final response:", JSON.stringify(finalResponse, null, 2))
