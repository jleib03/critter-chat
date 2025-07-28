-- Insert/Update Professional Configuration
-- This script handles the complete insertion of professional configuration data

-- 1. Insert or update the main professional config
INSERT INTO professional_configs (
    professional_id, 
    business_name, 
    updated_at, 
    webhook_status
) VALUES (
    $1, $2, $3, $4
) ON CONFLICT (professional_id) 
DO UPDATE SET 
    business_name = EXCLUDED.business_name,
    updated_at = EXCLUDED.updated_at,
    webhook_status = EXCLUDED.webhook_status;

-- 2. Insert or update capacity rules
INSERT INTO capacity_rules (
    professional_id,
    max_concurrent_bookings,
    buffer_time_between_bookings,
    max_bookings_per_day,
    allow_overlapping,
    require_all_employees_for_service,
    updated_at
) VALUES (
    $1, $2, $3, $4, $5, $6, $7
) ON CONFLICT (professional_id)
DO UPDATE SET
    max_concurrent_bookings = EXCLUDED.max_concurrent_bookings,
    buffer_time_between_bookings = EXCLUDED.buffer_time_between_bookings,
    max_bookings_per_day = EXCLUDED.max_bookings_per_day,
    allow_overlapping = EXCLUDED.allow_overlapping,
    require_all_employees_for_service = EXCLUDED.require_all_employees_for_service,
    updated_at = EXCLUDED.updated_at;

-- 3. Delete existing employees for this professional (cascade will handle related records)
DELETE FROM employees WHERE professional_id = $1;

-- 4. Insert employees (this will be done in a loop for each employee)
INSERT INTO employees (
    employee_id,
    professional_id,
    name,
    role,
    email,
    is_active,
    updated_at
) VALUES (
    $1, $2, $3, $4, $5, $6, $7
);

-- 5. Insert employee working days (this will be done in a loop for each working day)
INSERT INTO employee_working_days (
    employee_id,
    day_of_week,
    start_time,
    end_time,
    is_working,
    updated_at
) VALUES (
    $1, $2, $3, $4, $5, $6
);

-- 6. Insert employee services (this will be done in a loop for each service)
INSERT INTO employee_services (
    employee_id,
    service_name,
    created_at
) VALUES (
    $1, $2, $3
);

-- 7. Delete existing blocked times for this professional
DELETE FROM blocked_times WHERE professional_id = $1;

-- 8. Insert blocked times (this will be done in a loop for each blocked time)
INSERT INTO blocked_times (
    blocked_time_id,
    professional_id,
    employee_id,
    blocked_date,
    start_time,
    end_time,
    reason,
    is_recurring,
    recurrence_pattern,
    updated_at
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
);

-- 9. Log the configuration change
INSERT INTO config_change_log (
    professional_id,
    change_type,
    change_description,
    new_values,
    changed_by,
    created_at
) VALUES (
    $1, 
    'full_config_update',
    'Complete professional configuration updated via setup wizard',
    $2, -- JSON of the full config
    'setup_wizard',
    $3
);
