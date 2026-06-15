import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAttemptById } from '../services/quizService';
import { FiCheckCircle, FiXCircle, FiHome, FiArrowLeft, FiAlertCircle, FiClock, FiStar } from 'react-icons/fi';

const COLORS = {
  easy: 'bg-green-100 text-green-700 border-green-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  hard: 'bg-red-100 text-red-700 border-red-300',
};

function fmt(n) {
  if (n == null) return '0';
  return n % 1 === 0 ? n.toString() : n.toFixed(1);
}

export default function AttemptDetail() {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getAttemptById(attemptId);
        setAttempt(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load attempt');
      } finally {
        setLoading(false);
      }
    })();
  }, [attemptId]);

  const breakdown = useMemo(() => {
    if (!attempt) return null;
    if (attempt.mcqScore != null) {
      return {
        mcqScore: attempt.mcqScore,
        subjectiveScore: attempt.subjectiveScore ?? 0,
        totalScore: attempt.score,
        percentage: attempt.percentage,
        grade: attempt.grade,
      };
    }
    const answers = attempt.answers || [];
    const mcqScore = Math.min(
      answers.reduce((s, a) => {
        if (a.isCorrect == null) return s;
        return s + (a.marksAwarded ?? (a.isCorrect ? 1 : 0));
      }, 0),
      attempt.totalQuestions
    );
    const subjectiveScore = Math.min(
      answers.reduce((s, a) => {
        if (a.isCorrect != null) return s;
        return s + (a.marksAwarded ?? 0);
      }, 0),
      attempt.totalQuestions
    );
    const totalScore = Math.min(mcqScore + subjectiveScore, attempt.totalQuestions);
    const percentage = attempt.totalQuestions > 0 ? Math.min(Math.round((totalScore / attempt.totalQuestions) * 100), 100) : 0;
    const grade = percentage >= 90 ? 'A+' : percentage >= 75 ? 'A' : percentage >= 60 ? 'B' : percentage >= 40 ? 'C' : 'F';
    return { mcqScore, subjectiveScore, totalScore, percentage, grade };
  }, [attempt]);

  if (loading) return <div className="text-center py-12 text-zinc-400">Loading attempt...</div>;
  if (error) return (
    <div className="text-center py-12">
      <p className="text-red-400">{error}</p>
      <Link to="/profile" className="back-btn mt-4"><FiArrowLeft size={16} /> Back to Profile</Link>
    </div>
  );
  if (!attempt || !breakdown) return null;

  const { mcqScore, subjectiveScore, totalScore, percentage, grade } = breakdown;
  const mcqTotal = attempt.answers?.filter((a) => a.isCorrect != null).length ?? 0;
  const subjectiveTotal = attempt.answers?.filter((a) => a.isCorrect == null).length ?? 0;
  const gradeColor = percentage >= 60 ? 'text-green-400' : percentage >= 40 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/profile" className="back-btn mb-4">
        <FiArrowLeft size={16} /> Back to Profile
      </Link>

      <div className="bg-zinc-800 rounded-xl shadow-lg p-8 text-center mb-8 card-hover border border-zinc-700">
        <div className={`text-6xl font-bold ${gradeColor} mb-4`}>{grade}</div>
        <h1 className="text-2xl font-bold text-white mb-1">{attempt.resource?.title || 'Quiz Attempt'}</h1>
        {attempt.subject?.name && (
          <p className="text-zinc-400 text-sm">{attempt.subject.name}</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 my-6 max-w-lg mx-auto">
          <div className="bg-zinc-900 rounded-lg p-3">
            <div className="text-lg font-bold text-white">{fmt(mcqScore)}/{mcqTotal}</div>
            <div className="text-xs text-zinc-400">MCQ</div>
          </div>
          <div className="bg-zinc-900 rounded-lg p-3">
            <div className="text-lg font-bold text-white">{fmt(subjectiveScore)}/{subjectiveTotal}</div>
            <div className="text-xs text-zinc-400">Subjective</div>
          </div>
          <div className="bg-indigo-900/30 rounded-lg p-3 ring-1 ring-indigo-500/50">
            <div className={`text-lg font-bold ${gradeColor}`}>{fmt(totalScore)}/{attempt.totalQuestions}</div>
            <div className="text-xs text-zinc-400">Total</div>
          </div>
          <div className="bg-zinc-900 rounded-lg p-3">
            <div className="text-lg font-bold text-white flex items-center justify-center gap-1">
              <FiClock size={16} className="text-zinc-400" />
              {attempt.timeTaken ? `${Math.round(attempt.timeTaken / 60)}m` : '--'}
            </div>
            <div className="text-xs text-zinc-400">Time</div>
          </div>
        </div>

        <p className="text-sm text-zinc-400 mb-1">Accuracy: {percentage}%</p>
        <p className="text-sm text-zinc-500">{new Date(attempt.createdAt).toLocaleString()}</p>
      </div>

      <h2 className="text-lg font-semibold text-white mb-4">Review Answers</h2>
      <div className="space-y-4">
        {attempt.answers?.map((a, i) => {
          const q = a.questionId;
          if (!q) return null;
          const isSubjective = q.type === 'subjective';
          return (
            <div key={i} className={`bg-zinc-800 rounded-xl shadow p-5 card-hover border-l-4 ${
              isSubjective
                ? 'border-l-blue-500'
                : a.isCorrect
                  ? 'border-l-green-500'
                  : 'border-l-red-500'
            }`}>
              <div className="flex items-start gap-3">
                {isSubjective ? (
                  <FiAlertCircle className="text-blue-400 mt-1 shrink-0" size={20} />
                ) : a.isCorrect ? (
                  <FiCheckCircle className="text-green-400 mt-1 shrink-0" size={20} />
                ) : (
                  <FiXCircle className="text-red-400 mt-1 shrink-0" size={20} />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${COLORS[q.difficulty] || COLORS.medium}`}>
                      {q.difficulty || 'medium'}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      isSubjective ? 'bg-blue-900/50 text-blue-300' : 'bg-purple-900/50 text-purple-300'
                    }`}>
                      {isSubjective ? q.questionType || 'subjective' : 'MCQ'}
                    </span>
                    {isSubjective && a.marksAwarded != null && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        a.marksAwarded >= 0.7 ? 'bg-green-900/50 text-green-300' : a.marksAwarded >= 0.4 ? 'bg-yellow-900/50 text-yellow-300' : 'bg-red-900/50 text-red-300'
                      }`}>
                        {a.marksAwarded === 1 ? '1/1' : fmt(a.marksAwarded) + '/1'}
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-white">{q.questionText || 'Question'}</p>

                  {!isSubjective && q.options?.map((opt, j) => (
                    <p key={j} className={`text-sm px-3 py-1 rounded mt-1 ${
                      q.correctAnswer === j
                        ? 'bg-green-900/30 text-green-300'
                        : a.selectedAnswer === j
                          ? 'bg-red-900/30 text-red-300'
                          : 'text-zinc-400'
                    }`}>
                      {String.fromCharCode(65 + j)}. {opt} {q.correctAnswer === j && '✓'}
                    </p>
                  ))}

                  {isSubjective && (
                    <div className="mt-2 space-y-2">
                      <div>
                        <p className="text-xs text-zinc-400 font-medium">Your answer:</p>
                        <p className="text-sm text-zinc-300 bg-zinc-900 rounded p-2">{a.selectedAnswer || '(not answered)'}</p>
                      </div>
                      {q.expectedAnswer && (
                        <div>
                          <p className="text-xs text-green-400 font-medium">Expected answer:</p>
                          <p className="text-sm text-green-300 bg-green-900/20 rounded p-2">{q.expectedAnswer}</p>
                        </div>
                      )}
                      {a.aiFeedback && (
                        <div className="flex items-start gap-2 bg-indigo-900/20 rounded-lg p-3 mt-2">
                          <FiStar size={14} className="text-indigo-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-indigo-400 font-medium">AI Feedback</p>
                            <p className="text-sm text-indigo-300">{a.aiFeedback}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {q.explanation && (
                    <p className="text-sm text-zinc-400 mt-2 italic">{q.explanation}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
