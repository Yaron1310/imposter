# Imposter Word Game — Developer Plan
### Next.js + React + Vercel

---

## Table of Contents

1. [Game Rules](#1-game-rules)
2. [UI & UX Design Spec](#2-ui--ux-design-spec)
3. [Architecture Overview](#3-architecture-overview)
4. [Data Models](#4-data-models)
5. [File & Folder Structure](#5-file--folder-structure)
6. [Pages & Routes](#6-pages--routes)
7. [API Routes](#7-api-routes)
8. [Real-Time Layer](#8-real-time-layer)
9. [Game State Machine](#9-game-state-machine)
10. [Scoring Rules](#10-scoring-rules)
11. [Word Files](#11-word-files)
12. [Component Breakdown](#12-component-breakdown)
13. [Environment & Deployment](#13-environment--deployment)
14. [Development Phases](#14-development-phases)
15. [Edge Cases & Rules to Enforce](#15-edge-cases--rules-to-enforce)

---

## 1. Game Rules

### 1.1 Imposter Mode (Classic)

**Players:** 2–10 people, each on their own device, all in the same physical room.

**Setup:**
- One player creates a game room and becomes the **Host**.
- Other players join by finding the room in the room browser and entering with their name.
- All players press **"I'm Ready"** when ready. Once everyone is ready, the Host sees a **"Start Round"** button and presses it.

**Each Round:**
1. The server randomly selects one **secret word** from `words.json`.
2. The server randomly selects one player to be the **Imposter**.  
   - The Imposter cannot be the same person as the previous round.
   - The word cannot be the same as the previous round's word.
   - Words already used in this room are skipped until all words are exhausted, then the pool resets.
3. The server assigns each player a random **speaking turn number** (1, 2, 3… up to N players). This changes every round.
4. Each player privately opens the game on their own device and sees their **Role Card**:
   - **Crew players** see: the secret word + their speaking turn number + the full speaking order list.
   - **The Imposter** sees: "🕵️ IMPOSTER" (they do NOT see any word) + their speaking turn number + the full speaking order list.
5. Players tap **"I've Seen My Role"** to proceed to the Discussion screen.

**Discussion Phase:**
- Players take turns speaking in the order shown on their role card.
- Each player gives a one-sentence clue or description related to the secret word.
- The Imposter must bluff — they do not know the word and must try to blend in.
- Crew must try to identify who is giving vague or suspicious clues.

**Voting Phase:**
- After discussion, each crew player votes for who they think is the Imposter.
- **The Imposter does NOT vote** — they see a waiting screen instead.
- Each player can vote for any other player (not themselves).
- The player with the most votes is **accused**.

**Result:**
- If the accused player is the Imposter → **Crew wins**. Each crew member gets **+1 point**.
- If the accused player is NOT the Imposter → **Imposter wins**. The Imposter gets **+2 points**.
- Results are shown to all players: who the imposter was, what the word was, the vote tally.
- The scoreboard is displayed.
- The Host clicks **"New Round"** to go back to the lobby and start again (scores persist across rounds).

---

### 1.2 Super-Imposter Mode

**How it differs from Classic:**

The core twist is that **nobody knows for certain if they are the Imposter**.

**Setup:** Same as Classic — create room, select "Super-Imposter" mode, players join and ready up.

**Each Round:**
1. The server picks a **category** from `super_words.json` (e.g. "Animals", "Furniture").  
   - Categories are not reused within the same room until all categories are exhausted.
2. From that category, two **different words** are picked:
   - **Crew word** — shown to all crew players.
   - **Imposter word** — shown only to the Imposter. It is a different word from the same category.
3. The Imposter assignment follows the same rules as Classic (no repeat imposter from previous round).
4. Speaking turn order is randomly assigned each round.
5. Each player sees their **Role Card**:
   - **Crew players** see: their word + the category name + their speaking turn + the full order.
   - **The Imposter** sees: their (different) word + the category name + their speaking turn + the full order.
   - **Nobody sees "Imposter"** — everyone just sees a word. No one knows for certain if they are the Imposter.

**Discussion Phase:**
- Players describe or give clues about their word.
- Crew members all have the same word and will give consistent clues.
- The Imposter has a similar but different word (same category) and must try to sound like they fit in.
- Everyone — including the Imposter — is trying to figure out who has a different word.

**Voting Phase:**
- **Every player votes**, including the Imposter.
- Each player can vote for **any player, including themselves**.
- The vote grid shows **"Me"** as the first option, followed by all other players.
- This creates genuine uncertainty — even the Imposter may not know if they are caught.

**Result:**
- Same win/loss logic as Classic: most votes → accused → correct or incorrect.
- Results reveal: who the imposter was, the crew word, the imposter word, the category, and the vote tally.

---

## 2. UI & UX Design Spec

### 2.1 Visual Identity

| Property | Value |
|---|---|
| Background | `#0d0d12` (near-black) |
| Surface | `#16161f` |
| Card | `#1e1e2e` |
| Border | `#2a2a3d` |
| Accent (red) | `#e94560` |
| Gold | `#f5c842` |
| Green | `#3ddc97` |
| Purple (Super mode) | `#a855f7` |
| Text | `#e8e8f0` |
| Muted | `#6b6b8a` |
| Fonts | Bebas Neue (headings/labels), DM Sans (body) |
| Border radius | `14px` |

### 2.2 Screen Flow

```
Landing (enter name)
    ↓
Room Browser
    ├── Create Room (choose mode: Imposter / Super-Imposter)
    └── Join existing room
         ↓
Lobby (waiting, ready-up)
    ↓ [Host starts round]
Role Reveal (private, per device)
    ↓
Discussion screen
    ↓
Voting screen
    ↓
Result screen
    ├── [Host] "New Round" → back to Lobby
    └── [Host] "Close Room" → back to Room Browser
```

### 2.3 Screen Descriptions

#### Landing Screen
- Game logo/title: "🕵️ IMPOSTER"
- Subtitle: "A word-based social deduction game"
- Single text input: player name (max 24 chars)
- "Continue" button

#### Room Browser Screen
- **Create Room** card:
  - Text input: room name
  - Mode selector: two clickable tiles — "🕵️ Imposter" and "🦹 Super-Imposter"
  - "Create Room" button
- **Open Rooms** card:
  - Live list, polls every 3 seconds
  - Each room shows: room name, mode badge, host name, player count
  - "Join" button per room (only lobby-phase rooms shown)
- Back arrow not needed (landing is one step back, just re-enter name)

#### Lobby Screen
- **← Rooms** back button (top left of card)
- Room name + room ID code (for verbal reference)
- Mode badge: red for Imposter, purple for Super-Imposter
- Round counter
- Player list: each player shows name + status badge (YOU / HOST / Ready / Waiting)
- **"I'm Ready"** button for each player who hasn't readied yet
- **"🚀 Start Round"** button — visible only to the Host, only when ALL players are ready
- Status bar: "Waiting for X players..." or "Waiting for host to start..."

#### Role Reveal Screen
- Full-card reveal, styled differently per role/mode:
  - **Crew (Classic):** green gradient, shows the secret word large
  - **Imposter (Classic):** red gradient, shows "IMPOSTER" large
  - **Any player (Super):** purple gradient, shows the player's word large + category tag below
- Speaking order section (below the word):
  - Title: "Speaking Order"
  - Subtitle: "You speak turn X"
  - Numbered list of all players, current player highlighted with gold number and bold name
- **"I've Seen My Role →"** button

#### Discussion Screen
- Mode-appropriate hint text
- **"Start Voting"** button

#### Vote Screen
- **Classic mode (crew):**
  - Title: "Who is the imposter?"
  - Grid of vote buttons, one per other player (cannot vote for self)
  - After voting: spinner + "Waiting for others..."
- **Classic mode (imposter):**
  - No vote buttons shown
  - Full-screen message: "You are the Imposter" + "Waiting for all players to vote..." + spinner
- **Super mode (all players):**
  - Title: "Who has the different word?"
  - First button: "Me" styled in gold
  - Then all other players in grid
  - After voting: spinner + "Waiting for others..."

#### Result Screen
- **Win banner** (green for crew win, red for imposter win):
  - "CREW WINS!" or "IMPOSTER WINS!"
  - Who the imposter was
  - The secret word (Classic) or both words + category (Super)
  - Vote tally bar chart (names + horizontal bars proportional to votes received)
- **Scoreboard** card below:
  - Players sorted by total score descending
  - Medal emoji for top 3 (🥇🥈🥉)
  - Points shown in gold
- **Actions:**
  - Host sees: "▶ New Round" (gold) + "Close Room" (secondary)
  - Non-host sees: "Waiting for the host to start a new round..."

---

## 3. Architecture Overview

```
Next.js App (App Router)
├── Frontend: React components, Tailwind or CSS modules
├── API Routes: /api/rooms/* (all game logic lives here)
├── Real-time: Polling every 2 seconds
└── Database: Upstash Redis (recommended) or PlanetScale MySQL
```

**Why this stack:**
- **Next.js App Router** on Vercel — zero-config deployment, serverless, no persistent processes needed
- **Upstash Redis** — serverless-friendly key-value store, no persistent connections required, JSON values, TTL support (auto-cleanup stale rooms), generous free tier
- **Polling every 2 seconds** — no external real-time service needed; each client simply calls `GET /api/rooms/[roomId]/state` on an interval. For a party game played in the same physical room, ≤2 second latency is completely unnoticeable

**Why not Socket.io / Pusher on Vercel:**
Vercel runs **serverless functions** — each request spins up in isolation and terminates after responding. Socket.io requires a persistent server process to hold open connections, which is fundamentally incompatible with Vercel's architecture. Pusher works around this by being an external managed WebSocket service, but it adds cost, complexity, and an external dependency. For this game, polling is the right default.

> **If you later want real-time:** deploy the app to **Railway or Render** instead of Vercel (they support always-on Node.js processes), then attach Socket.io to the Next.js custom server. No game logic changes required — only the real-time transport changes.

### Request flow:
```
Player action (vote, ready, start)
  → POST /api/rooms/[roomId]/[action]
  → Server reads state from Redis
  → Server applies game logic
  → Server writes updated state to Redis
  → Returns { ok: true }

Every 2 seconds (all connected clients):
  → GET /api/rooms/[roomId]/state?name={playerName}
  → Server reads state from Redis
  → Returns player-specific view (roles hidden, tally computed on-the-fly)
  → Client compares phase/scores/votes and updates UI if changed
```

---

## 4. Data Models

### Room State (stored in Redis as JSON)

```typescript
interface RoomState {
  roomId: string;
  roomName: string;
  host: string;
  mode: 'imposter' | 'super';
  phase: 'lobby' | 'reveal' | 'result';
  round: number;

  players: {
    [name: string]: {
      ready: boolean;
      role: 'word' | 'imposter' | '';
      turn: number;
    };
  };

  // Current round
  word: string;           // crew word (both modes)
  imposterWord: string;   // super mode only
  category: string;       // super mode only
  imposter: string;       // player name of current imposter

  // Anti-repeat tracking
  lastImposter: string;
  lastWord: string;
  usedWords: string[];        // last 10 used (regular mode)
  usedCategories: string[];   // last 10 used (super mode)

  // Voting
  votes: { [voterName: string]: string }; // voter → target

  // Scores (persist across rounds)
  scores: { [name: string]: number };

  // Result (set when all votes are in)
  result: {
    accused: string;
    correct: boolean;
    imposter: string;
    word: string;
    imposterWord: string;
    category: string;
    mode: 'imposter' | 'super';
  } | null;

  turnOrder: { [name: string]: number };

  updatedAt: number; // Unix timestamp for TTL logic
}
```

### Player-Specific State View (returned by GET /state)

```typescript
interface PlayerStateView extends Omit<RoomState, 'players'> {
  myRole: 'word' | 'imposter' | '';
  myWord: string;       // crew word, imposter word (super), or '' (classic imposter)
  myTurn: number;
  imposter: string;     // only populated in 'result' phase
  result: (RoomState['result'] & { tally: Record<string, number> }) | null;
  players: {
    [name: string]: {
      ready: boolean;
      turn: number;
      // role is STRIPPED from this view
    };
  };
}
```

---

## 5. File & Folder Structure

```
imposter-game/
├── app/
│   ├── layout.tsx               # Root layout, fonts, global styles
│   ├── page.tsx                 # Landing screen (enter name)
│   ├── rooms/
│   │   └── page.tsx             # Room browser screen
│   ├── rooms/[roomId]/
│   │   └── page.tsx             # Lobby + game screens (all in one, phase-driven)
│   └── api/
│       └── rooms/
│           ├── route.ts                        # GET /api/rooms (list)
│           └── [roomId]/
│               ├── route.ts                    # POST create, GET state
│               ├── join/route.ts
│               ├── ready/route.ts
│               ├── start/route.ts
│               ├── vote/route.ts
│               ├── next-round/route.ts
│               └── delete/route.ts
│
├── components/
│   ├── screens/
│   │   ├── LobbyScreen.tsx
│   │   ├── RevealScreen.tsx
│   │   ├── DiscussScreen.tsx
│   │   ├── VoteScreen.tsx
│   │   └── ResultScreen.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── PlayerList.tsx
│   │   ├── ModeSelector.tsx
│   │   ├── RoomList.tsx
│   │   ├── Scoreboard.tsx
│   │   ├── TallyBars.tsx
│   │   ├── SpeakingOrder.tsx
│   │   └── Spinner.tsx
│   └── GameContainer.tsx        # Phase router — shows correct screen based on phase
│
├── lib/
│   ├── redis.ts                 # Upstash Redis client
│   ├── game-logic.ts            # Pure functions: pickWord, pickImposter, assignTurns, tally
│   ├── words.ts                 # Loads and exports words + super_words
│   └── types.ts                 # All TypeScript interfaces
│
├── hooks/
│   ├── useGameState.ts          # Polling or Pusher subscription hook
│   └── usePlayerName.ts         # Persists name in sessionStorage
│
├── public/
│   ├── words.json
│   └── super_words.json
│
├── styles/
│   └── globals.css              # CSS variables, base styles
│
├── .env.local                   # UPSTASH_URL, PUSHER_* keys etc.
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## 6. Pages & Routes

### `/` — Landing
- Simple form: player name input
- On submit: store name in `sessionStorage`, navigate to `/rooms`

### `/rooms` — Room Browser
- Polls `GET /api/rooms` every 3 seconds
- Shows create-room form (name + mode selector)
- Shows list of open rooms (lobby phase only)
- On create: `POST /api/rooms` → navigate to `/rooms/[roomId]`
- On join: `POST /api/rooms/[roomId]/join` → navigate to `/rooms/[roomId]`

### `/rooms/[roomId]` — Game
- On mount: reads player name from `sessionStorage`, calls join if not already in room
- Subscribes to real-time updates (Pusher channel `room-{roomId}`) or starts polling
- `GameContainer` component renders correct screen based on `phase`

---

## 7. API Routes

All routes return JSON. All POST routes accept `application/json`.

### `GET /api/rooms`
Returns list of all rooms in lobby phase.
```json
{
  "abc123": {
    "name": "Friday Night",
    "host": "Alice",
    "phase": "lobby",
    "playerCount": 3,
    "mode": "super"
  }
}
```

### `POST /api/rooms`
Create a new room.
```json
// Request
{ "roomName": "Friday Night", "hostName": "Alice", "mode": "imposter" }

// Response
{ "ok": true, "roomId": "fridaynight_a3f2b", "roomName": "Friday Night", "mode": "imposter" }
```

### `POST /api/rooms/[roomId]/join`
```json
// Request
{ "name": "Bob" }

// Response
{ "ok": true, "host": "Alice", "mode": "imposter" }
```

### `POST /api/rooms/[roomId]/ready`
```json
{ "name": "Bob" }
```

### `POST /api/rooms/[roomId]/start`
Host only. Picks word, imposter, turn order. Moves phase to `reveal`.
```json
{ "name": "Alice" }
```

### `GET /api/rooms/[roomId]/state?name=Bob`
Returns player-specific state view (roles hidden, imposter hidden unless result phase).

### `POST /api/rooms/[roomId]/vote`
```json
{ "voter": "Bob", "target": "Carol" }
```
If all required votes are in, moves phase to `result` and calculates scores.

### `POST /api/rooms/[roomId]/next-round`
Host only. Resets phase to lobby, clears round data, preserves scores.
```json
{ "name": "Alice" }
```

### `POST /api/rooms/[roomId]/delete`
Host only. Deletes room from Redis.
```json
{ "name": "Alice" }
```

---

## 8. Real-Time Layer

Polling is the only real-time mechanism used. No external service is required.

Every client on the game page calls `GET /api/rooms/[roomId]/state` every 2 seconds. The server reads from Redis and returns a player-specific state view. The client compares the returned `phase` and other key fields to its current state and re-renders if anything changed.

### `hooks/useGameState.ts`

```typescript
import { useState, useEffect, useRef } from 'react';
import type { PlayerStateView } from '@/lib/types';

export function useGameState(roomId: string, playerName: string) {
  const [state, setState] = useState<PlayerStateView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchState = async () => {
    try {
      const res = await fetch(
        `/api/rooms/${roomId}/state?name=${encodeURIComponent(playerName)}`
      );
      if (!res.ok) {
        if (res.status === 404) setError('Room not found');
        return;
      }
      const data: PlayerStateView = await res.json();
      setState(data);
      setError(null);
    } catch {
      // network error — silently retry on next tick
    }
  };

  useEffect(() => {
    if (!roomId || !playerName) return;
    fetchState();
    intervalRef.current = setInterval(fetchState, 2000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [roomId, playerName]);

  return { state, error };
}
```

**Polling interval guidance:**
- `2000ms` (2 seconds) — default, good balance of responsiveness and server load
- `1000ms` (1 second) — snappier feel during voting, costs ~2× API calls
- `3000ms` (3 seconds) — use for the room browser list (less time-sensitive)

**Avoiding unnecessary re-renders:**
Compare `state.phase` and `state.round` before calling `setState` — only update if something meaningful changed. Or use a library like `use-deep-compare-effect`.

**Vercel function limits:**
Vercel's hobby plan allows 100GB-hours of function execution per month. With 10 players each polling every 2 seconds, that's 5 requests/second. Each Redis read takes ~20ms. This is well within free tier limits for a party game.

---

## 9. Game State Machine

```
                ┌──────────────────────┐
                │        lobby         │◄──── next-round (host)
                └──────────┬───────────┘
                           │ start (host, all ready)
                           ▼
                ┌──────────────────────┐
                │        reveal        │  (players read role, no phase change needed)
                └──────────┬───────────┘
                           │ (client-side only: discuss → vote)
                           ▼
                ┌──────────────────────┐
                │   voting in progress │  (votes accumulate)
                └──────────┬───────────┘
                           │ all required votes received
                           ▼
                ┌──────────────────────┐
                │        result        │
                └──────────┬───────────┘
                           │ next-round (host) or delete (host)
                      lobby / gone
```

**Note:** The `discuss` and `vote` screens are client-side only — the server phase stays at `reveal` until the first vote arrives. The phase changes to `result` server-side only when the final required vote is cast.

---

## 10. Scoring Rules

| Outcome | Who scores | Points |
|---|---|---|
| Crew correctly identifies imposter | Every crew member | +1 each |
| Imposter escapes (wrong person accused) | The Imposter | +2 |

Scores persist for the lifetime of the room across all rounds. They reset only when the room is deleted.

**Required votes to trigger result:**
- **Classic mode:** All players except the Imposter must vote. (N-1 votes)
- **Super mode:** All players including the Imposter must vote. (N votes)

**Tie-breaking:** If multiple players receive equal top votes, the first one alphabetically is accused. (Or choose randomly — document your tie-break rule and implement consistently.)

---

## 11. Word Files

Both files live in `/public/` and are loaded server-side via `fs.readFileSync` in `lib/words.ts`.

### `words.json` — Classic mode
```json
["Pizza", "Sushi", "Guitar", "Lion", "Astronaut", ...]
```
Flat array of strings. Minimum recommended: 50 words.

### `super_words.json` — Super-Imposter mode
```json
{
  "Animals": ["Dog", "Cat", "Lion", "Tiger", ...],
  "Furniture": ["Chair", "Table", "Bed", "Sofa", ...],
  "Fruits": ["Apple", "Banana", "Strawberry", ...],
  ...
}
```
Each category must have at least 2 words (to pick crew word and imposter word). Minimum recommended: 15 categories with 8+ words each.

**Anti-repeat logic (implement in `lib/game-logic.ts`):**
- Track `usedWords[]` (classic) and `usedCategories[]` (super) per room, capped at last 10 entries
- On word pick: filter out used words → if empty, reset `usedWords = []` and use full list
- Additionally: the new word must not equal `lastWord` from the previous round
- Similarly for categories and `lastImposter`

---

## 12. Component Breakdown

### `GameContainer.tsx`
Top-level component on the game page. Receives live state from `useGameState`. Renders the correct screen based on `state.phase` and client-side navigation state (discuss/vote are client-only).

```tsx
type ClientPhase = 'lobby' | 'reveal' | 'discuss' | 'vote' | 'result';

// Server phase 'reveal' maps to client phases: reveal → discuss → vote
// Server phase 'result' always shows result
// Server phase 'lobby' always shows lobby
```

### `LobbyScreen.tsx`
Props: `state`, `playerName`, `isHost`, `onReady`, `onStart`, `onLeave`

### `RevealScreen.tsx`
Props: `myRole`, `myWord`, `myTurn`, `turnOrder`, `category`, `mode`, `onContinue`

### `DiscussScreen.tsx`
Props: `mode`, `onStartVoting`

### `VoteScreen.tsx`
Props: `players`, `myName`, `myRole`, `mode`, `hasVoted`, `onVote`

### `ResultScreen.tsx`
Props: `result`, `scores`, `isHost`, `onNewRound`, `onCloseRoom`

### `SpeakingOrder.tsx`
Props: `turnOrder: Record<string, number>`, `myName: string`, `myTurn: number`

Renders the numbered speaking order list. Current player is highlighted in gold.

### `TallyBars.tsx`
Props: `tally: Record<string, number>`

Renders horizontal bar chart of vote counts, sorted descending.

### `ModeSelector.tsx`
Props: `value: 'imposter' | 'super'`, `onChange`

Two clickable tiles. Imposter styled with red accent, Super with purple.

### `PlayerList.tsx`
Props: `players`, `host`, `myName`

Renders the player list in lobby. Each row: player name + status badge.

---

## 13. Environment & Deployment

### `.env.local`
```env
# Upstash Redis (get from upstash.com → create database → REST API tab)
UPSTASH_REDIS_REST_URL=https://....upstash.io
UPSTASH_REDIS_REST_TOKEN=...
```

That's it. No other services required.

### Redis key design
```
room:{roomId}        → JSON string of RoomState
rooms:index          → Redis SET of all active roomIds (for listing)
```

Set a TTL of **24 hours** on each room key so stale rooms auto-clean:
```typescript
await redis.set(`room:${roomId}`, JSON.stringify(state), { ex: 86400 });
```

Update the TTL on every write to keep active rooms alive.

### Vercel deployment
1. Push to GitHub
2. Import repo in Vercel dashboard
3. Add all env vars in Vercel project settings
4. Deploy — zero config needed, Next.js is auto-detected

### Recommended packages
```json
{
  "dependencies": {
    "next": "^14",
    "react": "^18",
    "react-dom": "^18",
    "@upstash/redis": "^1"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/react": "^18",
    "@types/node": "^20",
    "tailwindcss": "^3",
    "postcss": "^8",
    "autoprefixer": "^10"
  }
}
```

No WebSocket libraries needed. The entire real-time layer is handled by the `useGameState` polling hook.

---

## 14. Development Phases

### Phase 1 — Project Setup
- [ ] `npx create-next-app@latest imposter-game --typescript --tailwind --app`
- [ ] Install `@upstash/redis`
- [ ] Set up Upstash Redis (free tier at upstash.com)
- [ ] Configure `.env.local`
- [ ] Create `lib/redis.ts` client
- [ ] Copy `words.json` and `super_words.json` to `/public/`
- [ ] Create `lib/words.ts` to load and export word lists
- [ ] Create `lib/types.ts` with all interfaces
- [ ] Create `styles/globals.css` with CSS variables from the design spec
- [ ] Import Bebas Neue + DM Sans from Google Fonts in `app/layout.tsx`

### Phase 2 — API Layer
- [ ] `lib/game-logic.ts` — pure functions: `pickWord`, `pickImposter`, `assignTurnOrder`, `tallyVotes`
- [ ] `GET /api/rooms` — list rooms
- [ ] `POST /api/rooms` — create room
- [ ] `POST /api/rooms/[roomId]/join`
- [ ] `POST /api/rooms/[roomId]/ready`
- [ ] `POST /api/rooms/[roomId]/start` — full round setup logic
- [ ] `GET /api/rooms/[roomId]/state` — player-specific view, rebuild tally on-the-fly
- [ ] `POST /api/rooms/[roomId]/vote` — accumulate votes, trigger result if complete
- [ ] `POST /api/rooms/[roomId]/next-round`
- [ ] `POST /api/rooms/[roomId]/delete`
- [ ] Test all routes with a REST client (Insomnia / Postman)

### Phase 3 — Real-Time (Polling)
- [ ] `hooks/useGameState.ts` — polling hook with 2-second interval, error handling, cleanup on unmount
- [ ] `hooks/usePlayerName.ts` — reads/writes player name to `sessionStorage` so page refresh doesn't lose identity
- [ ] Test that two browser tabs polling the same room ID both receive state updates within 2 seconds of a mutation
- [ ] Verify polling stops correctly when navigating away (cleanup function in `useEffect`)

### Phase 4 — UI Components
- [ ] Base UI: `Button`, `Card`, `Badge`, `Spinner`
- [ ] `ModeSelector`
- [ ] `PlayerList`
- [ ] `SpeakingOrder`
- [ ] `TallyBars`
- [ ] `Scoreboard`
- [ ] `RoomList`

### Phase 5 — Screens
- [ ] Landing page (`/`)
- [ ] Room Browser (`/rooms`)
- [ ] `LobbyScreen`
- [ ] `RevealScreen` (Classic Crew, Classic Imposter, Super)
- [ ] `DiscussScreen`
- [ ] `VoteScreen` (Classic Crew, Classic Imposter waiting, Super)
- [ ] `ResultScreen`
- [ ] `GameContainer` (phase router)
- [ ] Game page (`/rooms/[roomId]`)

### Phase 6 — Polish & Edge Cases
- [ ] Handle room not found (redirect to /rooms)
- [ ] Handle player name stored in sessionStorage (survive page refresh)
- [ ] Handle host leaving (room deleted, non-host players redirected)
- [ ] Loading states on all async actions
- [ ] Disable buttons after click to prevent double-submit
- [ ] RTL support for Hebrew text in super_words.json (add `dir="rtl"` or `lang="he"` where appropriate)
- [ ] Mobile responsiveness (game is played on phones)

### Phase 7 — Deploy
- [ ] Push to GitHub
- [ ] Connect to Vercel
- [ ] Add env vars
- [ ] Test full game flow in production with multiple real devices

---

## 15. Edge Cases & Rules to Enforce

| Scenario | Rule |
|---|---|
| Player tries to join a room mid-round | Return 409 — joining only allowed in lobby phase |
| Host leaves during round | Room is deleted; other players see "Room not found" on next poll |
| Non-host tries to call `/start` | Return 403 Forbidden |
| Player votes twice | Return 409 — second vote is rejected |
| All players are the same person as last imposter | Still pick that person (no deadlock) |
| Category has fewer than 2 words | Skip that category |
| All words/categories used | Reset the used list and start fresh |
| Two words chosen for super mode | Must be distinct (idx1 ≠ idx2) |
| Tie in votes | Define and document: first alphabetically, or random pick, or re-vote (simplest: first alphabetically) |
| Player name is empty or too long | Validate client-side and server-side (1–24 chars) |
| Room name is empty | Validate before creation |
| Hebrew/Unicode names | Fully supported — use `encodeURIComponent` in query strings |
| Stale rooms | Auto-expire via Redis TTL (24h) |
| Multiple rooms open at once | Each room is isolated by `roomId` — fully supported |

---

*End of developer plan. All game logic, rules, state transitions, and UI behavior described here reflect the full intended design of the Imposter Word Game.*
