import requests
import sys
import json
from datetime import datetime

class HeirloomFeatureTester:
    def __init__(self, base_url="https://heirloomhub.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.session_id = None
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

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if success and response.content:
                try:
                    response_data = response.json()
                    details += f" | Response keys: {list(response_data.keys())}"
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

    def test_login_with_test_credentials(self):
        """Test login with provided test credentials"""
        login_data = {
            "family_name": "testelder",
            "family_code": "elder2024", 
            "email": "rose@elder.com",
            "password": "rosesecret"
        }
        
        success, response = self.run_test("Login with Test Credentials", "POST", "vaults/login", 200, login_data)
        
        if success and response:
            self.token = response.get('token')
            return True
        return False

    def test_ai_interview_age_detection(self):
        """Test AI interview asks about age when sharing memories"""
        if not self.token:
            self.log_test("AI Age Detection", False, "No authentication token")
            return False
            
        # First message - share a memory
        interview_data = {
            "message": "I remember when I got my first bicycle. It was red and shiny, and I was so excited to ride it around the neighborhood.",
            "session_id": None,
            "language": "en-US"
        }
        
        success, response = self.run_test("AI Interview - Memory Sharing", "POST", "ai/interview", 200, interview_data)
        
        if success and response:
            ai_response = response.get('response', '').lower()
            self.session_id = response.get('session_id')
            
            # Check if AI asks about age/time
            age_keywords = ['old were you', 'age', 'when did this happen', 'what year', 'childhood', 'time period']
            asks_about_age = any(keyword in ai_response for keyword in age_keywords)
            
            if asks_about_age:
                self.log_test("AI Asks About Age/Time", True, f"AI response contains age inquiry: {ai_response[:100]}...")
                return True
            else:
                self.log_test("AI Asks About Age/Time", False, f"AI response doesn't ask about age: {ai_response[:100]}...")
                return False
        
        return False

    def test_ai_session_continuation(self):
        """Test that AI sessions can be saved and continued"""
        if not self.token or not self.session_id:
            self.log_test("AI Session Continuation", False, "No token or session ID")
            return False
            
        # Continue the conversation
        interview_data = {
            "message": "I was about 8 years old when I got that bicycle.",
            "session_id": self.session_id,
            "language": "en-US"
        }
        
        success, response = self.run_test("AI Interview - Continue Session", "POST", "ai/interview", 200, interview_data)
        
        if success:
            # Check if we can retrieve the session
            success2, session_data = self.run_test("Get AI Session", "GET", f"ai/sessions/{self.session_id}", 200)
            
            if success2 and session_data:
                messages = session_data.get('messages', [])
                if len(messages) >= 2:  # Should have at least user + AI response
                    self.log_test("Session Saved and Retrievable", True, f"Session has {len(messages)} messages")
                    return True
                else:
                    self.log_test("Session Saved and Retrievable", False, f"Session only has {len(messages)} messages")
            
        return False

    def test_get_saved_sessions(self):
        """Test getting list of saved AI sessions"""
        if not self.token:
            self.log_test("Get Saved Sessions", False, "No authentication token")
            return False
            
        return self.run_test("Get Saved Sessions List", "GET", "ai/sessions", 200)

    def test_memory_extraction(self):
        """Test that AI can extract and structure memories"""
        if not self.token:
            self.log_test("Memory Extraction", False, "No authentication token")
            return False
            
        # Share a detailed memory that should trigger extraction
        interview_data = {
            "message": "When I was 10 years old, my grandmother taught me how to make her famous apple pie in her kitchen. I can still smell the cinnamon and see her gentle hands showing me how to roll the dough. It was a sunny afternoon in 1965, and my little brother was watching from the doorway.",
            "session_id": None,
            "language": "en-US"
        }
        
        success, response = self.run_test("AI Memory Extraction", "POST", "ai/interview", 200, interview_data)
        
        if success and response:
            extracted_memory = response.get('extracted_memory')
            if extracted_memory:
                required_fields = ['title', 'narrative', 'life_stage', 'approximate_age']
                has_required = all(field in extracted_memory for field in required_fields)
                
                if has_required:
                    self.log_test("Memory Extracted with Required Fields", True, f"Extracted: {list(extracted_memory.keys())}")
                    return True
                else:
                    self.log_test("Memory Extracted with Required Fields", False, f"Missing fields in: {list(extracted_memory.keys())}")
            else:
                self.log_test("Memory Extraction Triggered", False, "No extracted_memory in response")
        
        return False

def main():
    print("🧪 Testing Heirloom Specific Features")
    print("=" * 50)
    
    tester = HeirloomFeatureTester()
    
    # Test sequence for specific features
    test_sequence = [
        ("Authentication", [
            tester.test_login_with_test_credentials,
        ]),
        ("AI Interview Features", [
            tester.test_ai_interview_age_detection,
            tester.test_ai_session_continuation,
            tester.test_get_saved_sessions,
            tester.test_memory_extraction,
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
    print("📊 FEATURE TEST SUMMARY")
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