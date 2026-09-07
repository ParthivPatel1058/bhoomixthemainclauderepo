# Banshi AI Dashboard — Manus AI Build Prompt

A JARVIS-style web console for the Banshi AI assistant, deployed on Vercel,
talking to the n8n backend.

**How to use this file:** paste **BLOCK 0** first, on its own. Then paste one block
per message. Manus degrades badly on very long prompts — do not paste the whole file
at once.

---

## BLOCK 0 — PROJECT SETUP AND SECURITY (paste this first, alone)

```
Build a Next.js 15 app (App Router, TypeScript, Tailwind CSS) called "Banshi Console".
It is a personal AI assistant dashboard. Deploy target is Vercel.

CRITICAL SECURITY ARCHITECTURE — build this correctly from the start.

The browser must NEVER hold the backend API key. Do not put the key in client code,
in NEXT_PUBLIC_ env vars, or in any fetch made from a React component.

Required shape:

  Browser  ->  /api/chat  (Next.js Route Handler, runs server-side)  ->  n8n webhook
                    ^
                    holds BANSHI_API_KEY from process.env

Create these server-side Route Handlers. Each reads the key from process.env and
forwards to the n8n base URL. The browser only ever calls same-origin /api/* routes.

  app/api/chat/route.ts       POST  -> forwards to  {N8N_BASE}/webhook/chat
  app/api/voice/route.ts      POST  -> forwards to  {N8N_BASE}/webhook/voice
  app/api/health/route.ts     GET   -> forwards to  {N8N_BASE}/webhook/health
  app/api/tools/route.ts      GET   -> forwards to  {N8N_BASE}/webhook/tools
  app/api/history/route.ts    GET   -> forwards to  {N8N_BASE}/webhook/history
  app/api/memory/route.ts     GET   -> forwards to  {N8N_BASE}/webhook/memory
  app/api/research/route.ts   GET   -> forwards to  {N8N_BASE}/webhook/research

Environment variables (.env.local, and the same in Vercel project settings):

  N8N_BASE_URL   = https://yoyo3343434.app.n8n.cloud
  BANSHI_API_KEY = <the long random secret configured in n8n>

Every forwarded request must send:

  Content-Type: application/json
  x-banshi-key: <BANSHI_API_KEY>

Add a 45 second timeout to every proxy call using AbortController. On timeout return
a normal error envelope (shape defined in BLOCK 1), never an unhandled exception.

IMPORTANT — only /chat exists on the backend today. The other six endpoints are not
built yet and will return 404. Build the UI for all of them, but every panel must
degrade gracefully: if an endpoint 404s or errors, that panel shows a quiet
"Not connected yet" state. The app must never crash or show a blank screen because
an endpoint is missing. This is a hard requirement, not a nicety.

Do not build a login system. This is a single-user personal console.
```

---

## BLOCK 1 — THE API CONTRACT (paste second)

```
This is the exact contract. It is already live and verified. Do not invent fields.

REQUEST to /api/chat
  {
    "message":    "string, required, non-empty",
    "session_id": "string, required",
    "user_id":    "string, optional",
    "mode":       "auto | chat | research | deep_research, optional, default auto",
    "voice":      "boolean, optional, default false"
  }

SUCCESS RESPONSE (HTTP 200)
  {
    "success": true,
    "request_id": "60",
    "session_id": "dash-001",
    "user_id": "parthiv",
    "mode": "auto",
    "state": "completed",
    "response": "15 % of 340 is 51.",
    "audio": { "enabled": false, "url": null, "format": null },
    "sources": [],
    "tools_used": ["calculator"],
    "research_used": false,
    "research_id": null,
    "error": null,
    "timestamp": "2026-09-03T15:15:26.415+05:30"
  }

ERROR RESPONSE (HTTP 400, or HTTP 200 with success:false)
  {
    "success": false,
    "state": "error",
    "response": null,
    "error": { "code": "INVALID_INPUT", "message": "human readable text" },
    ...all other fields still present...
  }

Known error codes: INVALID_INPUT, AGENT_FAILED, TTS_UNAVAILABLE, STT_UNAVAILABLE,
RATE_LIMITED, TIMEOUT. Treat any unknown code as a generic failure.

The envelope shape is IDENTICAL on success and failure. Write ONE TypeScript type and
one parser, used everywhere. Never branch on HTTP status alone — always read `success`.

  type BanshiResponse = {
    success: boolean
    request_id: string
    session_id: string
    user_id: string
    mode: string
    state: BanshiState
    response: string | null
    audio: { enabled: boolean; url: string | null; format: string | null }
    sources: string[]
    tools_used: string[]
    research_used: boolean
    research_id: string | null
    error: { code: string; message: string } | null
    timestamp: string
  }

  type BanshiState =
    | "idle" | "listening" | "transcribing" | "thinking" | "researching"
    | "using_tool" | "generating_response" | "speaking" | "completed" | "error"

session_id: generate a UUID on first load and persist it in localStorage under
"banshi.session_id". Add a "New session" button that regenerates it and clears the
transcript. The backend keys conversation memory to this value, so it matters.
```

---

## BLOCK 2 — DESIGN SYSTEM

```
Dark console aesthetic. Futuristic but restrained and legible — an instrument panel,
not a science-fiction movie prop. No glowing purple gradients everywhere, no Orbitron
font, no fake scan-lines.

COLOURS — define as CSS variables on :root

  --bg          #07090B   near-black page ground
  --surface     #0E1216   panels and cards
  --surface-2   #141A20   raised elements, input bar
  --border      #1C232B   hairlines
  --text        #E6EDF3
  --muted       #8B98A5
  --accent      #4DA3FF   primary blue, taken from the BhoomiX logo X
  --accent-dim  #1E3A5F   accent at low emphasis
  --success     #2FD6A0
  --warn        #F0B429
  --error       #FF6B6B

One accent per view. Blue is the system colour. Green means success or "connected"
only. Never use both as decoration in the same panel.

TYPOGRAPHY
  UI text     Inter (or Geist Sans), 14px base, line-height 1.6
  Headings    same family, 600 weight, tight tracking (-0.01em)
  Telemetry   JetBrains Mono (or Geist Mono), 12px — used ONLY for the activity log,
              request IDs, timestamps, token counts and state names
  Numbers     tabular-nums everywhere a figure appears

SHAPE
  Radius: 0 / 6 / 10 / 999. Cards default to 10.
  Borders: 1px solid var(--border). Prefer borders over shadows on a dark ground.
  Shadow, where needed: 0 8px 32px -12px rgba(0,0,0,0.6)

MOTION
  Fast and functional: 150ms ease-out for hover and focus, 250ms for panel entry.
  The only continuously animating element is the state orb (BLOCK 4).
  Respect prefers-reduced-motion: disable the orb animation and all transitions.

ACCESSIBILITY — not optional
  All text meets WCAG AA on its background. --muted on --bg must pass 4.5:1.
  Visible focus rings (2px --accent, 2px offset) on every interactive element.
  The mic button, send button and every icon-only control need an aria-label.
  The transcript is an aria-live="polite" region so screen readers announce replies.
  Full keyboard operation: logical Tab order, Enter sends, Escape cancels.
```

---

## BLOCK 3 — LAYOUT SHELL

```
Three-column desktop layout at >=1280px. Full height, no page scroll — each column
scrolls independently.

  +--------------+---------------------------+------------------+
  |  LEFT 240px  |      CENTRE (flex)        |   RIGHT 340px    |
  |  Navigation  |      Conversation         |   Telemetry      |
  +--------------+---------------------------+------------------+

LEFT RAIL
  Top: "BANSHI" wordmark, small, letter-spaced, with a 6px status dot beside it
       (green = backend healthy, amber = degraded, red = unreachable, grey = unknown)
  Nav items (icon + label): Console, Research, Memory, Tools, Activity, Settings
  Bottom: current session id in mono, truncated, with a copy button, and a
          "New session" button

CENTRE COLUMN
  Header strip: current mode pill (auto/chat/research/deep_research) and the live
                state label
  Body: the message transcript, scrolls, newest at the bottom, auto-scrolls on new
        message unless the user has scrolled up
  Footer: the composer (BLOCK 5)

RIGHT RAIL — four stacked collapsible panels
  1. State        the orb + current state text + elapsed timer
  2. Tools used   chips from tools_used on the most recent response
  3. Sources      list from sources[], each a clickable external link
  4. Activity     scrolling mono log, newest first

RESPONSIVE
  1024-1279px: hide the right rail; make it a slide-over opened by a button
  <1024px: single column. Left rail becomes a bottom tab bar. Right rail becomes a
           bottom sheet. The composer is sticky above the tab bar.
  Test at 390px width — it must be genuinely usable on a phone, not merely rendered.
```

---

## BLOCK 4 — THE STATE ORB

```
The signature element of the console. One circular indicator, roughly 120px, centred
in the right rail's State panel. It visualises BanshiState.

Build it as an SVG with two concentric rings and a soft inner core. Do not use a
video, a GIF, or a heavy 3D library.

State -> appearance:

  idle                 core dim grey, rings still, slow 4s breathing opacity
  listening            core --accent, outer ring pulses outward at 1.2s, repeating
  transcribing         core --accent, inner ring rotates slowly
  thinking             core --accent, both rings rotate in opposite directions, 2s
  researching          core --warn, three orbiting dots circling the ring
  using_tool           core --accent, ring segments blink in sequence, clockwise
  generating_response  core --accent, rings contract and expand rhythmically, 0.8s
  speaking             core --success, concentric waves emit outward continuously
  completed            core --success, one single expanding pulse, then settle to idle
  error                core --error, ring static and broken (dashed stroke)

Beneath the orb: the state name in mono uppercase, plus a human sentence.
Example: "RESEARCHING" / "Searching multiple sources..."

Beneath that: an elapsed-time counter in mono, mm:ss, running while the state is not
idle/completed/error.

Under prefers-reduced-motion: all animation stops. The orb becomes a static coloured
ring and the state is communicated by colour and text only.

IMPORTANT — the backend does not stream state yet. Drive the orb from the client for
now: set "thinking" when a request is sent, "using_tool" if the response comes back
with a non-empty tools_used, "researching" if research_used is true, then "completed".
Write it so that when a real state stream arrives later, only the state source
changes, not the component.
```

---

## BLOCK 5 — COMPOSER AND VOICE INPUT

```
The input bar at the bottom of the centre column.

LAYOUT
  [ mic button ]  [ auto-growing textarea ]  [ voice toggle ]  [ send button ]

TEXTAREA
  Placeholder: "Ask Banshi anything..."
  Grows from 1 to 6 lines, then scrolls internally.
  Enter sends. Shift+Enter inserts a newline.
  Disabled while a request is in flight, with the send button showing a spinner.

MIC BUTTON
  Uses the browser MediaRecorder API to capture microphone audio.
  Click to start, click again to stop. While recording:
    - the button turns --error and pulses
    - a live waveform renders in place of the textarea
    - a recording timer counts up in mono
  On stop: POST the audio blob as multipart/form-data to /api/voice with fields
    audio (the blob), session_id, user_id.
  Show state "transcribing" while waiting.

  The /voice endpoint does not exist yet. If it 404s, show an inline toast
  "Voice input is not connected yet" and discard the recorded blob. Do not crash,
  and do not silently swallow the failure.

  Request microphone permission only when the mic button is first clicked, never on
  page load. If permission is denied, disable the button and explain why in a tooltip.

VOICE TOGGLE
  A small speaker icon that sets the `voice` boolean on outgoing requests.
  Three visual states: off, on, auto.
  Persist the choice to localStorage under "banshi.voice_mode".

AUDIO PLAYBACK
  When a response has audio.enabled === true and a non-null audio.url, render a
  compact inline player under that message: play/pause, a scrubber, and duration.
  If voice mode is "always", autoplay it — but respect browser autoplay policy and
  fall back to a visible play button if autoplay is blocked.
```

---

## BLOCK 6 — TRANSCRIPT AND MESSAGE CARDS

```
USER MESSAGE
  Right-aligned, --surface-2 background, radius 10, max-width 78%.
  Plain text. Timestamp in mono on hover.

ASSISTANT MESSAGE
  Left-aligned, --surface background, 1px --border, radius 10, max-width 78%.
  Render the `response` field as Markdown — the model does emit bold and lists.
  Support: paragraphs, bold, italic, inline code, fenced code blocks with syntax
  highlighting and a copy button, ordered and unordered lists, links (new tab,
  rel="noopener noreferrer"), and tables that scroll horizontally inside their own
  container so the page never scrolls sideways.

  Below the message body, a metadata strip in mono 11px, --muted:
    - tools_used as small chips, each with a matching icon
    - "n sources" as a button that opens the Sources panel
    - the mode pill if mode !== "auto"
    - request_id, copyable
    - latency in ms if you measured it client-side

ERROR MESSAGE
  Left-aligned, --error at 8% opacity background, 1px --error border.
  Shows error.message as the body and error.code as a small mono tag.
  Include a "Retry" button that resends the same message.

STREAMING
  The backend returns one complete response; it does not stream tokens. Do NOT fake a
  typewriter effect. Show a skeleton shimmer placeholder while waiting, then reveal
  the full message with a 250ms fade-up.

EMPTY STATE
  Centred and quiet. The BhoomiX logo mark at low opacity, "Banshi is ready", and
  three suggestion chips the user can click to send:
    "What is on my calendar tomorrow?"
    "Summarise my unread email"
    "Deep research: agri drone subsidies in Madhya Pradesh"
```

---

## BLOCK 7 — RIGHT RAIL PANELS

```
Each panel is collapsible, with its state persisted to localStorage. Each has a
header with a title, a count badge where relevant, and a chevron.

1. STATE — as described in BLOCK 4.

2. TOOLS USED
   Chips from the latest response's tools_used array. Map known tool names to icons
   and friendly labels:
     calculator        -> calculator icon,  "Calculator"
     current_datetime  -> clock icon,       "Date & time"
     wikipedia         -> book icon,        "Wikipedia"
     Web Research      -> globe icon,       "Web research"
     Memory Recall     -> brain icon,       "Memory recall"
     Memory Store      -> save icon,        "Memory saved"
   Unknown tool names render with a generic icon and the raw name. Never crash on an
   unrecognised tool.
   Empty state: "No tools used for this response."

3. SOURCES
   Ordered list from sources[]. Each row shows the hostname in --text and the full
   URL truncated in --muted mono. Clicking opens in a new tab.
   Add a "Copy all" button.
   Empty state: "No sources cited."

4. ACTIVITY LOG
   Mono, 11px, newest first, max 200 entries kept in memory.
   Each line: HH:MM:SS  LEVEL  message
   Levels colour-coded: INFO --muted, OK --success, WARN --warn, ERR --error.
   Log client-side events: request sent, response received (with latency), errors,
   state transitions, session reset, mic start/stop.
   Include a filter input and a "Clear" button.
   This panel must work entirely from client-side events — it does not require the
   /history endpoint.
```

---

## BLOCK 8 — OTHER PAGES

```
All four call endpoints that DO NOT EXIST YET. Build the full UI, wire it to the
endpoint, then make the not-connected state the default visual. When the endpoint
404s, show a centred panel: an icon, "Not connected yet", one sentence explaining
what this page will show, and a "Retry" button. Never a blank page, never a crash,
never an unhandled promise rejection.

RESEARCH (/research)
  A timeline visualisation of a deep research run:
    Planning -> Searching -> Reading sources -> Comparing -> Synthesising -> Done
  Each stage is a row with a status dot, a label and a duration.
  Below it: the subquestions list, the sources collected with a quality indicator,
  any conflicts found shown as paired opposing claims, and the final synthesised
  answer with inline citations.
  Design against this shape:
    { research_id, query, subquestions: [], sources: [], findings: [],
      conflicts: [], status: "running" | "completed", final_answer: string | null }

MEMORY (/memory)
  A searchable table of stored memories.
  Columns: type, content, importance, created, updated.
  `type` is one of: preference, instruction, identity, project, skill, decision,
  context — render each as a coloured chip.
  `importance` is 0 to 1 — render as a 5-segment bar.
  Filter by type, sort by importance or date, free-text search on content.
  A "Forget" button per row (calls DELETE, which does not exist yet — show the
  not-connected state on click).

TOOLS (/tools)
  A grid of cards, one per available tool: name, description, input schema summary,
  a status dot (available / unavailable), and permission requirement if any.

SETTINGS
  This page needs NO backend. Everything persists to localStorage.
    - Voice mode: off / auto / always / command only
    - Voice speed: slider 0.5x to 2.0x
    - Voice language: English / Hindi / Gujarati
    - Default mode: auto / chat / research / deep_research
    - Theme: dark (default) / light
    - Reduced motion: follow system / force on
    - Show the configured backend base URL, read-only, for debugging
    - "Clear local data" button that wipes localStorage and reloads
  NEVER display, store or accept the API key on this page. It lives server-side only.
```

---

## BLOCK 9 — QUALITY BAR AND DEPLOYMENT

```
CORRECTNESS
  - One TypeScript type for the response envelope, one parser, used everywhere.
  - Every fetch wrapped in try/catch with a typed error result. No unhandled
    rejections anywhere in the app.
  - Every endpoint that does not exist yet returns a graceful degraded panel.
  - No `any` types. No non-null assertions on API data.

PERFORMANCE
  - Lighthouse performance and accessibility both >= 90 on desktop.
  - Code-split the Research, Memory and Tools pages.
  - Do not ship a charting library, a 3D library, or an animation library just for
    the orb — plain SVG and CSS are sufficient.

STATE MANAGEMENT
  Keep it simple: React state plus a small context for session and settings.
  Do not add Redux, Zustand or React Query unless you can justify it in one line.

DEPLOYMENT
  - Vercel, Next.js App Router.
  - Set N8N_BASE_URL and BANSHI_API_KEY in Vercel Project Settings > Environment
    Variables, for Production, Preview and Development.
  - Add a README documenting both variables, how to obtain the key, and how to run
    locally.
  - Add a .env.example with the two variable names and empty values.
  - Never commit .env.local. Confirm it is in .gitignore.

FINAL CHECK before you say it is done — verify each of these yourself:
  1. The API key never appears in any client bundle. Search the built output for it.
  2. Sending a message returns a rendered reply.
  3. An empty message shows the INVALID_INPUT error card, not a crash.
  4. Navigating to Research, Memory and Tools shows the not-connected panel.
  5. The app is usable at 390px width.
  6. Keyboard-only operation works end to end: Tab to the textarea, type, Enter.
  7. prefers-reduced-motion stops the orb animating.
```

---

## NOTES FOR PARTHIV — READ BEFORE PASTING

**The proxy is the whole security design.** BLOCK 0 forces Manus to keep the API key
in a Next.js server route rather than in browser code. If you skip that block, or let
Manus "simplify" it away, anyone who opens DevTools on your deployed site can read the
key and call your n8n backend directly — which reads your Gmail. Do not compromise on
this one.

**Only `/chat` works today.** The other six endpoints are Phases 3–9. The prompt is
written so the dashboard is built for all of them but degrades cleanly. That means you
can deploy something real now and light up panels as each phase lands, instead of
waiting for the whole backend.

**Set the secret first.** In n8n, open `Banshi API - Chat` → `POST /chat` → Options →
Only Run If, and replace `CHANGE_ME_TO_A_LONG_RANDOM_SECRET`. Use that same value for
`BANSHI_API_KEY` in Vercel. Until you do, the endpoint rejects everything.

**CORS never applies here.** The browser talks only to your own `/api/*` routes, and
only the Vercel server talks to n8n. That is another reason the proxy matters.

**If Manus struggles**, paste BLOCK 0, 1, 2, 3 and 5 only. That yields a working chat
console. Add 4, 6, 7, 8 afterwards as follow-up messages.
