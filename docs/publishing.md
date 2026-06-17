# Publishing checklist & common mistakes

A field guide to the bugs that bite npm publishers — and how this package
already avoids each one.

## Pre-publish checklist

```bash
npm run lint && npm run typecheck && npm run build
npm pack --dry-run        # inspect EXACTLY what will be published
```

`npm pack --dry-run` prints the file list of the tarball. **Always look at it
before publishing** — it's the single best way to catch packaging mistakes.

Then:

```bash
# first publish of a (unscoped) public package
npm publish
# scoped package (@you/pkg) must opt into public
npm publish --access public
```

## The 12 most common publishing mistakes

### 1. Shipping `src` (or nothing) instead of `dist`
Without a `files` allowlist, npm publishes almost everything, bloating the
package — or with a bad `.npmignore`, you publish nothing usable.
✅ **We use** `"files": ["dist", "README.md", "LICENSE"]`.

### 2. Forgetting to build before publish
You publish stale or missing `dist`.
✅ **We use** `"prepublishOnly": "npm run build"` — npm runs it automatically.

### 3. Bundling React → "Invalid hook call" / hooks crash
If React is a normal `dependency` (or bundled by your bundler), consumers get
two copies of React and every hook throws.
✅ **We use** `peerDependencies: { react, react-dom }` **and** mark them
`external` in `tsup.config.ts`.

### 4. Broken `exports` / types not found by consumers
Modern TS (`moduleResolution: "bundler"/"node16"`) reads the `exports` map. If
the `types` condition is missing or ordered after `import`/`require`, editors
show "Could not find a declaration file."
✅ **We use** an `exports` map with `types` listed **first** in each entry.

### 5. ESM/CJS dual-package hazard
Shipping only ESM breaks CJS consumers (`require()` fails); shipping only CJS
hurts tree-shaking and ESM tooling.
✅ **We ship both** (`tsup` `format: ["esm", "cjs"]`) with `main` (cjs),
`module` (esm), and a proper `exports` map.

### 6. CSS not exported, or stripped by tree-shaking
Consumers can't `import "pkg/styles.css"`, or a `"sideEffects": false` config
deletes the CSS at build time.
✅ **We expose** `"./styles.css"` in `exports`, copy it into `dist` via tsup,
and set `"sideEffects": ["**/*.css"]` so bundlers keep it.

### 7. `.npmignore` vs `files` confusion
Having both, or an `.npmignore` that accidentally excludes `dist`. They interact
in surprising ways.
✅ **We use only** `files` (no `.npmignore`) — simpler and predictable.

### 8. Publishing `node_modules` or secrets
A missing ignore can leak `.env`, build caches, etc.
✅ The `files` allowlist means only `dist/README/LICENSE` ship. Double-check
with `npm pack --dry-run`.

### 9. Wrong `main`/`module`/`types` paths
Point to files that don't exist in the tarball and every import breaks.
✅ Verified: paths point inside `dist/`, which is built and included.

### 10. No `LICENSE` / unclear license field
Blocks adoption at companies with license scanners.
✅ MIT `LICENSE` file + `"license": "MIT"`.

### 11. Name already taken / scope not configured
`npm publish` fails late. Check first:
```bash
npm view react-guided-journey   # 404 = available
```
If taken, rename in `package.json` or publish scoped: `@yourname/react-guided-journey`
(then `publishConfig: { "access": "public" }` or `--access public`).

### 12. Forgetting to bump the version
npm rejects re-publishing the same version.
```bash
npm version patch   # or minor / major — updates package.json + git tag
```

## Smoke-test the tarball locally before publishing

```bash
npm pack                       # creates react-guided-journey-0.1.0.tgz
cd /tmp && npm create vite@latest probe -- --template react-ts
cd probe && npm i && npm i /path/to/react-guided-journey-0.1.0.tgz
# import it in src/App.tsx, run `npm run dev`, confirm it works
```

This catches packaging issues that local dev (which uses source aliases) hides.

## After publishing

- Tag the release: `git tag v0.1.0 && git push --tags`
- Add the npm + bundlephobia badges to the README.
- Watch `npm view react-guided-journey` to confirm it's live.
