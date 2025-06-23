-- Update Starting Point Data Tables After Configuration Save
-- This syncs the original simple format tables with the saved configuration

-- Update the professional schedule table (your original flat format)
INSERT INTO professional_schedules (
    professional_id,
    monday_start, monday_end, monday_working,
    tuesday_start, tuesday_end, tuesday_working,
    wednesday_start, wednesday_end, wednesday_working,
    thursday_start, thursday_end, thursday_working,
    friday_start, friday_end, friday_working,
    saturday_start, saturday_end, saturday_working,
    sunday_start, sunday_end, sunday_working,
    updated_at
) VALUES (
    '{{ $json.professional_schedule.professional_id }}',
    '{{ $json.professional_schedule.monday_start }}', '{{ $json.professional_schedule.monday_end }}', '{{ $json.professional_schedule.monday_working }}',
    '{{ $json.professional_schedule.tuesday_start }}', '{{ $json.professional_schedule.tuesday_end }}', '{{ $json.professional_schedule.tuesday_working }}',
    '{{ $json.professional_schedule.wednesday_start }}', '{{ $json.professional_schedule.wednesday_end }}', '{{ $json.professional_schedule.wednesday_working }}',
    '{{ $json.professional_schedule.thursday_start }}', '{{ $json.professional_schedule.thursday_end }}', '{{ $json.professional_schedule.thursday_working }}',
    '{{ $json.professional_schedule.friday_start }}', '{{ $json.professional_schedule.friday_end }}', '{{ $json.professional_schedule.friday_working }}',
    '{{ $json.professional_schedule.saturday_start }}', '{{ $json.professional_schedule.saturday_end }}', '{{ $json.professional_schedule.saturday_working }}',
    '{{ $json.professional_schedule.sunday_start }}', '{{ $json.professional_schedule.sunday_end }}', '{{ $json.professional_schedule.sunday_working }}',
    '{{ $json.professional_schedule.updated_at }}'
)
ON CONFLICT (professional_id) 
DO UPDATE SET
    monday_start = EXCLUDED.monday_start,
    monday_end = EXCLUDED.monday_end,
    monday_working = EXCLUDED.monday_working,
    tuesday_start = EXCLUDED.tuesday_start,
    tuesday_end = EXCLUDED.tuesday_end,
    tuesday_working = EXCLUDED.tuesday_working,
    wednesday_start = EXCLUDED.wednesday_start,
    wednesday_end = EXCLUDED.wednesday_end,
    wednesday_working = EXCLUDED.wednesday_working,
    thursday_start = EXCLUDED.thursday_start,
    thursday_end = EXCLUDED.thursday_end,
    thursday_working = EXCLUDED.thursday_working,
    friday_start = EXCLUDED.friday_start,
    friday_end = EXCLUDED.friday_end,
    friday_working = EXCLUDED.friday_working,
    saturday_start = EXCLUDED.saturday_start,
    saturday_end = EXCLUDED.saturday_end,
    saturday_working = EXCLUDED.saturday_working,
    sunday_start = EXCLUDED.sunday_start,
    sunday_end = EXCLUDED.sunday_end,
    sunday_working = EXCLUDED.sunday_working,
    updated_at = EXCLUDED.updated_at;

-- Clear existing simple employee records for this professional
DELETE FROM employees_simple WHERE professional_id = '{{ $json.update_metadata.professional_id }}';

-- Log the sync operation
INSERT INTO sync_log (
    professional_id,
    sync_type,
    sync_timestamp,
    records_updated,
    source_config_timestamp
) VALUES (
    '{{ $json.update_metadata.professional_id }}',
    'config_to_starting_point',
    '{{ $json.update_metadata.sync_timestamp }}',
    {{ $json.update_metadata.total_employees }},
    '{{ $json.update_metadata.config_last_updated }}'
);
