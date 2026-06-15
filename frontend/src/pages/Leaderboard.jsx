import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLeaderboard } from '../redux/quizSlice';
import RatingBadge from '../components/RatingBadge';
import { Link } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import PageHero from '../components/PageHero';

const medals = [
  <FiStar key={0} className="text-yellow-500" size={24} fill="currentColor" />,
  <FiStar key={1} className="text-zinc-400" size={22} fill="currentColor" />,
  <FiStar key={2} className="text-amber-700" size={20} fill="currentColor" />,
];

export default function Leaderboard() {
  const dispatch = useDispatch();
  const { leaderboard, leaderboardLoading } = useSelector((s) => s.quiz);

  useEffect(() => {
    dispatch(fetchLeaderboard());
  }, [dispatch]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHero
        backLink="/"
        backText="Back to Home"
        title="Leaderboard"
        subtitle="Top quiz performers"
      />

      {leaderboardLoading ? (
        <p className="text-center text-zinc-400 py-12">Loading leaderboard...</p>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-400">No data yet. Take some quizzes to appear on the leaderboard!</p>
        </div>
      ) : (
        <div className="bg-zinc-800 rounded-xl shadow-lg overflow-hidden border border-zinc-700">
          {leaderboard.map((user, i) => (
            <div key={user._id} className={`flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4 transition hover:bg-zinc-700 ${i % 2 === 0 ? 'bg-zinc-800' : 'bg-zinc-900'} ${i < 3 ? 'border-l-4 border-l-indigo-500' : ''}`}>
              <div className="w-10 text-center font-bold text-zinc-400 text-lg">
                {i < 3 ? medals[i] : `#${i + 1}`}
              </div>
              <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center text-sm font-bold text-zinc-300">
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">{user.name}</p>
                {user.college && <p className="text-xs text-zinc-500">{user.college}</p>}
              </div>
              <div className="flex items-center gap-2 sm:gap-4 text-sm flex-wrap justify-end">
                <RatingBadge rating={user.quizStats?.rating || 0} size={16} />
                <div className="text-center min-w-[40px] sm:min-w-[48px]">
                  <p className="font-bold text-white">{user.quizStats?.averageScore || 0}%</p>
                  <p className="text-xs text-zinc-500">Acc</p>
                </div>
                <div className="text-center min-w-[32px] sm:min-w-[36px]">
                  <p className="font-bold text-white">
                    {user.quizStats?.totalCorrect != null
                      ? (user.quizStats.totalCorrect % 1 === 0
                        ? user.quizStats.totalCorrect
                        : user.quizStats.totalCorrect.toFixed(1))
                      : 0}
                  </p>
                  <p className="text-xs text-zinc-500">Score</p>
                </div>
                <div className="text-center min-w-[28px] sm:min-w-[32px]">
                  <p className="font-bold text-white">{user.quizStats?.totalQuizzes || 0}</p>
                  <p className="text-xs text-zinc-500">Qz</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
