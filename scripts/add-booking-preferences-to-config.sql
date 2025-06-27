-- Add booking preference columns to professional_configs table
ALTER TABLE professional_configs 
ADD COLUMN IF NOT EXISTS booking_type VARCHAR(50) DEFAULT 'direct_booking',
ADD COLUMN IF NOT EXISTS booking_preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS allow_direct_booking BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS require_approval BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS online_booking_enabled BOOLEAN DEFAULT true;

-- Add constraint to ensure valid booking types
ALTER TABLE professional_configs 
ADD CONSTRAINT valid_booking_type 
CHECK (booking_type IN ('direct_booking', 'request_to_book', 'no_online_booking'));

-- Update existing records to have default values
UPDATE professional_configs 
SET booking_type = 'direct_booking',
    allow_direct_booking = true,
    require_approval = false,
    online_booking_enabled = true
WHERE booking_type IS NULL;

-- Add index for booking type queries
CREATE INDEX IF NOT EXISTS idx_professional_configs_booking_type 
ON professional_configs(booking_type);

-- Add comments for documentation
COMMENT ON COLUMN professional_configs.booking_type IS 'Type of booking experience: direct_booking, request_to_book, no_online_booking';
COMMENT ON COLUMN professional_configs.allow_direct_booking IS 'Whether customers can book directly without approval';
COMMENT ON COLUMN professional_configs.require_approval IS 'Whether bookings require professional approval';
COMMENT ON COLUMN professional_configs.online_booking_enabled IS 'Whether online booking is enabled at all';
