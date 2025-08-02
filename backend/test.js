// Simple test to verify the system is working
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

// Test login
const testLogin = async () => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username: 'sharathchandra',
      password: 'Sharath$123'
    });
    
    console.log('✅ Login successful:', response.data.message);
    return response.data.token;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.error || error.message);
    return null;
  }
};

// Test students endpoint
const testStudents = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/students`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Students endpoint working: ${response.data.length} students found`);
    return true;
  } catch (error) {
    console.error('❌ Students endpoint failed:', error.response?.data?.error || error.message);
    return false;
  }
};

// Run tests
const runTests = async () => {
  console.log('🧪 Testing NCC Management System...\n');
  
  const token = await testLogin();
  if (token) {
    await testStudents(token);
  }
  
  console.log('\n🏁 Test completed');
};

runTests();
