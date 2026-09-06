---
protected_branches: ["archive"]
---

# Branching strategy

Personal solo project. No feature-branch/PR workflow — commits go straight to `master`.

## Deploy after every push

This repo is **not** git-integrated for auto-deploy on Vercel — `vercel git connect` was never run (confirmed via `gh api repos/.../deployments` returning empty, and `hooks` returning 404). A `git push` to `master` alone does **not** deploy anything.

After every push to `master`, run the deploy CLI directly from the terminal:

```bash
npx vercel --prod --yes
```

Then verify with a quick `curl -s -o /dev/null -w "%{http_code}\n" https://metal-calc-two.vercel.app/<changed-route>` to confirm the new build is live (200), not stale.
