// n8n Code Node: Format Employee Data for Frontend Setup Page
// This ensures employees populate correctly in the Team Management tab

// Declare the $input variable
const $input = {
  first: () => ({
    json: [
      { first_name: "John", last_name: "Doe", email: "john.doe@example.com", role: "Manager" },
      { first_name: "Jane", last_name: "Smith", email: "jane.smith@example.com" },
      { professional_id: "123", monday_start: "09:00", monday_end: "17:00", monday_working: true },
    ],
  }),
}

// Get the input array from the webhook
const inputArray = $input.first().json

console.log("Processing webhook input for employee setup...")
console.log("Input array length:", inputArray.length)

// Initialize containers
let scheduleData = null
const employeesData = []
let professionalId = "unknown"

// Process the input array
inputArray.forEach((item, index) => {
  // Skip empty objects
  if (!item || Object.keys(item).length === 0) {
    return
  }

  // Check if this is employee data
  if (item.first_name && item.last_name && item.email) {
    console.log(`Found employee: ${item.first_name} ${item.last_name}`)
    employeesData.push(item)
  }

  // Check if this is schedule data
  else if (item.professional_id && item.monday_start) {
    console.log(`Found schedule data for professional: ${item.professional_id}`)
    scheduleData = item
    professionalId = item.professional_id
  }
})

console.log(`Found ${employeesData.length} employees for professional ${professionalId}`)

// Helper function to convert schedule data to working days format
function convertScheduleToWorkingDays(scheduleData) {
  if (!scheduleData) {
    // Return default working days
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

  // Convert schedule data to working days format
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

// Process employees in the exact format the frontend expects
function processEmployeesForFrontend(employeesData, defaultWorkingDays, professionalId) {
  return employeesData.map((emp, index) => {
    const employeeId = `emp_${professionalId}_${Date.now()}_${index + 1}`
    const fullName = `${emp.first_name || ""} ${emp.last_name || ""}`.trim()

    console.log(`Processing employee ${index + 1}: ${fullName}`)

    // This format matches exactly what your frontend WebhookEmployee type expects
    return {
      employee_id: employeeId,
      name: fullName,
      role: emp.role || "Staff Member", // Default role
      email: emp.email || "",
      is_active: true, // Default to active
      working_days: [...defaultWorkingDays], // Copy the business schedule
      services: [], // Empty services array - user can configure in setup
    }
  })
}

// Convert schedule data to working days
const defaultWorkingDays = convertScheduleToWorkingDays(scheduleData)

// Process employees for frontend
const processedEmployees = processEmployeesForFrontend(employeesData, defaultWorkingDays, professionalId)

// Extract business name from first employee
let businessName = ""
if (employeesData.length > 0 && employeesData[0].first_name) {
  businessName = employeesData[0].first_name
}

// Create the response in the exact format your setup page expects
const configResponse = {
  success: true,
  message: "Configuration loaded successfully",
  config_data: {
    professional_id: professionalId,
    business_name: businessName,
    last_updated: new Date().toISOString(),
    created_at: new Date().toISOString(),
    webhook_status: "loaded",

    // EMPLOYEES: This array will populate the Team Management tab
    employees: processedEmployees,

    // CAPACITY RULES: Default rules based on team size
    capacity_rules: {
      max_concurrent_bookings: Math.max(1, Math.floor(processedEmployees.length / 2)),
      buffer_time_between_bookings: 15,
      max_bookings_per_day: processedEmployees.length * 8,
      allow_overlapping: false,
      require_all_employees_for_service: false,
    },

    // BLOCKED TIMES: Empty initially
    blocked_times: [],
  },

  // Debug info to verify employee processing
  debug_info: {
    employees_processed: processedEmployees.length,
    employee_names: processedEmployees.map((emp) => emp.name),
    professional_id: professionalId,
    business_name: businessName,
    working_days_applied: defaultWorkingDays.length,
  },
}

console.log("Employee data formatted for frontend:")
console.log("- Total employees:", processedEmployees.length)
console.log(
  "- Employee names:",
  processedEmployees.map((emp) => emp.name),
)
console.log("- Each employee has working days:", defaultWorkingDays.length)

// Function to return in n8n format
function returnResponse(response) {
  return [{ json: response }]
}

// Call the function to return the response
const finalResponse = returnResponse(configResponse)
console.log(finalResponse)
