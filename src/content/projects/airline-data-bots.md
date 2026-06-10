---
name: airline-data-bots
title: Airline Data Bots — Scheduled Availability Scrapers
description: Scheduled scrapers collecting flight availability from multiple airline sources — TypeScript and Puppeteer with BullMQ job scheduling and retries.
summary: A fleet of scheduled scrapers that pull flight availability from multiple airline sources, normalize the results, and publish them into the search platform. Built around a Puppeteer pool, a BullMQ-backed queue, and retry/backoff policies that survive the messy realities of public airline endpoints.
stack:
  - TypeScript
  - Node.js
  - Puppeteer
  - BullMQ
  - Redis
  - Docker
tech: ts · puppeteer · bullmq
role: Builder — scraper architecture, queueing, reliability
status: active
featured: true
order: 6
keywords:
  - puppeteer scraping
  - bullmq queue
  - airline data scraping
  - scheduled scrapers
  - typescript node scraping
  - headless browser pool
---

## What it does

A scheduled, distributed scraping system that keeps the search platform's data fresh. Each scraper targets one upstream source, runs on its own cadence, and produces normalized availability records. The platform doesn't care which source data came from once it's normalized — but the work to get it there is where most of the engineering goes.

## Architecture

- **Job queue on BullMQ + Redis** — every scrape is a queued job, with priority, rate-limiting per source, and retry policies. Throughput is controlled per queue, not per worker, so adding capacity doesn't accidentally hammer an upstream.
- **Worker pool** — a fleet of Node.js workers in containers, each capable of running any scraper. Workers pull jobs and run the appropriate Puppeteer flow.
- **Headless browser pool** — Puppeteer instances are pooled and recycled rather than launched per job. Cold-start of a browser is the most expensive thing in the system, so we amortize it.
- **Normalization layer** — each scraper's raw output is funneled through a per-source adapter that maps to the shared availability schema before publishing.

## Reliability patterns

Scraping public airline pages is a war of attrition: layouts change, anti-bot defenses tighten, sessions expire mid-flow. The system is built around the assumption that any individual run can fail.

- **Retry with budget** — exponential backoff on transient failures, hard cap on attempts so a broken scraper fails loud instead of burning quota.
- **Per-source rate limiting** — Redis-backed token bucket per source so we stay polite even when many workers pull jobs concurrently.
- **Health probes per scraper** — small, cheap synthetic runs detect "this scraper is broken" before a daily run reveals a 24-hour data gap.
- **Snapshotting on failure** — page HTML and DOM dumps captured for any failed run, so debugging "why did this break overnight" doesn't require reproducing the failure live.

## Tech rationale

- **Puppeteer over raw HTTP** — these sources rely heavily on client-side rendering and runtime checks. A headless browser is the right level of abstraction; trying to reimplement it as HTTP calls is a tar pit.
- **BullMQ over a hand-rolled scheduler** — it gives us repeatable jobs, retries, rate limiting, and observability out of the box, all backed by Redis.
- **TypeScript** — scraper outputs share a strict schema with the search platform, so a parser drift becomes a type error instead of a silent data corruption.
- **Docker** for repeatable worker environments, including pinned browser versions (the surface area where "works on my machine" actually bites).

## What I focus on

- Designing the queue topology and rate-limiting so we get fresh data without ever overwhelming upstreams.
- Keeping scrapers small and per-source — one parser change should never blast-radius into the others.
- Observability: per-source freshness, success rate, parser drift detection, and snapshot capture for forensics.
