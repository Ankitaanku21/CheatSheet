import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { viewResource, downloadResource } from '../services/resourceService';
import { FiArrowLeft, FiDownload, FiEye, FiFileText, FiZap } from 'react-icons/fi';
import AiSidebar from '../components/AiSidebar';
import toast from 'react-hot-toast';

export default function Preview() {
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get(`/resources/${resourceId}`);
        setResource(res.data);
        viewResource(resourceId);
      } catch {
        toast.error('Resource not found');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    })();
  }, [resourceId, navigate]);

  const handleDownload = async () => {
    try {
      await downloadResource(resourceId);
      const apiBase = import.meta.env.VITE_API_URL || '';
      window.open(`${apiBase}/api/resources/${resourceId}/file?download=1`, '_blank');
      toast.success('Download started');
    } catch {
      toast.error('Download failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!resource) return null;

  const apiBase = import.meta.env.VITE_API_URL || '';
  const pdfUrl = `${apiBase}/api/resources/${resourceId}/file`;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <header className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center gap-4 shrink-0">
        <Link to={`/resources/${resource.subject}?type=${resource.type}`} className="back-btn">
          <FiArrowLeft size={20} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-white truncate">{resource.title}</h1>
          <p className="text-xs text-zinc-400 capitalize">{resource.type} &middot; {resource.uploadedBy?.name || 'Unknown'}</p>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-xs text-zinc-400">
          <span className="flex items-center gap-1"><FiEye size={14} /> {resource.views || 0}</span>
          <span className="flex items-center gap-1"><FiFileText size={14} /> {resource.downloads}</span>
        </div>
        <button onClick={handleDownload}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 text-sm shrink-0">
          <FiDownload size={16} /> Download
        </button>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden flex items-center gap-1 px-3 py-2 bg-indigo-600/20 text-indigo-300 rounded-lg hover:bg-indigo-600/30 transition text-xs font-medium shrink-0"
          title="AI Assistant">
          <FiZap size={16} /> AI
        </button>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 bg-zinc-900 flex items-start justify-center p-2 sm:p-4 overflow-auto">
          <embed
            src={pdfUrl}
            type="application/pdf"
            className="w-full max-w-5xl h-[calc(100vh-130px)] rounded-lg shadow-lg"
          />
        </div>

        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute right-0 top-0 bottom-0 w-80" onClick={(e) => e.stopPropagation()}>
              <AiSidebar resource={resource} />
            </div>
          </div>
        )}

        <div className="hidden lg:flex">
          <AiSidebar resource={resource} />
        </div>
      </div>
    </div>
  );
}
