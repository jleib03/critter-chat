// Enhanced n8n Code Node: Combine Setup Data with Advanced Processing
// Handles more complex data structures and edge cases

// Declare variables before using them
const $input = {
  all: () => [{ json: [] }, { json: [] }, { json: [] }],
}

const $ = {
  "Availability Set-Up": [{ json: { professional_id: "12345" } }],
}

const scheduleData = $input.all()[0]?.json || []
const holidaysData = $input.all()[1]?.json || []
const employeesData = $input.all()[2]?.json || []
const professionalId = $("Availability Set-Up").first().json.professional_id

// Enhanced helper functions
const DataProcessor = {
  // Process schedule data with better error handling
  processScheduleData(scheduleData) {
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    const workingDays = daysOfWeek.map((day) => ({
      day: day,
      start_time: "09:00",
      end_time: "17:00",
      is_working: false,
    }))

    if (!Array.isArray(scheduleData)) {
      console.log("Schedule data is not an array, using defaults")
      return workingDays
    }

    scheduleData.forEach((schedule, index) => {
      try {
        // Handle different possible field names
        const dayName = schedule.day_of_week || schedule.day || schedule.dayOfWeek || schedule.weekday

        const startTime = schedule.start_time || schedule.startTime || schedule.open_time || "09:00"

        const endTime = schedule.end_time || schedule.endTime || schedule.close_time || "17:00"

        const isAvailable =
          schedule.is_available !== false && schedule.available !== false && schedule.is_working !== false

        if (dayName) {
          const dayIndex = daysOfWeek.findIndex((day) => day.toLowerCase() === dayName.toLowerCase())

          if (dayIndex !== -1) {
            workingDays[dayIndex] = {
              day: daysOfWeek[dayIndex],
              start_time: this.formatTime(startTime),
              end_time: this.formatTime(endTime),
              is_working: isAvailable,
            }
          }
        }
      } catch (error) {
        console.log(`Error processing schedule record ${index}:`, error.message)
      }
    })

    return workingDays
  },

  // Process holidays with better date handling
  processHolidays(holidaysData) {
    if (!Array.isArray(holidaysData)) {
      console.log("Holidays data is not an array, returning empty array")
      return []
    }

    return holidaysData
      .map((holiday, index) => {
        try {
          // Handle different date formats
          const holidayDate =
            holiday.date || holiday.holiday_date || holiday.day || new Date().toISOString().split("T")[0]

          const holidayName = holiday.name || holiday.holiday_name || holiday.title || "Holiday"

          return {
            blocked_time_id: `holiday_${holiday.id || index}_${Date.now()}`,
            employee_id: null,
            employee_name: null,
            date: this.formatDate(holidayDate),
            start_time: "00:00",
            end_time: "23:59",
            reason: holidayName,
            is_recurring: holiday.is_recurring === true || holiday.recurring === true,
            recurrence_pattern: holiday.recurrence_pattern || holiday.pattern || null,
          }
        } catch (error) {
          console.log(`Error processing holiday record ${index}:`, error.message)
          return null
        }
      })
      .filter(Boolean) // Remove null entries
  },

  // Process employees with comprehensive data mapping
  processEmployees(employeesData, defaultWorkingDays) {
    if (!Array.isArray(employeesData)) {
      console.log("Employees data is not an array, returning empty array")
      return []
    }

    return employeesData
      .map((emp, index) => {
        try {
          // Handle different employee ID formats
          const employeeId = emp.employee_id || emp.id || emp.user_id || `emp_${Date.now()}_${index}`

          // Handle different name formats
          const employeeName =
            emp.name ||
            emp.employee_name ||
            emp.full_name ||
            `${emp.first_name || ""} ${emp.last_name || ""}`.trim() ||
            "Unknown Employee"

          // Handle different role formats
          const employeeRole = emp.role || emp.position || emp.job_title || emp.title || "Staff"

          // Handle services - could be array or comma-separated string
          let services = []
          if (Array.isArray(emp.services)) {
            services = emp.services
          } else if (typeof emp.services === "string") {
            services = emp.services
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          } else if (emp.service_list) {
            services = Array.isArray(emp.service_list) ? emp.service_list : [emp.service_list]
          }

          // Use employee-specific schedule if available
          let workingDays = [...defaultWorkingDays]
          if (emp.schedule && Array.isArray(emp.schedule)) {
            workingDays = this.processScheduleData(emp.schedule)
          }

          return {
            employee_id: employeeId,
            name: employeeName,
            role: employeeRole,
            email: emp.email || emp.email_address || "",
            is_active: emp.is_active !== false && emp.active !== false && emp.status !== "inactive",
            working_days: workingDays,
            services: services,
          }
        } catch (error) {
          console.log(`Error processing employee record ${index}:`, error.message)
          return null
        }
      })
      .filter(Boolean) // Remove null entries
  },

  // Helper function to format time strings
  formatTime(timeString) {
    if (!timeString) return "09:00"

    // Handle different time formats
    if (typeof timeString === "string") {
      // Remove seconds if present (HH:MM:SS -> HH:MM)
      const timeParts = timeString.split(":")
      if (timeParts.length >= 2) {
        return `${timeParts[0].padStart(2, "0")}:${timeParts[1].padStart(2, "0")}`
      }
    }

    return timeString.toString()
  },

  // Helper function to format dates
  formatDate(dateString) {
    if (!dateString) return new Date().toISOString().split("T")[0]

    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return new Date().toISOString().split("T")[0]
      }
      return date.toISOString().split("T")[0]
    } catch (error) {
      console.log("Error formatting date:", error.message)
      return new Date().toISOString().split("T")[0]
    }
  },
}

// Process all data
console.log("Processing setup data with enhanced processor...")

const defaultWorkingDays = DataProcessor.processScheduleData(scheduleData)
const processedEmployees = DataProcessor.processEmployees(employeesData, defaultWorkingDays)
const holidayBlockedTimes = DataProcessor.processHolidays(holidaysData)

// Extract business information
const businessName =
  employeesData[0]?.business_name || employeesData[0]?.company_name || employeesData[0]?.organization || ""

// Build enhanced response
const enhancedResponse = {
  success: true,
  message: "Configuration loaded and processed successfully",
  config_data: {
    professional_id: professionalId,
    business_name: businessName,
    last_updated: new Date().toISOString(),
    created_at: new Date().toISOString(),
    webhook_status: "processed",

    employees: processedEmployees,

    capacity_rules: {
      max_concurrent_bookings: Math.max(1, processedEmployees.length), // Default based on employee count
      buffer_time_between_bookings: 15,
      max_bookings_per_day: Math.max(20, processedEmployees.length * 8), // Scale with employees
      allow_overlapping: processedEmployees.length > 1, // Allow if multiple employees
      require_all_employees_for_service: false,
    },

    blocked_times: holidayBlockedTimes,
  },

  processing_summary: {
    employees_processed: processedEmployees.length,
    holidays_converted: holidayBlockedTimes.length,
    working_days_configured: defaultWorkingDays.filter((d) => d.is_working).length,
    business_name_found: !!businessName,
    capacity_auto_configured: true,
  },
}

console.log("Enhanced processing complete:", JSON.stringify(enhancedResponse.processing_summary, null, 2))

// Function to return the response
function returnResponse(response) {
  return [response]
}

// Call the function to return the response
returnResponse(enhancedResponse)
