# HangulType Code Architecture

Complete guide to every file, function, and their purpose in the codebase.

---

## 📁 Project Structure Overview

```
hangultype/
├── client/          # Next.js frontend
└── server/          # FastAPI backend
```

---

# 🎨 Frontend (client/)

## 📄 App Pages (`client/src/app/`)

### `layout.tsx`
**Purpose:** Root layout wrapper for the entire Next.js application

**Key Elements:**
- `RootLayout` - Wraps all pages with fonts and AuthProvider
- Applies Geist fonts (sans and mono)
- Wraps children in `<AuthProvider>` for global auth state

**Why Needed:** Provides consistent layout, fonts, and authentication context across all pages

---

### `login/page.tsx`
**Purpose:** Authentication page with sign in, sign up, and guest mode

**Key Functions:**
- `handleSignIn()` - Authenticates user with email/password
- `handleSignUp()` - Creates new user account
- `handleSubmit()` - Routes to sign in or sign up based on mode
- `handleGuestMode()` - Bypasses auth, goes to lessons

**State:**
- `mode` - Toggles between "signin" and "signup"
- `email`, `password` - Form inputs
- `loading` - Shows processing state
- `message` - Displays errors/success inline

**Why Needed:** Single entry point for authentication with clear UX, supports both authenticated and guest users

---

### `lessons/page.tsx`
**Purpose:** Main lesson selection hub showing all available lessons grouped by phase

**Key Functions:**
- `initData()` - Fetches lessons from API and user progress
- `handleSignOut()` - Logs out user
- `getDifficultyBadge()` - Returns color/label for lesson difficulty
- `isLessonCompleted()` - Checks if user finished a lesson

**State:**
- `lessons` - All lessons from database
- `completedLessons` - IDs of lessons user completed
- `isLoading` - Loading state
- `error` - Error messages

**UI Sections:**
- Guest mode banner (if not logged in)
- Global progress bar
- Lessons grouped by phase (Foundation, Syllables, Words, etc.)
- Future sectors (upcoming content)

**Why Needed:** Central hub for browsing and selecting typing lessons, shows progress tracking

---

### `practice/page.tsx`
**Purpose:** Main typing practice interface where users actually type

**Key Components Used:**
- `LessonIntro` - Shows lesson details before starting
- `CharacterDisplay` - Shows all lines (past, current, future)
- `KoreanKeyboard` - Visual keyboard with guidance
- `CompletionModal` - Shows stats when lesson complete
- `KeyboardWarning` - Warns if not using Korean IME
- `ErrorBoundary` - Catches render errors

**Key Functions:**
- `handleInputChange()` - Processes each keystroke
- `handleKeyDownWrapper()` - Detects keyboard events, checks for IME
- `handleTryAgain()` - Resets lesson to restart
- `startTyping()` - Begins the practice session

**Key State:**
- `currentLine` - Currently active line being typed
- `allTypedText` - Cumulative text typed across all lines
- `showWarning` - Shows IME warning if typing English

**Why Needed:** Core typing practice engine that combines visual feedback, guidance, and performance tracking

---

### `profile/page.tsx`
**Purpose:** User statistics and progress dashboard

**Key Data Displayed:**
- Total completed lessons
- Average WPM
- Average accuracy
- Progress percentage

**Key Functions:**
- `initProfile()` - Fetches user stats from API
- Redirects guests to login (no stats available)

**Why Needed:** Shows users their progress and motivates continued practice

---

### `auth/callback/route.ts`
**Purpose:** Handles OAuth callback after email confirmation

**Key Functions:**
- `GET()` - Exchanges auth code for session, redirects to lessons

**Why Needed:** Required for Supabase email confirmation flow

---

## 🧩 Components (`client/src/components/`)

### `ErrorBoundary.tsx`
**Purpose:** Catches JavaScript errors in component tree

**Key Methods:**
- `getDerivedStateFromError()` - Updates state when error caught
- `componentDidCatch()` - Logs error details
- `handleReset()` - Returns user to lessons page

**Why Needed:** Prevents entire app crash, shows friendly error screen

---

### `KoreanKeyboard.tsx`
**Purpose:** Visual representation of Korean keyboard layout

**Props:**
- `activeKeys` - Keys currently being pressed (flashed)
- `guideKeys` - Keys to press next (highlighted)
- `focusKeys` - Keys featured in current lesson
- `shiftActive` - Whether Shift is held

**Why Needed:** Visual guidance showing which keys to press, helps beginners learn keyboard layout

---

### Practice Components (`client/src/components/practice/`)

#### `CharacterDisplay.tsx`
**Purpose:** Shows text character-by-character with visual feedback

**Key Functions:**
- `checkPartialProgress()` - Detects first part of multi-stroke character typed
- `isWrongFollowUp()` - Detects incorrect second part of complex character
- `computeCursorIndex()` - Calculates where cursor should be

**Color States:**
- Gray: Not typed yet (ghost text)
- Green: Correct
- Yellow: Partial progress (e.g., typed ㅗ for ㅘ)
- Red: Error

**Props:**
- `showCursor` - Only shows cursor on current line

**Why Needed:** Core visual feedback system, shows exactly what's right/wrong/partial

---

#### `LessonIntro.tsx`
**Purpose:** Shows lesson details before practice begins

**Content:**
- Lesson title and description
- Current line / total lines
- Start button

**Why Needed:** Gives users context about what they'll practice

---

#### `CompletionModal.tsx`
**Purpose:** Celebrates lesson completion with stats

**Props:**
- `wpm`, `accuracy` - Performance stats
- `isGuest` - Shows "progress not saved" warning
- `hasNextLesson` - Shows/hides "Next Lesson" button

**Why Needed:** Provides immediate feedback on performance, motivates users

---

#### `GuidanceMessage.tsx`
**Purpose:** Shows hint messages for complex characters

**Examples:**
- "Type ㅗ then ㅏ to make ㅘ"
- "Backspace and try again"

**Why Needed:** Helps users understand multi-stroke input requirements

---

#### `PerformanceStats.tsx`
**Purpose:** Real-time WPM and accuracy display at top of screen

**Why Needed:** Live feedback during practice session

---

#### `KeyboardWarning.tsx`
**Purpose:** Warns users if they're typing without Korean IME enabled

**Detection:**
- Checks for physical letter keys (KeyA-KeyZ)
- Checks if IME is composing

**Why Needed:** Prevents frustration from typing in wrong keyboard mode

---

## 🎣 Hooks (`client/src/hooks/`)

### `useAuth()` (from context)
**Purpose:** Accesses global authentication state

**Returns:**
- `user` - Current user object or null
- `loading` - Whether auth is initializing

**Why Needed:** Centralized auth state prevents multiple getUser() calls

---

### `useKoreanTyping.ts`
**Purpose:** Core typing engine logic for Korean input

**Key Functions:**
- `handleKeyDown()` - Processes key presses, flashes keys
- `handleKeyUp()` - Releases shift state
- `handleInputChange()` - Main input handler, tracks cursor position
- `lockIndex()` / `unlockIndex()` - Locks position when complex character goes wrong
- `flashKey()` - Visual feedback for key press

**State:**
- `currentLineTyped` - What user has typed so far
- `jamoIndex` - Current position in jamo sequence
- `lockedMedialIndices` - Positions locked due to IME issues
- `activeKeys` - Keys currently flashing
- `shiftPressed` - Whether Shift is held

**Returns:**
- `nextExpectedKey` - What key(s) to press next
- `guidanceMessage` - Hint text for user

**Why Needed:** Handles the complexity of Korean multi-stroke input, provides intelligent guidance

---

### `useLessonProgress.ts`
**Purpose:** Manages lesson data and user progress through lessons

**Key Functions:**
- `fetchLessons()` - Loads all lessons from API
- `syncProgress()` - Loads user's completed lessons (if logged in)
- `markLessonComplete()` - Adds lesson to completed list
- `switchToLesson()` - Changes current lesson
- `handleNextLesson()` - Advances to next lesson
- `advanceToNextLine()` - Moves to next line in current lesson

**State:**
- `lessons` - All available lessons
- `currentLessonId` - Currently selected lesson
- `currentLesson` - Full lesson object
- `completedLessons` - Array of completed lesson IDs
- `currentLineIndex` - Current line in multi-line lesson
- `showLessonIntro` - Whether to show intro screen

**Why Needed:** Centralizes lesson state management, handles navigation between lessons/lines

---

### `usePerformanceTracking.ts`
**Purpose:** Tracks typing performance metrics (WPM, accuracy)

**Key Functions:**
- `startTracking()` - Begins timer
- `endTracking()` - Stops timer
- `incrementKeystrokes()` - Counts each key press
- `incrementErrors()` - Counts backspaces as errors
- `submitAttempt()` - Saves performance to database (if logged in)
- `getStats()` - Calculates current WPM and accuracy

**State:**
- `startTime`, `endTime` - Session timestamps
- `totalKeystrokes` - Total keys pressed
- `errorCount` - Total backspaces

**Why Needed:** Provides real-time and post-session performance metrics

---

## 🛠️ Utilities (`client/src/utils/`)

### Korean Utils (`client/src/utils/korean/`)

#### `mappings.ts`
**Purpose:** Defines all Korean character mappings and sequences

**Exports:**
- `qwertyToKorean` - Maps physical keys to Korean characters
- `complexVowelSequences` - Multi-keystroke vowels (ㅘ, ㅝ, etc.)
- `compoundFinalSequences` - Multi-keystroke finals (ㄺ, ㄻ, etc.)
- `doubleConsonantMappings` - Double consonants (ㄲ, ㅆ with Shift)
- `shiftVowelMappings` - Shift vowels (ㅒ, ㅖ)
- `CONSONANTS`, `VOWELS`, `FINALS` - Character sets for decomposition
- `KEY_FLASH_MS` - Duration of key flash animation

**Why Needed:** Central source of truth for Korean keyboard layout and character composition rules

---

#### `decomposition.ts`
**Purpose:** Breaks Korean syllables into component jamo

**Key Functions:**
- `breakDownSyllable(char)` - Splits syllable into [initial, vowel, final]
  - Example: "한" → ["ㅎ", "ㅏ", "ㄴ"]
- `textToJamoSequence(text)` - Converts full text to jamo array
  - Example: "안녕" → ["ㅇ", "ㅏ", "ㄴ", "ㄴ", "ㅕ", "ㅇ"]

**How It Works:**
- Uses Unicode math (Korean syllables are 0xAC00 - 0xD7A3)
- Formula: syllableIndex = code - 0xAC00
- Extracts: initial (÷588), vowel (÷28), final (mod 28)

**Why Needed:** Korean IME composes characters, but we need to track individual keystrokes. This decomposes them for comparison.

---

#### `guidance.ts`
**Purpose:** Intelligent guidance system for Korean typing

**Key Functions:**
- `isFinalConsonantPosition(targetJamo, index)` - Determines if ㅆ/ㄲ is final consonant
  - Used for position-aware input (Shift vs double-tap)

- `getSequenceGuidance(...)` - Shared guidance for two-jamo sequences
  (complex vowels like ㅘ and compound finals like ㄺ)

- `getSmartGuidance(...)` - Main guidance engine (pure function, no side effects)
  - Checks for errors in previous positions
  - Handles partial progress (yellow state)
  - Detects wrong follow-ups
  - Returns: `{keys: string[], message?: string, lockCurrentIndex?: boolean}`
  - `lockCurrentIndex` tells the caller (useKoreanTyping) to lock the current
    slot; the hook applies it in a useEffect so no state changes happen
    during render

**Why Needed:** Korean has complex input rules (multi-stroke characters, position-aware input). This provides intelligent, context-aware guidance.

---

### Typing Utils (`client/src/utils/typing/`)

#### `textSplitting.ts`
**Purpose:** Breaks long text into manageable lines

**Key Function:**
- `splitTextIntoLines(text, maxLength = 40)` - Splits text intelligently

**Logic:**
1. Short token drills (e.g., "ㄱ ㄴ ㄷ") - splits by spaces
2. No spaces - returns as single line
3. Sentences - splits at sentence boundaries (. ! ?)
4. Long sentences - breaks at word boundaries

**Why Needed:** Prevents lines from being too long, improves readability, maintains context (doesn't break mid-sentence)

---

#### `accuracy.ts`
**Purpose:** Calculates WPM and accuracy metrics

**Key Functions:**
- `calculateWPM(keystrokes, minutes)` - Standard WPM formula
  - Formula: (keystrokes ÷ 5) ÷ minutes
  - Why divide by 5: Standard "word" = 5 characters

- `calculateKeystrokeAccuracy(total, errors)` - Accuracy percentage
  - Formula: ((total - errors) ÷ total) × 100

**Why Needed:** Standardized performance metrics

---

### Supabase Utils (`client/src/utils/supabase/`)

#### `client.ts`
**Purpose:** Creates Supabase browser client

**Why Needed:** Singleton pattern for Supabase client, uses environment variables

---

## 🌐 Context (`client/src/context/`)

### `AuthContext.tsx`
**Purpose:** Global authentication state provider

**Key Elements:**
- `AuthProvider` - Component that wraps app
- `useAuth()` - Hook to access auth state

**How It Works:**
1. On mount: calls `supabase.auth.getUser()`
2. Subscribes to `onAuthStateChange` for session updates
3. Provides `{user, loading}` to entire app
4. Cleans up subscription on unmount

**Why Needed:**
- Single source of truth for auth state
- Prevents multiple redundant `getUser()` calls
- Provides real-time auth updates across all pages

---

## 📦 Types (`client/src/types/`)

### `lesson.ts`
**Purpose:** TypeScript interfaces for lesson data

**Key Interfaces:**
- `DBLesson` - Raw database response shape
  - Has `lesson_number`, `content_json`, `order_index`

- `Lesson` - Formatted lesson object used in app
  - Has `lessonNumber`, `targetText`, `instructions`, `focusKeys`
  - Flattens `content_json` into top level

**Why Needed:** Type safety, clear data contracts between API and frontend

---

## 🔌 API Client (`client/src/lib/`)

### `api.ts`
**Purpose:** Centralized API client with typed methods

**Key Functions:**
- `fetchJSON<T>(path, options)` - Generic fetch wrapper with error handling
- `authHeaders()` - Builds `Authorization: Bearer <token>` header from the
  current Supabase session
- `mapLesson(row)` - Converts a `DBLesson` row into the app's `Lesson` shape
- `api.getLessons()` - Fetches all lessons (public, returns mapped `Lesson[]`)
- `api.getProgress(userId)` - Fetches user progress (authenticated)
- `api.submitAttempt(data)` - Submits typing performance (authenticated;
  the server derives `user_id` from the JWT)

**Why Needed:**
- Single source of truth for API calls — all pages and hooks go through it
- Consistent error handling and auth headers
- Type safety
- Easy to mock for testing

---

# 🖥️ Backend (server/)

## 📄 Main Files (`server/app/`)

### `main.py`
**Purpose:** FastAPI application with all API routes

**Configuration:**
- CORS middleware (origins from env variable)
- Title: "HangulType API"

**Auth:**
- `get_current_user_id()` dependency validates the Supabase JWT from the
  `Authorization: Bearer` header (via `db.auth.get_user`) and returns the
  authenticated user's id. Progress and attempt endpoints require it.

**Endpoints:**

#### `GET /`
- Health check endpoint
- Returns: `{"status": "ok", "message": "HangulType API is running"}`

#### `GET /lessons`
- Returns all lessons sorted by order_index
- Response Model: `list[LessonResponse]`
- Public access (no auth required)

#### `GET /user/progress/{user_id}`
- Returns user's completed lessons and averages
- Response Model: `ProgressResponse`
- Requires auth; returns 403 unless `user_id` matches the token's user
- Only aggregates `verified` attempts (anti-cheat enforcement)
- Calculates:
  - `completed_lessons` - Unique lesson IDs
  - `average_wpm` - Mean WPM across verified attempts
  - `average_accuracy` - Mean accuracy across verified attempts

#### `POST /attempts`
- Saves typing attempt to database
- Requires auth; `user_id` is derived from the JWT, not the request body
- Request Model: `AttemptCreate`
- Response Model: `AttemptResponse`
- Uses model properties for calculations:
  - `attempt.wpm` - Calculated by model
  - `attempt.accuracy` - Calculated by model
  - `attempt.verified` - Anti-cheat check (WPM < 250)

**Why Needed:** Provides API for lesson data and progress tracking, validates and stores performance data

---

### `models.py`
**Purpose:** Pydantic models for request/response validation

**Models:**

#### `AttemptCreate`
- Request body for creating attempt
- Fields: `lesson_id`, `start_time`, `end_time`, `total_keystrokes`, `error_count`
  (`user_id` comes from the authenticated JWT, not the body)
- Validators:
  - `end_time` must be > `start_time`
  - `total_keystrokes` must be > 0
- Properties (business logic):
  - `duration_seconds` - Calculated from timestamps
  - `wpm` - Words per minute calculation
  - `accuracy` - Percentage calculation
  - `verified` - Boolean for anti-cheat

#### `ProgressResponse`
- Fields: `completed_lessons: list[str]`, `average_wpm: float`, `average_accuracy: float`

#### `LessonResponse`
- Fields: `id`, `title`, `description`, `phase`, `unit`, `lesson_number`, `difficulty`, `order_index`, `content_json`

#### `AttemptResponse`
- Fields: `status: str`, `data: dict`

**Why Needed:**
- Type safety at API boundaries
- Automatic validation
- Business logic encapsulated in models
- Clear API contracts

---

### `dependencies.py`
**Purpose:** Dependency injection for Supabase client

**Key Function:**
- `get_supabase()` - Lazily creates the Supabase client from env variables
  (`@lru_cache` singleton); raises a clear error if config is missing

**Why Needed:**
- Singleton pattern for database connections
- Importing the app never crashes on missing env vars (fails at first use
  with a clear message instead)
- Easy to mock for testing
- Centralized configuration

---

# 🔄 Data Flow

## Typing Flow
```
User Types
    ↓
practice/page.tsx (handleInputChange)
    ↓
useKoreanTyping.ts (processes input)
    ↓
decomposition.ts (converts to jamo)
    ↓
guidance.ts (calculates next keys)
    ↓
CharacterDisplay.tsx (shows visual feedback)
    ↓
KoreanKeyboard.tsx (highlights keys)
```

## Progress Flow
```
Lesson Complete
    ↓
usePerformanceTracking.ts (submitAttempt)
    ↓
api.ts (API call)
    ↓
server/main.py POST /attempts
    ↓
models.py (validates & calculates)
    ↓
Supabase Database
```

## Auth Flow
```
User Logs In
    ↓
login/page.tsx (handleSignIn)
    ↓
Supabase Auth
    ↓
auth/callback/route.ts (if email signup)
    ↓
AuthContext.tsx (global state)
    ↓
All pages access via useAuth()
```

---

# 🎯 Key Architectural Decisions

## Why Jamo Decomposition?
Korean IME composes characters as you type (ㅎ + ㅏ → 하). We decompose them back to track individual keystrokes and provide accurate guidance.

## Why Compound Finals?
Characters like ㄺ require two keystrokes (ㄹ + ㄱ), but appear as single jamo. The guidance system must track partial progress.

## Why Locking Mechanism?
Sometimes IME gets into inconsistent states (e.g., user typed wrong follow-up). Locking prevents corrupted state and guides user to backspace.

## Why Multi-Line Display?
Showing completed and upcoming lines gives context, reduces surprises, and makes progress feel more natural.

## Why Guest Mode?
Reduces friction for new users, allows trial without commitment, increases conversion.

## Why Centralized Auth Context?
Prevents redundant API calls, provides single source of truth, enables real-time updates across app.

## Why Pydantic Properties for Business Logic?
Keeps models self-contained, makes testing easier, follows single responsibility principle.

---

# 📊 File Importance Matrix

| File | Importance | Complexity | Change Frequency |
|------|-----------|------------|------------------|
| useKoreanTyping.ts | Critical | High | Low |
| guidance.ts | Critical | High | Medium |
| decomposition.ts | Critical | Medium | Low |
| practice/page.tsx | Critical | High | Medium |
| CharacterDisplay.tsx | Critical | High | Medium |
| mappings.ts | Critical | Low | Low |
| main.py | Critical | Medium | Medium |
| AuthContext.tsx | High | Low | Low |
| useLessonProgress.ts | High | Medium | Medium |
| api.ts | High | Low | Medium |
| models.py | High | Medium | Medium |

---

**Last Updated:** April 2026
**Version:** 2.0
