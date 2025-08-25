// test-endpoints.js 
const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testEndpoints() {
  try {
    // Generate unique identifiers
    const timestamp = Date.now();
    const courseCode = `TEST${timestamp}`; // e.g., TEST1724523452345
    const studentEmail = `student${timestamp}@example.com`;
    
    console.log('=== Testing API Endpoints ===\n');
    console.log(`Using unique data: ${courseCode}, ${studentEmail}\n`);
    
    // 1. Create course
    console.log('1. Creating course...');
    const courseResponse = await axios.post(`${API_BASE}/courses`, {
      title: "Web Development",
      code: courseCode,
      description: "Learn HTML, CSS, and JavaScript"
    });
    console.log('Course created:', courseResponse.data);
    
    // 2. Create student
    console.log('\n2. Creating student...');
    const studentResponse = await axios.post(`${API_BASE}/students`, {
      name: "Test Student",
      email: studentEmail
    });
    console.log('Student created:', studentResponse.data);
    
    // 3. Enroll student
    console.log('\n3. Enrolling student...');
    const enrollResponse = await axios.post(
      `${API_BASE}/students/${studentEmail}/enroll`,
      { courseCode: courseCode }
    );
    console.log('Enrollment result:', enrollResponse.data);
    
    // 4. Submit feedback
    console.log('\n4. Submitting feedback...');
    const feedbackResponse = await axios.post(`${API_BASE}/feedback`, {
      studentEmail: studentEmail,
      courseCode: courseCode,
      feedback: "Excellent course! Very comprehensive."
    });
    console.log('Feedback submitted:', feedbackResponse.data);
    
    // 5. Test other endpoints
    console.log('\n5. Testing GET endpoints...');
    const courses = await axios.get(`${API_BASE}/courses`);
    console.log('All courses count:', courses.data.length);
    
    console.log('\n=== All tests completed successfully! ===');
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

testEndpoints();