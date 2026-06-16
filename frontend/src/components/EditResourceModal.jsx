import { useState, useRef } from 'react';
import { FiFile, FiX } from 'react-icons/fi';
import { updateResource, uploadFile } from '../services/resourceService';
import toast from 'react-hot-toast';

export default function EditResourceModal({ resource, onClose, onSaved }) {
  const [title, setTitle] = useState(resource.title);
  const [type, setType] = useState(resource.type);
  const [newFile, setNewFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let fileUrl = resource.fileUrl;
      let fileSize = resource.fileSize;

      if (newFile) {
        const fd = new FormData();
        fd.append('file', newFile);
        const uploadRes = await uploadFile(fd);
        fileUrl = uploadRes.data.url;
        fileSize = uploadRes.data.size;
      }

      await updateResource(resource._id, { title, type, fileUrl, fileSize });
      toast.success('Resource updated');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-md border border-zinc-700" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Edit Resource</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
            <FiX size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 placeholder-zinc-500"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="notes">Notes</option>
              <option value="pyq">PYQ</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">File (optional)</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 border-2 border-dashed border-zinc-600 rounded-lg p-4 cursor-pointer hover:border-indigo-400 transition"
            >
              <FiFile className="text-zinc-400" size={20} />
              <span className="text-sm text-zinc-400 truncate flex-1">
                {newFile ? newFile.name : resource.fileUrl?.split('/').pop() || 'Click to replace file'}
              </span>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.docx"
                onChange={(e) => setNewFile(e.target.files[0])}
                className="hidden"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-zinc-700 text-zinc-200 px-4 py-2 rounded-lg hover:bg-zinc-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
