from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import jwt
import bcrypt
import base64
import shutil
import io
from emergentintegrations.llm.chat import LlmChat, UserMessage
from elevenlabs import ElevenLabs, VoiceSettings

ROOT_DIR = Path(__file__).parent
UPLOADS_DIR = ROOT_DIR / "uploads"
AUDIO_DIR = UPLOADS_DIR / "audio"
TTS_CACHE_DIR = UPLOADS_DIR / "tts_cache"

# Ensure directories exist
UPLOADS_DIR.mkdir(exist_ok=True)
AUDIO_DIR.mkdir(exist_ok=True)
TTS_CACHE_DIR.mkdir(exist_ok=True)

load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'heirloom_default_secret')
JWT_ALGORITHM = "HS256"

# Emergent LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# ElevenLabs Configuration
ELEVENLABS_API_KEY = os.environ.get('ELEVENLABS_API_KEY', '')
eleven_client = ElevenLabs(api_key=ELEVENLABS_API_KEY) if ELEVENLABS_API_KEY else None

# ElevenLabs Voice IDs - Natural, warm voices
VOICE_IDS = {
    # Sage - warm, friendly female narrator
    "sage": "EXAVITQu4vr4xnSDxMaL",  # Sarah - soft, warm
    # Female storyteller voices
    "female_warm": "EXAVITQu4vr4xnSDxMaL",  # Sarah
    "female_young": "21m00Tcm4TlvDq8ikWAM",  # Rachel - clear, engaging
    # Male storyteller voices  
    "male_warm": "VR6AewLTigWG4xSOukaG",  # Arnold - deep, warm
    "male_young": "pNInz6obpgDQGcFmaJgB",  # Adam - clear, friendly
    # Default fallbacks
    "default_female": "EXAVITQu4vr4xnSDxMaL",
    "default_male": "VR6AewLTigWG4xSOukaG"
}

# Create the main app
app = FastAPI(title="Heirloom API", description="Family Memory Preservation Platform")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer(auto_error=False)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class FamilyVaultCreate(BaseModel):
    family_name: str
    family_code: str
    created_by_name: str
    created_by_email: str
    password: str

class FamilyVaultJoin(BaseModel):
    family_name: str
    family_code: str
    member_name: str
    member_email: str
    password: str

class FamilyVaultLogin(BaseModel):
    family_name: str
    family_code: str
    email: str
    password: str

class FamilyVault(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    family_name: str
    family_code_hash: str
    created_at: str
    updated_at: str

class FamilyMember(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vault_id: str
    name: str
    email: str
    password_hash: str
    role: str = "member"  # admin, member, viewer
    birth_year: Optional[int] = None
    birth_place: Optional[str] = None
    photo_url: Optional[str] = None
    bio: Optional[str] = None
    life_stages: List[str] = Field(default_factory=lambda: ["childhood", "youth", "adulthood", "later_life"])
    created_at: str
    updated_at: str

class FamilyRelationship(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vault_id: str
    from_member_id: str
    to_member_id: str
    relationship_type: str  # parent, child, spouse, sibling
    created_at: str

class MemoryCardCreate(BaseModel):
    title: str
    narrative: str
    time_period: Optional[str] = None
    life_stage: Optional[str] = None
    people_involved: List[str] = Field(default_factory=list)
    place: Optional[str] = None
    emotional_tone: Optional[str] = None
    emotional_intensity: Optional[float] = None
    sensory_cues: Dict[str, str] = Field(default_factory=dict)
    occasion: Optional[str] = None
    highlights: List[str] = Field(default_factory=list)
    privacy_level: str = "family"  # private, family, custom
    confidence: str = "clear"  # clear, fuzzy

class MemoryCard(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vault_id: str
    author_id: str
    title: str
    narrative: str
    audio_url: Optional[str] = None
    transcript: Optional[str] = None
    time_period: Optional[str] = None
    life_stage: Optional[str] = None
    people_involved: List[str] = Field(default_factory=list)
    place: Optional[str] = None
    emotional_tone: Optional[str] = None
    emotional_intensity: Optional[float] = None
    sensory_cues: Dict[str, str] = Field(default_factory=dict)
    occasion: Optional[str] = None
    highlights: List[str] = Field(default_factory=list)
    privacy_level: str = "family"
    confidence: str = "clear"
    created_at: str
    updated_at: str

class AIInterviewMessage(BaseModel):
    message: str
    session_id: Optional[str] = None
    language: Optional[str] = "en-US"

class AIInterviewResponse(BaseModel):
    response: str
    session_id: str
    extracted_memory: Optional[Dict[str, Any]] = None
    suggested_followup: Optional[str] = None

class MemberUpdate(BaseModel):
    name: Optional[str] = None
    birth_year: Optional[int] = None
    birth_place: Optional[str] = None
    photo_url: Optional[str] = None
    bio: Optional[str] = None

class RelationshipCreate(BaseModel):
    from_member_id: str
    to_member_id: str
    relationship_type: str

# ==================== HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(data: dict) -> str:
    return jwt.encode(data, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(credentials.credentials)
    member = await db.members.find_one({"id": payload.get("member_id")}, {"_id": 0})
    if not member:
        raise HTTPException(status_code=401, detail="User not found")
    return member

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/vaults/create")
async def create_vault(data: FamilyVaultCreate):
    """Create a new family vault"""
    # Check if vault already exists
    existing = await db.vaults.find_one({
        "family_name": data.family_name.lower()
    })
    if existing:
        raise HTTPException(status_code=400, detail="A vault with this family name already exists")
    
    now = datetime.now(timezone.utc).isoformat()
    
    # Create vault
    vault = FamilyVault(
        family_name=data.family_name.lower(),
        family_code_hash=hash_password(data.family_code),
        created_at=now,
        updated_at=now
    )
    vault_dict = vault.model_dump()
    await db.vaults.insert_one(vault_dict)
    
    # Create admin member
    member = FamilyMember(
        vault_id=vault.id,
        name=data.created_by_name,
        email=data.created_by_email.lower(),
        password_hash=hash_password(data.password),
        role="admin",
        created_at=now,
        updated_at=now
    )
    member_dict = member.model_dump()
    await db.members.insert_one(member_dict)
    
    # Generate token
    token = create_token({
        "vault_id": vault.id,
        "member_id": member.id,
        "role": member.role
    })
    
    return {
        "token": token,
        "vault_id": vault.id,
        "member_id": member.id,
        "family_name": data.family_name,
        "member_name": data.created_by_name,
        "role": "admin"
    }

@api_router.post("/vaults/join")
async def join_vault(data: FamilyVaultJoin):
    """Join an existing family vault"""
    vault = await db.vaults.find_one({"family_name": data.family_name.lower()}, {"_id": 0})
    if not vault:
        raise HTTPException(status_code=404, detail="Family vault not found")
    
    if not verify_password(data.family_code, vault["family_code_hash"]):
        raise HTTPException(status_code=401, detail="Invalid family code")
    
    # Check if email already exists in vault
    existing_member = await db.members.find_one({
        "vault_id": vault["id"],
        "email": data.member_email.lower()
    })
    if existing_member:
        raise HTTPException(status_code=400, detail="Email already registered in this vault")
    
    now = datetime.now(timezone.utc).isoformat()
    
    # Create member
    member = FamilyMember(
        vault_id=vault["id"],
        name=data.member_name,
        email=data.member_email.lower(),
        password_hash=hash_password(data.password),
        role="member",
        created_at=now,
        updated_at=now
    )
    member_dict = member.model_dump()
    await db.members.insert_one(member_dict)
    
    token = create_token({
        "vault_id": vault["id"],
        "member_id": member.id,
        "role": member.role
    })
    
    return {
        "token": token,
        "vault_id": vault["id"],
        "member_id": member.id,
        "family_name": data.family_name,
        "member_name": data.member_name,
        "role": "member"
    }

@api_router.post("/vaults/login")
async def login_vault(data: FamilyVaultLogin):
    """Login to family vault"""
    vault = await db.vaults.find_one({"family_name": data.family_name.lower()}, {"_id": 0})
    if not vault:
        raise HTTPException(status_code=404, detail="Family vault not found")
    
    if not verify_password(data.family_code, vault["family_code_hash"]):
        raise HTTPException(status_code=401, detail="Invalid family code")
    
    member = await db.members.find_one({
        "vault_id": vault["id"],
        "email": data.email.lower()
    }, {"_id": 0})
    
    if not member:
        raise HTTPException(status_code=404, detail="Member not found in this vault")
    
    if not verify_password(data.password, member["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid password")
    
    token = create_token({
        "vault_id": vault["id"],
        "member_id": member["id"],
        "role": member["role"]
    })
    
    return {
        "token": token,
        "vault_id": vault["id"],
        "member_id": member["id"],
        "family_name": data.family_name,
        "member_name": member["name"],
        "role": member["role"]
    }

# ==================== MEMBER ENDPOINTS ====================

@api_router.get("/members")
async def get_members(user: dict = Depends(get_current_user)):
    """Get all members in the vault"""
    members = await db.members.find(
        {"vault_id": user["vault_id"]},
        {"_id": 0, "password_hash": 0}
    ).to_list(100)
    return members

@api_router.get("/members/{member_id}")
async def get_member(member_id: str, user: dict = Depends(get_current_user)):
    """Get a specific member"""
    member = await db.members.find_one(
        {"id": member_id, "vault_id": user["vault_id"]},
        {"_id": 0, "password_hash": 0}
    )
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member

@api_router.put("/members/{member_id}")
async def update_member(member_id: str, data: MemberUpdate, user: dict = Depends(get_current_user)):
    """Update member profile"""
    if member_id != user["id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Can only update your own profile")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.members.update_one(
        {"id": member_id, "vault_id": user["vault_id"]},
        {"$set": update_data}
    )
    
    return {"message": "Profile updated"}

@api_router.get("/members/me")
async def get_current_member(user: dict = Depends(get_current_user)):
    """Get current logged in member"""
    member = await db.members.find_one(
        {"id": user["id"]},
        {"_id": 0, "password_hash": 0}
    )
    return member

# ==================== RELATIONSHIP ENDPOINTS ====================

@api_router.post("/relationships")
async def create_relationship(data: RelationshipCreate, user: dict = Depends(get_current_user)):
    """Create a family relationship"""
    now = datetime.now(timezone.utc).isoformat()
    
    relationship = FamilyRelationship(
        vault_id=user["vault_id"],
        from_member_id=data.from_member_id,
        to_member_id=data.to_member_id,
        relationship_type=data.relationship_type,
        created_at=now
    )
    
    await db.relationships.insert_one(relationship.model_dump())
    return {"id": relationship.id, "message": "Relationship created"}

@api_router.get("/relationships")
async def get_relationships(user: dict = Depends(get_current_user)):
    """Get all relationships in the vault"""
    relationships = await db.relationships.find(
        {"vault_id": user["vault_id"]},
        {"_id": 0}
    ).to_list(500)
    return relationships

@api_router.delete("/relationships/{relationship_id}")
async def delete_relationship(relationship_id: str, user: dict = Depends(get_current_user)):
    """Delete a relationship"""
    result = await db.relationships.delete_one({
        "id": relationship_id,
        "vault_id": user["vault_id"]
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Relationship not found")
    return {"message": "Relationship deleted"}

# ==================== MEMORY ENDPOINTS ====================

@api_router.post("/memories")
async def create_memory(data: MemoryCardCreate, user: dict = Depends(get_current_user)):
    """Create a new memory card"""
    now = datetime.now(timezone.utc).isoformat()
    
    memory = MemoryCard(
        vault_id=user["vault_id"],
        author_id=user["id"],
        title=data.title,
        narrative=data.narrative,
        time_period=data.time_period,
        life_stage=data.life_stage,
        people_involved=data.people_involved,
        place=data.place,
        emotional_tone=data.emotional_tone,
        emotional_intensity=data.emotional_intensity,
        sensory_cues=data.sensory_cues,
        occasion=data.occasion,
        highlights=data.highlights,
        privacy_level=data.privacy_level,
        confidence=data.confidence,
        created_at=now,
        updated_at=now
    )
    
    await db.memories.insert_one(memory.model_dump())
    return {"id": memory.id, "message": "Memory created"}

@api_router.get("/memories")
async def get_memories(
    author_id: Optional[str] = None,
    life_stage: Optional[str] = None,
    privacy_level: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    """Get memories from the vault"""
    query = {"vault_id": user["vault_id"]}
    
    if author_id:
        query["author_id"] = author_id
    if life_stage:
        query["life_stage"] = life_stage
    
    # Filter by privacy
    if privacy_level:
        query["privacy_level"] = privacy_level
    else:
        # Show family memories and own private memories
        query["$or"] = [
            {"privacy_level": "family"},
            {"privacy_level": "private", "author_id": user["id"]}
        ]
    
    memories = await db.memories.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return memories

@api_router.get("/memories/{memory_id}")
async def get_memory(memory_id: str, user: dict = Depends(get_current_user)):
    """Get a specific memory"""
    memory = await db.memories.find_one(
        {"id": memory_id, "vault_id": user["vault_id"]},
        {"_id": 0}
    )
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")
    
    # Check privacy
    if memory["privacy_level"] == "private" and memory["author_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="This memory is private")
    
    return memory

@api_router.put("/memories/{memory_id}")
async def update_memory(memory_id: str, data: MemoryCardCreate, user: dict = Depends(get_current_user)):
    """Update a memory card"""
    memory = await db.memories.find_one({"id": memory_id, "vault_id": user["vault_id"]})
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")
    
    if memory["author_id"] != user["id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Can only edit your own memories")
    
    update_data = data.model_dump()
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.memories.update_one(
        {"id": memory_id},
        {"$set": update_data}
    )
    return {"message": "Memory updated"}

@api_router.delete("/memories/{memory_id}")
async def delete_memory(memory_id: str, user: dict = Depends(get_current_user)):
    """Delete a memory card"""
    memory = await db.memories.find_one({"id": memory_id, "vault_id": user["vault_id"]})
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")
    
    if memory["author_id"] != user["id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Can only delete your own memories")
    
    await db.memories.delete_one({"id": memory_id})
    return {"message": "Memory deleted"}

# ==================== AI INTERVIEW ENDPOINTS ====================

AI_SYSTEM_PROMPT = """You are Sage, a gentle, warm AI companion for Heirloom, a family memory preservation platform. Your role is to help elderly users record their life stories through calm, unhurried voice conversations - like talking to a caring friend.

YOUR NAME IS SAGE - always introduce yourself as Sage when greeting users.

PERSONALITY RULES:
- Speak naturally and warmly, as if talking face-to-face
- Keep responses SHORT (2-4 sentences max) - you're having a conversation, not giving lectures
- Be genuinely curious and ask ONE follow-up question at a time
- Accept uncertainty gracefully ("I don't remember" is perfectly fine)
- Never rush or interrogate
- Ask permission before sensitive topics
- Use culturally adaptive language (respectful of Indian family values, globally neutral)

CRITICAL - ALWAYS ASK ABOUT AGE/TIME:
When someone shares a memory, ALWAYS gently ask about when it happened:
- "How old were you when this happened?" 
- "Was this during your childhood, or later in life?"
- "Do you remember approximately what year that was?"
This helps us organize memories chronologically.

INTERVIEW APPROACH:
1. Start by warmly inviting them to share: "I'd love to hear a story from your life. What comes to mind?"
2. When they share something, ask about the TIME/AGE first
3. Then ask ONE sensory detail: "What do you remember seeing/smelling/hearing?"
4. Ask about people: "Who else was there with you?"
5. Capture emotional tone naturally through conversation

VOICE-FIRST DESIGN:
- You are SPEAKING to them, not just texting
- Keep sentences short and conversational
- Use warm interjections: "Oh, that's lovely!", "I can imagine!", "What a special memory!"
- Pause naturally between thoughts

RESPONSE FORMAT:
After each response, if you detect a COMPLETE memory with enough details, extract it in this JSON format at the END:
[MEMORY_EXTRACT]
{
  "title": "A meaningful title",
  "narrative": "The story in natural language",
  "time_period": "approximate year or time description",
  "approximate_age": number or null,
  "life_stage": "childhood/youth/adulthood/later_life",
  "people_involved": ["names of people mentioned"],
  "place": "location if mentioned",
  "emotional_tone": "joy/nostalgia/love/sadness/pride/gratitude",
  "sensory_cues": {"taste": "", "smell": "", "sound": "", "sight": ""},
  "occasion": "type of occasion if any",
  "highlights": ["1-2 quotable lines from the story"]
}
[/MEMORY_EXTRACT]

IMPORTANT: Only extract a memory when you have:
1. The story itself
2. When it happened (age or time period)
3. At least one other detail (place, people, or sensory cue)

Otherwise, keep asking gentle questions to complete the picture."""

@api_router.post("/ai/interview", response_model=AIInterviewResponse)
async def ai_interview(data: AIInterviewMessage, user: dict = Depends(get_current_user)):
    """Conduct AI-assisted interview for memory capture"""
    session_id = data.session_id or str(uuid.uuid4())
    
    try:
        # Get conversation history
        history = await db.ai_sessions.find_one(
            {"session_id": session_id, "member_id": user["id"]},
            {"_id": 0}
        )
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=AI_SYSTEM_PROMPT
        ).with_model("gemini", "gemini-3-flash-preview")
        
        # Build conversation context
        if history and history.get("messages"):
            for msg in history["messages"][-10:]:  # Keep last 10 messages for context
                if msg["role"] == "user":
                    await chat.send_message(UserMessage(text=msg["content"]))
        
        # Send current message
        user_msg = UserMessage(text=data.message)
        response = await chat.send_message(user_msg)
        
        # Store conversation
        now = datetime.now(timezone.utc).isoformat()
        if not history:
            await db.ai_sessions.insert_one({
                "session_id": session_id,
                "member_id": user["id"],
                "vault_id": user["vault_id"],
                "messages": [
                    {"role": "user", "content": data.message, "timestamp": now},
                    {"role": "assistant", "content": response, "timestamp": now}
                ],
                "created_at": now
            })
        else:
            await db.ai_sessions.update_one(
                {"session_id": session_id},
                {"$push": {"messages": {
                    "$each": [
                        {"role": "user", "content": data.message, "timestamp": now},
                        {"role": "assistant", "content": response, "timestamp": now}
                    ]
                }}}
            )
        
        # Extract memory if present
        extracted_memory = None
        if "[MEMORY_EXTRACT]" in response:
            import json
            try:
                start = response.index("[MEMORY_EXTRACT]") + len("[MEMORY_EXTRACT]")
                end = response.index("[/MEMORY_EXTRACT]")
                memory_json = response[start:end].strip()
                extracted_memory = json.loads(memory_json)
                # Clean response for display
                response = response[:response.index("[MEMORY_EXTRACT]")].strip()
            except Exception as e:
                logger.error(f"Error extracting memory: {e}")
        
        return AIInterviewResponse(
            response=response,
            session_id=session_id,
            extracted_memory=extracted_memory,
            suggested_followup=None
        )
        
    except Exception as e:
        logger.error(f"AI Interview error: {e}")
        return AIInterviewResponse(
            response="I'm here to listen. Please take your time and share what's on your mind.",
            session_id=session_id,
            extracted_memory=None
        )

@api_router.get("/ai/sessions")
async def get_ai_sessions(user: dict = Depends(get_current_user)):
    """Get user's AI interview sessions"""
    sessions = await db.ai_sessions.find(
        {"member_id": user["id"]},
        {"_id": 0, "session_id": 1, "created_at": 1}
    ).sort("created_at", -1).to_list(50)
    return sessions

@api_router.get("/ai/sessions/{session_id}")
async def get_ai_session(session_id: str, user: dict = Depends(get_current_user)):
    """Get a specific AI session"""
    session = await db.ai_sessions.find_one(
        {"session_id": session_id, "member_id": user["id"]},
        {"_id": 0}
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

# ==================== STATS ENDPOINTS ====================

@api_router.get("/stats")
async def get_vault_stats(user: dict = Depends(get_current_user)):
    """Get vault statistics"""
    vault_id = user["vault_id"]
    
    members_count = await db.members.count_documents({"vault_id": vault_id})
    memories_count = await db.memories.count_documents({"vault_id": vault_id})
    relationships_count = await db.relationships.count_documents({"vault_id": vault_id})
    
    # Get memories by life stage
    pipeline = [
        {"$match": {"vault_id": vault_id}},
        {"$group": {"_id": "$life_stage", "count": {"$sum": 1}}}
    ]
    life_stages = await db.memories.aggregate(pipeline).to_list(10)
    
    return {
        "members_count": members_count,
        "memories_count": memories_count,
        "relationships_count": relationships_count,
        "memories_by_stage": {s["_id"]: s["count"] for s in life_stages if s["_id"]}
    }

# ==================== EXPORT ENDPOINTS ====================

@api_router.get("/export/life-book/{member_id}")
async def export_life_book(member_id: str, user: dict = Depends(get_current_user)):
    """Export a member's life story as structured data for PDF generation"""
    member = await db.members.find_one(
        {"id": member_id, "vault_id": user["vault_id"]},
        {"_id": 0, "password_hash": 0}
    )
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    # Get all family-visible memories for this member
    query = {
        "vault_id": user["vault_id"],
        "author_id": member_id,
        "$or": [
            {"privacy_level": "family"},
            {"privacy_level": "private", "author_id": user["id"]}
        ]
    }
    memories = await db.memories.find(query, {"_id": 0}).sort("created_at", 1).to_list(500)
    
    # Organize by life stage
    life_book = {
        "member": member,
        "chapters": {
            "childhood": [],
            "youth": [],
            "adulthood": [],
            "later_life": [],
            "other": []
        },
        "generated_at": datetime.now(timezone.utc).isoformat()
    }
    
    for memory in memories:
        stage = memory.get("life_stage", "other") or "other"
        if stage in life_book["chapters"]:
            life_book["chapters"][stage].append(memory)
        else:
            life_book["chapters"]["other"].append(memory)
    
    return life_book

@api_router.get("/export/theme-book")
async def export_theme_book(
    theme: str,  # food, love, travel, lessons, family
    user: dict = Depends(get_current_user)
):
    """Export memories by theme"""
    vault_id = user["vault_id"]
    
    # Theme-based keyword matching
    theme_keywords = {
        "food": ["taste", "cook", "eat", "meal", "recipe", "kitchen", "dinner", "lunch", "breakfast"],
        "love": ["love", "wedding", "marriage", "romance", "heart", "first met"],
        "travel": ["travel", "trip", "journey", "visit", "vacation", "holiday"],
        "lessons": ["learn", "lesson", "taught", "wisdom", "advice", "experience"],
        "family": ["family", "father", "mother", "brother", "sister", "child", "grandparent"]
    }
    
    keywords = theme_keywords.get(theme, [])
    if not keywords:
        raise HTTPException(status_code=400, detail="Invalid theme")
    
    # Search memories containing theme keywords
    regex_pattern = "|".join(keywords)
    memories = await db.memories.find({
        "vault_id": vault_id,
        "narrative": {"$regex": regex_pattern, "$options": "i"},
        "$or": [
            {"privacy_level": "family"},
            {"privacy_level": "private", "author_id": user["id"]}
        ]
    }, {"_id": 0}).to_list(200)
    
    # Get authors info
    author_ids = list(set(m["author_id"] for m in memories))
    authors = await db.members.find(
        {"id": {"$in": author_ids}},
        {"_id": 0, "id": 1, "name": 1, "photo_url": 1}
    ).to_list(100)
    authors_map = {a["id"]: a for a in authors}
    
    return {
        "theme": theme,
        "title": f"Stories of {theme.title()}",
        "memories": memories,
        "authors": authors_map,
        "generated_at": datetime.now(timezone.utc).isoformat()
    }

# ==================== AUDIO RECORDING ENDPOINTS ====================

@api_router.post("/audio/upload")
async def upload_audio(
    file: UploadFile = File(...),
    memory_id: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    user: dict = Depends(get_current_user)
):
    """Upload an audio recording"""
    if not file.content_type.startswith('audio/'):
        raise HTTPException(status_code=400, detail="File must be an audio file")
    
    # Generate unique filename
    file_ext = file.filename.split('.')[-1] if '.' in file.filename else 'webm'
    audio_id = str(uuid.uuid4())
    filename = f"{audio_id}.{file_ext}"
    file_path = AUDIO_DIR / filename
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        logger.error(f"Failed to save audio file: {e}")
        raise HTTPException(status_code=500, detail="Failed to save audio file")
    
    # Store metadata in database
    now = datetime.now(timezone.utc).isoformat()
    audio_record = {
        "id": audio_id,
        "vault_id": user["vault_id"],
        "member_id": user["id"],
        "memory_id": memory_id,
        "title": title or f"Recording {now[:10]}",
        "filename": filename,
        "file_path": str(file_path),
        "content_type": file.content_type,
        "size_bytes": file_path.stat().st_size,
        "created_at": now
    }
    
    await db.audio_recordings.insert_one(audio_record)
    
    # If associated with a memory, update the memory
    if memory_id:
        await db.memories.update_one(
            {"id": memory_id, "vault_id": user["vault_id"]},
            {"$set": {"audio_url": f"/api/audio/{audio_id}", "has_audio": True}}
        )
    
    return {
        "id": audio_id,
        "url": f"/api/audio/{audio_id}",
        "message": "Audio uploaded successfully"
    }

@api_router.get("/audio/{audio_id}")
async def get_audio(audio_id: str):
    """Stream an audio recording"""
    record = await db.audio_recordings.find_one({"id": audio_id}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="Audio not found")
    
    file_path = Path(record["file_path"])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    return FileResponse(
        file_path,
        media_type=record.get("content_type", "audio/webm"),
        filename=record.get("filename", f"{audio_id}.webm")
    )

@api_router.get("/audio")
async def list_audio(user: dict = Depends(get_current_user)):
    """List all audio recordings for the vault"""
    recordings = await db.audio_recordings.find(
        {"vault_id": user["vault_id"]},
        {"_id": 0, "file_path": 0}
    ).sort("created_at", -1).to_list(100)
    return recordings

@api_router.delete("/audio/{audio_id}")
async def delete_audio(audio_id: str, user: dict = Depends(get_current_user)):
    """Delete an audio recording"""
    record = await db.audio_recordings.find_one({
        "id": audio_id,
        "vault_id": user["vault_id"]
    })
    if not record:
        raise HTTPException(status_code=404, detail="Audio not found")
    
    # Delete file
    try:
        file_path = Path(record["file_path"])
        if file_path.exists():
            file_path.unlink()
    except Exception as e:
        logger.warning(f"Failed to delete audio file: {e}")
    
    # Delete database record
    await db.audio_recordings.delete_one({"id": audio_id})
    
    # Remove from memory if associated
    if record.get("memory_id"):
        await db.memories.update_one(
            {"id": record["memory_id"]},
            {"$unset": {"audio_url": "", "has_audio": ""}}
        )
    
    return {"message": "Audio deleted"}

# ==================== HEALTH CHECK ====================

@api_router.get("/")
async def root():
    return {"message": "Heirloom API - Family Memory Preservation Platform"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
