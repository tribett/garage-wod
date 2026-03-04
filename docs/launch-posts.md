# GRGWOD Launch Posts

---

## 1. Reddit, r/crossfit

**Title:** I got tired of paying for workout apps that don't even understand AMRAPs, so I built a free one

**Body:**

I train out of my garage and I've tried probably five different fitness apps over the last couple years. They all have the same problems: they don't understand CrossFit-style workouts, they need an internet connection, or they want $10+/month just to log a workout.

So I built my own. It's called GRGWOD and it's completely free.

You install it from your browser (it's a PWA, so it works like a real app on your phone), and everything runs offline. No account, no subscription, no data leaving your phone.

Here's what it actually does:

- Workout timer with AMRAP, EMOM, For Time, and Tabata modes, with competition-style countdown sounds
- Auto PR detection (it catches PRs and celebrates them for you)
- A 12-week "Return to CrossFit" program built in, or you can build your own
- Standalone WOD logger for daily CrossFit.com WODs or whatever you're programming
- Equipment checklist that tells you what to grab before you start
- Warm-up generator based on the movements in your workout
- Difficulty rating from 1-10 based on your history
- Whiteboard mode for a full-screen display on your garage wall
- Ghost racer so you can pace against your last time on a repeat workout
- Partner WOD mode that tracks work/rest for two people
- Achievement badges and monthly/yearly recaps

The whole thing is open source: https://github.com/tribett/garage-wod

You can try it right now: https://garage-wod.vercel.app

What else would be useful? Genuinely curious what features people actually want.

---

## 2. Reddit, r/homegym

**Title:** Made a free workout tracker app for garage gym training. Works offline, no account, open source.

**Body:**

Most fitness apps assume you're at a commercial gym with a full rack of dumbbells and cable machines. They have no idea what to do with "3 rounds for time" or an EMOM. And they all want $10-15/month.

I built GRGWOD to fix that. It's a mobile app (technically a PWA you install from your browser) that actually understands garage gym training.

Some stuff that might be useful for this crowd:

- Equipment checklist: before you start, it shows you what gear to pull out
- Plate calculator with visual barbell loading and colored plates
- Movement swaps: don't have a rower? It suggests alternatives for whatever equipment you're missing
- Workout timer: AMRAP, EMOM, For Time, Tabata with audio cues
- Auto PR tracking
- Whiteboard mode: big dark-screen display for your gym wall
- Works offline, because who has good wifi in their garage
- Voice logging: say "185 for 5" while you're chalking up

Zero cost. No account. No subscription. Your data stays on your phone. And it's open source if you want to poke around or self-host it.

Try it: https://garage-wod.vercel.app
Source: https://github.com/tribett/garage-wod

Curious what features would actually be useful for your setup.

---

## 3. Reddit, r/reactjs

**Title:** Built a PWA with React 19, strict TypeScript, 605 tests, and zero runtime deps beyond React. Some patterns worth sharing.

**Body:**

I've been building an open-source fitness tracker called GRGWOD and a few of the architectural choices might be interesting to people here.

Stack: React 19 + TypeScript (strict) + Vite 7 + Tailwind CSS v4 + vite-plugin-pwa

Here's what I think is worth talking about:

1. **No runtime deps beyond React.** No state management library, no form library, no date library. Just React, React DOM, and React Router. Everything else uses Web APIs directly (Web Audio, Web Speech, localStorage, Service Workers). It's been totally fine for this scale and I'd do it again.

2. **605 tests with Vitest.** Every feature started as a failing test. I separated all pure logic into standalone modules with no React dependency, which made them trivial to test. The UI components get tested separately with RTL.

3. **`tsc -b` instead of `tsc --noEmit`.** My production build runs `tsc -b && vite build`. This is stricter than what most people do. It catches unused imports (TS6133) that Vitest completely ignores. If you've ever had clean tests but a broken deploy, this is probably why.

4. **Web Audio API for sounds.** Instead of shipping audio files, competition countdown sounds (3-2-1-Go, time cap warnings) are generated with OscillatorNode. The whole sound system is maybe 50 lines of code.

5. **Web Speech API for voice input.** You can say "185 for 5" or "one thirty five" and it parses the weight and reps. Fun problem to solve. One annoyance: TypeScript doesn't have types for SpeechRecognition on window, so you end up casting through `(window as any)`.

6. **Context + localStorage, no Redux.** Three React contexts (Settings, Program, WorkoutLogs) that sync to localStorage. Works fine. I don't miss Redux.

7. **PWA caching gotcha.** Using vite-plugin-pwa with generateSW mode. Everything works offline, which is great. The gotcha: after deploying new code, the old service worker keeps serving cached assets until it updates. Users have to close and reopen the app, or you need an update prompt. Bit me multiple times during testing.

GitHub: https://github.com/tribett/garage-wod
Live: https://garage-wod.vercel.app

Happy to go deeper on any of these if people have questions.

---

## 4. Reddit, r/SideProject

**Title:** I built a free, open-source CrossFit tracker because I got tired of paying for fitness apps

**Body:**

GRGWOD is a workout tracker for CrossFit and garage gym athletes.

I built it because every fitness app I tried either didn't understand CrossFit workouts (AMRAPs, EMOMs, "for time"), needed an internet connection, or wanted $10+/month for stuff that should be free. I train in my garage. I just want to log workouts and track PRs.

How it's different from the paid alternatives:
- Free and open source (MIT)
- Works offline, installs to your phone like a native app
- No account, no backend, no data collection
- Actually understands CrossFit movements and scoring
- Self-hostable with Docker if you're into that

Features I had the most fun building:
- Competition sounds generated with Web Audio (no audio files at all)
- Ghost racer that lets you pace against your previous best
- Equipment checklist that reads your workout and tells you what to grab
- Voice logging where you say "185 for 5" hands-free
- 605 automated tests because I'm that kind of person

Tech: React 19, TypeScript strict, Vite 7, Tailwind v4, PWA

Try it: https://garage-wod.vercel.app
Source: https://github.com/tribett/garage-wod

Would love feedback, especially from anyone who does CrossFit or trains at home.

---

## 5. Hacker News, Show HN

**Title:** Show HN: GRGWOD, an open-source CrossFit tracker. Offline PWA, zero backend

**Body:**

GRGWOD is a workout tracker for CrossFit-style training. Runs entirely in the browser with no backend. All data lives in localStorage.

Live: https://garage-wod.vercel.app
Source: https://github.com/tribett/garage-wod

I built it because fitness apps either don't understand CrossFit programming (AMRAPs, EMOMs, rounds-for-time) or lock basic features behind subscriptions.

Technical details:
- React 19 + TypeScript strict + Vite 7
- Zero runtime deps beyond React/React Router
- 605 tests (Vitest + RTL), strict TDD
- PWA with Workbox, fully offline
- Web Audio API for procedural competition sounds (no audio files)
- Web Speech API for hands-free voice logging
- Docker support for self-hosting

It has a workout timer (5 modes), automatic PR detection, equipment checklist, warm-up generator, difficulty predictor, plate calculator, ghost racer, partner WOD mode, achievements, and monthly/yearly recaps.

Everything runs client-side. No telemetry, no analytics, no accounts. MIT licensed.

---

## 6. Product Hunt

**Tagline:** Free, offline workout tracker for CrossFit athletes. No account needed.

**Description:**

GRGWOD tracks CrossFit-style workouts entirely on your device. No subscription, no backend, no data collection. Open source.

Built for garage gym athletes who want something simple that works without wifi.

What it does:
- Workout timer: AMRAP, EMOM, For Time, Tabata
- Automatic PR detection and tracking
- Equipment checklist and warm-up generator
- Competition countdown sounds
- Ghost racer to pace against your previous best
- Partner WOD mode for two athletes
- Voice logging: say "185 for 5" hands-free
- 12-week built-in training program
- Achievement badges and monthly recaps
- Installs to your home screen, works fully offline

React 19, TypeScript, zero backend. 605 automated tests. MIT licensed.

---

## 7. Twitter/X Thread

**Tweet 1:**
I built a free, open-source CrossFit tracker that works offline and doesn't need an account.

No subscription. No data collection. Installs like a normal app from your browser.

Here's what it does and why I built it:

https://garage-wod.vercel.app

**Tweet 2:**
The problem: fitness apps either don't understand CrossFit (AMRAPs, EMOMs, "for time") or want $10+/month for basic stuff.

I train in my garage. I just want to log workouts and track PRs without paying rent on my own data.

**Tweet 3:**
So I built GRGWOD. It's a PWA, which means you install it from your browser and it works like a real app.

- 5 timer modes (AMRAP, EMOM, For Time, Tabata, Rounds)
- Auto PR detection
- Equipment checklist
- Warm-up generator
- Difficulty predictor (1-10)
- Plate calculator

**Tweet 4:**
Things I had the most fun building:

Competition sounds, all procedural audio via Web Audio API. No audio files.
Ghost racer that paces you against your last time.
Voice logging where you say "185 for 5" and it parses the weight/reps.
Partner WOD mode for tracking two athletes.

**Tweet 5:**
The nerd stuff:

- React 19 + TypeScript strict mode
- 605 automated tests
- Zero runtime deps beyond React
- Fully offline via service worker
- Self-hostable with Docker
- MIT licensed

**Tweet 6:**
Everything runs in your browser. No backend, no database, no analytics.

Your data stays on YOUR device.

Try it: https://garage-wod.vercel.app
Source: https://github.com/tribett/garage-wod

If you do CrossFit or train at home, I'd genuinely love feedback.

#buildinpublic #opensource #crossfit #react #typescript

---

## 8. Dev.to Article

**Title:** I built a CrossFit tracker with 605 tests and zero backend

**Subtitle:** What I learned using React 19, Web Audio, Web Speech, and way too much time on PWA caching

**Outline:**

1. Why I built it (frustration with paid fitness apps that don't get CrossFit)
2. Architecture decisions (why no state library, no backend, no extra deps)
3. The testing story (605 tests, strict TDD, how `tsc -b` catches what Vitest misses)
4. Web Audio for competition sounds and Web Speech for voice logging
5. PWA gotchas (service worker caching almost broke me)
6. What I'd do differently
7. Links and how to contribute

Tags: react, typescript, opensource, webdev

---

## Posting strategy

| Day | Platform | Notes |
|-----|----------|-------|
| Day 1 (Tue/Wed) | r/crossfit + r/homegym | Highest-value audience. Mid-week gets more engagement. |
| Day 1 | Twitter/X thread | Same day for cross-promotion |
| Day 2-3 | Hacker News (Show HN) | Tue-Thu morning EST is the sweet spot |
| Day 3-4 | r/reactjs + r/SideProject | Developer angle, different framing |
| Week 2 | Product Hunt | Tuesday launches tend to do best |
| Week 2-3 | Dev.to article | Long-form for SEO |
| Ongoing | CrossFit Facebook groups | Drop it naturally in relevant threads |

Some things to keep in mind:
- Reply to every comment, especially in the first couple hours. Reddit and HN both reward active threads.
- Don't post to multiple subreddits at the same time. Reddit's spam filter will flag it. Space them out by a few hours.
- On HN, keep the title factual. No hype. Let the project do the talking.
- On Product Hunt, early upvotes matter a lot. Give your friends a heads up before launch day.
