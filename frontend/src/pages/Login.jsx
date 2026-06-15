import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, googleLogin, clearError } from '../redux/authSlice';
import { useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((s) => s.auth);

  useEffect(() => {
    if (user?.college) {
      const id = user.college._id || user.college;
      navigate(`/college/${id}`, { replace: true });
    } else if (user && !user.college) {
      navigate('/profile/setup', { replace: true });
    }
  }, [user, navigate]);
  useEffect(() => { if (error) toast.error(error); return () => dispatch(clearError()); }, [error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(form));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-zinc-800 p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-md border border-zinc-700 mx-4">
        <h1 className="text-xl sm:text-2xl font-bold text-center text-white mb-6">Login</h1>

        <div className="mb-4">
          <GoogleLogin
            onSuccess={credentialResponse => dispatch(googleLogin(credentialResponse.credential))}
            onError={() => toast.error('Google login failed')}
            theme="outline"
            size="large"
            text="continue_with"
            shape="rectangular"
            width="100%"
          />
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-zinc-700" />
          <span className="text-sm text-zinc-400">or</span>
          <div className="flex-1 h-px bg-zinc-700" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none placeholder-zinc-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Password</label>
            <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none placeholder-zinc-500" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition">
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
        <p className="text-center text-sm text-zinc-400 mt-4">
          Don't have an account? <Link to="/register" className="text-indigo-400 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
