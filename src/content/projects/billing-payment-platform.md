---
name: billing-payment-platform
title: Multi-Gateway Billing & Payment Platform
description: Payment orchestration across multiple gateways with unified subscription billing, dunning, and smart retry logic — built in TypeScript on an event-driven GCP stack.
summary: A unified subscription billing layer that abstracts multiple payment gateways behind a single domain model. Handles charges, refunds, retries, dunning, and lifecycle events without leaking gateway-specific quirks into product code.
stack:
  - Node.js
  - TypeScript
  - Google Cloud Platform
  - Pub/Sub
  - Cloud Run
  - PostgreSQL
  - Event-driven architecture
tech: node · ts · gcp · event-driven
role: Backend engineer — payment orchestration, subscription lifecycle, reliability
status: active
featured: true
order: 2
keywords:
  - subscription billing platform
  - payment gateway orchestration
  - dunning automation
  - smart retry payments
  - event-driven billing
  - typescript node payments
---

## What it does

A subscription billing and payment orchestration platform sitting in front of multiple payment gateways. Product teams call one API ("charge this customer for this plan") and the platform handles gateway selection, idempotency, retries, refunds, dunning, and the long tail of subscription lifecycle events — without any of the gateway-specific quirks bleeding upward.

## Architecture

The system is event-driven by design. Every meaningful state change — `charge.attempted`, `charge.failed`, `subscription.renewed`, `invoice.paid`, `dunning.escalated` — is a published event, and downstream consumers (notifications, accounting export, customer ops dashboards) subscribe instead of polling.

- **Gateway adapter layer** — each gateway (Stripe-style and others) sits behind a common interface that maps gateway responses to a normalized domain model (decline reasons, network codes, retry hints).
- **Subscription engine** — owns plan/period state, proration, trial handling, mid-cycle changes, and renewal scheduling.
- **Dunning state machine** — explicit states (`grace`, `soft_decline`, `hard_decline`, `recovered`, `churned`) with clear transitions, retry windows, and customer communication hooks.
- **Event bus on Pub/Sub** — durable fan-out across services with at-least-once delivery; consumers are idempotent by design.

## Reliability primitives

A payment platform is mostly a reliability project. The core building blocks:

- **Idempotency keys** at every external write. The same logical charge attempt can be retried safely, end-to-end.
- **Outbox pattern** for state-change events so we never have a "charged but didn't notify" or "notified but didn't charge" window.
- **Smart retry** — decline-code-aware backoff that distinguishes retriable failures (network, gateway timeout, soft decline) from terminal ones (lost card, fraud block) so we don't burn customer trust by retrying things that will never succeed.
- **Replay-safe consumers** — every event handler is written so reprocessing a backlog is a yawn, not an incident.

## Tech rationale

- **TypeScript end-to-end** for compile-time guarantees on money, currency, and state transitions — the places where a stringly-typed bug hurts the most.
- **GCP Pub/Sub** for the bus because it gives durable, scalable fan-out without us having to operate a message broker.
- **Cloud Run** for the stateless services and **PostgreSQL** for the system of record (subscriptions, invoices, ledger entries).

## What I focus on

- Designing the dunning state machine and retry policies so recovery rates improve without spamming customers.
- Building the gateway adapter abstractions so adding a new gateway is a finite, well-scoped piece of work — not a refactor.
- Hardening the event pipeline: idempotency, ordering where it matters, dead-letter handling, and replay tooling.
