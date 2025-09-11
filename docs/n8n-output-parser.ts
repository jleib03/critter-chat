/**
 * N8N Output Parser Specification for Critter Pet Services CRM
 *
 * This document defines the expected data format for webhook responses
 * when processing CSV uploads through the customer_upload action.
 */

// Main webhook response structure
export interface N8NWebhookResponse {
  success: boolean
  action: "customer_upload_processed"
  professionalId: string
  timestamp: string
  data: {
    customers: ProcessedCustomer[]
    pets: ProcessedPet[]
    summary: DataSummary
  }
  errors?: ValidationError[]
}

// Customer data structure
export interface ProcessedCustomer {
  id: string // Generate unique ID if not provided
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
  }
  // Additional fields from CSV
  [key: string]: any
}

// Pet data structure
export interface ProcessedPet {
  id: string // Generate unique ID if not provided
  customerId: string // Link to customer
  name: string
  species: "dog" | "cat" | "bird" | "rabbit" | "other"
  breed?: string
  age?: number
  weight?: number
  notes?: string
  // Additional fields from CSV
  [key: string]: any
}

// Data processing summary
export interface DataSummary {
  totalRows: number
  customersProcessed: number
  petsProcessed: number
  duplicatesFound: number
  errorsCount: number
  processingTime: number // milliseconds
}

// Validation error structure
export interface ValidationError {
  row: number
  field: string
  value: any
  message: string
  severity: "warning" | "error"
}

/**
 * N8N Processing Rules and Expectations
 */

// 1. CSV Column Mapping Examples
const COMMON_COLUMN_MAPPINGS = {
  // Customer fields
  customer_first_name: ["first_name", "firstName", "first", "customer_first", "fname"],
  customer_last_name: ["last_name", "lastName", "last", "customer_last", "lname"],
  customer_email: ["email", "email_address", "customer_email", "contact_email"],
  customer_phone: ["phone", "phone_number", "customer_phone", "contact_phone"],

  // Pet fields
  pet_name: ["pet_name", "petName", "name", "pet", "animal_name"],
  pet_species: ["species", "pet_type", "animal_type", "type"],
  pet_breed: ["breed", "pet_breed", "animal_breed"],
  pet_age: ["age", "pet_age", "animal_age"],
  pet_weight: ["weight", "pet_weight", "animal_weight"],
}

// 2. Data Validation Rules
const VALIDATION_RULES = {
  required_fields: {
    customer: ["firstName", "lastName", "email"],
    pet: ["name", "species", "customerId"],
  },

  data_types: {
    email: "valid_email_format",
    phone: "phone_number_format",
    age: "positive_integer",
    weight: "positive_number",
  },

  species_values: ["dog", "cat", "bird", "rabbit", "other"],
}

// 3. Example N8N Output
const EXAMPLE_OUTPUT: N8NWebhookResponse = {
  success: true,
  action: "customer_upload_processed",
  professionalId: "prof_123456",
  timestamp: "2024-01-15T10:30:00Z",
  data: {
    customers: [
      {
        id: "cust_001",
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@email.com",
        phone: "+1-555-0123",
        address: {
          street: "123 Main St",
          city: "Anytown",
          state: "CA",
          zipCode: "12345",
        },
      },
    ],
    pets: [
      {
        id: "pet_001",
        customerId: "cust_001",
        name: "Buddy",
        species: "dog",
        breed: "Golden Retriever",
        age: 3,
        weight: 65,
        notes: "Friendly, loves treats",
      },
    ],
    summary: {
      totalRows: 1,
      customersProcessed: 1,
      petsProcessed: 1,
      duplicatesFound: 0,
      errorsCount: 0,
      processingTime: 1250,
    },
  },
  errors: [],
}

/**
 * N8N Processing Workflow Recommendations
 */

// Step 1: Parse CSV data
// Step 2: Normalize column names using COMMON_COLUMN_MAPPINGS
// Step 3: Validate required fields and data types
// Step 4: Generate unique IDs for customers and pets
// Step 5: Link pets to customers via customerId
// Step 6: Check for duplicates (email for customers, name+customerId for pets)
// Step 7: Format response according to N8NWebhookResponse interface
// Step 8: Send webhook response to application

// Ensure all interfaces are declared before using them
const N8NWebhookResponse = "N8NWebhookResponse"
const ProcessedCustomer = "ProcessedCustomer"
const ProcessedPet = "ProcessedPet"
const DataSummary = "DataSummary"
const ValidationError = "ValidationError"

export default {
  N8NWebhookResponse,
  ProcessedCustomer,
  ProcessedPet,
  DataSummary,
  ValidationError,
  COMMON_COLUMN_MAPPINGS,
  VALIDATION_RULES,
  EXAMPLE_OUTPUT,
}
