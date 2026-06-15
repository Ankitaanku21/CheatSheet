import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMe, updateUserProfile } from '../redux/authSlice';
import { fetchAttempts } from '../redux/quizSlice';
import RatingBadge from '../components/RatingBadge';
import { Link } from 'react-router-dom';
import { uploadAvatar } from '../services/authService';
import {
  FiArrowLeft, FiAward, FiBarChart2, FiBookOpen, FiClock, FiTarget,
  FiEdit2, FiCheck, FiX, FiCamera, FiMail, FiMapPin, FiUser
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useSelector((s) => s.auth);
  const { attempts, attemptsLoading } = useSelector((s) => s.quiz);
  const dispatch = useDispatch();
  const fileRef = useRef(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    dispatch(fetchMe());
    dispatch(fetchAttempts());
  }, [dispatch]);

  if (!user) return null;

  const stats = user.quizStats || {};

  const handleAvatarClick = () => fileRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      return       toast.error('Image too large. Max 5MB allowed.');
    }
    setUploading(true);
    try {
      const res = await uploadAvatar(file);
      await dispatch(updateUserProfile({ avatar: res.data.url })).unwrap();
      toast.success('Avatar updated!');
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.response?.data?.message || 'Failed to upload avatar';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const startEditingName = () => {
    setNameInput(user.name);
    setEditingName(true);
  };

  const saveName = async () => {
    if (!nameInput.trim()) return toast.error('Name cannot be empty');
    try {
      await dispatch(updateUserProfile({ name: nameInput.trim() })).unwrap();
      toast.success('Name updated!');
      setEditingName(false);
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.response?.data?.message || 'Failed to update name';
      toast.error(msg);
    }
  };

  const cancelEditName = () => {
    setEditingName(false);
    setNameInput('');
  };

  const apiBase = import.meta.env.VITE_API_URL || '';
  const avatarUrl = user.avatar
    ? (user.avatar.startsWith('http') ? user.avatar : apiBase + user.avatar)
    : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/" className="back-btn mb-5">
        <FiArrowLeft size={16} /> Back to Home
      </Link>

      {/* Profile Header Card */}
      <div className="bg-zinc-800 rounded-xl shadow-xl mb-8 overflow-hidden card-hover border border-zinc-700">
        <div className="bg-gradient-to-r from-indigo-700 to-purple-800 h-32 relative">
          <div className="absolute -bottom-16 left-8">
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              <div className="w-32 h-32 rounded-full ring-4 ring-zinc-800 overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={user.name} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full bg-zinc-700 flex items-center justify-center text-4xl font-bold text-white">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <FiCamera size={28} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

        <div className="pt-20 pb-6 px-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text" value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="px-3 py-1.5 bg-zinc-900 text-white border border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-48" autoFocus
                      onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') cancelEditName(); }}
                    />
                    <button onClick={saveName} className="p-1.5 rounded-lg hover:bg-zinc-700 text-green-400"><FiCheck size={18} /></button>
                    <button onClick={cancelEditName} className="p-1.5 rounded-lg hover:bg-zinc-700 text-red-400"><FiX size={18} /></button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                    <button onClick={startEditingName} className="btn btn-ghost btn-xs btn-square text-zinc-400 hover:text-indigo-400">
                      <FiEdit2 size={14} />
                    </button>
                  </>
                )}
                <span className="text-xs font-medium px-2 py-0.5 rounded-full border border-zinc-600 text-zinc-300">{user.role}</span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 mt-2">
                <span className="flex items-center gap-1.5"><FiMail size={14} /> {user.email}</span>
                {user.college?.name && (
                  <span className="flex items-center gap-1.5"><FiMapPin size={14} /> {user.college.name} <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-300">{user.college.type}</span></span>
                )}
                {user.branch?.name && (
                  <span className="flex items-center gap-1.5"><FiBookOpen size={14} /> {user.branch.name}</span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-3">
                <RatingBadge rating={stats.rating || 0} size={18} />
                <span className="text-sm text-zinc-400">
                  {stats.rating === 0 ? 'No rating yet' : `${stats.rating}/5`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Quiz Stats */}
      <div className="bg-zinc-800 rounded-xl shadow-xl p-6 mb-8 card-hover border border-zinc-700">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FiBarChart2 className="text-indigo-400" /> Quiz Statistics
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-indigo-900/20 rounded-lg p-4 text-center card-hover">
            <FiTarget className="mx-auto text-indigo-400 mb-1" size={20} />
            <div className="text-2xl font-bold text-white">{stats.totalQuizzes || 0}</div>
            <div className="text-xs text-zinc-400">Quizzes Taken</div>
          </div>
          <div className="bg-green-900/20 rounded-lg p-4 text-center card-hover">
            <FiAward className="mx-auto text-green-400 mb-1" size={20} />
            <div className="text-2xl font-bold text-white">
              {stats.totalCorrect != null
                ? (stats.totalCorrect % 1 === 0 ? stats.totalCorrect : stats.totalCorrect.toFixed(1))
                : 0}
            </div>
            <div className="text-xs text-zinc-400">Total Score</div>
          </div>
          <div className="bg-blue-900/20 rounded-lg p-4 text-center card-hover">
            <FiBookOpen className="mx-auto text-blue-400 mb-1" size={20} />
            <div className="text-2xl font-bold text-white">{stats.totalAttempted || 0}</div>
            <div className="text-xs text-zinc-400">Questions</div>
          </div>
          <div className="bg-yellow-900/20 rounded-lg p-4 text-center card-hover">
            <FiClock className="mx-auto text-yellow-400 mb-1" size={20} />
            <div className="text-2xl font-bold text-white">{stats.averageScore || 0}%</div>
            <div className="text-xs text-zinc-400">Avg Accuracy</div>
          </div>
        </div>
      </div>

      {/* Recent Attempts */}
      <div className="bg-zinc-800 rounded-xl shadow-xl p-6 card-hover border border-zinc-700">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FiClock className="text-indigo-400" /> Recent Quiz Attempts
        </h2>
        {attemptsLoading ? (
          <p className="text-center text-zinc-400 py-8">Loading attempts...</p>
        ) : attempts.length === 0 ? (
          <div className="text-center py-8">
            <FiBarChart2 size={40} className="mx-auto text-zinc-600 mb-3" />
            <p className="text-zinc-400 mb-3">No quiz attempts yet</p>
            <Link to="/quiz" className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 btn-glow text-sm">Take your first quiz</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {attempts.map((a) => (
              <Link key={a._id} to={`/attempt/${a._id}`}
                className="flex items-center justify-between bg-zinc-900 rounded-lg p-4 hover:bg-zinc-700 transition">
                <div>
                  <p className="font-medium text-white">{a.resource?.title || 'Quiz'}</p>
                  <p className="text-sm text-zinc-400">{a.subject?.name} • {new Date(a.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{a.score}/{a.totalQuestions}</p>
                  <p className={`text-sm ${a.score / a.totalQuestions >= 0.6 ? 'text-green-400' : 'text-red-400'}`}>
                    {Math.round((a.score / a.totalQuestions) * 100)}%
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}