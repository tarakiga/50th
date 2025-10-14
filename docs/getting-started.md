---
title: Getting Started
description: Setup, development workflow, and environment configuration for the Golden Ticket app.
---

# Getting Started

This repo currently contains documentation and planning. Implementation will follow the plan in docs/roadmap.md.

## Prerequisites
- Node.js LTS (v18+)
- Package manager: pnpm or npm
- WhatsApp Business (Cloud API) credentials

## Local Development
1. Clone repository
2. Install dependencies (npm install or pnpm install)
3. Configure environment variables by copying .env.example to .env
4. Run dev server (npm run dev)
5. Run tests (npm test)

Environment variables:
- CONTACTS_DIR (optional; default is ./contacts)
- WHATSAPP_CLOUD_API_TOKEN
- WHATSAPP_PHONE_NUMBER_ID
- WHATSAPP_TEMPLATE_NAME (default: golden_ticket_confirm)
- WHATSAPP_TEMPLATE_LANG (default: en_US)
- WHATSAPP_TEMPLATE_INCLUDE_DIRECTIONS (default: true)
- ADMIN_TOKEN (for admin routes)

## Testing (planned)
- Unit tests for RSVP logic and formatting of WhatsApp messages
- Integration tests for Google Sheets updates and WhatsApp API calls (mocked)

See docs/roadmap.md for implementation phases.
