---
title: Roadmap
description: Delivery plan, phases, milestones, and risks for the Golden Ticket app.
---

# Roadmap

## Phase 0 — Foundations (Day 0–1)
- Confirm tech stack (recommend: Next.js + serverless)
- Register WhatsApp Business (Cloud API) and draft message templates
- Prepare Google Sheet with required columns and sample data

## Phase 1 — Core RSVP (Day 2–4)
- Implement token validation and invitation view (SSR)
- Implement POST /rsvp with Google Sheets update
- Implement WhatsApp send service with template rendering
- Add basic success/failure states in UI

## Phase 2 — Admin & Observability (Day 5–6)
- Implement admin dashboard (auth via ADMIN_TOKEN)
- Add delivery status updates and retry policy
- Structured logging; error surfacing in dashboard

## Phase 3 — Polish & QA (Day 7–8)
- UX polish (micro-interactions, skeletons, accessibility pass)
- Performance tuning (P95 < 2s mobile)
- Write unit/integration tests; finalize templates and copy

## Phase 4 — Launch (Day 9)
- Provision hosting (e.g., Vercel)
- Configure env vars and secrets
- Final verification with a small pilot guest list

## Risks & Mitigations
- WhatsApp template approval delays → Submit early; have fallback copy ready
- Phone number formatting issues → Validate and normalize to E.164
- Sheets API limits → Cache reads; batch writes where possible

## Post-Launch Enhancements
- Reminders, calendar links, +1 support
- Migrate from Google Sheets to DB if needed
