// n8n Function Node: Flatten Raw Webhook Data for Switch Node (Updated with Booking Preferences)
// This works with the actual webhook structure: body.config_data

const $input = { first: () => ({ json: { body: { config_data: {} }, professional_id: "", session_id: "" } }) } // Mock declaration for $input
const input = $input.first().json
const configData = input.body.config_data
const professionalId = input.professional_id
const sessionId = input.session_id

const outputs = []

// 1. Professional Config Record (Updated with booking preferences)
const professionalConfigData = {
  professional_id: professionalId,
  business_name: configData.business_name,
  webhook_status: "pending",
}

// Add booking preferences if they exist
if (configData.booking_preferences) {
  const bookingPrefs = configData.booking_preferences

  professionalConfigData.booking_type = bookingPrefs.booking_type || "direct_booking"
  professionalConfigData.allow_direct_booking =
    bookingPrefs.allow_direct_booking !== undefined ? bookingPrefs.allow_direct_booking : true
  professionalConfigData.require_approval =
    bookingPrefs.require_approval !== undefined ? bookingPrefs.require_approval : false
  professionalConfigData.online_booking_enabled =
    bookingPrefs.online_booking_enabled !== undefined ? bookingPrefs.online_booking_enabled : true

  // Store full booking preferences as JSON for additional data
  professionalConfigData.booking_preferences = JSON.stringify({
    booking_type: bookingPrefs.booking_type,
    allow_direct_booking: bookingPrefs.allow_direct_booking,
    require_approval: bookingPrefs.require_approval,
    online_booking_enabled: bookingPrefs.online_booking_enabled,
    custom_instructions: bookingPrefs.custom_instructions || null,
  })
} else {
  // Set defaults if no booking preferences provided
  professionalConfigData.booking_type = "direct_booking"
  professionalConfigData.allow_direct_booking = true
  professionalConfigData.require_approval = false
  professionalConfigData.online_booking_enabled = true
  professionalConfigData.booking_preferences = JSON.stringify({
    booking_type: "direct_booking",
    allow_direct_booking: true,
    require_approval: false,
    online_booking_enabled: true,
    custom_instructions: null,
  })
}

outputs.push({
  json: {
    table_name: "professional_configs",
    operation: "upsert",
    data: professionalConfigData,
    professional_id: professionalId,
    session_id: sessionId,
  },
})

// 2. Capacity Rules Record
if (configData.capacity_rules) {
  outputs.push({
    json: {
      table_name: "capacity_rules",
      operation: "upsert",
      data: {
        professional_id: professionalId,
        max_concurrent_bookings: configData.capacity_rules.max_concurrent_bookings,
        buffer_time_between_bookings: configData.capacity_rules.buffer_time_between_bookings,
        max_bookings_per_day: configData.capacity_rules.max_bookings_per_day,
        allow_overlapping: configData.capacity_rules.allow_overlapping,
        require_all_employees_for_service: configData.capacity_rules.require_all_employees_for_service,
      },
      professional_id: professionalId,
      session_id: sessionId,
    },
  })
}

// 3. Process Employees and their related data
if (configData.employees && Array.isArray(configData.employees)) {
  configData.employees.forEach((employee) => {
    // Employee record
    outputs.push({
      json: {
        table_name: "employees",
        operation: "upsert",
        data: {
          employee_id: employee.employee_id,
          professional_id: professionalId,
          name: employee.name,
          role: employee.role,
          email: employee.email,
          is_active: employee.is_active,
        },
        professional_id: professionalId,
        session_id: sessionId,
      },
    })

    // Employee working days (only for days where is_working = true)
    if (employee.working_days && Array.isArray(employee.working_days)) {
      employee.working_days.forEach((workingDay) => {
        if (workingDay.is_working) {
          outputs.push({
            json: {
              table_name: "employee_working_days",
              operation: "upsert",
              data: {
                employee_id: employee.employee_id,
                day_of_week: workingDay.day,
                start_time: workingDay.start_time,
                end_time: workingDay.end_time,
                is_working: workingDay.is_working,
              },
              professional_id: professionalId,
              session_id: sessionId,
            },
          })
        }
      })
    }

    // Employee services
    if (employee.services && Array.isArray(employee.services)) {
      employee.services.forEach((service) => {
        outputs.push({
          json: {
            table_name: "employee_services",
            operation: "upsert",
            data: {
              employee_id: employee.employee_id,
              service_name: service,
            },
            professional_id: professionalId,
            session_id: sessionId,
          },
        })
      })
    }
  })
}

// 4. Process Blocked Times
if (configData.blocked_times && Array.isArray(configData.blocked_times)) {
  configData.blocked_times.forEach((blockedTime) => {
    outputs.push({
      json: {
        table_name: "blocked_times",
        operation: "upsert",
        data: {
          blocked_time_id: blockedTime.blocked_time_id,
          professional_id: professionalId,
          employee_id: blockedTime.employee_id || null,
          blocked_date: blockedTime.blocked_date,
          start_time: blockedTime.start_time,
          end_time: blockedTime.end_time,
          reason: blockedTime.reason,
          is_recurring: blockedTime.is_recurring || false,
          recurrence_pattern: blockedTime.recurrence_pattern || null,
        },
        professional_id: professionalId,
        session_id: sessionId,
      },
    })
  })
}

// 5. Add summary record (updated with booking preferences info)
outputs.push({
  json: {
    table_name: "summary",
    operation: "log",
    data: {
      professional_id: professionalId,
      session_id: sessionId,
      business_name: configData.business_name,
      booking_type: professionalConfigData.booking_type,
      online_booking_enabled: professionalConfigData.online_booking_enabled,
      total_records_processed: outputs.length,
      employees_count: configData.employees?.length || 0,
      working_days_count: outputs.filter((o) => o.json.table_name === "employee_working_days").length,
      services_count: outputs.filter((o) => o.json.table_name === "employee_services").length,
      blocked_times_count: configData.blocked_times?.length || 0,
      timestamp: new Date().toISOString(),
    },
    professional_id: professionalId,
    session_id: sessionId,
  },
})

function returnOutputs() {
  return outputs
}

returnOutputs()
