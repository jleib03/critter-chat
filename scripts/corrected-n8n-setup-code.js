// n8n Function Node: Handle Setup Data Flow
// Fixed version without n8n-core imports

// Declare variables
const $input = { all: () => [] } // Placeholder for $input
const $ = { all: () => [] } // Placeholder for $

const allInputs = $input.all()

// Initialize containers
let scheduleAvailData = null
let holidaysData = []
let employeesData = []
let availabilitySetupData = null

// Process all inputs first
allInputs.forEach((input, index) => {
  const data = input.json

  // Detect data type based on structure
  if (data.first_name && data.last_name && data.email) {
    // This is employee data
    employeesData.push(data)
  } else if (data.date || data.holiday_date || data.name) {
    // This is holiday data
    holidaysData.push(data)
  } else if (data.monday_start !== undefined || data.professional_id) {
    // This is schedule availability data
    scheduleAvailData = data
  } else if (data.config_data || data.webhook_response) {
    // This is availability setup data
    availabilitySetupData = data
  }
})

// Try to access data from previous nodes directly using your exact node names
try {
  // Access schedule availability data (1st node)
  const scheduleNode = $("Get Schedule Avail").all()
  if (scheduleNode && scheduleNode.length > 0) {
    scheduleAvailData = scheduleNode[0].json
  }
} catch (e) {
  console.log("Could not access Get Schedule Avail node:", e.message)
}

try {
  // Access holidays data (2nd node)
  const holidaysNode = $("Get Holidays Avail").all()
  if (holidaysNode && holidaysNode.length > 0) {
    holidaysData = holidaysNode.map((item) => item.json)
  }
} catch (e) {
  console.log("Could not access Get Holidays Avail node:", e.message)
}

try {
  // Access employees data (3rd node)
  const employeesNode = $("Get Employees").all()
  if (employeesNode && employeesNode.length > 0) {
    employeesData = employeesNode.map((item) => item.json)
  }
} catch (e) {
  console.log("Could not access Get Employees node:", e.message)
}

try {
  // Access availability setup data (4th node)
  const setupNode = $("Availability Set-Up").all()
  if (setupNode && setupNode.length > 0) {
    availabilitySetupData = setupNode[0].json
  }
} catch (e) {
  console.log("Could not access Availability Set-Up node:", e.message)
}

// Get professional_id from available data
const professionalId =
  scheduleAvailData?.professional_id ||
  availabilitySetupData?.professional_id ||
  availabilitySetupData?.config_data?.professional_id ||
  "unknown"

console.log("Processing setup data for professional:", professionalId)
console.log("Schedule data:", scheduleAvailData ? "found" : "not found")
console.log("Holiday records:", holidaysData.length)
console.log("Employee records:", employeesData.length)
console.log("Setup data:", availabilitySetupData ? "found" : "not found")

// Helper function to convert schedule availability to working days
function convertScheduleToWorkingDays(scheduleData) {
  if (!scheduleData) {
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
if (availabilitySetupData?.config_data?.business_name) {
  businessName = availabilitySetupData.config_data.business_name
} else if (employeesData.length > 0) {
  // Try to extract business name from first employee's name
  const firstEmployee = employeesData[0]
  if (firstEmployee.first_name && firstEmployee.first_name !== firstEmployee.last_name) {
    businessName = firstEmployee.first_name
  }
}

// Create the final output
const output = {
  success: true,
  message: "Configuration loaded successfully",

  config_data: {
    professional_id: professionalId,
    business_name: businessName,
    last_updated: new Date().toISOString(),
    created_at: availabilitySetupData?.config_data?.created_at || new Date().toISOString(),
    webhook_status: "loaded",

    // Processed employees with default working schedules
    employees: processedEmployees,

    // Default capacity rules based on employee count
    capacity_rules: availabilitySetupData?.config_data?.capacity_rules || {
      max_concurrent_bookings: Math.max(1, Math.floor(processedEmployees.length / 2)),
      buffer_time_between_bookings: 15,
      max_bookings_per_day: processedEmployees.length * 8, // 8 bookings per employee per day
      allow_overlapping: false,
      require_all_employees_for_service: false,
    },

    // Combine existing blocked times with holidays
    blocked_times: [...(availabilitySetupData?.config_data?.blocked_times || []), ...holidayBlockedTimes],
  },

  // Debug info
  debug_info: {
    inputs_received: allInputs.length,
    data_types_found: {
      schedule_avail: scheduleAvailData ? 1 : 0,
      holidays: holidaysData.length,
      employees: employeesData.length,
      availability_setup: availabilitySetupData ? 1 : 0,
    },
    processed_data: {
      working_days: defaultWorkingDays.length,
      processed_employees: processedEmployees.length,
      holiday_blocked_times: holidayBlockedTimes.length,
    },
  },

  // Raw data for debugging
  raw_data: {
    schedule_avail: scheduleAvailData,
    holidays: holidaysData,
    employees: employeesData,
    availability_setup: availabilitySetupData,
  },
}

// Log for debugging
console.log("Generated config response:", JSON.stringify(output, null, 2))

// Function to return output in n8n format
function returnOutput(output) {
  return [{ json: output }]
}

// Call the function to return output
const result = returnOutput(output)
console.log("Result:", result)
