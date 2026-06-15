import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../services/api';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import PageHero from '../../components/PageHero';
import toast from 'react-hot-toast';

const semesterDefs = [
  { name: 'Semester I', code: 'SEM1', year: 1, displayOrder: 1 },
  { name: 'Semester II', code: 'SEM2', year: 1, displayOrder: 2 },
  { name: 'Semester III', code: 'SEM3', year: 2, displayOrder: 3 },
  { name: 'Semester IV', code: 'SEM4', year: 2, displayOrder: 4 },
  { name: 'Semester V', code: 'SEM5', year: 3, displayOrder: 5 },
  { name: 'Semester VI', code: 'SEM6', year: 3, displayOrder: 6 },
  { name: 'Semester VII', code: 'SEM7', year: 4, displayOrder: 7 },
  { name: 'Semester VIII', code: 'SEM8', year: 4, displayOrder: 8 },
];

export default function AdminBranchSemesters() {
  const { collegeId, branchId } = useParams();
  const [college, setCollege] = useState(null);
  const [branch, setBranch] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', year: 1, displayOrder: 1 });

  const fetchSemesters = async () => {
    try {
      const res = await API.get(`/semesters?branch=${branchId}`);
      setSemesters(res.data);
    } catch { toast.error('Failed to fetch semesters'); }
  };

  useEffect(() => {
    API.get(`/colleges/${collegeId}`).then((r) => setCollege(r.data)).catch(() => {});
    API.get(`/branches/${branchId}`).then((r) => setBranch(r.data)).catch(() => {});
    fetchSemesters();
  }, [collegeId, branchId]);

  const openCreate = () => {
    setEditing(null);
    setForm(semesterDefs.find((s, i) => !semesters.find((es) => es.displayOrder === s.displayOrder)) || semesterDefs[0]);
    setShowForm(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({ name: s.name, code: s.code, year: s.year, displayOrder: s.displayOrder });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await API.put(`/semesters/${editing._id}`, form);
        toast.success('Semester updated');
      } else {
        await API.post('/semesters', { ...form, college: collegeId, branch: branchId });
        toast.success('Semester created');
      }
      setShowForm(false);
      fetchSemesters();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this semester and all its subjects?')) return;
    try {
      await API.delete(`/semesters/${id}`);
      toast.success('Semester deleted');
      fetchSemesters();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-2 text-indigo-400 mb-4">
        <Link to="/admin/colleges" className="back-btn">All Colleges</Link>
        <span className="text-zinc-500">/</span>
        <Link to={`/admin/colleges/${collegeId}`} className="back-btn">{college?.name || 'College'}</Link>
        <span className="text-zinc-500">/</span>
        <span className="text-zinc-400 text-sm">{branch?.name || 'Branch'}</span>
      </div>
      <PageHero
        title={`${branch?.name || 'Branch'} — Semesters`}
        actions={
          <button onClick={openCreate}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-indigo-500/20 backdrop-blur-sm active:scale-95">
            <FiPlus size={18} strokeWidth={2.5} /> Add Semester
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-zinc-800 rounded-xl shadow-md p-6 mb-6 space-y-4 border border-zinc-700">
          <input placeholder="Semester Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 placeholder-zinc-500" required />
          <input placeholder="Code (e.g. SEM1)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="w-full px-4 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 placeholder-zinc-500" required />
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm text-zinc-400 mb-1">Year</label>
              <input type="number" min={1} max={4} value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" required />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-zinc-400 mb-1">Display Order</label>
              <input type="number" min={1} value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" required />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-500 btn-glow">
              {editing ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-zinc-700 text-zinc-200 px-6 py-2 rounded-lg hover:bg-zinc-600">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {semesters.map((s) => (
          <div key={s._id} className="bg-zinc-800 rounded-xl shadow-md p-4 card-hover flex items-center justify-between border border-zinc-700">
            <Link to={`/admin/colleges/${collegeId}/branches/${branchId}/semesters/${s._id}`} className="hover:text-indigo-400">
              <h3 className="font-semibold text-white">{s.name}</h3>
              <p className="text-sm text-zinc-400">{s.code} (Year {s.year})</p>
            </Link>
            <div className="flex gap-2">
              <button onClick={() => openEdit(s)} className="p-2 text-blue-400 hover:bg-zinc-700 rounded-lg"><FiEdit2 size={16} /></button>
              <button onClick={() => handleDelete(s._id)} className="p-2 text-red-400 hover:bg-zinc-700 rounded-lg"><FiTrash2 size={16} /></button>
            </div>
          </div>
        ))}
        {semesters.length === 0 && <p className="text-center text-zinc-500 py-8">No semesters found.</p>}
      </div>
    </div>
  );
}
