# Hosting the demo (no domain needed)

You want a public URL where people can try every feature **before** installing.
All options below are free and give you a URL immediately — no domain required.
You can attach a custom domain later without changing anything else.

## Recommended: GitHub Pages (already wired up)

A workflow is included at `.github/workflows/deploy-demo.yml`. Once your repo is
on GitHub:

1. Push to `main`.
2. Repo → **Settings → Pages → Build and deployment → Source = "GitHub Actions"**.
3. The workflow builds `demo/` and deploys it.

Your demo goes live at:

```
https://<your-username>.github.io/react-guided-journey/
```

> The Vite `base` is set to `/react-guided-journey/` to match this URL. If you
> rename the repo, update `BASE` in the workflow and `base` in
> `demo/vite.config.ts`.

**Zero cost, zero extra accounts** — best if you're already on GitHub.

## Better UX: Vercel or Netlify

These give faster global CDN, deploy previews on every PR, and one-click custom
domains later. Free tier is plenty for a demo.

### Vercel
1. Import the repo at [vercel.com/new](https://vercel.com/new).
2. Set **Root Directory = `demo`**.
3. Build command `npm run build`, output `dist`.
4. Add env var `BASE=/` (Vercel serves from the root, not a subpath).

Live at `https://<project>.vercel.app`.

### Netlify
Same idea — Base directory `demo`, build `npm run build`, publish `demo/dist`,
env `BASE=/`. Live at `https://<project>.netlify.app`.

## Also good: Cloudflare Pages

Generous free tier, great performance. Root dir `demo`, build `npm run build`,
output `demo/dist`, `BASE=/`. Live at `https://<project>.pages.dev`.

## Comparison

| Host | URL | Custom domain | Best for |
| --- | --- | --- | --- |
| GitHub Pages | `user.github.io/repo` | ✅ free | Already-on-GitHub, zero setup |
| Vercel | `project.vercel.app` | ✅ free | Best DX, PR previews |
| Netlify | `project.netlify.app` | ✅ free | Forms/redirects, simple |
| Cloudflare Pages | `project.pages.dev` | ✅ free | Fastest CDN, unlimited bandwidth |

## When you get a domain later

Point the domain at whichever host you chose (all support custom domains free):
- **GitHub Pages**: add a `CNAME` file / set it in Settings → Pages, set
  `base: "/"` in the Vite config (custom domains serve from root).
- **Vercel/Netlify/Cloudflare**: add the domain in the dashboard, set DNS, done.

## Notes on "making money later"

Keep these doors open now, decide later:
- The library stays **MIT and free** — that's what drives adoption and is your
  funnel. Don't gate the core.
- Monetize around it, not inside it: a hosted dashboard for editing tours
  without code, analytics on completion rates, a "pro" theme pack, or paid
  support/consulting.
- Add a GitHub **Sponsors** button and a `funding.yml` early — costs nothing.
- The demo site is your landing page; when you buy a domain, it becomes the
  marketing site with a "Get the npm package" CTA.
