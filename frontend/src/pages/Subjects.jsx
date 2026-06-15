import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { useSelector } from 'react-redux';
import { FiFileText, FiPlus } from 'react-icons/fi';
import PageHero from '../components/PageHero';
import toast from 'react-hot-toast';

export default function Subjects() {
  const { collegeId, branchId, semesterId } = useParams();
  const { user } = useSelector((s) => s.auth);
  const [subjects, setSubjects] = useState([]);
  const [branch, setBranch] = useState(null);
  const [semester, setSemester] = useState(null);
  const [type, setType] = useState('notes');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', code: '' });

  const isOwnCollege = user?.college?._id === collegeId || user?.college === collegeId;

  useEffect(() => {
    API.get(`/subjects?semester=${semesterId}`).then((r) => setSubjects(r.data)).catch(() => {});
    API.get(`/branches/${branchId}`).then((r) => setBranch(r.data)).catch(() => {});
    API.get(`/semesters/${semesterId}`).then((r) => setSemester(r.data)).catch(() => {});
  }, [branchId, semesterId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/subjects', { ...form, branch: branchId, semester: semesterId, college: collegeId });
      setSubjects((prev) => [...prev, res.data]);
      setShowForm(false);
      setForm({ name: '', code: '' });
      toast.success('Subject created');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create subject');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <PageHero
        backLink={`/college/${collegeId}/branch/${branchId}`}
        backText="Back to Semesters"
        title={`${branch?.name} - ${semester?.name || 'Subjects'}`}
        subtitle="Select a subject"
        actions={isOwnCollege ? (
          <button onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-indigo-500/20 backdrop-blur-sm active:scale-95">
            <FiPlus size={18} strokeWidth={2.5} /> Add Subject
          </button>
        ) : null}
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-zinc-800 rounded-xl shadow-md p-6 mb-6 max-w-lg mx-auto space-y-4 border border-zinc-700">
          <input placeholder="Subject Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 placeholder-zinc-500" required />
          <input placeholder="Code (optional)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="w-full px-4 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 placeholder-zinc-500" />
          <div className="flex gap-3">
            <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-500 btn-glow">Create</button>
            <button type="button" onClick={() => { setShowForm(false); setForm({ name: '', code: '' }); }}
              className="bg-zinc-700 text-zinc-200 px-6 py-2 rounded-lg hover:bg-zinc-600">Cancel</button>
          </div>
        </form>
      )}

      <div className="flex justify-center gap-4 mb-8 flex-wrap">
        <button onClick={() => setType('notes')}
          className={`px-6 py-2 rounded-lg font-medium transition ${type === 'notes' ? 'bg-indigo-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}>
          Notes
        </button>
        <button onClick={() => setType('pyq')}
          className={`px-6 py-2 rounded-lg font-medium transition ${type === 'pyq' ? 'bg-indigo-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}>
          PYQs
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {subjects.map((subject) => (
          <Link key={subject._id} to={`/resources/${subject._id}?type=${type}`}
            className="bg-zinc-800 rounded-xl shadow-md p-6 card-hover border border-zinc-700">
            <div className="w-14 h-14 bg-indigo-900/50 text-indigo-300 rounded-xl flex items-center justify-center mb-4">
              <FiFileText size={28} />
            </div>
            <h2 className="text-lg font-semibold text-white">{subject.name}</h2>
            {subject.code && <p className="text-sm text-zinc-500">{subject.code}</p>}
          </Link>
        ))}
      </div>
      {subjects.length === 0 && (
        <div className="text-center mt-8">
          <p className="text-zinc-500">No subjects yet for this semester.</p>
          {isOwnCollege && <p className="text-zinc-500 mt-1">Click the <strong className="text-zinc-300">Add</strong> button above to create the first subject!</p>}
        </div>
      )}
    </div>
  );
}
