import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import API from '../../services/api';
import { submitQuizAttempt } from '../../redux/quizSlice';
import { fetchMe } from '../../redux/authSlice';
import { FiArrowLeft, FiSettings, FiZap, FiSend, FiClock, FiList, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const COLORS = {
  easy: 'bg-green-900/50 text-green-300 border-green-700',
  medium: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
  hard: 'bg-red-900/50 text-red-300 border-red-700',
};

export default function QuizPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { questionsLoading } = useSelector((s) => s.quiz);

  const [subject, setSubject] = useState(null);
  const [pyqCount, setPyqCount] = useState(0);

  // Step 1: configure
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(10);

  // Step 2: generated questions
  const [questions, setQuestions] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  // Step 3: taking quiz
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [subjRes, pyqRes] = await Promise.all([
          API.get(`/subjects/${subjectId}`),
          API.get('/resources', { params: { subject: subjectId, type: 'pyq' } }),
        ]);
        setSubject(subjRes.data);
        setPyqCount(pyqRes.data.length);
      } catch {
        toast.error('Failed to load subject');
      }
    };
    fetch();
  }, [subjectId]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await API.post('/quizzes/generate-subject', {
        subjectId,
        numQuestions,
        difficulty,
      });
      setQuestions(res.data.questions);
      setGenerated(true);
      toast.success(`Generated ${res.data.count} questions!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate quiz');
    } finally {
      setGenerating(false);
    }
  };

  const handleStart = () => {
    setStarted(true);
    setStartTime(Date.now());
  };

  const selectAnswer = (questionId, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { selectedAnswer: optionIndex } }));
  };

  const setTextAnswer = (questionId, text) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { textAnswer: text } }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const answersArray = Object.entries(answers).map(([questionId, ans]) => ({
      questionId,
      selectedAnswer: ans.selectedAnswer ?? -1,
      textAnswer: ans.textAnswer || '',
    }));
    const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    try {
      const res = await API.post('/quizzes/submit', {
        subject: subjectId,
        answers: answersArray,
        timeTaken,
      });
      setResult(res.data);
      // Refresh quiz stats
      dispatch(fetchMe());
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    const grade =
      result.percentage >= 90
        ? 'A+'
        : result.percentage >= 75
          ? 'A'
          : result.percentage >= 60
            ? 'B'
            : result.percentage >= 40
              ? 'C'
              : 'F';
    const gradeColor =
      result.percentage >= 60
        ? 'text-green-600'
        : result.percentage >= 40
          ? 'text-yellow-600'
          : 'text-red-600';

    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        {subject?.semester?._id ? (
          <Link to={`/quiz/semester/${subject.semester._id}`} className="back-btn mb-4">
            <FiArrowLeft size={16} /> Back to Subjects
          </Link>
        ) : (
          <Link to="/quiz" className="back-btn mb-4">
            <FiArrowLeft size={16} /> Back to Quizzes
          </Link>
        )}

        <div className="bg-zinc-800 rounded-xl shadow-lg p-8 text-center mb-8 card-hover border border-zinc-700">
          <div className={`text-6xl font-bold ${gradeColor} mb-4`}>{grade}</div>
          <h1 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h1>
          <p className="text-sm text-zinc-400 mb-2">{subject?.name}</p>
          <div className="flex items-center justify-center gap-8 my-6">
            <div>
              <div className="text-3xl font-bold text-white">{result.score}/{result.objectiveTotal}</div>
              <div className="text-sm text-zinc-400">MCQ Score</div>
            </div>
            <div className="w-px h-12 bg-zinc-700" />
            <div>
              <div className={`text-3xl font-bold ${gradeColor}`}>{result.percentage}%</div>
              <div className="text-sm text-zinc-400">Accuracy</div>
            </div>
            <div className="w-px h-12 bg-zinc-700" />
            <div>
              <div className="text-3xl font-bold text-white">{result.subjectiveTotal}</div>
              <div className="text-sm text-zinc-400">Subjective</div>
            </div>
          </div>
          <div className="flex justify-center gap-3">
              <button onClick={() => { setGenerated(false); setStarted(false); setQuestions([]); setAnswers({}); setResult(null); }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 btn-glow text-sm">Try Again</button>
            <Link to="/quiz" className="px-4 py-2 bg-zinc-700 text-zinc-200 rounded-lg hover:bg-zinc-600 text-sm">Quizzes</Link>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-white mb-4">Review Answers</h2>
        <div className="space-y-4">
          {result.answers?.map((a, i) => {
            const q = a.questionId;
            if (!q) return null;
            return (
              <div key={i} className={`bg-zinc-800 rounded-xl shadow p-5 card-hover border-l-4 ${
                q.type === 'subjective'
                  ? 'border-l-blue-500'
                  : a.isCorrect
                    ? 'border-l-green-500'
                    : 'border-l-red-500'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="mt-1 shrink-0">
                    {q.type === 'subjective' ? (
                      <FiAlertCircle className="text-blue-400" size={20} />
                    ) : a.isCorrect ? (
                      <span className="text-green-400 text-xl">&#10003;</span>
                    ) : (
                      <span className="text-red-400 text-xl">&#10007;</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${COLORS[q.difficulty] || COLORS.medium}`}>
                        {q.difficulty || 'medium'}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        q.type === 'subjective' ? 'bg-blue-900/50 text-blue-300' : 'bg-purple-900/50 text-purple-300'
                      }`}>
                        {q.type === 'subjective' ? q.questionType || 'subjective' : 'MCQ'}
                      </span>
                    </div>
                    <p className="font-medium text-white">{q.questionText}</p>

                    {q.type === 'objective' && q.options?.map((opt, j) => (
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

                    {q.type === 'subjective' && (
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

  if (started && questions.length > 0) {
    const q = questions[currentQ];
    const answeredCount = Object.keys(answers).length;

    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => { setStarted(false); }} className="back-btn mb-4">
          <FiArrowLeft size={16} /> Back to Configure
        </button>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400">Question {currentQ + 1} of {questions.length}</span>
            <span className="text-sm text-zinc-400">Answered: {answeredCount}/{questions.length}</span>
          </div>
          <span className="flex items-center gap-1 text-sm text-zinc-400"><FiClock size={14} /> 10:00</span>
        </div>

        <div className="flex gap-1.5 mb-4 flex-wrap">
          {questions.map((_, i) => (
            <button key={i} onClick={() => setCurrentQ(i)}
              className={`w-8 h-8 rounded-full text-xs font-medium transition ${
                i === currentQ
                  ? 'bg-indigo-600 text-white'
                  : answers[questions[i]._id] !== undefined
                    ? 'bg-green-900/50 text-green-300'
                    : 'bg-zinc-700 text-zinc-400'
              }`}>
              {i + 1}
            </button>
          ))}
        </div>

        <div className="bg-zinc-800 rounded-xl shadow-lg p-6 mb-6 card-hover border border-zinc-700">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${COLORS[q.difficulty] || COLORS.medium}`}>
              {q.difficulty || 'medium'}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              q.type === 'subjective' ? 'bg-blue-900/50 text-blue-300' : 'bg-purple-900/50 text-purple-300'
            }`}>
              {q.type === 'subjective' ? q.questionType || 'Subjective' : 'MCQ'}
            </span>
          </div>

          <h2 className="text-lg font-semibold text-white mb-4">{q.questionText}</h2>

          {q.type === 'objective' ? (
            <div className="space-y-3">
              {q.options?.map((opt, i) => (
                <button key={i} onClick={() => selectAnswer(q._id, i)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                    answers[q._id]?.selectedAnswer === i
                      ? 'border-indigo-500 bg-indigo-900/30 text-indigo-300'
                      : 'border-zinc-700 hover:border-zinc-600 text-zinc-300'
                  }`}>
                  <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span> {opt}
                </button>
              ))}
            </div>
          ) : (
            <div>
              {q.questionType === 'long' ? (
                <textarea
                  placeholder="Write your answer here..."
                  value={answers[q._id]?.textAnswer || ''}
                  onChange={(e) => setTextAnswer(q._id, e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 bg-zinc-900 text-white border border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 resize-y placeholder-zinc-500"
                />
              ) : (
                <input
                  type="text"
                  placeholder="Type your short answer..."
                  value={answers[q._id]?.textAnswer || ''}
                  onChange={(e) => setTextAnswer(q._id, e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 text-white border border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 placeholder-zinc-500"
                />
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}
            className="px-6 py-2 bg-zinc-700 text-zinc-200 rounded-lg hover:bg-zinc-600 disabled:opacity-50 transition">
            Previous
          </button>
          {currentQ < questions.length - 1 ? (
            <button onClick={() => setCurrentQ(currentQ + 1)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition">
              Next
            </button>
          ) : (
              <button onClick={handleSubmit} disabled={submitting}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:opacity-50 btn-glow">
              <FiSend size={16} /> {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        {subject?.semester?._id ? (
          <Link to={`/quiz/semester/${subject.semester._id}`} className="back-btn mb-4">
            <FiArrowLeft size={16} /> Back to Subjects
          </Link>
        ) : (
          <Link to="/quiz" className="back-btn mb-4">
            <FiArrowLeft size={16} /> Back to Quizzes
          </Link>
        )}

        <div className="bg-zinc-800 rounded-xl shadow-lg p-8 card-hover border border-zinc-700">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">{subject?.name || 'Quiz'}</h1>
            <p className="text-zinc-400">AI-generated quiz from PYQs</p>
          </div>

          <div className="border-t border-zinc-700 pt-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Difficulty Level</label>
              <div className="flex gap-3">
                {DIFFICULTIES.map((d) => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className={`flex-1 py-2.5 rounded-lg font-medium capitalize transition border ${
                      difficulty === d
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                    }`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Number of Questions</label>
              <div className="flex items-center gap-4">
                <input type="range" min={5} max={30} value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                  className="flex-1 accent-indigo-500" />
                <span className="text-lg font-bold text-white w-10 text-right">{numQuestions}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-zinc-400 bg-zinc-900 rounded-lg p-3">
              <FiAlertCircle size={16} className="shrink-0 text-indigo-400" />
              <span>Quiz will include a mix of <strong className="text-white">MCQs</strong> and <strong className="text-white">subjective</strong> questions based on <strong className="text-white">{pyqCount}</strong> PYQ{pyqCount !== 1 ? 's' : ''}.</span>
            </div>

            {!generated ? (
              <button onClick={handleGenerate} disabled={generating}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-500 disabled:opacity-50 btn-glow text-lg font-medium">
                {generating ? (
                  <><span className="loading loading-spinner loading-sm"></span> Generating...</>
                ) : (
                  <><FiZap size={20} /> Generate Quiz</>
                )}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="bg-green-900/30 border border-green-800 rounded-lg p-4 text-center">
                  <p className="text-green-300 font-medium">{questions.length} questions generated!</p>
                  <p className="text-green-400 text-sm mt-1">
                    {questions.filter((q) => q.type === 'objective').length} MCQs +
                    {' '}{questions.filter((q) => q.type === 'subjective').length} Subjective
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleGenerate} disabled={generating}
                    className="flex-1 bg-zinc-700 text-zinc-200 py-2.5 rounded-lg hover:bg-zinc-600 disabled:opacity-50 btn-glow font-medium">
                    Regenerate
                  </button>
                  <button onClick={handleStart}
                    className="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-500 btn-glow font-medium flex items-center justify-center gap-2">
                    <FiZap size={18} /> Start Quiz
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}