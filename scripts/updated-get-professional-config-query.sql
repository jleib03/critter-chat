-- Updated query to get professional config with booking preferences
SELECT 
    pc.professional_id,
    pc.business_name,
    pc.booking_type,
    pc.allow_direct_booking,
    pc.require_approval,
    pc.online_booking_enabled,
    pc.booking_preferences,
    pc.last_updated,
    pc.created_at,
    pc.webhook_status,
    
    -- Capacity Rules
    cr.max_concurrent_bookings,
    cr.buffer_time_between_bookings,
    cr.max_bookings_per_day,
    cr.allow_overlapping,
    cr.require_all_employees_for_service,
    
    -- Employees (aggregated)
    COALESCE(
        JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
                'employee_id', e.employee_id,
                'name', e.name,
                'role', e.role,
                'email', e.email,
                'is_active', e.is_active,
                'working_days', e.working_days,
                'services', e.services
            )
        ) FILTER (WHERE e.employee_id IS NOT NULL), 
        '[]'::json
    ) as employees,
    
    -- Blocked Times (aggregated)
    COALESCE(
        JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
                'blocked_time_id', bt.blocked_time_id,
                'employee_id', bt.employee_id,
                'blocked_date', bt.blocked_date,
                'start_time', bt.start_time,
                'end_time', bt.end_time,
                'reason', bt.reason,
                'is_recurring', bt.is_recurring,
                'recurrence_pattern', bt.recurrence_pattern
            )
        ) FILTER (WHERE bt.blocked_time_id IS NOT NULL), 
        '[]'::json
    ) as blocked_times

FROM professional_configs pc
LEFT JOIN capacity_rules cr ON pc.professional_id = cr.professional_id
LEFT JOIN (
    SELECT 
        e.professional_id,
        e.employee_id,
        e.name,
        e.role,
        e.email,
        e.is_active,
        -- Working days for this employee
        COALESCE(
            JSON_AGG(
                DISTINCT JSONB_BUILD_OBJECT(
                    'day', ewd.day_of_week,
                    'start_time', ewd.start_time,
                    'end_time', ewd.end_time,
                    'is_working', ewd.is_working
                )
            ) FILTER (WHERE ewd.day_of_week IS NOT NULL), 
            '[]'::json
        ) as working_days,
        -- Services for this employee
        COALESCE(
            JSON_AGG(DISTINCT es.service_name) FILTER (WHERE es.service_name IS NOT NULL), 
            '[]'::json
        ) as services
    FROM employees e
    LEFT JOIN employee_working_days ewd ON e.employee_id = ewd.employee_id
    LEFT JOIN employee_services es ON e.employee_id = es.employee_id
    GROUP BY e.professional_id, e.employee_id, e.name, e.role, e.email, e.is_active
) e ON pc.professional_id = e.professional_id
LEFT JOIN blocked_times bt ON pc.professional_id = bt.professional_id

WHERE pc.professional_id = $1
GROUP BY 
    pc.professional_id, 
    pc.business_name, 
    pc.booking_type,
    pc.allow_direct_booking,
    pc.require_approval,
    pc.online_booking_enabled,
    pc.booking_preferences,
    pc.last_updated, 
    pc.created_at, 
    pc.webhook_status,
    cr.max_concurrent_bookings,
    cr.buffer_time_between_bookings,
    cr.max_bookings_per_day,
    cr.allow_overlapping,
    cr.require_all_employees_for_service;
