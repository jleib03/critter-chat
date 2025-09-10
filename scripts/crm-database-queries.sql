-- CRM Database Queries for n8n Webhook Implementation
-- These queries will be used in the n8n workflows to fetch customer data

-- 1. Get all customers for a professional
-- Webhook: crm-customers
SELECT 
    c.id,
    c.email,
    c.first_name,
    c.last_name,
    c.phone,
    c.created_at,
    COUNT(b.id) as total_bookings,
    COALESCE(SUM(b.total_amount), 0) as total_spent,
    MAX(b.booking_date) as last_booking_date,
    ARRAY_AGG(DISTINCT p.type) FILTER (WHERE p.type IS NOT NULL) as pet_types
FROM customers c
LEFT JOIN bookings b ON c.id = b.customer_id
LEFT JOIN pets p ON c.id = p.owner_id
WHERE c.professional_id = $1
GROUP BY c.id, c.email, c.first_name, c.last_name, c.phone, c.created_at
ORDER BY c.created_at DESC;

-- 2. Get inactive customers (haven't booked in X days)
-- Webhook: crm-inactive-customers
SELECT 
    c.id,
    c.email,
    c.first_name,
    c.last_name,
    c.phone,
    MAX(b.booking_date) as last_booking_date,
    COUNT(b.id) as total_bookings,
    COALESCE(SUM(b.total_amount), 0) as total_spent
FROM customers c
LEFT JOIN bookings b ON c.id = b.customer_id
WHERE c.professional_id = $1
    AND (
        MAX(b.booking_date) < CURRENT_DATE - INTERVAL '$2 days'
        OR MAX(b.booking_date) IS NULL
    )
GROUP BY c.id, c.email, c.first_name, c.last_name, c.phone
HAVING COUNT(b.id) > 0  -- Only customers who have booked before
ORDER BY MAX(b.booking_date) ASC NULLS LAST;

-- 3. Get repeat customers (X or more bookings)
-- Webhook: crm-repeat-customers
SELECT 
    c.id,
    c.email,
    c.first_name,
    c.last_name,
    c.phone,
    COUNT(b.id) as total_bookings,
    COALESCE(SUM(b.total_amount), 0) as total_spent,
    MAX(b.booking_date) as last_booking_date,
    MIN(b.booking_date) as first_booking_date
FROM customers c
INNER JOIN bookings b ON c.id = b.customer_id
WHERE c.professional_id = $1
GROUP BY c.id, c.email, c.first_name, c.last_name, c.phone
HAVING COUNT(b.id) >= $2
ORDER BY COUNT(b.id) DESC;

-- 4. Get customers by pet type
-- Webhook: crm-pet-type-customers
SELECT DISTINCT
    c.id,
    c.email,
    c.first_name,
    c.last_name,
    c.phone,
    COUNT(b.id) as total_bookings,
    COALESCE(SUM(b.total_amount), 0) as total_spent,
    MAX(b.booking_date) as last_booking_date,
    ARRAY_AGG(DISTINCT p.type) as pet_types,
    ARRAY_AGG(DISTINCT p.name) as pet_names
FROM customers c
INNER JOIN pets p ON c.id = p.owner_id
LEFT JOIN bookings b ON c.id = b.customer_id
WHERE c.professional_id = $1
    AND p.type = ANY($2::text[])  -- Array of pet types
GROUP BY c.id, c.email, c.first_name, c.last_name, c.phone
ORDER BY MAX(b.booking_date) DESC NULLS LAST;

-- 5. Get customer details with pets and booking history
-- Webhook: crm-customer-details
SELECT 
    c.id,
    c.email,
    c.first_name,
    c.last_name,
    c.phone,
    c.address,
    c.created_at,
    COUNT(b.id) as total_bookings,
    COALESCE(SUM(b.total_amount), 0) as total_spent,
    MAX(b.booking_date) as last_booking_date,
    MIN(b.booking_date) as first_booking_date,
    JSON_AGG(
        DISTINCT JSONB_BUILD_OBJECT(
            'id', p.id,
            'name', p.name,
            'type', p.type,
            'breed', p.breed,
            'age', p.age,
            'special_needs', p.special_needs
        )
    ) FILTER (WHERE p.id IS NOT NULL) as pets
FROM customers c
LEFT JOIN pets p ON c.id = p.owner_id
LEFT JOIN bookings b ON c.id = b.customer_id
WHERE c.id = $1
GROUP BY c.id, c.email, c.first_name, c.last_name, c.phone, c.address, c.created_at;

-- 6. Get campaign statistics
-- Webhook: crm-campaign-stats
SELECT 
    'inactive_60_days' as campaign_type,
    COUNT(*) as potential_recipients
FROM customers c
LEFT JOIN bookings b ON c.id = b.customer_id
WHERE c.professional_id = $1
    AND (
        MAX(b.booking_date) < CURRENT_DATE - INTERVAL '60 days'
        OR MAX(b.booking_date) IS NULL
    )
GROUP BY c.professional_id

UNION ALL

SELECT 
    'repeat_customers' as campaign_type,
    COUNT(*) as potential_recipients
FROM (
    SELECT c.id
    FROM customers c
    INNER JOIN bookings b ON c.id = b.customer_id
    WHERE c.professional_id = $1
    GROUP BY c.id
    HAVING COUNT(b.id) >= 2
) repeat_customers

UNION ALL

SELECT 
    CONCAT('pet_type_', p.type) as campaign_type,
    COUNT(DISTINCT c.id) as potential_recipients
FROM customers c
INNER JOIN pets p ON c.id = p.owner_id
WHERE c.professional_id = $1
GROUP BY p.type;
