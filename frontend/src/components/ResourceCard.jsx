import { FiDownload, FiEye, FiThumbsUp, FiBookmark, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { likeResource, downloadResource as download, saveResource, deleteResource as remove } from '../services/resourceService';
import API from '../services/api';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

export default function ResourceCard({ resource, onUpdate, onEdit }) {
  const { user } = useSelector((s) => s.auth);
  const isOwner = user?._id === resource.uploadedBy?._id;
  const isAdmin = user?.role === 'admin';
  const liked = user && resource.likes?.includes(user._id);
  const saved = user && user.savedResources?.includes(resource._id);

  const handleDownload = async () => {
    try {
      await download(resource._id);
      const base = API.defaults.baseURL;
      window.open(`${base}/resources/${resource._id}/file?download=1`, '_blank');
      toast.success('Download started');
    } catch (err) { toast.error(err.response?.data?.message || 'Download failed'); }
  };

  const handleLike = async () => {
    try {
      await likeResource(resource._id);
      onUpdate?.();
    } catch { toast.error('Failed'); }
  };

  const handleSave = async () => {
    try {
      await saveResource(resource._id);
      onUpdate?.();
      toast.success(saved ? 'Removed' : 'Saved');
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${resource.title}"? This cannot be undone.`)) return;
    try {
      await remove(resource._id);
      toast.success('Resource deleted');
      onUpdate?.();
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  return (
    <div className="bg-zinc-800 rounded-xl shadow-md p-5 card-hover border border-zinc-700">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-white">{resource.title}</h3>
        <span className={`text-xs px-2 py-1 rounded-full capitalize ${resource.type === 'pyq' ? 'bg-orange-900/50 text-orange-300' : 'bg-green-900/50 text-green-300'}`}>
          {resource.type}
        </span>
      </div>
      <p className="text-sm text-zinc-400 mb-1">
        Uploaded by {resource.uploadedBy?.name || 'Unknown'}
      </p>
      <div className="flex items-center gap-4 text-sm text-zinc-400 mb-3">
        <span className="flex items-center gap-1"><FiEye size={14} /> {resource.views || 0}</span>
        <span className="flex items-center gap-1"><FiDownload size={14} /> {resource.downloads}</span>
        <span className="flex items-center gap-1"><FiThumbsUp size={14} /> {resource.likes?.length || 0}</span>
      </div>

      <div className="flex items-center gap-2 mt-3">
        {resource.quiz && (
          <Link to={`/quiz/${resource._id}`} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-500 btn-glow">
            Take Quiz
          </Link>
        )}
        <Link to={`/preview/${resource._id}`} className="p-2 rounded-lg hover:bg-zinc-700 text-zinc-400">
          <FiEye size={16} />
        </Link>
        <button onClick={handleDownload} className="p-2 rounded-lg hover:bg-zinc-700 text-zinc-400">
          <FiDownload size={16} />
        </button>
        {isOwner || isAdmin ? (
          <>
            <button onClick={() => onEdit?.(resource)} className="p-2 rounded-lg hover:bg-zinc-700 text-zinc-400">
              <FiEdit2 size={16} />
            </button>
            <button onClick={handleDelete} className="p-2 rounded-lg hover:bg-zinc-700 text-red-400">
              <FiTrash2 size={16} />
            </button>
          </>
        ) : (
          <>
            <button onClick={handleLike} className={`p-2 rounded-lg hover:bg-zinc-700 ${liked ? 'text-indigo-400' : 'text-zinc-400'}`}>
              <FiThumbsUp size={16} />
            </button>
            <button onClick={handleSave} className={`p-2 rounded-lg hover:bg-zinc-700 ${saved ? 'text-indigo-400' : 'text-zinc-400'}`}>
              <FiBookmark size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
