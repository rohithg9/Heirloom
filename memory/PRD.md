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
| Life Book PDF Export | ✅ Implemented | P1 |
| Theme Book Export | ✅ Implemented | P1 |
| Elder-Friendly UI (Large Typography) | ✅ Implemented | P0 |
| Privacy Controls | ✅ Implemented | P1 |

### What's Been Implemented

**Date: Feb 6, 2026**

#### Backend (FastAPI + MongoDB)
- JWT Authentication with family vault access
- Family vault create/join/login endpoints
- Family member CRUD operations
- Memory cards with full metadata schema:
  - Title, narrative, time period, life stage
  - People involved, place, emotional tone
  - Sensory cues (taste, smell, sound, sight)
  - Occasion, highlights, privacy level
- AI Interview endpoint using Gemini 3 Flash
- Family relationship management
- Life Book export (by life stage)
- Theme Book export (food, love, travel, lessons, family)
- Vault statistics

#### Frontend (React + Tailwind + Shadcn)
- **Landing Page**: Cinematic hero, feature highlights, emotional design
- **Auth Page**: Create vault, join vault, login tabs
- **Dashboard**: Stats, quick actions, recent memories, family members
- **Voice Studio**: Voice recording, AI interview chat, memory extraction
- **Family Tree**: D3.js force-directed graph, add members, create relationships
- **Profile Page**: Member timeline, edit profile, view memories
- **Memories Page**: Grid/list view, search, filter by life stage
- **Memory Detail**: Full story view, edit, delete
- **Export Page**: Life book and theme book PDF generation
- **Settings Page**: Preferences, logout, account management

#### Design System
- Warm Ivory palette (#F9F7F2 background)
- Muted Emerald (#2E5C55) primary
- Playfair Display (serif) for headings
- Manrope (sans) for body text
- 48px minimum touch targets
- Large typography for elders

### Architecture

```
/app
├── backend/
│   ├── server.py          # FastAPI with all endpoints
│   └── .env               # MongoDB, JWT, Emergent LLM Key
├── frontend/
│   ├── src/
│   │   ├── contexts/      # AuthContext
│   │   ├── pages/         # All page components
│   │   └── components/ui/ # Shadcn components
│   └── .env               # Backend URL
└── memory/
    └── PRD.md             # This file
```

### Prioritized Backlog

#### P0 - Critical (Done)
- [x] Family vault authentication
- [x] Memory card creation
- [x] AI interview integration
- [x] Family tree visualization
- [x] Elder-friendly UI

#### P1 - High Priority (Done)
- [x] PDF export (life book)
- [x] Theme-based export
- [x] Privacy controls
- [x] Profile management

#### P2 - Medium Priority (Next Phase)
- [ ] Audio recording storage (S3)
- [ ] QR codes in PDF for voice playback
- [ ] Multi-language TTS voice output
- [ ] Family invitation email flow
- [ ] Memory reactions/comments
- [ ] Photo/media attachments to memories

#### P3 - Low Priority (Future)
- [ ] Print-ready book formatting
- [ ] Legacy Guardian role
- [ ] Mobile app (React Native)
- [ ] Timeline visualization with maps
- [ ] AI-generated chapter summaries
- [ ] Family analytics dashboard

### Next Tasks List

1. **Audio Storage**: Integrate S3 for storing voice recordings
2. **Voice QR Codes**: Generate QR codes in PDFs linking to audio
3. **Email Invites**: Send family invitation emails
4. **Photo Upload**: Add image attachments to memories
5. **Multi-language TTS**: Use Gemini for voice output in 60 languages
6. **Mobile Optimization**: Enhance responsive design for mobile family viewing

### Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 19, Tailwind CSS, Shadcn UI |
| Backend | FastAPI, Python 3.11 |
| Database | MongoDB |
| AI | Gemini 3 Flash (via emergentintegrations) |
| Visualization | D3.js |
| Animation | Framer Motion |
| PDF Generation | jsPDF |
| Auth | JWT (bcrypt hashing) |

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/vaults/create` | POST | Create new family vault |
| `/api/vaults/join` | POST | Join existing vault |
| `/api/vaults/login` | POST | Login to vault |
| `/api/members` | GET/POST | Manage family members |
| `/api/memories` | GET/POST | List/create memories |
| `/api/memories/{id}` | GET/PUT/DELETE | Memory CRUD |
| `/api/ai/interview` | POST | AI interview session |
| `/api/relationships` | GET/POST | Family relationships |
| `/api/export/life-book/{id}` | GET | Export life book data |
| `/api/export/theme-book` | GET | Export theme book data |
| `/api/stats` | GET | Vault statistics |

---
*Last Updated: Feb 6, 2026*
