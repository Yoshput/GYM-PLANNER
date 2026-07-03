# Gym Planner — Implementation Spec (Bug Audit + Feature Round)

## How to use this document

Work through this file **top to bottom, in order**. Each section is scoped
independently — finish and verify Section 1 (bug audit) before moving to
Section 2, and so on. Do not skip the verification steps. For every fix or
feature, report back: what you found, what you changed, and how you verified
it (which files, which manual/automated check).

Do not change the existing visual design system (dark base `#0B0B0F`, lime
`#CCFF00`, ember `#FF4500`, bold uppercase Inter Tight headings, glassmorphism
cards, sticky bottom nav) except where a section below explicitly asks for a
new theme variant.

---

## SECTION 1 — Full Bug Audit & Fix

Audit the entire codebase for bugs, not just the ones listed below — those are
confirmed sightings from manual testing, not an exhaustive list. Treat this as
a general QA pass across every page and component, then fix everything found.

### 1.1 Confirmed bugs to verify and fix

**Bug A — Duplicate set numbering in Exercise Modal**
In the exercise detail modal (leg press was the observed case), the "Catat
Progres Tiap Set" section showed "Set 4" twice in a row with identical rep
values, instead of incrementing Set 1 → Set 2 → Set 3 → Set 4. Find the set
logging/render logic, confirm whether this is a rendering bug (wrong index
used as the label) or a state bug (the same set object being pushed twice),
and fix at the root cause. Write a quick manual test: open any exercise with
4+ sets, confirm each set row shows a unique, sequential number.

**Bug B — Ambiguous/inconsistent color coding on the Weekly Split strip**
On the Profile page's "Jadwal Split Mingguan" widget, day chips show colored
dots (red, gray, lime green) next to labels like "Full", "Active", "Rest" —
but the color-to-meaning mapping is inconsistent (e.g. two different days both
labeled "Full" show different dot colors). Audit the logic that assigns dot
color per day. Decide on ONE consistent rule (see Section 3 below for the
required legend/redesign — implement that instead of just patching this bug).

**Bug C — Streak fire emoji has no number**
On the Dashboard header, a 🔥 emoji renders on its own with no streak count
next to it. Determine whether streak-count state exists anywhere in the data
model. If it does not exist yet, this is a missing feature, not just a
rendering bug — implement it properly (see Section 4).

### 1.2 General QA pass — check these areas explicitly

For each item below, state pass/fail and fix any failures found:

- **Onboarding modal**: all 4 steps validate correctly, back button preserves
  previously entered values, closing and reopening does not retain stale state
  from a previous attempt
- **Workout generator determinism**: confirm the same profile always produces
  the same 7-day split (no unintended randomness), and confirm switching goal
  or experience level in `/profile` regenerates the split correctly on next
  dashboard/workout visit
- **Exercise completion logging**: completing a set/exercise updates
  `workout_logs` correctly, does not create duplicate rows if the modal is
  reopened for an already-completed exercise, and the "Riwayat Latihan
  Terakhir" list on the dashboard reflects logs accurately (currently shown as
  always empty — confirm this is genuinely because no logs exist yet, not
  because the query is broken)
- **Nutrition macro math**: verify calorie/macro numbers recompute correctly
  when profile weight/goal changes, and that the progress bars in "Macro
  Targets" never overflow past 100% width
- **AI Scan / Scan buttons on Nutrition page**: confirm whether these are
  wired to real functionality or are UI-only placeholders. If placeholder,
  either implement a minimal working version or clearly mark it "Coming Soon"
  with a disabled state — do not ship a button that looks functional but does
  nothing when tapped, since that reads as broken rather than unfinished
- **Progress page — "Foto Progres" tab**: confirm this tab has working upload
  UI or is clearly marked as not yet implemented; do not leave it silently
  blank with no explanation
- **Badges/Lencana Pencapaian**: confirm the unlock logic exists (currently
  all 4 badges render as locked/grayed regardless of activity). Define and
  implement clear unlock criteria for each badge (e.g., "First Lift" = 1
  completed exercise logged, "Consistency" = 7-day streak ≥ 7, "Heavy Load" =
  single logged set with weight_used above a threshold, "Hydrated" = 7
  consecutive days of water goal met) and wire them to real data
- **Chat bubble (bottom-right floating icon, visible on every page)**:
  determine what this is currently wired to. If it opens a non-functional or
  placeholder chat, either remove it until there's a real feature behind it,
  or clearly label what it does. A floating icon with unexplained behavior
  and a persistent notification dot is a UX red flag — don't ship it in a
  half-built state
- **"Kustom" button on Workout page**: confirm whether custom workout editing
  is functional. If not implemented, disable it with a "Coming Soon" state
  rather than leaving a dead button
- **Auth edge cases**: what happens if signup email already exists, if login
  password is wrong, if a user's session expires mid-use, if "Hapus Akun
  Permanen" is tapped — confirm each shows a clear message and doesn't leave
  the UI in a broken/stuck state
- **Mobile viewport check**: test every page at 375px width (iPhone SE) and
  360px width (common Android) — confirm no horizontal scroll, no text
  clipping, no touch target under 44x44px

### 1.3 Deliverable for Section 1

A written bug report (as a code comment block or markdown summary) listing:
every bug found, root cause, fix applied, and file(s) changed. Then proceed to
Section 2.

---

## SECTION 2 — Dark/Light Theme Toggle

### Requirements

- Use `next-themes` for theme state management (handles `prefers-color-scheme`
  detection, persistence, and hydration correctly in Next.js App Router —
  don't hand-roll this)
- Wire the **gear icon on the Dashboard header** (currently non-functional /
  empty) to open a small settings panel or directly toggle the theme. If
  there's meaningful room for more settings later, make it a slide-up sheet
  with a theme toggle as the first option; if not, a direct icon toggle
  (sun/moon) is fine — use your judgment based on how much settings surface
  area currently exists elsewhere in the app (check `/profile` first, since
  some settings may belong there instead)
- Persist the user's theme choice (localStorage is fine for this — it's a
  device preference, not account data, so it doesn't need to go in Supabase)

### Light theme design tokens

Do not simply invert the dark palette to pure white — design a light theme
with equivalent visual weight and personality:

```
Light theme base:      #FAFAF8  (warm off-white, not #FFFFFF)
Light theme card:       #FFFFFF with 1px border #E5E5E0
Light theme raised:     #F0F0EC
Light theme border:     #E0E0DA
Text primary:           #14140F (not pure black)
Text secondary:         #6B6B63

Lime accent (buttons/highlights):  #CCFF00 (unchanged — high contrast on light bg)
Lime accent (text-on-light):       #7A9900 (darker variant — raw #CCFF00 text on
                                    a light background fails contrast, do not use
                                    it for text in light mode, only for filled
                                    button backgrounds and borders)
Ember accent:                      #FF4500 (unchanged, sufficient contrast on light)
```

Glassmorphism cards in light mode: `bg-white/80 backdrop-blur-md border
border-black/5` instead of the dark mode's `bg-base-card/70 border
border-base-border`.

### Implementation notes

- Add the light theme tokens to `tailwind.config.ts` and `globals.css` as CSS
  variables switched via a `.light` class on `<html>` (next-themes handles
  applying this class)
- Every component currently using hardcoded dark-only classes (e.g.
  `bg-base-card`, `text-white/60`) needs to route through theme-aware tokens.
  Do a full pass — do not leave some pages dark-only and others themed, that's
  a worse experience than no toggle at all
- Test both themes on every existing page: Dashboard, Workout, Nutrition,
  Progress, Profile, onboarding modal, exercise modal

### Deliverable for Section 2

Working theme toggle accessible from the dashboard gear icon (or settings
sheet), all pages correctly themed in both modes, choice persists across
reloads.

---

## SECTION 3 — Weekly Split Color Legend (fixes Bug B above)

### Requirements

Replace the current ambiguous dot-color system with a clear, consistent rule,
and surface a legend so users don't have to guess.

**Proposed color rule** (adjust only if you find a better one, but keep it
simple — 3-4 states max):

| State | Meaning | Color |
|---|---|---|
| Completed | User logged at least one exercise for that day | Lime `#CCFF00` |
| Today | Current day, not yet completed | Ember `#FF4500` (pulsing/highlighted) |
| Upcoming | Future day in the week, not a rest day | Neutral gray/border color |
| Rest day | Scheduled rest day | Muted/dimmed, no dot or a hollow dot |

- Add a small legend row beneath or beside the "Jadwal Split Mingguan" widget
  (small colored dot + 1-2 word label per state), collapsible or always-visible
  depending on space — use your judgment, but it must be visible without an
  extra tap on first view
- Apply the same corrected color logic to the **Dashboard's weekly strip**
  ("Aktivitas 7 Hari Terakhir" and the horizontal day-strip on the dashboard
  home) so the whole app uses one consistent color language for day states —
  do not implement two different color systems on two different pages

### Deliverable for Section 3

Consistent color-to-meaning mapping across all weekly-split UI, with a visible
legend, verified against real logged-workout data (log a workout, confirm the
day updates to "Completed" color correctly).

---

## SECTION 4 — Streak Counter (fixes Bug C above)

### Requirements

- Add a `current_streak` calculation: consecutive days (up to and including
  today, or yesterday if today has no log yet) with at least one completed
  exercise logged in `workout_logs`. Rest days (per the user's generated
  split) should NOT break the streak — only a lifting day with zero completed
  exercises breaks it
- Display as "🔥 N" (e.g. "🔥 5") next to the dashboard greeting, not just a
  bare emoji
- If streak is 0 (no activity yet, or streak just broken), decide on a
  sensible empty state — e.g. hide the flame entirely and show nothing, or
  show "Mulai streak-mu hari ini!" — don't show "🔥 0" as that reads oddly
- Calculate this from existing `workout_logs` + the day's rest-day status from
  `generateWorkoutSplit` — do not add a new denormalized "streak" column that
  can drift out of sync; compute it on read from the log history, or if
  performance requires caching, invalidate the cache on every new log write

### Deliverable for Section 4

Working streak number that increments correctly on consecutive active days,
persists correctly through rest days, and resets correctly when a lifting day
is missed. Test by manually inserting/removing `workout_logs` rows across a
few consecutive dates in Supabase and confirming the displayed number updates
correctly.

---

## SECTION 5 — Curated Playlist Music (rule-based, not Spotify Recommendations API)

### Important context — read before implementing

Spotify's `/recommendations` endpoint was deprecated for all new API
integrations in November 2024 and remains unavailable. As of the February
2026 Web API changes, Spotify further restricted Development Mode apps
(requiring the app owner to hold an active Premium subscription, and removing
several metadata endpoints). **Do not attempt to use Spotify's Web API for
recommendations or audio-feature-based mood detection — it will not work for
a new integration.**

Instead, build a **rule-based curated playlist system** (same pattern as the
existing rule-based workout generator in `src/data/workouts.ts`) combined with
**YouTube for actual in-app playback**, since YouTube requires no login,
supports full-track playback for free, and has no autoplay-with-sound
restrictions once the user taps play (a user-initiated tap satisfies browser
autoplay policies on both mobile and desktop).

### 5.1 Curated playlist data layer

Create `src/data/playlists.ts` following the pattern of `workouts.ts`:

```typescript
interface CuratedPlaylist {
  id: string;
  title: string;          // e.g. "Push Day Power"
  mood: string;            // e.g. "High Energy"
  description: string;
  youtubePlaylistId: string; // a real public YouTube playlist ID
  tags: string[];           // e.g. ["push", "bulking", "high-intensity"]
}
```

Curate a small set (8-12 playlists) covering combinations of:
- Workout type: Push/Pull/Legs/Full Body/Rest
- Goal: Cutting (higher-tempo/cardio-leaning) / Bulking (heavy/aggressive) /
  Maintenance (balanced)
- Intensity: matches the day's exercise intensity from `workouts.ts`

Use **real, existing public YouTube playlist IDs** for workout/gym music
compilations (search YouTube for well-established, long-running gym music
playlists with substantial view counts — prefer channels that look
established and are unlikely to be taken down, e.g. official record label gym
compilation playlists or long-standing fitness music channels). Do not
fabricate playlist IDs. If you can't verify a real playlist ID during
implementation, use a placeholder and flag it clearly in code comments +
final report so it can be swapped for a verified one before shipping.

### 5.2 Selection logic

`getRecommendedPlaylist(dayPlan: DayPlan, goal: Goal): CuratedPlaylist` —
pure function, same spirit as `generateWorkoutSplit`. Given today's workout
label/focus and the user's goal, deterministically picks the best-matching
curated playlist from the tag set. Rest days should map to a distinct
"recovery/chill" playlist, not a high-intensity one.

### 5.3 In-app playback (not just a link out)

This is the part that matters most to the user — **don't just link out to
YouTube, actually embed a playable player in-app** so the user never has to
leave the app or open Spotify/YouTube Music separately:

- Build `src/components/music/MusicPlayerCard.tsx`:
  - Shows the recommended playlist for today (title, mood tag, cover
    thumbnail) as a card on the Dashboard (below or near the "Today's Focus"
    card — use your judgment on placement, don't crowd the layout)
  - Tapping it expands an embedded **YouTube IFrame Player**
    (`https://www.youtube.com/embed/videoseries?list={playlistId}`) inline in
    a modal or expandable card, with standard play/pause/skip controls (the
    IFrame Player API's built-in controls are sufficient — you don't need to
    build custom transport controls unless you want a more native look, in
    which case use the YouTube IFrame Player API's JS methods:
    `playVideo()`, `pauseVideo()`, `nextVideo()`)
  - **Do not autoplay on page load or app open** — audio must only start
    after an explicit user tap, both for browser policy compliance and basic
    good manners (nobody wants unexpected audio blasting when opening a gym
    app in a quiet room)
  - Add a search bar so users can search for and play **any** song/playlist
    they want, not just the curated recommendation — use the YouTube IFrame
    Player with the `loadVideoById` method fed by a lightweight client-side
    search. For search, you have two options, pick based on quota
    availability:
    a. **YouTube Data API v3 search endpoint** — requires a free Google Cloud
       API key, free quota is 10,000 units/day and a single search costs 100
       units (~100 searches/day free) — sufficient for a small personal
       project, cache/debounce search input to avoid wasting quota on every
       keystroke
    b. If you don't want to manage a Google Cloud API key, a simpler fallback
       is letting the user paste a YouTube URL or playlist link directly,
       which the IFrame Player can load without any API key at all — do this
       as the default/simplest path, and layer in full text search (option a)
       as an enhancement if time allows
  - Persist "last played" state in the browser session so returning to the
    dashboard after navigating away doesn't lose the currently playing track
    unexpectedly (minor nicety, not critical — don't over-engineer this)

### 5.4 Cross-platform playback caveats (read Section 6 before implementing this)

- On iOS Safari, embedded `<iframe>` YouTube players must not be expected to
  autoplay under any circumstance, even muted, without a direct user gesture
  on that specific iframe — a tap that opens the modal and a separate tap on
  the player's own play button is the safe pattern
- Background/lock-screen playback (continuing audio when the phone is locked
  or the app is backgrounded) is **not reliably achievable** via an embedded
  YouTube iframe in a home-screen PWA on iOS — do not promise this behavior.
  If a user backgrounds the app, audio will likely pause. This is a platform
  limitation, not a bug to fix — mention it in the UI copy if relevant (e.g.
  a small note "keep the app open for uninterrupted playback") rather than
  silently disappointing the user

### Deliverable for Section 5

`src/data/playlists.ts` with real playlist data, `getRecommendedPlaylist()`
selection logic, `MusicPlayerCard.tsx` embedded on the dashboard with working
tap-to-play (verified on both desktop browser and at minimum one mobile
browser), and a working search-or-paste-link flow for playing arbitrary
songs.

---

## SECTION 6 — Cross-Platform Optimization (Android + iOS Safari/Chrome)

### 6.1 iOS-specific requirements

iOS Safari has real, well-documented platform limitations — build around them
rather than assuming iOS behaves like Android/Chrome:

- **No automatic install prompt exists on iOS.** `beforeinstallprompt` never
  fires in Safari on iOS/iPadOS, and Chrome/Edge on iOS cannot install PWAs at
  all (they're all WebKit under the hood and inherit Safari's restrictions).
  The only install path is: user taps the Share icon → "Add to Home Screen" in
  Safari specifically. Build an **in-app instructional banner/tooltip** (shown
  only when `navigator.userAgent` indicates iOS AND the app is not already
  running in standalone mode — check via
  `window.navigator.standalone === true` or the `display-mode: standalone`
  media query) that visually walks the user through: tap Share icon → scroll
  to "Add to Home Screen" → confirm. Do not build a fake "Install" button that
  tries to trigger a native prompt on iOS — it doesn't exist; show
  instructions instead
- **`apple-touch-icon`, `apple-mobile-web-app-capable`, and
  `apple-mobile-web-app-status-bar-style` meta tags** must be present in
  addition to the existing `manifest.json` icons (the app's `layout.tsx`
  already sets some of this per the existing codebase — audit and confirm
  completeness against current Apple requirements)
- **100vh viewport bug**: iOS Safari's address bar show/hide changes the
  actual viewport height, which breaks naive `h-screen`/`100vh` layouts
  (content jumps or gets clipped behind the address bar or home indicator).
  Audit all uses of `100vh` / `h-screen` in the codebase and replace with
  `100dvh` (dynamic viewport height) where full-screen height is intended,
  with a `100vh` fallback for older browsers
- **Safe area insets**: confirm `env(safe-area-inset-bottom)` /
  `env(safe-area-inset-top)` are correctly applied to the bottom nav and any
  fixed headers (the codebase has `.pb-safe`/`.pt-safe` utility classes
  already — audit that they're actually applied everywhere needed, including
  any newly added UI like the theme toggle sheet and music player modal)
- **Tap highlight / touch behavior**: confirm `-webkit-tap-highlight-color:
  transparent` (already present in `globals.css`) is working as expected
  across all new interactive elements added in this round (theme toggle,
  music player, search input)
- **YouTube iframe on iOS**: add `playsinline` behavior — when using the
  YouTube IFrame Player API, ensure the player parameters include
  `playsinline: 1` so video doesn't force fullscreen takeover on iOS Safari
  when tapped (relevant since the player is technically a video element even
  though this app only cares about audio)

### 6.2 Android-specific requirements

- Confirm the existing `manifest.json` + service worker setup still passes
  Chrome's installability criteria after all the changes in this round (theme
  CSS changes, new components) — re-run a Lighthouse PWA audit after
  implementation and report the score
- Confirm the native Android "Add to Home Screen" banner still fires
  correctly (Chrome on Android DOES support `beforeinstallprompt` — unlike
  iOS, you can and should implement a custom "Install App" button here using
  the captured `beforeinstallprompt` event, shown only on Android/Desktop
  Chrome/Edge, hidden on iOS where it can't work)

### 6.3 Testing matrix

Before calling this done, verify manually on:

| Platform | Browser | Check |
|---|---|---|
| iPhone | Safari | Add to Home Screen flow, standalone launch, theme toggle, music playback (tap-initiated), safe area on notch devices |
| iPhone | Chrome | Confirm it correctly shows iOS install instructions (not a broken native prompt attempt), general layout/functionality |
| Android | Chrome | Native install banner, standalone launch, theme toggle, music playback, offline mode after install |
| Android | Samsung Internet (if available) | General layout/functionality sanity check — Samsung Internet has its own quirks around PWA install |
| Desktop | Chrome/Edge | Install prompt, general functionality |
| Desktop | Safari (Mac) | General functionality (no install expected, desktop Safari PWA support is limited) |

If a physical device test isn't possible in your environment, use Chrome
DevTools device emulation as a minimum baseline, but flag clearly in your
report which checks were emulated vs. tested on real hardware, since iOS
Safari behavior in particular does not always match Chrome's iOS emulation
accurately.

### Deliverable for Section 6

Updated `layout.tsx` meta tags (if anything was missing), iOS install
instruction banner component, Android custom install button using
`beforeinstallprompt`, `100dvh` audit and fixes, safe-area audit and fixes,
Lighthouse PWA score report (before/after if possible), and the testing
matrix filled in with pass/fail + notes per row.

---

## Final Report Format

When all sections are complete, provide:

1. **Section 1**: Bug report (found → root cause → fix → files changed)
2. **Section 2**: Confirmation theme toggle works on all pages + files changed
3. **Section 3**: Before/after of the color legend logic + files changed
4. **Section 4**: Streak calculation logic explanation + test result
5. **Section 5**: Playlist data source (confirm real vs. placeholder YouTube
   IDs), player implementation summary + files changed
6. **Section 6**: Completed testing matrix + Lighthouse score + files changed
7. **Full file tree** of everything added or modified across all sections
8. **Any blockers or judgment calls** you made where the spec was ambiguous,
   and why you chose the approach you did
