import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import API from '../../services/api';
import PageHero from '../../components/PageHero';

export default function AdminDashboard() {
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState({ processed: 0, remaining: 0, total: 0 });
  const [logs, setLogs] = useState([]);
  const [done, setDone] = useState(false);

  const runMigration = async () => {
    setMigrating(true);
    setLogs([]);
    setDone(false);
    setProgress({ processed: 0, remaining: 0, total: 0 });

    let keepGoing = true;
    while (keepGoing) {
      try {
        const res = await API.post('/quizzes/migrate');
        const { processed, remaining, total, finalBatch, message } = res.data;
        setProgress({ processed, remaining, total });
        if (message) {
          setLogs((prev) => [...prev, message]);
        } else {
          setLogs((prev) => [...prev, `Batch processed: ${processed} attempts updated, ${remaining} remaining`]);
        }
        if (finalBatch || remaining === 0) {
          keepGoing = false;
          setDone(true);
        }
      } catch (err) {
        const msg = err.response?.data?.message || 'Migration failed';
        setLogs((prev) => [...prev, `Error: ${msg}`]);
        keepGoing = false;
      }
    }
    setMigrating(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <PageHero
        backLink="/"
        backText="Back to Home"
        title="Admin Dashboard"
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link to="/admin/colleges"
          className="bg-zinc-800 rounded-xl shadow-md p-8 card-hover text-center border border-zinc-700">
          <div className="w-16 h-16 bg-red-600 text-white rounded-xl flex items-center justify-center mx-auto mb-4">
            <FiHome size={30} />
          </div>
          <h2 className="text-lg font-semibold text-white">Manage Colleges</h2>
        </Link>
      </div>

      <div className="mt-8 bg-zinc-800 rounded-xl shadow-md p-8 border border-zinc-700">
        <h2 className="text-xl font-semibold text-white mb-2">Migrate Quiz Scores</h2>
        <p className="text-sm text-zinc-400 mb-6">
          Re-evaluates subjective answers in historical quiz attempts and recalculates scores &amp; leaderboard.
        </p>

        {progress.total > 0 && (
          <div className="mb-4 flex items-center gap-3 text-sm">
            <span className="text-zinc-400">Progress:</span>
            <div className="flex-1 bg-zinc-700 rounded-full h-2 max-w-xs">
              <div className="bg-indigo-500 rounded-full h-2 transition-all"
                style={{ width: `${progress.total > 0 ? ((progress.total - progress.remaining) / progress.total) * 100 : 0}%` }} />
            </div>
            <span className="text-zinc-300">{progress.total - progress.remaining}/{progress.total}</span>
          </div>
        )}

        <button onClick={runMigration} disabled={migrating}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed btn-glow">
          <FiRefreshCw size={16} className={migrating ? 'animate-spin' : ''} />
          {migrating ? 'Migrating...' : done ? 'Re-run Migration' : 'Run Migration'}
        </button>

        {logs.length > 0 && (
          <div className="mt-6 space-y-1">
            {logs.map((msg, i) => (
              <p key={i} className={`text-sm flex items-center gap-2 ${msg.startsWith('Error') ? 'text-red-400' : msg.startsWith('All') ? 'text-green-400' : 'text-zinc-400'}`}>
                {msg.startsWith('Error') ? null : <FiCheckCircle size={12} className="shrink-0" />}
                {msg}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
