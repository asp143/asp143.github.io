---
title: I Set Up AI Agents to Build Features for My Projects — Here's What Happened
description: One week running PaperclipAI, Hermes, and Slack-native agents across my projects. What worked, what didn't, and what I'm still watching.
pubDate: 2026-04-03
tags:
  - ai
  - agents
  - developer-workflow
---

## The Setup

I wanted to see if I could get AI agents to do real development work — not just answer questions in a chat window, but actually analyze codebases, create tickets, and eventually ship features. Not a toy experiment. Real projects, real code.

The stack:

- **PaperclipAI** — the agent platform. Think of it as OpenClaw but for teams. You point it at your repos and it spawns agents that can reason about your codebase and take action.
- **Hermes** — the automation engine powering PaperclipAI. Handles orchestration, memory, and the self-learning loop.
- **Slack** — the interface. I talk to the agents in Slack like I'd talk to a teammate. No dashboards, no separate UI. Just messages.

The goal: set up PaperclipAI, connect it to my projects, and have agents start creating tickets and working on features autonomously.

---

## Why This Stack

I'd been looking at agent platforms for a while. Most of them fall into two camps: either they're glorified chatbots with a "run code" button, or they're enterprise tools that take weeks to configure and require you to hand over access to everything before you see any value.

PaperclipAI sits in a different spot. It's open-source, team-oriented, and designed to work with your existing codebase. You give it repo access, define what you want the agents to focus on, and it starts working.

Hermes is what makes it actually useful. It powers the reasoning and orchestration layer — the agents don't just execute one-shot tasks. They maintain context across sessions, learn from previous work, and update their own understanding of the codebase over time. Self-learning, self-updating.

Slack was the obvious choice for the interface. I already live in Slack. Adding another dashboard to check would've killed the workflow. Instead, I just message the agent, it responds, and I approve or redirect. Low friction.

---

## What I Did

### 1. Connected the repos

Pointed PaperclipAI at the repos I wanted agents to work on. Standard setup — repo access, branch permissions, basic config for what the agents should and shouldn't touch.

### 2. Configured Hermes

Set up Hermes as the backend engine. This is where the self-learning behavior comes from. Hermes maintains a knowledge graph of the codebase — it maps out services, dependencies, patterns, and conventions. Every time an agent completes a task, Hermes updates its model of the project.

### 3. Wired up Slack

Connected the Slack integration so I could interact with agents via DM. The flow is simple: I describe what I want in natural language, the agent reasons about it, and then either asks clarifying questions or proposes a plan. I approve, it executes.

---

## Early Results

It's early — I've been running this for about a week. So far:

**The agents created 2 tickets autonomously.** Not placeholder tickets. Actual feature specs and task breakdowns with context pulled from the codebase. They analyzed the existing code, identified what was needed, and wrote tickets that a developer could pick up and work on.

One was a feature spec — the agent identified a gap in the current implementation, reasoned about what the fix should look like based on existing patterns in the codebase, and wrote up the ticket with acceptance criteria.

The other was a task breakdown — a larger piece of work that the agent decomposed into subtasks with dependencies mapped out.

**The self-learning loop is real.** After the first ticket, the second one was noticeably better. The agent had learned from the codebase analysis it did for ticket #1 and applied that context to ticket #2. It referenced conventions it had picked up, avoided patterns it had seen deprecated in the codebase, and structured the ticket in a way that matched how existing tickets were written.

**Slack as the interface works.** There's something about being able to just message an agent like a teammate that makes the feedback loop much faster. I can redirect, approve, or ask for changes in seconds. No context switching.

---

## What I'm Watching

This is week one. The results are promising but I'm not declaring victory. A few things I'm tracking:

**Ticket quality over time.** Two tickets is a small sample. I want to see if the self-learning actually compounds or if it plateaus. Does ticket #10 meaningfully beat ticket #3?

**Autonomy vs. oversight.** Right now I'm reviewing everything before it goes anywhere. The question is whether these agents can eventually be trusted to create and assign tickets with minimal supervision. That's a different level of trust than "create a draft for me to review."

**Hermes memory management.** Self-updating knowledge is powerful until it isn't. If Hermes picks up a bad pattern and propagates it, that's a problem. I need to understand how to audit and correct its model of the codebase.

**Cost.** Running agents isn't free. The compute cost of having Hermes analyze repos, maintain context, and power multi-step reasoning adds up. I haven't done the math yet on whether this is cheaper than just doing the work myself for a solo developer or small team.

---

## Honest Take

PaperclipAI is essentially OpenClaw but for teams. If you're a solo dev, you might not need it — OpenClaw or similar tools might get you 80% of the way there. The value of PaperclipAI is when you have multiple projects, want agents that maintain long-term context, and want the Slack-native workflow.

Hermes is the differentiator. The self-learning, self-updating behavior is what makes this more than a fancy wrapper around an LLM. It's still early and I need to see how it scales, but the foundation is solid.

The biggest risk is over-trusting the output. These agents create plausible-looking tickets. That doesn't mean they're correct. You still need a human reviewing the work, at least at this stage.
