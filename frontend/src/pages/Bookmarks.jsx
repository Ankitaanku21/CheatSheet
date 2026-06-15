import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import ResourceCard from '../components/ResourceCard';
import PageHero from '../components/PageHero';

export default function Bookmarks() {
  const [resources, setResources] = useState([]);

  const fetchBookmarks = async () => {
    try {
      const { data } = await API.get('/resources/user/bookmarks');
      setResources(data);
    } catch { setResources([]); }
  };

  useEffect(() => { fetchBookmarks(); }, []);

  return (
    <div className="min-h-screen p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <PageHero
          backLink="/colleges"
          backText="Back to Home"
          title="Saved Resources"
        />
        {resources.length === 0 ? (
          <p className="text-zinc-400 text-center mt-20">No saved resources yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {resources.map(r => (
              <ResourceCard key={r._id} resource={r} onUpdate={fetchBookmarks} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
