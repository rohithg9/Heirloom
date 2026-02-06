import requests
import sys
import json
from datetime import datetime

class HeirloomAPITester:
    def __init__(self, base_url="https://heirloomhub.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.vault_id = None
        self.member_id = None
        self.family_name = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if success and response.content:
                try:
                    response_data = response.json()
                    details += f" | Response: {json.dumps(response_data, indent=2)[:200]}..."
                    self.log_test(name, True, details)
                    return True, response_data
                except:
                    self.log_test(name, True, details)
                    return True, {}
            elif not success:
                try:
                    error_data = response.json()
                    details += f" | Error: {error_data}"
                except:
                    details += f" | Error: {response.text[:200]}"
                self.log_test(name, False, details)
                return False, {}
            else:
                self.log_test(name, True, details)
                return True, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        return self.run_test("Health Check", "GET", "health", 200)

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root Endpoint", "GET", "", 200)

    def test_create_vault(self):
        """Test vault creation"""
        timestamp = datetime.now().strftime('%H%M%S')
        self.family_name = f"TestFamily{timestamp}"
        
        vault_data = {
            "family_name": self.family_name,
            "family_code": "TestCode123!",
            "created_by_name": "Test Admin",
            "created_by_email": f"admin{timestamp}@test.com",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test("Create Vault", "POST", "vaults/create", 200, vault_data)
        
        if success and response:
            self.token = response.get('token')
            self.vault_id = response.get('vault_id')
            self.member_id = response.get('member_id')
            return True
        return False

    def test_join_vault(self):
        """Test joining existing vault"""
        if not self.family_name:
            self.log_test("Join Vault", False, "No family name available")
            return False
            
        timestamp = datetime.now().strftime('%H%M%S')
        join_data = {
            "family_name": self.family_name,
            "family_code": "TestCode123!",
            "member_name": "Test Member",
            "member_email": f"member{timestamp}@test.com",
            "password": "MemberPass123!"
        }
        
        success, response = self.run_test("Join Vault", "POST", "vaults/join", 200, join_data)
        return success

    def test_login_vault(self):
        """Test vault login"""
        if not self.family_name:
            self.log_test("Login Vault", False, "No family name available")
            return False
            
        timestamp = datetime.now().strftime('%H%M%S')
        login_data = {
            "family_name": self.family_name,
            "family_code": "TestCode123!",
            "email": f"admin{timestamp}@test.com",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test("Login Vault", "POST", "vaults/login", 200, login_data)
        
        if success and response:
            self.token = response.get('token')
            return True
        return False

    def test_get_members(self):
        """Test getting vault members"""
        if not self.token:
            self.log_test("Get Members", False, "No authentication token")
            return False
            
        return self.run_test("Get Members", "GET", "members", 200)

    def test_get_current_member(self):
        """Test getting current member info"""
        if not self.token:
            self.log_test("Get Current Member", False, "No authentication token")
            return False
            
        return self.run_test("Get Current Member", "GET", "members/me", 200)

    def test_create_memory(self):
        """Test creating a memory"""
        if not self.token:
            self.log_test("Create Memory", False, "No authentication token")
            return False
            
        memory_data = {
            "title": "Test Memory",
            "narrative": "This is a test memory about childhood adventures in the backyard.",
            "time_period": "1990s",
            "life_stage": "childhood",
            "people_involved": ["Test Person"],
            "place": "Backyard",
            "emotional_tone": "joy",
            "emotional_intensity": 0.8,
            "sensory_cues": {"sight": "green grass", "sound": "birds chirping"},
            "occasion": "summer day",
            "highlights": ["Playing in the sun"],
            "privacy_level": "family",
            "confidence": "clear"
        }
        
        success, response = self.run_test("Create Memory", "POST", "memories", 200, memory_data)
        
        if success and response:
            self.memory_id = response.get('id')
            return True
        return False

    def test_get_memories(self):
        """Test getting memories"""
        if not self.token:
            self.log_test("Get Memories", False, "No authentication token")
            return False
            
        return self.run_test("Get Memories", "GET", "memories", 200)

    def test_ai_interview(self):
        """Test AI interview endpoint"""
        if not self.token:
            self.log_test("AI Interview", False, "No authentication token")
            return False
            
        interview_data = {
            "message": "Hello, I'd like to share a memory about my childhood.",
            "session_id": None
        }
        
        # AI responses might take longer, so we'll accept both 200 and potential timeout
        success, response = self.run_test("AI Interview", "POST", "ai/interview", 200, interview_data)
        return success

    def test_get_stats(self):
        """Test getting vault statistics"""
        if not self.token:
            self.log_test("Get Stats", False, "No authentication token")
            return False
            
        return self.run_test("Get Stats", "GET", "stats", 200)

    def test_get_relationships(self):
        """Test getting relationships"""
        if not self.token:
            self.log_test("Get Relationships", False, "No authentication token")
            return False
            
        return self.run_test("Get Relationships", "GET", "relationships", 200)

    def test_export_life_book(self):
        """Test life book export"""
        if not self.token or not self.member_id:
            self.log_test("Export Life Book", False, "No authentication token or member ID")
            return False
            
        return self.run_test("Export Life Book", "GET", f"export/life-book/{self.member_id}", 200)

    def test_export_theme_book(self):
        """Test theme book export"""
        if not self.token:
            self.log_test("Export Theme Book", False, "No authentication token")
            return False
            
        return self.run_test("Export Theme Book", "GET", "export/theme-book?theme=family", 200)

def main():
    print("🧪 Starting Heirloom API Tests")
    print("=" * 50)
    
    tester = HeirloomAPITester()
    
    # Test sequence
    test_sequence = [
        ("Health & Basic", [
            tester.test_health_check,
            tester.test_root_endpoint,
        ]),
        ("Authentication Flow", [
            tester.test_create_vault,
            tester.test_join_vault,
            tester.test_login_vault,
        ]),
        ("Member Management", [
            tester.test_get_members,
            tester.test_get_current_member,
        ]),
        ("Memory Management", [
            tester.test_create_memory,
            tester.test_get_memories,
        ]),
        ("AI & Advanced Features", [
            tester.test_ai_interview,
            tester.test_get_stats,
            tester.test_get_relationships,
        ]),
        ("Export Features", [
            tester.test_export_life_book,
            tester.test_export_theme_book,
        ])
    ]
    
    for category, tests in test_sequence:
        print(f"\n📋 {category}")
        print("-" * 30)
        
        for test_func in tests:
            try:
                test_func()
            except Exception as e:
                tester.log_test(test_func.__name__, False, f"Unexpected error: {str(e)}")
    
    # Print summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    print(f"Total Tests: {tester.tests_run}")
    print(f"Passed: {tester.tests_passed}")
    print(f"Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    # Print failed tests
    failed_tests = [r for r in tester.test_results if not r['success']]
    if failed_tests:
        print(f"\n❌ Failed Tests ({len(failed_tests)}):")
        for test in failed_tests:
            print(f"  - {test['test']}: {test['details']}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())