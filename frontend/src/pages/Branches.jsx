import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { useSelector } from 'react-redux';
import { FiCpu, FiMonitor, FiRadio, FiZap, FiSettings, FiPlus } from 'react-icons/fi';
import PageHero from '../components/PageHero';
import toast from 'react-hot-toast';

const icons = [FiCpu, FiMonitor, FiRadio, FiZap, FiSettings];
const colors = ['bg-blue-900/50 text-blue-300', 'bg-green-900/50 text-green-300', 'bg-purple-900/50 text-purple-300', 'bg-orange-900/50 text-orange-300', 'bg-pink-900/50 text-pink-300'];

export default function Branches() {
  const { collegeId } = useParams();
  const { user } = useSelector((s) => s.auth);
  const [branches, setBranches] = useState([]);
  const [college, setCollege] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', image: '' });

  const isOwnCollege = user?.college?._id === collegeId || user?.college === collegeId;

  useEffect(() => {
    API.get(`/branches?college=${collegeId}`).then((r) => setBranches(r.data)).catch(() => {});
    API.get(`/colleges/${collegeId}`).then((r) => setCollege(r.data)).catch(() => {});
  }, [collegeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/branches', { ...form, college: collegeId });
      setBranches((prev) => [...prev, res.data]);
      setShowForm(false);
      setForm({ name: '', code: '', image: '' });
      toast.success('Branch created');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create branch');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <PageHero
        backLink="/colleges"
        backText="All Colleges"
        title={college?.name || 'Select Branch'}
        subtitle="Browse branches and resources"
        actions={isOwnCollege ? (
          <button onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-indigo-500/20 backdrop-blur-sm active:scale-95">
            <FiPlus size={18} strokeWidth={2.5} /> Add Branch
          </button>
        ) : null}
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-zinc-800 rounded-xl shadow-md p-6 mb-6 max-w-lg mx-auto space-y-4 border border-zinc-700">
          <input placeholder="Branch Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 placeholder-zinc-500" required />
          <input placeholder="Code (e.g. CSE)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="w-full px-4 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 placeholder-zinc-500" required />
          <input placeholder="Image URL (optional)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="w-full px-4 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 placeholder-zinc-500" />
          <div className="flex gap-3">
            <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-500 btn-glow">Create</button>
            <button type="button" onClick={() => { setShowForm(false); setForm({ name: '', code: '', image: '' }); }}
              className="bg-zinc-700 text-zinc-200 px-6 py-2 rounded-lg hover:bg-zinc-600">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {branches.map((branch, i) => {
          const Icon = icons[i % icons.length];
          const color = colors[i % colors.length];
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
          <p className="text-zinc-500">No branches yet for this college.</p>
          {isOwnCollege && <p className="text-zinc-500 mt-1">Click the <strong className="text-zinc-300">Add</strong> button above to create the first branch!</p>}
        </div>
      )}
    </div>
  );
}
