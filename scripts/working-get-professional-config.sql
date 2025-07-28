-- Working query to get complete professional configuration for webhook
-- Usage: Replace 'YOUR_PROFESSIONAL_ID' with the actual professional ID

WITH professional_base AS (
    SELECT 
        pc.professional_id,
        pc.business_name,
        pc.created_at,
        pc.updated_at,
        pc.webhook_status,
        pc.last_webhook_sent
    FROM professional_configs pc
    WHERE pc.professional_id = 'YOUR_PROFESSIONAL_ID'
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
    WHERE e.professional_id = 'YOUR_PROFESSIONAL_ID'
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
    WHERE cr.professional_id = 'YOUR_PROFESSIONAL_ID'
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
    WHERE bt.professional_id = 'YOUR_PROFESSIONAL_ID'
    GROUP BY bt.professional_id
)
SELECT 
    jsonb_build_object(
        'success', true,
        'config_data', jsonb_build_object(
            'professional_id', COALESCE(pb.professional_id, 'YOUR_PROFESSIONAL_ID'),
            'business_name', COALESCE(pb.business_name, ''),
            'last_updated', COALESCE(pb.updated_at::text, NOW()::text),
            'created_at', COALESCE(pb.created_at::text, NOW()::text),
            'webhook_status', COALESCE(pb.webhook_status, 'pending'),
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
FULL OUTER JOIN employee_data ed ON pb.professional_id = ed.professional_id
FULL OUTER JOIN capacity_data cd ON COALESCE(pb.professional_id, ed.professional_id) = cd.professional_id
FULL OUTER JOIN blocked_times_data btd ON COALESCE(pb.professional_id, ed.professional_id, cd.professional_id) = btd.professional_id;

-- Test query to see what data exists for a professional
SELECT 
    'professional_configs' as table_name,
    COUNT(*) as record_count
FROM professional_configs 
WHERE professional_id = 'YOUR_PROFESSIONAL_ID'
UNION ALL
SELECT 
    'employees' as table_name,
    COUNT(*) as record_count
FROM employees 
WHERE professional_id = 'YOUR_PROFESSIONAL_ID'
UNION ALL
SELECT 
    'capacity_rules' as table_name,
    COUNT(*) as record_count
FROM capacity_rules 
WHERE professional_id = 'YOUR_PROFESSIONAL_ID'
UNION ALL
SELECT 
    'blocked_times' as table_name,
    COUNT(*) as record_count
FROM blocked_times 
WHERE professional_id = 'YOUR_PROFESSIONAL_ID';
