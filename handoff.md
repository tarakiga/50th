# Project Handoff — Golden Ticket Invitation App

This document is the single source of truth for the project. It summarizes what the app does, how it’s structured, and how to run, test, and extend it. Supporting GitBook-style docs live in docs/ and mirror/expand on this content.

## What the Application Does
A luxury-tier, privacy-first invitation experience. Guests receive unique links; upon RSVP confirmation, the exact venue address is delivered via WhatsApp Business API. The venue is never exposed on the web UI.

## Current State
- Repository currently contains documentation and delivery plan.
- Implementation will follow docs/roadmap.md.

## Planned Structure
- Frontend: Invitation & RSVP UI (SSR/SSG)
- Backend: Serverless functions for token validation, RSVP processing, WhatsApp sends
- Data: CSV in contacts/ (Name, PhoneNumber[E.164], Token, RSVPStatus, WhatsAppDeliveryStatus, UpdatedAt)
- Admin: Protected dashboard for host with delivery visibility

## How to Run (dev)
1) Install Node.js LTS (v18+)
2) Install dependencies
   - npm: npm install
   - pnpm: pnpm install
3) Copy .env.example to .env and fill in values (do NOT commit .env)
   - GOOGLE_SHEETS_CLIENT_EMAIL
   - GOOGLE_SHEETS_PRIVATE_KEY
   - GOOGLE_SHEETS_SPREADSHEET_ID
   - WHATSAPP_CLOUD_API_TOKEN
   - WHATSAPP_PHONE_NUMBER_ID
   - ADMIN_TOKEN
   - EVENT_NAME
   - VENUE_ADDRESS
   - MAPS_LINK (optional)
4) Run the dev server
   - npm run dev (or pnpm dev)
5) Admin UI
   - Open /admin
   - Paste your ADMIN_TOKEN and click Load to view the latest data

Details and updates: see docs/getting-started.md

## How to Test (planned)
- Unit tests for RSVP logic and WhatsApp message formatting
- Integration tests with mocked Google Sheets and WhatsApp API

## How to Extend
- Add reminders or calendar links via additional templates
- Replace Google Sheets with a database when scale/complexity increases
- Implement richer admin features (filters, bulk actions, analytics)

## Key Design Decisions & Gotchas
- Privacy-first: address only via WhatsApp; never render client-side
- E.164 phone number format required for delivery reliability
- Retry policy and delivery status must be observable by host

## Documentation Map
- PRD: docs/prd.md
- Architecture: docs/architecture.md
- API: docs/api.md
- Getting Started: docs/getting-started.md
- Roadmap: docs/roadmap.md
