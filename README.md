# COCOCH — Call of Cthulhu 7e Character Sheets

A static, single-page web app for creating and managing *Call of Cthulhu* (7th edition) characters. Built with vanilla HTML/CSS/JS and designed to run on GitHub Pages.

`index.html` is **fully self-contained** (all CSS and JS are inlined), so it works even if you upload only that one file — no build step, no server, no external file paths to get wrong.

## Features

- **Quick Generate** — one click rolls a complete investigator: name, occupation, age, characteristics (3d6×5 / (2d6+6)×5), derived values (HP, MP, SAN, Luck, Dodge, Damage Bonus, Build, Move Rate), and auto-distributed occupation + personal-interest skill points.
- **Character sheet view** — fully editable identity, characteristics, derived values, and skills. Derived values recalculate automatically when characteristics change.
- **Stat tracking** — current HP / MP / SAN / Luck with +/− and reset buttons.
- **Roll anything** — a search bar + category tags (Combat, Social, Investigation, Knowledge, Science, Movement, Characteristics, Derived) to find any stat or skill instantly. Click to roll with full 7e success grading (Critical, Extreme, Hard, Regular, Fumble), bonus/penalty dice, and a roll log.
- **Quick dice** — 1D3/1D4/1D6/1D8/1D10/1D20/2D6/3D6/1D100 plus a custom NdX roller.
- **Multiple characters** — saved in your browser via `localStorage`, with duplicate, delete, and JSON export/import.

## Local development

The shipped `index.html` is self-contained, so you can just open it in a browser. The modular source lives in `css/` and `js/`; if you edit those, regenerate `index.html` with:

```bash
node scripts/build.mjs
```

(The build reads `scripts/template.html`, inlines `css/styles.css`, and bundles the `js/` ES modules into a single non-module script.)

## Running the generator tests

```bash
node scripts/test-generator.mjs
```

## Deploying to GitHub Pages

The easiest option — upload a single file:

1. Create a new GitHub repository.
2. **Add file → Upload files** and drop in just `index.html` (and optionally `README.md`).
3. Go to **Settings → Pages**, under **Build and deployment → Source** select **Deploy from a branch**, then choose branch **`main`** and folder **`/ (root)`**.
4. Click **Save**. Your app will be at `https://<username>.github.io/<repo>/`.

Or push the whole folder via git:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

> A `.nojekyll` file is included so GitHub Pages serves the files as-is. Because `index.html` is self-contained, the app works no matter which files end up uploaded.

## Notes

- Characters are stored in your browser (`localStorage`), so they are per-browser/per-device. Use **Export** to back them up or move them between devices, and **Import** to restore.
- This is a fan-made tool. *Call of Cthulhu* is © Chaosium Inc.

## Project structure

```
index.html            # self-contained app (built from source)
scripts/template.html  # HTML template used by the build
scripts/build.mjs      # bundles source -> index.html
scripts/test-generator.mjs
css/styles.css        # source styles
js/app.js             # entry point + hash router
js/core/dice.js       # dice + success grading
js/core/generator.js  # character generation
js/core/storage.js    # localStorage CRUD + export/import
js/data/              # skills, occupations, names
js/ui/                # list view, sheet view, roll panel
js/utils.js           # DOM helpers
```
