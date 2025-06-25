-- Queries for generating webhook payloads and managing configuration data

-- Get complete professional configuration for webhook
CREATE OR REPLACE FUNCTION get_professional_config_for_webhook(prof_id VARCHAR(255))
RETURNS JSONB AS $$
DECLARE
    config_data JSONB;
BEGIN
    SELECT jsonb_build_object(
        'professional_id', pc.professional_id,
        'business_name', pc.business_name,
        'last_updated', pc.updated_at,
        'employees', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'employee_id', e.employee_id,
                    'name', e.name,
                    'role', e.role,
                    'email', e.email,
                    'is_active', e.is_active,
                    'working_days', (
                        SELECT COALESCE(jsonb_agg(
                            jsonb_build_object(
                                'day', ewd.day_of_week,
                                'start_time', ewd.start_time::TEXT,
                                'end_time', ewd.end_time::TEXT,
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
                        ), '[]'::jsonb)
                        FROM employee_working_days ewd 
                        WHERE ewd.employee_id = e.employee_id
                    ),
                    'services', (
                        SELECT COALESCE(jsonb_agg(es.service_name), '[]'::jsonb)
                        FROM employee_services es 
                        WHERE es.employee_id = e.employee_id
                    )
                ) ORDER BY e.name
            ), '[]'::jsonb)
            FROM employees e 
            WHERE e.professional_id = prof_id
        ),
        'capacity_rules', (
            SELECT jsonb_build_object(
                'max_concurrent_bookings', cr.max_concurrent_bookings,
                'buffer_time_between_bookings', cr.buffer_time_between_bookings,
                'max_bookings_per_day', cr.max_bookings_per_day,
                'allow_overlapping', cr.allow_overlapping,
                'require_all_employees_for_service', cr.require_all_employees_for_service
            )
            FROM capacity_rules cr 
            WHERE cr.professional_id = prof_id
        ),
        'blocked_times', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'blocked_time_id', bt.blocked_time_id,
                    'employee_id', bt.employee_id,
                    'employee_name', e.name,
                    'date', bt.blocked_date::TEXT,
                    'start_time', bt.start_time::TEXT,
                    'end_time', bt.end_time::TEXT,
                    'reason', bt.reason,
                    'is_recurring', bt.is_recurring,
                    'recurrence_pattern', bt.recurrence_pattern
                ) ORDER BY bt.blocked_date, bt.start_time
            ), '[]'::jsonb)
            FROM blocked_times bt
            LEFT JOIN employees e ON bt.employee_id = e.employee_id
            WHERE bt.professional_id = prof_id
        )
    ) INTO config_data
    FROM professional_configs pc
    WHERE pc.professional_id = prof_id;
    
    RETURN config_data;
END;
$$ LANGUAGE plpgsql;

-- Mark configuration as needing webhook delivery
CREATE OR REPLACE FUNCTION mark_config_for_webhook_delivery(prof_id VARCHAR(255))
RETURNS VOID AS $$
BEGIN
    UPDATE professional_configs 
    SET 
        webhook_status = 'pending',
        updated_at = CURRENT_TIMESTAMP
    WHERE professional_id = prof_id;
END;
$$ LANGUAGE plpgsql;

-- Log webhook delivery attempt
CREATE OR REPLACE FUNCTION log_webhook_delivery(
    prof_id VARCHAR(255),
    webhook_url VARCHAR(500),
    payload JSONB,
    response_status INTEGER DEFAULT NULL,
    response_body TEXT DEFAULT NULL,
    delivery_attempt INTEGER DEFAULT 1
)
RETURNS INTEGER AS $$
DECLARE
    log_id INTEGER;
BEGIN
    INSERT INTO webhook_delivery_log (
        professional_id,
        webhook_url,
        payload,
        response_status,
        response_body,
        delivery_attempt,
        delivered_at,
        failed_at,
        next_retry_at
    ) VALUES (
        prof_id,
        webhook_url,
        payload,
        response_status,
        response_body,
        delivery_attempt,
        CASE WHEN response_status BETWEEN 200 AND 299 THEN CURRENT_TIMESTAMP ELSE NULL END,
        CASE WHEN response_status NOT BETWEEN 200 AND 299 THEN CURRENT_TIMESTAMP ELSE NULL END,
        CASE WHEN response_status NOT BETWEEN 200 AND 299 THEN 
            CURRENT_TIMESTAMP + INTERVAL '5 minutes' * POWER(2, delivery_attempt - 1)
        ELSE NULL END
    ) RETURNING id INTO log_id;
    
    -- Update professional config webhook status
    UPDATE professional_configs 
    SET 
        webhook_status = CASE 
            WHEN response_status BETWEEN 200 AND 299 THEN 'sent'
            ELSE 'failed'
        END,
        last_webhook_sent = CASE 
            WHEN response_status BETWEEN 200 AND 299 THEN CURRENT_TIMESTAMP
            ELSE last_webhook_sent
        END
    WHERE professional_id = prof_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Get configurations that need webhook delivery
CREATE OR REPLACE VIEW pending_webhook_deliveries AS
SELECT 
    pc.professional_id,
    pc.business_name,
    pc.webhook_status,
    pc.updated_at,
    pc.last_webhook_sent,
    get_professional_config_for_webhook(pc.professional_id) as config_payload
FROM professional_configs pc
WHERE pc.webhook_status = 'pending'
ORDER BY pc.updated_at ASC;

-- Get failed webhook deliveries ready for retry
CREATE OR REPLACE VIEW failed_webhook_retries AS
SELECT 
    wdl.id,
    wdl.professional_id,
    wdl.webhook_url,
    wdl.payload,
    wdl.delivery_attempt,
    wdl.next_retry_at,
    wdl.failed_at
FROM webhook_delivery_log wdl
WHERE wdl.next_retry_at IS NOT NULL 
  AND wdl.next_retry_at <= CURRENT_TIMESTAMP
  AND wdl.delivery_attempt < 5  -- Max 5 retry attempts
ORDER BY wdl.next_retry_at ASC;

-- Upsert professional configuration (for API endpoints)
CREATE OR REPLACE FUNCTION upsert_professional_config(
    prof_id VARCHAR(255),
    business_name VARCHAR(255) DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO professional_configs (professional_id, business_name)
    VALUES (prof_id, business_name)
    ON CONFLICT (professional_id) 
    DO UPDATE SET 
        business_name = COALESCE(EXCLUDED.business_name, professional_configs.business_name),
        updated_at = CURRENT_TIMESTAMP;
        
    -- Ensure capacity rules exist
    INSERT INTO capacity_rules (professional_id)
    VALUES (prof_id)
    ON CONFLICT (professional_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Clean up old webhook delivery logs (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_webhook_logs(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM webhook_delivery_log 
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '1 day' * days_to_keep
    RETURNING COUNT(*) INTO deleted_count;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Example queries for common operations:

-- Get all active employees for a professional
/*
SELECT 
    e.employee_id,
    e.name,
    e.role,
    e.email,
    array_agg(
        ewd.day_of_week || ': ' || ewd.start_time || '-' || ewd.end_time
        ORDER BY CASE ewd.day_of_week
            WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3
            WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6
            WHEN 'Sunday' THEN 7 END
    ) FILTER (WHERE ewd.is_working = true) as working_schedule
FROM employees e
LEFT JOIN employee_working_days ewd ON e.employee_id = ewd.employee_id
WHERE e.professional_id = 'prof_123' AND e.is_active = true
GROUP BY e.employee_id, e.name, e.role, e.email
ORDER BY e.name;
*/

-- Check if a time slot conflicts with blocked times
/*
SELECT EXISTS(
    SELECT 1 FROM blocked_times bt
    WHERE bt.professional_id = 'prof_123'
    AND bt.blocked_date = '2024-01-15'
    AND (
        (bt.start_time <= '10:00' AND bt.end_time > '10:00') OR
        (bt.start_time < '11:00' AND bt.end_time >= '11:00') OR
        (bt.start_time >= '10:00' AND bt.end_time <= '11:00')
    )
    AND (bt.employee_id IS NULL OR bt.employee_id = 'emp_001')
) as has_conflict;
*/
