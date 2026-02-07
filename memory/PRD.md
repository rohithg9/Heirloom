# Heirloom - Family Memory Preservation Platform

## Product Requirements Document (PRD)

### Original Problem Statement
Build a public SaaS product called "Heirloom" that allows families to privately preserve life stories and memories across generations. The product is legacy-first, optimized primarily for elders (55-85 years), while supporting family members across tablet, mobile, and web.

### User Personas

1. **Primary: Elder Storyteller (55-85 years)**
   - Voice-first interaction preferred
   - Tablet-optimized experience
   - Minimal cognitive load
   - Needs gentle, unhurried guidance

2. **Secondary: Family Member**
   - Mobile listening experience
   - Read-only family stories
   - Quick reactions and questions

3. **Tertiary: Family Archivist**
   - Web-based cinematic archive
   - Export and print capabilities
   - Full editing access

### Core Requirements (Static)

| Feature | Status | Priority |
|---------|--------|----------|
| Family Vault (surname + code auth) | ✅ Implemented | P0 |
| Family Tree Visualization | ✅ Implemented | P0 |
| Memory Cards with Rich Metadata | ✅ Implemented | P0 |
| AI Voice Interview (Gemini 3) | ✅ Implemented | P0 |
| Voice Recording (Web Speech API) | ✅ Implemented | P0 |
| AI Voice Output (TTS) | ✅ Implemented | P0 |
| Editable Transcripts | ✅ Implemented | P0 |
| Session Save & Continue | ✅ Implemented | P1 |
| Multi-language Support (20+) | ✅ Implemented | P1 |
| Life Book PDF Export | ✅ Implemented | P1 |
| Theme Book Export | ✅ Implemented | P1 |
| Elder-Friendly UI (Large Typography) | ✅ Implemented | P0 |
| Privacy Controls | ✅ Implemented | P1 |
| **Interactive Demo Experience** | ✅ Implemented | P0 |
| **Sage AI Companion** | ✅ Implemented | P0 |
| **Cinematic Memory Viewer** | ✅ Implemented | P1 |

### What's Been Implemented

**Date: Feb 7, 2026 (Update 9) - Age-Appropriate Voices & Voice Clashing Fix**

#### Bug Fixes:
1. **Voice Clashing Bug Fixed** - Audio now properly stops when:
   - Switching between memories
   - Navigating to different views
   - Clicking play on a new story
   - Using AbortController to cancel pending TTS requests

#### Voice Improvements:
2. **Age-Appropriate Voices** - Characters now have voices matching their age:
   - **Elderly (65+)**: Mature, grandparent-like voices
     - `female_elderly` - Lily (grandmotherly)
     - `male_elderly` - Arnold (deep, wise)
   - **Middle-Aged (40-65)**: Warm adult voices
     - `female_mature` - Sarah
     - `male_mature` - Antoni
   - **Young (<40)**: Youthful voices
     - `female_young` - Rachel
     - `male_young` - Adam

3. **More Emotional Delivery** - Increased style parameter to 0.6 for more expressive narration

4. **New TTS Hook Features** (`useElevenLabsTTS.js`)
   - `speakAsCharacter(text, gender, birthYear)` - Auto-selects age-appropriate voice
   - AbortController for cancelling pending requests
   - Proper cleanup on unmount

**Date: Feb 6, 2026 (Update 8) - ElevenLabs Natural Voice Integration**

#### New Features:
1. **ElevenLabs TTS Integration** - Human-like voices with emotion throughout the app
   - Sage voice: Sarah (soft, warm female)
   - Female characters: Rachel (young), Sarah (warm)
   - Male characters: Adam (young), Arnold (deep, warm)

2. **Backend TTS Endpoint**
   - `POST /api/tts/generate` - Generates audio from text
   - `GET /api/tts/voices` - Lists available voices
   - Caches audio for performance

3. **Frontend TTS Hook** (`/hooks/useElevenLabsTTS.js`)
   - `speakAsSage(text)` - Sage's warm narrator voice
   - `speakAsFemale(text, young)` - Female character voice
   - `speakAsMale(text, young)` - Male character voice
   - Stop, loading, and playing states

4. **Updated Components**
   - SageBubble now uses ElevenLabs
   - SageWelcomeModal uses ElevenLabs for greeting
   - DemoPage uses gender-appropriate voices for stories

**Date: Feb 6, 2026 (Update 7) - UI Simplification & Layout Fixes**

#### Changes Made:
1. **Landing Page Button Reorder**
   - "Try the Demo Experience" now FIRST with attractive amber/orange gradient
   - "Create Your Family Vault" second (green)
   - Buttons stack nicely on mobile

2. **Simplified Voice Playback UI**
   - BIG amber play button in center (easy to tap)
   - "Hear [Name]'s Voice" label
   - "Original Voice" is now the DEFAULT
   - Sage narration is subtle secondary option ("or let Sage narrate")
   - Clean, uncluttered design

3. **Voice Badge on Memory Cards**
   - Amber "🎙️ Voice" badge shows each memory has voice recording

**Date: Feb 6, 2026 (Update 6) - Third-Person Narration & Voice Demo**

#### New Features:
1. **Sage Third-Person Narration** 
   - Transforms "I was twenty-two..." to "Kamala was twenty-two..."
   - Creates story introductions: "Let me share Kamala's story filled with pride..."
   - Adds reflective closings after each story
   - Uses storytelling pace (slower, more dramatic)

2. **Voice Mode Toggle in Demo**
   - "Original Voice" - Simulates user's recorded voice (gender-appropriate)
   - "Sage Narrates" - Sage tells story in third person like a storyteller
   - Play/Stop buttons with status indicators

3. **Voice Recording Indicators**
   - Amber "🎙️ Voice" badge on each memory card
   - Shows users that voice recordings are part of each story

4. **Utility Functions** (`/utils/narrativeUtils.js`)
   - `transformToThirdPerson()` - Converts first to third person
   - `createStoryIntro()` - Generates contextual introductions
   - `createStoryClosing()` - Creates emotional reflections
   - `getMemberGender()` - Detects gender for voice selection

**Date: Feb 6, 2026 (Update 5) - Voice Recording & Branding**

#### New Features:
1. **Custom Logo** - Beautiful golden tree with heart icon as brand identity
   - Clickable to homepage from anywhere in the app
   - Used in header, footer, and demo pages

2. **Sage Cloud Avatar** - Adorable cloud character with rosy cheeks
   - Custom image asset at `/public/images/sage-avatar.png`
   - Animated speaking rings when AI is talking

3. **Voice Recording Feature** - Preserve actual user voices
   - Records user's voice while they speak (Web Audio API)
   - Stores audio locally on server (`/backend/uploads/audio/`)
   - Links audio to memories in database
   - Playback available after recording

4. **Gender-Based Voice Selection** - TTS matches storyteller's gender
   - Detects author gender from member data
   - Uses male voice for male storytellers, female for female

5. **Backend Audio API Endpoints**:
   - `POST /api/audio/upload` - Upload audio recording
   - `GET /api/audio/{id}` - Stream audio file
   - `GET /api/audio` - List recordings
   - `DELETE /api/audio/{id}` - Delete recording

**Date: Feb 6, 2026 (Update 4) - UI/UX Fixes**

#### Issues Fixed:
1. **Mobile Layout Chaos** - Fixed overlapping text and images in cinematic memory viewer
   - Added semi-transparent card for narrative text for better readability
   - Reorganized bottom controls with proper spacing
   - Made timeline thumbnails horizontally scrollable and centered
   - Fixed Sage bubble positioning to not overlap content

2. **Sage Avatar Redesign** - Replaced ugly owl SVG with elegant emerald sparkles icon
   - Clean, minimal design that matches app branding
   - Proper sizing for all breakpoints (sm, md, lg, xl)

3. **Voice Quality Improvements** - Optimized browser TTS settings
   - Better voice selection algorithm (prefers Google UK English Female, Samantha, Karen)
   - Slower rate (0.85) and warmer pitch (1.05) for more natural feel
   - Proper voice loading with voiceschanged event listener

**Date: Feb 6, 2026 (Update 3) - Demo Experience**

#### New Features Added:
1. **Sage AI Companion** - Friendly character that guides users through the app
   - Appears on landing page after 3 seconds for first-time visitors
   - Provides context-aware narrations throughout the demo
   - Voice output using Web Speech API
   - Cute owl-inspired avatar design

2. **Interactive Demo Experience** (/demo route)
   - Complete demo family: "Sharma-Williams" (3 generations, 6 members)
   - 10 rich memories with cover images, emotions, and sensory details
   - Four demo views: Introduction, Family Tree, Memory Gallery, Life Book
   - Beautiful cinematic memory viewer with autoplay
   - PDF Life Book export with professional cover page

3. **Demo Family Members:**
   - Generation 1: Kamala Devi Sharma (Nani), Rajan Sharma (Nana)
   - Generation 2: Priya Sharma-Williams (Mom), James Williams (Dad)
   - Generation 3: Maya Williams, Arjun Williams

4. **Demo Memories Include:**
   - "The Day I Became a Teacher" - Nani's first teaching day
   - "My Mother's Kitchen Magic" - Sunday jalebi traditions
   - "Building the Bridge at Haridwar" - Nana's engineering achievement
   - "The Night I Met Kamala" - Love story at a Delhi wedding
   - "When London Rain Brought Me Love" - Priya meets James
   - "Why I Created Heirloom" - Maya's inspiration story
   - And more across all life stages

5. **Cinematic Memory Viewer:**
   - Full-screen memory display with background images
   - Prev/Next navigation with timeline thumbnails
   - Autoplay mode (8 seconds per memory)
   - Emotion badges and sensory cue display
   - Voice narration of story content

6. **PDF Life Book Export:**
   - Professional cover page design
   - Table of contents
   - Family tree page
   - Chapters organized by life stage
   - Gold accents and elegant typography

### Architecture

```
/app
├── backend/
│   ├── server.py          # FastAPI with all endpoints
│   └── .env               # MongoDB, JWT, Emergent LLM Key
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/        # Shadcn components
│   │   │   └── SageCompanion.jsx  # Sage avatar & bubbles
│   │   ├── contexts/
│   │   │   └── AuthContext.js
│   │   ├── data/
│   │   │   └── demoFamily.js  # Demo family static data
│   │   ├── pages/
│   │   │   ├── LandingPage.js  # With Sage welcome
│   │   │   ├── DemoPage.js     # Full demo experience
│   │   │   └── ...
│   │   └── utils/
│   │       └── pdfExport.js    # PDF generation utility
│   └── .env
└── memory/
    └── PRD.md
```

### Prioritized Backlog

#### P0 - Critical (Done)
- [x] Family vault authentication
- [x] Memory card creation
- [x] AI interview integration (Sage)
- [x] AI voice output (TTS)
- [x] Editable transcripts
- [x] Multi-language support
- [x] Session save & continue
- [x] Interactive demo experience
- [x] Sage AI companion

#### P1 - High Priority (Done)
- [x] PDF export (life book)
- [x] Theme-based export
- [x] Privacy controls
- [x] Profile management
- [x] Language settings persistence
- [x] Cinematic memory viewer

#### P2 - Medium Priority (Next Phase)
- [ ] Audio recording storage (S3)
- [ ] QR codes in PDF for voice playback
- [ ] Photo/media attachments to memories
- [ ] Family invitation email flow
- [ ] Memory reactions/comments
- [ ] Visual Family Tree with D3.js

#### P3 - Low Priority (Future)
- [ ] Print-ready book formatting
- [ ] Legacy Guardian role
- [ ] Mobile app (React Native)
- [ ] Timeline visualization with maps
- [ ] AI-generated chapter summaries
- [ ] Owner vs Family-View modes

### Next Tasks List

1. **Visual Family Tree**: Implement D3.js organic tree visualization
2. **Audio Storage**: Integrate S3 for storing voice recordings
3. **Voice QR Codes**: Generate QR codes in PDFs linking to audio
4. **Owner/Family Modes**: Implement dual-mode system (edit vs read-only)
5. **Photo Upload**: Add image attachments to memories

### Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 19, Tailwind CSS, Shadcn UI |
| Backend | FastAPI, Python 3.11 |
| Database | MongoDB |
| AI | Gemini 3 Flash (via emergentintegrations) |
| TTS | Web Speech API (browser native) |
| STT | Web Speech API (browser native) |
| Visualization | D3.js (installed) |
| Animation | Framer Motion |
| PDF Generation | jsPDF |
| Auth | JWT (bcrypt hashing) |

### Key Files Reference

| File | Purpose |
|------|---------|
| `/app/frontend/src/pages/DemoPage.js` | Complete demo experience |
| `/app/frontend/src/components/SageCompanion.jsx` | Sage avatar, bubble, modal |
| `/app/frontend/src/data/demoFamily.js` | Demo family static data |
| `/app/frontend/src/utils/pdfExport.js` | PDF generation utility |
| `/app/frontend/src/pages/LandingPage.js` | Landing with Sage welcome |
| `/app/backend/server.py` | All backend API endpoints |

---
*Last Updated: Feb 6, 2026*
