# HangulType

A modern Korean typing tutor with real-time feedback, intelligent guidance, and comprehensive lessons. Master Korean typing (Hangul) with an interactive interface.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## Features

### Core Typing Engine

- **Intelligent Korean Input Detection** - Automatically detects and guides correct IME usage
- **Multi-Stroke Character Support** - Full support for complex vowels (ㅘ, ㅝ, etc.) and compound final consonants (ㄺ, ㄻ, etc.)
- **Real-Time Visual Feedback**
  - ✅ Green: Correct characters
  - 🟡 Yellow: Partial progress on multi-stroke characters
  - 🔴 Red: Errors with visual indication of what you typed vs. what's expected
- **Context-Aware Guidance** - Position-aware input for ㅆ and ㄲ (Shift for initial, double-tap for final)
- **Live Progress Display** - Shows partial character completion during multi-stroke typing

### Progressive Curriculum

- **Phase 1: Foundation** - Master basic jamo (consonants and vowels)
- **Phase 2: Syllables** - Combine jamo into syllable blocks
- **Phase 3: Words** - Practice real Korean vocabulary
- **Phase 4: Sentences** - Build fluency with full sentences
- **Phase 5: Advanced** - Complex paragraphs and real-world text

### Performance Tracking

- **Real-Time Statistics** - WPM (Words Per Minute) and accuracy tracking
- **Cloud Sync** - Progress saved to Supabase
- **User Profiles** - Track completed lessons and view aggregated stats
- **Anti-Cheat Validation** - Server-side verification of typing performance

## Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Supabase Client** - Authentication and real-time data

### Backend

- **FastAPI** - Modern Python web framework
- **Pydantic** - Data validation and settings management
- **Supabase** - PostgreSQL database and auth
- **Uvicorn** - ASGI server

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **Python** v3.8 or higher
- **Supabase Account** (for database and auth)

### 1. Clone the Repository

```bash
git clone https://github.com/ChristopherTablasDeLaCruz/hangultype.git
cd hangultype
```

### 2. Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your environment variables to .env.local
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Run development server
npm run dev
```

Frontend will be available at **http://localhost:3000**

### 3. Backend Setup

```bash
# Navigate to server directory (from project root)
cd server

# Create virtual environment
python -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Add your environment variables to .env
# SUPABASE_URL=your_supabase_url
# SUPABASE_KEY=your_supabase_service_key
# CORS_ORIGINS=http://localhost:3000,https://hangultype.vercel.app

# Run the server
python -m uvicorn app.main:app --reload --port 8000
```

Backend API will be available at **http://localhost:8000**

### 4. Database Setup

Create the following tables in your Supabase project:

```sql
-- Lessons table
CREATE TABLE lessons (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  phase TEXT NOT NULL,
  unit INTEGER NOT NULL,
  lesson_number INTEGER NOT NULL,
  difficulty INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  content_json JSONB NOT NULL
);

-- Attempts table
CREATE TABLE attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  lesson_id TEXT NOT NULL REFERENCES lessons(id),
  wpm INTEGER NOT NULL,
  accuracy NUMERIC(5,2) NOT NULL,
  duration_seconds NUMERIC(8,2) NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 📁 Project Structure

```
hangultype/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   │   ├── lessons/   # Lesson selection
│   │   │   ├── practice/  # Main typing practice
│   │   │   └── profile/   # User statistics
│   │   ├── components/    # React components
│   │   │   ├── practice/  # Practice-specific components
│   │   │   └── ErrorBoundary.tsx
│   │   ├── context/       # React context providers
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and API client
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Helper functions
│   │       ├── korean/    # Korean typing engine
│   │       └── typing/    # Text processing
│   └── package.json
│
└── server/                # FastAPI backend
    ├── app/
    │   ├── main.py        # API routes
    │   ├── models.py      # Pydantic models
    │   └── dependencies.py # Dependency injection
    └── requirements.txt
```

## Testing the App

### Health Check

```bash
# Backend health check
curl http://localhost:8000
# Expected: {"status":"ok","message":"HangulType API is running"}

# API documentation
open http://localhost:8000/docs
```

### Manual Testing

1. **Visit** http://localhost:3000
2. **Sign up** or log in with Supabase Auth
3. **Select a lesson** from the lessons page
4. **Practice typing** and watch real-time feedback
5. **View stats** on your profile page
