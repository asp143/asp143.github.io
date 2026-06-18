---
title: Most "Learning in Public" Is Just Performing in Public
description: Learning isn't the notes. It's the changed behavior. A look at why second brains and TIL threads so often become productive procrastination — and the one test that cuts through it.
pubDate: 2026-06-18
tags:
  - learning
  - productivity
  - developer-workflow
---

The best engineers I know learn something and then build with it. The worst have a 47-part thread about their "learning journey" and nothing in production.

Somewhere along the way, learning in public mutated into performing in public. The original idea was good: share what you learn, build in the open, let others benefit. Then it became a genre. People curate vaults, post daily TILs, and maintain public dashboards of their "learning roadmap" — and ship nothing. The map became the territory.

I know this because I did it.

## The system that taught me nothing

I spent months building the perfect DevSecOps learning setup. Color-coded notes. Spaced repetition. A dashboard tracking completion across twelve security domains. It was genuinely beautiful.

Then a coworker who read the OWASP Top 10 over lunch found a real auth bypass in our staging environment. No system. No dashboard. He read the thing and applied it.

That's the gap. Learning is not the notes — it's the changed behavior. Did you catch a vulnerability you would have missed last month? Did you design something differently because of what you studied? Can you do something today you couldn't do last week?

If yes, you learned. If no, you were organizing.

## The one test

Swizec borrows a line from *Moneyball*: "Does he get on base?" Everything else — the scouting reports, the gut feel, the highlight reel — is noise around that single question.

The version for learning is just as blunt: **Can you do something you couldn't do before?**

Not "did you take notes on it." Not "did you highlight the textbook." Not "did you post about it." Can you do the thing, yes or no.

I've been picking up machine learning on the side. I could show you my notes — clean, linked, structured. Or I could show you the one janky model I shipped that does something real for actual users. Only one of those counts, and it isn't the notes.

## Your second brain is a filing cabinet

It's worth saying plainly: a second brain is not a brain. It's storage. Storage doesn't think.

The person who reads one chapter and builds a project learns more than the person who reads the whole book and writes comprehensive notes. The builder hits errors, debugs, makes tradeoffs, and runs straight into the gap between theory and production. That collision is where learning actually happens. Notes are an output. The new capability is the outcome, and they are not the same thing.

The pattern repeats everywhere:

- A twelve-week DevSecOps plan, versus the coworker who read OWASP and found a bug.
- A course's worth of ML notes, versus one model that runs in prod.
- A flawless spaced-repetition deck, versus the engineer who just builds something every weekend.
- Ten blog posts about Kubernetes, versus deploying one broken service and fixing it.

## Notes aren't the enemy

This isn't an argument against writing things down. Documentation matters, and I still keep a vault — I drafted this post in it. The point is that notes serve the work; they are not the work.

There's a healthy version of doing this in public and an empty one, and they're easy to tell apart:

> Good: "I built X. Here's what broke and what I learned."
>
> Empty: "Day 47 of my learning journey. Today I reorganized my Anki cards."

The first is a byproduct of doing something. The second is the something. If your system helps you build faster, keep it. If your system *is* the thing you're building, you're procrastinating with extra steps.

## Ship something, break something, fix it

A vault with 400 linked notes about TypeScript generics is not learning. Writing one generic utility type that solves a real problem in your codebase is.

Outcomes over outputs. Always.

So here's the only question worth asking at the end of the week. Not what did you study, not what did you organize, not what did you post about.

What did you ship?
