# Course Enrollment & Feedback API

A complete Node.js, Express, and MongoDB backend system for managing courses, students, and feedback submissions.

## 🚀 Features

- **Course Management**: Full CRUD operations for courses with unique code validation
- **Student Management**: Student profiles with unique email validation
- **Course Enrollment**: Students can enroll in available courses
- **Feedback System**: Submit and manage course feedback with validation
- **Web Form**: Beautiful responsive form for feedback submission
- **RESTful API**: Complete REST API with proper status codes

## 📋 API Endpoints

### Courses
- `POST /courses` - Create a new course
- `GET /courses` - List all courses
- `GET /courses/:code` - Get course by code
- `PUT /courses/:code` - Update course details
- `DELETE /courses/:code` - Delete a course

### Students
- `POST /students` - Add a new student
- `GET /students` - List all students
- `POST /students/:email/enroll` - Enroll student in a course
- `GET /students/:email/courses` - Get student's enrolled courses

### Feedback
- `POST /feedback` - Submit feedback
- `GET /feedback/:courseCode` - View feedback for a course
- `PUT /feedback/:id` - Update feedback text
- `DELETE /feedback/:id` - Delete feedback

### Web Interface
- `GET /feedback/form` - Feedback submission form
- `GET /admin/test-data` - Create test data (for testing)

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd project