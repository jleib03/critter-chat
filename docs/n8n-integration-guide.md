# N8N Integration Guide for Critter Pet Services CRM

## Overview
This guide explains how to set up an N8N workflow to process CSV uploads from the Critter Pet Services CRM system.

## Webhook Endpoint
- **URL**: Use the `NEXT_PUBLIC_CUSTOM_AGENT_WEBHOOK_URL` environment variable
- **Method**: POST
- **Content-Type**: application/json

## Input Data Structure
When a CSV is uploaded, N8N will receive:
\`\`\`json
{
  "action": "customer_upload",
  "professionalId": "prof_123456",
  "timestamp": "2024-01-15T10:30:00Z",
  "csvData": "firstName,lastName,email,petName,petSpecies\nJohn,Smith,john@email.com,Buddy,dog",
  "parsedData": [
    {
      "firstName": "John",
      "lastName": "Smith", 
      "email": "john@email.com",
      "petName": "Buddy",
      "petSpecies": "dog"
    }
  ]
}
\`\`\`

## Processing Steps

### 1. Data Normalization
- Map CSV columns to standard field names
- Handle common variations (firstName vs first_name vs First Name)
- Convert data types (strings to numbers for age/weight)

### 2. Data Validation
- Verify required fields are present
- Validate email formats
- Check phone number formats
- Ensure species values are valid

### 3. Relationship Building
- Link pets to customers via email matching or explicit customer ID
- Generate unique IDs for new records
- Handle multiple pets per customer

### 4. Duplicate Detection
- Check for existing customers by email
- Check for existing pets by name + customer combination
- Flag duplicates in the response

### 5. Response Formatting
- Format response according to `N8NWebhookResponse` interface
- Include processing summary and any errors
- Send back to the application webhook endpoint

## Error Handling
- Always return a response, even if processing fails
- Include detailed error information for debugging
- Use appropriate severity levels (warning vs error)
- Provide row-level error details when possible

## Testing
Use the provided example JSON files to test your N8N workflow:
- `successful_processing`: Normal operation with clean data
- `processing_with_errors`: Partial success with validation issues  
- `processing_failed`: Complete failure scenario

## Performance Considerations
- Process files up to 10,000 rows efficiently
- Include processing time in the summary
- Use streaming for very large files
- Implement timeout handling (max 30 seconds)
