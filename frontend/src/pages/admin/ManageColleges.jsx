import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiChevronRight, FiSearch } from 'react-icons/fi';
import PageHero from '../../components/PageHero';
import toast from 'react-hot-toast';

const types = ['IIT', 'NIT', 'IIIT', 'Other'];

export default function ManageColleges() {
  const [colleges, setColleges] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'Other', code: '', image: '' });

  const fetchColleges = async () => {
    try {
      const res = await API.get('/colleges');
      setColleges(res.data);
    } catch { toast.error('Failed to fetch colleges'); }
  };

  useEffect(() => { fetchColleges(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', type: 'Other', code: '', image: '' });
    setShowForm(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, type: c.type, code: c.code, image: c.image || '' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await API.put(`/colleges/${editing._id}`, form);
        toast.success('College updated');
      } else {
        await API.post('/colleges', form);
        toast.success('College created');
      }
      setShowForm(false);
      fetchColleges();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this college?')) return;
    try {
      await API.delete(`/colleges/${id}`);
      toast.success('College deleted');
      fetchColleges();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return colleges.filter((c) => !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  }, [colleges, search]);

  const typeColors = {
    IIT: 'bg-orange-900/50 text-orange-300',
    NIT: 'bg-green-900/50 text-green-300',
    IIIT: 'bg-purple-900/50 text-purple-300',
    Other: 'bg-blue-900/50 text-blue-300',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <PageHero
        backLink="/admin"
        backText="Back to Admin Dashboard"
        title="Manage Colleges"
        actions={
          <button onClick={openCreate}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-indigo-500/20 backdrop-blur-sm active:scale-95">
            <FiPlus size={18} strokeWidth={2.5} /> Add College
          </button>
        }
      />

      <div className="relative mb-6">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
        <input type="text" placeholder="Search colleges by name or code..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-zinc-900 text-white placeholder-zinc-500" />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-zinc-800 rounded-xl shadow-md p-6 mb-6 space-y-4 border border-zinc-700">
          <input placeholder="College Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 placeholder-zinc-500" required />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full px-4 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input placeholder="Code (e.g. IITB)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
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
        {filtered.length === 0 && <p className="text-center text-zinc-500 py-8">No colleges match your search.</p>}
        {filtered.map((c) => (
          <div key={c._id} className="bg-zinc-800 rounded-xl shadow-md p-4 card-hover flex items-center justify-between border border-zinc-700">
            <div className="flex items-center gap-3">
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${typeColors[c.type]}`}>{c.type}</span>
              <div>
                <h3 className="font-semibold text-white">{c.name}</h3>
                <p className="text-sm text-zinc-400">{c.code}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to={`/admin/colleges/${c._id}`} className="p-2 text-indigo-400 hover:bg-zinc-700 rounded-lg" title="Manage"><FiChevronRight size={16} /></Link>
              <button onClick={() => openEdit(c)} className="p-2 text-blue-400 hover:bg-zinc-700 rounded-lg"><FiEdit2 size={16} /></button>
              <button onClick={() => handleDelete(c._id)} className="p-2 text-red-400 hover:bg-zinc-700 rounded-lg"><FiTrash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
