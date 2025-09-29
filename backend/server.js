const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;
const POLL_TIMEOUT = parseInt(process.env.POLL_TIMEOUT) || 60000; // 60 seconds

// Middleware
app.use(cors());
app.use(express.json());

// Data storage (in production, use a database)
let currentPoll = null;
let students = new Map(); // socketId -> student info
let pollHistory = [];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Polling server is running' });
});

app.get('/api/current-poll', (req, res) => {
  res.json({ poll: currentPoll });
});

app.get('/api/poll-history', (req, res) => {
  res.json({ history: pollHistory });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Send current poll state to new connection
  socket.emit('currentPoll', currentPoll);
  socket.emit('studentsUpdate', Array.from(students.values()));

  // Teacher creates a new poll
  socket.on('createPoll', (data) => {
    console.log('Received createPoll event:', data);
    const { question, options, timeLimit = POLL_TIMEOUT } = data;
    
    if (!question || !options || options.length < 2) {
      console.log('Invalid poll data:', { question, options, timeLimit });
      socket.emit('error', { message: 'Invalid poll data' });
      return;
    }

    // If there's an active poll, end it first (teacher can always create new polls)
    if (currentPoll && currentPoll.active) {
      endPoll();
    }

    currentPoll = {
      id: uuidv4(),
      question,
      options: options.map(option => ({ text: option, votes: 0 })),
      timeLimit,
      startTime: Date.now(),
      active: true,
      answers: new Map(), // studentId -> answer
      createdBy: socket.id
    };

    // Reset student answered status
    students.forEach(student => {
      student.hasAnswered = false;
    });

    console.log('Poll created successfully:', currentPoll.question);
    console.log('Emitting newPoll event to all clients');
    io.emit('newPoll', currentPoll);
    io.emit('studentsUpdate', Array.from(students.values()));

    // Auto-end poll after time limit
    const pollId = currentPoll.id;
    setTimeout(() => {
      if (currentPoll && currentPoll.id === pollId) {
        endPoll();
      }
    }, timeLimit);
  });

  // Student joins with name
  socket.on('joinAsStudent', (data) => {
    const { name } = data;
    
    if (!name || name.trim() === '') {
      socket.emit('error', { message: 'Name is required' });
      return;
    }

    // Check if name is already taken
    const existingStudent = Array.from(students.values()).find(s => s.name === name.trim());
    if (existingStudent) {
      socket.emit('error', { message: 'Name already taken' });
      return;
    }

    const student = {
      id: uuidv4(),
      socketId: socket.id,
      name: name.trim(),
      hasAnswered: false,
      joinedAt: Date.now()
    };

    students.set(socket.id, student);
    socket.emit('studentJoined', student);
    io.emit('studentsUpdate', Array.from(students.values()));
    
    console.log('Student joined:', student.name);
  });

  // Student submits answer
  socket.on('submitAnswer', (data) => {
    const { optionIndex } = data;
    const student = students.get(socket.id);

    if (!student) {
      socket.emit('error', { message: 'Student not found' });
      return;
    }

    if (!currentPoll || !currentPoll.active) {
      socket.emit('error', { message: 'No active poll' });
      return;
    }

    if (student.hasAnswered) {
      socket.emit('error', { message: 'You have already answered' });
      return;
    }

    if (optionIndex < 0 || optionIndex >= currentPoll.options.length) {
      socket.emit('error', { message: 'Invalid option' });
      return;
    }

    // Record the answer
    currentPoll.answers.set(student.id, optionIndex);
    currentPoll.options[optionIndex].votes++;
    student.hasAnswered = true;

    console.log(`${student.name} answered:`, currentPoll.options[optionIndex].text);

    // Update student status
    io.emit('studentsUpdate', Array.from(students.values()));
    
    // Send updated results to everyone
    io.emit('pollResults', {
      id: currentPoll.id,
      question: currentPoll.question,
      options: currentPoll.options,
      totalVotes: currentPoll.answers.size,
      active: currentPoll.active
    });

    // Don't auto-end poll when all students answer - let teacher control when to end
    // Poll will end automatically after time limit or when teacher manually ends it
  });

  // Teacher requests to end poll
  socket.on('endPoll', () => {
    if (currentPoll && currentPoll.createdBy === socket.id) {
      endPoll();
    }
  });

  // Remove student (teacher only)
  socket.on('removeStudent', (data) => {
    const { studentId } = data;
    const studentToRemove = Array.from(students.values()).find(s => s.id === studentId);
    
    if (studentToRemove) {
      students.delete(studentToRemove.socketId);
      io.to(studentToRemove.socketId).emit('removed', { message: 'You have been removed by the teacher' });
      io.emit('studentsUpdate', Array.from(students.values()));
      console.log('Student removed:', studentToRemove.name);
    }
  });

  // Chat functionality
  socket.on('sendMessage', (data) => {
    const { message, isTeacher } = data;
    const student = students.get(socket.id);
    
    const chatMessage = {
      id: uuidv4(),
      message: message.trim(),
      sender: isTeacher ? 'Teacher' : (student ? student.name : 'Anonymous'),
      isTeacher,
      timestamp: Date.now()
    };

    io.emit('newMessage', chatMessage);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Remove student if they were connected
    if (students.has(socket.id)) {
      const student = students.get(socket.id);
      students.delete(socket.id);
      io.emit('studentsUpdate', Array.from(students.values()));
      console.log('Student left:', student.name);
    }
  });
});

// Helper functions
function canCreateNewPoll() {
  if (!currentPoll) return true;
  return !currentPoll.active || allStudentsAnswered();
}

function allStudentsAnswered() {
  if (!currentPoll || students.size === 0) return false;
  return Array.from(students.values()).every(student => student.hasAnswered);
}

function endPoll() {
  if (!currentPoll) return;
  
  currentPoll.active = false;
  currentPoll.endTime = Date.now();
  
  // Add to history
  pollHistory.push({
    ...currentPoll,
    answers: Object.fromEntries(currentPoll.answers)
  });

  console.log('Poll ended:', currentPoll.question);
  
  io.emit('pollEnded', {
    id: currentPoll.id,
    question: currentPoll.question,
    options: currentPoll.options,
    totalVotes: currentPoll.answers.size,
    active: false
  });
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
