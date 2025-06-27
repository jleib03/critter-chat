// n8n Code Node: Save Professional Configuration
// This code parses the configuration data and prepares it for database insertion

// Declare the $input variable
const $input = {
  all: () => [
    {
      json: {
        professional_id: "123",
        session_id: "session123",
        body: {
          config_data: {
            business_name: "Example Business",
            employees: [
              {
                employee_id: "emp1",
                name: "John Doe",
                role: "Manager",
                email: "john@example.com",
                is_active: true,
                working_days: [{ day: "Monday", start_time: "09:00", end_time: "17:00", is_working: true }],
                services: ["Service A", "Service B"],
              },
            ],
            blocked_times: [
              {
                blocked_time_id: "bt1",
                date: "2023-10-01",
                start_time: "12:00",
                end_time: "13:00",
                reason: "Lunch",
                is_recurring: false,
              },
            ],
          },
        },
      },
    },
  ],
}

// Get the input data from the webhook
const inputData = $input.all()[0]?.json || []
const configPayload = Array.isArray(inputData) ? inputData[0] : inputData

console.log("Processing configuration save request...")
console.log("Professional ID:", configPayload.professional_id)

// Extract the main configuration data
const professionalId = configPayload.professional_id
const sessionId = configPayload.session_id
const configData = configPayload.body?.config_data || {}

// Validate required data
if (!professionalId || !configData) {
  throw new Error("Missing required professional_id or config_data")
}

console.log("Business Name:", configData.business_name)
console.log("Number of Employees:", configData.employees?.length || 0)

// Prepare professional config record
const professionalConfig = {
  professional_id: professionalId,
  business_name: configData.business_name || "",
  updated_at: new Date().toISOString(),
  webhook_status: "processing",
}

// Prepare capacity rules
const capacityRules = {
  professional_id: professionalId,
  max_concurrent_bookings: configData.capacity_rules?.max_concurrent_bookings || 1,
  buffer_time_between_bookings: configData.capacity_rules?.buffer_time_between_bookings || 15,
  max_bookings_per_day: configData.capacity_rules?.max_bookings_per_day || 20,
  allow_overlapping: configData.capacity_rules?.allow_overlapping || false,
  require_all_employees_for_service: configData.capacity_rules?.require_all_employees_for_service || false,
  updated_at: new Date().toISOString(),
}

// Prepare employees data
const employees = []
const employeeWorkingDays = []
const employeeServices = []

if (configData.employees && Array.isArray(configData.employees)) {
  configData.employees.forEach((emp) => {
    // Employee record
    employees.push({
      employee_id: emp.employee_id,
      professional_id: professionalId,
      name: emp.name || "",
      role: emp.role || "Staff Member",
      email: emp.email || "",
      is_active: emp.is_active !== false,
      updated_at: new Date().toISOString(),
    })

    // Working days for this employee
    if (emp.working_days && Array.isArray(emp.working_days)) {
      emp.working_days.forEach((day) => {
        employeeWorkingDays.push({
          employee_id: emp.employee_id,
          day_of_week: day.day,
          start_time: day.start_time,
          end_time: day.end_time,
          is_working: day.is_working || false,
          updated_at: new Date().toISOString(),
        })
      })
    }

    // Services for this employee
    if (emp.services && Array.isArray(emp.services)) {
      emp.services.forEach((service) => {
        employeeServices.push({
          employee_id: emp.employee_id,
          service_name: service,
          created_at: new Date().toISOString(),
        })
      })
    }
  })
}

// Prepare blocked times
const blockedTimes = []
if (configData.blocked_times && Array.isArray(configData.blocked_times)) {
  configData.blocked_times.forEach((blocked) => {
    blockedTimes.push({
      blocked_time_id: blocked.blocked_time_id,
      professional_id: professionalId,
      employee_id: blocked.employee_id || null,
      blocked_date: blocked.date,
      start_time: blocked.start_time,
      end_time: blocked.end_time,
      reason: blocked.reason || "",
      is_recurring: blocked.is_recurring || false,
      recurrence_pattern: blocked.recurrence_pattern || null,
      updated_at: new Date().toISOString(),
    })
  })
}

// Log summary
console.log("Prepared data summary:")
console.log("- Professional config: 1 record")
console.log("- Capacity rules: 1 record")
console.log("- Employees:", employees.length)
console.log("- Working day records:", employeeWorkingDays.length)
console.log("- Service assignments:", employeeServices.length)
console.log("- Blocked times:", blockedTimes.length)

// Function to return structured data for database operations
function getStructuredData() {
  return [
    {
      professional_config: professionalConfig,
      capacity_rules: capacityRules,
      employees: employees,
      employee_working_days: employeeWorkingDays,
      employee_services: employeeServices,
      blocked_times: blockedTimes,
      metadata: {
        session_id: sessionId,
        processed_at: new Date().toISOString(),
        total_records:
          employees.length + employeeWorkingDays.length + employeeServices.length + blockedTimes.length + 2,
      },
    },
  ]
}

// Call the function to get the structured data
const structuredData = getStructuredData()
console.log(structuredData)
