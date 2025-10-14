---
title: API
description: Planned endpoints, payloads, and WhatsApp integration contracts.
---

# API

## Endpoints (planned)

GET /invite?token={token}
- Validates token, renders invitation view (SSR/SSG)
- Errors: 400 (missing token), 404 (invalid), 410 (expired)

POST /rsvp
- Body: { token: string, action: "attending" | "declined" }
- Side effects:
  - Update Google Sheet row
  - If attending, send WhatsApp message
- Responses:
  - 200 { status: "ok" }
  - 400/404 for invalid token or malformed body

GET /admin
- Auth: ADMIN_TOKEN (Bearer token in Authorization header)
- Returns summary table with RSVPStatus and WhatsAppDeliveryStatus

Admin UI (page)
- Path: /admin
- Behavior: prompts for ADMIN_TOKEN and fetches /api/admin; displays table with filters

## WhatsApp Integration
- Template: configurable via env
  - WHATSAPP_TEMPLATE_NAME (default: golden_ticket_confirm)
  - WHATSAPP_TEMPLATE_LANG (default: en_US)
  - WHATSAPP_TEMPLATE_INCLUDE_DIRECTIONS (default: true). If false, only first 3 variables are sent.
- Recommended body if using 4 variables:
  - Hi {{1}}, you're confirmed for {{2}}!\n
    Venue: {{3}}\n
    Directions: {{4}}
- Send API: WhatsApp Cloud API messages endpoint
- Delivery Handling:
  - Retry policy: exponential backoff, max 3 attempts
  - Mark delivery status in sheet: Sent | Failed | Pending
  - Log errors with correlation IDs

## Data Contracts
- CSV columns (contacts/*.csv): Name | PhoneNumber (E.164) | Token | RSVPStatus | WhatsAppDeliveryStatus | UpdatedAt
- RSVPStatus: Attending | Declined | None
- WhatsAppDeliveryStatus: Pending | Sent | Failed
