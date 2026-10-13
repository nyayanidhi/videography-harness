# NyayaNidhi Launch Film: Motion Principles

These are checkable rules for a 30 s, 16:9, 1920x1080 film rendered in Remotion. Frame counts assume **60 fps** (`FPS` in `src/theme.ts`), so 1 frame is 16.7 ms.
Each rule gives a **why** and a **ref** (the studio or work it comes from). A rule you can't check from a still or a frame range doesn't belong here.

The studio approach in one line: design *behaviour*, not decoration. Motion is a structural system, as in DIA's "Kinetic Identity" and the Swiss lineage of Müller-Brockmann, Gerstner and Weingart. It is never an effect laid on top.

---

## A. Typography in motion

1. **One typeface family, two weights at most.** Use a neo-grotesk or a sharp contemporary sans (e.g. Inter Display, Söhne-like, Neue Haas-like) with Regular plus Medium/Semibold. Don't add a serif "accent" word, an italic flourish or a script.
   *Why:* a single voice reads as authored, and mixed-font emphasis is the main template tell. *Ref:* Pentagram identities, Linear and Vercel launch films, Apple keynote type.
2. **Extreme scale contrast.** A hero line is at least **160 px** cap-height-equivalent (≥ 180 px font-size), and supporting text is **28–40 px**. The ratio is ≥ 4:1. Never use three similar mid sizes.
   *Why:* hierarchy is read in under 200 ms, and medium-on-medium reads as a slide deck. *Ref:* Collins (Dropbox, Spotify Wrapped), ManvsMachine Nike type films.
3. **Tracking follows size.** At ≥ 120 px, track **-2% to -4%** (`letterSpacing: '-0.03em'`). At 28–40 px, use 0 to -1%. Only small all-caps labels (≤ 16 px) get positive tracking, **+6% to +10%**. Never wide-track large type.
   *Why:* display type is drawn for tight spacing, and wide-tracked caps are the "luxury template" cliché. *Ref:* Apple product films, Swiss typographic practice.
4. **Tight leading on display.** Multi-line headlines use `lineHeight` **0.92–1.0**. Body uses 1.3–1.4.
   *Why:* stacked lines should lock into a single block shape. *Ref:* Collins, Koto.
5. **Break lines by meaning, not width.** A line ends at a phrase boundary, with no widowed single words and no orphaned article ("a", "the", "of") at a line end. A display line holds at most **3–4 words**.
   *Why:* the break is the rhythm of the sentence on screen. *Ref:* Saul Bass and Kyle Cooper title craft, Stripe Sessions keynote slides.
6. **Hold time = 400 ms + 250 ms per word, minimum 1.2 s**, counted from when the last word is fully settled to when the exit starts. Example: 4 words → 1.4 s (84 frames). A line nobody can read is a fail.
   *Why:* audiences read display type at about 3–4 words/s, and subtitle standards land at ~160–180 wpm. *Ref:* broadcast/subtitle reading-speed norms, Apple's hold-heavy keynote pacing.
7. **Type enters by revealing, not by "fading up from blur".** Allowed entrances are: (a) a line-mask slide, where text moves up **0.6–1.0x its line height** inside an `overflow:hidden` box; (b) word-by-word cuts on beat; (c) a hard cut on. Use opacity only together with a ≤ 24 px move, and never on its own for longer than 10 frames.
   *Why:* a mask reveal makes the type feel physically set in the frame, while a soft fade reads as a default preset. *Ref:* Linear launch films, Vercel Ship titles, Buck's type work.
8. **Stagger words 40–70 ms apart (3–4 frames)** and characters 15–25 ms apart (1–2 frames). Don't stagger more than about 8 units, or the total reveal goes over 500 ms.
   *Why:* a short stagger reads as one gesture, and a long one reads as a typewriter gimmick. *Ref:* Material/IBM Carbon choreography, Apple keynote builds.
9. **Exits are faster than entrances: about 60–70% of the entry duration**, eased *in*. Better still, don't exit at all: let the next scene's element cut or wipe over it.
   *Why:* attention has already moved on, and a slow exit drags. *Ref:* IBM Carbon "exit" curves, Disney principle "slow in/slow out" applied asymmetrically.
10. **Real copy only.** Use the product's actual name and the approved line. Don't invent taglines, fake stats, fake testimonials or lorem UI.
    *Why:* invented copy is the fastest way to read as generated. *Ref:* every studio brief, where copy comes from the client.

## B. Composition

11. **Build on a 12-column grid with 120 px outer margins and 24 px gutters** (column ≈ 118 px at 1920). Every text block's left edge snaps to a column line. Add a baseline unit of **8 px**.
    *Why:* the hidden grid is what makes the frames feel designed rather than placed. *Ref:* Müller-Brockmann, *Grid Systems*; Pentagram motion identities.
12. **Asymmetry is the default.** Left-align text and anchor it to the left third or the lower-left quadrant. Keep at most **one** centred frame in the whole film, and reserve it for the logo lock-up.
    *Why:* a centred stack is the template default, and asymmetric tension makes the eye travel. *Ref:* Swiss International Style, Koto and DixonBaxi brand films.
13. **No more than 3 elements on screen at once** (one headline, one supporting element and one graphic device). Count each line of text and each shape group as one.
    *Why:* one focal point per beat, so the viewer always knows where to look. *Ref:* ManvsMachine, Apple "one idea per shot".
14. **At least 40% negative space in every frame**, measured as area with no type or graphic. Empty space is a compositional element, not something to fill.
    *Why:* AI and template output fills every inch, which is one of the most-cited tells. *Ref:* Apple product films, r/graphic_design consensus on AI layouts.
15. **Crop off-frame on purpose.** Let at least one large element (a giant glyph, a rule or the brand mark) bleed **20–60%** past an edge in at least a third of the scenes.
    *Why:* cropping implies a world larger than the frame and signals confidence. *Ref:* Collins, ManvsMachine, Gretel network packages.
16. **Hard edges and flat planes.** Use solid colour fields, hairline rules (1–2 px) and crisp rectangles. Corner radius is 0, or a single radius used consistently. No cards.
    *Why:* graphic flatness reads as editorial, and floating rounded cards read as SaaS UI kits. *Ref:* Pentagram, Swiss poster tradition.
17. **Rotate compositions.** Consecutive scenes must not share the same layout. Change anchor quadrant, scale or orientation each cut.
    *Why:* repeated identical layout is what a template generator does. *Ref:* DixonBaxi system films.

## C. Timing and easing

18. **House curves.** Define them once in `theme.ts` and use only these:
    - `enter`: `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out; fast arrival, long settle)
    - `exit`: `cubic-bezier(0.7, 0, 0.84, 0)` (expo-in)
    - `move`: `cubic-bezier(0.65, 0, 0.35, 1)` (in-out, for things travelling across frame)
    - `standard` (UI-ish micro moves): `cubic-bezier(0.2, 0, 0, 1)` (Material 3 emphasized)
    Never use linear motion except for constant drift or timecode. Never use Remotion's default `spring()` without explicit `damping ≥ 18`, `mass ≤ 1`.
    *Why:* consistent curves are the brand's "gait", and mixed defaults read as unconsidered. *Ref:* IBM Carbon productive/expressive curves, Material 3, Linear/Vercel web motion.
19. **Durations:** micro (rules, labels) **200–300 ms**; type reveals **400–600 ms**; large spatial moves and wipes **600–900 ms**; nothing over **1.2 s** except a deliberate slow push.
    *Why:* screen motion over ~1 s without purpose feels sluggish. *Ref:* Carbon/Material duration tokens, Apple film pacing.
20. **Overshoot at most once per film**, at most **3–6%** past target, and only on the hero brand moment. Everything else settles without bounce.
    *Why:* a bouncy everything reads as cartoon or app-store promo, and serious legal tech needs authority. *Ref:* Disney "follow-through" used sparingly, Pentagram restraint.
21. **Anticipation on big moves:** a 3–6 frame counter-move of 1–2% scale or 8–16 px before a large travel or wipe.
    *Why:* it gives weight and lets the cut "breathe in". *Ref:* Disney 12 principles (anticipation), Buck.
22. **Holds beat constant motion.** In every scene, at least **50% of the frames are near-static** (nothing moves more than 2 px/frame). Don't put perpetual drift, float or slow zoom on everything.
    *Why:* contrast between stillness and snap is what makes motion feel intentional. *Ref:* Apple product films, Linear launch videos.
23. **Rhythm to a grid of beats.** Choose a tempo (e.g. **120 BPM = 500 ms = 30 frames**) and put every cut and every major arrival on a beat or half-beat (15 frames).
    *Why:* picture and sound locked to one clock feels composed. *Ref:* ManvsMachine and Nike, Vercel Ship openers.
24. **Cut on action.** Cut while an element is still moving at ≥ 60% of peak velocity, and let the next shot continue the vector (same direction, similar speed).
    *Why:* the eye follows momentum through the cut, so it reads seamless. *Ref:* film editing practice, Apple product films.
25. **Scene length 1.5–4 s.** A 30 s film has about **8–12 beats**. Use no more than 2 scenes under 1 s, and only as a deliberate rapid-fire run.
    *Why:* it's long enough to read and short enough to keep momentum. *Ref:* Stripe Sessions and Linear launch cut-downs.

## D. Colour

26. **Palette is ≤ 4 colours: an off-black, an off-white and one brand colour, plus at most one neutral grey.** Use exact hex values from `theme.ts` and nothing ad hoc.
    *Why:* restraint is the signature of premium identity work. *Ref:* Pentagram, Collins, Linear.
27. **The brand colour appears in ≤ 15% of frame area** in most scenes, and floods the full frame in 1–2 key scenes at most (a colour-field "hit").
    *Why:* scarcity gives the colour meaning, and a full-frame flood then lands as an event. *Ref:* DixonBaxi (Eurosport, Roblox), Koto.
28. **No pure #000 or #FFF.** Use something like `#0E0E0C` and `#F2F0EA`. Contrast between text and background must be ≥ 7:1 for display text.
    *Why:* pure values look digital-default, and tinted neutrals feel printed. *Ref:* editorial and print-derived identities.
29. **No glow, bloom, outer shadow, neon or gradient text.** Depth comes from scale, overlap and value contrast. A single, subtle full-frame film grain (≤ 3% opacity) is allowed.
    *Why:* glow is the defining "AI tech" tell. *Ref:* Apple, Linear (which uses gradients only as large, deliberate light fields, never on type or icons).
30. **No multi-stop gradients.** If any gradient is used, it is 2 stops of the same hue, ≤ 10% luminance difference, on a background plane.
    *Why:* purple-to-teal gradients are the 2023–26 generic tech look.

## E. Transitions

31. **Graphic continuity:** at least **50% of cuts** carry one element (a rule, a block, a glyph, the brand colour field) from scene N into N+1, where it changes role (e.g. an underline becomes a horizon, and a block becomes the next background).
    *Why:* one element threading the film is what makes it feel like a system, not a slideshow. *Ref:* ManvsMachine Xbox "morphing X", DixonBaxi History "H" stings, Saul Bass.
32. **Match cuts on shape or position:** an element ending at (x, y, scale) in scene N starts at the same values in N+1.
    *Why:* matches are free continuity. *Ref:* film editing, Apple product films.
33. **Mask and wipe reveals, not crossfades.** Transitions are a hard cut, a geometric wipe (clip-path rect, 600–800 ms, `move` curve) or a colour-field push. **Zero crossfades** between scenes, and no dip-to-black longer than 6 frames except at the final logo.
    *Why:* a crossfade is the non-decision transition, while wipes and cuts are authored. *Ref:* Swiss motion, Vercel Ship, Collins.
34. **No preset transitions:** no zoom-blur, spin, glitch, light leak, page-curl or "shatter".
    *Why:* these are instantly recognisable plug-in looks.

## F. Sound design (no VO)

35. **Every hard cut or arrival that matters has a sound, and every sound has a picture event**, within **±1 frame** (sound may lead by 1–2 frames, never lag).
    *Why:* the ear forgives less than the eye, and lag reads as amateur. *Ref:* ManvsMachine and Nike, Apple keynote stings.
36. **Palette of 4–6 sound types:** low transient hit (kick/tom, 40–80 Hz body); short tick/click for type; filtered noise swish for wipes (duration = wipe duration, panned in direction of motion); one riser; one sonic logo. No cinematic "BRAAAM", no generic stock whoosh pack.
    *Why:* a small, consistent sound palette is to the ear what a limited colour palette is to the eye.
37. **Risers end exactly on the cut, and are 1–2 bars long** (2–4 s at 120 BPM), with a hard stop.
    *Why:* tension resolves only if the release is precise.
38. **Use silence.** Place **one** deliberate 300–600 ms drop to near-silence (≤ -40 dBFS) right before the brand reveal.
    *Why:* contrast makes the logo hit land. *Ref:* Apple product film reveals.
39. **Sonic logo = 2–4 notes or a single tonal hit, ≤ 1.5 s, synced to the logo's final settle frame** and repeated nowhere else in the film.
    *Why:* a sonic logo must be short enough to remember. *Ref:* Intel and Netflix "ta-dum" practice.
40. **Mix:** peak ≤ -1 dBTP, integrated around -16 LUFS for web. The low end is mono, and swishes pan with motion.

## G. Banned list (any one of these is a hard fail)

| # | Banned | Why it reads as AI/template |
|---|---|---|
| B1 | Glow, bloom, neon, coloured drop-shadows, outer glow on anything | The default "futuristic tech" look of generators and stock packs |
| B2 | Floating particles, bokeh dots, sparkles, star fields, dust | Filler motion that hides an absence of idea |
| B3 | Glassmorphism, frosted cards, gradient-filled icon squares | 2021–25 Dribbble/SaaS UI-kit cliché |
| B4 | Tron/synthwave perspective grid floors, wireframe globes, network-node meshes | Stock "technology" signifier |
| B5 | Dot-grid or blueprint-grid backgrounds as decoration | Generic Figma/landing-page texture |
| B6 | Serif-italic accent word inside a sans headline | The most recognisable 2023–26 AI landing-page move |
| B7 | Fake product UI (invented dashboards, chat bubbles, charts with fake numbers) | Reads as mock-up, not product; erodes trust |
| B8 | Invented tagline, fake stats, invented testimonials | Generated copy |
| B9 | Centred-stack layouts in more than one scene (besides the logo end-card) | Template default composition |
| B10 | Purple/teal/blue multi-stop gradients, gradient text, mesh gradients | Generic AI-tech palette |
| B11 | Emoji, stock icons (Lucide/Heroicons/Feather), sparkle ✦ icons, "AI" stars | Icon-library and AI-feature clichés |
| B12 | Crossfades between scenes; preset transitions (zoom-blur, glitch, light leak) | Non-decisions and plug-in looks |
| B13 | Perpetual float/bob/slow-zoom on every element; bounce on everything | Motion without intention |
| B14 | Typewriter cursor effect, scrambled-letter "decode" text | Overused "tech" gimmick |
| B15 | Scales of justice, gavels, pillars, Lady Justice, Ashoka-chakra clip-art | Literal legal clip-art; signals no concept |
| B16 | Tricolour stripes or saffron/green accents used as "Indian" shorthand | Lazy cultural signifier, not identity |
| B17 | Pure #000/#FFF, pure saturated RGB brand colours | Digital-default, unconsidered |
| B18 | More than 2 typefaces, display "tech" fonts (Orbitron, Exo, etc.), Inter at default settings with no tracking | Gimmick or unconsidered typography |
| B19 | Cramped frames with < 40% negative space or > 3 elements | The single most-cited AI-layout tell |
| B20 | Rounded "pill" badges/chips with labels like "New", "AI-powered", "Beta" | SaaS landing-page furniture |

## H. Pre-render checklist

- [ ] Every scene's frame range, layout anchor and transition are written down before animating.
- [ ] Every text hold meets rule 6.
- [ ] Only the four curves from rule 18 appear in code (`grep -n "bezier\|Easing\." src`).
- [ ] Palette constants only (`grep -nE "#[0-9a-fA-F]{3,6}" src` hits only `theme.ts`).
- [ ] No `boxShadow`, `filter: blur`, `textShadow` or `backdropFilter` (`grep -nE "boxShadow|textShadow|backdropFilter|blur\(" src`).
- [ ] Contact sheet (one still per scene) passes the slop-gate agent.

## I. Art-direction decision (2026-10-12, approved by the client)

The client chose a **hybrid** direction: the energy of their reference showreel, made specific to NyayaNidhi.
- The pillar mark is rendered as a 3D dot lattice and flies as "the plane". Its dotted teal contrail is the flight path, and six dotted rings mark the six products. These are the brand's own hero devices, so they are **exempt from B2 and B4**. B2/B4 still apply to any *decorative* particles, star fields, globes or meshes that aren't the mark, the path or the rings.
- **No technical frame (client decision, 2026-10-12):** no corner crosshairs, timecodes, progress bars, chapter counters or 'FLIGHT 01' labels. That is showreel furniture and never appears in an official company film. Treat any of these as a hard fail (B21).
- The ground is dark (`#0A0D13`). The brand teal is lifted to `#2BA8A3` for legibility on the dark ground. That's still a 4-colour palette.
- Centred framing is allowed for the hero object in the take-off scene, as well as the end card.

---

## J. Continuity (measurable; added 2026-10-13 after the v3 review)

Run `tools/motion-probe.ts` before any render you show anyone. Every shot must pass.
- **One world, one canvas, one camera rig per film.** No second canvas for a finale, no remounting the world between shots.
- **Camera paths are C2 B-splines reparametrised by arc length; timing is a speed profile with quintic blends** (`src/room/rig.ts`). Never ease every keyframe to rest.
- **Within a shot:** frame-to-frame change in screen speed ≤ 0.8 px/frame²; no stalled frames inside a move.
- **At 24 fps:** broad pans ≤ W/7 per second (≈ 11.4 px/frame at 1920) to avoid strobing.
- **Sub-frame accumulation** (`src/room/render/Pipeline.ts`): every frame averages ≥ 16 exposures across a 180° shutter, the lens aperture and the pixel. That gives true motion blur, depth of field and anti-aliasing.
- **Cuts are hard cuts on picture and sound events.** Within a shot, nothing pops: every appearance is a continuous function of time.

## K. "ROOM" (the cinematic film) — where it departs from A–I

"ROOM" is live-action grammar rendered in code: Villeneuve/Fraser framing, a Zimmer-style score. These departures are deliberate:
- **24 fps with a 180° shutter**; 2.39:1 letterbox opening to 16:9 when the room opens.
- **Atmosphere is the material.** Volumetric haze and light shafts are photographic light, not B1 "glow".
- **Titles are cinema supers.** Centred (or set in the dark third of the frame), faded, with a soft scrim for legibility over light.
- **People are silhouettes; product UI appears once,** at human scale, inside the world (the desk sheet).
- **All sound is original and synthesised** (`sound/room/`). Never stock, never samples.
