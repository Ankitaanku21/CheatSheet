import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../services/api';
import { FiFileText, FiSearch } from 'react-icons/fi';
import PageHero from '../../components/PageHero';

export default function QuizSubjects() {
  const { semesterId } = useParams();
  const [subjects, setSubjects] = useState([]);
  const [semester, setSemester] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [subjRes, semRes] = await Promise.all([
          API.get(`/subjects?semester=${semesterId}`),
          API.get(`/semesters/${semesterId}`),
        ]);
        setSubjects(subjRes.data);
        setSemester(semRes.data);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetch();
  }, [semesterId]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return subjects.filter(
      (s) => !q || s.name.toLowerCase().includes(q) || (s.code && s.code.toLowerCase().includes(q))
    );
  }, [subjects, search]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <PageHero
        backLink={semester ? `/quiz/branch/${semester.branch?._id || semester.branch}` : undefined}
        backText="Back to Semesters"
        title={semester?.name || 'Select Subject'}
        subtitle="Choose a subject to start the quiz"
      />

      <div className="max-w-md mx-auto mb-8 relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
        <input
          type="text"
          placeholder="Search subjects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-zinc-900 text-white placeholder-zinc-500"
        />
      </div>

      {loading ? (
        <p className="text-center text-zinc-400 py-8">Loading subjects...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((subject) => (
            <Link
              key={subject._id}
              to={`/quiz/subject/${subject._id}`}
              className="bg-zinc-800 rounded-xl shadow-md p-6 card-hover border border-zinc-700"
            >
              <div className="w-14 h-14 bg-indigo-900/50 text-indigo-300 rounded-xl flex items-center justify-center mb-4">
                <FiFileText size={28} />
              </div>
              <h2 className="text-lg font-semibold text-white">{subject.name}</h2>
              {subject.code && <p className="text-sm text-zinc-500">{subject.code}</p>}
            </Link>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <p className="text-center text-zinc-500 py-8">
          {search ? 'No subjects match your search.' : 'No subjects found for this semester.'}
        </p>
      )}
    </div>
  );
}