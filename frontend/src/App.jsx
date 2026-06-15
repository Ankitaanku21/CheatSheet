// npm run dev


import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Colleges from './pages/Colleges';
import Branches from './pages/Branches';
import Semesters from './pages/Semesters';
import Subjects from './pages/Subjects';
import Resources from './pages/Resources';
import Preview from './pages/Preview';
import Quizzes from './pages/Quizzes';
import QuizBranches from './pages/quiz/QuizBranches';
import QuizSemesters from './pages/quiz/QuizSemesters';
import QuizSubjects from './pages/quiz/QuizSubjects';
import QuizPage from './pages/quiz/QuizPage';
import TakeQuiz from './pages/TakeQuiz';
import QuizResult from './pages/QuizResult';
import Profile from './pages/Profile';
import ProfileSetup from './pages/ProfileSetup';
import Bookmarks from './pages/Bookmarks';
import VerifyEmail from './pages/VerifyEmail';
import Leaderboard from './pages/Leaderboard';
import AttemptDetail from './pages/AttemptDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageColleges from './pages/admin/ManageColleges';
import AdminCollegeBranches from './pages/admin/AdminCollegeBranches';
import AdminBranchSemesters from './pages/admin/AdminBranchSemesters';
import AdminSemesterSubjects from './pages/admin/AdminSemesterSubjects';

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify/:token" element={<VerifyEmail />} />
        <Route path="/colleges" element={<ProtectedRoute><Colleges /></ProtectedRoute>} />
        <Route path="/college/:collegeId" element={<ProtectedRoute><Branches /></ProtectedRoute>} />
        <Route path="/college/:collegeId/branch/:branchId" element={<ProtectedRoute><Semesters /></ProtectedRoute>} />
        <Route path="/college/:collegeId/branch/:branchId/semester/:semesterId/subjects" element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
        <Route path="/resources/:subjectId" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
        <Route path="/preview/:resourceId" element={<ProtectedRoute><Preview /></ProtectedRoute>} />
        <Route path="/quizzes" element={<ProtectedRoute><Quizzes /></ProtectedRoute>} />
        <Route path="/quiz" element={<ProtectedRoute><QuizBranches /></ProtectedRoute>} />
        <Route path="/quiz/branch/:branchId" element={<ProtectedRoute><QuizSemesters /></ProtectedRoute>} />
        <Route path="/quiz/semester/:semesterId" element={<ProtectedRoute><QuizSubjects /></ProtectedRoute>} />
        <Route path="/quiz/subject/:subjectId" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
        <Route path="/quiz/:resourceId" element={<ProtectedRoute><TakeQuiz /></ProtectedRoute>} />
        <Route path="/quiz/:resourceId/result" element={<ProtectedRoute><QuizResult /></ProtectedRoute>} />
        <Route path="/attempt/:attemptId" element={<ProtectedRoute><AttemptDetail /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/profile/setup" element={<ProtectedRoute requireCollege={false}><ProfileSetup /></ProtectedRoute>} />
        <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminRoute><AdminDashboard /></AdminRoute></ProtectedRoute>} />
        <Route path="/admin/colleges" element={<ProtectedRoute><AdminRoute><ManageColleges /></AdminRoute></ProtectedRoute>} />
        <Route path="/admin/colleges/:collegeId" element={<ProtectedRoute><AdminRoute><AdminCollegeBranches /></AdminRoute></ProtectedRoute>} />
        <Route path="/admin/colleges/:collegeId/branches/:branchId" element={<ProtectedRoute><AdminRoute><AdminBranchSemesters /></AdminRoute></ProtectedRoute>} />
        <Route path="/admin/colleges/:collegeId/branches/:branchId/semesters/:semesterId" element={<ProtectedRoute><AdminRoute><AdminSemesterSubjects /></AdminRoute></ProtectedRoute>} />
      </Routes>
    </div>
  );
}
