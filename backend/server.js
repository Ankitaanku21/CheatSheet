// npm run dev

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Server is running' }));

app.use('/api/colleges', require('./routes/collegeRoutes'));
app.use('/api/users', require('./routes/authRoutes'));
app.use('/api/branches', require('./routes/branchRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/semesters', require('./routes/semesterRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/upload/avatar', require('./routes/avatarRoutes'));
app.use('/api/assistant', require('./routes/assistantRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => process.exit(0));
});
