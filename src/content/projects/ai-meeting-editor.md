---
name: ai-meeting-editor
title: AI Meeting Editor — Auto-Trim Dead Air
description: AI meeting editor that detects where a discussion really starts and ends, trimming dead air with Whisper, Deepgram, FFmpeg, and PyTorch on AWS.
summary: A media pipeline that takes raw meeting recordings and returns clean cuts with the small talk, setup chatter, and dead air removed. Combines ASR (Whisper / Deepgram), voice-activity detection, and lightweight semantic boundary models to find where the conversation actually starts and ends.
stack:
  - Python
  - OpenAI Whisper
  - Deepgram
  - FFmpeg
  - PyTorch
  - AWS
  - S3
  - Lambda
tech: python · whisper · deepgram · ffmpeg · pytorch · aws
role: Builder — pipeline design, ASR integration, audio processing
status: active
featured: true
order: 4
keywords:
  - ai meeting editor
  - whisper transcription
  - deepgram speech to text
  - voice activity detection
  - ffmpeg audio trimming
  - pytorch audio
  - aws media pipeline
---

## What it does

Drop in a meeting recording — long, messy, with five minutes of "can you hear me?" at the start and a tail of post-meeting chitchat — and get back a trimmed version that begins where the actual conversation begins and ends where it actually ends. No manual scrubbing. No naive silence-only trim that decapitates a sentence because someone paused for breath.

## Pipeline

The processing pipeline is staged so each step does one thing well and intermediate artifacts are cacheable.

1. **Ingest** — raw audio/video uploads land in S3. A trigger normalizes audio (mono, 16kHz PCM) with FFmpeg.
2. **Transcribe** — Whisper for offline batches where cost matters, Deepgram for low-latency paths. Both produce word-level timestamps.
3. **Voice activity detection** — a PyTorch VAD pass marks speech vs. silence at frame resolution, separate from the transcript. This is what distinguishes dead air from a meaningful pause.
4. **Boundary detection** — combine VAD spans with transcript content to find the first and last "substance" moments. A short content classifier filters out greetings, mic checks, and outros so the cut lands on the real start, not the first audible word.
5. **Cut** — FFmpeg trims with stream copy where possible (no re-encode = fast + lossless), re-encoding only when necessary.

## Tech rationale

- **Whisper + Deepgram, not one or the other** — Whisper is great offline and locally controllable; Deepgram wins on streaming and turnaround. The system picks per job based on latency and cost budget.
- **PyTorch VAD over FFmpeg silence detection** — silence detection alone confuses thoughtful pauses with dead air. A learned VAD is dramatically more accurate at the speech/non-speech boundary.
- **FFmpeg as the muscle** — trimming, normalization, and remuxing are FFmpeg's home turf. Doing it natively keeps the pipeline fast and cheap.
- **AWS for the runtime** — S3 for blob storage, Lambda for short steps, larger compute for the GPU-backed steps. Cost-controlled and easy to scale per stage independently.

## What I focus on

- Designing the boundary-detection logic so it gets the obvious cases right and degrades gracefully on the weird ones (long silences mid-meeting, multiple speakers talking over the start).
- Cost shape: choosing the right ASR per job, caching transcripts, and making sure we never re-transcribe the same file twice.
- Operability: observable per-stage timings, retryable steps, and idempotent outputs so a partial failure isn't a full re-run.
