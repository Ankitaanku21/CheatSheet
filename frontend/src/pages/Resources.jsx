import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../services/api';
import ResourceCard from '../components/ResourceCard';
import QuizCard from '../components/QuizCard';
import { FiUpload, FiSearch, FiX, FiFile } from 'react-icons/fi';
import PageHero from '../components/PageHero';
import toast from 'react-hot-toast';

export default function Resources() {
  const { subjectId } = useParams();
  const { user } = useSelector((s) => s.auth);
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'notes';
  const [resources, setResources] = useState([]);
  const [subject, setSubject] = useState(null);
  const college = subject?.college?._id || subject?.college;
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', file: null });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const [questionCounts, setQuestionCounts] = useState({});

  useEffect(() => {
    const params = { subject: subjectId, type };
    if (search) params.search = search;
    API.get('/resources', { params }).then((r) => setResources(r.data)).catch(() => {});
    API.get(`/subjects/${subjectId}`).then((r) => setSubject(r.data)).catch(() => {});
  }, [subjectId, type, search]);

  useEffect(() => {
    resources.forEach(async (r) => {
      try {
        const res = await API.get('/quizzes/questions/quiz', { params: { resource: r._id } });
        if (res.data.length > 0) {
          setQuestionCounts((prev) => ({ ...prev, [r._id]: res.data.length }));
        }
      } catch {}
    });
  }, [resources]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) return toast.error('Select a file');
    console.log('[Upload] Starting upload for:', uploadForm.file.name, 'size:', uploadForm.file.size, 'type:', uploadForm.file.type);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', uploadForm.file);
      console.log('[Upload] Sending to POST /api/upload');
      const uploadRes = await API.post('/upload', fd);
      console.log('[Upload] Upload success:', uploadRes.data);
      const { url, size } = uploadRes.data;
      console.log('[Upload] Creating resource with URL:', url);
      await API.post('/resources', {
        title: uploadForm.title, fileUrl: url, fileSize: size,
        type, subject: subjectId,
        college: subject?.college?._id || subject?.college || undefined,
        branch: subject?.branch?._id || '',
        semester: subject?.semester?._id || undefined,
        year: subject?.year || undefined
      });
      toast.success('Resource uploaded');
      setShowUpload(false);
      setUploadForm({ title: '', file: null });
      if (fileRef.current) fileRef.current.value = '';
      const params = { subject: subjectId, type };
      const res = await API.get('/resources', { params });
      setResources(res.data);
    } catch (err) {
      console.error('[Upload] FAILED:', err);
      const msg = err.response?.data?.message || err.message || 'Upload failed';
      const status = err.response?.status || '';
      toast.error(`${msg} (${status})`);
    } finally { setUploading(false); }
  };

  const isOwnCollege = subject && (user?.college?._id === college || user?.college === college);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <PageHero
        backLink={`/college/${subject?.college?._id || subject?.college}/branch/${subject?.branch?._id}/semester/${subject?.semester?._id}/subjects`}
        backText="Back to Subjects"
        title={subject?.name || 'Resources'}
        subtitle={`${type}${subject?.branch?.name ? ` - ${subject.branch.name}` : ''}${subject?.semester?.name ? ` - ${subject.semester.name}` : subject?.year ? ` Year ${subject.year}` : ''}`}
        actions={
          <div className="flex items-center gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-zinc-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-36 sm:w-48 bg-white/10 text-white placeholder-zinc-400" />
              {search && <FiX onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 cursor-pointer" size={18} />}
            </div>
            {isOwnCollege && (
              <button onClick={() => setShowUpload(true)}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-indigo-500/20 backdrop-blur-sm active:scale-95">
                <FiUpload size={16} /> Upload
              </button>
            )}
          </div>
        }
      />

      {showUpload && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowUpload(false)}>
          <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-md border border-zinc-700" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-4">Upload {type === 'notes' ? 'Notes' : 'PYQ'}</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <input placeholder="Title" required value={uploadForm.title} onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 placeholder-zinc-500" />
              <div>
                <label className="flex items-center gap-2 border-2 border-dashed border-zinc-600 rounded-lg p-4 cursor-pointer hover:border-indigo-400 transition">
                  <FiFile className="text-zinc-400" size={20} />
                  <span className="text-sm text-zinc-400">
                    {uploadForm.file ? uploadForm.file.name : 'Select PDF or DOCX file'}
                  </span>
                  <input ref={fileRef} type="file" accept=".pdf,.docx" required
                    onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                    className="hidden" />
                </label>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={uploading}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition">
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
                <button type="button" onClick={() => { setShowUpload(false); setUploadForm({ title: '', file: null }); if (fileRef.current) fileRef.current.value = ''; }}
                  className="bg-zinc-700 text-zinc-200 px-4 py-2 rounded-lg hover:bg-zinc-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {resources.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-zinc-300 mb-4">Quizzes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {resources.filter(r => questionCounts[r._id]).map((r) => (
              <QuizCard key={r._id} resource={r} questionCount={questionCounts[r._id]} />
            ))}
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold text-zinc-300 mb-4">{type === 'notes' ? 'Notes' : 'PYQs'}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {resources.map((r) => (
          <ResourceCard key={r._id} resource={r} onUpdate={() => {
            const params = { subject: subjectId, type };
            API.get('/resources', { params }).then((res) => setResources(res.data));
          }} />
        ))}
      </div>
      {resources.length === 0 && (
        <p className="text-center text-zinc-500 py-12">No {type} found. Upload the first one!</p>
      )}
    </div>
  );
}
