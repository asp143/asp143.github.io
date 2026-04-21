---
title: Secure Your Cloud Build Secrets
description: A field guide to using Secret Manager with Google Cloud Build. How to avoid hardcoded credentials, the YAML setup that works, and the IAM gotchas.
pubDate: 2026-01-31
tags:
  - gcp
  - devops
  - security
---

Let's talk about secrets. No, not the "I still listen to early 2000s pop music" kind. I mean the juicy stuff — API keys, database passwords, service account credentials. The things that make your Cloud Build actually *do* things.

The problem? You need these secrets during your build, but you also need to not accidentally broadcast them to the world. Enter Secret Manager, your new best friend.

### "I'll just hardcode it real quick" — famous last words

We've all been there. It's 4pm on a Friday. You just need to get this deploy working. Surely nobody will notice if you just... put the API key right there in the YAML?

Narrator: *They noticed.*

Here's why hardcoding secrets is a terrible, no-good, very bad idea:

- **Build logs are gossipy** — they'll tell anyone who asks exactly what your secrets are.
- **Git remembers everything** — that "quick fix" is now immortalized in your commit history forever. Congrats, it's a git tattoo.
- **No audit trail** — when something goes wrong (and it will), you'll have zero idea who accessed what.

Secret Manager fixes all of this. It's like a really secure diary for your sensitive data, except it actually keeps secrets instead of leaving itself open on the kitchen table.

### Let's set this thing up

First, create a secret. You can click around in the console if you're feeling fancy, or use `gcloud` like a cool kid:

```bash
echo -n "my-super-secret-value" | gcloud secrets create MY_SECRET --data-file=-
```

Now for the important bit — your Cloud Build service account needs permission to peek at the secret. It's like giving someone the combination to your locker, except way more enterprise-y:

```bash
gcloud secrets add-iam-policy-binding MY_SECRET \
    --member="serviceAccount:PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

### The YAML magic

Here's where it all comes together in your `cloudbuild.yaml`:

```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    entrypoint: 'bash'
    args:
      - '-c'
      - 'docker build --build-arg API_KEY=$$API_KEY -t gcr.io/$PROJECT_ID/my-app .'
    secretEnv: ['API_KEY']

availableSecrets:
  secretManager:
    - versionName: projects/$PROJECT_ID/secrets/MY_SECRET/versions/latest
      env: 'API_KEY'
```

A few things to notice (take notes, there will be a quiz):

- **The `availableSecrets` block** — this is the VIP list. It maps your Secret Manager secrets to environment variables.
- **The `secretEnv` field** — tells the step "hey, you're allowed to use this secret." No permission slip, no secret.
- **The `$$` prefix** — use two dollar signs. One dollar sign is for substitutions. Two is for secrets. I don't make the rules.

### Hard-earned wisdom (aka stuff that broke my builds)

- **Pin your versions in prod** — using `latest` is fine until someone updates the secret and your 3am deployment explodes. Ask me how I know.
- **Rotate secrets like you rotate your tires** — regularly, and before something bad happens.
- **Principle of least privilege** — your build doesn't need access to ALL the secrets. Don't be that person.
- **Substitutions are your friend** — combine them with secrets for that sweet environment flexibility.

### Gotchas that got me

- **IAM is fashionably late** — just added the permission? Cool, wait a minute. Maybe two. Grab a coffee.
- **Case sensitivity is cruel** — `MY_SECRET` and `my_secret` are completely different secrets. GCP doesn't care about your intentions, only your spelling.
- **The secret must actually exist** — this sounds stupid, but I've definitely stared at a failing build wondering why it couldn't find a secret I forgot to create. Multiple times.

### TL;DR

Use Secret Manager with Cloud Build. Yes, it's more work than just slapping your API key in the YAML. But you know what's even more work? Rotating all your credentials at 2am because you accidentally pushed them to a public repo.

Your future self will send you a thank-you card. Or at least won't curse your name.
