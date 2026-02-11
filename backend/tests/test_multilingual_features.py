"""
Test suite for Heirloom Multilingual Features (iteration 6)
Tests: Translation API, Languages API, Invite System, Story Sharing, TTS Generation
"""

import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test data
TEST_FAMILY_NAME = f"testmultilang{int(datetime.now().timestamp())}"
TEST_FAMILY_CODE = "code123"
TEST_EMAIL = f"test_{uuid.uuid4().hex[:8]}@example.com"
TEST_PASSWORD = "testpass123"

class TestAuthSetup:
    """Create test vault and get token for authenticated tests"""
    
    token = None
    vault_id = None
    member_id = None
    
    @pytest.fixture(autouse=True, scope="class")
    def setup_auth(self, request):
        """Create vault and authenticate once for all tests in class"""
        # Create vault
        response = requests.post(f"{BASE_URL}/api/vaults/create", json={
            "family_name": TEST_FAMILY_NAME,
            "family_code": TEST_FAMILY_CODE,
            "created_by_name": "Test User",
            "created_by_email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if response.status_code == 200:
            data = response.json()
            TestAuthSetup.token = data.get("token")
            TestAuthSetup.vault_id = data.get("vault_id")
            TestAuthSetup.member_id = data.get("member_id")
        
        yield
        
        # Cleanup handled by automatic test data expiry


class TestLanguagesAPI:
    """Test the Languages API endpoint for 15 Indian languages"""
    
    def test_languages_endpoint_returns_all_indian_languages(self):
        """GET /api/tts/languages should return 15 Indian languages with native scripts"""
        response = requests.get(f"{BASE_URL}/api/tts/languages")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "languages" in data, "Response should have 'languages' key"
        assert "indian_languages" in data, "Response should have 'indian_languages' key"
        
        # Verify 15 languages (14 Indian + English)
        assert len(data["languages"]) == 15, f"Expected 15 languages, got {len(data['languages'])}"
        
        # Verify 14 Indian languages
        assert len(data["indian_languages"]) == 14, f"Expected 14 Indian languages, got {len(data['indian_languages'])}"
        
    def test_languages_have_native_scripts(self):
        """Each language should have code, name, and native script"""
        response = requests.get(f"{BASE_URL}/api/tts/languages")
        data = response.json()
        
        # Check structure of each language
        for lang in data["languages"]:
            assert "code" in lang, f"Missing 'code' in language: {lang}"
            assert "name" in lang, f"Missing 'name' in language: {lang}"
            assert "native" in lang, f"Missing 'native' in language: {lang}"
    
    def test_specific_languages_present(self):
        """Verify specific required languages are present"""
        response = requests.get(f"{BASE_URL}/api/tts/languages")
        data = response.json()
        
        required_languages = ["hi", "ta", "te", "bn", "mr", "gu", "kn", "ml", "pa", "or", "as", "kok", "ne", "sd"]
        present_codes = [lang["code"] for lang in data["indian_languages"]]
        
        for code in required_languages:
            assert code in present_codes, f"Required language '{code}' not found"
    
    def test_hindi_has_correct_native_script(self):
        """Hindi should have हिंदी as native script"""
        response = requests.get(f"{BASE_URL}/api/tts/languages")
        data = response.json()
        
        hindi = next((l for l in data["languages"] if l["code"] == "hi"), None)
        assert hindi is not None, "Hindi not found"
        assert hindi["native"] == "हिंदी", f"Hindi native script incorrect: {hindi['native']}"
        
    def test_tamil_has_correct_native_script(self):
        """Tamil should have தமிழ் as native script"""
        response = requests.get(f"{BASE_URL}/api/tts/languages")
        data = response.json()
        
        tamil = next((l for l in data["languages"] if l["code"] == "ta"), None)
        assert tamil is not None, "Tamil not found"
        assert tamil["native"] == "தமிழ்", f"Tamil native script incorrect: {tamil['native']}"


class TestTranslationAPI:
    """Test the Translation API endpoint"""
    
    def test_translate_english_to_hindi(self):
        """POST /api/translate should translate English to Hindi"""
        response = requests.post(f"{BASE_URL}/api/translate", json={
            "text": "My grandmother told me stories",
            "source_language": "en",
            "target_language": "hi"
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "original" in data, "Response should have 'original' key"
        assert "translated" in data, "Response should have 'translated' key"
        assert data["original"] == "My grandmother told me stories"
        assert data["source_language"] == "en"
        assert data["target_language"] == "hi"
        # Translation should be non-empty Hindi text
        assert len(data["translated"]) > 0, "Translation should not be empty"
        
    def test_translate_hindi_to_english(self):
        """POST /api/translate should translate Hindi to English"""
        response = requests.post(f"{BASE_URL}/api/translate", json={
            "text": "मेरी दादी मुझे कहानियाँ सुनाती थीं",
            "source_language": "hi",
            "target_language": "en"
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "translated" in data
        # Should translate to English text
        assert any(word in data["translated"].lower() for word in ["grandmother", "grandma", "stories", "tell"]), \
            f"Translation doesn't seem correct: {data['translated']}"
    
    def test_translate_english_to_tamil(self):
        """POST /api/translate should translate English to Tamil"""
        response = requests.post(f"{BASE_URL}/api/translate", json={
            "text": "Hello friend",
            "source_language": "en",
            "target_language": "ta"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["translated"]) > 0
        
    def test_translate_preserves_source_and_target(self):
        """Translation should return source and target language codes"""
        response = requests.post(f"{BASE_URL}/api/translate", json={
            "text": "Thank you",
            "source_language": "en",
            "target_language": "te"
        })
        
        data = response.json()
        assert data["source_language"] == "en"
        assert data["target_language"] == "te"


class TestInviteSystemRegression:
    """Regression tests for Invite System after multilingual changes"""
    
    def test_create_invite_requires_auth(self):
        """Creating invite should require authentication"""
        response = requests.post(f"{BASE_URL}/api/invites/create", json={})
        assert response.status_code == 401, "Should require authentication"
    
    def test_create_invite_with_auth(self):
        """Authenticated user should be able to create invite"""
        if not TestAuthSetup.token:
            pytest.skip("Auth setup failed")
        
        headers = {"Authorization": f"Bearer {TestAuthSetup.token}"}
        response = requests.post(f"{BASE_URL}/api/invites/create", 
            json={"invited_name": "Test Invitee"},
            headers=headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "invite_code" in data, "Should return invite_code"
        assert "invite_token" in data, "Should return invite_token"
        assert len(data["invite_code"]) == 6, "Invite code should be 6 digits"
        
    def test_validate_invite_public_endpoint(self):
        """Validate invite endpoint should work without auth"""
        # First create an invite
        if not TestAuthSetup.token:
            pytest.skip("Auth setup failed")
        
        headers = {"Authorization": f"Bearer {TestAuthSetup.token}"}
        create_response = requests.post(f"{BASE_URL}/api/invites/create",
            json={"invited_name": "Validate Test"},
            headers=headers
        )
        
        if create_response.status_code == 200:
            invite_token = create_response.json()["invite_token"]
            
            # Validate without auth
            validate_response = requests.get(f"{BASE_URL}/api/invites/validate/{invite_token}")
            assert validate_response.status_code == 200
            data = validate_response.json()
            assert data["valid"] == True


class TestStoryShareRegression:
    """Regression tests for Story Sharing after multilingual changes"""
    
    memory_id = None
    share_token = None
    
    def test_create_memory_for_sharing(self):
        """Create a memory to test sharing"""
        if not TestAuthSetup.token:
            pytest.skip("Auth setup failed")
        
        headers = {"Authorization": f"Bearer {TestAuthSetup.token}"}
        response = requests.post(f"{BASE_URL}/api/memories", 
            json={
                "title": "TEST_Multilingual Memory",
                "narrative": "This is a test memory for sharing",
                "life_stage": "childhood"
            },
            headers=headers
        )
        
        assert response.status_code == 200
        TestStoryShareRegression.memory_id = response.json()["id"]
        
    def test_create_share_link(self):
        """Creating share link should work"""
        if not TestAuthSetup.token or not TestStoryShareRegression.memory_id:
            pytest.skip("Prerequisites not met")
        
        headers = {"Authorization": f"Bearer {TestAuthSetup.token}"}
        response = requests.post(
            f"{BASE_URL}/api/memories/{TestStoryShareRegression.memory_id}/share",
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "share_token" in data
        assert "share_link" in data
        TestStoryShareRegression.share_token = data["share_token"]
        
    def test_access_shared_story_public(self):
        """Shared story should be accessible without auth"""
        if not TestStoryShareRegression.share_token:
            pytest.skip("Share token not available")
        
        response = requests.get(f"{BASE_URL}/api/stories/shared/{TestStoryShareRegression.share_token}")
        assert response.status_code == 200
        
        data = response.json()
        assert "title" in data
        assert "narrative" in data
        # Should not expose vault_id
        assert "vault_id" not in data or data.get("vault_id") is None


class TestTTSRegression:
    """Regression tests for TTS generation"""
    
    def test_tts_voices_endpoint(self):
        """TTS voices endpoint should return Sage and family voices"""
        response = requests.get(f"{BASE_URL}/api/tts/voices")
        assert response.status_code == 200
        
        data = response.json()
        assert "voices" in data
        
        voice_ids = [v["id"] for v in data["voices"]]
        assert "sage" in voice_ids, "Sage voice should be available"
        
    def test_tts_generate_sage_voice(self):
        """TTS generation with Sage voice should work"""
        response = requests.post(f"{BASE_URL}/api/tts/generate", json={
            "text": "Hello dear, I am Sage.",
            "voice_type": "sage",
            "language": "en",
            "emotion": "warm"
        })
        
        assert response.status_code == 200, f"TTS generation failed: {response.text}"
        
        data = response.json()
        assert "audio_data" in data, "Should return audio data"
        assert data["voice_type"] == "sage"
        
    def test_tts_generate_hindi(self):
        """TTS should support Hindi language"""
        response = requests.post(f"{BASE_URL}/api/tts/generate", json={
            "text": "नमस्ते, मैं साज हूं।",
            "voice_type": "sage",
            "language": "hi"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "audio_data" in data


class TestHealthCheck:
    """Basic health check"""
    
    def test_health_endpoint(self):
        """Health endpoint should return healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "healthy"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
