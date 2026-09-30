# COCOCH — Call of Cthulhu 7e Character Sheets

A static, single-page web app for creating and managing *Call of Cthulhu* (7th edition) characters. Built with vanilla HTML/CSS/JS (ES modules), no build step, and designed to run on GitHub Pages.

## Features

- **Quick Generate** — one click rolls a complete investigator: name, occupation, age, characteristics (3d6×5 / (2d6+6)×5), derived values (HP, MP, SAN, Luck, Dodge, Damage Bonus, Build, Move Rate), and auto-distributed occupation + personal-interest skill points.
- **Character sheet view** — fully editable identity, characteristics, derived values, and skills. Derived values recalculate automatically when characteristics change.
- **Stat tracking** — current HP / MP / SAN / Luck with +/− and reset buttons.
- **Roll anything** — a search bar + category tags (Combat, Social, Investigation, Knowledge, Science, Movement, Characteristics, Derived) to find any stat or skill instantly. Click to roll with full 7e success grading (Critical, Extreme, Hard, Regular, Fumble), bonus/penalty dice, and a roll log.
- **Quick dice** — 1D3/1D4/1D6/1D8/1D10/1D20/2D6/3D6/1D100 plus a custom NdX roller.
- **Multiple characters** — saved in your browser via `localStorage`, with duplicate, delete, and JSON export/import.

## Local development

Because the app uses ES modules, it must be served over HTTP (opening `index.html` directly as `file://` will not work). Any static server works:

```bash
npx serve .
# or
python -m http.server 8000
```

Then open http://localhost:8000 (or the printed URL).

## Running the generator tests

```bash
node scripts/test-generator.mjs
```

## Deploying to GitHub Pages

1. Push this folder to a GitHub repository (the site lives at the repo root).
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, select **Deploy from a branch**.
4. Choose branch **`main`** (or `master`) and folder **`/ (root)`**.
5. Click **Save**. Your site will be published at `https://<username>.github.io/<repo>/` after a minute or two.

> A `.nojekyll` file is included so GitHub Pages serves the files as-is.

### CLI alternative

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

## Notes

- Characters are stored in your browser (`localStorage`), so they are per-browser/per-device. Use **Export** to back them up or move them between devices, and **Import** to restore.
- This is a fan-made tool. *Call of Cthulhu* is © Chaosium Inc.

## Project structure

```
index.html            # app shell
css/styles.css        # styles
js/app.js             # entry point + hash router
js/core/dice.js       # dice + success grading
js/core/generator.js  # character generation
js/core/storage.js    # localStorage CRUD + export/import
js/data/              # skills, occupations, names
js/ui/                # list view, sheet view, roll panel
js/utils.js           # DOM helpers
scripts/              # node test script
```
