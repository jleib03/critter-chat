-- Query to get chat agent configuration for a professional
SELECT 
    pc.professional_id,
    pc.business_name,
    -- Chat configuration fields
    ca.chat_name,
    ca.welcome_message,
    ca.instructions,
    ca.primary_color,
    ca.widget_position,
    ca.widget_size,
    ca.response_tone,
    ca.max_response_length,
    ca.include_booking_links,
    ca.custom_responses,
    ca.is_active,
    ca.created_at as chat_config_created,
    ca.updated_at as chat_config_updated
FROM professional_config pc
LEFT JOIN chat_agent_config ca ON pc.professional_id = ca.professional_id
WHERE pc.professional_id = $1
AND pc.is_active = true;
