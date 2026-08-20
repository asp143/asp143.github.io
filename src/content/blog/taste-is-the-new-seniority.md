---
title: Taste Is the New Seniority
description: AI made software output cheap. The scarce engineering skill now is taste — knowing what good looks like, what to reject, and whose judgment teams can trust.
pubDate: 2026-08-21
tags:
  - ai
  - career
  - engineering
  - developer-workflow
draft: true
---

Two pull requests land in my review queue. Both pass CI. Both are idiomatic, consistently styled, structurally tidy.

One came from an engineer who read every line their agent produced, rejected half of it, and reshaped the rest. The other came from an engineer who typed a prompt and hit merge request.

You cannot tell which is which from the diff. That is the new problem. And it is quietly rewriting what seniority means.

For twenty years, the career ladder measured one thing: can this person reliably produce working software at increasing scale? AI broke that. Output is now cheap. What is scarce is knowing what good looks like, and having the nerve to reject work that merely looks good.

That is taste. And taste is becoming the thing that actually gets people leveled, hired, and trusted.

---

## The Ladder Was an Output Ladder

Every leveling rubric written before 2024 measured flavors of output: scope, complexity, velocity. That made sense when output was expensive. Producing correct code took years, so production implied everything underneath it.

Then output stopped being expensive. The largest empirical study to date, [covering 4.2 million developers, found AI now authors about 27% of production code](https://www.secondtalent.com/resources/how-much-software-written-by-ai/). [Adoption sits at 84% of developers](https://adtmag.com/blogs/watersworks/2026/01/stack-overflow-survey.aspx).

Here is the number that matters more: [only 3% highly trust what the tools produce](https://byteiota.com/stack-overflow-dev-survey-2026-ai-at-84-trust-at-3/). And 66% report spending more time fixing "almost right" code than they would have spent writing it themselves.

Read those together. Everyone can produce. Almost no one trusts the production. The bottleneck moved from generation to evaluation, and the ladder has not caught up.

---

## What Taste Actually Is

Not aesthetics. Taste in engineering has three components.

**Calibration.** Knowing what good looks like before you see it. It is what lets you glance at a diff and feel something is off before you can articulate why.

**Context.** Knowing what matters here, specifically. Which shortcuts are fine in this service and fatal in that one. Which abstractions the team can maintain and which will rot.

**Nerve.** The willingness to say no to work that looks finished. Rejecting a green-CI, plausible PR costs social capital. Rubber-stamping it costs nothing today. Taste without nerve is just private discomfort.

[Taste got valuable](https://www.aibuilderclub.com/blog/loop-engineering-guide-2026) because AI attacks exactly the signals we used to shortcut evaluation. [AI code fails in ways that look like competence](https://www.faros.ai/blog/ai-code-quality-senior-engineer-review-burden): idiomatic even when the logic is wrong. The tidier the diff, the less the tidiness tells you.

---

## From My Desk: Reviewing the Flood

I review AI-generated code every day. The volume went up. The signal per line went down.

<!-- TODO: STORY PLACEHOLDER — caught-bug example
Insert 1-2 concrete stories: an AI-generated PR that looked clean but had a subtle bug. What tipped you off, what it would have cost.
-->

After a month of reading someone's AI-assisted PRs, I can sort them into two groups. Not by code quality. By *rejection evidence*.

Engineers I trust leave fingerprints of judgment: dead ends abandoned in the history, PR descriptions noting what the agent got wrong, diffs visibly smaller than the first draft was.

Engineers I babysit ship everything the model emitted. The code is fine until it is not, and then they cannot explain it, because they never owned it. The first group exercises taste on every merge. The second launders the model's confidence into their own.

---

## The Interview Is Broken Too

I wrote before about [how interviews need to change](/blog/software-engineer-interviews/), and this is where it bites. Leetcode measured whether you could produce correct code under pressure. That thing got cheap, so the signal died.

If I am hiring for taste, the interview inverts. I do not ask you to write code. I hand you code and ask what is wrong with it.

Give a candidate a plausible AI-generated solution with a correctness bug and an architectural flaw. Weak candidates review the style. The strongest find the architectural flaw, explain what it will cost later, and also tell you what the code gets right. That is calibration in both directions.

<!-- TODO: STORY PLACEHOLDER — interview shift
Insert how your interviewing changed: a question you retired, one you added, or an anonymized candidate story where evaluation ability separated two equals.
-->

The data backs the shift: [40% of developers with under ten years of experience say reviewing AI code takes more effort than reviewing human code](https://www.sonarsource.com/state-of-code-developer-survey-report.pdf). Evaluation is a skill with a years-long curve. That is exactly what a hiring signal should look like.

---

## How I Level Engineers Now

Three years ago I weighed scope and delivery. Could they own a bigger surface, ship without hand-holding?

<!-- TODO: STORY PLACEHOLDER — leveling change
Insert tech-lead specifics: what you look at now (review comments? incident behavior? pushback?). One before/after of a promotion signal that changed.
-->

Today the question I actually ask is: **whose "no" do I trust?**

When this person blocks a PR or kills a feature, does the team get it right more often? That is the promotion signal. Delivery is table stakes when everyone has an agent fleet. Differentiation lives in the calls: what to build, what to ship, what to kill.

You can no longer out-produce your way to senior. A mid-level engineer with a good agent setup out-produces the 2021 version of a staff engineer. The levels have to measure evaluation, because evaluation is what is left.

---

## The Honest Part

Here is the uncomfortable loop. Taste comes from reps. My calibration exists because I wrote thousands of functions, shipped hundreds of mistakes, and got paged for the worst of them. The scar tissue is the skill. And AI now does the reps.

The industry already ran this experiment: companies that stopped hiring juniors in 2023-2024 mostly walked it back, because they had cut off their own supply of future seniors.

I do not have a complete answer. I have a direction: if the reps do not happen naturally, they have to be designed. Read diffs adversarially. Predict what the agent will produce, then score yourself. Do some things the slow way on purpose. That deserves its own post.

What I know is this: output compounds linearly, and everyone's output curve just flattened into the same line. [Judgment compounds on itself](https://newsletter.pragmaticengineer.com/p/the-impact-of-ai-on-software-engineers-2026), because every good call earns you a harder call.

The engineers who get ahead in the next five years will not be the ones who generate the most. Everyone generates. They will be the ones whose approval means something.

*When was the last time you rejected work that passed every check? If you cannot remember, is that because the work was good, or because you stopped looking?*

---

**Related:** [How to Become AI Native](/blog/how-to-become-ai-native/) · [Software Engineer Interviews for the Age of AI](/blog/software-engineer-interviews/) · [What Is a Tech Lead](/blog/what-is-a-tech-lead/) · [Agentic Engineering Is Not Vibe Coding](/blog/agentic-engineering-is-not-vibe-coding/)
