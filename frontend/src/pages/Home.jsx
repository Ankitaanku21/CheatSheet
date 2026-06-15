import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiCpu, FiMonitor, FiRadio, FiZap, FiSettings, FiAward, FiBarChart2 } from 'react-icons/fi';
import API from '../services/api';

const branchIcons = [FiCpu, FiMonitor, FiRadio, FiZap, FiSettings];
  const branchColors = ['bg-blue-900/50 text-blue-300', 'bg-green-900/50 text-green-300', 'bg-purple-900/50 text-purple-300', 'bg-orange-900/50 text-orange-300', 'bg-pink-900/50 text-pink-300'];

  const typeColors = {
    IIT: 'bg-orange-900/50 text-orange-300',
    NIT: 'bg-green-900/50 text-green-300',
    IIIT: 'bg-purple-900/50 text-purple-300',
    Other: 'bg-blue-900/50 text-blue-300',
  };

export default function Home() {
  const { user } = useSelector((s) => s.auth);
  const [branches, setBranches] = useState([]);
  const [college, setCollege] = useState(null);

  useEffect(() => {
    if (!user?.college) return;
    const collegeId = user.college._id || user.college;
    API.get(`/branches?college=${collegeId}`).then((r) => setBranches(r.data)).catch(() => {});
    API.get(`/colleges/${collegeId}`).then((r) => setCollege(r.data)).catch(() => {});
  }, [user?.college]);

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
          <FiBookOpen size={60} className="mx-auto text-indigo-400 mb-6" />
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-4">College Notes & PYQ Platform</h1>
          <p className="text-sm sm:text-lg text-zinc-400 mb-8">
            Access notes, previous year papers, AI-powered quizzes, and track your performance.
          </p>
          <div className="flex justify-center gap-4 mb-12">
            <Link to="/register" className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-indigo-500 btn-glow">
              Get Started
            </Link>
            <Link to="/login" className="bg-zinc-700 text-zinc-200 px-8 py-3 rounded-lg text-lg hover:bg-zinc-600 btn-glow">
              Login
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-zinc-800 rounded-xl shadow-md p-6 card-hover border border-zinc-700">
              <FiBookOpen size={28} className="text-indigo-400 mb-3 mx-auto" />
              <h3 className="font-semibold text-white mb-1">Notes & PYQs</h3>
              <p className="text-sm text-zinc-400">Upload and download study materials</p>
            </div>
            <div className="bg-zinc-800 rounded-xl shadow-md p-6 card-hover border border-zinc-700">
              <FiBarChart2 size={28} className="text-indigo-400 mb-3 mx-auto" />
              <h3 className="font-semibold text-white mb-1">AI Quizzes</h3>
              <p className="text-sm text-zinc-400">Test knowledge with AI-generated quizzes</p>
            </div>
            <div className="bg-zinc-800 rounded-xl shadow-md p-6 card-hover border border-zinc-700">
              <FiAward size={28} className="text-indigo-400 mb-3 mx-auto" />
              <h3 className="font-semibold text-white mb-1">Leaderboard</h3>
              <p className="text-sm text-zinc-400">Compete and earn ratings</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user.college) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <FiBookOpen size={48} className="mx-auto text-indigo-400 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Welcome, {user.name}!</h1>
          <p className="text-zinc-400 mb-6">Set up your profile to get started with notes, PYQs, and quizzes.</p>
          <Link to="/profile/setup" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-500 transition inline-block">
            Complete Profile Setup
          </Link>
        </div>
      </div>
    );
  }

  const collegeId = user.college._id || user.college;
  const collegeName = user.college.name || college?.name || 'Your College';
  const collegeType = user.college.type || college?.type || '';
  const collegeCode = user.college.code || college?.code || '';

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-1">{collegeName}</h1>
        <div className="flex items-center justify-center gap-3 mt-2">
          {collegeType && (
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${typeColors[collegeType] || 'bg-zinc-700 text-zinc-300'}`}>
              {collegeType}
            </span>
          )}
          {collegeCode && (
            <span className="text-sm text-zinc-500">{collegeCode}</span>
          )}
        </div>
        <p className="text-zinc-400 mt-3">Welcome back, <strong className="text-white">{user.name}</strong></p>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6">Branches</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {branches.map((branch, i) => {
          const Icon = branchIcons[i % branchIcons.length];
          const color = branchColors[i % branchColors.length];
          return (
            <Link key={branch._id} to={`/college/${collegeId}/branch/${branch._id}`}
              className="bg-zinc-800 rounded-xl shadow-md p-6 card-hover border border-zinc-700">
              <div className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center mb-4`}>
                <Icon size={28} />
              </div>
              <h2 className="text-xl font-semibold text-white">{branch.name}</h2>
              <p className="text-sm text-zinc-400 mt-1">{branch.code}</p>
            </Link>
          );
        })}
      </div>
      {branches.length === 0 && (
        <div className="text-center mt-8">
          <p className="text-zinc-500">No branches available yet.</p>
        </div>
      )}

    </div>
  );
}
