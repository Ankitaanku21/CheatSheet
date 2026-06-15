import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../services/api';
import { FiBook } from 'react-icons/fi';
import PageHero from '../../components/PageHero';

export default function QuizSemesters() {
  const { branchId } = useParams();
  const [semesters, setSemesters] = useState([]);
  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [semRes, branchRes] = await Promise.all([
          API.get(`/semesters?branch=${branchId}`),
          API.get(`/branches/${branchId}`),
        ]);
        setSemesters(semRes.data);
        setBranch(branchRes.data);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetch();
  }, [branchId]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <PageHero
        backLink="/quiz"
        backText="Back to Branches"
        title={branch?.name || 'Select Semester'}
        subtitle="Choose your semester"
      />

      {loading ? (
        <p className="text-center text-zinc-400 py-8">Loading semesters...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {semesters.map((s) => (
            <Link
              key={s._id}
              to={`/quiz/semester/${s._id}`}
              className="bg-zinc-800 rounded-xl shadow-md p-8 card-hover text-center border border-zinc-700"
            >
              <div className="w-16 h-16 bg-indigo-900/50 text-indigo-300 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FiBook size={30} />
              </div>
              <h2 className="text-xl font-semibold text-white">{s.name}</h2>
              <p className="text-sm text-zinc-500 mt-1">Year {s.year}</p>
            </Link>
          ))}
        </div>
      )}

      {!loading && semesters.length === 0 && (
        <p className="text-center text-zinc-500 py-8">No semesters found for this branch.</p>
      )}
    </div>
  );
}