import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../services/api';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import PageHero from '../../components/PageHero';
import toast from 'react-hot-toast';

export default function AdminSemesterSubjects() {
  const { collegeId, branchId, semesterId } = useParams();
  const [college, setCollege] = useState(null);
  const [branch, setBranch] = useState(null);
  const [semester, setSemester] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', code: '' });

  const fetchSubjects = async () => {
    try {
      const res = await API.get(`/subjects?semester=${semesterId}`);
      setSubjects(res.data);
    } catch { toast.error('Failed to fetch subjects'); }
  };

  useEffect(() => {
    API.get(`/colleges/${collegeId}`).then((r) => setCollege(r.data)).catch(() => {});
    API.get(`/branches/${branchId}`).then((r) => setBranch(r.data)).catch(() => {});
    API.get(`/semesters/${semesterId}`).then((r) => setSemester(r.data)).catch(() => {});
    fetchSubjects();
  }, [collegeId, branchId, semesterId]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', code: '' });
    setShowForm(true);
  };

  const openEdit = (subj) => {
    setEditing(subj);
    setForm({ name: subj.name, code: subj.code });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await API.put(`/subjects/${editing._id}`, form);
        toast.success('Subject updated');
      } else {
        await API.post('/subjects', { ...form, college: collegeId, branch: branchId, semester: semesterId });
        toast.success('Subject created');
      }
      setShowForm(false);
      fetchSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subject and all its resources?')) return;
    try {
      await API.delete(`/subjects/${id}`);
      toast.success('Subject deleted');
      fetchSubjects();
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
        <Link to={`/admin/colleges/${collegeId}/branches/${branchId}`} className="back-btn">{branch?.name || 'Branch'}</Link>
        <span className="text-zinc-500">/</span>
        <span className="text-zinc-400 text-sm">{semester?.name || 'Semester'}</span>
      </div>
      <PageHero
        title={`${semester?.name || 'Semester'} — Subjects`}
        actions={
          <button onClick={openCreate}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-indigo-500/20 backdrop-blur-sm active:scale-95">
            <FiPlus size={18} strokeWidth={2.5} /> Add Subject
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-zinc-800 rounded-xl shadow-md p-6 mb-6 space-y-4 border border-zinc-700">
          <input placeholder="Subject Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 placeholder-zinc-500" required />
          <input placeholder="Code (optional)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
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
        {subjects.map((subj) => (
          <div key={subj._id} className="bg-zinc-800 rounded-xl shadow-md p-4 card-hover flex items-center justify-between border border-zinc-700">
            <div>
              <h3 className="font-semibold text-white">{subj.name}</h3>
              {subj.code && <p className="text-sm text-zinc-400">{subj.code}</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(subj)} className="p-2 text-blue-400 hover:bg-zinc-700 rounded-lg"><FiEdit2 size={16} /></button>
              <button onClick={() => handleDelete(subj._id)} className="p-2 text-red-400 hover:bg-zinc-700 rounded-lg"><FiTrash2 size={16} /></button>
            </div>
          </div>
        ))}
        {subjects.length === 0 && <p className="text-center text-zinc-500 py-8">No subjects found.</p>}
      </div>
    </div>
  );
}
