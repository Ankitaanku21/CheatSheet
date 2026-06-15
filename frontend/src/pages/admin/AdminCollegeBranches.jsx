import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../services/api';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import PageHero from '../../components/PageHero';
import toast from 'react-hot-toast';

export default function AdminCollegeBranches() {
  const { collegeId } = useParams();
  const [college, setCollege] = useState(null);
  const [branches, setBranches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', image: '' });

  const fetchBranches = async () => {
    try {
      const res = await API.get(`/branches?college=${collegeId}`);
      setBranches(res.data);
    } catch { toast.error('Failed to fetch branches'); }
  };

  useEffect(() => {
    API.get(`/colleges/${collegeId}`).then((r) => setCollege(r.data)).catch(() => {});
    fetchBranches();
  }, [collegeId]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', code: '', image: '' });
    setShowForm(true);
  };

  const openEdit = (b) => {
    setEditing(b);
    setForm({ name: b.name, code: b.code, image: b.image || '' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await API.put(`/branches/${editing._id}`, form);
        toast.success('Branch updated');
      } else {
        await API.post('/branches', { ...form, college: collegeId });
        toast.success('Branch created');
      }
      setShowForm(false);
      fetchBranches();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this branch and all its semesters/subjects?')) return;
    try {
      await API.delete(`/branches/${id}`);
      toast.success('Branch deleted');
      fetchBranches();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <PageHero
        backLink="/admin/colleges"
        backText="All Colleges"
        title={`${college?.name || 'College'} — Branches`}
        actions={
          <button onClick={openCreate}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-indigo-500/20 backdrop-blur-sm active:scale-95">
            <FiPlus size={18} strokeWidth={2.5} /> Add Branch
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-zinc-800 rounded-xl shadow-md p-6 mb-6 space-y-4 border border-zinc-700">
          <input placeholder="Branch Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 placeholder-zinc-500" required />
          <input placeholder="Code (e.g. CSE)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="w-full px-4 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 placeholder-zinc-500" required />
          <input placeholder="Image URL (optional)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="w-full px-4 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 placeholder-zinc-500" />
          <div className="flex gap-3">
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-500 btn-glow">
              {editing ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-zinc-700 text-zinc-200 px-6 py-2 rounded-lg hover:bg-zinc-600">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {branches.map((b) => (
          <div key={b._id} className="bg-zinc-800 rounded-xl shadow-md p-4 card-hover flex items-center justify-between border border-zinc-700">
            <Link to={`/admin/colleges/${collegeId}/branches/${b._id}`} className="hover:text-indigo-400">
              <h3 className="font-semibold text-white">{b.name}</h3>
              <p className="text-sm text-zinc-400">{b.code}</p>
            </Link>
            <div className="flex gap-2">
              <button onClick={() => openEdit(b)} className="p-2 text-blue-400 hover:bg-zinc-700 rounded-lg"><FiEdit2 size={16} /></button>
              <button onClick={() => handleDelete(b._id)} className="p-2 text-red-400 hover:bg-zinc-700 rounded-lg"><FiTrash2 size={16} /></button>
            </div>
          </div>
        ))}
        {branches.length === 0 && <p className="text-center text-zinc-500 py-8">No branches found for this college.</p>}
      </div>
    </div>
  );
}
