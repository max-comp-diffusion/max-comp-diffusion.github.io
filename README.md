# MaxCD project page

Project page for **Compositional Diffusion with Maximal-Noise Transitions for Long-Horizon Planning** (under review).

Static site, no build step. Serve the directory with any static HTTP server that supports byte-range requests
(needed for video seeking); GitHub Pages works as is. Environment and task selectors load the corresponding execution videos.
Failed episodes are labeled where the recorded rollout set has no successful episode for that task
(AntSoccer-Medium tasks 2 and 3, Cube-Quadruple task 4).

Layout:

- `index.html` — the page (Nerfies-derived layout with Bulma; environment videos in a tabbed grid; all assets local, no external requests).
- `materials/0-method/` — paper figures exported from the manuscript (planning success/runtime trade-off, toy panels, method overview `process.png`, spectral split),
  typeset equations (`eq_*.svg`) and caption glyphs.
- `materials/0-method/fig_plan_quality*.png` — plan feasibility comparisons on PointMaze-Giant-Stitch and
  AntMaze-Giant-Stitch, with five task rows and CD/ECD/CDGS/MaxCD columns.
- `materials/<environment>/task{1..5}.mp4` — execution of the fastest successful MaxCD episode per task
  (pointmaze / antmaze / humanoidmaze medium, large, giant; antsoccer arena, medium; cube single .. quadruple).
- `materials/panorama/<prompt>/maxcd.webp` — 14 prompts, one MaxCD example each. `index.json` records each prompt and the displayed seed.
- `assets/videos/` — recorded toy denoising (CompDiffuser vs MaxCD) and landscape/corgi denoising recordings (GSC, MaxCD).
  The AntMaze-Giant-Stitch Task 4 example shows recorded CompDiffuser and MaxCD plans from denoising steps 0–50,
  with desktop and mobile video layouts.
- `static/` — Bulma, the Nerfies stylesheet (`index.css`) and the favicon; unused bundled files were removed.

Template attribution and licences: `NOTICE.md`.
