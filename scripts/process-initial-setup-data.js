// n8n Code Node: Process Initial Setup Data
// Input: Array with empty objects, employee records, and schedule data

// Declare the $input variable
const $input = {
  first: () => ({
    json: [
      {}, // Empty object
      { first_name: "John", last_name: "Doe", email: "john.doe@example.com", role: "Manager" },
      { professional_id: "123", monday_start: "09:00", monday_end: "17:00", monday_working: true },
    ],
  }),
}

// Get the input array
const inputArray = $input.first().json

console.log("Input array length:", inputArray.length)
console.log("Input data:", JSON.stringify(inputArray, null, 2))

// Initialize containers
let scheduleData = null
const employeesData = []
let professionalId = "unknown"

// Process the input array
inputArray.forEach((item, index) => {
  console.log(`Processing item ${index}:`, item)

  // Skip empty objects
  if (!item || Object.keys(item).length === 0) {
    console.log(`Item ${index} is empty, skipping`)
    return
  }

  // Check if this is employee data
  if (item.first_name && item.last_name && item.email) {
    console.log(`Item ${index} is employee data:`, item.first_name, item.last_name)
    employeesData.push(item)
  }

  // Check if this is schedule data
  else if (item.professional_id && item.monday_start) {
    console.log(`Item ${index} is schedule data for professional:`, item.professional_id)
    scheduleData = item
    professionalId = item.professional_id
  }
})

console.log("Found employees:", employeesData.length)
console.log("Found schedule data:", scheduleData ? "yes" : "no")
console.log("Professional ID:", professionalId)

// Helper function to convert schedule data to working days
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
function processEmployeeData(employeesData, defaultWorkingDays, professionalId) {
  if (!Array.isArray(employeesData)) {
    return []
  }

  return employeesData.map((emp, index) => {
    const employeeId = `emp_${professionalId}_${index + 1}`
    const fullName = `${emp.first_name || ""} ${emp.last_name || ""}`.trim()

    console.log(`Processing employee ${index + 1}: ${fullName} (${emp.email})`)

    return {
      employee_id: employeeId,
      name: fullName,
      role: emp.role || "Staff Member",
      email: emp.email || "",
      is_active: true,
      working_days: [...defaultWorkingDays], // Use the business schedule as default
      services: [], // Empty services array - can be configured in setup
    }
  })
}

// Process the data
const defaultWorkingDays = convertScheduleToWorkingDays(scheduleData)
const processedEmployees = processEmployeeData(employeesData, defaultWorkingDays, professionalId)

// Extract business name from first employee's first name
let businessName = ""
if (employeesData.length > 0) {
  const firstEmployee = employeesData[0]
  if (firstEmployee.first_name) {
    businessName = firstEmployee.first_name
  }
}

console.log("Business name extracted:", businessName)
console.log("Processed employees:", processedEmployees.length)

// Create the configuration response
const configResponse = {
  success: true,
  message: "Initial configuration loaded successfully",

  config_data: {
    professional_id: professionalId,
    business_name: businessName,
    last_updated: new Date().toISOString(),
    created_at: new Date().toISOString(),
    webhook_status: "initial_load",

    // Team members from the database
    employees: processedEmployees,

    // Default capacity rules based on employee count
    capacity_rules: {
      max_concurrent_bookings: Math.max(1, Math.floor(processedEmployees.length / 2)),
      buffer_time_between_bookings: 15,
      max_bookings_per_day: processedEmployees.length * 8, // 8 bookings per employee per day
      allow_overlapping: false,
      require_all_employees_for_service: false,
    },

    // No blocked times initially
    blocked_times: [],
  },

  // Debug information
  debug_info: {
    input_array_length: inputArray.length,
    employees_found: employeesData.length,
    schedule_data_found: scheduleData ? true : false,
    professional_id: professionalId,
    business_name: businessName,
    working_days_created: defaultWorkingDays.length,
  },

  // Raw data for debugging
  raw_data: {
    original_input: inputArray,
    extracted_employees: employeesData,
    extracted_schedule: scheduleData,
    processed_working_days: defaultWorkingDays,
  },
}

console.log("Final config response:", JSON.stringify(configResponse, null, 2))

// Function to return the response in n8n format
function returnResponse(response) {
  return [{ json: response }]
}

// Call the function to return the response
const finalResponse = returnResponse(configResponse)
console.log("Final response:", JSON.stringify(finalResponse, null, 2))
