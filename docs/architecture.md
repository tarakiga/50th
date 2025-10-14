---
title: Architecture
description: High-level architecture and design decisions for the Golden Ticket app.
---

# Architecture

## Overview
- Frontend: Invitation & RSVP UI (SSR/SSG)
- Backend: Serverless functions for token validation, RSVP, WhatsApp sends
- Data: CSV files in contacts/ as source of truth (one or more .csv files)
- Integrations: WhatsApp Cloud API
- Admin: Protected dashboard for host

## Components
- Invite Page: Personalized view from token lookup
- RSVP API: Updates sheet, triggers WhatsApp, updates delivery status
- WhatsApp Service: Template rendering, send, retry, error handling
- Admin Dashboard: Filter by status, export CSV, error visibility

## Design Decisions
- Privacy-first: exact address only via WhatsApp; never exposed in HTML/JS
- Lightweight backend: Google Sheets for speed-to-value; can migrate to DB later
- Serverless: elastic, low-maintenance, fast to launch

## Security
- Secrets in environment vars; principle of least privilege
- Rate limiting on public endpoints; audit logs for admin actions
- E.164 normalization of phone numbers

## Performance
- Edge/network optimizations; caching non-sensitive reads
- Smooth animations and skeletons for perceived performance

## Future Evolution
- Swap Google Sheets for a database when complexity or scale increases
- Add reminders and richer admin tooling
