import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import API from '../../services/api';
import { FiCpu, FiMonitor, FiRadio, FiZap, FiSettings } from 'react-icons/fi';
import PageHero from '../../components/PageHero';

const icons = [FiCpu, FiMonitor, FiRadio, FiZap, FiSettings];
const colors = [
  'bg-blue-900/50 text-blue-300',
  'bg-green-900/50 text-green-300',
  'bg-purple-900/50 text-purple-300',
  'bg-orange-900/50 text-orange-300',
  'bg-pink-900/50 text-pink-300',
];

export default function QuizBranches() {
  const { user } = useSelector((s) => s.auth);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  const collegeId = user?.college?._id;

  useEffect(() => {
    if (!collegeId) return;
    API.get(`/branches?college=${collegeId}`)
      .then((r) => setBranches(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [collegeId]);

  if (!collegeId) return <Navigate to="/colleges" replace />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <PageHero
        backLink="/"
        backText="Back to Home"
        title={user.college?.name || 'Your College'}
        subtitle="Select your branch to start a quiz"
      />

      {loading ? (
        <div className="text-center py-12 text-zinc-400">Loading branches...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {branches.map((branch, i) => {
            const Icon = icons[i % icons.length];
            const color = colors[i % colors.length];
            return (
              <Link
                key={branch._id}
                to={`/quiz/branch/${branch._id}`}
                className="bg-zinc-800 rounded-xl shadow-md p-6 card-hover border border-zinc-700"
              >
                <div className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center mb-4`}>
                  <Icon size={28} />
                </div>
                <h2 className="text-xl font-semibold text-white">{branch.name}</h2>
                <p className="text-sm text-zinc-400 mt-1">{branch.code}</p>
              </Link>
            );
          })}
        </div>
      )}

      {!loading && branches.length === 0 && (
        <p className="text-center text-zinc-500 mt-8">No branches found for your college.</p>
      )}
    </div>
  );
}