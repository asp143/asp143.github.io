---
name: ai-dev-workflow-standards
title: AI-Assisted Developer Workflow Standards
description: Internal standards for AI-assisted development — agent setup, prompt patterns, and review gates that keep Claude and OpenAI coding consistent across a team.
summary: An opinionated playbook for using AI coding agents on a real codebase — how agents are configured, what they're allowed to do unattended, what they're not, and how their output gets reviewed before it lands. Built around Claude and OpenAI tooling.
stack:
  - Claude (Anthropic)
  - Claude Code
  - OpenAI
  - GitHub
  - Conventional Commits
tech: claude · openai
role: Author — standards, agent configuration, review process
status: ongoing
featured: true
order: 5
keywords:
  - ai assisted development
  - claude code workflow
  - prompt engineering team
  - ai code review
  - agent guardrails
  - ai dev standards
---

## What it does

A team-level standard for how AI coding agents are used day to day. It covers the boring-but-load-bearing parts: how repos are set up to be agent-friendly, which prompts and skills are reusable, what's allowed without human review, and how AI-generated PRs are evaluated against the same bar as human ones — not a higher one, not a lower one.

## What's in scope

- **Agent configuration** — `CLAUDE.md` and equivalent root-level instructions per repo, including parallel-execution rules, sensitive-file protection, branch hygiene, and commit message conventions.
- **Prompt patterns** — reusable prompts for common tasks (triage, refactor planning, code review, test generation), with explicit success criteria so the agent knows when it's done.
- **Skill libraries** — composable skills for things like Conventional Commits, PR review, debugging, and TDD, plus rules for when each one fires.
- **Review gates** — what an AI-generated change must satisfy before merge: passing CI, no secrets touched, no unrelated drive-by changes, commit messages that read like a human wrote them.
- **Sensitive surfaces** — explicit deny lists (`.env`, credentials directories, customer data) wired into both the agent config and the harness so they're enforced, not aspirational.

## Why it exists

Without standards, every AI-assisted PR is a coin flip — sometimes excellent, sometimes a sprawling mess that touches twelve files for a one-line fix. The goal is to make AI output predictable enough that reviewers can trust the process, not just inspect every diff line by line. The standards aim at:

- **Atomic, reviewable commits** instead of "AI did a thing" mega-PRs.
- **Plain commit messages** with no AI tells, em dashes, or marketing prose.
- **Stable repo conventions** so the same prompt produces broadly the same shape of change next month.
- **Safety by default** — destructive actions, force pushes, and secret access require explicit human approval, not a polite ask.

## Tech rationale

- **Claude Code as the primary agent harness** — strong tool ergonomics, scriptable skills, and a hook system that lets us enforce policy at the harness layer instead of trusting the model to remember.
- **OpenAI for adjacent tooling** — embeddings, evaluation, and lighter inline assists where it's a better fit.
- **GitHub as the integration point** — PRs, reviews, and CI are where the standards bite. Anything below the PR layer is process; the PR is where evidence shows up.

## What I focus on

- Writing the CLAUDE.md / agent rule layer so the right behaviors are the path of least resistance.
- Designing review gates that catch AI-specific failure modes (over-eager refactors, fabricated APIs, sycophantic agreement) without blocking the wins.
- Keeping the standards short enough to actually be read.
