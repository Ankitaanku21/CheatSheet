import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import API from '../services/api';
import { submitQuizAttempt } from '../redux/quizSlice';
import Timer from '../components/Timer';
import { FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function TakeQuiz() {
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { questionsLoading } = useSelector((s) => s.quiz);

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [textAnswers, setTextAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState(null);
  const [started, setStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get('/quizzes/questions/quiz', { params: { resource: resourceId } });
        setQuestions(res.data);
        const resRes = await API.get(`/resources/${resourceId}`);
        setResource(resRes.data);
      } catch { toast.error('Failed to load quiz'); } finally { setLoading(false); }
    };
    fetch();
  }, [resourceId]);

  const handleTimeUp = useCallback(() => {
    handleSubmit();
  }, []);

  const selectAnswer = (questionId, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const setTextAnswer = (questionId, text) => {
    setTextAnswers((prev) => ({ ...prev, [questionId]: text }));
  };

  const isAnswered = (q) => {
    if (q.type === 'subjective') return (textAnswers[q._id] || '').trim().length > 0;
    return answers[q._id] !== undefined;
  };

  const handleSubmit = async () => {
    const answersArray = questions.map((q) => {
      if (q.type === 'subjective') {
        return { questionId: q._id, textAnswer: textAnswers[q._id] || '' };
      }
      return { questionId: q._id, selectedAnswer: answers[q._id] };
    });
    const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    try {
      const result = await dispatch(submitQuizAttempt({
        resource: resourceId,
        answers: answersArray,
        timeTaken
      })).unwrap();
      navigate(`/quiz/${resourceId}/result`, { state: result });
    } catch { toast.error('Failed to submit quiz'); }
  };

  if (loading) return <div className="text-center py-12 text-zinc-400">Loading quiz...</div>;

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">No Questions Yet</h1>
        <p className="text-zinc-400 mb-6">This resource doesn't have a quiz yet. Ask an admin to generate one.</p>
        <button onClick={() => navigate(-1)} className="back-btn"><FiArrowLeft size={16} /> Go back</button>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link to="/quizzes" className="back-btn mb-4">
          <FiArrowLeft size={16} /> Back to Quizzes
        </Link>
        <div className="bg-zinc-800 rounded-xl shadow-lg p-8 text-center card-hover border border-zinc-700">
          <h1 className="text-2xl font-bold text-white mb-2">Quiz: {resource?.title}</h1>
          <p className="text-zinc-400 mb-6">{questions.length} Questions</p>
          <button onClick={() => { setStarted(true); setStartTime(Date.now()); }}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-indigo-500 btn-glow">
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];
  const answeredCount = questions.filter(isAnswered).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/quizzes" className="back-btn mb-4">
        <FiArrowLeft size={16} /> Back to Quizzes
      </Link>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-400">Question {currentQ + 1} of {questions.length}</span>
          <span className="text-sm text-zinc-400">Answered: {answeredCount}/{questions.length}</span>
        </div>
        <Timer timeLimit={600} onTimeUp={handleTimeUp} />
      </div>

      <div className="bg-zinc-800 rounded-xl shadow-lg p-6 mb-6 card-hover border border-zinc-700">
        <div className="flex gap-1.5 mb-4 flex-wrap">
          {questions.map((_, i) => (
            <button key={i} onClick={() => setCurrentQ(i)}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs font-medium transition
                ${i === currentQ ? 'bg-indigo-600 text-white' : isAnswered(questions[i]) ? 'bg-green-900/50 text-green-300' : 'bg-zinc-700 text-zinc-400'}`}>
              {i + 1}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            q.type === 'subjective' ? 'bg-blue-900/50 text-blue-300' : 'bg-purple-900/50 text-purple-300'
          }`}>
            {q.type === 'subjective' ? q.questionType || 'subjective' : 'MCQ'}
          </span>
        </div>
        <h2 className="text-lg font-semibold text-white mb-4">{q.questionText}</h2>

        {q.type === 'subjective' ? (
          <textarea value={textAnswers[q._id] || ''} onChange={(e) => setTextAnswer(q._id, e.target.value)}
            placeholder="Type your answer here..."
            className="w-full min-h-[160px] p-4 bg-zinc-900 text-white border border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-y" />
        ) : (
          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <button key={i} onClick={() => selectAnswer(q._id, i)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition
                  ${answers[q._id] === i ? 'border-indigo-500 bg-indigo-900/30 text-indigo-300' : 'border-zinc-700 hover:border-zinc-600 text-zinc-300'}`}>
                <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span> {opt}
              </button>
            ))}
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
          <button onClick={handleSubmit} disabled={questionsLoading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:opacity-50 btn-glow">
            {questionsLoading ? 'Submitting...' : 'Submit Quiz'}
          </button>
        )}
      </div>
    </div>
  );
}
