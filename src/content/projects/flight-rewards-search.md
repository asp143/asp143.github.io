---
name: flight-rewards-search
title: Flight Rewards Search Engine
description: Reward flight availability search across major airlines — Node.js + TypeScript backend, PostgreSQL search index, and GCP-hosted ingestion pipelines that keep award seat data fresh at scale.
summary: Technical lead on a UK-based SaaS that searches reward flight availability across major airline programs. Backend, data ingestion, and search infrastructure built on Node.js, TypeScript, PostgreSQL, and Google Cloud Platform.
stack:
  - Node.js
  - TypeScript
  - PostgreSQL
  - Google Cloud Platform
  - Cloud Run
  - Pub/Sub
  - Redis
tech: node · ts · postgres · gcp
role: Technical Lead — backend, data pipelines, search architecture
status: active
featured: true
order: 1
keywords:
  - reward flight search
  - award availability
  - airline data engineering
  - postgres search
  - node typescript backend
  - gcp cloud run
---

## What it does

A reward flight search engine that aggregates award seat availability across multiple airline loyalty programs and lets travellers query "where can I fly with X miles, on Y dates, in Z cabin?" in seconds. Award availability is famously volatile, fragmented across airline systems, and rate-limited at the source — so most of the engineering challenge sits in the ingestion and search layers, not the UI.

## Architecture

The platform splits into three loosely-coupled tiers, all running on Google Cloud Platform:

- **Ingestion workers** — long-running Node.js services that pull availability from a rotating set of upstream sources, normalize cabin classes and routing rules, and publish change events.
- **Search store** — PostgreSQL as the canonical store, with carefully-tuned indexes for `(origin, destination, date, cabin, program)` lookups. Hot routes are cached in Redis with short TTLs to absorb traffic spikes without re-querying the source of truth.
- **Query API** — stateless TypeScript service on Cloud Run that exposes the consumer-facing search endpoints, handles auth, and applies result-side filtering (mileage tiers, mixed-cabin, layover constraints).

Pub/Sub sits between ingestion and search as the change feed, which keeps each tier independently scalable and lets us replay events when we change the schema or fix a parsing bug.

## Tech rationale

- **TypeScript everywhere** — the same domain types (program, cabin, segment, fare class) flow from the scrapers through the API into the SDK, so a schema change is a compile-time problem instead of a 3am production problem.
- **PostgreSQL over a search engine** — for this dataset (millions of segments, structured query shape) a well-indexed Postgres table with partial indexes on hot columns and BRIN indexes on time-bucketed partitions outperforms a general-purpose search engine and is dramatically cheaper to operate.
- **Cloud Run for the API** — request-scoped autoscaling and scale-to-zero match the bursty, search-driven traffic pattern. Long-running ingestion workers run on dedicated GCE/Cloud Run jobs so they don't fight the API for cold-start budget.

## What I focus on

- Designing the ingestion → store → query data flow end-to-end.
- Index strategy and query plans for the search hotpath (the difference between 50ms and 5s lives here).
- Backpressure and rate limiting against upstream sources so we stay polite and don't get cut off.
- Observability: structured logs, per-source freshness SLOs, and alerting on data drift.

## Highlights

- Sub-second response on the most-queried route/date combinations.
- Schema-versioned change feed so a parser fix can be replayed across historical events without a full re-scrape.
- Cost profile that keeps GCP spend predictable as catalogue size grows, by separating "always warm" hot data from cold archives.
