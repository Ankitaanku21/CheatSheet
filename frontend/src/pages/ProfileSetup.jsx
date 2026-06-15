import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile, fetchMe, logoutUser } from '../redux/authSlice';
import API from '../services/api';
import { FiLogOut } from 'react-icons/fi';
import toast from 'react-hot-toast';

const collegeTypes = ['IIT', 'NIT', 'IIIT', 'Other'];

export default function ProfileSetup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((s) => s.auth);

  const [collegeType, setCollegeType] = useState('');
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [customName, setCustomName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.college) {
      const id = user.college._id || user.college;
      navigate(`/college/${id}`, { replace: true });
    }
    API.get('/colleges').then((r) => setColleges(r.data)).catch(() => {});
  }, [user, navigate]);

  const filteredColleges = collegeType && collegeType !== 'Other'
    ? colleges.filter((c) => c.type === collegeType)
    : [];

  const handleSave = async () => {
    if (collegeType === 'Other') {
      if (!customName.trim()) return toast.error('Please enter your college name');
    } else {
      if (!selectedCollege) return toast.error('Please select your college');
    }
    setSaving(true);
    try {
      const collegePayload = collegeType === 'Other'
        ? { type: 'Other', name: customName.trim() }
        : selectedCollege;
      const updated = await dispatch(updateUserProfile({ college: collegePayload })).unwrap();
      await dispatch(fetchMe()).unwrap();
      toast.success('Profile updated!');
      const collegeId = updated.college?._id || updated.college;
      navigate(`/college/${collegeId}`, { replace: true });
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-zinc-800 p-8 rounded-xl shadow-lg w-full max-w-md border border-zinc-700">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Complete Your Profile</h1>
          <button onClick={handleLogout} className="p-2 text-zinc-400 hover:text-red-400 transition" title="Logout">
            <FiLogOut size={20} />
          </button>
        </div>
        <p className="text-sm text-zinc-400 mb-6">
          Welcome, <strong className="text-white">{user?.name}</strong>! Select your college to continue.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">College Type</label>
            <div className="flex justify-center gap-2 flex-wrap">
              {collegeTypes.map((t) => (
                <button key={t} type="button" onClick={() => { setCollegeType(t); setSelectedCollege(''); setCustomName(''); }}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                    collegeType === t
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {collegeType && collegeType !== 'Other' ? (
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Select {collegeType}</label>
              <select value={selectedCollege} onChange={(e) => setSelectedCollege(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="">Choose...</option>
                {filteredColleges.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          ) : collegeType === 'Other' ? (
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">College Name</label>
              <input type="text" placeholder="Enter your college name" value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder-zinc-500" />
            </div>
          ) : null}

          {collegeType && (
            <button onClick={handleSave} disabled={saving}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition font-medium">
              {saving ? 'Saving...' : 'Continue'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
