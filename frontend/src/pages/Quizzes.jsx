import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { FiFileText, FiClock, FiList } from 'react-icons/fi';
import PageHero from '../components/PageHero';

export default function Quizzes() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questionCounts, setQuestionCounts] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get('/resources', { params: { type: 'pyq' } });
        setResources(res.data);
        const counts = {};
        await Promise.all(res.data.map(async (r) => {
          try {
            const qRes = await API.get('/quizzes/questions/quiz', { params: { resource: r._id } });
            if (qRes.data.length > 0) counts[r._id] = qRes.data.length;
          } catch {}
        }));
        setQuestionCounts(counts);
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const quizzed = resources.filter((r) => questionCounts[r._id]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <PageHero
        backLink="/colleges"
        backText="Back to Colleges"
        title="Quizzes"
        subtitle="Test your knowledge with AI-generated quizzes from PYQs"
      />

      {loading ? (
        <p className="text-center text-zinc-400 py-12">Loading quizzes...</p>
      ) : quizzed.length === 0 ? (
        <div className="text-center py-12">
          <FiFileText size={48} className="mx-auto text-zinc-600 mb-4" />
          <p className="text-zinc-400 mb-4">No quizzes available yet. Quizzes are generated from PYQs.</p>
          <Link to="/branches" className="text-indigo-400 hover:underline">Browse PYQs to create quizzes</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {quizzed.map((r) => (
            <Link key={r._id} to={`/quiz/${r._id}`}
              className="bg-zinc-800 rounded-xl shadow-md p-6 card-hover border border-zinc-700">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg text-white">{r.title}</h3>
                <span className="bg-orange-900/50 text-orange-300 text-xs px-2 py-1 rounded-full">PYQ</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-zinc-400 mb-4">
                <span className="flex items-center gap-1"><FiList size={14} /> {questionCounts[r._id]} Questions</span>
                <span className="flex items-center gap-1"><FiClock size={14} /> Timed</span>
              </div>
              <div className="w-full text-center bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-500 btn-glow">
                Take Quiz
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
