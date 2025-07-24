-- Upsert for employee_working_days without a UNIQUE constraint
-- This query first attempts to update a record. If no row is updated (because it doesn't exist),
-- it then proceeds to insert a new record. This avoids the need for ON CONFLICT.

-- $1: employee_id (bigint)
-- $2: day_of_week (text)
-- $3: start_time (time)
-- $4: end_time (time)
-- $5: is_working (boolean)

WITH input_data AS (
  SELECT
      $1::bigint as employee_id,
      $2::text as day_of_week,
      $3::time as start_time,
      $4::time as end_time,
      $5::boolean as is_working
),
updated AS (
  UPDATE employee_working_days ewd
  SET
      start_time = id.start_time,
      end_time = id.end_time,
      is_working = id.is_working,
      updated_at = NOW()
  FROM input_data id
  WHERE ewd.employee_id = id.employee_id AND ewd.day_of_week = id.day_of_week
  RETURNING ewd.employee_id, ewd.day_of_week, 'updated' as action
),
inserted AS (
  INSERT INTO employee_working_days (
      employee_id,
      day_of_week,
      start_time,
      end_time,
      is_working,
      created_at,
      updated_at
  )
  SELECT
      id.employee_id,
      id.day_of_week,
      id.start_time,
      id.end_time,
      id.is_working,
      NOW(),
      NOW()
  FROM input_data id
  -- This condition ensures we only insert if the update didn't happen
  WHERE NOT EXISTS (SELECT 1 FROM updated)
  RETURNING employee_id, day_of_week, 'inserted' as action
)
SELECT * FROM updated
UNION ALL
SELECT * FROM inserted;
