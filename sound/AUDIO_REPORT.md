# Rilin launch film: audio report

Date: 2026-10-12. Covers `sound/library/` (licensed candidates and SFX) and `sound/score-custom.wav` (the new procedural score).

> **Read this first.** No one has listened to these files yet. All picks and rankings below come from measurements (tempo, beat grid, loudness envelope, key, spectrum, stereo width) and from the catalogue's own descriptions and tags. Take them as a strong shortlist, not a final choice. A 3-minute listen to the three files in `library/edits/` will settle the choice.

## Recommendation

**Music:** "Your Breath" by Eugenio Mininni (Mixkit #634). Use the 60 s edit `library/edits/edit60_your-breath_mixkit-634.wav`.

Why this track:
- **Tempo:** exactly 120.00 BPM, so one beat is 30 frames and one bar is 120 frames at 60 fps. The edit is offset so every bar starts on an even second.
- **Style:** tagged *Corporate / Electronica / Positive / Futuristic*, in D major. It has a sparse, filtered intro about 7 dB under the groove, then bass and kick enter on a downbeat. That entry lands on **16.000 s** in the edit, which is the launch moment.
- **Production:** modern, loud master (−9.5 LUFS as supplied), with moderate stereo width and no harsh top end. On paper it is the closest of the free options to a clean "Linear/Stripe" pulse.
- **Licence:** Mixkit Stock Music Free License. Free for commercial use, no attribution, no per-use fee. **It may not be used for TV or radio broadcast.** It is fine for web, social, video-on-demand and online ads.

**Alternatives, in order:**
1. **"New Bass 01" by Lily J (Mixkit #720), `edit60_new-bass-01_mixkit-720.wav`.** It has the most dramatic launch: the intro is 12–13 dB under the groove, so the 16 s entry really lands. Its drawbacks: 126 BPM (28.57 frames per beat, so the grid doesn't land on whole frames), an almost mono mix (width 0.16), and a more "underscore" feel. Same Mixkit licence and broadcast limit.
2. **"Impact Allegretto" by Kevin MacLeod, `edit60_impact-allegretto_incompetech.wav`.** CC BY 4.0, so broadcast is allowed but **attribution is required**. Also 120.00 BPM with a frame-exact grid, in A major, bright and driving. It has a real ending (a final hit that rings out), so its logo moment is the most natural of the three. Its drawbacks: the intro is not sparse (the band is in at full level from 4 s), the guitar-and-synth production dates from 2009, and Kevin MacLeod's music is very common on YouTube, which can make a premium film sound cheaper. Use it if the film may be broadcast.

**Custom score (`score-custom.wav`):** it is better than the score from `synth.mjs` that the client rejected, and it lines up with the film to the frame. **It is still clearly weaker than the licensed tracks.** It sounds programmed: static piano attacks, synth patches that sound like presets, no human timing, no mix depth. Don't present it as the main option. Use it as a fallback or as a scratch track while editing.

## Timing map for the recommended edit

File: `library/edits/edit60_your-breath_mixkit-634.wav` (60.000 s, 48 kHz, 24-bit, −16 LUFS integrated, −1 dBFS ceiling).

| | Film time | Frame @60 fps | Source in original track |
|---|---|---|---|
| Tempo | 120.00 BPM | 30 frames/beat, 120 frames/bar | |
| Beat-grid offset | **0.000 s**: downbeats on every even second | frames 0, 120, 240, … | original track: first beat 0.476 s, first downbeat 1.476 s |
| Music starts | 0.524 s | 31 | track 0.000 (pickup beat into bar 1) |
| Intro (sparse, filtered, about −22 dB) | 0.5 – 12 s | 31 – 720 | track 0 – 11.5 |
| Build (layers thicken) | 12 – 16 s | 720 – 960 | track 11.5 – 15.48 |
| **Drop / launch: bass and kick in, +6 dB** | **16.000 s** | **960** | track 15.476 |
| Groove A | 16 – 30 s | 960 – 1800 | |
| Lift: new layer, +2 dB | 30.0 s | 1800 | track 29.48 |
| Groove B | 30 – 46 s | 1800 – 2760 | |
| Lift: +2 dB | 46.0 s | 2760 | track 45.48 |
| **Breakdown** (edit: intro bars reused, about −23 dB) | **48.0 – 52.0 s** | 2880 – 3120 | track 1.476 – 5.476 |
| **Final hit** | **52.000 s** | **3120** | track 15.476: the launch downbeat, cut to one beat |
| Ring-out (added reverb tail) | 52 – 57 s, −40 dB by about 56 s | 3120 – 3420 | |
| Fade to silence | 57.0 – 59.8 s | 3420 – 3588 | |

Edit decisions (from `library/tools/plans/634.json`):
- **Splice 1 at 48.0 s:** track 47.476 → track 1.476, 40 ms equal-power crossfade.
- **Splice 2 at 52.0 s:** a one-beat hit of the track's launch downbeat, with a synthetic 6 s reverb tail.

The splices are on downbeats and the crossfades measure clean, but they haven't been checked by ear. The 48 s splice in particular could clash harmonically. If it does, change `from` in the plan to another bar line (any `1.476 + 2k`) and run the tool again.

If the client wants the track's own ending instead of the stop-and-ring: the original fades out slowly from 205.5 s to 231 s. Splicing track 205.476 in at 52.0 gives a soft resolve with no hit.

## SFX assignments

All files are in `library/` and normalised to −1 dBFS peak. The **sync** value is how far into each file its peak or hit falls. To make a hit land at film time *T*, start the file at *T − sync*. The suggested levels are the ones used in `edits/preview_your-breath_with-sfx.wav`, a rough mix of the recommended edit with these SFX, worth listening to first.

| Moment | Primary file | Sync | Place at | Layer / alternative |
|---|---|---|---|---|
| **Rocket engine build-up** (the 8–16 s build) | `mixkit/sfx/rocket-build_engine-ignition-rumble_mixkit-1715.wav` (11.9 s rising rumble) | 10.42 | start 5.58 s so the peak lands at 16.0, −10 dB | Longer and bigger: `rocket-build_shuttle-ignition_mixkit-1717.wav` (26.7 s countdown-style ignition, peak at 22.04). Start it at −6.0 s (trim the first 6 s) or use its last 12 s. Optional `riser-short_trailer_mixkit-790.wav` (sync 2.18) ending at 16.0. |
| **Launch** (16.0 s) | `mixkit/sfx/rocket-launch_ignition-flames_mixkit-1725.wav` + `impact_intro-presentation_mixkit-2902.wav` | 0.72 / 1.40 | both peaks at 16.0, −9 dB / −6 dB | `rocket-launch_fast-rocket-whoosh_mixkit-1714.wav` (sync 0.89) peaking at about 16.3 s as the mark leaves frame. `rocket-launch_afterburner_mixkit-1724.wav` if the rocket stays on screen under thrust. |
| **Ring pass** | `mixkit/sfx/whoosh-passby_futuristic-sweep_mixkit-169.wav` (2.5 s, very wide stereo) | 0.77 | peak on the frame the mark crosses the ring, −12 dB, pan in the direction of travel | `whoosh_wind-sweep_mixkit-2632.wav` (short, sync 0.42), `whoosh_flying-fast-swoosh_mixkit-1469.wav` (0.36). For a close, heavy pass: `rocket-passby_space-rocket-passing_mixkit-1716.wav` (3.68). For the plane version of the mark: `jet-flyover_fast-jet_mixkit-1580.wav` (4.30). |
| **UI click** | `kenney/ui-tick_kenney-interface-tick_002.wav` (20 ms, dry) | 0 | on the click frame, −16 dB | `kenney/ui-select_kenney-interface-select_001.wav`, `mixkit/sfx/ui-click_cool-interface-tone_mixkit-2568.wav`, `ui-select_modern-tech_mixkit-3124.wav`, `ui-open_software-interface_mixkit-2578.wav` (panel opening, sync 0.20) |
| **Data change** (number or status updates) | `kenney/ui-glass_kenney-interface-glass_002.wav` (soft glassy tick) | 0 | on the change, −16 dB | `mixkit/sfx/ui-option_interface-select_mixkit-2573.wav` (tonal). For a big reveal, add `hit-bass_short-bass-hit_mixkit-2299.wav` at −14 dB underneath. |
| **Landing** (about 48 s) | `mixkit/sfx/whoosh_long-air-swoosh_mixkit-167.wav` | 0.80 | peak at touchdown, −12 dB | `impact-sub_space-impact_mixkit-774.wav` (sync 0.04) for a soft sub thump on contact. `whoosh-reverse_cinematic-fast_mixkit-1492.wav` (sync 1.07) as a suck-in before it. |
| **Logo** (52.0 s) | `mixkit/sfx/impact-logo_movie-logo-intro_mixkit-2900.wav` (8.9 s: swells for 4 s, then hits) | 3.98 | start 48.02 s so the hit lands at 52.0 on the music's final hit, −6 dB | Add `impact-sub_space-impact_mixkit-774.wav` at 52.0 (−8 dB) for weight. `riser_cinematic-synth_mixkit-645.wav` (peak 6.37) is a longer synth swell if the breakdown needs more tension. |

**Mixing notes:**
- Duck the music by 3–4 dB for about 0.4 s around the launch and logo hits.
- Keep UI ticks at −16 to −20 dB relative to the music. They should be felt, not heard.
- Hold the final mix at about −14 LUFS for web delivery.

**Before you sync:** `src/` still describes a **30 s** film (launch at frame 285 in `sound/cues.mjs`). The 60 s timings above assume launch at 16 s, breakdown at 48 s and logo at 52 s. If the picture lands elsewhere, re-cut the music to the picture with `library/tools/edit.py` rather than moving SFX off the beat.

## Candidates compared

Measured with Remotion's bundled ffmpeg (used only to decode) and numpy/scipy. Measurements: integrated loudness (BS.1770 K-weighting with gating), RMS per 0.5 s, tempo from the autocorrelation of spectral flux, then a fine comb search for BPM and phase, and the downbeat from low-band (<150 Hz) flux. The full 0.5 s envelopes are in `library/analysis.json`.

| # | Track (library file) | Licence | Length | BPM | Grid (first downbeat) | Loudness | Key (est.) | Measured structure (original track) | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Your Breath**, Eugenio Mininni (`mixkit/music/…634…`) | Mixkit music (no broadcast) | 3:56 | 120.00 | 1.476 s (beat 0.476) | −9.5 LUFS | D major | Intro −20 dB to 13.5 s; bass and kick in at **15.48** (+6 dB); layers at 29.5 and 45.5; steady 2-bar alternation after 49.5; long fade from 205 s to silence at 233 s | **Recommended** |
| 2 | **New Bass 01**, Lily J (`mixkit/music/…720…`) | Mixkit music | 1:36 | 126.00 | 0.029 s | −18.1 | F major | Near-silent to 7.6 s; sparse −32 dB to 22.9 s; **big entry at 22.89** (+12 dB); lift at 53.4; fade from 82 s | Strongest launch contrast; narrow stereo |
| 3 | **Impact Allegretto**, Kevin MacLeod (`incompetech/…`) | CC BY 4.0 | 3:02 | 120.00 | 0.010 s | −13.9 | A major | Silent first bar, in at 2.0; dip at 12, lift at **14.0**; dip at 28, lift at 30; lift at 42; percussion-led bars from 136; **real ending: hits at 164 and 168, ring-out to about 176 s** | Broadcast-safe fallback; dated, busy |
| 4 | **It's Love**, Michael Ramir C. (`mixkit/music/…834…`) | Mixkit music | 1:37 | 110.01 | 0.013 s | −11.5 | A major | Fade-in to 4.4; light −20 dB to 21.8 (bass in); **main lift at 39.3** (+8 dB); hard stop at 91.6 with a 2 s tail | Uplifting; the drop comes too late for a 16 s launch without restructuring |
| 5 | **Molten Snow**, Jesse Spillane (`fma/…`) | CC BY 4.0 | 2:33 | 124.01 | 0.545 s | −17.2 | C minor | Level −20 to −23 from the start; dropout 24–28; re-entry at 27.6; lifts at 52.8 and 64.4 | Darker indie electronic; weak build |
| 6 | **Long Time Coming**, Kevin MacLeod (`incompetech/…`) | CC BY 4.0 | 4:34 | 120.00 | 0.005 s | −15.9 | A minor | Pulsing crescendo intro; **drop at exactly 16.01 s**; lift at 40; breakdown at 64 | Ideal structure, wrong mood (catalogue: "tense… final battle with a villain"). Structural reference only |
| – | Custom score (`sound/score-custom.wav`) | Ours, no licence needed | 1:00 | 120 | 0.000 s | −14.0 | D major (composed) | Intro −25 to 8; build 8–16; **launch 16.0**; groove to 48 (bell melody from 24, second section from 32); breakdown 48–52; final hit 52.0; silent from 59.8 | Fallback / scratch track |

**Loudness envelopes, first 60 s:** RMS dBFS, each value an average of four 0.5 s windows (2 s steps). Full 0.5 s data is in `analysis.json`.
```
your-breath (orig)   -31 -20 -20 -20 -20 -20 -20 -17 -14 -13 -16 -14 -16 -14 -13 -11 -12 -12 -13 -12 -13 -12 -12 -11 -11 -11 -13 -11 -14 -11
new-bass-01 (orig)   -39 -40 -39 -38 -33 -32 -32 -32 -32 -32 -32 -23 -20 -20 -20 -20 -20 -20 -22 -20 -20 -20 -19 -20 -19 -20 -21 -18 -18 -19
impact-allegretto    -64 -16 -19 -17 -18 -17 -21 -16 -18 -18 -18 -16 -18 -17 -24 -17 -18 -20 -22 -22 -24 -15 -16 -15 -15 -15 -16 -15 -14 -15
its-love             -51 -38 -21 -22 -21 -21 -21 -22 -23 -21 -21 -18 -20 -19 -20 -19 -19 -19 -19 -15 -13 -13 -12 -12 -12 -12 -13 -13 -11 -13
molten-snow          -21 -23 -23 -21 -20 -25 -27 -23 -20 -19 -20 -22 -38 -35 -21 -23 -22 -22 -20 -20 -21 -19 -19 -22 -19 -20 -19 -19 -19 -21
long-time-coming     -25 -34 -25 -34 -25 -34 -28 -34 -21 -18 -20 -18 -19 -17 -19 -17 -20 -18 -21 -18 -16 -15 -15 -15 -16 -15 -15 -15 -15 -14
EDIT your-breath     -82 -24 -24 -24 -23 -24 -23 -22 -17 -17 -19 -17 -19 -17 -18 -15 -15 -16 -17 -16 -17 -16 -16 -14 -24 -24 -18 -37 -57 -87
EDIT new-bass-01     -33 -28 -28 -28 -29 -27 -29 -27 -16 -16 -16 -16 -16 -16 -16 -17 -16 -16 -16 -15 -16 -16 -17 -16 -22 -22 -16 -32 -52 -86
EDIT impact-allegr.  -163 -64 -15 -18 -16 -18 -16 -20 -15 -18 -17 -18 -16 -18 -17 -23 -16 -18 -19 -22 -21 -24 -14 -16 -17 -23 -14 -25 -32 -49
custom score         -26 -25 -25 -25 -23 -21 -19 -17 -13 -16 -17 -17 -15 -15 -15 -16 -15 -15 -15 -15 -15 -15 -15 -15 -21 -21 -11 -19 -36 -68
```
The −82 and −163 in the first column of the edits come from silent lead-ins being averaged in. Your Breath enters at 0.524 s; Impact Allegretto has 4 s of silence before the band.

**Other edit maps:**
- **New Bass 01 edit** (126 BPM, bar = 1.905 s):
  - Track 6.886 s plays at film 0, with a 1 s fade-in.
  - Drop at **16.000 s** (track 22.886).
  - Groove runs 17 bars, to 48.381.
  - 2-bar breakdown (track 15.267, +5 dB) to 52.190.
  - Final hit at **52.190 s** (frame 3131) with reverb ring-out, silent by 59.8.
- **Impact Allegretto edit** (120 BPM; downbeats on even seconds minus 0.01 s):
  - Track plays from film 1.99 s; the band enters at 4.0.
  - Lift at **16.0 s** (track 14.01). Dip at 30, lift at 32 (track 28/30). Lift at 44 (track 42).
  - Breakdown 48–52 (track 26–30, the dip bar before a lift).
  - At **52.0 s** the edit splices to the track's own ending hit (track 168.0), which rings out to about 59 s.

## Track B: custom score

`sound/compose_score.py` renders `sound/score-custom.wav` (60.000 s, 48 kHz, 24-bit, −14.0 LUFS, −3.1 dBFS peak, silent from 59.8 s). It needs Python 3 with numpy and scipy, takes about 20 s, and gives the same output every run:
```
python3 sound/compose_score.py [out.wav] [--stems]
```

**What's in it:**
- **Oscillators:** PolyBLEP band-limited saws with slow pitch drift, and an envelope per voice.
- **Piano:** an additive felt-piano model (slightly out-of-tune overtones, two-stage decay, soft hammer thump).
- **Bell:** a two-operator FM bell.
- **Filters:** resonant filters whose cutoff moves, both per note on the arp and as sweeps on the pad and keys.
- **Groove:** sidechain ducking driven by the kick (bass 85 %, pad 60 %, reverb 30 %).
- **Chords:** voicings chosen to move as little as possible between chords: Bm9 – Gmaj9 – Dadd9 – Aadd9, then Gmaj9 – Asus4 – Dmaj9 at the end.
- **Stereo and reverb:** detuned voices spread across the field, a ping-pong delay, and a synthetic hall with different decay times for lows, mids and highs, separate left and right.
- **Master:** gentle saturation and a look-ahead limiter.

**Structure:**

| Time | What happens |
|---|---|
| 0 s | Felt-piano broken chords and a dark pad |
| 8 s | 16th-note arp enters, its filter opening from 260 Hz to 3.2 kHz |
| 9.5 s | Riser starts |
| 12 s | Soft kick and a sustained bass enter |
| 14–15.75 s | Snare roll |
| 15.75–16 s | Silent gap before the drop |
| **16.0 s** | **Launch impact and full groove** |
| 24 s | Bell melody enters |
| 32 s | Second groove section: arp, piano counter-line, open hats, wider pad |
| 48 s | Breakdown |
| **52.0 s** | **Final Dmaj9 hit**, plus a three-note bell logo at 52.25, 52.34 and 52.43 s |
| 56.8–59.8 s | Fade out |

**Honest assessment:** it is a big step up from `synth.mjs`. It has real harmony, an actual groove and the requested arc, and it is frame-exact with no licence. It still sounds like programmed synthesis:
- The piano is the weakest element: static attack, no body resonance.
- The pads and plucks sound like stock synth patches.
- There's no humanised timing or evolving texture.
- The mix depth is not commercial.
- The melody is serviceable but generic.

It will not stand next to a produced library track. Its best uses are as a scratch track, or for its hits alone (16 s and 52 s) layered under a licensed track.

## Sources tried and why some were dropped

- **Pixabay** (Content License: commercial use, no attribution): **blocked.** Search and licence pages return HTTP 403 to `curl` even with a normal Chrome User-Agent, and a headless-browser fetch was also refused. The API needs a key. Not usable from the CLI. Someone could download tracks by hand in a browser if wanted.
- **Free Music Archive:** 135 search results for corporate/tech/minimal queries were checked against each track page's licence. Most are **CC BY-NC or BY-ND, which this film can't use.** Under CC 4.0, syncing music to moving images counts as an adaptation, so ND forbids it, and NC forbids commercial use. BY-SA would force the film itself onto a share-alike licence. Only CC BY tracks were kept: the Jesse Spillane *Art of Presentation* album, "Inspiring Corporate" (Music for Creators / Pro Tunes, the same audio uploaded twice) and ROZKOL. Molten Snow was the best fit. FMA's download button needs a login, but the direct file URL embedded in each track page works.
- **ccMixter:** CC BY API queries returned empty bodies, and the CC0 results were rough experimental sketches. Not used.
- **Incompetech:** 7 tracks screened from the full 1,443-track catalogue (filtered to 98–128 BPM plus electronic/tech keywords). Kept Impact Allegretto and Long Time Coming.
  - "Inspired" (120 BPM) had no dynamics and almost no top end (>6 kHz band at −48 dB): dull.
  - "Blipotron", "Cut Trance", "Digital Lemonade" and "Super Friendly" were flat, chiptune-ish or wrong tempo.
- **Mixkit:** 10 music tracks screened from the technology, corporate and electronica tags; 3 kept. "Better Times are Coming" (synth-pop, full from bar 1), "Digital Clouds", "Uplifting Bass" and "Curiosity" had no sparse intro or an unsuitable structure. "Close Up" was 105 BPM and F minor.
- **Wikimedia Commons / Internet Archive:** not searched in depth. Commons audio is mostly classical or field recordings, and Internet Archive licence metadata is too unreliable for a commercial film when better-documented sources were available.
- **Sonniss GDC bundles** (royalty-free, commercial use allowed): not downloaded. They are multi-GB archives, and Mixkit plus Kenney already covered every needed category, including the rocket ignition and pass-by sounds.
- **SFX pool screened:** 63 Mixkit WAVs and 4 Kenney CC0 packs (355 files). Kept 22 + 3. The Kenney Sci-Fi thrusters and engines were rejected as mono game loops with no build. Mixkit's rocket set is much more realistic.

## Files and tools

- `sound/library/`
  - `incompetech/`, `fma/`, `mixkit/music/`: 6 candidate tracks, original MP3s, unmodified.
  - `mixkit/sfx/` and `kenney/`: 25 normalised SFX WAVs.
  - `edits/`: three 60 s edits plus a preview mix of the recommended edit with SFX.
  - `LICENSES.md`: per-file source URLs, licences and attribution text.
  - `analysis.json`: full measurements.
- `sound/library/tools/`:
  - `analyze.py`: duration, LUFS, 0.5 s envelope, BPM, spectrum.
  - `refine.py`: fine BPM, beat and downbeat grid, per-bar map.
  - `key.py`: key estimate.
  - `edit.py` with `plans/*.json`: bar-accurate edits with equal-power splices, reverb ring-out, LUFS normalisation and peak limiting.
  - `mix.py`: preview mix.
  - `norm_sfx.py`: SFX trimming and normalisation.

  Run them from the project root with Python 3 + numpy + scipy, using the bundled ffmpeg for decoding. For example:
  ```
  python3 -I sound/library/tools/edit.py node_modules/@remotion/compositor-darwin-arm64/ffmpeg sound/library/tools/plans/634.json
  ```
