-- Custom URL Management Script
-- Handles creating or updating custom URLs for professionals with validation

-- First, let's create the custom_urls table if it doesn't exist
CREATE TABLE IF NOT EXISTS custom_urls (
    id SERIAL PRIMARY KEY,
    professional_id VARCHAR(255) NOT NULL,
    custom_url VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_custom_urls_professional_id ON custom_urls(professional_id);
CREATE INDEX IF NOT EXISTS idx_custom_urls_custom_url ON custom_urls(custom_url);

-- Function to manage custom URL creation/update
CREATE OR REPLACE FUNCTION manage_custom_url(
    p_professional_id VARCHAR(255),
    p_custom_url VARCHAR(255)
)
RETURNS JSON AS $$
DECLARE
    existing_url_owner VARCHAR(255);
    existing_professional_url VARCHAR(255);
    result JSON;
BEGIN
    -- Check if the custom URL is already taken by another professional
    SELECT professional_id INTO existing_url_owner
    FROM custom_urls 
    WHERE custom_url = p_custom_url;
    
    -- If URL exists and belongs to a different professional, return error
    IF existing_url_owner IS NOT NULL AND existing_url_owner != p_professional_id THEN
        result := json_build_object(
            'success', false,
            'message', 'Error - URL is already in use',
            'error_code', 'URL_TAKEN',
            'existing_owner', existing_url_owner
        );
        RETURN result;
    END IF;
    
    -- Check if this professional already has a custom URL
    SELECT custom_url INTO existing_professional_url
    FROM custom_urls 
    WHERE professional_id = p_professional_id;
    
    -- If professional already has a URL, update it
    IF existing_professional_url IS NOT NULL THEN
        UPDATE custom_urls 
        SET 
            custom_url = p_custom_url,
            updated_at = CURRENT_TIMESTAMP
        WHERE professional_id = p_professional_id;
        
        result := json_build_object(
            'success', true,
            'message', 'Record updated successfully',
            'action', 'updated',
            'professional_id', p_professional_id,
            'custom_url', p_custom_url,
            'previous_url', existing_professional_url
        );
    ELSE
        -- Professional doesn't have a URL, create new record
        INSERT INTO custom_urls (professional_id, custom_url)
        VALUES (p_professional_id, p_custom_url);
        
        result := json_build_object(
            'success', true,
            'message', 'Record updated successfully',
            'action', 'created',
            'professional_id', p_professional_id,
            'custom_url', p_custom_url
        );
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Example usage for the webhook data:
-- SELECT manage_custom_url('151', 'sally-grooming');

-- Query to handle the webhook payload directly
-- This would be used in your n8n workflow
WITH webhook_data AS (
    SELECT 
        (body->>'professionalId')::VARCHAR(255) as professional_id,
        (body->>'customUrl')::VARCHAR(255) as custom_url
    FROM (
        SELECT json_array_elements('[
            {
                "professional_id": null,
                "session_id": null,
                "action": "create-url",
                "today": "2025-07-17T00:00:00.000-05:00",
                "body": {
                    "professionalId": "151",
                    "customUrl": "sally-grooming",
                    "timestamp": "2025-07-17T20:49:22.759Z"
                }
            }
        ]'::json) as body
    ) parsed_data
)
SELECT manage_custom_url(professional_id, custom_url) as result
FROM webhook_data;

-- Additional helper queries

-- Get all custom URLs for a professional
CREATE OR REPLACE FUNCTION get_professional_custom_urls(p_professional_id VARCHAR(255))
RETURNS TABLE(custom_url VARCHAR(255), created_at TIMESTAMP, updated_at TIMESTAMP) AS $$
BEGIN
    RETURN QUERY
    SELECT cu.custom_url, cu.created_at, cu.updated_at
    FROM custom_urls cu
    WHERE cu.professional_id = p_professional_id;
END;
$$ LANGUAGE plpgsql;

-- Check if a custom URL is available
CREATE OR REPLACE FUNCTION is_custom_url_available(p_custom_url VARCHAR(255))
RETURNS JSON AS $$
DECLARE
    existing_owner VARCHAR(255);
    result JSON;
BEGIN
    SELECT professional_id INTO existing_owner
    FROM custom_urls 
    WHERE custom_url = p_custom_url;
    
    IF existing_owner IS NULL THEN
        result := json_build_object(
            'available', true,
            'message', 'URL is available'
        );
    ELSE
        result := json_build_object(
            'available', false,
            'message', 'URL is already taken',
            'owner', existing_owner
        );
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Delete a custom URL (if needed)
CREATE OR REPLACE FUNCTION delete_custom_url(p_professional_id VARCHAR(255))
RETURNS JSON AS $$
DECLARE
    deleted_url VARCHAR(255);
    result JSON;
BEGIN
    DELETE FROM custom_urls 
    WHERE professional_id = p_professional_id
    RETURNING custom_url INTO deleted_url;
    
    IF deleted_url IS NOT NULL THEN
        result := json_build_object(
            'success', true,
            'message', 'Custom URL deleted successfully',
            'deleted_url', deleted_url
        );
    ELSE
        result := json_build_object(
            'success', false,
            'message', 'No custom URL found for this professional'
        );
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- View to see all custom URLs with professional info (if you have a professionals table)
CREATE OR REPLACE VIEW custom_urls_overview AS
SELECT 
    cu.id,
    cu.professional_id,
    cu.custom_url,
    cu.created_at,
    cu.updated_at,
    CONCAT('https://booking.critter.pet/', cu.custom_url) as full_url
FROM custom_urls cu
ORDER BY cu.updated_at DESC;

-- Example test cases:

-- Test 1: Create new URL for professional 151
-- SELECT manage_custom_url('151', 'sally-grooming');

-- Test 2: Try to create same URL for different professional (should fail)
-- SELECT manage_custom_url('152', 'sally-grooming');

-- Test 3: Update existing URL for professional 151
-- SELECT manage_custom_url('151', 'sally-pet-grooming');

-- Test 4: Check URL availability
-- SELECT is_custom_url_available('sally-grooming');

-- Test 5: Get all URLs for a professional
-- SELECT * FROM get_professional_custom_urls('151');
