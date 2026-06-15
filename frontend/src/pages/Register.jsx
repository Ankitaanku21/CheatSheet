import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, googleLogin, clearError } from '../redux/authSlice';
import { GoogleLogin } from '@react-oauth/google';
import API from '../services/api';
import { FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

const collegeTypes = ['IIT', 'NIT', 'IIIT', 'Other'];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', college: '' });
  const [colleges, setColleges] = useState([]);
  const [collegeType, setCollegeType] = useState('');
  const [customName, setCustomName] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((s) => s.auth);

  useEffect(() => { if (error) toast.error(error); return () => dispatch(clearError()); }, [error, dispatch]);
  useEffect(() => { API.get('/colleges').then((r) => setColleges(r.data)).catch(() => {}); }, []);
  useEffect(() => {
    if (user?.college) {
      const id = user.college._id || user.college;
      navigate(`/college/${id}`, { replace: true });
    } else if (user && !user.college) {
      navigate('/profile/setup', { replace: true });
    }
  }, [user, navigate]);

  const filteredColleges = collegeType && collegeType !== 'Other'
    ? colleges.filter((c) => c.type === collegeType)
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    let payload;
    if (collegeType === 'Other') {
      if (!customName.trim()) return toast.error('Please enter your college name');
      payload = { ...form, college: { type: 'Other', name: customName.trim() } };
    } else {
      if (!form.college) return toast.error('Please select your college');
      payload = { ...form, college: form.college };
    }
    try {
      const res = await dispatch(registerUser(payload)).unwrap();
      toast.success(res.message || 'Registration successful! Please check your email to verify.');
      navigate('/login', { replace: true });
    } catch (err) {
      // toast already handled by the error effect
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-zinc-800 p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-md border border-zinc-700 mx-4">
        <Link to="/" className="back-btn mb-4">
          <FiArrowLeft size={16} /> Back to Home
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-center text-white mb-6">Register</h1>

        <div className="mb-4">
          <GoogleLogin
            onSuccess={credentialResponse => dispatch(googleLogin(credentialResponse.credential))}
            onError={() => toast.error('Google signup failed')}
            theme="outline"
            size="large"
            text="continue_with"
            shape="rectangular"
            width="100%"
          />
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-zinc-700" />
          <span className="text-sm text-zinc-400">or register with email</span>
          <div className="flex-1 h-px bg-zinc-700" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Name</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder-zinc-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder-zinc-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Password</label>
            <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder-zinc-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">College</label>
            <div className="flex justify-center gap-2 mb-3 flex-wrap">
              {collegeTypes.map((t) => (
                <button key={t} type="button" onClick={() => { setCollegeType(t); setForm({ ...form, college: '' }); setCustomName(''); }}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                    collegeType === t
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
            {collegeType && collegeType !== 'Other' ? (
              <select value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required>
                <option value="">Select {collegeType}</option>
                {filteredColleges.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            ) : collegeType === 'Other' ? (
              <input type="text" placeholder="Enter your college name" value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder-zinc-500" required />
            ) : (
              <p className="text-center text-sm text-zinc-500">Select a college type above</p>
            )}
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition">
            {loading ? 'Sending...' : 'Register'}
          </button>
        </form>
        <p className="text-center text-sm text-zinc-400 mt-4">
          Already have an account? <Link to="/login" className="text-indigo-400 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}