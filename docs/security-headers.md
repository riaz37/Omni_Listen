# Security response headers

Configured in `frontend/vercel.json` under `headers`. That is the only hook
available: `next.config.js` sets `output: 'export'`, which makes `async
headers()` a no-op and forbids `middleware.ts` outright. `vercel build`
compiles the `headers` array into `.vercel/output/config.json`, and Vercel's
edge applies it to every response including plain static files.

## Why each one is set the way it is

| Header | Value | Reason |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` | Matches what the platform already sent. `preload` is deliberately omitted, since that is a hard-to-reverse commitment across the whole domain. |
| `X-Content-Type-Options` | `nosniff` | Stops a browser second-guessing a declared content type. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Keeps paths off third-party referrers while preserving same-origin analytics. |
| `X-Frame-Options` | `SAMEORIGIN` | Legacy clickjacking defence, paired with `frame-ancestors 'self'` in the CSP for modern browsers. |
| `Cross-Origin-Opener-Policy` | `same-origin-allow-popups` | **Must not be plain `same-origin`.** `signin/page.tsx` injects Google Identity Services, whose sign-in popup talks back to the opener. `same-origin` severs that and breaks Google sign-in. |
| `Permissions-Policy` | `microphone=(self), display-capture=(self), camera=()...` | **Never ship a bare `microphone=()`.** Recording is the product. `display-capture=(self)` is needed for the system-audio path that records the far side of a call. |

## Content-Security-Policy

Shipped as **`Content-Security-Policy-Report-Only`** first. Flip the header
name to `Content-Security-Policy` in a one-line follow-up once the report
window is clean. Going straight to enforcing is how audio capture breaks in
production.

Before flipping, exercise all of: recording from the microphone, the
autonomous page, Google sign-in, PDF export, and an upload. Then read the
console for violations.

### What each directive is carrying

- `script-src` keeps `'unsafe-inline'` because nonces are impossible here.
  A nonce has to be minted per request, and a static export has no request.
  Next also inlines its own hydration payload. Be honest about the
  consequence: `script-src` buys very little XSS protection on this site. The
  CSP's real value is `frame-ancestors`, `base-uri`, `form-action` and
  `object-src 'none'`, plus restricting which *external* origins can serve
  script at all.
- `'unsafe-eval'` and `'wasm-unsafe-eval'` are both present for
  `onnxruntime-web`, whose emscripten glue needs them on some engines.
  `next.config.js` also enables `asyncWebAssembly`.
- `cdn.jsdelivr.net` appears in `script-src` and `connect-src` because
  `lib/autonomous/vad-manager.ts` and `yamnet-inference.ts` point
  `onnxWASMBasePath` / `wasm.wasmPaths` at the jsdelivr copy of
  onnxruntime-web.
- `style-src 'unsafe-inline'` covers `style-src-attr`, which is what React
  inline styles and framer-motion's animated transforms hit.
- `blob:` in `worker-src`, `media-src` and `img-src` covers the audio worklet,
  onnxruntime workers, recorded audio blobs and `html2pdf.js`.
- `font-src 'self' data:` is sufficient because `next/font` self-hosts every
  face at build time. No `fonts.gstatic.com` is needed.
- **`Cross-Origin-Embedder-Policy` is deliberately absent.** Setting it would
  break both the jsdelivr WASM fetches and the Google popup.

### Known gap, unrelated to the CSP

`app/[locale]/autonomous/page.tsx` hardcodes
`ws://localhost:8000/ws/autonomous`. That never worked against the deployed
backend regardless of CSP, and `connect-src` is written for the real origin
(`wss://esaplistenweb.onrender.com`) rather than papering over the hardcoded
localhost. Worth fixing separately.
