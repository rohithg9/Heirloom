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

### What's Been Implemented

**Date: Feb 6, 2026 (Update 2)**

#### New Features Added:
1. **Removed Emergent Badge** - Clean branding
2. **Editable Transcripts** - Users can edit voice-to-text before sending
3. **Save & Continue Sessions** - Story sessions are auto-saved and can be continued
4. **AI Voice Output (TTS)** - AI speaks responses like Siri/Alexa
5. **Age Detection in AI** - AI asks "how old were you?" to chronologically organize memories
6. **Multi-language Support** - 20+ languages in settings and voice studio
7. **Language Persistence** - Language choice saved in localStorage

#### Backend (FastAPI + MongoDB)
- JWT Authentication with family vault access
- AI Interview with improved prompts for age detection
- Session saving and retrieval
- Memory extraction with approximate_age field

#### Frontend (React + Tailwind + Shadcn)
- **Voice Studio Improvements:**
  - Language selector in header
  - Voice toggle (mute/unmute AI)
  - Session history button
  - Editable transcript with edit/confirm workflow
  - "Start a New Story" initiates AI greeting
  - "Continue a Story" loads saved sessions
  - AI speaks responses using Web Speech API
- **Settings Page:**
  - Language selection dropdown (20+ languages)
  - AI Voice toggle
  - Saved to localStorage for persistence

#### Languages Supported
English (US/UK/India), Hindi, Spanish, French, German, Italian, Portuguese, Chinese, Japanese, Korean, Arabic, Russian, Bengali, Tamil, Telugu, Marathi, Gujarati, Punjabi

### Architecture

```
/app
├── backend/
│   ├── server.py          # FastAPI with all endpoints
│   └── .env               # MongoDB, JWT, Emergent LLM Key
├── frontend/
│   ├── src/
│   │   ├── contexts/      # AuthContext (fixed)
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
- [x] AI voice output (TTS)
- [x] Editable transcripts
- [x] Multi-language support
- [x] Session save & continue

#### P1 - High Priority (Done)
- [x] PDF export (life book)
- [x] Theme-based export
- [x] Privacy controls
- [x] Profile management
- [x] Language settings persistence

#### P2 - Medium Priority (Next Phase)
- [ ] Audio recording storage (S3)
- [ ] QR codes in PDF for voice playback
- [ ] Photo/media attachments to memories
- [ ] Family invitation email flow
- [ ] Memory reactions/comments

#### P3 - Low Priority (Future)
- [ ] Print-ready book formatting
- [ ] Legacy Guardian role
- [ ] Mobile app (React Native)
- [ ] Timeline visualization with maps
- [ ] AI-generated chapter summaries

### Next Tasks List

1. **Audio Storage**: Integrate S3 for storing voice recordings
2. **Voice QR Codes**: Generate QR codes in PDFs linking to audio
3. **Email Invites**: Send family invitation emails
4. **Photo Upload**: Add image attachments to memories
5. **Premium TTS**: Consider ElevenLabs for more natural voices

### Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 19, Tailwind CSS, Shadcn UI |
| Backend | FastAPI, Python 3.11 |
| Database | MongoDB |
| AI | Gemini 3 Flash (via emergentintegrations) |
| TTS | Web Speech API (browser native) |
| STT | Web Speech API (browser native) |
| Visualization | D3.js |
| Animation | Framer Motion |
| PDF Generation | jsPDF |
| Auth | JWT (bcrypt hashing) |

---
*Last Updated: Feb 6, 2026*
