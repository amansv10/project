#!/bin/bash

echo "=== Testing Course Enrollment & Feedback API ==="
echo ""

# Test 1: Create a course
echo "1. Creating a course..."
curl -X POST -H "Content-Type: application/json" -d '{
  "title": "Web Development",
  "code": "WD101",
  "description": "Learn HTML, CSS, and JavaScript"
}' http://localhost:3001/courses
echo ""; echo ""

# Test 2: Get all courses
echo "2. Getting all courses..."
curl http://localhost:3001/courses
echo ""; echo ""

# Test 3: Create a student
echo "3. Creating a student..."
curl -X POST -H "Content-Type: application/json" -d '{
  "name": "John Doe",
  "email": "john@example.com"
}' http://localhost:3001/students
echo ""; echo ""

# Test 4: Enroll student in course
echo "4. Enrolling student in course..."
curl -X POST -H "Content-Type: application/json" -d '{
  "courseCode": "WD101"
}' http://localhost:3001/students/john@example.com/enroll
echo ""; echo ""

# Test 5: Submit feedback
echo "5. Submitting feedback..."
curl -X POST -H "Content-Type: application/json" -d '{
  "studentEmail": "john@example.com",
  "courseCode": "WD101",
  "feedback": "This course was amazing! Learned so much about web development."
}' http://localhost:3001/feedback
echo ""; echo ""

# Test 6: Get feedback for course
echo "6. Getting feedback for WD101..."
curl http://localhost:3001/feedback/WD101
echo ""; echo ""

# Test 7: Get student's enrolled courses
echo "7. Getting John's enrolled courses..."
curl http://localhost:3001/students/john@example.com/courses
echo ""; echo ""

echo "=== API Testing Complete ==="