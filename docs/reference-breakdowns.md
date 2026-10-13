# How premium launch films are built: a frame-level study of 16 films

This is a study of 16 official launch and product films (Apple, Linear ×2, Stripe ×2, OpenAI, Vercel, Raycast, The Browser Company, Framer, Figma, Notion, Attio, Ramp, Rippling, Retool). Each film was downloaded, split into frames at 2 fps, viewed as timecoded contact sheets, cut-detected and measured for loudness. The aim is to get rules we can turn into code for the Rilin film.

## How to read this document

- **Seen** means I looked at it on the contact sheets. Those sheets sample every 0.5 s, so anything shorter than about 0.5 s can be missed, and camera moves are worked out from how the image changes between frames.
- **Measured** means a number from ffmpeg or librosa. Timecodes are in seconds.
- **(assumption)** marks anything I did not see or measure. In particular, **I could not listen to the audio.** Everything about music comes from measurement: tempo estimates, loudness envelopes, transients and silences. Genre and voice-over are therefore marked as inferred.

### Method and tools

- Downloads: `yt-dlp` 2026.08.19, official channel uploads only, at 720p or below. The media are kept as untrusted data in a separate scratch folder.
- ffmpeg: the Remotion-bundled binary (`@remotion/compositor-darwin-arm64`, n7.1) is built with `--disable-filters` and has no `select`, `tile`, `showinfo` or `astats`. So the analysis used the full ffmpeg 7.1 static build from `imageio-ffmpeg` in the venv. The project was not touched.
- Frames: `fps=2,scale=384:-2`. Contact sheets are 6×5 tiles (15 s per sheet) with a burned-in timecode.
- Cuts: per-frame `scene` scores from `select='gte(scene,0)',metadata=print`.
  - A plain `gt(scene,0.3)` threshold misses most cuts in dark motion-graphics films. Linear Releases gave 0 cuts at 0.3, but 5 real cuts were visible.
  - So a frame counts as a cut when its score is above 0.3, **or** above 0.03 and at least 8× the median of its ±0.5 s neighbours. These adaptive cuts were checked by eye on Linear Releases and Linear Agent.
  - Fades and in-shot morphs are **not** counted as cuts. In motion-graphics films the hard-cut count therefore understates how often the picture changes, so I also report a "visual change rate".
- Visual change rate: the mean absolute luma difference between frames 0.5 s apart, on a 96×54 grid. A step counts as a change above 6/255 and as near-static below 1.5/255.
- Audio, all with librosa on 22.05 kHz mono:
  - RMS loudness per 0.5 s and per 5 s (dBFS).
  - "Jumps": the next 100 ms is ≥ 9 dB louder or quieter than the previous 400 ms. Each jump is reported with its offset to the nearest cut.
  - `beat_track` for tempo. Beat trackers often report double or half the true tempo, so read BPM as ±2×.
  - The share of cuts within 80 ms of a tracked beat or onset, compared with a random baseline of 500 random times.
  - HPSS percussive-energy ratio (≥ 0.4 means drum-driven; ≤ 0.05 means essentially no drums) and median spectral centroid.
  - A voice-activity detector (webrtcvad) was tried. It fired on music in every film, so it was discarded. Voice-over presence is inferred only from what is on screen, such as lower thirds and on-camera speakers.

Contact sheets (2–3 per film) are in `docs/refs/<film-slug>/sheet_NN.jpg`. Sheet NN covers (NN−1)×15 s to NN×15 s.

---

## The corpus at a glance (measured)

| Film | Length | Hard cuts → shots | Mean / median shot | Min / max | Shots <1 s | Visual changes per 10 s | Near-static 0.5 s steps | Tempo est. | Cuts on beat vs random | Percussive ratio |
|---|---|---|---|---|---|---|---|---|---|---|
| Apple: MacBook Pro M5 Pro/Max | 100.2 s | 81 | 1.24 / 0.83 | 0.25 / 5.06 | 59% | 17.5 | 8% | 152 | 0.44 vs 0.38 | 0.17 |
| Linear: Introducing Linear Agent | 54.9 s | 10 | 5.49 / 5.31 | 3.05 / 8.20 | 0% | 2.7 | 42% | 144 | 0.00 vs 0.09 | 0.02 |
| Linear: Introducing Linear Releases | 30.1 s | 6 | 5.01 / 4.72 | 3.57 / 6.50 | 0% | 5.7 | 20% | 112 | 0.20 vs 0.25 | 0.13 |
| Stripe: Sessions 2024 (recap) | 108.9 s | 92 | 1.18 / 1.00 | 0.25 / 3.38 | 49% | 16.0 | 2% | 152 | 0.40 vs 0.35 | 0.50 |
| Stripe: Introducing Reader S700 | 74.1 s | 66 | 1.12 / 0.90 | 0.04 / 4.40 | 55% | 14.5 | 6% | 123 | 0.28 vs 0.32 | 0.52 |
| OpenAI: Say hello to GPT-4o | 82.3 s | 3 | 27.4 / 17.5 | 2.74 / 62.1 | 0% | 1.7 | 82% | n/a | n/a | 0.67 |
| Vercel: Ship 2024 | 35.9 s | 14 | 2.57 / 1.33 | 0.27 / 16.0 | 36% | 9.7 | 46% | 112 | 0.23 vs 0.19 | 0.24 |
| Raycast: New Raycast, Coming 2026 | 38.6 s | 17 | 2.27 / 1.73 | 0.40 / 10.3 | 24% | 7.8 | 43% | 129 | **0.50 vs 0.17** | 0.02 |
| The Browser Company: Dia | 77.8 s | 56 | 1.39 / 1.19 | 0.04 / 4.46 | 39% | 13.7 | 11% | 172 | 0.44 vs 0.42 | 0.37 |
| Framer: Framer for Enterprise | 47.4 s | 23 | 2.06 / 1.96 | 0.46 / 5.68 | 30% | 11.8 | 16% | 103 | 0.18 vs 0.27 | 0.48 |
| Figma: All the launches at Config 2025 | 81.2 s | 128 | 0.63 / 0.46 | 0.33 / 4.10 | 84% | 16.0 | 7% | 129 | 0.24 vs 0.28 | 0.60 |
| Notion: Introducing Notion 3.0 Agents | 90.1 s | 39 | 2.31 / 1.62 | 0.29 / 10.7 | 23% | 5.7 | **54%** | 123 | **0.42 vs 0.29** | 0.44 |
| Attio: Introducing Ask Attio | 46.8 s | 7 | 6.69 / 4.70 | 0.27 / 17.9 | 14% | 1.1 | 67% | 129 | **0.50 vs 0.23** | 0.03 |
| Ramp: Introducing Stack | 67.4 s | 15 | 4.49 / 3.43 | 0.30 / 11.2 | 7% | 6.7 | 46% | 144 | **0.57 vs 0.32** | 0.54 |
| Rippling: Introducing Rippling AI | 60.1 s | 33 | 1.82 / 1.30 | 0.40 / 7.57 | 33% | 13.5 | 0% | 117 | 0.28 vs 0.29 | 0.25 |
| Retool: Build Anything, Govern Everything | 55.3 s | 7 | 7.89 / 3.71 | 0.62 / 24.7 | 14% | 7.8 | 18% | 161 | **0.67 vs 0.37** | 0.36 |

Two editing regimes show up clearly.

- **Product-UI films** (Linear, Attio, Ramp, Retool, Raycast, Notion, Vercel; Framer and Rippling sit between): median shot 1.3–5.3 s. Change happens *inside* the shot through morphs, word swaps, typing and camera drift, and 42–67% of 0.5 s steps are near-static, so the UI can be read.
- **Live-action or montage films** (Apple, Stripe ×2, Dia, Figma): median shot 0.46–1.19 s, with 39–84% of shots under 1 s.

---

# Part A: Product-UI films

## 1. Linear: "Introducing Linear Agent"

- URL: https://www.youtube.com/watch?v=mRql2VJ99gM
- Length 54.9 s · 10 shots · mean 5.49 s, median 5.31 s, min 3.05 s, max 8.20 s.
- Sheets: `refs/linear-agent/sheet_01–03.jpg`

| Time | On screen (seen) | Camera | How the UI is shown | Type | Sound (measured) |
|---|---|---|---|---|---|
| 0.0–3.05 | Real Linear app window: sidebar (Inbox, My issues, Pulse), "Project spec". Very dark with a heavy vignette. | Slow drift and rotate; the window is tilted in 3D, about 20–30° | Real UI rendered as a 3D plane with shallow depth of field | none | Loudest 5 s of the film (−19.6 dB) |
| 3.05–11.25 | Extreme low angle along a dark plane. An "Ask Linear" input bar appears; "Find issues with loading performance" is typed letter by letter (7.0–10.0 s, about 12 chars/s), then the bar clears. | Slow lateral slide | One component, isolated | Typed prompt in the UI | Jump up 10 dB at 3.55 (+0.5 s after cut) |
| 11.25–17.1 | Answer card: "I found 13 bug issues…", with a list of ENG-#### issues whose coloured status icons fade in row by row | Push in plus slide | Data animating in, rows staggered | UI text only | Quiet bed around −34 dB |
| 17.1–21.95 | Follow-up typed: "Make a plan to refactor data loading to be optimistic" → message bubble | Slide | Typing | — | bed |
| 21.95–29.73 | Doc: "Project spec" title retyped as "Optimistic loading refactor"; Overview text, then an "At a glance" table builds | Tilted dolly across the page | The doc builds itself | — | bed |
| 29.73–35.07 | **The UI breaks apart into a wireframe**: outline boxes of each component, with labels such as "Apply optimistic updates" | Slow drift across the tilted wireframe | UI deconstructed into a skeleton | — | bed |
| 35.07–40.62 | Pull out to the full app: doc on the left, Ask Linear panel on the right | Pull back | Whole real UI, tilted | — | bed |
| 40.62–45.1 | Close-up of the chat: "I created the PRD around the issues you surfaced." plus a doc card | Macro with depth of field | Chat component at large scale | — | Slight rise (−28 dB) |
| 45.1–50.4 | Black. "Linear" sharpens out of blur, then ". At your command." types on | static | — | Regular sans; "Linear." in bold, then regular | Fading |
| 50.4–54.9 | Logo mark alone | static | — | — | Silent from 51.5 s |

- **Structure:** no hook copy at all. A single uninterrupted user story (question → answer → plan → document → confirmation) plays in place of problem and payoff. Name and line come only at the end, then the logo.
- **UI:** real product UI, re-rendered on tilted 3D planes in a dark void with depth-of-field falloff. There is no cursor; interaction is shown by typing. There is one "break apart" moment (the wireframe) and data staggers in.
- **Type and colour:** near-black with grey UI. The only colour is the tiny status icons. Copy appears only at the end: two-weight "**Linear.** At your command."
- **Music (measured):** percussive ratio 0.02, essentially no drums. Inferred as a drumless pad or ambient bed. There is one opening hit, then a flat quiet bed (−34 dB) and silence under the logo. No cut lands on a tracked beat, so the editing ignores the beat grid.

## 2. Linear: "Introducing Linear Releases"

- URL: https://www.youtube.com/watch?v=6dIwFoQ0eVg
- Length 30.1 s · 6 shots · mean 5.01 s, median 4.72 s, min 3.57 s, max 6.50 s.
- Sheets: `refs/linear-releases/sheet_01–02.jpg`

| Time | On screen (seen) | Camera | UI | Type | Sound |
|---|---|---|---|---|---|
| 0–4.68 | Macro of white bezier lines branching and converging to the right, with issue labels (MOB-9124, ENG-9833…) | Slow drift, very shallow depth of field | Rebuilt vector graph | — | Opening hit at 0.39 (+12 dB) |
| 4.68–9.07 | Pull out to the whole release graph on a tilted dark plane. Converges to "LAUNCH v1.3"; "SCHEDULED RELEASE" tag | Pull out, tilted | Vector UI | — | Flat −26 to −30 dB |
| 9.07–~11 | Black: "PLAN AND TRACK RELEASES" in mono caps, fading out | static | — | Mono caps, small | — |
| ~11–15.57 | Three tilted panels (MOBILE APP / SDK / PRODUCTION), each a release graph, cascading in from lower right | Push | Floating 3D-tilted panels | Tiny UI labels | — |
| 15.57–21.73 | Macro of the lines again, then a rack to the "PRODUCTION · CONTINUOUS RELEASE" panel | Drift plus rack focus | Vector | — | — |
| 21.73–26.5 | Black. Mono caps typed with a block cursor: "RELEASES", erased, then "AVAILABLE NOW" | static | — | Typewriter mono | — |
| 26.5–30.07 | Linear logo and wordmark | static | — | — | Jump up 10 dB at 26.22 (0.28 s before the logo cut), then fade; silent from 28 s |

- **Structure:** visual metaphor (paths converging), then the product view, one feature line, variants, a status line, and the logo.
- **UI:** fully rebuilt monochrome vector UI (not screenshots), on tilted planes with depth of field. **The "paths converging" metaphor is the product's own data shape.**
- **Type and colour:** grey on near-black with mono caps. Three short text cards in total.
- **Music:** flat bed; a hit lands 0.28 s before the logo cut, then decay.

## 3. Raycast: "New Raycast. Coming 2026"

- URL: https://www.youtube.com/watch?v=Mi173xGb0ZA
- Length 38.6 s · 17 shots · mean 2.27 s, median 1.73 s, min 0.40 s, max 10.3 s.
- Sheets: `refs/raycast-2026/sheet_01–03.jpg`

| Time | On screen (seen) | Camera | UI | Type | Sound (measured) |
|---|---|---|---|---|---|
| 0–1.0 | Blurred glossy monochrome 3D "silk" folds | Drift | — | — | Up 15 dB at 0.39 |
| 1.0–3.67 | Search bar at huge scale, cropped by the frame: "Search" with a blinking caret | Slow slide | One component, isolated, about 4× scale | UI text | — |
| 3.67–5.67 | Pull back: "clipboard" typed → "Clipboard History" result | Pull back | Real UI on a glass panel | — | Up 12 dB at 3.53 (−0.14 s from cut) |
| 5.67–8.9 | Configure Command → Set Hotkey: keys ⌥⌘V appear, the panel flashes green "Saved ✓" | Slight push | Real UI, state change | — | — |
| 8.9–11.23 | Clipboard history list (Raycast-Wallpaper@2x.png, #FF6363 swatch…) | Slide | List items stagger in | — | Up 10 dB at 8.89 (**−0.01 s from cut**) |
| 11.23–15.8 | Emoji grid; the selected tile gets a coloured outline and the grid slides left | Horizontal track | Isolated grid | — | — |
| 15.8–20.23 | **Object match-cut**: emoji → water drop → microphone icon; mic button → voice pill with a live waveform | Push | One icon morphs into the next feature | — | Up at 17.79 |
| 20.23–22.47 | Prompt typed: "Get my active issues and start a focus session"; AI presets menu | — | Real UI | — | Up at 21.34 |
| 22.47–26.17 | Chat window "Focus Session · GPT-5". Tool steps tick in: Getting active Linear Issues / GitHub Issues / Creating note with summary | Slight drift | Steps animate in | — | — |
| 26.17–28.27 | Pill: "Checking for updates…" spinner | Static | One component | — | Dip at 26.5 |
| 28.27–33 | Black. Tiny mono caps "NEW  LAUNCHER DESIGN", then COMPACT MODE, HOTKEY TYPES, VOICE FEATURES, SETTINGS DESIGN, AI CHAT, FILE SEARCH, **one every 0.5 s** | static | — | Mono caps, very small | Up 10 dB at 28.01 (−0.26 s); loud −12 dB |
| 33–36.5 | "NEW" and "RAYCAST" slide together; "COMING 2026" in italic | static | — | — | Down to −18.8 dB |
| 36.5–38.6 | Logo glyph | static | — | — | −34 dB, then silent |

- **Structure:** cold open on the search bar, then 7 features shown working, a tension beat ("Checking for updates…"), a rapid feature-name list on the beat, the name and date, then the logo.
- **UI:** real UI on frosted panels over an abstract 3D backdrop. Extreme crops and pull-backs, keyboard-led with no cursor, and **icon-to-icon morphs as transitions between features**.
- **Type and colour:** monochrome black, white and grey. The only colour comes from the product (emoji, swatches, the green "Saved"). Feature names appear **only** in the end list, at 0.5 s each.
- **Music:** drumless (percussive 0.02), low (centroid 625 Hz) and loud (−12 to −15 dB). Inferred as a pad or bass drone (assumption). Cuts land on beat 0.50 vs 0.17 random, the strongest beat-lock in the corpus. The end feature list changes once per beat at about 120 bpm.

## 4. Attio: "Introducing Ask Attio"

- URL: https://www.youtube.com/watch?v=HSVVMgExV9U
- Length 46.8 s · 7 hard cuts · mean 6.69 s, median 4.70 s, min 0.27 s, max 17.9 s.
- Most transitions are morphs, not cuts.
- Sheets: `refs/attio-ask/sheet_01–03.jpg`

| Time | On screen (seen) | Camera | UI | Type | Sound |
|---|---|---|---|---|---|
| 0–2.27 | Real Attio home, "Good morning.", with the Ask box and meetings list | Push into the input | Real UI, light theme | UI | Up 11 dB at 0.39 |
| 2.27–7.34 | "How do I win this deal" typed (about 15 chars/s). Everything else fades away; the query becomes a lone bubble; "Thinking…" grows huge over faint grid lines | Push | UI dissolves down to one element | — | Down at 3.29 |
| 7.34 | **The bubble collapses to a black dot, which expands to fill the frame** (the dot becomes the transition) | — | Object transition | — | Up 10 dB at 7.13 (−0.21 s) |
| 7.5–10.2 | Black: "Everything" / "creates" / "signal", word by word over a dot grid | static | — | Small regular sans | — |
| 10.5–28.36 | White plus a light grid, one continuous take:<br>• "Every email": stacked email cards rise behind.<br>• "Every call": the word "call" turns into an audio waveform.<br>• "Every note": app icons swap inline in the sentence.<br>• "Every web search": typed with a cursor.<br>• "and every": a horizontal timeline ruler scrolls past User record / Stripe payment / Posthog event / Company record / Polytomic data / Workspace / Deal / Hightouch data / Pylon conversation, about 0.5 s each. | Lateral track along the ruler | Data objects as typographic tokens | One line, centred | Events at 12.76 and 13.41 (call → waveform), 20.24, 22.71 and 23.31 |
| 28.36–33.07 | Black: "Everything is context" → "Universal Context™"; glowing waveform bars at the bottom | static | — | — | **Loudest 5 s window (−7.8 dB, 30–35 s)**; rise at 30.5 |
| 33.07–40.5 | White: "**Ask Attio** to brief my day." The grey suffix swaps every 0.7–1 s through 8 use cases (summarize this call, hand off to success, draft a follow-up, gather feedback, handle objections, find warm intros, celebrate this win) | static | — | Two-tone: black verb, grey object | — |
| 40.5–43 | "Ask more from CRM." | static | — | — | — |
| 43–46.8 | Logo plus attio.com/ask | static | — | — | Silent from 45.5 |

- **Structure:** real product question, then the abstraction (everything creates signal), the proof that it ingests everything, the concept name, the use-case list, the tagline and the logo. **Product UI is on screen for only about 5 s.** The rest is kinetic typography in which words become data objects (waveform, icons, timeline).
- **Type and colour:** black and white only. Black cards for concepts, white for proof. Small Inter-like sans; nothing is bold except the brand verb.
- **Music:** drumless (0.03). Peak loudness at the concept reveal, then a drop to the logo. Cuts on beat 0.50 vs 0.23.

## 5. Ramp: "Introducing Stack | AI built for accountants"

- URL: https://www.youtube.com/watch?v=1VfXDA_5PaQ
- Length 67.4 s · 15 shots · mean 4.49 s, median 3.43 s, min 0.30 s, max 11.2 s.
- Sheets: `refs/ramp-stack/sheet_01, 02, 04.jpg`

| Time | On screen (seen) | Camera | UI | Type | Sound (measured) |
|---|---|---|---|---|---|
| 0–2.07 | "Introducing / **Stack** / by ramp" with giant display type over horizontal lime light-streaks | Slow drift | — | Display grotesk, huge | Quiet start (−31 dB) |
| 2.07–8.47 | "Good morning, Tina" dashboard (real UI, flat) → crop to the prompt bar → "Help me update the prepaid insurance schedule this month" typed in about 1.5 s → cursor clicks send | Push and crop | Dashboard → single component on a bare background | UI | Rises at 1.5 and 4.5 |
| 8.47–10.5 | Black dot "loader" constellation spinning on bare grey | static | Isolated loader glyph | — | — |
| 10.5–16.3 | Chat: "Thinking" → "Working"; clarifying questions with numbered options; the cursor picks "Yes" and "6100 – Insurance Expense" | Slight scroll | Real chat UI, items stagger | — | Up at 12.5 |
| 16.3–24.0 | Answers summarised → "Creating plan" → "Created plan" card with an Open button, clicked | Scroll | Card pops in | — | — |
| 24.0–26.3 | Plan doc: Goal / Triggers / Instructions / Success criteria; the cursor scrolls | Scroll | Real doc | — | Down 33 dB at 23.87 (−0.13 s) |
| 26.3–31.7 | **Hero button**: a lime "Approve" button alone on grey, about 5× scale, clicked; it blurs out with a lime glow | Static, then blur | Isolated macro button | — | **Up 11 dB at 26.35 (+0.05 s from cut)** |
| 31.7–42.87 | "Reading Prepaid-Insurance-Schedule.csv" → "I found 2 new prepaid expenses…" ($6,000 to ABC Insurance; $12,000 to SecureTech, ticking in) → spreadsheet with new rows highlighted → "Drafting journal entry" | Crops and slides | Data animating in | — | Dips at 33.5 and 38.5; **silence at 40.5–41** before the draft lands |
| 42.87–46.3 | Journal entry table (Debit/Credit) | Push | Table rows stagger | — | Rise at 42 |
| 46.3–49.57 | **Hero button**: "Post to Quickbooks", isolated and clicked | static | Macro button | — | — |
| 49.57–51.07 | "Posted"; Schedule $41,150 = GL $41,150 with green checks | Crop | Reconciliation | — | — |
| 51.07–61.27 | "Finished updating prepaid insurance schedule" → "Mark as complete" turns green → dashboard "Close the books" progress bar (completed count 21 → 22 → 26 → 30 → 34) → **zoom out to a mosaic of many task panels running** | Pull out | One task becomes many | — | Up 15 dB at 52.23 |
| 61.27–64 | "AI built for accounting" over lime streaks | drift | — | Regular, small | — |
| 64–67.4 | ramp logo | static | — | — | Silent from 65 |

- **Structure:** name first (0–2 s), then ONE persona and ONE real accounting task told end to end, with two hero-button moments. The one task becomes many, then the category line and the logo. No problem statement.
- **UI:** real product UI, always flat (never tilted), on a warm light-grey ground. Heavy **isolation**: a component is lifted out of the app and shown alone, at scale, on a bare background. Cursor-driven, with the numbers in the UI animating.
- **Type and colour:** warm off-white plus one acid-lime accent, used for buttons and light streaks. Two text cards in total (title and end line).
- **Music:** beat-driven (percussive 0.54). Cuts on beat 0.57 vs 0.32 random. Built from a quiet −31 dB open to about −23 dB in the middle, with a short silence right before the key "drafting" payoff.

## 6. Rippling: "Introducing Rippling AI"

- URL: https://www.youtube.com/watch?v=Ve6565BeUxI
- Length 60.1 s · 33 shots · mean 1.82 s, median 1.30 s, min 0.40 s, max 7.57 s.
- Sheets: `refs/rippling-ai/sheet_01–03.jpg`

| Time | On screen (seen) | Camera | UI | Type | Sound (measured) |
|---|---|---|---|---|---|
| 0–1.5 | Sparkle icon pulsing on a black/aurora gradient | static | Brand glyph | — | Up 18 dB at 0.39; −30.8 dB first 5 s |
| 1.5–4.3 | Glyph → input: "Who are my top performers in Support?" typed, then the cursor clicks send | Pull back | Isolated input, dark | — | Up at 3.89 |
| 4.3–10.0 (3 cuts) | White answer card streams in (top performers, CSAT 4.9/5.0, "Pay attention: attrition risks"). Then the user's reaction typed: "**Holy shi**", cut off mid-word | Scroll, crop | Real answer UI at large scale | — | **Down at 9.83, then a full dropout (−62 dB) at 10.44** |
| 10.0–12.0 | "Introducing" → "**Rippling AI**" (glow) | static | — | Mid-size sans | **Up 11 dB at 11.04, on the name** |
| 12–18 (5 cuts) | "With deep access to Rippling's data layer" / "It has full context on your business"; floating data chips (Department, Expenses, Salesforce, avatars, "Operating System") drift around the words | Slow drift in z | UI fragments as floating chips | Word-by-word; colour gradient on key words | Down at 17.39, up at 18.00 |
| 18–22 (5 cuts) | "so you can.." → "Make better better better **decisions**" (gradient type, dot grid) → "with instant reports" | static | — | Big display moment | — |
| 22–28 (4 cuts) | "and logic you can see" → query "Who are my top performers at risk?" → attrition table → "Gap analysis" shown huge | Push and crop to giant scale | Real answer UI, zoomed to read | — | Down at 25.69, **up 62 dB at 26.30** |
| 28–34 | Teal background: "Enough talk" / "Save time with action" → "reward Ethan and Olivia with retention bonuses at 12%" → summary of changes (salary, bonus) → "Yes." | crop and scroll | Action-confirmation flow | — | Down at 29.07 |
| 34–36.7 | "Done." → "Best of all?" → "You can trust it." (a circle is drawn around "trust") | static | — | Hand-drawn annotation | Down at 35.32 |
| 36.7–44 | "Rippling cites its sources" (a hover card pops off the linked name) / "and shows its work" ($120,000 × .12 = $14,400 calculation card) / "and scopes what every user can see" | Slight drift | UI cards beside the copy | Copy left, UI right | — |
| 44–48 | "I heard Olivia got a bonus. How much was it?" → "Insufficient permissions. You don't have access." | crop | Real UI | — | Down at 44.43; loudness dips to −21.7 dB (45–50 s) |
| 48–52.5 | "**Nice try.**" → "Now every employee has the full power of Rippling at their fingertips" over drifting blurred queries | drift | Queries as background texture | — | — |
| 52.5–54 | Sparkle glyph → mark | static | — | — | **Down at 52.19, then up at 52.79** (≈0.6 s gap, then a hit on the glyph) |
| 54–60.1 | "RIPPLING AI" lockup | static | — | — | Decay |

- **Structure:** product question cold open, a wow reaction, the name (on a dropout and hit), the claim, proof 1 (insight), proof 2 (action), proof 3 (trust: citations, working, permissions), the line, and the logo. **The trust and governance block is a third of the film.**
- **UI:** real UI cards at large scale on dark aurora gradients, cropped hard to the line that matters. Every scene drifts (0% near-static steps).
- **Type and colour:** conversational fragments of 2–6 words, sentences split across cards, a gradient on key words, and humour as punctuation ("Holy shi", "Nice try."). Black with purple and teal aurora.
- **Music:** two full dropouts used as edit points: before the name (10.44 → 11.04) and before the logo (52.19 → 52.79). Otherwise a loud plateau at −12 to −13 dB.

## 7. Retool: "Build Anything, Govern Everything"

- URL: https://www.youtube.com/watch?v=FWNNP5rqbF4
- Length 55.3 s · 7 hard cuts · mean 7.89 s, median 3.71 s, min 0.62 s, max 24.7 s.
- Sheets: `refs/retool-govern/sheet_01, 03.jpg`

| Time | On screen (seen) | Camera | UI | Type | Sound |
|---|---|---|---|---|---|
| 0–3 | "Anyone can vibe code apps", word by word with blur-to-sharp, over a purple horizon glow | static | — | Light sans | Silent at 0, then up 21 dB at 0.39 |
| 3–9 | "But vibe-coded apps / aren't production ready" over a dim wall of app screenshots; Slack-style alert cards pop in ("Oops I just exposed a secret key", "who approved this?") | Slow drift | Problem shown through notifications | — | Gradual rise from −29.6 dB |
| 9–11.46 | "Introducing / The new Retool app builder" | static | — | — | — |
| 11.46–18.58 (4 cuts) | Real app-builder UI: prompt left, generated dashboard right ($42,837,219, bar chart) → "Generate serious apps" over a wall of apps | Push | Real UI, flat | Words over UI | Down events at 12.41, 14.64, 18.38 |
| 18.58–30.58 | "Build from anywhere" with AI tool icons in a row → dashboard ⟷ "MCP" ⟷ Claude code panel (connector diagram) → "Connect resources / APIs / databases" with integration logos orbiting → "Connect everything securely" (the logo grid fills, then blurs) | Static, with elements animating | Diagram of UI fragments | Word swaps | Rising to −21 dB |
| 30.58–40 | "Actually ship with confidence" → "Because when" / "Governance lives in the platform" (keyword cloud: SSO, OAuth, Secrets, Audit logs, RBAC, SOC 2, Versioning, Self-hosted, Permissions) → "every app is secure by default" inside a glass pill | static | Keyword cloud as UI proxy | Word by word | **Up 11 dB at 30.53 (−0.05 s from cut)** |
| 40–45.5 | "It doesn't matter who **or what** wrote the code" with circular cut-outs of people and pixel-art AI glyphs | drift | — | Grey/white emphasis on "or what" | — |
| 45.5–48 | "Build anything. / Govern everything." | static | — | Two lines | — |
| 48–55.3 | Retool mark animates → "Retool / New app builder in private beta / Join the waitlist at retool.com" | static | — | — | Down at 54 |

- **Structure:** problem (vibe-coded apps leak secrets), name, capability, connectivity, **governance as the climax**, the line and the CTA. Product UI is on screen for about 7 s in total.
- **Music:** cuts on beat 0.67 vs 0.37, the highest in the corpus. A slow 8 dB rise over the first 15 s, then a plateau.

## 8. Notion: "Introducing Notion 3.0: Agents"

- URL: https://www.youtube.com/watch?v=R1cF4T4lgI4
- Length 90.1 s · 39 shots · mean 2.31 s, median 1.62 s, min 0.29 s, max 10.7 s.
- Sheets: `refs/notion-3-agents/sheet_01, 02, 05.jpg`

| Time | On screen (seen) | Camera | UI | Type | Sound (measured) |
|---|---|---|---|---|---|
| 0–1.2 | Notion logo plus cursor on warm off-white | static | — | — | — |
| 1.2–4 | **Mascot face** "You assign the tasks." → more agent faces pop in with hats and props: "Your Agents do the work." | static | Illustration | 2 lines, bold black sans, centred | Rhythmic up events every ≈0.93 s (2.18, 3.10, 4.03, 4.96, 5.87…) |
| 4–10 (3 cuts) | Real Notion UI inside a **brand-blue padded frame**; crops to the To-dos, then to the agent panel "How can I help you today?"; the cursor clicks "Personalize" | Crop and zoom steps | Screen in a frame, flat | — | (pulses continue) |
| 10–19.6 | Agent customiser: a carousel of props (duck, pencil, chili, hat); the selected tile is outlined and slides → name field typed "Lucky" → profile dropdown "Bug Wrangler" | Slide | Isolated component on bare ground | — | Loudness jumps from −30.5 to −19.1 dB at about 10 s |
| 19.6–21.2 | Large mascot with a cowboy hat: "Howdy, Partner!" bubble | static | Character | Speech bubble | — |
| 21.2–25 (8 cuts) | Prompt box → **giant type fills the frame as it is typed**: "Create a bug track…", "…cking das…" (cuts between huge-type frames and the UI) | Hard cuts at type scale | Typed text blown up to display size | Display-size UI text | — |
| 25–32 | Prompt continues in the UI: "…populate with feedback from Slack and Notion and my emails" → send | static | Real UI | — | — |
| 32–34.5 | Mascot "Thinking •••" → "Crafting •••" (the face redraws) | static | Character status | — | — |
| 34.5–45.2 | "Bug Tracking Dashboard" page builds; the agent panel shows "Searched for bug reports" with the **result count climbing 4 → 38 → 53 → 59 → 61 → 82**; table rows populate with status pills | Slow crops | Data animating in | — | Up at 36.39 |
| 45.2–60.2 | More prompts typed ("…and assign the appropriate engineers", "AND write a summary for each bug 🙏"); assignees fill; a row is clicked and the bug page opens | Crop and zoom | Real UI | — | Ups at 52.38, 55.88 |
| 60.2–66 | "Transcribe" button → **full-screen grey waveform** → meeting transcript card, with the mascot wearing a headset | Cut to full-bleed graphic | Component → abstraction → component | — | Up at 60.38 |
| 66–73.2 | "Update bug tracker based on @Bug Catchers Meeting Today" → status pills flip to green "Complete" in sequence | Crop | State change cascade | — | — |
| 73.2–75.3 | Mascot: "Yeehaw, all complete! What should we build next?" | static | Character | — | — |
| 75.3–82 | "Bug Wrangler" card → **zoom out to a huge grid of agent cards** (Incident Response Agent, Code Reviewer, Market Research…) | Pull out | One becomes many | — | — |
| 82–86.5 | "Your team of Agents are ready to work" → "Get started at notion.com" | static | — | Bold, centred | Up at 84.38 |
| 86.5–90.1 | Notion logo and wordmark | static | — | — | Silent from 89.5 |

- **Structure:** promise (2 lines), customise the agent, one task told end to end (3 prompts), a second input type (meeting audio), the payoff (all complete), scale (agent library), the line, the CTA and the logo.
- **Hero object:** a **recurring character** (the agent mascot) carries the story *between* real UI moments. It appears in 5 dedicated beats of 1.5–3 s (Howdy, Thinking/Crafting, headset, Yeehaw, agent grid), and it changes costume to match the task (cowboy hat for "Bug Wrangler", headset for transcription). It never sits on top of the UI while the UI is being read.
- **UI:** real and flat, shown in a blue frame or cropped to one component. Cursor-driven. Counters and statuses animate. 54% of 0.5 s steps are near-static, the highest of the UI films.
- **Music:** beat-driven (0.44), with the pulse visible as up-events every ≈0.93 s in the opening. Cuts on beat 0.42 vs 0.29.

## 9. Framer: "Framer for Enterprise"

- URL: https://www.youtube.com/watch?v=-qD3KOfBjZE
- Length 47.4 s · 23 shots · mean 2.06 s, median 1.96 s, min 0.46 s, max 5.68 s.
- Sheets: `refs/framer-enterprise/sheet_01–03.jpg`

| Time | On screen (seen) | Camera | UI | Type | Sound (measured) |
|---|---|---|---|---|---|
| 0–0.75 | Framer logo on black | — | — | — | Up 23 dB at 0.39 |
| 0.75–2.8 | Real Framer editor recording; push-in onto the canvas site (purple "Boost your rankings with AI.") | Push | Real UI | — | — |
| 2.8–6.75 | Site blurred behind; **chat bubbles pop in one at a time**: "This is perfection!", 🚀🚀🚀, "How long will this take to build?" | static | Stakeholder chatter as the problem | UI bubbles | Down events at 4.59 and 6.61 |
| 6.75–8.8 | Black: "Why not just use Framer?" → "**Framer**" glowing as it sharpens | static | — | Mixed weights | **Down at 7.89, then up 19 dB at 8.50, on the name** |
| 8.8–12.2 (4 cuts) | Editor: cursor; breakpoints switch Desktop 1200 → Tablet 810 → Phone 390 and the layout reflows | Static per frame | Real UI | Breakpoint labels | — |
| 12.2–13.8 | **Hero button**: macro blue "Publish"; the hand cursor clicks and the button pulses | Macro with depth of field | Isolated button | — | — |
| 13.8–19 | Published site pages slide past → "Book a demo" form → **zoom out to a floating 3D cluster of site cards** → flat collage of customer sites | Pull out in z | One becomes many | — | — |
| 19–23.3 | CMS: blog fields (Title/Slug/Date/Image) → Publish clicked → rendered article page | Crop | Real UI | — | — |
| 23.3–26 | Customer logo wall (miro, SpaceX, perplexity, zapier, Dribbble, The Browser Company…) | static | — | — | — |
| 26–28.8 | Macro of the tilted toolbar (Insert/Layout/Text/CMS) with depth of field: "Design and launch" / "All in one place." one word at a time | Slow slide | Tilted real UI as background | Word by word | — |
| 28.8–34.9 | Green radial glow: shield "Enterprise security" → "24/7 support" over a Slack thread → "99.99% uptime" with green status bars | static | Trust proofs as UI | — | Down at 31.64 |
| 34.9–39.3 | Tilted, endlessly drifting wall of customer sites: "let's build" | Diagonal drift | One becomes many | — | Up 11 dB at 38.87 |
| 39.3–41.7 | "framer.com/enterprise" | static | — | — | **Up 18 dB at 39.47; loudest 5 s (−10 dB)** |
| 41.7–47.4 | Logo, then black | static | — | — | Silent from 46.5 |

- **Structure:** problem as a social scene (stakeholder chat), a rhetorical question, the name on a hit, a proof montage (responsive, publish, CMS), social proof (logos), enterprise trust (security, support, uptime), the line, the URL and the logo.
- **Music:** a steady crescendo from −17.7 dB to −10 dB peaking at the URL, then a cut to silence.

## 10. Figma: "All the launches at Config 2025"

- URL: https://www.youtube.com/watch?v=NHodnYFUT_I
- Length 81.2 s · 128 shots · mean 0.63 s, median 0.46 s, min 0.33 s, max 4.10 s. Fastest in the corpus: 84% of shots are under 1 s.
- Sheets: `refs/figma-config-2025/sheet_01, 02, 04.jpg`

| Time | Cuts in range | On screen (seen) | UI | Sound (measured) |
|---|---|---|---|---|
| 0–1.5 | 0 | "Figma" wordmark on maroon → selection box → collapses to "F" | — | Up 37 dB at 0.39 |
| 1.5–3 | 3 | "F" explodes into a collage of geometric shapes and textures | Break-apart | Up 2.19, down 2.80 |
| 3–4.5 | 3 | "Figma Sites": letters stacked vertically in frame columns, then reflow to horizontal (a layout-grid metaphor) | Product mechanic applied to the title | — |
| 4.5–27 | 40 | Sites chapter: real UI flat recordings. CMS gallery site; site cards fanned in z; responsive breakpoints side by side with a resize cursor; multiplayer cursor with a pink "Aja" name tag; grid cells fill with cards; drag-resize handles | Real UI, cursor-driven, flat colour backgrounds per sub-beat | Transients within ±0.35 s of cuts throughout |
| 27–28 | 2 | "Figma Make" wordmark (gradient glitch) | — | — |
| 28–35.5 | 14 | Upload to Make (icons fly) → prompt "Bring this explore page to life with sort and filter functionality" → "Thinking…" with pixel-glitch confetti → generated gallery app with cursor | Typing, then a generative moment | — |
| 35.5–37.5 | 1 | "Figma Draw" (scribble underline) | — | — |
| 37.5–56 | 25 | Brush toolbar, brush styles, a grid of poster variants, text on a path (CHESAPEAKE), progressive-blur slider (VOLU…), vector butterfly edit → gradient fill → texture slider → "NATURE FEST" poster | Macro on sliders and handles | — |
| 56–57.5 | 2 | "Figma Buzz" in a pink outline box | — | — |
| 57.5–72.5 | 29 | Templates; field editing ("Yosemite National Park" typed into a field live-updates the design); bulk table → **"Export assets" macro pink button click** → grid of generated assets | Hero button; one becomes many | — |
| 72.5–76 | 6 | "All / in / Figma" word by word over a pink-lilac gradient; textures fly in | — | — |
| 76–77.5 | 2 | Shapes assemble into the Figma logo | Recompose | — |
| 77.5–81.2 | 0 | Logo on charcoal | — | Down 13 dB at 79.33; silent from 79.5 |

- **Structure:** a chaptered recap. Each chapter is a 1–2 s animated product-name card followed by 4–8 UI moments of 0.3–1 s. The film breaks the logo apart at the start and reassembles it at the end (a bookend).
- **UI:** 100% real product UI, flat and full-frame or slightly zoomed. A saturated chapter colour fills the ground around it. Multiplayer cursors with name tags.
- **Music:** beat-driven (0.60); the beat tracker gives 129 bpm with very stable spacing (CV 0.023). Cuts align to *transients* (48 of 58 large loudness jumps fall within ±0.35 s of a cut), not to the tracked beat grid (0.24 vs 0.28).

## 11. Vercel: "Vercel Ship 2024" (event teaser)

- URL: https://www.youtube.com/watch?v=PHvw0IP7dEU
- Length 35.9 s · 14 shots · mean 2.57 s, median 1.33 s, min 0.27 s, max 16.0 s.
- Sheets: `refs/vercel-ship-2024/sheet_01–02.jpg`

| Time | On screen (seen) | Camera | UI | Sound (measured) |
|---|---|---|---|---|
| 0–3.02 | The Vercel triangle resolves out of a halftone/dither particle cloud | static | — | Up 13 dB at 0.39; up at 2.60 |
| 3.02–6.1 | The actual Ship website, flat: giant "SHIP" glyph fragments assemble; Get Tickets button; small mono copy | static | Real website | Up at 5.31 |
| 6.1–8.17 | Macro, tilted, shallow depth of field on the website: **the cursor sweeps and dissolves letterforms into dither particles** | Slide | Screen filmed as an object | Up at 7.35 |
| 8.17–11.0 | Speaker cards (halftone B&W photos, "GUILLERMO RAUCH") sliding diagonally | Diagonal track | Website section | — |
| 11.0–12.33 | Big "2" numeral, tilted | static | — | **Up 10 dB at 11.28 (+0.01 s from cut)** |
| 12.33–15.0 | Macro "Get Tickets" button with dither dust | Slide | Hero button | — |
| 15.0–16.07 | Countdown digits 08 → 07 flip | static | Live data | — |
| 16.07–19.92 | "Vercel Ship 24" logo, tilted; the cursor erodes the triangle into particles | Drift | — | — |
| 19.92–35.9 | Black, mono: "23 MAY 2024 / NEW YORK CITY" → "VERCEL.COM/SHIP" → "Vercel Ship 24" wordmark fades in, then erases letter by letter | static | — | **Up 10 dB at 19.89 (−0.03 s)**; hits every ≈1.05 s from 19.95 to 27.79; loudest at 20–30 s (−12 dB); silent from 31.5 |

- **Takeaway:** the "product" (the website) is filmed as a **physical object**: tilted macro, depth of field, and the cursor as a brush that turns UI into particles. The cuts at 11.0 and 19.9 land within 0.03 s of loudness jumps.

---

# Part B: Live-action and hybrid films

## 12. Apple: "The new MacBook Pro with M5 Pro and M5 Max"

- URL: https://www.youtube.com/watch?v=GriXfu4tL30
- Length 100.2 s · 81 shots · mean 1.24 s, median 0.83 s, min 0.25 s, max 5.06 s.
- Sheets: `refs/apple-macbook-pro-m5/sheet_02, 03, 07.jpg`

| Time | Cuts | On screen (seen) | UI | Type | Sound (measured) |
|---|---|---|---|---|---|
| 0–2.6 | 1 | Off-white card, **blinking orange text cursor** | Caret motif | — | Near silence (−47.8 dB, first 5 s) |
| 2.6–10 | 3 | Extreme close-up of a face in a library; hands on keys, macro; overhead wide of the library | — | — | Up events at 4.14 and 6.12, each within 0.05 s of a cut |
| 10–12 | 2 | White card: "A day un…" typed (cut off) | — | Typed, small | — |
| 12–21 | 8 | Library coverage; overhead hands on the keyboard | — | — | Down 18 dB at 12.77; **silence 13–18 s**; up at 18.49, the music entering on the overhead shot |
| 21–24 | 0 | Laptop lid: "*Introducing* / the new MacBook Pro"; letters fly in scattered and then settle | — | Kinetic type over live action | — |
| 24–27.2 | 2 | "Now with M5 Pro", letters arriving one by one at different positions | — | Same | — |
| 27.2–34.2 | 4 | Garage coder (red beanie) → real Xcode on screen, macro → overhead "Up to 2x faster CPU" | Real UI only on the in-camera screen | "Up to Nx faster X" | — |
| 34.2–47 | 16 | Lab scientist → "Up to 2x faster SSD" → extreme close-up of an eye reflecting the screen → pathology app with a cursor menu → AI chat input typing "Add the current…" (macro, shallow depth of field) | Real screens, macro | Spec claims | Up at 36.98, 41.80 |
| 47–59.5 | 7 | Overhead "Starting at 1TB of storage" → "And M5 Max" → 3D mech model on screen → "Up to 5x faster graphics" → an apple is bitten | — | — | — |
| 59.5–63 | 3 | Apple-bite beat | — | — | **Music drops: down at 59.43 and 60.91, silence 60–62.5** |
| 63–84 | 30 | Film set wide → "Up to 128GB of unified memory" → Nuke CopyCat UI, cursor clicks "Start Training" → node graph → studio displays "Up to 8x faster AI performance" → robot render → progress bar → "Build Succeeded" → garage coder stretches (payoff) | Real screens | Spec claims | **Up 10 dB at 63.07, on the cut (+0.17 s)** |
| 84–91.3 | 3 | "Our best performance yet" (scattered letters) → library close-ups | — | — | **Down at 89.63, on the cut (0.00 s)**; quiet 85.5–91.5 |
| 91.3–95.1 | 1 | "The new MacBook Pro / with M5 Pro and M5 Max" over the wide | — | Title over live action | Up at 92.26 |
| 95.1–100.2 | 0 | Black, Apple logo, legal fine print | — | — | Silent tail |

- **Structure:** cold open on a cursor in silence, a human context, the name (21 s), then six spec claims, each paired with a profession and a real on-screen app. A breath (the apple bite) at the midpoint, then the payoff, the title and the logo.
- **UI:** **never floating.** UI is only seen on real screens in camera: macro, shallow depth of field, real apps with real cursors.
- **Type:** small white sans placed in the scene beside the action. Letters assemble from scattered positions. Every claim is "Up to Nx faster <thing>": a number and a unit, never a feature name.
- **Music:** the structure is clear in the measurements: silent intro, music in at 18.5 s, a plateau at −18 to −20 dB, a deliberate drop at the visual punchline (apple bite, 59.4–62.5 s) re-entering on the cut, and a long quiet passage (85.5–91.5) before the end title.

## 13. The Browser Company: "Dia Browser | Never Explain Yourself Again"

- URL: https://www.youtube.com/watch?v=YVOw0TAO9ok
- Length 77.8 s · 56 shots · mean 1.39 s, median 1.19 s, min 0.04 s, max 4.46 s.
- Sheets: `refs/dia-browser/sheet_02, 03, 05.jpg`

| Time | Cuts | On screen (seen) | UI | Type | Sound (measured) |
|---|---|---|---|---|---|
| 0–17 | 10 | Warm, grainy, vintage-graded live action with a rounded film-gate frame: a family preps a garden party; zucchini problem; alarmed faces | — | — | Flat around −20 dB; ups at 11.30 and 11.90 (comic beat) |
| 17–36 | 20 | Brother on a competitor laptop types ever-longer prompts into "AI Chat" ("What's a zucchini appetizer…", "…in 30 minutes? No nuts, no soy…"), as tilted macro screen inserts with depth of field, intercut with reaction close-ups | Competitor UI, macro, tilted | Typed prompts as comedy | — |
| 36–44 | 7 | Heroine calm; opens Dia from the macOS Dock (cursor); @-mention tab picker (All open tabs, Tuscan Garden Party email, Event Feedback, Branzino) | Real UI, macro | — | Up 12 dB at 38.27; up at 40.79 (Dock click) |
| 44–46 | 2 | Black card: "If it's in your tabs" | — | Regular, small, centred | Down at 44.54 |
| 46–48 | 1 | "quick zucchini appetizer" typed (short!) | Real UI | — | Down at 47.42 |
| 48–49.5 | 1 | Black card: "Dia already knows" | — | — | Down at 48.81 |
| 49.5–56.4 | 4 | Answer referencing the tabs, with recipe image cards | Real UI, slight tilt | — | — |
| 56.4–58.5 | 0 | Dish served, overhead | — | — | — |
| 58.5–60.6 | 2 | Black: "The AI browser that's always up to speed" | — | — | — |
| 60.6–64 | 1 | Dusk party wide: "Never explain yourself again", word by word over live action | — | Over picture | — |
| 64–67 | 2 | **Graphic comparison on black**: a huge pasted prompt block vs a tiny gradient pill "Quick zucchini appetizer for family feast" | Rebuilt UI fragments | — | — |
| 67–72.5 | 4 | Dinner, toast | — | — | — |
| 72.5–77.8 | 1 | "Dia" logo over the food → black → diabrowser.com (gradient shimmer) | — | — | Down at 76.9 and 77.5 |

- **Structure:** a comedy sketch. Problem (over-explaining to AI) → product (a short prompt with tab context) → payoff (dinner) → tagline → a before/after graphic → logo. The type cards land on loudness *drops*, which leaves room for the line (inferred: dialogue or music ducking; assumption).
- **Audio:** the loudness is flat (about −20 dB ± 1.5) for the whole film. With on-screen speech, this suggests a dialogue-driven mix (assumption). Cuts are not beat-locked (0.44 vs 0.42).

## 14. Stripe: "Introducing Stripe Reader S700"

- URL: https://www.youtube.com/watch?v=9oieNo53aNY
- Length 74.1 s · 66 shots · mean 1.12 s, median 0.90 s, min 0.04 s, max 4.40 s.
- Sheets: `refs/stripe-reader-s700/sheet_01, 03.jpg`

| Time | Cuts | On screen (seen) | UI / graphics | Sound |
|---|---|---|---|---|
| 0–2 | 5 | Split-screen café macros: espresso, milk, latte art, device in hand | Thin purple dividers | — |
| 2–6 | 4 | Flat Stripe-purple map of New York; the dripos pin drops in with spark lines → large pin with logo | Flat motion graphics | — |
| 6–14.3 | 4 | Founders' interview (lower third: name, title) split with purple cards: "POINT OF SALE", "ONLINE ORDERING", "MOBILE ORDERING", "EMPLOYEE SCHEDULING", "PAYROLL" (line icons, condensed caps) | Feature names as icon cards | — |
| 16.4–22 | 3 | Map: NY pin → zoom out to the USA → **a white comet line travels from NY to Austin**; the Austin pin lands | **A hero object travelling between places** | — |
| 22–27.6 | 7 | Live street in Austin with **the same pin and "Dripos customer: Revolución" label overlaid on the live shot** → shop sign → owner interview | The graphic lands on the real world | — |
| 27.6–38 | 9 | Barista with the reader; unboxing; 3D device render rotating on lavender; "Please sign" screen with a signature drawn | Hero render plus a UI insert | — |
| 38–50.5 | 14 | Device in use. **Small particle "spark" accents burst at each tap** (40.5, 45, 49.5); card tap → green success | Motion accents on live action | Up 11 dB at 49.78 (card tap); rise at 50.5 |
| 50.5–68.3 | 16 | Founder interviews, split with device close-ups; the device on a desk; hand-offs | — | Flat around −21 dB |
| 68.3–74.2 | 2 | Tap-to-pay with sparks → white card "Stripe Reader S700 / stripe.com/terminal" → co-brand lockup (Revolución + dripos + stripe) | — | Silent from 73 |

- **Takeaway:** in a customer-story format, a **flat brand-colour motion layer** (map, pins, comet line, sparks) threads through live action. The travelling pin **lands on a live shot and stays overlaid**. Interaction moments get a 0.5 s particle accent.

## 15. Stripe: "Stripe Sessions 2024" (event recap)

- URL: https://www.youtube.com/watch?v=KH0_HM6e66w
- Length 108.9 s · 92 shots · mean 1.18 s, median 1.00 s, min 0.25 s, max 3.38 s.
- Sheets: `refs/stripe-sessions-2024/sheet_01, 03.jpg`
- Seen: an event sizzle, not a product film.
  - Arena establishing shots, stage two-shots with lower thirds, and the "stripe / SESSIONS" stacked-block logo on a blurred pink, orange and purple gradient (5.2–7 s and 105.6–108.9 s).
  - Venue signage ("The internet economy conference"), badge and crowd macros, booth demos (Tap to Pay on iPhone), audience reaction close-ups, and on-stage product demos on giant screens.
  - A requests-per-second gauge counting 475 → 559, partner booths (Klarna, Adobe, AWS, Anthropic), and fireside chats.
- Measured: no silence anywhere; loudness flat at −15 to −19 dB; dense ±10 dB jumps about once a second. That is consistent with speaker soundbites over a music bed (assumption).
- **Takeaway:** brand coherence comes from one gradient and colour field shared across stage, signage and end card. For our purposes it shows the bookend logo device (stacked blocks) and the fact that **real numbers on screen (475 → 559 RPS)** are used as spectacle.

## 16. OpenAI: "Say hello to GPT-4o"

- URL: https://www.youtube.com/watch?v=vgYi3Wr7v_g
- Length 82.3 s · 3 shots · mean 27.4 s, median 17.5 s, min 2.74 s, max 62.1 s.
- Sheet: `refs/openai-gpt4o/sheet_02.jpg`
- Seen: a locked-off split screen. The left two-thirds shows a person at a desk in a warm room, talking to a phone. The right third shows a phone held by a hand: the phone camera's view, with the app.
  - One insert (17.5–20.2) shows the phone being raised and turned.
  - No graphics, no type and no logo card in the frames.
- Measured: 82% of 0.5 s steps are near-static. Huge loudness swings (up 30–40 dB) with short gaps, consistent with an unscored live conversation (assumption: no music; not verifiable without listening).
- **Takeaway:** the opposite pole. **The proof is the demo itself, unedited**, and there is no cinematic language. That works for a capability nobody believes until they see it live. It is not a model for a premium enterprise film, but it is a reminder that one *real* interaction, held long enough, beats ten polished fragments.

---

# Patterns that recur across the best films

Each rule below gives the evidence (film and measurement) and then the version you can code.

### 1. Shot length and pacing

- **UI films hold their shots.**
  - Evidence: median shot 1.3–5.3 s across Linear, Attio, Ramp, Retool, Raycast, Notion, Vercel and Framer. The UI is near-static in 42–67% of 0.5 s steps in Linear Agent, Raycast, Ramp, Notion and Attio, so viewers can read it.
  - *Rule:* each UI moment gets a **rest state of at least 1.5 s** after its animation finishes. A full UI beat lasts **2.5–6 s**. Only motion-graphics transitions run faster.
- **Montage speed is for live action or recaps, not explanation.**
  - Evidence: Figma has a 0.46 s median, but each chapter is reintroduced by a name card, and it is a recap of things people had already seen at the keynote. Apple, Stripe and Dia sit at 0.83–1.19 s, but explain through people, not UI.
  - *Rule:* do not cut UI faster than **one new UI state per 1.5 s**, except in an end-list montage.
- **End-list montages run on the beat.**
  - Evidence: Raycast's "NEW ___" list is 7 items at 0.5 s each. Attio's "Ask Attio to ___" is 8 items at 0.7–1 s. Figma's chapter beats are 0.33–0.5 s.
  - *Rule:* when a feature list is unavoidable, put it **once, near the end**, at 1 item per beat (0.47–0.5 s at about 120–129 bpm), in small type on a clean ground.
- **Logo holds.**
  - Measured logo or end-card holds: Linear Agent 4.5 s, Linear Releases 3.6, Raycast 2.1, Attio 3.8, Ramp 3.4, Notion 3.6, Framer 3.5 (+2 s black), Figma 3.7, Rippling 6.1, Retool 7.3, Apple 5.1, Dia 5.3.
  - *Rule:* **logo 3–5 s**, preceded by a line or URL card of 2–3 s.

### 2. How many product moments

| Length | What the best films did | Rule |
|---|---|---|
| ≈30 s | Linear Releases: 1 feature, 3 views + 2 text cards. Vercel (36 s): 6 website moments + 3 cards. Raycast (39 s): 7 features shown working + a 7-word end list. | **2–3 real product moments of 3–6 s each**, or one continuous moment with 3 states. |
| 45–60 s | Linear Agent: 1 workflow with 5 states. Attio: 1 UI moment + 8 typed use cases. Rippling: 3 scenarios (insight, action, permission). Retool: about 5. Framer: about 8. | **One persona and one task told end to end (4–6 states)**, plus 1 trust beat. |
| 60–90 s | Ramp: 1 workflow with about 12 states and 2 hero buttons. Notion: 1 workflow (3 prompts) + customise + audio + library. Figma: 4 products × 5. Apple: 6 claims. | **One spine workflow (8–12 states) + 2–3 side moments + a "one becomes many" zoom-out.** |

- **The strongest B2B AI films tell one continuous task, not a feature tour.** Linear Agent, Ramp, Notion, Rippling and Dia all follow one user through one job, and every state of the UI is the consequence of the previous one.

### 3. Narrative skeleton (the common order across the product films; no single film has every step)

1. **Cold open on a single product element**, in 0–4.5 s: a prompt bar, caret, cursor or the glyph. Seen in Linear Agent, Raycast, Attio, Ramp, Rippling, Notion, Framer, Figma, Vercel, Linear Releases and Apple (caret). Only the narrative films (Dia, Stripe S700) open on people.
2. **Problem, if any, shown through UI artefacts, not stated.**
   - Retool: Slack alerts ("I just exposed a secret key").
   - Framer: stakeholder chat bubbles.
   - Dia: ever-longer prompts.
   - Rippling: the wow reaction "Holy shi".
3. **Name reveal on an audio event.**
   - Rippling: full dropout at 10.44, hit at 11.04 on "Rippling AI".
   - Framer: dip at 7.89, then up 19 dB at 8.50 on "Framer".
   - Apple: music enters at 18.5 shortly before "Introducing" (21.5).
   - Name timing: **show the product working first, name it at 8–22 s** (Rippling 10 s, Retool 9 s, Framer 8.5 s, Apple 21.5 s). Ramp names it at 0 s but has the shortest text presence.
4. **The proof spine** (§2).
5. **Trust or governance beat, in the films aimed at enterprise buyers.** Linear, Notion and Attio do not have one.
   - Rippling: cites sources / shows its work / scopes access, about 11 s.
   - Retool: "Governance lives in the platform", about 10 s.
   - Framer: security / 24/7 support / 99.99% uptime, about 6 s.
   - Ramp: the reconciliation ($41,150 = $41,150) plays a similar role.
6. **"One becomes many" zoom-out**, in 6 films: Ramp's task mosaic, Notion's agent grid, Framer's site cloud, Retool's app and logo walls, Figma's asset grid and Linear's pull-out.
7. **Line (1–2 short sentences) → URL or CTA → logo**, with music decaying to silence. Every scored product film ends in measured silence or a long decay; the Stripe Sessions recap does not.

### 4. How product UI is presented

| Technique | Films (seen) | Rule |
|---|---|---|
| **Real product UI**, not a stylised redraw | 14 of 16. The exceptions are Linear Releases (rebuilt vector) and Vercel (the website itself) | Use the real Rilin UI, rebuilt pixel-accurately as components so it can animate, but the real layouts and the real copy. |
| **Isolation**: one component lifted out of the app onto a bare ground at 3–6× scale | Ramp (prompt bar, loader, Approve, Post to QuickBooks), Raycast (search bar), Rippling (answer card, "Gap analysis"), Notion (giant typed prompt, customiser), Attio (query bubble), Figma (Export assets), Framer (Publish) | Default framing = **one component, centred, everything else removed**. Show the full app only for orientation (≤2 s) or in the zoom-out. |
| **Hero button click** | Framer Publish, Ramp Approve and Post to QuickBooks, Figma Export assets, Raycast "Saved ✓" | 1–2 per film: macro button, cursor arrives, press (scale about 0.96), colour or glow change, **cut or hit within 0.1 s** (Ramp 26.35 hit vs 26.30 cut). |
| **Typing** a prompt or field, character by character | Linear Agent (≈12 chars/s), Attio (≈15 chars/s), Ramp (≈35 chars/s), Notion, Rippling, Raycast, Dia, Figma, Apple | 12–35 chars/s; keep prompts under about 60 characters on screen; may cut mid-word for humour or speed. |
| **Data animating in**: counts, rows, statuses | Notion (results 4 → 82), Ramp (21 → 34 completed; balances reconcile), Linear (rows stagger), Framer (uptime bars), Raycast (tool steps), Stripe Sessions (475 → 559 RPS) | Stagger rows 60–120 ms apart; numbers count up; statuses flip one by one (Notion's pills turning "Complete"). |
| **3D tilt with depth of field** | Linear ×2, Vercel, Framer toolbar, Dia screens | Use for *atmosphere* (openers and backgrounds), not for reading. Every film that needed text read used flat or nearly flat UI. |
| **Flat UI** | Ramp, Notion, Rippling, Attio, Figma, Retool | Flat is the default for legibility. |
| **Break apart and recompose** | Linear Agent (wireframe explode, 29.7–35), Figma ("F" explodes, then reassembles into the logo), Vercel (particle dissolve), Attio (bubble → dot → frame), Raycast (emoji → drop → mic) | Use **once or twice** as transitions, preferably bookending (Figma) or turning one object into the next. |
| **Cursor** | Ramp, Notion, Framer, Figma, Vercel, Apple. Linear and Raycast are keyboard-only. | The cursor is a character. It moves in eased arcs, lands, clicks, and leaves. |

### 5. Camera grammar

- **The UI moment itself is locked or slowly pushed.** Big moves happen only in transitions.
  - Measured: near-static steps are 42–67% in Linear Agent, Raycast, Ramp, Notion and Attio.
  - Rule: during a UI beat, push in by at most about 5–10%, or drift in one axis. Do not rotate while text is being read.
- **Moves seen:**
  - Push into a component (Ramp, Attio, Framer).
  - Pull out to reveal context or scale (Linear, Ramp, Notion, Framer).
  - Lateral track along a timeline (Attio's ruler, Raycast's emoji row).
  - Low-angle slide across a tilted plane (Linear Agent).
  - Rack focus between planes (Linear Releases).
  - Diagonal drift over a wall of thumbnails (Framer, Retool).
- **Transitions are mostly *motivated morphs* rather than cuts** in the best UI films: Attio has 7 hard cuts in 47 s and Retool 7 in 55 s. Ramp's 15 cuts often land on hero moments.

### 6. Copy

- **Short claims, not feature names.** Feature names appear only in an end list (Raycast) or as chapter titles (Figma).
  - Examples (seen):
    - "Linear. At your command."
    - "Everything is context."
    - "Ask more from CRM."
    - "You can trust it."
    - "Governance lives in the platform."
    - "Build anything. Govern everything."
    - "Never explain yourself again."
    - "All in one place."
    - "AI built for accounting."
    - "Our best performance yet."
  - Rule: **2–6 words per card; a sentence may be split across 2–4 cards**, as in Rippling ("so you can.." / "Make better decisions" / "with instant reports" / "and logic you can see") and Retool.
- **Numbers as claims:** "Up to 2x faster CPU", "99.99% uptime", $41,150 = $41,150. Use real numbers from the product.
- **Two-tone emphasis:** Attio "Ask Attio [grey suffix]", Retool "who **or what**", "**Linear.** At your command.", Rippling's gradient on the key word.
- **Wit as punctuation, once or twice per film:** "Holy shi", "Nice try.", "Enough talk", "Howdy, Partner!", "Yeehaw, all complete!".
- **Type size:** small to medium regular-weight grotesk (cap height about 3–5% of frame height) for lines. Display size is reserved for the name reveal (Ramp "Stack", Rippling "decisions") or for blown-up typed input (Notion). Monospace caps are for meta (dates, NEW, labels).
- **Reveal:** word by word (Rippling, Retool, Attio, Framer, Dia) or by scattered letters (Apple), usually with blur-to-sharp. One line on screen at a time.

### 7. Colour and background

- Two families.
  - **Near-black with one accent**: Linear (grey only), Raycast (monochrome), Retool (charcoal plus purple/orange horizon), Rippling (black plus purple/teal aurora), Vercel (B&W).
  - **Warm off-white with one accent**: Attio (B&W), Ramp (lime), Notion (blue frame).
  - Figma's chapter colours are the brand's exception.
- **One accent hue per film**, reserved for action states such as buttons, success and highlight. The product UI supplies any other colour (Raycast's emoji, Linear's status dots).
- Backgrounds are **soft gradients, glow horizons or blurred 3D material**, never busy patterns. Contrast comes from the UI card (white card on dark: Rippling) or a dark card on light (Attio's black concept cards).

### 8. Music and cutting (measured)

- **Tempo:** estimates of 103–172 bpm, mostly **112–144** (read with ±2× ambiguity).
- **Two scoring modes.**
  - *Drumless pad* (percussive ≤ 0.03): Linear Agent, Raycast, Attio. Inferred: ambient or synth beds (assumption). These pair with slow, continuous UI morphs.
  - *Beat-driven* (≥ 0.44): Figma, Ramp, Notion, Framer, Stripe. These pair with staggered UI states and button hits.
- **Envelope shape**:
  - A quiet open (Apple −47.8, Ramp −31, Rippling −30.8, Retool −29.6, Notion −27 to −30, Figma −26 dB in the first 5 s).
  - Rising **8–20 dB by the name reveal**, then a plateau.
  - **One deliberate dropout or dip before a key line or the logo**:
    - Rippling 10.44 → 11.04 and 52.19 → 52.79.
    - Apple 59.4–62.5 and 85.5–91.5.
    - Ramp 40.5–41.
    - Framer 7.89 → 8.50.
    - Raycast 26.5 → 28.0.
  - Then **a hit on the reveal**, and decay or silence under the logo (all scored product films).
- **Cut sync**:
  - Beat-scored UI films put cuts on the beat well above chance: Raycast 0.50 vs 0.17, Attio 0.50 vs 0.23, Ramp 0.57 vs 0.32, Retool 0.67 vs 0.37, Notion 0.42 vs 0.29.
  - Fast montages (Figma) cut to *transients* rather than the beat grid: 48 of 58 large loudness jumps are within ±0.35 s of a cut.
  - Big loudness steps sit almost exactly on cuts: Raycast 8.89 vs 8.90, Vercel 19.89 vs 19.92, Retool 30.53 vs 30.58, Ramp 26.35 vs 26.30, Apple 89.63 vs 89.63.
  - Narrative films (Dia, Stripe S700) are not beat-locked.
  - *Rule:* put every hard cut and every hero click **on a beat (±1 frame at 60 fps)**. Put **one audible event** (hit, whoosh, click) within ±2 frames of each major visual change. Plan **2 dropouts**: one before the name and one before the logo, each 0.4–1.0 s.

---

# Implications for a Rilin film featuring a rocket or plane metaphor

No film in the corpus uses a vehicle literally. Five films do use a **recurring hero object or character that carries the viewer between real product moments**, and they agree on how:

| Film | Hero object | How it meets the product |
|---|---|---|
| Notion | Agent mascot | Gets its own 1.5–3 s beats *between* UI moments, changes costume per task, never overlays UI being read |
| Stripe S700 | Map pin plus a comet line | Travels NY → Austin on a flat map, then **lands on the live shot and stays overlaid** as a label |
| Attio | The query bubble | Shrinks to a dot that becomes the black frame of the next scene (the object *is* the transition) |
| Raycast | Icons | The emoji becomes a water drop, which becomes the mic icon of the next feature (match-cut morph) |
| Vercel | Cursor | Acts on the UI: it dissolves letterforms into particles as it passes |
| Linear Releases | Paths | The "travel lines" *are* the product's data (the release graph) |

### What this means for Rilin, concretely

1. **The plane flies along the product's own data shape, not through abstract rings.**
   - rilin.ai already draws the path. Its timeline runs from DAY 1 · CONTRACT EXECUTED to DAY N · LITIGATION INITIATED, with NOTICE WINDOW, PAYMENT DUE, RENEWAL DEADLINE and TERMINATION RIGHT along a "Liability Exposure" line.
   - Make that line the flight path, as Linear Releases makes the release graph the visual. Each waypoint is a real obligation, not a feature label.
   - The current storyboard's six labelled rings (Risk Surfacing, Obligation Tracking…) are the "feature names as labels" pattern that none of the top UI films use mid-film.
2. **Hand-offs, not overlays.** The plane carries the viewer *between* UI moments (Notion, Stripe pin) and does not fly over the UI while it is being read.
   - Rule: each transition is 0.6–1.2 s. The plane enters, and at the waypoint it **becomes** the UI element:
     - its contrail draws the underline of the obligation row;
     - the plane banks and its silhouette morphs into the "Implement changes →" arrow;
     - the plane lands as the pin or status dot.
   - The UI then holds its rest state for at least 1.5 s with the plane off-screen or parked small.
3. **Tell one transaction end to end** (the Ramp, Linear Agent and Notion spine), using rilin.ai's own objects. These are a suggested sequence of real states:
   1. **Executed:** "Master Services Agreement → 12 material clauses" becomes Transaction "IT Vendor Onboarding · TXN-2026-014 · ACTIVE → 4 core obligations".
   2. **Owned:** obligation cards stagger in with owner, clause and window ("Submit certificate of insurance · FINANCE · CLAUSE 7.2 · Within 30 days of execution", INFOSEC 11.4, DELIVERY 4.3, LEGAL OPS 9.5).
   3. **Risk:** the exposure stack goes live: Acme Corp MSA **CRITICAL 0.92**, Globex SLA 0.42, Initech NDA 0.15 (numbers count up).
   4. **Act:** redline on clause 8.2, "₹50,00,000 → ₹75,00,000", then a **hero button**: "Implement changes →" (macro, cursor, click on the beat).
   5. **Tracked:** the obligation register statuses flip DUE → UPCOMING → **DONE** one by one (Notion's "Complete" cascade).
   6. **Ask:** "Have we worked with Apex Logistics before?", with the answer streaming in ("appears in 4 prior matters…").
   7. **Trust beat** (Rippling, Retool and Framer give it 6–11 s in 47–60 s films; allow about 3 s at 30 s): "Tenant-isolated · No model training · Your data stays yours" / "Full audit trail".
   8. **One becomes many:** pull out from the one transaction to the whole contract stack, with many planes and paths running (Ramp's mosaic, Notion's grid). The hero plane then lands as the wordmark.
4. **Budget per length**, from §2:
   - **30 s:** 3 product moments (for example states 2, 4 and 5) of 3–5 s each, 2–3 plane transitions of about 1 s, 1 line, logo 3–4 s.
   - **60 s:** states 1–6 + trust + zoom-out.
   - **90 s:** all of the above, plus a cold-open problem told through UI artefacts. For example, missed-deadline notifications in the Retool and Framer manner: "Renewal auto-executed", "Notice window closed".
5. **Copy:** one claim card per act, 2–6 words, outcome-led. Lines from rilin.ai that fit the corpus pattern:
   - "Lawyers show up at the start and at the end."
   - "Rilin runs everything in between."
   - "Every action maps back to the clause."
   - "The contracts are already signed. Do you know what they say?"
   - Close on "Contractual liability control for enterprises." and the wordmark.
   - Feature names only as a 0.5 s-per-beat end list, if at all.
6. **Camera:** the plane can justify the only big camera moves: a follow shot along the path, or a bank into the next scene. These are transitions only. On arrival the camera settles to a flat or nearly flat view of the UI (≤10% push) so the clause text is readable. Use 3D tilt with depth of field only for the opener and the zoom-out, as Linear and Vercel do.
7. **Sound map**, from the measured patterns:
   - Quiet open (about −30 dB).
   - Engine and whoosh on each hand-off, **landing on the cut**.
   - A beat-locked bed at 112–129 bpm under the UI states, with clicks and hits on the hero button and each status flip.
   - A **0.4–1.0 s dropout before the name or line and before the final landing**, then a hit on the wordmark.
   - 2–4 s of decay to silence under the logo.
8. **Look:** pick one family. Either near-black with one accent (Rilin's brand colour) for action states only, or warm off-white with one accent. The plane, path and accent share that one hue. Everything else is the real product's greys. One accent, used sparingly, is the most consistent marker of polish across the corpus.

*All conclusions above come from the 16 films measured here. Items marked (assumption) were not verified by listening or direct observation.*
