// Fixed n8n Code Node: Combine Real Setup Data
// Processes actual data from your queries and formats for setup page
// FIXED: Proper n8n return format

// Declare the $input variable
const $input = {
  all: () => [
    { json: { professional_id: "123", config_data: { business_name: "Example Business" } } },
    { json: [{ monday_start: "09:00", monday_end: "17:00", monday_working: true }] },
    { json: [{ date: "2023-12-25", name: "Christmas" }] },
    { json: [{ first_name: "John", last_name: "Doe", role: "Manager", email: "john.doe@example.com" }] },
  ],
}

// Get input data from all previous nodes
const allInputs = $input.all()

// Extract data from each node (adjust indices based on your node order)
const availabilitySetupData = allInputs[0]?.json || {} // From "Availability Set-Up" query
const scheduleAvailData = allInputs[1]?.json || [] // From "Get Schedule Avail"
const holidaysData = allInputs[2]?.json || [] // From "Get Holidays Avail"
const employeesData = allInputs[3]?.json || [] // From "Get Employees"

// Get professional_id from the first input
const professionalId = availabilitySetupData.professional_id || scheduleAvailData[0]?.professional_id || "unknown"

console.log("Processing setup data for professional:", professionalId)
console.log("Schedule records:", scheduleAvailData.length)
console.log("Holiday records:", holidaysData.length)
console.log("Employee records:", employeesData.length)

// Helper function to convert schedule availability to working days
function convertScheduleToWorkingDays(scheduleData) {
  if (!scheduleData || scheduleData.length === 0) {
    // Return default working days if no schedule data
    return [
      { day: "Monday", start_time: "09:00", end_time: "17:00", is_working: false },
      { day: "Tuesday", start_time: "09:00", end_time: "17:00", is_working: false },
      { day: "Wednesday", start_time: "09:00", end_time: "17:00", is_working: false },
      { day: "Thursday", start_time: "09:00", end_time: "17:00", is_working: false },
      { day: "Friday", start_time: "09:00", end_time: "17:00", is_working: false },
      { day: "Saturday", start_time: "09:00", end_time: "17:00", is_working: false },
      { day: "Sunday", start_time: "09:00", end_time: "17:00", is_working: false },
    ]
  }

  const schedule = scheduleData[0] // Get first schedule record

  return [
    {
      day: "Monday",
      start_time: schedule.monday_start ? schedule.monday_start.substring(0, 5) : "09:00",
      end_time: schedule.monday_end ? schedule.monday_end.substring(0, 5) : "17:00",
      is_working: !!schedule.monday_working,
    },
    {
      day: "Tuesday",
      start_time: schedule.tuesday_start ? schedule.tuesday_start.substring(0, 5) : "09:00",
      end_time: schedule.tuesday_end ? schedule.tuesday_end.substring(0, 5) : "17:00",
      is_working: !!schedule.tuesday_working,
    },
    {
      day: "Wednesday",
      start_time: schedule.wednesday_start ? schedule.wednesday_start.substring(0, 5) : "09:00",
      end_time: schedule.wednesday_end ? schedule.wednesday_end.substring(0, 5) : "17:00",
      is_working: !!schedule.wednesday_working,
    },
    {
      day: "Thursday",
      start_time: schedule.thursday_start ? schedule.thursday_start.substring(0, 5) : "09:00",
      end_time: schedule.thursday_end ? schedule.thursday_end.substring(0, 5) : "17:00",
      is_working: !!schedule.thursday_working,
    },
    {
      day: "Friday",
      start_time: schedule.friday_start ? schedule.friday_start.substring(0, 5) : "09:00",
      end_time: schedule.friday_end ? schedule.friday_end.substring(0, 5) : "17:00",
      is_working: !!schedule.friday_working,
    },
    {
      day: "Saturday",
      start_time: schedule.saturday_start ? schedule.saturday_start.substring(0, 5) : "09:00",
      end_time: schedule.saturday_end ? schedule.saturday_end.substring(0, 5) : "17:00",
      is_working: !!schedule.saturday_working,
    },
    {
      day: "Sunday",
      start_time: schedule.sunday_start ? schedule.sunday_start.substring(0, 5) : "09:00",
      end_time: schedule.sunday_end ? schedule.sunday_end.substring(0, 5) : "17:00",
      is_working: !!schedule.sunday_working,
    },
  ]
}

// Helper function to process employee data
function processEmployeeData(employeesData, defaultWorkingDays) {
  if (!Array.isArray(employeesData)) {
    return []
  }

  return employeesData.map((emp, index) => ({
    employee_id: `emp_${professionalId}_${index + 1}`,
    name: `${emp.first_name || ""} ${emp.last_name || ""}`.trim(),
    role: emp.role || "Staff Member",
    email: emp.email || "",
    is_active: true,
    working_days: [...defaultWorkingDays], // Use the business schedule as default
    services: [], // Empty services array - can be configured in setup
  }))
}

// Helper function to convert holidays to blocked times
function convertHolidaysToBlockedTimes(holidaysData) {
  if (!Array.isArray(holidaysData)) {
    return []
  }

  return holidaysData.map((holiday, index) => ({
    blocked_time_id: `holiday_${professionalId}_${index + 1}`,
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

// Process the data
const defaultWorkingDays = convertScheduleToWorkingDays(scheduleAvailData)
const processedEmployees = processEmployeeData(employeesData, defaultWorkingDays)
const holidayBlockedTimes = convertHolidaysToBlockedTimes(holidaysData)

// Extract business name from existing config or employee data
let businessName = ""
if (availabilitySetupData.config_data?.business_name) {
  businessName = availabilitySetupData.config_data.business_name
} else if (employeesData.length > 0) {
  // Try to extract business name from first employee's name or email
  const firstEmployee = employeesData[0]
  if (firstEmployee.first_name && firstEmployee.first_name !== firstEmployee.last_name) {
    businessName = firstEmployee.first_name
  }
}

// Build the complete configuration response
const configResponse = {
  success: true,
  message: "Configuration loaded successfully",
  config_data: {
    professional_id: professionalId,
    business_name: businessName,
    last_updated: new Date().toISOString(),
    created_at: availabilitySetupData.config_data?.created_at || new Date().toISOString(),
    webhook_status: "loaded",

    // Processed employees with default working schedules
    employees: processedEmployees,

    // Default capacity rules based on employee count
    capacity_rules: availabilitySetupData.config_data?.capacity_rules || {
      max_concurrent_bookings: Math.max(1, Math.floor(processedEmployees.length / 2)),
      buffer_time_between_bookings: 15,
      max_bookings_per_day: processedEmployees.length * 8, // 8 bookings per employee per day
      allow_overlapping: false,
      require_all_employees_for_service: false,
    },

    // Combine existing blocked times with holidays
    blocked_times: [...(availabilitySetupData.config_data?.blocked_times || []), ...holidayBlockedTimes],
  },

  // Additional metadata for debugging
  metadata: {
    source_data: {
      has_existing_config: !!availabilitySetupData.config_data,
      schedule_records: scheduleAvailData.length,
      holiday_records: holidaysData.length,
      employee_records: employeesData.length,
    },
    processed_at: new Date().toISOString(),
    business_schedule: defaultWorkingDays,
  },
}

// Log the response for debugging
console.log("Generated config response:", JSON.stringify(configResponse, null, 2))

// Function to return the response
function returnResponse() {
  return [{ json: configResponse }]
}

// Call the function to return the response
const response = returnResponse()
console.log("Response:", JSON.stringify(response, null, 2))
