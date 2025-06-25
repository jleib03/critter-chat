-- Main query to get complete professional configuration for webhook
-- Usage: Replace 'PROFESSIONAL_ID_HERE' with the actual professional ID

WITH professional_base AS (
    SELECT 
        pc.professional_id,
        pc.business_name,
        pc.created_at,
        pc.updated_at,
        pc.webhook_status,
        pc.last_webhook_sent
    FROM professional_configs pc
    WHERE pc.professional_id = 'PROFESSIONAL_ID_HERE'
),
employee_data AS (
    SELECT 
        e.professional_id,
        jsonb_agg(
            jsonb_build_object(
                'employee_id', e.employee_id,
                'name', e.name,
                'role', e.role,
                'email', e.email,
                'is_active', e.is_active,
                'working_days', COALESCE(wd.working_days, '[]'::jsonb),
                'services', COALESCE(svc.services, '[]'::jsonb)
            ) ORDER BY e.name
        ) as employees
    FROM employees e
    LEFT JOIN (
        -- Get working days for each employee
        SELECT 
            ewd.employee_id,
            jsonb_agg(
                jsonb_build_object(
                    'day', ewd.day_of_week,
                    'start_time', ewd.start_time::text,
                    'end_time', ewd.end_time::text,
                    'is_working', ewd.is_working
                ) ORDER BY 
                    CASE ewd.day_of_week
                        WHEN 'Monday' THEN 1
                        WHEN 'Tuesday' THEN 2
                        WHEN 'Wednesday' THEN 3
                        WHEN 'Thursday' THEN 4
                        WHEN 'Friday' THEN 5
                        WHEN 'Saturday' THEN 6
                        WHEN 'Sunday' THEN 7
                    END
            ) as working_days
        FROM employee_working_days ewd
        GROUP BY ewd.employee_id
    ) wd ON e.employee_id = wd.employee_id
    LEFT JOIN (
        -- Get services for each employee
        SELECT 
            es.employee_id,
            jsonb_agg(es.service_name ORDER BY es.service_name) as services
        FROM employee_services es
        GROUP BY es.employee_id
    ) svc ON e.employee_id = svc.employee_id
    WHERE e.professional_id = 'PROFESSIONAL_ID_HERE'
    GROUP BY e.professional_id
),
capacity_data AS (
    SELECT 
        cr.professional_id,
        jsonb_build_object(
            'max_concurrent_bookings', cr.max_concurrent_bookings,
            'buffer_time_between_bookings', cr.buffer_time_between_bookings,
            'max_bookings_per_day', cr.max_bookings_per_day,
            'allow_overlapping', cr.allow_overlapping,
            'require_all_employees_for_service', cr.require_all_employees_for_service
        ) as capacity_rules
    FROM capacity_rules cr
    WHERE cr.professional_id = 'PROFESSIONAL_ID_HERE'
),
blocked_times_data AS (
    SELECT 
        bt.professional_id,
        jsonb_agg(
            jsonb_build_object(
                'blocked_time_id', bt.blocked_time_id,
                'employee_id', bt.employee_id,
                'employee_name', e.name,
                'date', bt.blocked_date::text,
                'start_time', bt.start_time::text,
                'end_time', bt.end_time::text,
                'reason', bt.reason,
                'is_recurring', bt.is_recurring,
                'recurrence_pattern', bt.recurrence_pattern
            ) ORDER BY bt.blocked_date, bt.start_time
        ) as blocked_times
    FROM blocked_times bt
    LEFT JOIN employees e ON bt.employee_id = e.employee_id
    WHERE bt.professional_id = 'PROFESSIONAL_ID_HERE'
    GROUP BY bt.professional_id
)
SELECT 
    jsonb_build_object(
        'success', true,
        'config_data', jsonb_build_object(
            'professional_id', pb.professional_id,
            'business_name', COALESCE(pb.business_name, ''),
            'last_updated', pb.updated_at::text,
            'created_at', pb.created_at::text,
            'webhook_status', pb.webhook_status,
            'employees', COALESCE(ed.employees, '[]'::jsonb),
            'capacity_rules', COALESCE(cd.capacity_rules, jsonb_build_object(
                'max_concurrent_bookings', 1,
                'buffer_time_between_bookings', 15,
                'max_bookings_per_day', 20,
                'allow_overlapping', false,
                'require_all_employees_for_service', false
            )),
            'blocked_times', COALESCE(btd.blocked_times, '[]'::jsonb)
        )
    ) as webhook_response
FROM professional_base pb
LEFT JOIN employee_data ed ON pb.professional_id = ed.professional_id
LEFT JOIN capacity_data cd ON pb.professional_id = cd.professional_id
LEFT JOIN blocked_times_data btd ON pb.professional_id = btd.professional_id;

-- Alternative: Simpler query if you prefer separate fields
-- (Easier to work with in n8n but requires more processing)

SELECT 
    -- Professional Info
    pc.professional_id,
    pc.business_name,
    pc.updated_at as last_updated,
    pc.created_at,
    pc.webhook_status,
    
    -- Capacity Rules (with defaults if not set)
    COALESCE(cr.max_concurrent_bookings, 1) as max_concurrent_bookings,
    COALESCE(cr.buffer_time_between_bookings, 15) as buffer_time_between_bookings,
    COALESCE(cr.max_bookings_per_day, 20) as max_bookings_per_day,
    COALESCE(cr.allow_overlapping, false) as allow_overlapping,
    COALESCE(cr.require_all_employees_for_service, false) as require_all_employees_for_service,
    
    -- Employee Count
    COALESCE(emp_count.total_employees, 0) as total_employees,
    COALESCE(emp_count.active_employees, 0) as active_employees

FROM professional_configs pc
LEFT JOIN capacity_rules cr ON pc.professional_id = cr.professional_id
LEFT JOIN (
    SELECT 
        professional_id,
        COUNT(*) as total_employees,
        COUNT(*) FILTER (WHERE is_active = true) as active_employees
    FROM employees
    GROUP BY professional_id
) emp_count ON pc.professional_id = emp_count.professional_id
WHERE pc.professional_id = 'PROFESSIONAL_ID_HERE';

-- Get employees separately (if using the simpler approach above)
SELECT 
    e.employee_id,
    e.name,
    e.role,
    e.email,
    e.is_active,
    e.created_at
FROM employees e
WHERE e.professional_id = 'PROFESSIONAL_ID_HERE'
ORDER BY e.name;

-- Get working days for employees
SELECT 
    ewd.employee_id,
    e.name as employee_name,
    ewd.day_of_week,
    ewd.start_time,
    ewd.end_time,
    ewd.is_working
FROM employee_working_days ewd
JOIN employees e ON ewd.employee_id = e.employee_id
WHERE e.professional_id = 'PROFESSIONAL_ID_HERE'
ORDER BY e.name, 
    CASE ewd.day_of_week
        WHEN 'Monday' THEN 1
        WHEN 'Tuesday' THEN 2
        WHEN 'Wednesday' THEN 3
        WHEN 'Thursday' THEN 4
        WHEN 'Friday' THEN 5
        WHEN 'Saturday' THEN 6
        WHEN 'Sunday' THEN 7
    END;

-- Get employee services
SELECT 
    es.employee_id,
    e.name as employee_name,
    es.service_name
FROM employee_services es
JOIN employees e ON es.employee_id = e.employee_id
WHERE e.professional_id = 'PROFESSIONAL_ID_HERE'
ORDER BY e.name, es.service_name;

-- Get blocked times
SELECT 
    bt.blocked_time_id,
    bt.employee_id,
    e.name as employee_name,
    bt.blocked_date,
    bt.start_time,
    bt.end_time,
    bt.reason,
    bt.is_recurring,
    bt.recurrence_pattern,
    bt.created_at
FROM blocked_times bt
LEFT JOIN employees e ON bt.employee_id = e.employee_id
WHERE bt.professional_id = 'PROFESSIONAL_ID_HERE'
ORDER BY bt.blocked_date, bt.start_time;

-- Function version (if you prefer to use the function we created earlier)
SELECT get_professional_config_for_webhook('PROFESSIONAL_ID_HERE') as config_data;

-- Query to check if professional exists and has any configuration
SELECT 
    EXISTS(SELECT 1 FROM professional_configs WHERE professional_id = 'PROFESSIONAL_ID_HERE') as config_exists,
    EXISTS(SELECT 1 FROM employees WHERE professional_id = 'PROFESSIONAL_ID_HERE') as has_employees,
    EXISTS(SELECT 1 FROM capacity_rules WHERE professional_id = 'PROFESSIONAL_ID_HERE') as has_capacity_rules,
    EXISTS(SELECT 1 FROM blocked_times WHERE professional_id = 'PROFESSIONAL_ID_HERE') as has_blocked_times;
