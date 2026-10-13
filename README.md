<div align="center">

# Videography Harness

### Frame by frame. Built in code.

A shared production workspace for Nyayanidhi’s films, motion systems, and sound.

![Remotion](https://img.shields.io/badge/Remotion-4.0.534-0B84F3?style=flat-square)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-3D-171717?style=flat-square&logo=threedotjs&logoColor=white)

[Start creating](#quick-start) · [Explore the films](#compositions) · [Render](#production-commands) · [Work together](#team-workflow)

</div>

---

## The studio, in a repository

Videography Harness brings picture, motion, and audio into one versioned workspace. React compositions define each frame; Three.js builds the worlds; timeline utilities and Python synthesis connect the score to the picture.

It starts with the Nyayanidhi launch films and Rilin explorations, with room to grow into a reusable production toolkit for the team.

| Picture | Motion | Sound |
| :--- | :--- | :--- |
| Compositions, typography, overlays, and end cards | 3D scenes, camera rigs, component animation, and scene previews | Audio assets, synthesized scores, and timeline-driven composition |

## Quick start

You’ll need Node.js and npm installed.

```sh
git clone https://github.com/nyayanidhi/videography-harness.git
cd videography-harness
npm ci
npm run dev
```

Open the local Remotion Studio URL printed in your terminal, select a composition, and scrub the timeline to preview your changes.

> **First session:** start with a scene preview to explore a component, then move to a full film composition.

## Compositions

| Composition | What’s inside |
| :--- | :--- |
| `Launch` | The original Nyayanidhi launch film |
| `RilinV2` | The second film iteration and product journey |
| `RilinRoom` | The room film, with its own world, camera rig, rendering pipeline, and score |
| `GalleryA` / `GalleryB` | Component galleries |
| `Finale` | A focused preview of the closing sequence |
| `RocketTest` / `CloudTest` / `VaporTest` / `StageTest` | Focused scene previews for visual iteration |

Composition registration lives in [`src/Root.tsx`](src/Root.tsx).

## Production commands

| Command | Output / purpose |
| :--- | :--- |
| `npm run dev` | Open Remotion Studio |
| `npm run render` | Render `Launch` → `out/nyayanidhi-launch.mp4` |
| `npm run still` | Render a launch still → `out/still.png` |
| `npm run room:still` | Render a room still → `out/room/still.png` |
| `npm run room:timeline` | Export the room timeline → `out/room/timeline.json` |
| `npm run room:probe` | Run the room motion probe |
| `npm run room:score` | Generate the room score → `public/room/score.wav` |
| `npm run room:render` | Render the room film with audio → `out/rilin-room.mp4` |

For a composition without a dedicated script:

```sh
npx remotion render RilinV2 out/rilin-v2.mp4
```

### Room score setup

Score generation requires Python 3.11, NumPy, and SciPy. Set up a separate environment before generating audio:

```sh
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install numpy scipy
npm run room:score
```

The score command exports the timeline before synthesizing the audio. The room render script enables audio; Studio’s default room props have audio disabled.

## Inside the workspace

```text
videography-harness/
├── src/
│   ├── Root.tsx          Composition registry
│   ├── r3d/              3D scene components and previews
│   ├── v2/               Second film iteration and product components
│   └── room/             Room world, rig, timeline, and rendering
├── public/               Assets loaded by the films
├── sound/                Scores, synthesis, audio sources, and licenses
├── tools/                Timeline export, motion probes, and QA utilities
├── docs/                 Scripts, storyboards, and visual references
└── remotion.config.ts    Shared render configuration
```

## Creative references

- [Storyboard](docs/storyboard.md) — the visual sequence.
- [V2 script](docs/script-v2.md) — the second film’s narrative.
- [Motion principles](docs/motion-principles.md) — guidance for movement and rhythm.
- [Rilin components](docs/rilin-components.md) — product component references.
- [Reference breakdowns](docs/reference-breakdowns.md) — visual research.
- [Audio sources and licenses](sound/library/LICENSES.md) — attribution and usage notes.

## Team workflow

1. Branch from `main` for each scene, feature, or fix.
2. Preview the affected composition in Studio and render a representative still or clip.
3. Commit source, documentation, and assets needed to reproduce the work.
4. Open a pull request with a short description and visual evidence for review.

Dependencies, rendered output, Python environments, caches, and local environment files stay outside Git. Audio sources and their license notes travel together.

> **Workspace handoff:** this repository began as a snapshot of `nyayanidhi-launch-video`. Work continuing in that original folder must be copied into this repository separately; the two folders do not sync automatically.

---

<div align="center">

**Nyayanidhi** · A workspace for the next frame, and the next film.

</div>
