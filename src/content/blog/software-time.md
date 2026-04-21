---
title: Software Engineers Don't Have a Time Problem. We Have a Context-Switching Problem.
description: Engineers don't have a time problem — we have a context-switching problem. How AI tools compress the overhead so the judgment layer gets the time it deserves.
pubDate: 2026-03-24
tags:
  - ai
  - productivity
  - developer-workflow
---

On any given day I'm writing TypeScript, reviewing PRs, debugging Cloud Run deployments, drafting docs, and maintaining a knowledge base. Each switch has a cost. Each cost compounds.

AI tooling doesn't replace my thinking. It compresses the low-leverage parts so I can focus on what actually matters.

## Where AI Fits in My Workflow

**Knowledge management.** I run my second brain on Obsidian with a PARA structure. Claude acts as co-maintainer. I dump messy thoughts in, and it returns structured notes with proper links, metadata, and a filing suggestion. What used to take 20-30 minutes per note now takes under five.

**Code scaffolding.** NestJS modules, Docker configs, GitHub Actions workflows, PostgreSQL migrations, test boilerplate. AI writes the skeleton. I write the logic. I review everything.

**Debugging.** When I hit a wall, especially across Cloud Run to Cloud SQL to external API chains, I feed Claude the error log, relevant code, and what I've tried. It surfaces hypotheses I missed and suggests targeted diagnostics instead of shotgun debugging.

**Documentation.** API docs, runbooks, meeting summaries, blog drafts. Docs that used to take an hour take 15 minutes. More importantly, they actually get written.

**Learning.** I'm ramping on DevSecOps and Machine Learning alongside my core work. AI compresses the loop between "I don't understand this" and "I have a working mental model."

**Task breakdown.** I describe a feature and get back a checklist with subtasks, dependencies, and edge cases. Planning stays thorough without eating into build time.

## What Doesn't Work

**Architectural decisions.** AI lists tradeoffs. The judgment call is still yours.

**Missing context.** It doesn't know your team dynamics, org risk tolerance, or why that service is built the way it is.

**Blind trust.** Every suggestion needs review. Stop reviewing, start accumulating debt.

**Over-prompting.** If you spend more time prompting than thinking, you've inverted the value.

## The Shift

The real gain isn't "I do things faster." It's "I spend time on the right things."

Before AI tools, a chunk of my day went to formatting, scaffolding, structuring, and context-rebuilding. That's overhead, not engineering. Now that overhead is compressed, and the time goes to design decisions, hard debugging, and shipping features.

That's the productivity gain worth talking about.

---

*Drafted with Claude, edited by me, filed in Obsidian where it'll be findable six months from now.*
