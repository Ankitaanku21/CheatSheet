import { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiHome, FiRefreshCw, FiArrowLeft, FiAlertCircle, FiStar } from 'react-icons/fi';

const COLORS = {
  easy: 'bg-green-100 text-green-700 border-green-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  hard: 'bg-red-100 text-red-700 border-red-300',
};

function fmt(n) {
  if (n == null) return '0';
  return n % 1 === 0 ? n.toString() : n.toFixed(1);
}

export default function QuizResult() {
  const location = useLocation();
  const result = location.state;

  const breakdown = useMemo(() => {
    if (!result) return null;
    if (result.mcqScore != null) {
      return {
        mcqScore: result.mcqScore,
        mcqTotal: result.mcqTotal ?? result.totalQuestions,
        subjectiveScore: result.subjectiveScore ?? 0,
        subjectiveTotal: result.subjectiveTotal ?? 0,
        totalScore: result.totalScore ?? result.score,
        totalQuestions: result.totalQuestions,
        percentage: result.percentage,
        grade: result.grade,
      };
    }
    const answers = result.answers || [];
    const mcqScore = Math.min(
      answers.reduce((s, a) => {
        if (a.isCorrect == null) return s;
        return s + (a.marksAwarded ?? (a.isCorrect ? 1 : 0));
      }, 0),
      result.totalQuestions
    );
    const subjectiveScore = Math.min(
      answers.reduce((s, a) => {
        if (a.isCorrect != null) return s;
        return s + (a.marksAwarded ?? 0);
      }, 0),
      result.totalQuestions
    );
    const totalScore = Math.min(mcqScore + subjectiveScore, result.totalQuestions);
    const percentage = result.totalQuestions > 0 ? Math.min(Math.round((totalScore / result.totalQuestions) * 100), 100) : 0;
    const grade = percentage >= 90 ? 'A+' : percentage >= 75 ? 'A' : percentage >= 60 ? 'B' : percentage >= 40 ? 'C' : 'F';
    return { mcqScore, subjectiveScore, totalScore, percentage, grade };
  }, [result]);

  if (!result || !breakdown) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400">No result data found.</p>
        <Link to="/quiz" className="back-btn mt-4"><FiArrowLeft size={16} /> Go to Quizzes</Link>
      </div>
    );
  }

  const { mcqScore, mcqTotal, subjectiveScore, subjectiveTotal, totalScore, totalQuestions, percentage, grade } = breakdown;
  const gradeColor = percentage >= 60 ? 'text-green-400' : percentage >= 40 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/quiz" className="back-btn mb-4">
        <FiArrowLeft size={16} /> Back to Quizzes
      </Link>

      <div className="bg-zinc-800 rounded-xl shadow-lg p-8 text-center mb-8 card-hover border border-zinc-700">
        <div className={`text-6xl font-bold ${gradeColor} mb-4`}>{grade}</div>
        <h1 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 my-6 max-w-md mx-auto">
          <div className="bg-zinc-900 rounded-lg p-3">
            <div className="text-lg font-bold text-white">{fmt(mcqScore)}/{mcqTotal ?? totalQuestions}</div>
            <div className="text-xs text-zinc-400">MCQ</div>
          </div>
          <div className="bg-zinc-900 rounded-lg p-3">
            <div className="text-lg font-bold text-white">{fmt(subjectiveScore)}/{subjectiveTotal ?? 0}</div>
            <div className="text-xs text-zinc-400">Subjective</div>
          </div>
          <div className="bg-indigo-900/30 rounded-lg p-3 ring-1 ring-indigo-500/50">
            <div className={`text-lg font-bold ${gradeColor}`}>{fmt(totalScore)}/{totalQuestions}</div>
            <div className="text-xs text-zinc-400">Total</div>
          </div>
        </div>
        <p className="text-sm text-zinc-400 mb-4">Accuracy: {percentage}%</p>

        <div className="flex justify-center gap-4">
          <Link to="/quiz" className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-500 btn-glow">
            <FiHome size={16} /> Quizzes
          </Link>
          <Link to="/quiz" className="flex items-center gap-2 bg-zinc-700 text-zinc-200 px-6 py-2 rounded-lg hover:bg-zinc-600 transition">
            <FiRefreshCw size={16} /> Retry
          </Link>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-white mb-4">Review Answers</h2>
      <div className="space-y-4">
        {result.answers?.map((a, i) => {
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