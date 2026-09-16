---
title: I Was a Meat Proxy
description: My PR review comments were accurate and unreadable, because I was relaying model output instead of understanding it first. Correct is not the bar.
pubDate: 2026-09-16
tags:
  - ai
  - developer-workflow
  - engineering
  - craft
draft: false
---

Here is what I was doing on pull requests. An agent reads the diff, produces its findings, and I move the good ones into the review thread. Fast. Accurate. Nothing ever broke because of it.

The comments were still bad.

## The tell

They read too technical. Not wrong, not sloppy, just pitched at a level nobody on the thread had asked for. The author would come back with a question about the comment before they could even start on the code. That question is the tell. If someone has to decode your review before they can act on it, you have not reviewed anything. You have forwarded a document and attached your name.

What I had actually done was move the reading downstream. The model produced something dense, I skimmed it, decided it looked right, and made the author do the part I skipped.

Niklas Gruhn has a name for this: [don't be a meat proxy](https://gruhn.me/blog/2026-08-03/). A human sitting between a question and a model, adding latency and nothing else. Reading that post is what made me notice I was doing it.

## Correct is cheap

The reason this behavior survives is that the output is usually right. So the obvious defense holds up: the finding was real, the fix was needed, the comment was accurate. All true, and none of it is the job.

A review comment is not information delivery. It is asking a specific person to change something they wrote, and that only works if they understand why. Accuracy gets you a correct sentence. It does not get you a change. Understanding does, because understanding is what lets you pitch the sentence at the person reading it.

When I relayed, I could not pitch anything. I did not know which part of the finding mattered most, so I sent all of it. I did not know the simple version, so I sent the technical one. Verbosity in a review comment is not thoroughness. It is a confession that you have not decided what the point is.

## The part that actually worried me

Accountability follows explanation. If I can explain a comment, I own it. If I cannot, the thread finds out the moment someone pushes back, and the honest answer is "that is what the tool said."

That answer moves the work to the author while keeping the authority with me. I get to block a PR on reasoning I have not done. The author gets to argue with a position nobody in the conversation actually holds. Everything about that is backwards, and it was invisible while the findings kept being correct.

This is the same failure as shipping code you did not read, except review is where that failure is supposed to get caught. A reviewer running on relay is a hole in the exact place the process assumes there is a person.

## What I do now

Understand first, then ship. The whole change is that one reordering.

The test is simple. Close the tab. Say the comment out loud in my own words. If I cannot, I do not send it, because I do not know it yet. Sometimes that means ten more minutes reading the code the finding points at. Sometimes it means I read it and drop the comment entirely, because once I understood it, it was not worth the author's time.

That second outcome happens more than I expected. A good chunk of what I used to forward did not deserve to be in the thread at all. Relaying had no filter in it. Understanding is the filter.

## The checklist

Before a review comment goes out:

- Can I say this without the tool's output in front of me? If no, I do not understand it yet.
- Do I know which line in the diff this is about, and why it matters there specifically?
- Is this the simplest version of the point, or the first version I was handed?
- Would I still raise this if I had found it myself reading the code?
- If the author pushes back, do I have an answer that is not "the tool said so"?
- Is the comment shorter than the thing it is asking for? If not, cut it.

None of these are about catching the model. The model found a real issue. They are about whether a person is still in the loop by the time it reaches another person.

Output was never the scarce thing in code review. The scarce thing is someone who read it, decided what mattered, and is willing to defend that in the thread. That part does not transfer. If I hand it off, there is nobody left doing review, just two people and a model taking turns.
