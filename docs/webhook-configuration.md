# Webhook Configuration Guide

This document explains how to manage webhook endpoints in the Critter Pet Services application.

## Overview

The application uses three main webhook endpoints for different functionalities:

1. **Custom Agent Webhook** - Handles AI agent enrollment, configuration, and testing
2. **Professional Configuration Webhook** - Manages booking preferences, team settings, capacity rules, and blocked times
3. **Chat Configuration Webhook** - Handles chat widget customization and configuration

## Environment Variables

Set these environment variables in your `.env.local` file:

\`\`\`bash
# Custom Agent Webhook
NEXT_PUBLIC_CUSTOM_AGENT_WEBHOOK_URL=https://your-n8n-instance.com/webhook/custom-agent-id

# Professional Configuration Webhook  
NEXT_PUBLIC_PROFESSIONAL_CONFIG_WEBHOOK_URL=https://your-n8n-instance.com/webhook/professional-config-id

# Chat Configuration Webhook
NEXT_PUBLIC_CHAT_CONFIG_WEBHOOK_URL=https://your-n8n-instance.com/webhook/chat-config-id
\`\`\`

## Usage

The webhook system is centralized through the `types/webhook-endpoints.ts` file. This provides:

### Type-Safe Webhook Access

\`\`\`typescript
import { getWebhookEndpoint, logWebhookUsage } from '@/types/webhook-endpoints'

// Get a webhook URL with validation
const webhookUrl = getWebhookEndpoint('CUSTOM_AGENT')

// Log webhook usage for debugging (development only)
logWebhookUsage('CUSTOM_AGENT', 'check_enrollment')
\`\`\`

### Available Endpoints

- `CUSTOM_AGENT` - For AI agent operations
- `PROFESSIONAL_CONFIG` - For professional setup operations  
- `CHAT_CONFIG` - For chat widget operations

## Benefits

1. **Centralized Management** - All webhook URLs are managed in one place
2. **Type Safety** - TypeScript ensures you use valid endpoint names
3. **Environment Flexibility** - Easy to switch between development/production webhooks
4. **Debugging Support** - Automatic logging in development mode
5. **Validation** - URLs are validated before use
6. **Fallback Support** - Default URLs provided if environment variables are missing

## Updating Webhooks

To update webhook URLs:

1. Update the environment variables in your `.env.local` file
2. Restart your development server
3. The new URLs will be automatically used throughout the application

## Error Handling

The system includes built-in error handling:

- Invalid URLs throw descriptive errors
- Missing environment variables fall back to default URLs
- All webhook calls include proper error logging

## Development vs Production

- Development: Webhook usage is logged to console for debugging
- Production: Logging is disabled for performance
- Environment variables can be different per environment
\`\`\`

This comprehensive webhook management system provides:

1. **Centralized Configuration** - All webhook URLs are managed in one place
2. **Type Safety** - TypeScript ensures correct endpoint usage
3. **Environment Flexibility** - Easy switching between development/production
4. **Debugging Support** - Automatic logging in development
5. **Error Handling** - Proper validation and fallbacks
6. **Easy Updates** - Just change environment variables to update all webhooks

To use this system, simply update your `.env.local` file with the three webhook URLs, and the entire application will use the centralized system automatically.
