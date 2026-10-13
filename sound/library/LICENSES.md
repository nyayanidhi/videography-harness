# Sound library: licences

All files were downloaded on 2026-10-12. Each licence was checked on the source site that day. Every licence here allows commercial use at no cost per use. Where a licence has conditions, they are listed below. Read them before the film ships.

## Licence summary

| Licence | Files | Commercial use | Attribution | Main restrictions |
|---|---|---|---|---|
| **CC BY 4.0**: Kevin MacLeod / Incompetech | 2 music | Yes, including broadcast | **Required** (text below) | None beyond credit. You may edit and sync it to picture. |
| **CC BY 4.0**: Jesse Spillane / FMA | 1 music | Yes, including broadcast | **Required** (text below) | None beyond credit. |
| **Mixkit Stock Music Free License** | 3 music | Yes | Not required | **No TV or radio broadcast, no CDs or DVDs, no video games.** No remixing into a music-only track. You may not register the music with Content ID or claim it as your own. Web, social, video on demand, podcasts and online ads are allowed. |
| **Mixkit Sound Effects Free License** | 18 SFX | Yes, including film, TV, radio and VOD | Not required | Do not redistribute a file on its own, as stock, or in a template. Do not register it with Content ID. |
| **CC0 1.0**: Kenney | 3 SFX | Yes | Not required (optional) | None |

Licence texts:
- Mixkit: https://mixkit.co/license/. The music and SFX terms were read from `https://mixkit.co/license/modal/musicFree/` and `.../sfxFree/`. The full user terms are at https://mixkit.co/terms/.
- CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- CC0: https://creativecommons.org/publicdomain/zero/1.0/
- Kenney's licence text is copied to `kenney/Kenney-License.txt`.

**Important if you use the Mixkit music:** its licence excludes TV and radio broadcast. If the film may air on TV, use the CC BY track (Impact Allegretto) or get a different licence. Playing it at a live event is not explicitly covered either. The Mixkit SFX licence has no such limits.

**Repo hygiene:** the Mixkit licences forbid redistributing files on their own. Keep `sound/library/` in a private repo, or exclude it from anything published.

---

## Music

### incompetech/impact-allegretto_kevin-macleod.mp3
- **Title / artist:** "Impact Allegretto", Kevin MacLeod. ISRC USUAN1100622. Uploaded 2009.
- **Source:** https://incompetech.com/music/royalty-free/mp3-royaltyfree/Impact%20Allegretto.mp3
- **Catalogue:** https://incompetech.com/music/royalty-free/pieces.json
- **Licence:** CC BY 4.0
- **Attribution (required).** This is the exact text Incompetech's credit generator produces:
  ```
  "Impact Allegretto"
  Kevin MacLeod (incompetech.com)
  Licensed under Creative Commons: By Attribution 4.0
  http://creativecommons.org/licenses/by/4.0/
  ```
- **Note:** Incompetech also sells a Standard License with no attribution: a one-off $30 per title, not per use. See https://incompetech.com/music/royalty-free/licenses/

### incompetech/long-time-coming_kevin-macleod.mp3
- **Title / artist:** "Long Time Coming", Kevin MacLeod
- **Source:** https://incompetech.com/music/royalty-free/mp3-royaltyfree/Long%20Time%20Coming.mp3
- **Licence:** CC BY 4.0
- **Attribution (required):**
  ```
  "Long Time Coming"
  Kevin MacLeod (incompetech.com)
  Licensed under Creative Commons: By Attribution 4.0
  http://creativecommons.org/licenses/by/4.0/
  ```

### fma/molten-snow_jesse-spillane.mp3
- **Title / artist:** "Molten Snow", Jesse Spillane, from the album *Art of Presentation*
- **Track page:** https://freemusicarchive.org/music/Jesse_Spillane/Art_of_Presentation/Jesse_Spillane_-_Art_of_Presentation_-_03_Molten_Snow/
- **File:** https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Jesse_Spillane/Art_of_Presentation/Jesse_Spillane_-_03_-_Molten_Snow.mp3
- **Licence:** CC BY 4.0, as shown on the track page
- **Attribution (required):**
  ```
  "Molten Snow" by Jesse Spillane (Free Music Archive), licensed under CC BY 4.0
  https://creativecommons.org/licenses/by/4.0/
  ```

### mixkit/music/mixkit-634_your-breath_eugenio-mininni.mp3
- **Title / artist:** "Your Breath", Eugenio Mininni. Mixkit music ID 634.
- **Source:** https://assets.mixkit.co/music/634/634.mp3. The site's download button serves this same file (256 kbps MP3). Listed at https://mixkit.co/free-stock-music/tag/technology/
- **Licence:** Mixkit Stock Music Free License. No attribution needed. **No TV or radio broadcast.**

### mixkit/music/mixkit-720_new-bass-01_lily-j.mp3
- **Title / artist:** "New Bass 01", Lily J. Mixkit music ID 720.
- **Source:** https://assets.mixkit.co/music/720/720.mp3
- **Licence:** Mixkit Stock Music Free License. No attribution needed. **No TV or radio broadcast.**

### mixkit/music/mixkit-834_its-love_michael-ramir-c.mp3
- **Title / artist:** "It's Love", Michael Ramir C. Mixkit music ID 834.
- **Source:** https://assets.mixkit.co/music/834/834.mp3. Listed at https://mixkit.co/free-stock-music/tag/corporate/
- **Licence:** Mixkit Stock Music Free License. No attribution needed. **No TV or radio broadcast.**

### edits/ (derived files)
These are edits of the tracks above, so each inherits its source track's licence and attribution:
- `edit60_your-breath_mixkit-634.wav`
- `edit60_new-bass-01_mixkit-720.wav`
- `edit60_impact-allegretto_incompetech.wav`
- `preview_your-breath_with-sfx.wav`: the Your Breath edit plus SFX from this library

CC BY allows adaptation. The Mixkit music licence allows modification for a video, but forbids turning the track into a music-only remix. These edits are working files for this film only.

---

## Sound effects

Every effect was trimmed (leading silence down to -50 dB below the peak, tail down to -60 dB below the peak, 50 ms fade-out), peak-normalised to -1 dBFS, and converted to 48 kHz, 24-bit stereo WAV.

### Mixkit: Sound Effects Free License, no attribution needed

The source URL for each file is `https://assets.mixkit.co/active_storage/sfx/<ID>/<ID>.wav`. Each was found on the category listing `https://mixkit.co/free-sound-effects/<category>/`.

| File (`mixkit/sfx/`) | Mixkit ID | Mixkit title | Category page |
|---|---|---|---|
| rocket-build_shuttle-ignition_mixkit-1717.wav | 1717 | Space Shuttle rocket ignition start | rocket |
| rocket-build_engine-ignition-rumble_mixkit-1715.wav | 1715 | Rocket engine ignition rumble | rocket |
| rocket-launch_ignition-flames_mixkit-1725.wav | 1725 | Rocket ignition flames | rocket |
| rocket-launch_afterburner_mixkit-1724.wav | 1724 | Sci fi rocket afterburner | rocket |
| rocket-launch_fast-rocket-whoosh_mixkit-1714.wav | 1714 | Fast rocket whoosh | rocket / whoosh |
| rocket-passby_space-rocket-passing_mixkit-1716.wav | 1716 | Space rocket passing by | rocket |
| jet-flyover_fast-jet_mixkit-1580.wav | 1580 | Fast jet engine flying over | jet |
| whoosh-passby_futuristic-sweep_mixkit-169.wav | 169 | Futuristic sweep pass by | pass-by / swoosh |
| whoosh_flying-fast-swoosh_mixkit-1469.wav | 1469 | Flying fast swoosh | swoosh |
| whoosh_wind-sweep_mixkit-2632.wav | 2632 | Whoosh wind sweep | sweep |
| whoosh_long-air-swoosh_mixkit-167.wav | 167 | Long sweeping air swoosh | sweep |
| whoosh-reverse_cinematic-fast_mixkit-1492.wav | 1492 | Cinematic whoosh fast transition | whoosh |
| impact_intro-presentation_mixkit-2902.wav | 2902 | Movie impact intro presentation | impact |
| impact-logo_movie-logo-intro_mixkit-2900.wav | 2900 | Movie logo intro impact | logo / impact |
| impact-sub_space-impact_mixkit-774.wav | 774 | Space impact | impact |
| hit-bass_short-bass-hit_mixkit-2299.wav | 2299 | Short bass hit | hit |
| riser_cinematic-synth_mixkit-645.wav | 645 | Cinematic synth riser | riser |
| riser-short_trailer_mixkit-790.wav | 790 | Cinematic trailer riser | riser |
| ui-click_cool-interface-tone_mixkit-2568.wav | 2568 | Cool interface click tone | click / interface |
| ui-select_modern-tech_mixkit-3124.wav | 3124 | Modern technology select | click |
| ui-open_software-interface_mixkit-2578.wav | 2578 | Opening software interface | interface |
| ui-option_interface-select_mixkit-2573.wav | 2573 | Interface option select | interface |

### Kenney: CC0 1.0, attribution optional ("Kenney, www.kenney.nl")

| File (`kenney/`) | Pack | Original file | Pack page | Pack zip |
|---|---|---|---|---|
| ui-tick_kenney-interface-tick_002.wav | Interface Sounds 1.0 | Audio/tick_002.ogg | https://kenney.nl/assets/interface-sounds | https://kenney.nl/media/pages/assets/interface-sounds/fa43c1dd4d-1677589452/kenney_interface-sounds.zip |
| ui-select_kenney-interface-select_001.wav | Interface Sounds 1.0 | Audio/select_001.ogg | same | same |
| ui-glass_kenney-interface-glass_002.wav | Interface Sounds 1.0 | Audio/glass_002.ogg | same | same |

---

## Credit block for the film

Only needed if you use the CC BY music. Put it in the end card, the video description, or both:

```
Music: "Impact Allegretto" by Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 4.0 — http://creativecommons.org/licenses/by/4.0/
```

The Mixkit and Kenney files need no credit.
