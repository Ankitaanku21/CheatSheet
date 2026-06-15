import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiZap, FiList, FiMessageSquare, FiChevronRight, FiSend, FiChevronDown, FiChevronUp, FiLoader } from 'react-icons/fi';
import { extractText, getSummary, getTopics, askQuestion } from '../services/assistantService';
import toast from 'react-hot-toast';

export default function AiSidebar({ resource, onExtracted }) {
  const navigate = useNavigate();

  const [textExtracted, setTextExtracted] = useState(!!onExtracted);
  const [extracting, setExtracting] = useState(false);

  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const [topics, setTopics] = useState(null);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [topicsOpen, setTopicsOpen] = useState(false);

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [qaLoading, setQaLoading] = useState(false);

  const ensureExtracted = async () => {
    if (textExtracted) return true;
    setExtracting(true);
    try {
      await extractText(resource._id);
      setTextExtracted(true);
      onExtracted?.();
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to extract text');
      return false;
    } finally {
      setExtracting(false);
    }
  };

  const handleSummary = async () => {
    if (summary) { setSummaryOpen(!summaryOpen); return; }
    setSummaryLoading(true);
    const ok = await ensureExtracted();
    if (!ok) { setSummaryLoading(false); return; }
    try {
      const { data } = await getSummary(resource._id);
      setSummary(data.summary);
      setSummaryOpen(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleTopics = async () => {
    if (topics) { setTopicsOpen(!topicsOpen); return; }
    setTopicsLoading(true);
    const ok = await ensureExtracted();
    if (!ok) { setTopicsLoading(false); return; }
    try {
      const { data } = await getTopics(resource._id);
      setTopics(data.topics);
      setTopicsOpen(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to extract topics');
    } finally {
      setTopicsLoading(false);
    }
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setQaLoading(true);
    setAnswer(null);
    const ok = await ensureExtracted();
    if (!ok) { setQaLoading(false); return; }
    try {
      const { data } = await askQuestion(resource._id, question);
      setAnswer(data.answer);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to answer');
    } finally {
      setQaLoading(false);
    }
  };

  return (
    <div className="w-full lg:w-96 bg-zinc-900 border-l border-zinc-800 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-gradient-to-r from-indigo-600 to-purple-700">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <FiZap size={18} /> AI Assistant
        </h2>
        <p className="text-indigo-200 text-xs mt-0.5">Powered by Groq AI</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {extracting && (
          <div className="flex items-center gap-2 text-sm text-zinc-400 bg-zinc-800 rounded-lg p-3">
            <span className="loading loading-spinner loading-xs"></span> Extracting text from PDF...
          </div>
        )}

        <button onClick={handleSummary} disabled={summaryLoading || extracting}
          className="w-full flex items-center justify-between bg-zinc-800 border border-zinc-700 rounded-lg p-3 hover:bg-zinc-700 disabled:opacity-50 transition text-left">
          <span className="flex items-center gap-2 text-sm font-medium text-zinc-200">
            {summaryLoading ? <span className="loading loading-spinner loading-xs"></span> : <FiList size={16} className="text-indigo-400" />}
            Generate Summary
          </span>
          {summary && (summaryOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />)}
          {!summary && !summaryLoading && <FiChevronRight size={16} className="text-zinc-500" />}
        </button>
        {summaryOpen && summary && (
          <div className="bg-zinc-800 rounded-lg p-3 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {summary}
          </div>
        )}

        <button onClick={handleTopics} disabled={topicsLoading || extracting}
          className="w-full flex items-center justify-between bg-zinc-800 border border-zinc-700 rounded-lg p-3 hover:bg-zinc-700 disabled:opacity-50 transition text-left">
          <span className="flex items-center gap-2 text-sm font-medium text-zinc-200">
            {topicsLoading ? <span className="loading loading-spinner loading-xs"></span> : <FiList size={16} className="text-purple-400" />}
            Important Topics
          </span>
          {topics && (topicsOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />)}
          {!topics && !topicsLoading && <FiChevronRight size={16} className="text-zinc-500" />}
        </button>
        {topicsOpen && topics && (
          <div className="bg-zinc-800 rounded-lg p-3">
            <ul className="space-y-1.5">
              {topics.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button onClick={() => navigate(`/quiz/subject/${resource.subject}`)}
          className="w-full flex items-center justify-between bg-zinc-800 border border-zinc-700 rounded-lg p-3 hover:bg-zinc-700 transition text-left">
          <span className="flex items-center gap-2 text-sm font-medium text-zinc-200">
            <FiZap size={16} className="text-yellow-500" />
            Quiz Time
          </span>
          <FiChevronRight size={16} className="text-zinc-500" />
        </button>

        <div className="border-t border-zinc-800 pt-3">
          <form onSubmit={handleAsk} className="flex gap-2">
            <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about this PDF..."
              className="flex-1 px-3 py-2 text-sm bg-zinc-800 text-white border border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 placeholder-zinc-500"
              disabled={qaLoading || extracting} />
            <button type="submit" disabled={qaLoading || extracting || !question.trim()}
              className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition">
              {qaLoading ? <FiLoader size={16} className="animate-spin" /> : <FiSend size={16} />}
            </button>
          </form>
          {answer && (
            <div className="mt-3 bg-zinc-800 rounded-lg p-3 text-sm text-zinc-300 leading-relaxed">
              {answer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
