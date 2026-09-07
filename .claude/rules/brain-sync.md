# Brain sync

Every feature/route ships its `.claude/brain/feature/` entry in the **same commit** — never a follow-up.

## Adding a route

1. Add `.claude/brain/feature/NNN-{kebab-name}.md` — `NNN` is the next number after the current
   highest in the directory. Frontmatter: `route`, `entry_point`, `category`. Body: one-line description.
2. Add its row to `.claude/brain/feature/000-index.md`, under the matching category.
3. Do this before committing. Don't ship a route the brain doesn't know about.

## Removing a route

Delete its brain file and its index row in the same commit instead of leaving a stale entry.

## Non-route changes

A change that extends an existing page (new section, new util, new hook) without adding/removing a
route doesn't need a new brain file — update the existing route's one-line description if the change
is significant enough to matter to a future session, otherwise skip it.

## Source of truth

`src/appRoutes.js` + `src/App.jsx`'s `<Routes>` are authoritative. If the brain and the actual routes
ever disagree, regenerate the brain from those — never the other way around.

## New session in this repo

1. Read `CLAUDE.md` first.
2. Read everything in `.claude/rules/` (this file, `branching.md`, any others added later) — short,
   governs how this repo is worked on.
3. Read `.claude/brain/feature/000-index.md` — living feature inventory.
4. Only then start the task.
