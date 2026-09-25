# Persona Lab starter

An intentionally low-fidelity, connected paper prototype for the Codex Masterclass exercise.

For the participant workflow and copyable prompts, see [WORKSHOP-GUIDE.md](./WORKSHOP-GUIDE.md).

Participants turn three connected paper sketches (Landing, Workspace, and Results) into a website using the supplied fictional assets and copy.

## Preview in your Codex sandbox

Ask Codex to start a preview in your sandbox and return a browser-accessible URL. The repository's [agent guidance](AGENTS.md) describes the workshop VM preview setup.

```text
Start a preview of this Persona Lab starter in my sandbox. Follow the
repository's preview instructions and give me a browser-accessible URL.
```

## Prepared paper prototype and asset pack

The preview opens the paper mock at `/`. You can also visit
`/workshop/mock/index.html` for the connected
pencil-sketch mock, `/workshop/index.html` for the supplied brand logo,
characters, client stories, and supporter logos, and
`/workshop/instructions.html` for the workshop prompts.

See [the asset map](public/workshop/ASSETS.md). No participant uploads or
image generation are required. The paper prototype is a design reference,
not a finished website. There is no separate application mock.

## Exercise boundaries

- This app has no real browser or model integration.
- The sample journey and rationale are simulated; they are not human research.
- GitHub Pages publishes this static prototype; it does not add real browser or model integrations.

## GitHub Pages deployment

After the deployment PR is merged, the paper mock is available at
[https://mqnjqrid.github.io/persona-lab/](https://mqnjqrid.github.io/persona-lab/).
Every push to `main` runs the GitHub Pages workflow: install locked dependencies,
run tests, build with Vite, verify the built paper mock in Chromium, and deploy
`dist/`. Pull requests run the same checks without deploying.

Repository **Settings → Pages → Source** must be **GitHub Actions**.
The production base path is `/persona-lab/`; local development remains at `/`.
To reproduce deployment checks locally, run `npm ci`, `npm test`, `npm run build`,
`npx playwright install chromium`, and `npm run test:pages`.
