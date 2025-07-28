-- Manages blocked times: handles upsert, soft_delete, and restore operations in a single query.
-- This script first attempts an UPDATE. If no row is found during an 'upsert' operation, it INSERTS a new one.
--
-- Required JSON input fields:
-- - operation: 'upsert', 'soft_delete', or 'restore'
-- - data.blocked_time_id: The primary key of the blocked_time record (string).
-- - data.professional_id: The foreign key to the professional_configs table (required for new records).
-- - Other fields as needed by the operation (e.g., blocked_date, start_time for upsert).

WITH input_data AS (
    -- Define input data to avoid repetition and handle potential nulls
    SELECT
        '{{ $json.operation }}' as operation,
        '{{ $json.data.blocked_time_id }}' as id,
        '{{ $json.data.professional_id }}'::bigint as professional_configs_id,
        '{{ $json.data.employee_id }}'::bigint as employee_id,
        '{{ $json.data.blocked_date }}'::date as blocked_date,
        '{{ $json.data.start_time }}'::time as start_time,
        '{{ $json.data.end_time }}'::time as end_time,
        '{{ $json.data.reason }}' as reason,
        '{{ $json.data.is_recurring }}'::boolean as is_recurring,
        '{{ $json.data.is_all_day }}'::boolean as is_all_day,
        '{{ $json.data.recurrence_pattern }}' as recurrence_pattern,
        '{{ $json.data.deleted_reason }}' as deleted_reason
),
updated AS (
    UPDATE blocked_times
    SET
        -- For soft_delete/restore, only update deletion status. For upsert, update all fields.
        is_deleted = CASE
            WHEN (SELECT operation FROM input_data) = 'soft_delete' THEN true
            WHEN (SELECT operation FROM input_data) = 'restore' THEN false
            ELSE is_deleted -- Keep existing value for upsert
        END,
        deleted_at = CASE
            WHEN (SELECT operation FROM input_data) = 'soft_delete' THEN NOW()
            WHEN (SELECT operation FROM input_data) = 'restore' THEN NULL
            ELSE deleted_at -- Keep existing value for upsert
        END,
        deleted_reason = CASE
            WHEN (SELECT operation FROM input_data) = 'soft_delete' THEN (SELECT deleted_reason FROM input_data)
            WHEN (SELECT operation FROM input_data) = 'restore' THEN NULL
            ELSE deleted_reason -- Keep existing value for upsert
        END,
        -- Only update these fields on an 'upsert' operation
        employee_id = CASE WHEN (SELECT operation FROM input_data) = 'upsert' THEN (SELECT employee_id FROM input_data) ELSE employee_id END,
        blocked_date = CASE WHEN (SELECT operation FROM input_data) = 'upsert' THEN (SELECT blocked_date FROM input_data) ELSE blocked_date END,
        start_time = CASE WHEN (SELECT operation FROM input_data) = 'upsert' THEN (SELECT start_time FROM input_data) ELSE start_time END,
        end_time = CASE WHEN (SELECT operation FROM input_data) = 'upsert' THEN (SELECT end_time FROM input_data) ELSE end_time END,
        reason = CASE WHEN (SELECT operation FROM input_data) = 'upsert' THEN (SELECT reason FROM input_data) ELSE reason END,
        is_recurring = CASE WHEN (SELECT operation FROM input_data) = 'upsert' THEN (SELECT is_recurring FROM input_data) ELSE is_recurring END,
        is_all_day = CASE WHEN (SELECT operation FROM input_data) = 'upsert' THEN (SELECT is_all_day FROM input_data) ELSE is_all_day END,
        recurrence_pattern = CASE WHEN (SELECT operation FROM input_data) = 'upsert' THEN (SELECT recurrence_pattern FROM input_data) ELSE recurrence_pattern END,
        updated_at = NOW()
    WHERE id = (SELECT id FROM input_data)
    RETURNING *, 'updated' as action
),
inserted AS (
    INSERT INTO blocked_times (
        id,
        professional_configs_id,
        employee_id,
        blocked_date,
        start_time,
        end_time,
        reason,
        is_recurring,
        is_all_day,
        recurrence_pattern,
        is_deleted,
        created_at,
        updated_at
    )
    SELECT
        id,
        professional_configs_id,
        employee_id,
        blocked_date,
        start_time,
        end_time,
        reason,
        is_recurring,
        is_all_day,
        recurrence_pattern,
        false, -- New records are never deleted
        NOW(),
        NOW()
    FROM input_data
    -- Only run INSERT if the operation is 'upsert' AND the UPDATE didn't find a record
    WHERE operation = 'upsert' AND NOT EXISTS (SELECT 1 FROM updated)
    RETURNING *, 'inserted' as action
)
SELECT id, action FROM updated
UNION ALL
SELECT id, action FROM inserted;
