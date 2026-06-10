---
name: subscription-event-bus
title: Subscription Event Bus on GCP Pub/Sub
description: Event-driven subscription billing on GCP Pub/Sub — lifecycle fan-out, idempotent consumers, retry policies, and dead-letter handling under load.
summary: The event backbone behind subscription billing — a Pub/Sub-based bus that fans subscription lifecycle changes out to billing, notifications, analytics, and ops consumers. Designed for at-least-once delivery, idempotent processing, and clean recovery from upstream failures.
stack:
  - Node.js
  - TypeScript
  - Google Cloud Pub/Sub
  - Cloud Run
  - PostgreSQL
  - Event-driven architecture
tech: node · gcp · pub/sub
role: Backend engineer — event architecture, consumer reliability
status: active
featured: true
order: 3
keywords:
  - gcp pub sub
  - event-driven subscription billing
  - idempotent consumers
  - dead letter queue
  - fan-out architecture
  - subscription lifecycle events
---

## What it does

The event bus that sits underneath the subscription billing platform. Lifecycle changes (`subscription.created`, `plan.changed`, `payment.failed`, `dunning.entered`, `subscription.canceled`) are published once and consumed by anything that cares: charging, notifications, internal dashboards, accounting export, retention experiments. Replacing in-process function calls with a durable event log decoupled the system enough that adding a new consumer no longer requires touching the producer.

## Architecture

- **Producers** — the subscription engine and payment workers publish domain events through a thin client that handles schema validation, ordering keys, and outbox-driven publish to guarantee "state changed ⇒ event published".
- **Topics by domain, not by service** — `subscription.*`, `invoice.*`, `payment.*` topics with strongly-typed payloads, instead of one mega-topic. Consumers subscribe to what they need.
- **Push subscriptions to Cloud Run** for stateless consumers; pull subscriptions for batch/analytical workloads.
- **Dead-letter topics** on every subscription with alerting wired up — a poison message goes to DLQ, not into a hot retry loop.

## Reliability patterns

- **Idempotent consumers**. Every handler treats incoming events as "we may see this twice." Dedup on event ID + handler name in Postgres, with a TTL'd dedup table that's cheap to query.
- **Ordering where it matters**. Subscription lifecycle uses ordering keys per subscription so a `canceled` can't be processed before its `created`. Where strict ordering isn't needed, we don't pay the throughput cost.
- **Outbox pattern** between the writer and the bus — events are written transactionally with the state change, then a relay publishes them. No "charged but no event" failure mode.
- **Backoff and DLQ tuning** — exponential retry with a ceiling, then DLQ. Replay tooling can drain the DLQ back into a subscription after a fix.

## Tech rationale

- **Pub/Sub over Kafka** — for this team and traffic profile, a fully managed broker with native GCP IAM and zero broker ops was the right call. We get durable, scalable fan-out without standing up a Kafka cluster.
- **TypeScript schemas as the source of truth** — event contracts are TS types validated at publish time, so a malformed event is caught at the producer, not in a downstream consumer at 2am.
- **Cloud Run consumers** — push subscriptions + scale-to-zero match bursty event volume well, and the same container can serve HTTP and consume events.

## What I focus on

- Event modeling — what's an event vs. what's a query — and naming/versioning so contracts can evolve.
- Building consumer reliability primitives (idempotency, DLQ replay, backfill) once and reusing them.
- Observability: event throughput, end-to-end latency from publish to processed, DLQ depth as a first-class SLO.
