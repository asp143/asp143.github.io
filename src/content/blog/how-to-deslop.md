---
title: How to Deslop
description: Slop is a review problem, not a generation problem. A repeatable pass for cleaning AI defaults out of your writing and your code, with before-and-after examples for both.
pubDate: 2026-09-01
tags:
  - ai
  - writing
  - engineering
  - developer-workflow
  - taste
draft: false
---

The model doesn't write slop. It writes a plausible default, and then nobody edits it. That's the whole problem.

Slop is output no human chose. The sentences are grammatical. The code runs. But every word and every line is the model's first guess, shipped without anyone deciding it should exist. You can feel it when you read it. You just can't always name what's wrong, so you let it through.

Naming it is the job. Below is the pass I run on anything an agent hands me, prose or code. It's the same instinct both times: assume the default is padding until it earns its place.

## Slop has tells

You deslop by recognizing patterns, not by rewriting from scratch. Learn the tells and the work becomes mechanical. Here are the ones that catch the most.

### Prose

**Throat-clearing intros.** The model warms up before it says anything.

> In today's fast-paced digital landscape, understanding how to communicate effectively is more important than ever.

Cut the warm-up. Start at the first real claim.

> Most writing advice ignores the reader's time. Here's what doesn't.

**Hedging.** "It's worth noting," "it's important to remember," "one could argue." These announce a point instead of making it. Delete the announcement and keep the point.

> It's worth noting that shorter sentences are often easier to read.

becomes

> Shorter sentences read easier.

**Forced balance.** The model is trained to sound fair, so it manufactures a second side for claims that don't have one.

> While there are many benefits to code review, it also has some drawbacks worth considering.

If the drawbacks matter, name them. If they're filler, cut the whole sentence. Fake balance is just a longer way to say nothing.

**Filler adjectives.** "Powerful," "robust," "seamless," "comprehensive," "cutting-edge." They describe nothing. Test each one by deleting it. If the sentence means the same, it was slop.

**Listicle padding.** A five-item list where two items carry the weight and three restate them in new words. Keep the two.

**The em-dash habit.** The model uses em-dashes as universal connective tissue because they always parse. Real writers use them rarely and on purpose. When every third sentence has one holding two clauses together, that's a default, not a choice. Convert most of them to periods and watch the writing get firmer.

### Code

**Abstraction you don't need yet.** The agent builds a `StrategyFactory` for the one strategy that exists. It writes a config system for a value used once. Speculative generality is slop with good posture. Inline it until a second caller actually shows up.

**Scaffolding nothing calls.** Helper functions used in zero places. Exports nobody imports. An `interface` implemented once. Grep for the usage. If there's one call site, the abstraction is decoration.

**Comments that restate the code.**

```js
// increment the counter by one
counter += 1;
```

The comment costs a line and earns nothing. Delete it. Keep comments that explain *why*, never *what*.

**"Just in case" parameters.** A function that takes `options = {}` and reads one key. A method with a `deprecated` flag on day one. The model hedges against futures that will never arrive. Take the argument the code actually uses.

**Defensive checks for impossible cases.** Null guards on a value the type system guarantees. A `try/catch` around code that can't throw. This noise reads as caution but it hides the real invariants. Trust your types and delete the theater.

**Dependencies nobody read.** The agent reaches for a package to do what four lines of standard library would. Every dependency is a thing you now maintain, audit, and update. If you didn't read it, you didn't choose it.

## The move underneath all of it

Every tell above collapses into one instruction: **cut before you add, and own every line or delete it.**

Slop is what survives when nobody applies that rule. The model generates in one direction, always adding, because adding is what it was trained to do. Deslopping is the opposite motion. You go through and subtract until only the deliberate parts remain.

This is why deslopping feels like editing and not writing. You're not producing. You're deciding. And deciding is the part no model does for you, which is exactly why it's the part worth doing.

## The checklist

Run this on anything an agent hands you before it goes out.

**Prose**

- Does it start at the point, or warm up first? Cut the warm-up.
- Any "it's worth noting" / "it's important to" hedges? Delete them, keep the claim.
- Any manufactured both-sides balance? Cut it or commit to it.
- Delete every adjective. Restore only the ones the sentence misses.
- Any list item that restates another? Merge them.
- Are em-dashes doing structural work? Convert most to periods.

**Code**

- Any abstraction with one caller? Inline it.
- Any function, export, or interface used zero times? Delete it.
- Any comment that restates the code? Delete it.
- Any parameter or flag the code doesn't use yet? Remove it.
- Any guard for a case the types rule out? Remove it.
- Any dependency you didn't read? Replace or justify it.

None of this is about catching the model. The model did its job. Deslopping is you doing yours: choosing what stays. Output is cheap now. Judgment is the whole game, and judgment is subtraction.
