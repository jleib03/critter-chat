-- Get full professional configuration, including business name from a separate table
-- $1 = business_id
WITH
-- 1. Define the business ID we are working with.
professional AS (
    SELECT $1::bigint as business_id
),

-- 2. Get the business name from the `businesses_business` table.
business_info AS (
    SELECT
        bb.id as business_id, -- Assuming the join key is `id` in this table
        bb.name as business_name
    FROM businesses_business bb
    WHERE bb.id = (SELECT business_id FROM professional)
),

-- 3. Get the core configuration settings.
professional_configs_base AS (
    SELECT
        pc.business_id,
        pc.created_at,
        pc.updated_at,
        pc.webhook_status,
        pc.last_webhook_sent,
        pc.booking_type,
        pc.allow_direct_booking,
        pc.require_approval,
        pc.online_booking_enabled
    FROM professional_configs pc
    WHERE pc.business_id = (SELECT business_id FROM professional)
),

-- 4. Aggregate all employee data for the professional.
employee_data AS (
    SELECT
        e.business_id,
        jsonb_agg(
            jsonb_build_object(
                'employee_id', e.id, -- Corrected: Use id from employee table
                'name', e.name,
                'role', e.role,
                'email', e.email,
                'is_active', e.is_active,
                'working_days', COALESCE(wd.working_days, '[]'::jsonb)
                -- Removed 'services' as requested
            ) ORDER BY e.name
        ) as employees
    FROM businesses_businessemployee e
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
                        WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3
                        WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6
                        WHEN 'Sunday' THEN 7
                    END
            ) as working_days
        FROM employee_working_days ewd
        GROUP BY ewd.employee_id
    ) wd ON e.id = wd.employee_id -- Corrected: Join on e.id
    -- Removed join to employee_services
    WHERE e.business_id = (SELECT business_id FROM professional)
    GROUP BY e.business_id
),

-- 5. Get capacity rules for the professional.
capacity_data AS (
    SELECT
        cr.business_id,
        jsonb_build_object(
            'max_concurrent_bookings', cr.max_concurrent_bookings,
            'buffer_time_between_bookings', cr.buffer_time_between_bookings,
            'max_bookings_per_day', cr.max_bookings_per_day,
            'allow_overlapping', cr.allow_overlapping,
            'require_all_employees_for_service', cr.require_all_employees_for_service
        ) as capacity_rules
    FROM capacity_rules cr
    WHERE cr.business_id = (SELECT business_id FROM professional)
),

-- 6. Aggregate all non-deleted blocked times for the professional.
blocked_times_data AS (
    SELECT
        bt.business_id,
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
                'is_all_day', bt.is_all_day,
                'recurrence_pattern', bt.recurrence_pattern
            ) ORDER BY bt.blocked_date, bt.start_time
        ) as blocked_times
    FROM blocked_times bt
    LEFT JOIN businesses_businessemployee e ON bt.employee_id = e.id AND e.business_id = bt.business_id -- Corrected: Join on e.id
    WHERE bt.business_id = (SELECT business_id FROM professional)
        AND bt.is_deleted = false
    GROUP BY bt.business_id
)

-- 7. Combine all data into a single JSON response.
SELECT
    jsonb_build_object(
        'success', true,
        'config_data', jsonb_build_object(
            'id', p.business_id,
            'business_name', COALESCE(bi.business_name, ''),
            'last_updated', COALESCE(pcb.updated_at::text, NOW()::text),
            'created_at', COALESCE(pcb.created_at::text, NOW()::text),
            'webhook_status', COALESCE(pcb.webhook_status, 'pending'),
            'booking_preferences', jsonb_build_object(
                'booking_type', COALESCE(pcb.booking_type, 'direct_booking'),
                'allow_direct_booking', COALESCE(pcb.allow_direct_booking, true),
                'require_approval', COALESCE(pcb.require_approval, false),
                'online_booking_enabled', COALESCE(pcb.online_booking_enabled, true)
            ),
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
FROM professional p
LEFT JOIN business_info bi ON p.business_id = bi.business_id
LEFT JOIN professional_configs_base pcb ON p.business_id = pcb.business_id
LEFT JOIN employee_data ed ON p.business_id = ed.business_id
LEFT JOIN capacity_data cd ON p.business_id = cd.business_id
LEFT JOIN blocked_times_data btd ON p.business_id = btd.business_id;
