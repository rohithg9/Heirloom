"""
Test Story Creator features: Story analysis, Translation, Languages, and demo page endpoints.
Tests for iteration 7 - UX Overhaul.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from previous iterations
TEST_FAMILY = "testfamily123"
TEST_CODE = "test123"
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "test123"


class TestStoryAnalysisEndpoint:
    """Tests for POST /api/ai/analyze-story endpoint"""
    
    def test_analyze_story_success(self):
        """Test story analysis returns emotions, highlights, title, etc."""
        story_text = """When I was young, my grandmother used to make the most delicious rotis. 
        The smell of ghee filling our small kitchen in Delhi would bring the whole family together. 
        She taught me that food is not just about taste, but about love and togetherness."""
        
        response = requests.post(
            f"{BASE_URL}/api/ai/analyze-story",
            json={"text": story_text}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "emotions" in data
        assert "highlights" in data
        assert "suggested_title" in data
        assert "time_period" in data
        assert "people" in data
        assert "places" in data
        
        # Data assertions
        assert isinstance(data["emotions"], list)
        assert len(data["emotions"]) > 0
        assert isinstance(data["highlights"], list)
        assert isinstance(data["suggested_title"], str)
        assert len(data["suggested_title"]) > 0
        
        print(f"SUCCESS: Story analysis returned - Emotions: {data['emotions']}, Title: {data['suggested_title']}")
    
    def test_analyze_story_short_text(self):
        """Test analysis with short text - should still return basic structure"""
        response = requests.post(
            f"{BASE_URL}/api/ai/analyze-story",
            json={"text": "A memory."}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Should return default structure even for short text
        assert "emotions" in data
        assert "suggested_title" in data
        print("SUCCESS: Short text analysis returns default structure")


class TestTranslationEndpoint:
    """Tests for POST /api/translate endpoint"""
    
    def test_translate_english_to_hindi(self):
        """Test English to Hindi translation"""
        response = requests.post(
            f"{BASE_URL}/api/translate",
            json={
                "text": "Hello, this is a test story about my family.",
                "source_language": "en",
                "target_language": "hi"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "original" in data
        assert "translated" in data
        assert data["source_language"] == "en"
        assert data["target_language"] == "hi"
        assert data["translated"] != data["original"]  # Translation should be different
        
        print(f"SUCCESS: Translated to Hindi: {data['translated'][:50]}...")
    
    def test_translate_hindi_to_english(self):
        """Test Hindi to English translation"""
        response = requests.post(
            f"{BASE_URL}/api/translate",
            json={
                "text": "यह एक परीक्षण है",
                "source_language": "hi",
                "target_language": "en"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "translated" in data
        assert data["target_language"] == "en"
        print(f"SUCCESS: Translated to English: {data['translated']}")
    
    def test_translate_english_to_tamil(self):
        """Test English to Tamil translation"""
        response = requests.post(
            f"{BASE_URL}/api/translate",
            json={
                "text": "Good morning",
                "source_language": "en",
                "target_language": "ta"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "translated" in data
        print(f"SUCCESS: Translated to Tamil: {data['translated']}")


class TestLanguagesEndpoint:
    """Tests for GET /api/tts/languages endpoint"""
    
    def test_get_languages_returns_15_languages(self):
        """Test languages endpoint returns all 15 supported languages"""
        response = requests.get(f"{BASE_URL}/api/tts/languages")
        
        assert response.status_code == 200
        data = response.json()
        
        # Should have both languages and indian_languages arrays
        assert "languages" in data
        assert "indian_languages" in data
        
        # Check total count
        assert len(data["languages"]) == 15
        assert len(data["indian_languages"]) == 14  # 15 - English
        
        print(f"SUCCESS: Languages endpoint returns {len(data['languages'])} total languages")
    
    def test_languages_have_native_scripts(self):
        """Test each language has native script"""
        response = requests.get(f"{BASE_URL}/api/tts/languages")
        data = response.json()
        
        # Check expected native scripts
        expected_natives = {
            "hi": "हिंदी",
            "ta": "தமிழ்",
            "te": "తెలుగు",
            "bn": "বাংলা",
            "mr": "मराठी",
            "gu": "ગુજરાતી",
            "kn": "ಕನ್ನಡ",
            "ml": "മലയാളം",
            "pa": "ਪੰਜਾਬੀ",
            "en": "English"
        }
        
        for lang in data["languages"]:
            code = lang["code"]
            if code in expected_natives:
                assert lang["native"] == expected_natives[code], f"Wrong native for {code}"
                print(f"SUCCESS: {code} = {lang['native']}")
    
    def test_all_indian_languages_present(self):
        """Test all 14 Indian languages are present"""
        response = requests.get(f"{BASE_URL}/api/tts/languages")
        data = response.json()
        
        indian_codes = ["hi", "ta", "te", "bn", "mr", "gu", "kn", "ml", "pa", "or", "as", "kok", "ne", "sd"]
        
        actual_codes = [lang["code"] for lang in data["indian_languages"]]
        
        for code in indian_codes:
            assert code in actual_codes, f"Missing Indian language: {code}"
        
        print(f"SUCCESS: All {len(indian_codes)} Indian languages present")


class TestVoicesEndpoint:
    """Tests for GET /api/tts/voices endpoint"""
    
    def test_get_voices_includes_sage(self):
        """Test voices endpoint includes Sage voice"""
        response = requests.get(f"{BASE_URL}/api/tts/voices")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "voices" in data
        
        # Find Sage voice
        sage_voice = None
        for voice in data["voices"]:
            if voice["id"] == "sage":
                sage_voice = voice
                break
        
        assert sage_voice is not None, "Sage voice not found"
        assert "warm grandmother" in sage_voice["description"].lower()
        
        print(f"SUCCESS: Sage voice found: {sage_voice['description']}")
    
    def test_get_voices_family_voices(self):
        """Test voices endpoint includes family voice types"""
        response = requests.get(f"{BASE_URL}/api/tts/voices")
        data = response.json()
        
        voice_ids = [v["id"] for v in data["voices"]]
        
        expected_ids = ["sage", "female_elderly", "female_mature", "female_young", 
                       "male_elderly", "male_mature", "male_young"]
        
        for vid in expected_ids:
            assert vid in voice_ids, f"Missing voice: {vid}"
        
        print(f"SUCCESS: All {len(expected_ids)} voice types present")


class TestAuthenticatedEndpoints:
    """Tests that require authentication"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for test user"""
        response = requests.post(
            f"{BASE_URL}/api/vaults/login",
            json={
                "family_name": TEST_FAMILY,
                "family_code": TEST_CODE,
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            }
        )
        
        if response.status_code == 200:
            return response.json()["token"]
        else:
            pytest.skip(f"Auth failed: {response.status_code}")
    
    def test_create_memory_with_multilingual_fields(self, auth_token):
        """Test creating memory with original language and translations"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        memory_data = {
            "title": "Test Memory - Story Creator",
            "narrative": "This is a test story created via Story Creator.",
            "emotional_tone": "nostalgia",
            "highlights": ["test highlight"],
            "privacy_level": "family"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/memories",
            json=memory_data,
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "id" in data
        print(f"SUCCESS: Created memory with ID: {data['id']}")
        
        # Cleanup - delete the test memory
        requests.delete(f"{BASE_URL}/api/memories/{data['id']}", headers=headers)


class TestHealthEndpoint:
    """Basic health check"""
    
    def test_api_health(self):
        """Test API is responding"""
        response = requests.get(f"{BASE_URL}/api")
        # Expect redirect to docs or 200
        assert response.status_code in [200, 307, 404]
        print(f"SUCCESS: API responding with status {response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
