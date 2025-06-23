// n8n Code Node: Sync Simple Employee Records
// This handles the individual employee record updates

// Declare the $input variable
const $input = {
  all: () => [
    {
      json: {
        update_metadata: {
          professional_id: "12345",
        },
        employees_simple: [
          {
            employee_id: "1",
            first_name: "John",
            last_name: "Doe",
            email: "john.doe@example.com",
            is_active: true,
            role: "Developer",
            updated_at: "2023-04-01T12:00:00Z",
          },
          {
            employee_id: "2",
            first_name: "Jane",
            last_name: "Smith",
            email: "jane.smith@example.com",
            is_active: false,
            role: "Designer",
            updated_at: "2023-04-01T12:00:00Z",
          },
        ],
      },
    },
  ],
}

const updates = $input.all()[0]?.json

if (!updates || !updates.employees_simple) {
  throw new Error("No employee updates found")
}

console.log("Syncing simple employee records...")
console.log("Professional ID:", updates.update_metadata.professional_id)
console.log("Employees to sync:", updates.employees_simple.length)

// Prepare individual employee insert operations
const employeeInserts = updates.employees_simple.map((employee) => ({
  sql: `
    INSERT INTO employees_simple (
      employee_id, professional_id, first_name, last_name, email, 
      is_active, role, updated_at, synced_from_config
    ) VALUES (
      '${employee.employee_id}',
      '${updates.update_metadata.professional_id}',
      '${employee.first_name}',
      '${employee.last_name}',
      '${employee.email}',
      ${employee.is_active},
      '${employee.role}',
      '${employee.updated_at}',
      true
    )
  `,
  employee_name: `${employee.first_name} ${employee.last_name}`,
  employee_id: employee.employee_id,
}))

console.log("Generated", employeeInserts.length, "employee insert operations")

// Function to return the operations for execution
function getEmployeeInsertOperations() {
  return employeeInserts.map((insert, index) => ({
    operation: `employee_insert_${index + 1}`,
    sql: insert.sql,
    employee_name: insert.employee_name,
    employee_id: insert.employee_id,
  }))
}

// Call the function to get the operations
const operations = getEmployeeInsertOperations()
console.log("Operations:", operations)
