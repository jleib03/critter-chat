-- Create table for chat agent configuration
CREATE TABLE IF NOT EXISTS chat_agent_config (
    id SERIAL PRIMARY KEY,
    professional_id VARCHAR(50) NOT NULL,
    chat_name VARCHAR(100),
    welcome_message TEXT,
    instructions TEXT,
    primary_color VARCHAR(7) DEFAULT '#E75837',
    widget_position VARCHAR(20) DEFAULT 'bottom-right',
    widget_size VARCHAR(10) DEFAULT 'medium',
    response_tone VARCHAR(20) DEFAULT 'friendly',
    max_response_length INTEGER DEFAULT 200,
    include_booking_links BOOLEAN DEFAULT true,
    custom_responses JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (professional_id) REFERENCES professional_config(professional_id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_chat_agent_config_professional_id ON chat_agent_config(professional_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_chat_agent_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_agent_config_updated_at
    BEFORE UPDATE ON chat_agent_config
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_agent_config_updated_at();
