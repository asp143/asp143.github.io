---
title: Software Engineer Interviews for the Age of AI
description: Why LeetCode-style interviews miss the signal in 2026, and the take-home plus pair-build format I use to hire engineers who actually ship.
pubDate: 2026-03-28
tags:
  - hiring
  - interviews
  - ai
---

I stopped running traditional engineering interviews last year.

No whiteboard. No LeetCode. No "reverse a linked list from memory while three people watch."

Here's what I do instead, and why it gives me 10x better signal on who can actually do the job.

## The problem

Most engineering interviews are testing for a world that doesn't exist anymore.

You sit a candidate down and ask them to solve an algorithm problem from memory. No IDE, no docs, no Copilot. Then you judge them on whether they write syntactically correct code under pressure in 45 minutes.

In 2026, every serious developer works with AI tools daily. Banning those tools in an interview is like banning power tools on a construction site to find out who's "really" a carpenter.

It tells you something. But not the thing that matters.

The engineers who ace LeetCode-style interviews aren't necessarily the ones who ship well on a team. Interview performance and job performance are drifting apart. If you hire people, that should bother you.

## What actually matters now

AI tools changed what competence looks like.

A strong engineer in 2026 doesn't need to recall binary heap syntax from memory. They need to know when a heap is the right choice, how to verify that the AI-generated implementation is correct, and how to ship it in production with proper edge case handling.

The skill shifted from writing code from memory to thinking clearly about problems and evaluating solutions.

Memorization got less valuable. Judgment got more valuable.

The interview process hasn't caught up.

## What I actually want to know

When I interview someone, I'm answering three questions:

**Can they build?** Can they take a requirement, break it down, make decisions, and produce working software?

**How do they think?** When they hit ambiguity, do they freeze or keep moving? Can they explain why they made a choice, not just what they chose?

**Can I work with them?** Can they take feedback? Push back when they disagree? Communicate clearly enough that I'd trust them in a PR review?

LeetCode doesn't answer any of these. System design rounds measure rehearsed monologues. Behavioral rounds measure storytelling.

None of them tell you what it's actually like to work with someone.

## My format: take-home + walkthrough + pair build

Two stages. Both designed to simulate real work.

**Stage 1: Take-home build**

Small, scoped project. Not a trick problem. A real task close to what they'd do on the team. Clear requirements, reasonable scope, few days to finish.

They can use whatever tools they want. Cursor, Claude, ChatGPT, Copilot, Stack Overflow. I don't care. That's how real work happens.

What I'm evaluating: did they structure the project well? Handle edge cases? Is the code readable, or is it AI slop they didn't bother reviewing? Did they make reasonable architectural choices?

The take-home filters for building competence, not performance anxiety.

**Stage 2: Live walkthrough + pair build**

This is where it gets real.

First half: the candidate walks me through their submission. Not a presentation. A conversation.

Why this structure? What would you change if scope doubled? Where did you lean on AI? What tradeoffs did you weigh?

If someone shipped clean code but can't explain their decisions, that's a red flag. AI did the thinking, they did the copying.

If someone shipped rough code but can walk me through every choice and what they'd improve? Way more interesting.

Second half: we take their submission and build a new feature together. Live. Real editor. Real tools.

This is the highest-signal part of the whole process.

I see how they break down a new requirement on the fly. How they use their tools. Whether they're effective with AI or just paste prompts and hope. How they handle my input. Whether they take feedback or get defensive.

I'm not looking for perfection. I'm looking for how they work.

That's what I'll deal with every day if I hire them.

## Why this works better

This format measures building skill, thinking quality, and collaboration fit.

Nobody fails because they blanked on Dijkstra's algorithm. Nobody passes because they memorized 200 LeetCode problems. Signal goes way up.

It also respects the fact that AI tools are part of the job. Banning them from interviews then expecting candidates to use them on day one doesn't make sense.

And candidates get a better experience. They show real work, explain real thinking, and collaborate live. Better pitch to strong engineers than "solve this puzzle while strangers watch."

## The objections

**"Take-homes are too much work."**
Keep the scope to 4-6 hours. Be explicit about expectations. The alternative is months of LeetCode grinding. The take-home respects their time more.

**"People will just have AI do the whole thing."**
Good. That's part of what you're testing. If they can't explain any of it in the walkthrough, you'll know in 10 minutes. The walkthrough is the filter, not the take-home.

**"This doesn't scale."**
True. It works best when you're hiring selectively. If you need a different top-of-funnel for volume, fine. But for final-round decisions, nothing gives better signal.

**"You can't assess algorithms this way."**
You can, just differently. If the task needs the right data structure, you'll see it. If it doesn't come up naturally, it's probably not relevant to the role.

## For candidates

If you're on the other side of this: the meta shifted.

LeetCode still works at companies running traditional loops. But the places worth working at are starting to evaluate differently.

What matters now: using AI tools effectively without losing your own judgment. Explaining decisions clearly. Collaborating without ego. Building things that work, not just things that pass test cases.

The best thing you can do is build. Ship projects. Have real work you can walk someone through. That counts for more than your contest rating.

Show your thinking. The answer matters less than the reasoning. The code matters less than the judgment behind it.

## Bottom line

The interview process was built for a world where the hard part was writing correct code from memory.

That's not the hard part anymore.

The hard part is knowing what to build, making good calls under ambiguity, using tools well, and working with other humans.

If your process doesn't test those things, you're optimizing for a skill set that's losing value and filtering out people who'd actually do well on the job.

The tools changed. The job changed. The interviews should too.
