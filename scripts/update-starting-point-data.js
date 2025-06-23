// n8n Code Node: Update Starting Point Data After Config Save
// This processes the webhook response and updates the original data tables

// Declare the $input variable
const $input = {
  all: () => [
    {
      json: [
        {
          webhook_response: {
            success: true,
            config_data: {
              professional_id: 123,
              business_name: "Example Business",
              employees: [
                {
                  employee_id: 1,
                  name: "John Doe",
                  email: "john.doe@example.com",
                  is_active: true,
                  role: "Manager",
                  working_days: [
                    { day: "Monday", start_time: "09", end_time: "17", is_working: true },
                    { day: "Tuesday", start_time: "09", end_time: "17", is_working: true },
                  ],
                },
                {
                  employee_id: 2,
                  name: "Jane Smith",
                  email: "jane.smith@example.com",
                  is_active: true,
                  role: "Employee",
                  working_days: [
                    { day: "Wednesday", start_time: "09", end_time: "17", is_working: true },
                    { day: "Thursday", start_time: "09", end_time: "17", is_working: true },
                  ],
                },
              ],
              last_updated: "2023-10-01T12:00:00Z",
            },
          },
        },
      ],
    },
  ],
}

const inputData = $input.all()[0]?.json || []

console.log("Processing webhook response to update starting point data...")
console.log("Input array length:", inputData.length)

// Find the first successful webhook response (they're all duplicates)
let configData = null
let professionalId = null

for (const item of inputData) {
  if (item.webhook_response && item.webhook_response.success && item.webhook_response.config_data) {
    configData = item.webhook_response.config_data
    professionalId = configData.professional_id
    console.log("Found successful config data for professional:", professionalId)
    break
  }
}

if (!configData || !professionalId) {
  throw new Error("No successful configuration data found in webhook response")
}

console.log("Processing configuration update:")
console.log("- Business:", configData.business_name)
console.log("- Employees:", configData.employees?.length || 0)
console.log("- Last updated:", configData.last_updated)

// Prepare updates for the original data tables
const updates = {
  // Update professional schedule (the flat schedule format)
  professional_schedule: {
    professional_id: professionalId,
    monday_start: "08:00:00",
    monday_end: "20:00:00",
    tuesday_start: "08:00:00",
    tuesday_end: "20:00:00",
    wednesday_start: "08:00:00",
    wednesday_end: "20:00:00",
    thursday_start: "08:00:00",
    thursday_end: "20:00:00",
    friday_start: "08:00:00",
    friday_end: "20:00:00",
    saturday_start: "08:00:00",
    saturday_end: "20:00:00",
    sunday_start: "08:00:00",
    sunday_end: "20:00:00",
    monday_working: "Monday",
    tuesday_working: "Tuesday",
    wednesday_working: "Wednesday",
    thursday_working: "Thursday",
    friday_working: "Friday",
    saturday_working: "Saturday",
    sunday_working: "Sunday",
    updated_at: new Date().toISOString(),
  },

  // Update employee records (simple format)
  employees_simple: [],

  // Metadata
  update_metadata: {
    professional_id: professionalId,
    updated_from_config: true,
    config_last_updated: configData.last_updated,
    sync_timestamp: new Date().toISOString(),
    total_employees: configData.employees?.length || 0,
  },
}

// Process employees from the detailed config back to simple format
if (configData.employees && Array.isArray(configData.employees)) {
  configData.employees.forEach((employee, index) => {
    // Split the full name back to first/last
    const nameParts = employee.name.split(" ")
    const firstName = nameParts[0] || ""
    const lastName = nameParts.slice(1).join(" ") || ""

    updates.employees_simple.push({
      employee_id: employee.employee_id,
      first_name: firstName,
      last_name: lastName,
      email: employee.email || "",
      is_active: employee.is_active,
      role: employee.role,
      updated_at: new Date().toISOString(),
      synced_from_config: true,
    })
  })
}

// Calculate aggregate schedule from all employees
// This creates a "business hours" schedule based on when any employee is working
const businessSchedule = {
  monday: { start: "08:00:00", end: "20:00:00", working: false },
  tuesday: { start: "08:00:00", end: "20:00:00", working: false },
  wednesday: { start: "08:00:00", end: "20:00:00", working: false },
  thursday: { start: "08:00:00", end: "20:00:00", working: false },
  friday: { start: "08:00:00", end: "20:00:00", working: false },
  saturday: { start: "08:00:00", end: "20:00:00", working: false },
  sunday: { start: "08:00:00", end: "20:00:00", working: false },
}

// Determine business hours from employee schedules
configData.employees.forEach((employee) => {
  if (employee.working_days && employee.is_active) {
    employee.working_days.forEach((day) => {
      const dayKey = day.day.toLowerCase()
      if (businessSchedule[dayKey] && day.is_working) {
        businessSchedule[dayKey].working = true

        // Use earliest start time and latest end time
        const currentStart = businessSchedule[dayKey].start
        const currentEnd = businessSchedule[dayKey].end
        const dayStart = day.start_time + ":00"
        const dayEnd = day.end_time + ":00"

        if (dayStart < currentStart) {
          businessSchedule[dayKey].start = dayStart
        }
        if (dayEnd > currentEnd) {
          businessSchedule[dayKey].end = dayEnd
        }
      }
    })
  }
})

// Update the professional schedule with calculated business hours
updates.professional_schedule = {
  professional_id: professionalId,
  monday_start: businessSchedule.monday.start,
  monday_end: businessSchedule.monday.end,
  tuesday_start: businessSchedule.tuesday.start,
  tuesday_end: businessSchedule.tuesday.end,
  wednesday_start: businessSchedule.wednesday.start,
  wednesday_end: businessSchedule.wednesday.end,
  thursday_start: businessSchedule.thursday.start,
  thursday_end: businessSchedule.thursday.end,
  friday_start: businessSchedule.friday.start,
  friday_end: businessSchedule.friday.end,
  saturday_start: businessSchedule.saturday.start,
  saturday_end: businessSchedule.saturday.end,
  sunday_start: businessSchedule.sunday.start,
  sunday_end: businessSchedule.sunday.end,
  monday_working: businessSchedule.monday.working ? "Monday" : null,
  tuesday_working: businessSchedule.tuesday.working ? "Tuesday" : null,
  wednesday_working: businessSchedule.wednesday.working ? "Wednesday" : null,
  thursday_working: businessSchedule.thursday.working ? "Thursday" : null,
  friday_working: businessSchedule.friday.working ? "Friday" : null,
  saturday_working: businessSchedule.saturday.working ? "Saturday" : null,
  sunday_working: businessSchedule.sunday.working ? "Sunday" : null,
  updated_at: new Date().toISOString(),
}

console.log("Prepared updates:")
console.log("- Professional schedule: 1 record")
console.log("- Simple employees:", updates.employees_simple.length)
console.log("- Business hours calculated from employee schedules")

// Function to return the structured updates
function returnUpdates() {
  return [updates]
}

// Call the function to return the updates
const result = returnUpdates()
console.log(result)
