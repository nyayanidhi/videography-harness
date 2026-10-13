# Rilin product components: catalogue for the launch film

Rilin is the contractual liability control product by Suvarna Nyayanidhi Pvt Ltd. This catalogue lists the real product moments the film can show. Each one is rebuilt as crisp vector UI in Remotion/React, never invented.

Sources (captured 2026-10-12):
- **rilin.ai marketing site** at 1920×1080. Its product mocks are Figma exports with exact Tailwind values. Specs below come from computed styles in a live Chromium render, not from eyeballing.
  - Screenshots: `docs/rilin/site/`. Component crops are DPR 2, so each PNG is 2× the CSS px. Viewport slices are 1×.
  - Raw component HTML with every class: `docs/rilin/site-html/<same-name>.html`.
  - Site SVG assets (logo, status dots, Ask Rilin icons): `docs/rilin/site-assets/`.
  - Full rendered DOM: `docs/rilin/site-dom.html`. All visible text: `docs/rilin/site-text.txt`.
- **App code**, read-only: `nyayanidhi-ui/apps/rilin`. See Part B.

> **Two visual languages.** The marketing mocks (Part A) are the brand's own public framing of the product. They use Stack Sans Text, 2 px radii, saturated status chips and a navy/beige/charcoal palette. The shipping app (Part B) uses Instrument Sans, a teal primary and slate neutrals. **For the film, use the marketing-mock language for hero moments.** Its copy and data are public and approved, and it is designed to be read at a glance. Use the app language only when the film needs to show "the real app", and then use only real labels from Part B.

> **Film scale.** Native sizes are CSS px at a 1920 viewport, so they map 1:1 to a 1920×1080 frame. The mocks were designed for a scrolling web page: chip text is 10–12 px and body text is 14–16 px, which is too small to read on video. For a hero close-up, render a component at **1.75–2.25×** (for example, the 614 px Exposure card becomes about 1200–1380 px wide). Keep every internal ratio. The scale factors used in the notes below are suggestions.

> **Motion-principles conflicts** (`docs/motion-principles.md`):
> - The site cards use `drop-shadow(0 28px 14px rgba(0,0,0,.05))`. Rule 29 / B1 bans outer shadows, so drop them and get depth from the 1 px border and value contrast.
> - The site's beige "grid" backdrop (`#ebe9de` + 1 px grid) hits B5. Don't reproduce it, and put cards on the film ground instead.
> - The site's `fcRise` stagger and the house `enter` curve are the same curve, `cubic-bezier(0.16,1,0.3,1)`.
> - The site uses pure `#ffffff` card fills and pure `#000000` text. Rule 28 / B17 bans pure values, so map them to the film's off-white and off-black.
> - B11 bans stock icons. That means no Lucide icons in the film, even though the app uses Lucide. Use the site's own SVGs from `docs/rilin/site-assets/` (they are Figma-drawn), or no icon.

---

## 0. Brand tokens

### 0.1 Marketing-site tokens (rilin.ai)

**Typefaces**, all self-hosted variable fonts under `/fonts/`:

| Role | Family | Weights seen | Notes |
|---|---|---|---|
| Display headlines | **Stack Sans Headline** (`StackSans-Headline-Variable.woff2`) | 200 (section H2, 54 px / 1.14), 300 (hero, 40→~76 px / 1.1, tracking −0.066em) | Light weights only, very large. |
| UI text inside all product mocks | **Stack Sans Text** (`StackSans-Text-Variable.woff2`) | 300 (labels, meta), 400 (rows), 500 (titles, names), 600 (bold in answers) | This is the product-mock face. |
| Mono-style caps tags (`TRANSACTION`, `FINANCE`, `LIVE`, `MSA`, `REDLINE`) | Designed as **Geist Mono SemiBold**, *rendered as Inter 600* because Geist isn't loaded | 600, 10 px, line-height 1.0–1.6, **tracking 1 px**, uppercase | For the film, use Geist Mono 600 (the design intent) or Inter 600 with +1 px tracking. Pick one. |
| Ask Rilin answer body | **DM Sans** (the 9pt optical size) | 400 body / 600 headings | Used only inside the Ask Rilin answer pane. |
| App (real product) | **Instrument Sans** (`InstrumentSans-Variable.woff2` is also loaded on the site) | see 0.2 | |

**Colours**, exact hex values from the site:

| Token | Hex | Where |
|---|---|---|
| Navy (brand ink) | `#072939` | Dark sections, CTA buttons, chat bubbles, "→ 4 core obligations" tags, logo fill, link text ("Implement changes →") |
| Navy deep / intro | `#092736` | Intro logo blade background |
| Navy card on navy | `#0f384c` | Obligation cards in the transaction diagram, with border `rgba(255,255,255,0.1)` |
| FAQ/footer navy | `#0a2b3b` | Closing CTA band |
| Hero night | `#071f2b` / `#091217` | Hero background under the cloud ASCII art |
| Teal (department tag) | `#297373` | `TRANSACTION`, `FINANCE`, `INFOSEC`, `DELIVERY`, `LEGAL OPS` tag fills |
| Eyebrow teal | `#83cdcd` | Hero eyebrow "CONTRACTUAL LIABILITY CONTROL FOR ENTERPRISES" (14 px, tracking 1.2 px) |
| Sage (clause ref) | `#89bd9e` | `CLAUSE 7.2` text on navy |
| Live / active green | `#58bd41` (ACTIVE dot), `#5bba6f` (obligation bullet dot, radar glow) | |
| Charcoal | `#262320` | Radar section, Pan-India services section |
| Beige backdrop | `#ebe9de` | Feature-card backdrops (with 1 px grid; don't reproduce, see B5) |
| Ink | `#1e1e1e` (primary text in mocks), `#282828` (headings), `#292929` (body) | |
| Hairlines | `rgba(0,0,0,0.2)` (card border, header divider), `rgba(0,0,0,0.1)` (row dividers) | |
| Skeleton bar | `#e4e2de` | Placeholder text lines on the contract sheet |
| Track | `#e1e1de` | Empty part of the risk bar |
| **Status: critical / due / overdue** | `#c11106` | Chips `CRITICAL`, `DUE`, `OVERDUE`. Tint `#f9ede9` with a 1 px `#c11106` border for the at-risk row. Redline deletion uses `rgba(193,17,6,0.1)` + `#c11106` text. |
| **Status: caution / upcoming / due-in** | `#ae3f00` | Chips `CAUTION`, `UPCOMING`, `DUE IN 3 DAYS` |
| **Status: standard / done / live** | `#1e780c` | Chips `STANDARD`, `DONE`; `LIVE` text and dot. Redline insertion uses `rgba(30,120,12,0.1)` + `#1e780c` text. |
| Redline label | `#ff0000` on `rgba(40,40,40,0.1)` | `REDLINE` tag |
| Clause highlight | `rgba(255,223,44,0.4)` | Highlighted clause 8.2 in the document |
| Doc header (Google-Docs blue) | `#c2e6ff` | File title bar + 2 px border on the `.docx` viewer |
| Radar label colours | green `#08f40e`, orange `#fc8a21`, red `#fc2e21` | Timeline/radar callouts (neon; tone down for the film, see §1) |

**Shape language:** radii are **2 px** almost everywhere (cards, chips 1.8–2 px), 4 px on buttons, and 8 px only on chat bubbles and the counsel-recommendation box. Card borders are 1 px `rgba(0,0,0,0.1–0.2)`. No pills.

**Status chip spec** (one component, three colours): fill = status colour, text white, Stack Sans Text 400, **10.75 px**, tracking 0.18 px, uppercase, padding 3.6 px × 7.2 px, radius 1.8 px. The obligation-register variant is **12 px** text, padding 4 × 8, radius 2.

**Caps tag spec** (`MSA`, `SLA`, `NDA`, `FINANCE`…): fill `#1e1e1e` (contract type) or `#297373` (department), white, mono 600 10 px, tracking 1 px, padding 4 × 8, square corners.

**Site motion vocabulary**, from the site CSS:
- `fcRise`: children rise 10 px and fade in over 480 ms, `cubic-bezier(0.16,1,0.3,1)`, staggered at 200 / 290 / 380 / 470 / 560 / 650 ms (90 ms steps).
- `headline-reveal`: rise 28 px, blur 10→0, fade, 750 ms, same curve. Don't use the blur in the film (rule 29).
- `askMsgIn`: chat message rises 16 px over 520 ms. `askLineIn`: answer lines rise 8 px.
- Radar: `radar-spin` 6 s linear reverse (sweep), `radar-ping` 3 s (blips), `radarGlow` 4 s.
- Intro: `rilinBarRise` (logo pillars scaleY 0→1), `rilinEmblemRise` (emblem rises 225 px to centre), `introWordUp` (words rise 40 px). Frames are in `site/01-intro-frame*.png`.

**Logo:** `docs/rilin/site-assets/imgLogoContainer.svg` is the "rilin" wordmark with the pillar emblem, fill `#072939`. It is the same mark the storyboard calls "the plane".

### 0.2 App tokens (nyayanidhi-ui/apps/rilin)

These are read from code. Paths are relative to `nyayanidhi-ui/apps/rilin/src/` unless they start with `packages/`.

- **Font:** **Instrument Sans**, the single app font. `app/layout.tsx` loads it via `next/font/google` as `--font-app` (variable, weights 400–700). `html, body` use `var(--font-app)`.
  - Weight usage across the code: `font-medium` 2155 uses, `font-semibold` 1098, `font-normal` 280, `font-bold` 65.
  - No mono font is loaded. `--font-geist-mono` is referenced but never defined.
  - Most common sizes: 12 px (887), 13 px (793), 11 px (460), 10 px, 14 px, 16 px, 18 px. Page titles are **18 px bold `#012637`**.
- **Theme** (`packages/ui/styles/theme.css`, shadcn new-york, base zinc, Tailwind v4 with no config file):
  - `--radius` is 10 px, so `rounded-lg` = 10 px, `md` = 8 px, `xl` = 14 px.
  - `--primary` is zinc-900 (`#18181b`). Background and card are white. `--border` is `oklch(0.92 0.004 286)`.
  - Chart tokens: chart-1 orange, chart-2 teal (`#2a9d90` in code), chart-3 to chart-5.
  - Status tokens: on-track `#edfaf5`/`#0f7b6c`, at-risk `#fffbeb`/`#bb4d00`, overdue `#fef2f2`/`#c10007`, closed `#f1f5f9`/`#45556c`.
- **Most-used hex values** (counts across `src`):

  | Hex | Count | Role |
  |---|---|---|
  | `#62748e` | 1459 | slate-500, muted text and idle tabs |
  | `#e2e8f0` | 1378 | slate-200, borders and chips |
  | `#0f172b` | 834 | slate-900 |
  | **`#007574`** | 689 | **brand teal**: CTAs, avatar fallback, progress ring, underline on contract tabs |
  | `#f1f5f9` / `#f8fafc` | 644 / 604 | slate-100 / 50 |
  | `#020618` | 517 | slate-950, ink |
  | `#90a1b9` | 483 | slate-400 |
  | `#45556c` | 408 | slate-600 |
  | `#1d293d` | 370 | slate-800, **dark primary buttons** |
  | `#012637` | 206 | deep navy, page titles |
  | `#c10007` | 141 | red, overdue |
  | `#2a9d90` | 93 | teal, **active-tab underline** |

- **App ground:** `#fffffc` (dashboard shell) or white.
- **Header:** 46 px, white, shadow `0 0 12px rgba(7,41,57,0.06)`.
- **Buttons:**
  - Dark: `h-8 rounded-lg bg-[#1d293d] px-2.5 text-[12px] font-medium text-white`.
  - Outline: `h-8 rounded-lg border-[#e2e8f0] bg-white`.
  - Teal CTA: `bg-[#007574]`.
- **Status pill grammar:** `rounded-[3px] px-[9px] h-[22.5px] text-[11px] font-semibold` with a pastel fill and a dark same-hue text. This is the app's equivalent of the site's solid chips.
- **Brand gradients** (Ask dock: `#007574 → #034D71 → #00DBD9`; consult text gradient) are multi-stop. They break rules 29/30 and B10, so don't use them in the film.
- **Mark:** `RilinIcon` in `packages/ui/src/icons/rilin.tsx` (pillar mark with ghost paths at 10%). Files: `public/brand/rilin-mark-solid.svg`, `public/rilin-logo-light.svg`.
- **Icons:** lucide throughout. Don't reproduce them in the film (B11).

**Film palette mapping** (suggested; fits the 4-colour rule):

| Role | Value |
|---|---|
| Ground | `#0A0D13`, per art direction |
| Off-white | `#F2F0EA` |
| Brand | `#2BA8A3` on dark (lifted `#007574`), or `#007574` on light cards |
| Neutral | slate `#62748e` |

Status chips are product data, not decoration. Treat the trio `#c11106` / `#ae3f00` / `#1e780c` as an allowed *data* exception, confined to chip and bar fills and never used as a field colour. Get the client's sign-off on this exception, because rule 26 is strict.

---

# Part A — Components shown on rilin.ai

## 1. Lifecycle timeline / "Liability Exposure" radar

**Purpose:** frames Rilin's territory, the stretch between Day 1 (contract executed) and Day N (litigation initiated), where exposure builds from deadlines and rights.

**Exact copy:** headline "Lawyers show up at the start and at the end, / Rilin runs everything in between." · left node `DAY 1` / `CONTRACT EXECUTED` · right node `DAY N` / `LITIGATION INITIATED` · centre `LIABILITY EXPOSURE` · callouts `NOTICE WINDOW` (green), `PAYMENT DUE` (orange), `RENEWAL DEADLINE` (red), `TERMINATION RIGHT` (green).

**Visual spec (1920 frame, native):**
- Section ground `#262320`. The headline is Stack Sans Headline 200, 54 px / 61.6 px, white, centred, at the top of the section.
- Horizontal axis at the vertical centre of the radar, running from x≈502 to x≈1418 (916 px). It is a 1 px line at about `rgba(255,255,255,0.4)` with 8 px white end dots.
- Node labels sit above each end dot, centred. `DAY 1` / `DAY N` are Stack Sans Text 400, 12 px, tracking 0.4 px, white at 40% opacity. `CONTRACT EXECUTED` / `LITIGATION INITIATED` use the same type at 100%.
- Radar centred at (960, 584). Rings from outside in: ~556 px and ~476 px diameter faint rings (`rgba(255,255,255,0.06)`); a 400 px disc with fill `rgba(91,186,111,0.1)` and a dashed green ring (`#5bba6f`, ~2 px, dash ≈ 14/10) with tick marks every 30°; a 304 px inner ring (`#5bba6f` at about 40%); and a faint crosshair.
- Sweep: a green wedge of about 15–20° (`#5bba6f` → transparent) rotating 6 s/rev counter-clockwise. The site uses `radar-spin` reversed.
- Centre label `LIABILITY EXPOSURE`: Stack Sans Text 300, 20 px / 30 px, white.
- Blips are 8 px dots: red at about 10 o'clock inside, green at about 1 o'clock, orange at about 4 o'clock, green at about 7 o'clock. They pulse with `radar-ping` (opacity 0.6↔1, 3 s).
- Callouts: 1 px colour leader line from blip to label. The label box is 1 px colour border, a 24 × 34 px solid colour swatch on the left, text Stack Sans Text 300, 14 px, white, padding 8 px. Box sizes: 156 × 36 (NOTICE WINDOW), 135 × 36 (PAYMENT DUE), 176 × 36 (RENEWAL DEADLINE), 178 × 36 (TERMINATION RIGHT).

**Film animation:** this is the spine of the film. Option A: draw the Day 1 → Day N axis left to right (600–900 ms, `move` curve), then let the radar sweep "find" each blip in turn. Each blip lands with a tick, and its callout draws its leader line and box in 250 ms. The order follows contract time: Notice window → Payment due → Renewal deadline → Termination right. Hold on "LIABILITY EXPOSURE". Option B (narrative): make the axis the literal film timeline. A playhead travels from DAY 1 towards DAY N, each later scene is a stop along that axis, and the film ends before the playhead reaches DAY N ("Rilin runs everything in between").
*Palette note:* the neon `#08f40e` / `#fc2e21` fail rule 28 and B17. For the film, map them to the status trio `#1e780c` / `#ae3f00` / `#c11106`, or lifted versions on the dark ground, and keep the swatch-plus-outline label shape.

**Screenshots:** `docs/rilin/site/10-timeline-radar.png`, `docs/rilin/site/viewport-01-y1080.png`.

## 2. Transaction → Contract → Obligations breakdown ("IT Vendor Onboarding")

**Purpose:** shows the core idea. A Transaction holds contracts, which break into owned obligations, and each obligation maps back to a clause.

**Exact copy:**
- Headline "A business doesn't run on a legal document. It runs on actions."
- Body "Rilin breaks each transaction that includes one or more contracts into business actions: Owned, assigned, tracked. Every action maps back to the clause it satisfies."
- Transaction card: `TRANSACTION` · `● ACTIVE` · **IT Vendor Onboarding** · `ID:TXN-2026-014` · `→ 4 core obligations`
- Contract sheet: `CONTRACT` · **Master Services Agreement** · `→ 12 material clauses`
- Obligations (title / dept tag / clause / timing; the bold part is shown in brackets):
  1. Submit certificate of insurance / `FINANCE` / `CLAUSE 7.2` / Within [30 Days] Of Execution
  2. Remediate Critical vulnerabilities / `INFOSEC` / `CLAUSE 11.4` / Within [48 Hours] Of Discovery
  3. Issue formal SLA credit report / `DELIVERY` / `CLAUSE 4.3` / Within [10 Business Days] Of Month-End
  4. Provide written notice of non-renewal / `LEGAL OPS` / `CLAUSE 9.5` / Atleast [90 Days] Prior To Term End (the site spells it "Atleast")

**Visual spec:**
- Section ground `#072939` with a faint 1 px grid. Don't reproduce the grid (B5).
- **Transaction card:** 303 × 162 at (300, 351). Fill white, radius 2, padding 12, vertical gap 24.
  - Row 1: `TRANSACTION` tag (fill `#297373`, white mono 600 10 px, tracking 1 px, padding 4 × 8) on the left; `● ACTIVE` on the right (8 px dot `#58bd41`, then mono 600 10 px black).
  - Row 2: title Stack Sans Text 500, 22 px, black. ID `ID:TXN-2026-014` in mono 500 10 px, tracking 1 px, `#072939` at 80%.
  - Row 3: `→ 4 core obligations` tag (fill `#072939`, white Stack Sans Text 400, 10 px, tracking 0.2 px, padding 4 × 8).
- **Contract sheet:** 195 × 260 white sheet (padding 24 × 12, radius 2, folded top-right corner) with two ghost sheets behind it (white at 20% opacity, rotated about ±4°).
  - Eyebrow: 2 × 16 px `#072939` bar, then `CONTRACT` in mono 500 10 px, tracking 1 px.
  - Title Stack Sans Text 500, 22 / 26.4 px, black, three lines.
  - Four skeleton lines: 8 px tall, `#e4e2de`, radius 2, widths 100 / 149 / 100 / 140 px.
  - `→ 12 material clauses` tag, same style as the transaction tag.
- Connector: 1 px line (`#7a8f99`-ish) from the transaction card's right edge through the sheet to a 6 px hub dot at x≈1034. From the hub, four angled 1 px lines fan out to the obligation cards.
- **Obligation cards:** 411 × 105 each, x = 1161, with ~24 px vertical gap (tops at 190 / 319 / 448 / 577). Fill `#0f384c`, 1 px `rgba(255,255,255,0.1)` border, radius 2, padding 16, gap 8.
  - Title row: 6 px `#5bba6f` dot, then Stack Sans Text 500, 16 px, tracking −0.2 px, white.
  - Tag row: dept tag (fill `#297373`, mono 600 10 px, tracking 1 px, white, padding 4 × 8), then `CLAUSE x.y` in Stack Sans Text 400, 10 px, `#89bd9e`.
  - Timing row: Stack Sans Text 400, 10 / 16 px, white at 50%, with the quantity (e.g. "30 Days") at full white.

**Film animation:** the canonical "after signing" moment. Beat 1: the transaction card lands (`ACTIVE` dot pulses once). Beat 2: the connector draws right into the contract sheet, and the sheet's ghost pages fan out. Beat 3: the hub splits into four lines that draw out, and each obligation card arrives on a 90 ms stagger (the site's own fcRise rhythm). Beat 4: the camera pushes to obligation 1 and the `CLAUSE 7.2` ref highlights. That carries into the next scene, where the clause-to-obligation mapping is literal. Scale to about 1.4× and crop to the right two-thirds for the fan-out.

**Screenshots:** `docs/rilin/site/20-transaction-breakdown.png` (whole diagram), `21-transaction-card.png`, `22-contract-card.png`, `23-obligation-card.png`, `viewport-02-y2160.png`.

## 3. Risk Surfacing — "Exposure - Contract Stack"

**Purpose:** shows exposure scored across every contract continuously, with a live risk ranking.

**Exact copy:** feature title "Risk Surfacing" · subtitle "Exposure mapped across every contract, continuously." · card header "Exposure - Contract Stack" · `● LIVE` · rows:

| Counterparty | Type | Level | Score |
|---|---|---|---|
| Acme Corp | MSA | CRITICAL | 0.92 |
| Globex | SLA | CAUTION | 0.42 |
| Initech | NDA | STANDARD | 0.15 |

**Visual spec:**
- Card 614 px wide (580 inner), white, 1 px `rgba(0,0,0,0.2)` border, radius 2, padding 16.
- Header row: padding 8 top / 16 bottom / 8 sides, bottom border 1 px `rgba(0,0,0,0.2)`. Title Stack Sans Text 300, 14 px, `#1e1e1e` at 50%. `LIVE` on the right: 8 px `#1e780c` dot, gap 4, mono 600 10 px, tracking 1 px, `#1e780c`.
- Rows: 70 px tall (padding 24 × 8), bottom border 1 px `rgba(0,0,0,0.1)`. The last row has no border.
  - Left: name in Stack Sans Text 500, 14 px, `#1e1e1e`, then gap 8, then the type tag (`#1e1e1e` fill, white mono 600 10 px, tracking 1 px, padding 4 × 8).
  - Right cluster, right-aligned: status chip (see 0.1, 10.75 px) → gap 16 → bar track 200 × 8 (`#e1e1de`, radius 2) → gap 16 → score (Stack Sans Text 400, 10.75 px, in the status colour).
  - Bar fill widths as rendered: 184 px (0.92), 114 px (0.42), 184 px (0.15). The Initech fill is drawn long on the site. **For the film, make bar width ∝ score** (184 / 84 / 30 px of 200) so the visual matches the data.

**Film animation:** the risk score flips to CRITICAL.
- Start with Acme Corp at `STANDARD 0.15`, green.
- An event lands. In the story, this is the vendor's breach email or the uncovered clause 8.2 from §5.
- The bar grows 0.15 → 0.92 over about 600 ms (`standard` curve) while the number counts up.
- The chip colour cuts green → amber (`CAUTION` at 0.42) → red (`CRITICAL` at 0.92). Each chip swap is a hard cut, with a tick sound on each.
- The rows re-sort so Acme rises to the top. Hold for 1 s.
- The `LIVE` dot blinks once per second throughout. It is the only perpetual motion.
- Scale about 2×, so the card is about 1230 px wide.

**Screenshots:** `docs/rilin/site/31-exposure-contract-stack.png`, `30-four-operations-grid.png`, `viewport-03-y3240.png`.

## 4. Specialist counsel card

**Purpose:** shows empanelled counsel engaged from inside the platform, with full contract context already loaded.

**Exact copy:** feature title "Specialist counsel" · subtitle "Empanelled counsel, loaded with full contract context" · **Adv. Ajit Belliappa** · `Specialist Counsel` / `Employment Law` · `Matter` → "Non-compete enforceability" · `Contract` → "MSA-2026-014" · button **Consult Counsel**.
FAQ support: "Does Rilin replace outside counsel? No. Rilin does not replace counsel. If needed, empanelled specialist counsel can be engaged through the platform with full contract context already loaded."

**Visual spec:**
- Card 409 px wide, white, 1 px `rgba(0,0,0,0.1)` border, radius 2, padding 16, gap 16.
- Header row: 80 px circular photo (a real-looking portrait asset, `imgEllipse98.png`), gap 8, name in Stack Sans Text 500, 16 px, `#1e1e1e`. Right column (gap 4): `Specialist Counsel` in Stack Sans Text 300, 12 px, at 50%, with `Employment Law` below at 100%.
- Divider 1 px `rgba(0,0,0,0.1)`.
- Two-column meta: labels (`Matter`, `Contract`) in Stack Sans Text 300, 14 px, at 50%; values in 14 px black. Columns are 196 px and the rest.
- Divider.
- Button: full width, 37 px tall, radius 4, padding 8 × 24. Fill `#072939` with a 1 px `#556c76` ring and a subtle inset bevel. Label "Consult Counsel" in Stack Sans Text 300, 16 px, tracking −0.32 px, white, centred.

**Film animation:** the escalation moment. The card slides in from the right edge (`enter`, 500 ms). Matter and Contract values fill in, so the context is "loaded". Then "Consult Counsel" depresses (scale 0.98, 120 ms) and the button fill flashes to the confirmed state. If the film needs a person, use this card and keep the portrait abstracted or monogrammed, because the site photo may be a stock likeness. Don't put a real advocate's name on screen without the client's sign-off.

**Screenshots:** `docs/rilin/site/32-specialist-counsel.png`, `30-four-operations-grid.png`.

## 5. Draft and Review — clause 8.2 redline

**Purpose:** shows every new agreement drafted, reviewed and analysed in one place. Rilin flags a weak clause and proposes the redline.

**Exact copy:**
- Feature subtitle "Every new agreement drafted, reviewed and analysed in one place". Leadership variant: "For Legal teams — Draft, review, and specialist counsel sit in one platform."
- Doc title bar: `Master-services-agreement.docx`
- Document body (verbatim):
  - 7. CONFIDENTIALITY
    - 7.1 The Parties acknowledge that, during the term of this Agreement, each Party may receive confidential and proprietary information.
    - 7.2 Each Party shall protect such Confidential Information using the same degree of care it uses to protect its own.
    - 7.3 Neither Party shall disclose Confidential Information to any third party except as expressly permitted.
  - 8. INDEMNITY
    - 8.1 Supplier shall indemnify, defend and hold Customer harmless from and against any third-party claims.
    - **8.2 Supplier may, in its sole discretion, maintain cybersecurity insurance coverage for an amount not exceeding ₹50,00,000.** (highlighted)
    - 8.3 Notwithstanding the foregoing, neither Party shall be liable for indirect, incidental or consequential loss arising under this Agreement.
  - 9. LIMITATION OF LIABILITY
    - 9.1 Each Party's aggregate liability under this Agreement shall not exceed the total fees paid in the preceding twelve (12) months.
    - 9.2 Nothing in this Agreement shall exclude or limit either Party's liability for fraud or wilful misconduct.
  - 10. TERM AND TERMINATION
    - 10.1 This Agreement shall remain in force until terminated by either Party in accordance with the notice provisions set out herein.
- Redline popover: `CLAUSE 8.2` · `REDLINE` · "Supplier may, in its sole discretion, maintain cybersecurity insurance coverage for an amount" · `- not exceeding ₹50,00,000` · `+ not exceeding ₹75,00,000` · `Implement changes →`

**Visual spec:**
- Doc viewer: 430 × ~393 px, white, 2 px `#c2e6ff` border.
  - Title bar: fill `#c2e6ff`, padding 8, 24 px blue Google-Docs-style file glyph, then the file name in Stack Sans Text 300, 14 px, `#1e1e1e`.
  - Body: padding 16, gap 24 between sections. Text is Stack Sans Text 300, 12 / 19.2 px, black. Section headings are 400 weight, uppercase.
  - Top and bottom 67 / 94 px white→transparent fades imply a scrolling page.
  - Clause highlight: background `rgba(255,223,44,0.4)` behind 8.2 only.
- Redline popover: 226 px wide, overlapping the doc's right edge (left 421, top 150 within the 621 px card area). White, 2 px `rgba(0,0,0,0.1)` border, radius 2, padding 9.4, gap 9.4.
  - Header: `CLAUSE 8.2` in Stack Sans Text 400, 11.8 px, `#282828`. `REDLINE` tag: fill `rgba(40,40,40,0.1)`, text `#ff0000` mono 600 11.8 px, tracking 1.18 px, padding 4.7 × 9.4.
  - Body: 11.8 / 18.8 px, black, weight 300.
  - Deletion line: fill `rgba(193,17,6,0.1)`, text `#c11106`, padding-x 9.4, with a "-" prefix.
  - Insertion line: fill `rgba(30,120,12,0.1)`, text `#1e780c`, with a "+" prefix.
  - Divider, then `Implement changes →` in 11.8 px, `#072939`, underlined.
- The popover is drawn at 0.785 of the 15 px base grid (its odd sizes are 11.771 = 15 × 0.785). For the film, rebuild it on a clean 15 px base: text 15, padding 12, tag 15 px.

**Film animation:** the redline applies.
1. The doc scrolls up to 8.2 (300 ms).
2. The yellow highlight sweeps left to right across 8.2 (400 ms).
3. The popover pops in beside it (`enter`, 300 ms, rising 8 px).
4. The `- ₹50,00,000` line appears, then the `+ ₹75,00,000` line 150 ms later.
5. The cursor clicks "Implement changes →".
6. In the doc, "₹50,00,000" strikes through in `#c11106`, and "₹75,00,000" types in as a single 200 ms reveal (not a typewriter, B14) and settles in `#1e780c`.
7. The highlight fades to none and the popover exits.

This pairs with the Ask Rilin "Can you explain this clause?" answer (§8d) and with the risk flip (§3).

**Screenshots:** `docs/rilin/site/33-draft-review-redline.png`, `34-redline-popover.png`, `viewport-03-y3240.png`.

## 6. Obligation Tracking — the obligation register

**Purpose:** shows every commitment held as a live register with owner, due date and status.

**Exact copy:** feature title "Obligation Tracking" · subtitle "Every commitment held as a live register" · columns `Obligation` / `Owner` / `Due` / `Status` · rows:

| Obligation | Owner | Due | Status |
|---|---|---|---|
| Submit certificate of insurance | Finance | Apr 12 | DUE |
| Remediate Critical vulnerabilities | Legal Ops | May 03 | UPCOMING |
| Issue formal SLA credit report | Delivery | Mar 28 | DONE |

(The owners here differ from §2, where Remediate is INFOSEC. Keep each component's copy as published, or pick one version for the film and use it consistently.)

**Visual spec:**
- Card 614 px wide, white, 1 px `rgba(0,0,0,0.2)` border, radius 2, padding 8 × 16.
- Column widths are about 268 (Obligation) / 104 (Owner) / 104 (Due) / rest (Status).
- Header row: 50 px tall, Stack Sans Text 300, 14 px, `#1e1e1e` at 50%, bottom border 1 px `rgba(0,0,0,0.2)`.
- Body rows: padding 24 × 8 (about 67 px tall), bottom border 1 px `rgba(0,0,0,0.1)`.
  - Obligation: Stack Sans Text 600, 14 px, `#1e1e1e`.
  - Owner and Due: 400, 14 px.
- Status chip: 12 px Stack Sans Text 400, tracking 0.2 px, white, padding 4 × 8, radius 2. Fills: `DUE` `#c11106`, `UPCOMING` `#ae3f00`, `DONE` `#1e780c`.

**Film animation:** an obligation gets done.
- Rows arrive with the fcRise stagger (90 ms).
- Hold, then flip "Issue formal SLA credit report" from `UPCOMING` amber to `DONE` green. Use a hard colour cut plus a 1-frame scale pop (1.04 → 1), which spends the film's single overshoot only if it isn't needed elsewhere.
- Alternative: the Owner cell starts empty ("—"), and "Finance" drops in (assignment moment).
- Then the `Due` date of row 1 ticks down to today and its chip cuts to `DUE` red.

**Screenshots:** `docs/rilin/site/35-obligation-register.png`, `35b-obligation-register-in-card.png`, `viewport-03-y3240.png`.

## 7. Managed legal operations (Pan-India)

**Purpose:** shows the human legal operation behind the software: counsel, clerks, despatch and representation.

**Exact copy:** "A Pan-India legal operation, behind every action." · "Counsel, clerks, despatch operations, and senior representation — coordinated across India's courts and tribunals so every matter moves on time, in the right place, and with the right hand on the file." · cards:
- "Counsel who review and sign"
- "Clerks for procedural compliance"
- "Operations from despatch to diary"
- "Legal representation from senior counsel"

The full body text for each card is in `docs/rilin/site-text.txt`.

**Visual spec:**
- Ground `#262320`. H2 is Stack Sans Headline 200, ~54 px, white. The intro paragraph is ~18 px white at about 70%.
- "Know more" button: 1 px white-at-40% outline, radius 2.
- 2 × 2 grid. Each cell has a 40 px line icon in green `#5bba6f` (signature, layers, route, gavel), a title in Stack Sans Text 500, 24 px, white, and body text at ~17 px, white at 65%.

**Film animation:** mostly copy, with no data UI. At most use it as a single type card. Skip the gavel icon (B15).

**Screenshot:** `docs/rilin/site/40-managed-services.png`, `viewport-04-y4320.png`.

## 8. Ask Rilin (four conversations)

**Purpose:** answers business questions on uploaded contracts and documents with risk, affected obligations and next actions, all grounded in organisational memory.

**Section copy:** "Ask Rilin anything, know what impacts your business" · "Upload any contract and agreement. Rilin identifies the risk. surfaces affected obligations, and recommends the next actions". The site has the typo "risk. surfaces". Don't reproduce it, or fix it to "risk, surfaces".

Left tab list (active = full opacity + 4 px `#072939` left bar; inactive = 50%):
1. **Organisational memory for legal risk** — "Every legal matter becomes searchable institutional knowledge, connecting new issues to past disputes, vendors, contracts, and obligations."
2. **Upload anything. Ask anything.** — "NDA, MSA, Employment agreement, contractor agreement, and sales agreement."
3. **Know the business impact immediately** — "See exposure, obligations, deadlines, stakeholders, and next actions without hunting for where to start."
4. **Built For everyone** — "Get answers on risk, obligations, options, and business impact. No legal research, no waiting for a memo."

Tab titles are Inter 600, 20 px / 32 px, tracking −0.4 px. Descriptions are Inter 400, 16 / 25.6 px, `#292929`. Each tab has a 24 px line icon.

**Conversations (verbatim):**

**8a. Apex Logistics (tab 1)**
- Q: "Have we worked with Apex Logistics before?"
- A: "**Yes. Apex Logistics** appears in **4 prior matters** across the organisation."
- **Related Organisational Records**: "Apex Logistics appears in 4 prior legal and commercial matters across the organisation."
  - Vendor Master Services Agreement (2024)
  - Delayed Shipment Dispute (March 2025)
  - Insurance Coverage Review (June 2025)
  - Data Processing Addendum (October 2025)
- **Key Observations**:
  - The limitation of liability clause in the current agreement is materially identical to a clause previously negotiated and accepted.
  - The March 2025 dispute involved missed delivery SLAs and resulted in a commercial settlement.
  - Procurement previously approved a risk exception relating to subcontractor usage.

**8b. FIR + vendor email (tab 2)**
- Attachments: `FIR.pdf` · Document (red PDF glyph); `Vendor Threat Email` · Document (blue DOC glyph)
- Q: "What does this mean for us?"
- **Documents Reviewed**:
  - FIR: "A criminal complaint has been filed naming a third-party contractor associated with your operations." **Current Exposure:** "No direct allegations against your organisation identified."
  - Vendor Threat Email: "The vendor alleges breach of contract and reserves the right to pursue legal remedies if payment remains outstanding." **Primary Concern:** "Escalation into a formal contractual dispute."
- **Recommended Actions**:
  - Legal team to review the FIR and assess potential downstream exposure.
  - Compliance team to prepare a regulatory response before the stated deadline.
  - Finance and Procurement teams to assess disputed invoices and contractual obligations.

**8c. Terminate before renewal (tab 3)**
- Q: "Can we terminate this vendor before renewal?"
- A: "Based on Clause 9.5 of the Master Services Agreement, the contract may be terminated through non-renewal by providing written notice at least 90 days before the expiry date."
- "The current agreement is scheduled to expire on **12 September 2026**, which means the notice window closes on **14 June 2026**."
- "Before proceeding, consider any active obligations, outstanding invoices, and transition requirements that may survive termination."
- Boxed **Specialist Counsel Recommendation**: "→ The contract language appears enforceable. However, if termination is being considered due to performance concerns, counsel should review any dispute-resolution, cure-period, and indemnity provisions before notice is issued."

**8d. Explain clause 8.2 (tab 4)**
- Quoted clause in the bubble: "Supplier may, in its sole discretion, maintain cybersecurity insurance coverage for an amount not exceeding ₹50,00,000."
- Q: "Can you explain this clause?"
- **What This Means**:
  - "The supplier is **allowed, but not required**, to maintain cybersecurity insurance"
  - "The clause **does not guarantee** that insurance coverage exists."
  - "Even if the supplier chooses to obtain insurance, the maximum coverage contemplated under this clause is **₹50,00,000.**"
  - (The site repeats the "Before proceeding…" line here.)
- **Business Impact** → **Your Risk**: "If a cybersecurity incident occurs, there is no contractual assurance that insurance proceeds will be available to cover losses."

**Visual spec** (the panel is drawn at 0.844 of a 17.5 px base; values at 1920 native):
- App window: about 387 px wide (CSS), white, 1 px `rgba(0,0,0,0.2)` border, radius 2.1.
- Top bar:
  - Left: the `rilin` logo (70 × 25, `imgLogoContainer.svg`, `#072939`).
  - Right: two 34 px icon buttons with 1 px `rgba(0,0,0,0.1)` borders, radius 2. One is History; the other is a New-chat pencil plus a 16 px `#212121` square avatar with "T".
- User bubble: right-aligned, fill `#072939`, radius 8.4 on top-left, top-right and bottom-left (bottom-right square), padding 12.7 × 14.8. Text Stack Sans Text 300, 14.8 / 22.2 px, tracking −0.15 px, white.
  - Below the bubble: copy and edit icons (33.8 px hit areas, grey).
  - The quoted-clause variant (8d) puts the quote above the question, at 80% white with a 2 px white bar on the right.
- Attachment chips (8b): white, 1 px `rgba(0,0,0,0.1)` border, radius 8, padding 4/16/4/4. A 32 px coloured file glyph (PDF `#ff3c3c`, DOC `#0088ff`), then the name in 12 px black and "Document" in 12 px grey.
- Answer:
  - Headings in DM Sans 600 (or Stack Sans Text 500), 19 / 23.7 px, tracking −0.19 px, black.
  - Body in DM Sans 400, 14.8 / 22.2 px, tracking −0.15 px, black, with bold runs at 600.
  - Bulleted lists use a 4 px bullet with a 24 px indent.
- Counsel recommendation box: fill `#f5f5f5`, 1 px `rgba(0,0,0,0.1)` border, radius 8, padding 24 × 16. The header has a 24 px teal gavel glyph (`#297373`; B15, so drop it in the film) and the title in DM Sans 600, 19 px. Body at 80% opacity.
- Motion: `askMsgIn` (rise 16 px, 520 ms) for the bubble, then `askLineIn` (rise 8 px) staggered per answer block.

**Film animation:** answers arrive as blocks, not typed (B14).
1. The question bubble rises in.
2. Then a 300 ms "thinking" hold. Use no sparkle (B11). A static line works.
3. The answer blocks rise in on an 8 px / 90 ms stagger.

The two strongest beats:
- **8c**: the bold dates "12 September 2026" → "14 June 2026" are the moment, because the notice window becomes a dated deadline. Pair it with the radar's NOTICE WINDOW blip and the register's due-date column.
- **8a**: the 4 records list in one by one, with "4 prior matters" counting up. This is the organisational-memory beat.

Render the panel at about 2× (about 775 px wide) and crop to the bubble plus the first 3 answer blocks.

**Screenshots:** `docs/rilin/site/51-ask-rilin-tab1.png` (Apex Logistics), `52-ask-rilin-tab2.png` (FIR / vendor email), `53-ask-rilin-tab3.png` (terminate before renewal), `54-ask-rilin-tab4.png` (explain clause), `50-ask-rilin-section.png`, `viewport-05-y5400.png`.

## 9. For Leadership — analytics card ("4 operations at risk")

**Purpose:** gives leadership a preventive health check across the contract stack.

**Exact copy:** "What it looks like from where you sit." · "For Leadership — Rilin sits across your contract stack like a preventive health check." · card header `ANALYTICS` · `● LIVE` · alert row **Approve Weekly Quantities** / "4 operations at risk" / `OVERDUE` · next row "Conduct shipment arrival".

**Visual spec:**
- Card 384 px inner, white, 1 px `rgba(0,0,0,0.2)` border, radius 2, padding 16, gap 16.
- Header: as in §3 (14 px, 50% label; green `LIVE`).
- Alert row: fill `#f9ede9`, 1 px `#c11106` border, radius 2, padding 24.
  - Title: Stack Sans Text 400, 16 px, `#1e1e1e`.
  - Subline "4 operations at risk": 300, 16 px, at 50%.
  - `OVERDUE` chip: `#c11106`, 10.75 px.
- Normal row: white, 1 px `rgba(0,0,0,0.1)` border, radius 2, padding 24, title 16 px.
- On the site the card is cropped by its preview frame. The unclipped version is in `61b`.

**Film animation:** the overdue escalation. Start with "Approve Weekly Quantities" as a normal white row. Then the clock passes (the due date from §10, "DUE IN 3 DAYS", runs out). Hard-cut the row to the `#f9ede9` tint with a `#c11106` border, the `OVERDUE` chip snaps in, and "4 operations at risk" counts 0 → 4. This is the consequence beat ("if nobody acts"). Note the dependency chain: one missed action puts 4 downstream operations at risk.

**Screenshots:** `docs/rilin/site/61b-leadership-analytics-unclipped.png`, `61-leadership-analytics.png`, `60-where-you-sit.png`, `viewport-06-y6480.png`.

## 10. For Finance and Ops — "Baker Supply actions"

**Purpose:** shows every material contract broken into business actions assigned to specific people.

**Exact copy:** "For Finance and Ops teams — Every material contract is broken into business actions assigned to specific people" · header `BAKER SUPPLY ACTIONS` · `14 TOTAL` · rows:

| Action | Assignee | Chip |
|---|---|---|
| Approve weekly quantities | Priya Nair | DUE IN 3 DAYS |
| Conduct shipment arrival | Rohan Jha | DUE IN 5 DAYS |
| Verify June invoice | Priya Nair | DUE IN 5 DAYS |

**Visual spec:**
- Card 418 px (384 inner), white, 1 px `rgba(0,0,0,0.2)` border, radius 2, padding 16, gap 8.
- Header: `BAKER SUPPLY ACTIONS` on the left and `14 TOTAL` on the right, both Stack Sans Text 300, 14 px, at 50%. Bottom border 1 px `rgba(0,0,0,0.2)`.
- Rows: about 86 px tall, padding 8 × 0, bottom border 1 px `rgba(0,0,0,0.1)`.
  - Title: Stack Sans Text 400, 16 px, `#1e1e1e`.
  - Assignee line: 24 px circular photo avatar, gap 8, name in 300, 14 px, at 50%.
  - Chip on the right, vertically centred: `#ae3f00`, 10.75 px.

**Film animation:** the assignment moment. The rows start unassigned, with no avatar and a grey "Unassigned" (*not site copy, so prefer a blank*). The avatar and "Priya Nair" slide in from the left (`standard`, 250 ms) as each action is routed, and the chip lands with a tick. `14 TOTAL` counts up as rows populate. Avatars: replace the photos with initials discs ("PN", "RJ") in `#297373`. The names are site copy, but the faces are stock.

**Screenshots:** `docs/rilin/site/62b-baker-supply-actions-unclipped.png`, `62-baker-supply-actions.png`, `viewport-06-y6480.png`.

## 11. Security / "never used to train models"

**Purpose:** gives assurance for sensitive documents.

**Exact copy:**
- Headline: "Built for the most sensitive documents you hold."
- Intro: "Rilin handles signed contracts with the controls enterprise security, finance and legal teams require."
- Six items:
  - End-to-end encryption: "Your contracts are encrypted in transit and at rest."
  - Role-based access: "Every action scoped to a person and logged. Least-privilege by default."
  - Data residency: "Hosted in India or the region your policy requires."
  - Full audit trail: "Every read, edit and escalation recorded, and exportable on demand."
  - Signing trail: "Who signed, approved and amended each contract, with timestamps."
  - Tenant isolation: "Your data is never co-mingled with another organisation's."
- Banner: "Your contracts are never used to train models." · "Tenant-Isolated · No Model Training · Your Data Stays Yours"

**Visual spec:**
- White ground. 3 × 2 grid of 32 px navy line icons with 20 px titles and 16 px body. A 1 px rule separates the rows.
- Banner: full content width (1678 px), fill `#072939`, padding about 28 × 30. A 40 px `#5bba6f`-ish lock glyph, the headline in Stack Sans Headline 400, ~30 px, white, and the subline at ~16 px in `#89bd9e`.

**Film animation:** use it as a type card only, the "Tenant isolation" ring in the storyboard. The banner subline "Tenant-Isolated · No Model Training · Your Data Stays Yours" can be a single line.

**Screenshots:** `docs/rilin/site/70-security.png`, `71-no-training-banner.png`, `viewport-07-y7560.png`.

## 12. Brand bookends (hero, intro, closing)

- **Intro blade:** a `#092736` field. The pillar emblem rises 225 px to centre while its bars scale up from 0 (`rilinBarRise` / `rilinEmblemRise`). It then gives way to the hero. Frames: `site/01-intro-frame0-100ms.png` … `01-intro-frame5-2800ms.png`.
- **Hero:**
  - Eyebrow "CONTRACTUAL LIABILITY CONTROL FOR ENTERPRISES" (Geist→Inter 500, 14 px, tracking 1.2 px, `#83cdcd`).
  - Title "Bridging the gap between contracts and real business actions." (Stack Sans Headline 300, tracking −0.066em, white).
  - CTAs: "Get a Demo" (white fill, `#072939` text, radius 4) and "Sign In" (outline).
  - Background: ASCII-art clouds.
  - Screenshot: `site/viewport-00-y0.png`.
- **Closing:** "The contracts are already signed." / "Do you know what they say?" with "Get a Demo" / "Sign In". This is the natural end-card line. Screenshot: `site/90-closing-cta.png`, `viewport-09-y9720.png`.
- **FAQ lines** worth quoting (`site/80-faq.png`):
  - "Rilin turns it into a Transaction. Every obligation is extracted, assigned to an owner, given a deadline, and tracked. Each action maps back to the clause it satisfies."
  - "A CLM manages the contract lifecycle. Rilin manages what the contract requires after it is signed."

---

# Part B — The real app (nyayanidhi-ui/apps/rilin)

Read-only reading of the source. The app was not run and no database was touched.

How the app differs from the site:
- **No sidebar.** Navigation is a tab strip in the header.
- **No CRITICAL/CAUTION/STANDARD scale and no 0–1 risk score.** Those exist only in the marketing mocks. The app expresses risk as labels.
- **No visual lifecycle timeline.** "Lifecycle" is a contracts table.
- **No demo or seed data.** Realistic names appear only in tests.

So the film's numeric "risk flip" must use the site's Exposure card (§3). Use the app UI only where the film wants "this is the real software".

## B0. App shell
- Header, 46 px, white, with a soft shadow.
  - Left: the logo cell (26 px pillar mark).
  - Then the tab strip on `#f8fafc`. Tabs in order: **Analytics · Workspace · Transactions · Obligations · Lifecycle · Documents**. No icons. Text is 12 px.
    - Idle tab: `#62748e`.
    - Active tab: `font-semibold #1d293d`, 2 px `#2a9d90` underline.
  - Centre: upsell pill "Upgrade to **Rilin Business**".
  - Right: three 18 px icon cells (keyboard, video, inbox), a **"Book a Consultation"** pill (`#e2e8f0`, radius 8, gradient text), and a 24 px avatar (`#007574` fill, white initials).
  - Ask Rilin dock: a 34 px teal-gradient circle on the right edge.
- Files: `components/header/main-header.tsx`, `primary-nav.tsx`.
- **Film use:** a 46 px header with the six tab labels is the strongest "real product" signature. A tab switch, where the 2 px `#2a9d90` underline slides from Transactions to Obligations (250 ms, `standard`), is a clean, real transition device between scenes.

## B1. Transactions (`/transactions`, `/transactions/[id]`)
**Purpose:** a Transaction groups the contracts behind one business deal and tracks its tasks and obligations.

**List page:**
- Search "Search Transactions, Owner, Counterparty".
- Buttons "My Presets" and **"New Transaction"** (dark `#1d293d`).
- H1 "Transactions" (18 px bold `#012637`).
- Filter chips (`h-8 rounded-full border-[#e2e8f0] 12px`): Org / My team / Mine, Counterparty, Owner, Node, Status (On track / At risk / Overdue / Closed).
- Summary line: "**N projects** · 2 overdue · 3 at risk · … | **Milestones** … | **Payment steps** …".

**Transaction card:**
- Container `rounded-xl border-[#e2e8f0] bg-white`.
- Title 15 px semibold `#111827`, followed by the health pill.
- Party row: role label 12 px `#90a1b9`, names `#314158`.
- Owner: 28 px circle `bg-[#E6F4F3] text-[#087f83]` with initials, then the name 13 px `#45556c`. With no owner it shows a dashed "+" chip.
- Node tags: `h-6 rounded-full` with a 6 px dot.

**Health pills** (`rounded-full px-2 py-0.5 12px medium`):

| Label | Fill | Text |
|---|---|---|
| Overdue | `#FEF2F2` | `#DC2626` |
| At Risk | `#FFFBEB` | `#E17100` |
| On Track | `#F0FDF4` | `#15803D` |
| Closed | `#F1F5F9` | `#62748E` |

**Detail page:**
- Header: back chevron, title 18 px bold, health pill. Buttons "Request Contract" (outline) and "Add Contract" (dark).
- Meta strip: labels 10 px medium `#90a1b9`, values 12 px medium `#1d293d`. Fields: **Owner · Nodes · Kickoff · Target end · Expected end · Project Delay**.
- Tabs **Tasks · Obligations · Contracts · Commercials**, active underline `#2A9D90`.
- Sub-toggles: Flow | Gantt; Finance | Non-Finance.

**Obligation card in a transaction:**
- Container `rounded-2xl border p-5`. Title 14 px semibold `#1D293D`.
- Meta row with these labels: "Attachments:" · "Recurrence:" (value in `#4F39F6`, e.g. "One-time" / "Monthly") · "Assignee:" (name, or a "+ Assign" chip).
- Due pill (`h-[22.5px] rounded-[3px] 11px semibold`):

| Text | Fill | Text colour |
|---|---|---|
| "Overdue by 3d" | `#FEF2F2` | `#E52626` |
| "Due in 5d" | `#FFFBEB` | `#E17100` |
| "Completed" | `#F0FDF4` | `#15803D` |

- Contract status chips: Active `#EDFAF5`/`#0F7B6C`, Expired `#FFFBEB`/`#92400E`, Terminated slate.
- Empty state: "Add a Contract to see your Obligations".
- Test-only names (not public, so avoid): "Zepto Dark Store Launch", "Aava Water", "Smartworks UP".
- Files: `components/transactions/{transactions-page,transaction-card,transaction-detail-page,transaction-meta-strip,task-status-badge}.tsx`.

**Film use:** if you want an app-styled version of the site's **IT Vendor Onboarding** moment, put the *site* data (IT Vendor Onboarding, TXN-2026-014, the 4 obligations) into this card/detail grammar. Use the "Assignee:" field flipping from "+ Assign" to an initials avatar.

## B2. Obligations (`/obligations`, `/obligations/[id]`)
**Purpose:** the obligation register, grouped by due day, with criticality, owing party, contract reference and completion attestation.

**Register page:**
- Hub tabs "Contractual | Tasks". Search "Search Obligations".
- H1 **"{N} obligations due this week"** (18 px bold `#012637`), with **"{N} Overdue"** below (12 px `#9f0712`).
- Month card (`h-[58px] rounded-[14px]`): "Finish your Obligations for this month" / "**N Obligations** to complete till Oct 31", with a 48 px progress ring (teal `#007574→#00dbd9` on a `#f1f5f9` track) and the percentage.
- Buttons and menu: "Analyze Contract"; kebab menu "Evidence inbox" / "Risk evaluation".
- Tabs "Organization | Counterparty". Segmented toggle "Active | Passive | Waiting" with counts (`rounded-[32px] bg-[#f1f5f9] p-1`).
- **"Needs Attention"** panel: `#f5f5f5` fill, red triangle icon `#c10007`.
- Day groups: header "Mon, Oct 13" (13 px bold `#171717`), a dot, "3 obligations" (14 px `#62748e`), and a hairline. Undated items go under "Continuous"; finished items under "Closed".

**Obligation row/card:**
- Container `rounded-[10px] border-[#e2e8f0] bg-white p-1`, inner padding 16 × 12.
- **4 × 24 px severity bar** on the left edge: `#c10007` critical, `#ffba00` moderate.
- Title 14 px semibold `#111827`.
- Right side: "Overdue by 4 days" (11 px semibold `#dc2626`) and a chevron.
- Second row:
  - CriticalityPill (`rounded-[4px] px-[9px] py-[3px] 11px semibold`, three-bar signal glyph):
    - **"Critical Business Risk"** `#fff1f2`/`#dc2626`
    - "Moderate Business Risk" `#fffbeb`/`#7b3306`
    - "Minor Business Risk" `#f1f5f9`/`#475569`
    - "Impact Pending"
  - "Urgent" / "Important" flags.
  - Owner: 24 px avatar `bg-[rgba(0,117,116,0.2)] text-[#007574]` with one initial, then the name 12 px `#6b7280`.
  - Contract reference "{Type} · {Contract name}".
- Series roll-up: "2 of 12 complete · next due Nov 3, 2026".

**Due wording:**
- Text: "Overdue by N days" · "Due Today" · "Upcoming in N days" · "No due date".
- Tones: red `#ffe2e2`/`#c10007`, amber today `#fef3c6`/`#bb4d00`, blue upcoming `#dbeafe`/`#1447e6`.
- Date format en-US: "Oct 13, 2026".

**Detail page:**
- Title 18 px bold plus CriticalityPill.
- Buttons: "Assigned to [avatar] Name" · "Not done" · **"Attest completion"** (dark).
- Status line: "Overdue · Friday, Oct 3" (`#dc2626`) / "Due · …" (`#193cb8`) / "Completed · …" (`#008236`).
- Tabs **Details · Downstream Blockers · Blocked By · History · Clauses**.
- Details grid: labels 11 px medium **teal `#0d9488`**. Fields: Obligation Type, Owed By, Owed To, Amount, Due Date, Recurring.
- **Clauses tab:** clause card ("Cited passage", "Know More") opening the source PDF at "PDF page(s) 3, 4". This is the app's real "action maps back to clause" proof.

**Assignment:** a sheet titled "Assign obligation" with "Current owner", "Choose a person", search "Search for a person", and "Assign" (teal `#007574`).

**Statuses (API):** BLOCKED, UPCOMING, ACTIVE, OVERDUE, COMPLETED, SKIPPED, SUPERSEDED, REMOVED_BY_ADDENDUM, PAUSED, NOT_DONE. UI labels are Completed / Not done / Pending / Waiting / Overdue.

**Empty state:** "Turn your contracts into trackable obligations" / "Upload a contract and see who is responsible for what."

**Files:** `components/obligations/v5/*`, `components/obligations/criticality-pill.tsx`, `components/obligation-detail/*`, `components/transactions/sheets/person-picker-sheet.tsx`.

**Film use:** the **severity bar plus "Critical Business Risk" pill** is the app-native risk signal. "Attest completion", leading to a status line that turns "Completed ·" green, is a real completion beat. The "{N} obligations due this week" headline is real UI copy, but N must stay generic or come from site data (e.g. 4, matching "4 core obligations").

## B3. Risk evaluation
**Purpose:** contract-level risk analysis and the risk engine.

- **Contract rating** (`lib/contract-rating.ts`, `components/workspace/analysis-overview-card.tsx`): STRONG / BALANCED / WEAK / **CRITICAL** pills (`rounded-full 10px uppercase`). CRITICAL is `#fee2e2`/`#b91c1c`.
  - CRITICAL subtitle: "Significant risks identified — careful review required".
  - WEAK subtitle: "Several critical terms need attention before signing".
  - Card heading "Analysis summary", counts "N clauses · N obligations · N to fix · N protections".
  - Sections "Gaps to address" / "Vulnerabilities", with expanders "Why is it Critical risk?" and "Recommendation".
- **Finding severity:** "Critical" `#ffe2e2`/`#c10007`, "Moderate" `#fef9c2`/`#a65f00`, "Low" `#dbeafe`/`#1447e6`.
- **Risk categories:** Liability, Termination, Intellectual Property, Confidentiality, Indemnity, Payment, Data Protection, Dispute Resolution, Non-Compete, Stamping, Renewal, Enforceability, Regulatory, …
- `/risk-eval` is an internal "Risk Engine · Eval" admin page ("Surfaced risks", "Obligations reranked by organizational memory"). It's internal; don't show it.

**Film use:** clause 8.2 is an Indemnity-category finding. If the film shows app-style risk, use "Why is it Critical risk?" plus a "Critical" pill. For the numeric exposure flip, use the site card (§3). Keep the two separate, and never invent a numeric score in app styling.

## B4. Lifecycle (`/lifecycle`, `/contracts/[id]`)
**Purpose:** the portfolio of executed contracts and their status through to expiry or renewal.

**Contracts list:**
- Left rail: 250 px, `#fdfeff`. Contents: "Lifecycle", "Sync with Drive", "Add", "Contracts", and type folders (NDA, Service, Real Estate, Vendor, Licensing, Reseller & Distribution, Advisory).
- Title **"All Contracts"**. Sort options include "Expiry Date".
- Table headers **NAME · STATUS · TYPE · OWNER · EFFECTIVE · EXPIRY** (9 px semibold uppercase, tracking 0.8 px, `#62748e`).
- Rows: name 12 px semibold black, counterparty line 12 px `#62748e`. Dates en-IN: "05 Mar, 2026".

**Contract status pill** (`rounded-[3px] px-[9px] py-[3px] 11px semibold`):

| Label | Fill | Text |
|---|---|---|
| Active | `#edfaf5` | `#0f7b6c` |
| Executed | `#eff6ff` | `#162456` |
| Expired, Terminated | `#fef2f2` | `#c10007` |
| Suspended, **"Renewal confirmation needed"** | `#fffbeb` | `#bb4d00` |
| Archived | slate | slate |
| **"Expiry in 12d →"** | amber | amber |

**Contract page:**
- 580 px left column plus a document viewer.
- Meta: Counterparty · Effective · Expiry · Type · Region · Origin · Shared with.
- Tabs **Understand · Linkages · Contract Performance · Obligations** (active underline 2 px `#007574`).
- Menu: Renewal settings, Suspend, Terminate, …

**Pipeline** (Workspace, pre-signature): AT_REQUEST → DRAFTING → INTERNAL_APPROVAL → LEGAL_REVIEW → EXTERNAL_REVIEW → NEGOTIATION → SIGNING → COMPLETION, grouped into boxes Draft / Review / Sign.

**Film use:** the lifecycle *status chip progression* is real and maps to the film's spine: **Executed → Active → "Expiry in 12d →" → "Renewal confirmation needed"**. It pairs with the site's timeline (DAY 1 CONTRACT EXECUTED … RENEWAL DEADLINE). It's a good beat for one chip cycling through states on the MSA row.

## B5. Ask Rilin (overlay panel)
**Purpose:** conversational Q&A over the workspace, with citations to source documents and inline obligation cards.

**Panel:**
- Right overlay, `rounded-l-[32px] bg-[#f8fafc]` over a 40% `#0a0a0a` scrim.
- Empty state: 60 px mark and a 36 px medium `#1d293d` greeting, **"Evening, {first}." / "What's happening?"**.
- Prompt chips (`h-[40px] rounded-[32px] bg-[#f1f5f9] 14px #45556c`):
  - "What contractual liabilities need immediate attention?"
  - "How healthy are my customer, vendor & partner relationships?"
  - "How does a contract impact my business?"
  - "Help me find a contract and explain the important details"
- Composer: `rounded-[12px] bg-[#f1f5f9]`, placeholder "Ask anything", paperclip, mic, and send arrow.

**Messages:**
- User bubble: `rounded-[10px] bg-[#f1f5f9] px-[10px] py-[16px] text-right 16px #0f172b`. It's light; the site version is navy.
- Assistant: plain prose, 16 px, leading 24 px, `#1d293d`.
- Thinking line cycles: "Thinking…", "Reviewing your workspace…", "Tallying obligations across your portfolio…", "Reading the relevant contracts…", "Piecing the answer together…".
- Citations: inline `#3B6FD4` underlined. Sources box `rounded-lg border-[#E2E8F0] bg-[#F8FAFC]` with header "SOURCES".

**Inline obligation card** (`business-action-card.tsx`):
- 60 px date column: month 12 px uppercase over day 28 px semibold.
- Title.
- Day pill: "3 days left" blue, "due today" amber, "2 days overdue" red.
- Assignee: 22 px initial circle.

**Contract-level Ask:**
- "Understand this Contract", with chips "What do I need to know about this contract?", "Explain key commercial terms", "What's unusual here?".
- Footer "Ask Rilin can make mistakes. Check important info."

**Files:** `components/ask-rilin/*`.

**Film use:** for the film, use the **site's** four Q&As (§8) for content. The app's real prompt chip **"What contractual liabilities need immediate attention?"** is a strong, real opening question. The thinking line "Reading the relevant contracts…" is real copy and can replace a spinner.

## B6. Documents / vault, and the editor redline
**Purpose:** the document store and upload queue, plus the drafting editor with AI redlining.

**Vault:**
- Rail: "Documents", **My Vault**, **Upload Queue**, **Shared with Me**, storage meter.
- Search "Search Documents".
- Upload queue columns Name · Status · Origin. Status text: "Processing..." → "Completed" (`#008236`) / "Processing Failed" (`#c10007`). Origin: "Imported from Google Drive" / "Uploaded from Finder".
- Upload drawer "Upload a Contract" (.pdf, .docx, .zip): "Drop a document here or browse. It lands in "My Vault" and we notify you once it is analysed."

**Editor** (`/workspace/editor/[id]`):
- Rail tabs **AskRilin · Comments · Version History · Obligations**. Modes Editing / Suggesting / Viewing.
- **"Redline with AI"**, with stance "Balanced (Fair to both sides)" / "In our favour (Protect our position)".
- Change cards typed Insertion / Deletion / Formatting (11 px uppercase `#b45309`).
- "Accept all" (`#008236`, white) / "Reject all".
- Redline CSS:
  - Insertions `.addon` bg `#ecfdf5`, label `#059669`.
  - Deletions `.cutoff` bg `#fde9e9`, label `#dc2626`.

**Film use:** the upload-queue row going **"Processing..." → "Completed"** is a real, quiet "contract enters Rilin" beat for Day 1. The app's redline colours (`#ecfdf5`/`#059669`, `#fde9e9`/`#dc2626`) are an alternative palette for the §5 redline, but keep the site's clause 8.2 copy.

## B7. Analytics (`/analytics`) and the leadership dashboard
**Purpose:** a personal command view of blocked agreements, renewals and requests, plus a leadership dashboard.

**Analytics page:**
- Greeting "Good Evening, {First L.}" (26 px semibold `#0f172b`).
- **Three KPI cards** (`h-[130px] rounded-[14px] p-4`). The active card is white with a soft shadow; inactive cards are `#f8fafc`. Each has a 30 px icon tile (`rounded-[10px]`), a 13 px semibold label, a **32 px semibold value** and a 13 px caption:

| Card | Tile colours | Caption |
|---|---|---|
| **Blocked Agreements** | `#ffe2e2` / `#e7000b` | "For more than 7 d" |
| **Upcoming Contract Renewals** | `#fef3c6` / `#bb4d00` | "In the next 30 days" |
| **My Requests** | `#dbeafe` / `#1c398e` | "Awaiting pickup" |

- Table below: NAME · STAGE · EXPIRY. Renewal chip `w-[96px] rounded-[6px] bg-[#fffbeb] text-[#bb4d00]` "Expiry in 12d". Actions "Notify" / "Complete".

**Leadership dashboard** (`components/leadership-dashboard/`):
- Widget cards `rounded-[14px] border-[#e2e8f0] p-[15px]`.
- Headline tiles: "Agreements in progress", "Executed value", **"Open critical obligations"** ("Critical and not yet done"), "Transactions".
- Widgets include "Highest-risk contracts", "Blocked contracts" and "Renewals".
- Chart palette `#2a78d6 #eb6834 #1baf7a #eda100 #e87ba4`.

**Film use:** the KPI card with its 32 px value is a clean count-up moment. Use only labels, never invented numbers; any number shown must come from site copy (e.g. "4 operations at risk", "14 TOTAL"). Otherwise prefer the site's ANALYTICS card (§9).

## B8. Counsel (`/consultations`, consult sheet)
**Purpose:** book a lawyer or company secretary from inside the app.

**Header pill:** "Book a Consultation" opens a menu with "**Lawyer** — Legal Review and Expert Advice" and "**Company Secretary** — Get compliance and regulatory guidance".

**Consult sheet** (456 px right sheet), title **"Consult a Legal Specialist"**:
- Counsel card (`rounded-[8px] bg-[#f8fafc] p-5`): 44 px avatar `#fef3c6`/`#bb4d00`, "Consult {Name}".
- Greeting: "Hi! I'm {First}, your assigned counsel. Let me know what you'd like to discuss and select 3 convenient time slots below. I'll confirm one with a meeting link."
- Field "What would you like to discuss?", placeholder "e.g. I would like to discuss the indemnification clauses in the MSA".
- "Select 3 Time Slots": "SLOT 1 ✓ 11 Aug · 9:00 AM".
- CTA "Request a Consult →" or "Pay ₹500 consultation fee & Book".

**Consultation statuses** (`rounded-[3px] 11px semibold`): Awaiting Payment (red), Requested `#fef3c7`/`#b45309`, Accepted `#edfaf5`/`#0f7b6c`, Completed, Cancelled.

**Other routes:** `/internal-counsel` ("Internal Counsel", "Add Counsel") and `/counsel/workflows` ("Counsel Dashboard", "Pending Reviews").

**Film use:** the placeholder "e.g. I would like to discuss the indemnification clauses in the MSA" ties directly to clause 8.2 (an Indemnity clause), which makes it a credible bridge from the redline to counsel. The status chip moving **Requested → Accepted** is a real, small escalation-resolved beat. Avoid the ₹500 price in a brand film.

## B9. Realistic data available
- Use the **site copy first**: Acme Corp / Globex / Initech; IT Vendor Onboarding TXN-2026-014; Apex Logistics; Baker Supply; Priya Nair, Rohan Jha; Adv. Ajit Belliappa; MSA-2026-014.
- The app has no seed or demo data. Names in tests (Priya Nair, Zepto Dark Store Launch, Orchid Retail Ltd, Tata Motors Ltd, …) are not public copy, and some are real companies. **Don't use them.**

---

# Part C — Recommended hero moments (45–60 s)

The narrative follows one contract, the **Master Services Agreement** in the **IT Vendor Onboarding** transaction, from signature towards the litigation it never reaches. All copy below is verbatim from rilin.ai, with one exception: one real prompt chip from the app (moment 1), which is marked. Timings assume 120 BPM (500 ms beats) and total about 56 s.

The **Day 1 → Day N axis** from §1 is the film's continuity thread (rule 31). It is drawn in moment 1. A playhead marker then advances a notch at each later moment, appearing as a thin rule at the frame's bottom or top edge, and stops just short of DAY N at the end.

| # | Time | Moment | Component (real copy) | What changes on screen (the beat) |
|---|---|---|---|---|
| 1 | 0–7 s | **Day 1: the contract is signed, and lawyers leave.** | §1 timeline/radar | The axis draws from `DAY 1 / CONTRACT EXECUTED` to `DAY N / LITIGATION INITIATED`. Type: "Lawyers show up at the start and at the end," then "Rilin runs everything in between." The radar sweep starts and the `LIABILITY EXPOSURE` label settles. Blips stay dark for now. *Optional cold open (real app copy, not site copy):* the upload-queue row "Master-services-agreement.docx · Processing..." → "Completed" (B6). |
| 2 | 7–16 s | **The contract becomes actions.** | §2 Transaction breakdown | `TRANSACTION · ● ACTIVE` card **IT Vendor Onboarding / ID:TXN-2026-014** lands. The connector draws into the **Master Services Agreement** sheet ("→ 12 material clauses"). The hub fans into four obligation cards on a 90 ms stagger, each with dept tag and clause ref: FINANCE · CLAUSE 7.2, INFOSEC · CLAUSE 11.4, DELIVERY · CLAUSE 4.3, LEGAL OPS · CLAUSE 9.5. Type: "A business doesn't run on a legal document. It runs on actions." |
| 3 | 16–23 s | **Owned, assigned, tracked.** | §10 Baker Supply actions → §6 Obligation register | Assignment: avatars and names drop onto rows ("Approve weekly quantities — Priya Nair — DUE IN 3 DAYS", "Conduct shipment arrival — Rohan Jha — DUE IN 5 DAYS"). `14 TOTAL` lands. Wipe to the register (Obligation / Owner / Due / Status): "Issue formal SLA credit report · Delivery · Mar 28" flips `UPCOMING` → **`DONE`**, and "Submit certificate of insurance · Finance · Apr 12" turns **`DUE`**. Type: "Every commitment held as a live register". The playhead advances to the radar's `PAYMENT DUE` blip. |
| 4 | 23–31 s | **A buried clause becomes exposure.** | §8d Ask Rilin → §3 Exposure stack | Bubble: the quoted clause 8.2 + "Can you explain this clause?" The answer block rises: "The clause **does not guarantee** that insurance coverage exists." Then hard cut to **Exposure - Contract Stack · ● LIVE**. The Acme Corp · MSA bar runs up, the score counts to **0.92**, and the chip cuts to **`CRITICAL`**. Globex `CAUTION 0.42` and Initech `STANDARD 0.15` hold below. Type: "Exposure mapped across every contract, continuously." |
| 5 | 31–37 s | **The redline applies.** | §5 Clause 8.2 redline | `Master-services-agreement.docx` scrolls to 8.2, and the yellow highlight sweeps across it. The `CLAUSE 8.2 · REDLINE` popover shows `- not exceeding ₹50,00,000` / `+ not exceeding ₹75,00,000`. Click **Implement changes →**: ₹50,00,000 strikes red and ₹75,00,000 settles green. Type: "Every new agreement drafted, reviewed and analysed in one place". |
| 6 | 37–45 s | **The notice window, dated, and counsel on call.** | §8c Ask Rilin → §4 Specialist counsel | Bubble: "Can we terminate this vendor before renewal?" The answer pivots on the bold dates: "…expire on **12 September 2026**, which means the notice window closes on **14 June 2026**." The radar's `NOTICE WINDOW` callout lights in sync. The **Specialist Counsel Recommendation** box rises, then cut to the counsel card (Matter "Non-compete enforceability" · Contract "MSA-2026-014") and **Consult Counsel** is pressed. Type: "Empanelled counsel, loaded with full contract context". |
| 7 | 45–51 s | **What leadership sees: risk before it's a dispute.** | §9 Analytics card | `ANALYTICS · ● LIVE`. "Approve Weekly Quantities" turns into the red-tinted alert row, the `OVERDUE` chip snaps in, and "**4 operations at risk**" counts in. Type: "Rilin sits across your contract stack like a preventive health check." The playhead stops a notch short of `DAY N`, and the `LITIGATION INITIATED` node dims. |
| End | 51–56 s | **End card** | §12 closing | Silence beat (rule 38), then "The contracts are already signed." / "Do you know what they say?" Then the rilin wordmark, plus "Contractual liability control for enterprises." and the sonic logo. |

**Why this order:**
- It follows the site's own FAQ logic: "Rilin turns it into a Transaction. Every obligation is extracted, assigned to an owner, given a deadline, and tracked. Each action maps back to the clause it satisfies."
- Then risk surfaces (moment 4) and is fixed (5). A deadline-bound right is exercised with counsel (6). Leadership sees the whole stack (7).
- Every moment reuses the same MSA, so the clause refs chain together:
  - CLAUSE 9.5 from moment 2 is the 90-day non-renewal behind moment 6.
  - Clause 8.2 drives moments 4 and 5.

**Data-consistency caveats to resolve before animating:**
1. **Remediate Critical vulnerabilities has two owners.** It is owned by INFOSEC in the transaction diagram (§2) but by Legal Ops in the register (§6). Pick one per film. Recommendation: use §2's INFOSEC everywhere, or don't show that row in the register shot.
2. **Two different leadership-card titles.** "Approve Weekly Quantities" (§9) is a Baker Supply action, not part of IT Vendor Onboarding. The film can treat Baker Supply as a second transaction in the portfolio, since the leadership view is cross-contract. Don't relabel it.
3. **Initech bar length.** On the site, Initech's bar is drawn at 184/200 although its score is 0.15. Make bar length ∝ score in the film.
4. **Portraits.** The counsel portrait and the Priya/Rohan avatars on the site are photos. Use initials discs in the film, and use the advocate's name only with the client's OK.
5. **Fix the site's copy typos if shown:** "risk. surfaces" and "Atleast". "Atleast" is site copy as published; flag it to the client rather than silently changing it.
6. **Mapping into the existing 30 s storyboard** (`docs/storyboard.md`). Its six rings correspond to moments 4 (Risk Surfacing), 3 (Obligation Tracking), 5 (Draft and Review), 6 (Specialist Counsel), 6/4 (Ask Rilin) and §11 (Tenant isolation). In a 45–60 s cut, each ring can open onto its product moment for 4–8 s instead of being a type-only card.
