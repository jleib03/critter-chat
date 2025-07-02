// n8n Code Node: Execute Configuration Save
// This code takes the parsed data and executes the database operations

// Declare the $input variable
const $input = {
  all: () => [
    {
      json: {
        professional_config: {
          professional_id: 1,
          business_name: "Example Business",
          updated_at: new Date(),
          webhook_status: "active",
        },
        capacity_rules: {
          professional_id: 1,
          max_concurrent_bookings: 10,
          buffer_time_between_bookings: 30,
          max_bookings_per_day: 20,
          allow_overlapping: false,
          require_all_employees_for_service: true,
          updated_at: new Date(),
        },
        employees: [
          {
            employee_id: 1,
            professional_id: 1,
            name: "John Doe",
            role: "Manager",
            email: "john@example.com",
            is_active: true,
            updated_at: new Date(),
          },
        ],
        employee_working_days: [
          {
            employee_id: 1,
            day_of_week: "Monday",
            start_time: "09:00",
            end_time: "17:00",
            is_working: true,
            updated_at: new Date(),
          },
        ],
        employee_services: [{ employee_id: 1, service_name: "Consultation", created_at: new Date() }],
        blocked_times: [
          {
            blocked_time_id: 1,
            professional_id: 1,
            employee_id: 1,
            blocked_date: new Date(),
            start_time: "12:00",
            end_time: "13:00",
            reason: "Lunch",
            is_recurring: false,
            recurrence_pattern: "",
            updated_at: new Date(),
          },
        ],
      },
    },
  ],
}

// Get the parsed configuration data from the previous node
const configData = $input.all()[0]?.json

if (!configData) {
  throw new Error("No configuration data received from parser")
}

console.log("Executing database save operations...")

// Prepare SQL execution plan
const sqlOperations = []

// 1. Professional config upsert
sqlOperations.push({
  query: "professional_config_upsert",
  params: [
    configData.professional_config.professional_id,
    configData.professional_config.business_name,
    configData.professional_config.updated_at,
    configData.professional_config.webhook_status,
  ],
})

// 2. Capacity rules upsert
sqlOperations.push({
  query: "capacity_rules_upsert",
  params: [
    configData.capacity_rules.professional_id,
    configData.capacity_rules.max_concurrent_bookings,
    configData.capacity_rules.buffer_time_between_bookings,
    configData.capacity_rules.max_bookings_per_day,
    configData.capacity_rules.allow_overlapping,
    configData.capacity_rules.require_all_employees_for_service,
    configData.capacity_rules.updated_at,
  ],
})

// 3. Delete existing employees (will cascade to working days and services)
sqlOperations.push({
  query: "delete_existing_employees",
  params: [configData.professional_config.professional_id],
})

// 4. Insert employees
configData.employees.forEach((emp) => {
  sqlOperations.push({
    query: "insert_employee",
    params: [emp.employee_id, emp.professional_id, emp.name, emp.role, emp.email, emp.is_active, emp.updated_at],
  })
})

// 5. Insert employee working days
configData.employee_working_days.forEach((workDay) => {
  sqlOperations.push({
    query: "insert_working_day",
    params: [
      workDay.employee_id,
      workDay.day_of_week,
      workDay.start_time,
      workDay.end_time,
      workDay.is_working,
      workDay.updated_at,
    ],
  })
})

// 6. Insert employee services
configData.employee_services.forEach((service) => {
  sqlOperations.push({
    query: "insert_employee_service",
    params: [service.employee_id, service.service_name, service.created_at],
  })
})

// 7. Delete existing blocked times
sqlOperations.push({
  query: "delete_existing_blocked_times",
  params: [configData.professional_config.professional_id],
})

// 8. Insert blocked times
configData.blocked_times.forEach((blocked) => {
  sqlOperations.push({
    query: "insert_blocked_time",
    params: [
      blocked.blocked_time_id,
      blocked.professional_id,
      blocked.employee_id,
      blocked.blocked_date,
      blocked.start_time,
      blocked.end_time,
      blocked.reason,
      blocked.is_recurring,
      blocked.recurrence_pattern,
      blocked.updated_at,
    ],
  })
})

// 9. Log the change
sqlOperations.push({
  query: "log_config_change",
  params: [configData.professional_config.professional_id, JSON.stringify(configData), new Date().toISOString()],
})

console.log(`Prepared ${sqlOperations.length} SQL operations`)

// Function to return the operations for execution by SQL nodes
function returnOperations() {
  return [
    {
      sql_operations: sqlOperations,
      summary: {
        professional_id: configData.professional_config.professional_id,
        business_name: configData.professional_config.business_name,
        employees_count: configData.employees.length,
        working_days_count: configData.employee_working_days.length,
        services_count: configData.employee_services.length,
        blocked_times_count: configData.blocked_times.length,
        total_operations: sqlOperations.length,
      },
      success_message: `Configuration saved successfully for ${configData.professional_config.business_name} (${configData.employees.length} employees, ${configData.employee_working_days.length} working day records)`,
    },
  ]
}

// Call the function to return operations
const operations = returnOperations()
console.log(operations)
