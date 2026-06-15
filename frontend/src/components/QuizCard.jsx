import { Link } from 'react-router-dom';
import { FiClock, FiList } from 'react-icons/fi';

export default function QuizCard({ resource, questionCount }) {
  return (
    <div className="bg-zinc-800 rounded-xl shadow-md p-5 card-hover border border-zinc-700">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-lg text-white">{resource?.title || 'Quiz'}</h3>
        <span className="bg-indigo-900/50 text-indigo-300 text-xs px-2 py-1 rounded-full capitalize">
          {resource?.type || 'quiz'}
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm text-zinc-400 mb-4">
        <span className="flex items-center gap-1"><FiList size={14} /> {questionCount || 0} Questions</span>
        <span className="flex items-center gap-1"><FiClock size={14} /> Timed</span>
      </div>
      <Link
        to={`/quiz/${resource?._id}`}
        className="block w-full text-center bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-500 btn-glow"
      >
        Take Quiz
      </Link>
    </div>
  );
}
