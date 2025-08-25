const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection 
mongoose.connect('mongodb://localhost:27017/courseFeedbackDB')
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('public'));

// GET /feedback/form - Serve feedback form from HTML file
app.get('/feedback/form', (req, res) => {
  res.sendFile(__dirname + '/public/form.html');
});
// ===== SCHEMA DEFINITIONS =====

// Course Schema
const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  }
});

// Student Schema
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  enrolledCourses: [{
    type: String // array of course codes
  }]
});

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
  studentEmail: {
    type: String,
    required: true
  },
  courseCode: {
    type: String,
    required: true
  },
  feedback: {
    type: String,
    required: true
  }
});

// Create Models
const Course = mongoose.model('Course', courseSchema);
const Student = mongoose.model('Student', studentSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);

// ===== ROUTE IMPLEMENTATIONS =====

// Courses Routes

// POST /courses - Add a new course
app.post('/courses', async (req, res) => {
  try {
    const { title, code, description } = req.body;
    
    // Check if course with same code already exists
    const existingCourse = await Course.findOne({ code });
    if (existingCourse) {
      return res.status(400).json({ error: 'Course code must be unique' });
    }
    
    const course = new Course({ title, code, description });
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /courses - List all courses
app.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /courses/:code - Get course by code
app.get('/courses/:code', async (req, res) => {
  try {
    const course = await Course.findOne({ code: req.params.code });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /courses/:code - Update course details
app.put('/courses/:code', async (req, res) => {
  try {
    const { title, description } = req.body;
    const course = await Course.findOneAndUpdate(
      { code: req.params.code },
      { title, description },
      { new: true, runValidators: true }
    );
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    res.json(course);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /courses/:code - Delete a course
app.delete('/courses/:code', async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({ code: req.params.code });
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Also delete all feedback for this course
    await Feedback.deleteMany({ courseCode: req.params.code });
    
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Students Routes

// POST /students - Add a new student
app.post('/students', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Check if student with same email already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ error: 'Student email must be unique' });
    }
    
    const student = new Student({ name, email, enrolledCourses: [] });
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /students - List all students
app.get('/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /students/:email/enroll - Enroll a student to a course
app.post('/students/:email/enroll', async (req, res) => {
  try {
    const { courseCode } = req.body;
    
    // Check if student exists
    const student = await Student.findOne({ email: req.params.email });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Check if course exists
    const course = await Course.findOne({ code: courseCode });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Check if student is already enrolled
    if (student.enrolledCourses.includes(courseCode)) {
      return res.status(400).json({ error: 'Student already enrolled in this course' });
    }
    
    // Enroll the student
    student.enrolledCourses.push(courseCode);
    await student.save();
    
    res.json({ message: 'Enrollment successful', student });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /students/:email/courses - List all enrolled courses for a student
app.get('/students/:email/courses', async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.params.email });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json({ enrolledCourses: student.enrolledCourses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Feedback Routes

// POST /feedback - Submit feedback
app.post('/feedback', async (req, res) => {
  try {
    const { studentEmail, courseCode, feedback } = req.body;
    
    // Check if student exists
    const student = await Student.findOne({ email: studentEmail });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Check if course exists
    const course = await Course.findOne({ code: courseCode });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Check if student is enrolled in the course
    if (!student.enrolledCourses.includes(courseCode)) {
      return res.status(400).json({ error: 'Student is not enrolled in this course' });
    }
    
    const feedbackEntry = new Feedback({ studentEmail, courseCode, feedback });
    await feedbackEntry.save();
    
    res.status(201).json(feedbackEntry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /feedback/:courseCode - View all feedback for a course
app.get('/feedback/:courseCode', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ courseCode: req.params.courseCode });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /feedback/:id - Update feedback text
app.put('/feedback/:id', async (req, res) => {
  try {
    const { feedback } = req.body;
    const feedbackEntry = await Feedback.findByIdAndUpdate(
      req.params.id,
      { feedback },
      { new: true, runValidators: true }
    );
    
    if (!feedbackEntry) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    res.json(feedbackEntry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /feedback/:id - Delete feedback
app.delete('/feedback/:id', async (req, res) => {
  try {
    const feedbackEntry = await Feedback.findByIdAndDelete(req.params.id);
    
    if (!feedbackEntry) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Course Enrollment & Feedback API is running!');
});

// Simple test route
app.get('/test', (req, res) => {
  res.send('Server is working!');
});
// ===== ADMIN ROUTES FOR TESTING =====

// GET /admin/test-data - Create test data automatically
app.get('/admin/test-data', async (req, res) => {
    try {
        // Clear existing test data first
        await Course.deleteOne({ code: "TEST101" });
        await Student.deleteOne({ email: "test@example.com" });
        
        // Create test course
        const course = new Course({
            title: "Test Course",
            code: "TEST101", 
            description: "Test course description"
        });
        await course.save();
        
        // Create test student
        const student = new Student({
            name: "Test Student",
            email: "test@example.com",
            enrolledCourses: ["TEST101"]
        });
        await student.save();
        
        res.json({
            message: "Test data created successfully!",
            course: course,
            student: student,
            form_instructions: "Use Email: test@example.com, Course Code: TEST101"
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
// Start server - ONLY ONCE
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});