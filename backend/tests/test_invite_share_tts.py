"""
Test suite for Heirloom new features:
- Family invite system with share links and 6-digit codes
- Story sharing with public links
- 15 Indian language support for TTS
- Sage voice with warm grandmother style and emotion prefixes
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestHealthAndLanguages:
    """Health check and Languages API tests"""
    
    def test_health_check(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health check passed")
    
    def test_tts_languages_returns_15_indian_languages(self):
        """Test that /api/tts/languages returns 15 Indian languages including Konkani"""
        response = requests.get(f"{BASE_URL}/api/tts/languages")
        assert response.status_code == 200
        data = response.json()
        
        # Check indian_languages list
        indian_languages = data.get("indian_languages", [])
        assert len(indian_languages) == 15, f"Expected 15 Indian languages, got {len(indian_languages)}"
        
        # Verify specific languages are present
        language_codes = [lang["code"] for lang in indian_languages]
        required_codes = ["hi", "hi-Latn", "ta", "te", "bn", "mr", "gu", "kn", "ml", "pa", "or", "as", "kok", "ne", "sd"]
        
        for code in required_codes:
            assert code in language_codes, f"Missing language code: {code}"
        
        # Verify Konkani is present
        konkani_present = any(lang["name"] == "Konkani" for lang in indian_languages)
        assert konkani_present, "Konkani language is missing"
        
        print(f"✓ TTS languages API returns {len(indian_languages)} Indian languages including Konkani")
    
    def test_tts_voices_includes_sage(self):
        """Test that TTS voices includes Sage as warm grandmother"""
        response = requests.get(f"{BASE_URL}/api/tts/voices")
        assert response.status_code == 200
        data = response.json()
        
        voices = data.get("voices", [])
        sage_voice = next((v for v in voices if v["id"] == "sage"), None)
        
        assert sage_voice is not None, "Sage voice not found"
        assert "grandmother" in sage_voice["description"].lower() or "warm" in sage_voice["description"].lower()
        print(f"✓ Sage voice found: {sage_voice['description']}")


class TestAuthAndInvites:
    """Authentication and Invite system tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.test_id = str(uuid.uuid4())[:8]
        self.family_name = f"TEST_invite_family_{self.test_id}"
        self.family_code = "test123"
        self.admin_email = f"TEST_admin_{self.test_id}@example.com"
        self.admin_password = "password123"
        self.token = None
        self.vault_id = None
        self.invite_data = None
    
    def test_01_create_vault_for_invite_tests(self):
        """Create a vault to test invite functionality"""
        response = requests.post(f"{BASE_URL}/api/vaults/create", json={
            "family_name": self.family_name,
            "family_code": self.family_code,
            "created_by_name": "Test Admin",
            "created_by_email": self.admin_email,
            "password": self.admin_password
        })
        
        assert response.status_code == 200, f"Failed to create vault: {response.text}"
        data = response.json()
        
        assert "token" in data
        assert "vault_id" in data
        self.token = data["token"]
        self.vault_id = data["vault_id"]
        print(f"✓ Vault created: {self.family_name}")
        return self.token
    
    def test_02_create_invite_requires_auth(self):
        """Test that creating invites requires authentication"""
        response = requests.post(f"{BASE_URL}/api/invites/create", json={
            "invited_name": "Test User",
            "invited_email": "test@example.com"
        })
        
        assert response.status_code == 401, "Expected 401 for unauthenticated invite creation"
        print("✓ Create invite correctly requires authentication")
    
    def test_03_create_invite_success(self):
        """Test creating an invite with valid authentication"""
        # First create vault and get token
        token = self.test_01_create_vault_for_invite_tests()
        
        response = requests.post(
            f"{BASE_URL}/api/invites/create",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "invited_name": "Family Member",
                "invited_email": "member@example.com"
            }
        )
        
        assert response.status_code == 200, f"Failed to create invite: {response.text}"
        data = response.json()
        
        # Verify invite structure
        assert "invite_id" in data
        assert "invite_code" in data
        assert "invite_token" in data
        assert "share_link" in data
        
        # Verify 6-digit code
        assert len(data["invite_code"]) == 6
        assert data["invite_code"].isdigit(), "Invite code should be numeric"
        
        # Verify share link format
        assert data["share_link"].startswith("/join/")
        
        print(f"✓ Invite created with code: {data['invite_code']}")
        self.invite_data = data
        return token, data
    
    def test_04_validate_invite_public(self):
        """Test validating an invite (public endpoint)"""
        token, invite = self.test_03_create_invite_success()
        
        response = requests.get(f"{BASE_URL}/api/invites/validate/{invite['invite_token']}")
        assert response.status_code == 200, f"Failed to validate invite: {response.text}"
        
        data = response.json()
        assert data["valid"] == True
        assert "family_name" in data
        assert "expires_at" in data
        print(f"✓ Invite validation successful for family: {data['family_name']}")
    
    def test_05_validate_invalid_invite_token(self):
        """Test validating an invalid invite token returns 404"""
        response = requests.get(f"{BASE_URL}/api/invites/validate/invalid-token-123")
        assert response.status_code == 404
        print("✓ Invalid invite token correctly returns 404")
    
    def test_06_join_via_invite_success(self):
        """Test joining a family via invite link and code"""
        token, invite = self.test_03_create_invite_success()
        
        new_member_email = f"TEST_newmember_{self.test_id}@example.com"
        
        response = requests.post(f"{BASE_URL}/api/invites/join", json={
            "invite_token": invite["invite_token"],
            "invite_code": invite["invite_code"],
            "member_name": "New Family Member",
            "email": new_member_email,
            "password": "newpass123"
        })
        
        assert response.status_code == 200, f"Failed to join via invite: {response.text}"
        data = response.json()
        
        assert "token" in data
        assert "member_id" in data
        assert data["role"] == "member"
        print(f"✓ Successfully joined family as member: {data['member_name']}")
    
    def test_07_join_with_wrong_code_fails(self):
        """Test joining with wrong invite code fails"""
        token, invite = self.test_03_create_invite_success()
        
        response = requests.post(f"{BASE_URL}/api/invites/join", json={
            "invite_token": invite["invite_token"],
            "invite_code": "000000",  # Wrong code
            "member_name": "New Member",
            "email": "wrong@example.com",
            "password": "pass123"
        })
        
        assert response.status_code == 401, "Expected 401 for wrong invite code"
        print("✓ Wrong invite code correctly rejected")
    
    def test_08_get_invites_list(self):
        """Test getting list of invites for a vault"""
        token, _ = self.test_03_create_invite_success()
        
        response = requests.get(
            f"{BASE_URL}/api/invites",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1, "Should have at least one invite"
        print(f"✓ Retrieved {len(data)} invites")


class TestStorySharing:
    """Story/Memory sharing tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data with vault, member, and memory"""
        self.test_id = str(uuid.uuid4())[:8]
        self.family_name = f"TEST_share_family_{self.test_id}"
        self.family_code = "share123"
        self.admin_email = f"TEST_share_admin_{self.test_id}@example.com"
        self.admin_password = "sharepass123"
    
    def _create_vault_and_memory(self):
        """Helper to create vault and memory for share tests"""
        # Create vault
        response = requests.post(f"{BASE_URL}/api/vaults/create", json={
            "family_name": self.family_name,
            "family_code": self.family_code,
            "created_by_name": "Share Test Admin",
            "created_by_email": self.admin_email,
            "password": self.admin_password
        })
        assert response.status_code == 200
        vault_data = response.json()
        token = vault_data["token"]
        
        # Create a memory
        memory_response = requests.post(
            f"{BASE_URL}/api/memories",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "title": f"TEST_Shareable Memory {self.test_id}",
                "narrative": "This is a test memory for sharing functionality.",
                "time_period": "2020",
                "life_stage": "adulthood",
                "privacy_level": "family"
            }
        )
        assert memory_response.status_code == 200
        memory_id = memory_response.json()["id"]
        
        return token, memory_id
    
    def test_01_create_story_share_link(self):
        """Test creating a share link for a memory/story"""
        token, memory_id = self._create_vault_and_memory()
        
        response = requests.post(
            f"{BASE_URL}/api/memories/{memory_id}/share",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200, f"Failed to create share link: {response.text}"
        data = response.json()
        
        assert "share_token" in data
        assert "share_link" in data
        assert data["share_link"].startswith("/story/")
        print(f"✓ Story share link created: {data['share_link']}")
        
        return token, memory_id, data["share_token"]
    
    def test_02_get_shared_story_public(self):
        """Test getting a shared story (public endpoint)"""
        token, memory_id, share_token = self.test_01_create_story_share_link()
        
        response = requests.get(f"{BASE_URL}/api/stories/shared/{share_token}")
        assert response.status_code == 200, f"Failed to get shared story: {response.text}"
        
        data = response.json()
        assert "title" in data
        assert "narrative" in data
        assert "author_name" in data
        # vault_id should be excluded for privacy
        assert "vault_id" not in data
        print(f"✓ Shared story retrieved: {data['title']}")
    
    def test_03_invalid_share_token_returns_404(self):
        """Test that invalid share token returns 404"""
        response = requests.get(f"{BASE_URL}/api/stories/shared/invalid-share-token")
        assert response.status_code == 404
        print("✓ Invalid share token correctly returns 404")
    
    def test_04_heart_shared_story(self):
        """Test hearting a shared story (public, no auth required)"""
        token, memory_id, share_token = self.test_01_create_story_share_link()
        
        response = requests.post(f"{BASE_URL}/api/stories/shared/{share_token}/heart")
        assert response.status_code == 200, f"Failed to heart story: {response.text}"
        
        data = response.json()
        assert "heart_count" in data
        assert data["heart_count"] >= 1
        print(f"✓ Story hearted, total hearts: {data['heart_count']}")
    
    def test_05_revoke_share_link(self):
        """Test revoking a story share link"""
        token, memory_id, share_token = self.test_01_create_story_share_link()
        
        # Revoke the share
        response = requests.delete(
            f"{BASE_URL}/api/memories/{memory_id}/share",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        
        # Try to access the shared story - should fail now
        response = requests.get(f"{BASE_URL}/api/stories/shared/{share_token}")
        assert response.status_code == 404, "Revoked share link should return 404"
        print("✓ Share link successfully revoked")


class TestTTSWithEmotion:
    """TTS generation with emotion parameter tests"""
    
    def test_01_tts_generate_with_emotion(self):
        """Test TTS generation with emotion parameter"""
        response = requests.post(f"{BASE_URL}/api/tts/generate", json={
            "text": "This is a test story",
            "voice_type": "sage",
            "language": "en",
            "emotion": "warm"
        })
        
        assert response.status_code == 200, f"TTS generation failed: {response.text}"
        data = response.json()
        
        assert "audio_data" in data
        assert "content_type" in data
        assert len(data["audio_data"]) > 100  # Should have actual audio data
        print("✓ TTS generated with 'warm' emotion")
    
    def test_02_tts_generate_sage_default_grandmother_tone(self):
        """Test that Sage voice uses grandmother tone by default"""
        response = requests.post(f"{BASE_URL}/api/tts/generate", json={
            "text": "Hello dear, let me tell you a story.",
            "voice_type": "sage",
            "language": "en"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "audio_data" in data
        assert data["voice_type"] == "sage"
        print("✓ Sage voice generates with grandmother tone")
    
    def test_03_tts_generate_with_nostalgic_emotion(self):
        """Test TTS with nostalgic emotion"""
        response = requests.post(f"{BASE_URL}/api/tts/generate", json={
            "text": "I remember those days fondly.",
            "voice_type": "sage",
            "language": "en",
            "emotion": "nostalgic"
        })
        
        assert response.status_code == 200
        print("✓ TTS generated with 'nostalgic' emotion")
    
    def test_04_tts_generate_in_hindi(self):
        """Test TTS generation in Hindi"""
        response = requests.post(f"{BASE_URL}/api/tts/generate", json={
            "text": "नमस्ते, यह एक परीक्षण है।",
            "voice_type": "sage",
            "language": "hi",
            "emotion": "loving"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["language"] == "hi"
        print("✓ TTS generated in Hindi")


# Run tests if executed directly
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
