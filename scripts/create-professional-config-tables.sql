-- Professional Configuration Database Schema
-- This schema stores team, capacity, and blocked time configuration for professionals

-- Main professional configuration table
CREATE TABLE professional_configs (
    id SERIAL PRIMARY KEY,
    professional_id VARCHAR(255) NOT NULL UNIQUE,
    business_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_webhook_sent TIMESTAMP WITH TIME ZONE,
    webhook_status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed
    CONSTRAINT professional_configs_professional_id_key UNIQUE (professional_id)
);

-- Employees table
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(255) NOT NULL UNIQUE, -- Generated client-side ID
    professional_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (professional_id) REFERENCES professional_configs(professional_id) ON DELETE CASCADE,
    CONSTRAINT employees_employee_id_key UNIQUE (employee_id)
);

-- Employee working days/hours
CREATE TABLE employee_working_days (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(255) NOT NULL,
    day_of_week VARCHAR(20) NOT NULL, -- Monday, Tuesday, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_working BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    CONSTRAINT employee_working_days_unique UNIQUE (employee_id, day_of_week),
    CONSTRAINT valid_day_of_week CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Employee services (which services each employee can perform)
CREATE TABLE employee_services (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(255) NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    CONSTRAINT employee_services_unique UNIQUE (employee_id, service_name)
);

-- Capacity rules for each professional
CREATE TABLE capacity_rules (
    id SERIAL PRIMARY KEY,
    professional_id VARCHAR(255) NOT NULL UNIQUE,
    max_concurrent_bookings INTEGER DEFAULT 1,
    buffer_time_between_bookings INTEGER DEFAULT 15, -- in minutes
    max_bookings_per_day INTEGER DEFAULT 8,
    allow_overlapping BOOLEAN DEFAULT false,
    require_all_employees_for_service BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (professional_id) REFERENCES professional_configs(professional_id) ON DELETE CASCADE,
    CONSTRAINT positive_capacity_values CHECK (
        max_concurrent_bookings > 0 AND 
        buffer_time_between_bookings >= 0 AND 
        max_bookings_per_day > 0
    )
);

-- Blocked time periods
CREATE TABLE blocked_times (
    id SERIAL PRIMARY KEY,
    blocked_time_id VARCHAR(255) NOT NULL UNIQUE, -- Generated client-side ID
    professional_id VARCHAR(255) NOT NULL,
    employee_id VARCHAR(255), -- NULL means applies to all employees
    blocked_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    reason TEXT,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern VARCHAR(20), -- weekly, monthly
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (professional_id) REFERENCES professional_configs(professional_id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    CONSTRAINT blocked_times_blocked_time_id_key UNIQUE (blocked_time_id),
    CONSTRAINT valid_recurrence_pattern CHECK (recurrence_pattern IS NULL OR recurrence_pattern IN ('weekly', 'monthly')),
    CONSTRAINT valid_blocked_time_range CHECK (end_time > start_time),
    CONSTRAINT recurring_pattern_consistency CHECK (
        (is_recurring = false AND recurrence_pattern IS NULL) OR
        (is_recurring = true AND recurrence_pattern IS NOT NULL)
    )
);

-- Configuration change log for audit trail
CREATE TABLE config_change_log (
    id SERIAL PRIMARY KEY,
    professional_id VARCHAR(255) NOT NULL,
    change_type VARCHAR(50) NOT NULL, -- employee_added, employee_updated, capacity_updated, etc.
    change_description TEXT,
    old_values JSONB,
    new_values JSONB,
    changed_by VARCHAR(255), -- Could be user ID or system
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (professional_id) REFERENCES professional_configs(professional_id) ON DELETE CASCADE
);

-- Webhook delivery log
CREATE TABLE webhook_delivery_log (
    id SERIAL PRIMARY KEY,
    professional_id VARCHAR(255) NOT NULL,
    webhook_url VARCHAR(500) NOT NULL,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    delivery_attempt INTEGER DEFAULT 1,
    delivered_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (professional_id) REFERENCES professional_configs(professional_id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_employees_professional_id ON employees(professional_id);
CREATE INDEX idx_employees_active ON employees(professional_id, is_active);
CREATE INDEX idx_employee_working_days_employee_id ON employee_working_days(employee_id);
CREATE INDEX idx_employee_services_employee_id ON employee_services(employee_id);
CREATE INDEX idx_blocked_times_professional_id ON blocked_times(professional_id);
CREATE INDEX idx_blocked_times_date_range ON blocked_times(professional_id, blocked_date, start_time, end_time);
CREATE INDEX idx_blocked_times_employee_id ON blocked_times(employee_id);
CREATE INDEX idx_config_change_log_professional_id ON config_change_log(professional_id, created_at);
CREATE INDEX idx_webhook_delivery_log_professional_id ON webhook_delivery_log(professional_id, created_at);
CREATE INDEX idx_webhook_delivery_log_retry ON webhook_delivery_log(next_retry_at) WHERE next_retry_at IS NOT NULL;

-- Triggers to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_professional_configs_updated_at BEFORE UPDATE ON professional_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employee_working_days_updated_at BEFORE UPDATE ON employee_working_days FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_capacity_rules_updated_at BEFORE UPDATE ON capacity_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blocked_times_updated_at BEFORE UPDATE ON blocked_times FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data insertion (for testing)
-- This would typically be done via the application, but included for reference
/*
INSERT INTO professional_configs (professional_id, business_name) 
VALUES ('prof_123', 'Happy Paws Veterinary Clinic');

INSERT INTO capacity_rules (professional_id, max_concurrent_bookings, buffer_time_between_bookings, max_bookings_per_day)
VALUES ('prof_123', 2, 15, 12);

INSERT INTO employees (employee_id, professional_id, name, role, email, is_active)
VALUES 
    ('emp_001', 'prof_123', 'Dr. Sarah Johnson', 'Veterinarian', 'sarah@happypaws.com', true),
    ('emp_002', 'prof_123', 'Mike Chen', 'Veterinary Technician', 'mike@happypaws.com', true);

INSERT INTO employee_working_days (employee_id, day_of_week, start_time, end_time, is_working)
VALUES 
    ('emp_001', 'Monday', '09:00', '17:00', true),
    ('emp_001', 'Tuesday', '09:00', '17:00', true),
    ('emp_001', 'Wednesday', '09:00', '17:00', true),
    ('emp_001', 'Thursday', '09:00', '17:00', true),
    ('emp_001', 'Friday', '09:00', '17:00', true),
    ('emp_002', 'Monday', '08:00', '16:00', true),
    ('emp_002', 'Tuesday', '08:00', '16:00', true),
    ('emp_002', 'Wednesday', '08:00', '16:00', true),
    ('emp_002', 'Thursday', '08:00', '16:00', true),
    ('emp_002', 'Friday', '08:00', '16:00', true);
*/
