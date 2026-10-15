---
title: Redundant, Said the AI Code Reviewer
description: An AI code review flagged a paid-tier gate as redundant. What the model could not see, how CLAUDE.md fixed it, and a checklist before accepting any delete.
pubDate: 2026-10-20
tags:
  - ai
  - developer-workflow
  - engineering
  - craft
  - agents
draft: false
---

A pull request came through on a service that sends payment alerts. The diff touched the send path, and the AI code review came back with a finding: one of the checks before the send was redundant, and the author should remove it.

It read like a good catch. Tight reasoning, pointed at a specific line, with a suggested diff. The kind of comment I would have been happy to write myself.

The check was not redundant. It decided which subscription tier a user had to be on before that alert reached them. Remove it and the alert goes out to the wrong tier. Nobody gets paged, nothing crashes, and customers on a plan that does not include those alerts start getting them, while the ones paying for that coverage learn it was never exclusive.

## Why the AI reviewer was sure

I reread the finding after we caught it. The reviewer was not sloppy. It had read the function and traced the inputs. Given what it could see, the check looked like a second pass over something already filtered upstream.

What it could not see was the tier model. Nothing in the diff said "this is the paid tier gate." Nothing in the repo did either, in a place a reviewer would find on the way to that line. The check was load-bearing for a reason that lived in people's heads and in a plan matrix.

Without that reason, it judged the code by the code. And by the code alone, a check that filters something already filtered is waste.

"Redundant" is not a property of a line. It is a claim about everything else the line interacts with. A reviewer that only has the diff is guessing at that claim, and it will guess with full confidence. The gap is in the map, not the reasoning.

## The dangerous part

A wrong finding that looks wrong costs nothing. You read it, you disagree, you move on.

This one looked right. An author on a busy day accepts it in thirty seconds, because the reviewer sounds sure and the change is a deletion. Deletions feel safe. Less code, same tests passing, one fewer thing to maintain.

The tests did not cover the tier split well enough to fail. Every signal the process checks for would have gone green on a change that quietly broke a product promise. [Reading the diff like a hostile PR](/blog/agentic-engineering-is-not-vibe-coding/) only helps if you know what the diff is supposed to protect.

## What caught it

I wrote earlier about [being a meat proxy](/blog/i-was-a-meat-proxy/), relaying findings I had not understood. This is the mirror of that. The relay was fine. The finding was wrong.

What caught it was a person who knew why the check was there. That does not scale, and it does not show up on a dashboard.

I was reviewing the review, and something about deleting a gate on the send path made me stop. I had a vague memory that tiers were involved, and the finding did not mention tiers at all. A good finding about that line would have had to.

That is the test. When a review recommends removing something, ask whether the finding shows evidence of knowing why the thing was added. If it argues purely from the code, it has not earned the deletion yet.

## What I changed

Two things.

**I asked the developer who opened the PR what the change needed to do.** One question, and the finding stopped holding up. The reviewer had been reviewing a diff. The developer had been solving a problem, and the problem had constraints the diff never stated.

That conversation should have happened before the model ran. The order I use now is: understand the intent from the human, let the reviewer check against it, then read the findings with it in hand. Running the review first and backfilling the intent later is how you end up defending a deletion you never meant to make.

**I wrote the tier model into CLAUDE.md.** Which tiers exist, what each one is entitled to, and which code paths enforce it. A paragraph, ten minutes. I had been assuming the model could infer it, which it could not. The next review on that path will know the gate is a gate.

Context files feel like documentation chores. They are the reviewer's entire model of your business. Anything you leave out, the model fills in with the most generic assumption available, and the most generic assumption about a second filter is that it is redundant.

## A checklist before accepting a "remove this" finding

Before acting on an AI code review finding that says "remove" or "redundant":

- Does the finding show it knows why the code exists, or is it reasoning from the code alone?
- Is there a business rule here that lives outside the repo? If yes, has it been written into the context file?
- Have I asked the author what the change is for, in their words?
- Would the tests fail if the finding is wrong? If not, the green build is not evidence.

The reviewer had a diff, and a diff is not a product. Give it a map, and ask the person who drew it before anyone erases a road.
