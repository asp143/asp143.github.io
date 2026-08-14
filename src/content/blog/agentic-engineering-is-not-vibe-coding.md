---
title: Agentic Engineering Is Not Vibe Coding
description: Same tools, different job. Why Karpathy retired his own term, what the March CVE numbers actually indict, and what a real multi-agent setup looks like at my desk with herdr.
pubDate: 2026-08-14
tags:
  - ai
  - agents
  - engineering
  - developer-workflow
draft: false
---

I called it vibe coding for months. I was wrong, and so was the term.

Andrej Karpathy coined "vibe coding" in 2025. Collins Dictionary made it the 2025 Word of the Year. Then in February 2026, Karpathy himself retired it and proposed a replacement: **agentic engineering**. His framing: 99% of the code isn't written by you — you orchestrate agents and act as oversight.

That is not a rebrand. It is a different job. And the difference is showing up in CVE trackers, not think pieces.

## The bill came due

35 new CVEs in March 2026 were traced directly to AI-generated code. In January it was 6.

Static analysis on AI-generated code shows 40–62% of it contains security flaws. Cross-site scripting gets missed 86% of the time.

Here is the part most commentary gets wrong: vibe coding wasn't the problem. Shipping without review, taste, or ownership was. The model generated the vulnerability, but a human merged it. The bill always comes due — it just took three months to itemize.

The industry data says engineers already know this. 84% of developers use AI coding tools daily. Only 29% trust AI-generated code in production without review. That 55-point gap is the entire argument of this post. Everyone is generating. Few are engineering.

## Two practices, same tools

Vibe coding and agentic engineering run on identical tools. Same Claude Code, same Cursor, same models. The difference is the operator, not the stack.

| | Vibe coding | Agentic engineering |
|---|---|---|
| Prompt | Describe the vibe, accept the output | Specify constraints, interfaces, failure modes |
| Review | Skim, run it, ship it | Read the diff like a hostile PR |
| Tests | Whatever the agent wrote | The contract the agent's output must pass |
| Failure | "The AI made a mistake" | "I merged a mistake" |
| Ownership | Diffused to the model | Never leaves the human |

The one-line version: **in vibe coding the agent is the engineer. In agentic engineering, you are — the agent is the team.**

That's why "engineering" is the right noun. Engineering was never defined by who typed the code. It is defined by who is accountable for it running at 2 AM. Your architecture diagram didn't crash at 2 AM. Your production code did — and an agent wrote it, and your name is on the merge commit.

## What this looks like at my desk

Abstract frameworks are cheap, so here is the concrete version. My daily driver is [herdr](https://herdr.dev), a terminal workspace manager built for running AI coding agents — think tmux, but the unit of organization is a task with an agent attached, not a pile of shells.

The core move is: **one task, one worktree, one agent.**

When a task comes in — a ticket, a bug, a feature — I don't open the repo and start typing. I spin up an isolated workspace:

```bash
herdr worktree create --branch feat/inventory-returns --label "shop-api/inventory-returns"
herdr agent start inventory-returns --kind claude --pane <pane-id>
herdr agent prompt inventory-returns "Implement the returns flow per ticket AN-8177. \
Constraints: no schema changes, reuse the refund service, tests required for the \
partial-return path."
```

Three things happened there, and each one is agentic engineering rather than vibe coding:

1. **The agent got a git worktree, not my working tree.** It can be aggressive on its own branch without touching what I'm doing. Isolation is not paranoia; it's what makes delegation cheap to reverse.
2. **The prompt is a spec, not a vibe.** Ticket ID, constraints, the edge case I care about, the definition of done. The quality of the context determines the quality of every output. This is front-loaded work vibe coding skips.
3. **It runs in the background and my focus stays put.** I'm not watching tokens stream. I'm on the next task.

Because each agent lives in its own worktree, this scales sideways. On a normal day I have three to five agents running in parallel — one on a feature, one on a bug reproduction, one doing a refactor, sometimes a `codex` or `gemini` agent on the same task as a second opinion, since herdr treats agent kinds as pluggable. The navigator pane shows every workspace and what's running in it. It looks less like an editor session and more like a very small engineering team's standup board.

Then comes the part that makes it engineering: **the merge queue is me.**

```bash
herdr agent read inventory-returns --source recent-unwrapped --lines 120
```

I read what the agent did, then I read the diff the way I'd read a PR from a new hire — line by line, hostile by default. Some diffs get merged. Some get a follow-up prompt. Some get thrown away with the worktree, which cost me nothing, because the worktree was the blast radius.

Notice what the multi-agent setup did to my job description. I write almost none of the code. I write task decompositions, constraints, and review verdicts. Karpathy's 99% number sounds radical until you run this for a month and realize the human bottleneck was never generation. It was review. Parallel agents don't remove that bottleneck — they make it the whole job.

## The job is three verbs

**Orchestrate.** Decompose work into tasks an agent can hold end-to-end, each with engineered context — specs, constraints, examples, the boring edge cases. One worktree per task keeps decomposition honest: if you can't name the branch, the task isn't scoped.

**Review.** Benchmarks tell you what a model can attempt; the diff tells you what you can hand off. When Opus 4.7 jumped to 87.6% on SWE-bench Verified, the seven points weren't the story — the cohort of tasks you can delegate without re-reading every line was. But that cohort is earned per-codebase, through review, not assumed from a leaderboard.

**Own.** No senior engineer gets to say "my junior wrote it" when prod goes down. Same rule. The agent has no pager. You do.

There's a supporting shift underneath this: the ecosystem is quietly rebuilding the guardrails. Astral shipped `ty`, a Rust-based Python type checker. TypeScript 6.0 landed. Two of the biggest dynamic-language communities investing in stricter checking precisely as the share of human-read code drops. The type system is becoming the contract the agent's output gets checked against — machine-verifiable review, because human eyeballs no longer scale to the volume of generated code.

## A simple test

Strip the labels and run this instead:

1. **Could you defend every line in the diff to a reviewer?** Not "the agent chose this" — you, with reasons.
2. **Does anything block a bad diff besides your mood?** Tests, types, CI, a security pass. If the only gate is vibes, the name still fits.
3. **When it breaks, whose fault is it?** If your honest answer involves the model, you're vibe coding with extra steps.

Three yeses and you're doing agentic engineering, whatever tool you use. Anything less and the March CVE tracker is your trajectory.

## The objection

"This is gatekeeping. Vibe coding lets non-engineers build things."

For prototypes, demos, and personal tools — completely true, and genuinely good. Vibe code your weekend project. I do.

The line is production. The moment real users, real data, or real money touch the output, the practice has to change even if the tool doesn't. The 35 CVEs weren't prototypes. They shipped.

---

The terminology shift matters because names set expectations. "Vibe coding" promised that judgment was optional. "Agentic engineering" puts it back where it always was.

The shift was never the typing speed. It was the job description.
