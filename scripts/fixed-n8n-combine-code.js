// Fixed n8n Code Node: Combine Setup Data
// This code combines the outputs from your database queries

// Declare variables used in n8n
const $input = {
  all: () => {
    // Mock implementation for demonstration purposes
    return [
      { json: { professional_id: 123, webhook_response: { config_data: { employees: [] } } } },
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
    ]
  },
}

const $json = {
  professional_id: 456,
}

// Get input data from previous nodes
// In n8n, $input.all() gets data from all previous nodes
const allInputs = $input.all()

// Extract data from each input node
// Adjust these indices based on your node order
const availabilityData = allInputs[0]?.json || [] // From "Availability Set-Up" query
const scheduleData = allInputs[1]?.json || [] // From "Get Schedule Avail"
const holidaysData = allInputs[2]?.json || [] // From "Get Holidays Avail"
const employeesData = allInputs[3]?.json || [] // From "Get Employees"

// Get professional_id from the first input (webhook trigger)
const professionalId = allInputs[0]?.json?.professional_id || $json.professional_id || "unknown_professional"

console.log("Processing setup data for professional:", professionalId)
console.log("Availability records:", availabilityData.length)
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
  if (Array.isArray(scheduleData)) {
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
  }

  return workingDays
}

// Helper function to convert holidays to blocked times
function convertHolidaysToBlockedTimes(holidaysData) {
  if (!Array.isArray(holidaysData)) {
    return []
  }

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
  if (!Array.isArray(employeesData)) {
    return []
  }

  return employeesData.map((emp) => {
    // Use employee-specific schedule if available, otherwise use default
    let workingDays = [...defaultWorkingDays]

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

// Check if we have existing configuration data from the availability query
let existingConfig = null
if (availabilityData.length > 0 && availabilityData[0].webhook_response) {
  try {
    existingConfig = availabilityData[0].webhook_response.config_data
    console.log("Found existing configuration data")
  } catch (e) {
    console.log("No existing configuration found")
  }
}

// Convert schedule data to default working days
const defaultWorkingDays = convertScheduleToWorkingDays(scheduleData)

// Process employees with their working schedules
const processedEmployees = processEmployeeData(employeesData, defaultWorkingDays)

// Convert holidays to blocked times
const holidayBlockedTimes = convertHolidaysToBlockedTimes(holidaysData)

// Get business name from existing config or employee data
const businessName =
  existingConfig?.business_name || employeesData[0]?.business_name || employeesData[0]?.company_name || ""

// Build the complete configuration response
const configResponse = {
  success: true,
  message: "Configuration loaded successfully",
  config_data: {
    professional_id: professionalId,
    business_name: businessName,
    last_updated: new Date().toISOString(),
    created_at: existingConfig?.created_at || new Date().toISOString(),
    webhook_status: "loaded",

    // Use existing employees if available, otherwise use processed employees
    employees: existingConfig?.employees || processedEmployees,

    // Use existing capacity rules if available, otherwise use defaults
    capacity_rules: existingConfig?.capacity_rules || {
      max_concurrent_bookings: 1,
      buffer_time_between_bookings: 15,
      max_bookings_per_day: 20,
      allow_overlapping: false,
      require_all_employees_for_service: false,
    },

    // Combine existing blocked times with holidays
    blocked_times: [...(existingConfig?.blocked_times || []), ...holidayBlockedTimes],
  },

  // Additional metadata for debugging
  metadata: {
    source_data: {
      availability_records: availabilityData.length,
      schedule_records: scheduleData.length,
      holiday_records: holidaysData.length,
      employee_records: employeesData.length,
    },
    processed_at: new Date().toISOString(),
    has_existing_config: !!existingConfig,
    default_working_days: defaultWorkingDays,
  },
}

// Log the response for debugging
console.log("Generated config response:", JSON.stringify(configResponse, null, 2))

// Function to return the response (n8n expects an array)
function returnResponse(response) {
  return [response]
}

// Call the function to return the response
const finalResponse = returnResponse(configResponse)
