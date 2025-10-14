---
title: PRD — Golden Ticket Invitation App
description: Revised product requirements for a privacy-first, luxury-tier invitation experience with WhatsApp delivery.
---

## Product Requirements Document: "Golden Ticket" Invitation App
Version: 1.2
Date: 2025-10-13
Author: tar
Status: Revised

---

### 1. Executive Summary
A premium, privacy-first invitation app for exclusive events. Guests receive unique links, RSVP on an elegant microsite, and—only upon confirming—receive the private venue address via WhatsApp (WhatsApp Business API). No sensitive details are exposed on the public web. The app emphasizes luxury aesthetics, reliability, and automation.

---

### 2. Vision and Goals

- Problem: Private events are hard to manage securely; group chats leak info and manual RSVC tracking is error-prone.
- Vision: A digital concierge that verifies guests, manages RSVPs, and delivers sensitive logistics via trusted channels (WhatsApp) only to confirmed attendees.
- Business Goals:
  - Create a wow experience reflecting luxury and exclusivity.
  - Demonstrate enterprise-grade integration with WhatsApp Business API.
  - Provide operational excellence for hosts (automation + reliability).
- Product Goals:
  - Security: Only pre-approved guests can RSVP; venue never exposed client-side.
  - Automation: Real-time RSVP + automatic WhatsApp delivery.
  - Premium UX: Bespoke, responsive, and emotionally resonant design.

---

### 3. Target Audience & Personas
- Hosts of private, high-touch events (cocktails, launch parties, intimate dinners).
- Guests receiving curated, personal invitations.

(Personas unchanged from prior versions; details can be appended as needed.)

---

### 4. User Stories

Guest Flow
- As a guest, I receive a personal, unique link so I feel specially invited.
- As a guest, I see my name and event details on a beautifully designed page.
- As a guest who confirms, I receive the exact venue address and directions instantly via WhatsApp so it’s never publicly visible.

Host Flow
- As a host, I want confirmed guests to automatically receive the private venue address via WhatsApp.
- As a host, I want confidence that only “Attending” guests receive location details—instantly and reliably—with delivery status visibility.

---

### 5. Functional Requirements

5.1 Data Source — CSV (contacts directory)
- Columns: Name, PhoneNumber (E.164), Token, RSVPStatus, WhatsAppDeliveryStatus, UpdatedAt (in CSV files under contacts/)
- PhoneNumber must be E.164 (e.g., +14155552671)
- Token: unique, hard-to-guess identifier per guest
- Atomic updates: file rewrite per update (single-writer in serverless route)

5.2 Invitation Links
- Guest link format: https://<host>/invite?token=<token>
- Token lookup validates guest row; if invalid, show graceful error screen

5.3 Invitation Page
- Displays guest name, event headline, date/time, high-level location hint (e.g., Neighborhood/City only; never exact address), dress code, and RSVP buttons
- Attending and Decline actions

5.4 RSVP Logic
- Attending:
  1) Update Google Sheet RSVPStatus=Attending, UpdatedAt=now
  2) Trigger WhatsApp message to PhoneNumber using pre-approved template with parameters (GuestName, EventName, VenueAddress, optional MapsLink)
  3) Frontend success state: “You’re all set! Check WhatsApp for your private location details.”
- Declined:
  - Update Google Sheet RSVPStatus=Declined; show confirmation; do not send WhatsApp

5.5 Admin Dashboard
- Table of guests with RSVPStatus, WhatsAppDeliveryStatus (Sent, Failed, Pending), UpdatedAt
- Filters: Attending/Declined/No Response
- Download CSV of attendance

5.6 WhatsApp Business API Integration
- Use WhatsApp Cloud API or official partner
- Pre-approved template required; example template variables:
  - Hi {{1}}, you're confirmed for {{2}}!
  - Venue: {{3}}
  - Directions: {{4}} (optional link)
- Delivery logic:
  - Retry with exponential backoff on transient failures (HTTP 5xx, rate limits)
  - Mark WhatsAppDeliveryStatus accordingly; surface errors in dashboard
  - Respect opt-out and policy compliance; no message if declined

5.7 Observability
- Structured logs for RSVP events, WhatsApp sends, and failures
- Optional webhook for Slack/Email to notify host of failures above threshold

---

### 6. Non-Functional Requirements

6.1 UI/UX (Luxury Standard)
- Palette: Charcoal (#1a1a1a), Gold (#d4af37), Off-whites (#f8f8f8, #eaeaea)
- Typography: Inter (variable); refined hierarchy and micro-interactions
- Animations: Smooth (e.g., Framer Motion or equivalent) at 60fps
- Loading states: shimmer skeletons; tactile RSVP buttons (press feedback)
- Responsive: mobile-first; thumb-friendly targets (>48px)
- Accessibility: WCAG 2.1 AA (contrast, labels, keyboard navigation)

6.2 Security & Privacy
- Venue address is never rendered client-side until after RSVP; even then, it is not shown in the UI—delivered only via WhatsApp
- Protect admin endpoints with secure auth; store secrets in encrypted env vars
- Rate limit public endpoints (/invite, /rsvp); audit logs for admin actions
- Compliance: honor user messaging consent; handle PII minimally; document retention policy

6.3 Performance & Reliability
- Invitation page Time-to-Interactive < 1.5s on 3G
- WhatsApp message dispatch target: < 5s from RSVP confirmation
- Serverless cold-start mitigations (warmers, edge runtime where possible)

---

### 7. Architecture Overview (Planned)
- Frontend: Static/SSR app (e.g., Next.js) for invitation and RSVP UI
- Backend: Serverless functions for token validation, RSVP, and WhatsApp sends
- Data: Google Sheets as source of truth; optional cache layer for reads
- Integrations: WhatsApp Cloud API
- Admin: Protected dashboard (server-rendered or SPA + API)

Sequence (Attending)
1) Guest opens unique link → GET /invite?token=...
2) Backend validates token; returns invitation view
3) Guest clicks Attending → POST /rsvp { token }
4) Backend updates sheet; sends WhatsApp; updates delivery status
5) UI shows success; Admin dashboard reflects updated status

---

### 8. Dependencies & Assumptions
- Verified WhatsApp Business account with approved templates
- E.164 phone numbers with prior opt-in
- Hosting supports outbound HTTPS to WhatsApp Cloud API
- Google Sheets API access with proper credentials and rate limits

---

### 9. Success Metrics
- WhatsApp Delivery Rate: ≥95% within 10s for Attending guests
- Security: 0 unauthorized access incidents
- UX: Host CSAT ≥4.8/5 post-event; 0 location privacy complaints
- Performance: P95 page load < 2s mobile

---

### 10. Acceptance Criteria (v1)
- Unique token links validate and render guest-specific invitation
- RSVP Attending updates sheet and triggers WhatsApp with correct parameters
- No address exposure in any client responses or markup
- Admin dashboard shows RSVP and delivery status; CSV export works
- Error states and retries implemented; failures visible to host

---

### 11. Out of Scope (v1)
- Calendar invites, reminders, +1 management, seating charts
- Payments or ticketing
- Multi-event management

---

### 12. Open Questions
- Preferred frontend framework? (Default recommendation: Next.js)
- Admin auth mechanism? (Magic link vs. OAuth vs. password)
- Hosting preference? (Vercel/Netlify/AWS Amplify)
