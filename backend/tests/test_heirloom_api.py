"""
Heirloom API Tests - Family Memory Preservation Platform
Testing vault creation, authentication, and TTS endpoints
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://family-stories-10.preview.emergentagent.com').rstrip('/')

# Test credentials
TEST_FAMILY_NAME = f"testfamily_{int(time.time())}"
TEST_FAMILY_CODE = "testcode123"
TEST_USER_NAME = "Test User"
TEST_EMAIL = f"test_{int(time.time())}@example.com"
TEST_PASSWORD = "password123"


class TestHealthCheck:
    """Health check tests - run first"""
    
    def test_health_endpoint(self):
        """Test health check returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        print(f"✓ Health check passed: {data}")
    
    def test_root_endpoint(self):
        """Test root API endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "Heirloom" in data.get("message", "")
        print(f"✓ Root endpoint passed: {data}")


class TestVaultCreation:
    """Test family vault creation flow"""
    
    @pytest.fixture(scope="class")
    def created_vault(self):
        """Create a test vault and return auth data"""
        response = requests.post(f"{BASE_URL}/api/vaults/create", json={
            "family_name": TEST_FAMILY_NAME,
            "family_code": TEST_FAMILY_CODE,
            "created_by_name": TEST_USER_NAME,
            "created_by_email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Vault created: {data.get('family_name')}")
            return data
        elif response.status_code == 400:
            # Vault already exists - try login instead
            login_response = requests.post(f"{BASE_URL}/api/vaults/login", json={
                "family_name": TEST_FAMILY_NAME,
                "family_code": TEST_FAMILY_CODE,
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            })
            if login_response.status_code == 200:
                return login_response.json()
        pytest.skip("Could not create or login to vault")
        return None
    
    def test_vault_creation(self, created_vault):
        """Test vault creation returns expected fields"""
        assert created_vault is not None
        assert "token" in created_vault
        assert "vault_id" in created_vault
        assert "member_id" in created_vault
        assert "family_name" in created_vault
        assert "role" in created_vault
        print(f"✓ Vault creation verified with role: {created_vault['role']}")
    
    def test_duplicate_vault_fails(self):
        """Test that creating duplicate vault fails"""
        # First create a vault
        unique_name = f"duplicate_test_{int(time.time())}"
        response1 = requests.post(f"{BASE_URL}/api/vaults/create", json={
            "family_name": unique_name,
            "family_code": TEST_FAMILY_CODE,
            "created_by_name": TEST_USER_NAME,
            "created_by_email": f"unique1_{int(time.time())}@example.com",
            "password": TEST_PASSWORD
        })
        assert response1.status_code == 200
        
        # Try to create same vault again
        response2 = requests.post(f"{BASE_URL}/api/vaults/create", json={
            "family_name": unique_name,
            "family_code": TEST_FAMILY_CODE,
            "created_by_name": "Another User",
            "created_by_email": f"unique2_{int(time.time())}@example.com",
            "password": TEST_PASSWORD
        })
        assert response2.status_code == 400
        print("✓ Duplicate vault creation correctly rejected")


class TestAuthentication:
    """Test authentication flows"""
    
    @pytest.fixture(scope="class")
    def test_vault_data(self):
        """Create a test vault for auth tests"""
        unique_name = f"authtest_{int(time.time())}"
        unique_email = f"authtest_{int(time.time())}@example.com"
        
        response = requests.post(f"{BASE_URL}/api/vaults/create", json={
            "family_name": unique_name,
            "family_code": TEST_FAMILY_CODE,
            "created_by_name": TEST_USER_NAME,
            "created_by_email": unique_email,
            "password": TEST_PASSWORD
        })
        
        if response.status_code == 200:
            return {
                "family_name": unique_name,
                "email": unique_email,
                "data": response.json()
            }
        pytest.skip("Could not create test vault")
        return None
    
    def test_login_success(self, test_vault_data):
        """Test successful login"""
        response = requests.post(f"{BASE_URL}/api/vaults/login", json={
            "family_name": test_vault_data["family_name"],
            "family_code": TEST_FAMILY_CODE,
            "email": test_vault_data["email"],
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["member_name"] == TEST_USER_NAME
        print(f"✓ Login successful for: {data['member_name']}")
    
    def test_login_wrong_password(self, test_vault_data):
        """Test login with wrong password fails"""
        response = requests.post(f"{BASE_URL}/api/vaults/login", json={
            "family_name": test_vault_data["family_name"],
            "family_code": TEST_FAMILY_CODE,
            "email": test_vault_data["email"],
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Wrong password correctly rejected")
    
    def test_login_wrong_family_code(self, test_vault_data):
        """Test login with wrong family code fails"""
        response = requests.post(f"{BASE_URL}/api/vaults/login", json={
            "family_name": test_vault_data["family_name"],
            "family_code": "wrongcode",
            "email": test_vault_data["email"],
            "password": TEST_PASSWORD
        })
        assert response.status_code == 401
        print("✓ Wrong family code correctly rejected")
    
    def test_login_nonexistent_vault(self):
        """Test login to nonexistent vault fails"""
        response = requests.post(f"{BASE_URL}/api/vaults/login", json={
            "family_name": "nonexistent_family_xyz123",
            "family_code": TEST_FAMILY_CODE,
            "email": "test@example.com",
            "password": TEST_PASSWORD
        })
        assert response.status_code == 404
        print("✓ Nonexistent vault correctly returns 404")


class TestJoinVault:
    """Test vault joining flow"""
    
    @pytest.fixture(scope="class")
    def shared_vault(self):
        """Create a vault that can be joined"""
        unique_name = f"jointest_{int(time.time())}"
        unique_email = f"creator_{int(time.time())}@example.com"
        
        response = requests.post(f"{BASE_URL}/api/vaults/create", json={
            "family_name": unique_name,
            "family_code": TEST_FAMILY_CODE,
            "created_by_name": "Vault Creator",
            "created_by_email": unique_email,
            "password": TEST_PASSWORD
        })
        
        if response.status_code == 200:
            return {
                "family_name": unique_name,
                "creator_email": unique_email,
                "data": response.json()
            }
        pytest.skip("Could not create shared vault")
        return None
    
    def test_join_vault_success(self, shared_vault):
        """Test joining an existing vault"""
        joiner_email = f"joiner_{int(time.time())}@example.com"
        
        response = requests.post(f"{BASE_URL}/api/vaults/join", json={
            "family_name": shared_vault["family_name"],
            "family_code": TEST_FAMILY_CODE,
            "member_name": "New Member",
            "member_email": joiner_email,
            "password": "newpassword123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["role"] == "member"  # Not admin
        assert data["vault_id"] == shared_vault["data"]["vault_id"]
        print(f"✓ Successfully joined vault as: {data['role']}")
    
    def test_join_with_wrong_code(self, shared_vault):
        """Test joining with wrong family code fails"""
        response = requests.post(f"{BASE_URL}/api/vaults/join", json={
            "family_name": shared_vault["family_name"],
            "family_code": "wrongcode",
            "member_name": "Attacker",
            "member_email": f"attacker_{int(time.time())}@example.com",
            "password": "password123"
        })
        assert response.status_code == 401
        print("✓ Join with wrong code correctly rejected")


class TestTTSEndpoint:
    """Test ElevenLabs TTS integration"""
    
    def test_tts_generate_success(self):
        """Test TTS generation returns audio"""
        response = requests.post(f"{BASE_URL}/api/tts/generate", json={
            "text": "Hello, this is a test of voice generation.",
            "voice_type": "sage",
            "stability": 0.4,
            "similarity_boost": 0.8,
            "style": 0.6
        })
        
        if response.status_code == 503:
            pytest.skip("ElevenLabs not configured")
        
        assert response.status_code == 200
        data = response.json()
        assert "audio_data" in data
        assert "content_type" in data
        assert data["content_type"] == "audio/mpeg"
        assert len(data["audio_data"]) > 100  # Should have significant audio data
        print(f"✓ TTS generation successful, audio data length: {len(data['audio_data'])} chars")
    
    def test_tts_voices_list(self):
        """Test getting available voices"""
        response = requests.get(f"{BASE_URL}/api/tts/voices")
        assert response.status_code == 200
        data = response.json()
        assert "voices" in data
        assert len(data["voices"]) > 0
        voice_ids = [v["id"] for v in data["voices"]]
        assert "sage" in voice_ids
        print(f"✓ Available voices: {voice_ids}")
    
    def test_tts_different_voice_types(self):
        """Test different voice types"""
        voice_types = ["sage", "female_elderly", "female_mature", "male_elderly", "male_young"]
        
        for voice_type in voice_types:
            response = requests.post(f"{BASE_URL}/api/tts/generate", json={
                "text": "Testing voice.",
                "voice_type": voice_type
            })
            
            if response.status_code == 503:
                pytest.skip("ElevenLabs not configured")
            
            assert response.status_code == 200, f"Failed for voice type: {voice_type}"
            print(f"✓ Voice type '{voice_type}' works")


class TestProtectedEndpoints:
    """Test endpoints that require authentication"""
    
    @pytest.fixture(scope="class")
    def authenticated_session(self):
        """Create vault and get auth token"""
        unique_name = f"protectedtest_{int(time.time())}"
        unique_email = f"protected_{int(time.time())}@example.com"
        
        response = requests.post(f"{BASE_URL}/api/vaults/create", json={
            "family_name": unique_name,
            "family_code": TEST_FAMILY_CODE,
            "created_by_name": TEST_USER_NAME,
            "created_by_email": unique_email,
            "password": TEST_PASSWORD
        })
        
        if response.status_code == 200:
            data = response.json()
            return {
                "token": data["token"],
                "vault_id": data["vault_id"],
                "member_id": data["member_id"]
            }
        pytest.skip("Could not create auth session")
        return None
    
    def test_get_members_authenticated(self, authenticated_session):
        """Test getting members with authentication"""
        headers = {"Authorization": f"Bearer {authenticated_session['token']}"}
        response = requests.get(f"{BASE_URL}/api/members", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1  # At least the creator
        print(f"✓ Got {len(data)} members")
    
    def test_get_members_unauthenticated(self):
        """Test getting members without auth fails"""
        response = requests.get(f"{BASE_URL}/api/members")
        assert response.status_code == 401
        print("✓ Unauthenticated access correctly rejected")
    
    def test_get_vault_stats(self, authenticated_session):
        """Test getting vault stats"""
        headers = {"Authorization": f"Bearer {authenticated_session['token']}"}
        response = requests.get(f"{BASE_URL}/api/stats", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "members_count" in data
        assert "memories_count" in data
        print(f"✓ Vault stats: {data['members_count']} members, {data['memories_count']} memories")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
