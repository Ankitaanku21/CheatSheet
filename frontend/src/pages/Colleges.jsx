import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { FiBookOpen, FiCpu, FiMonitor, FiRadio, FiZap, FiSearch } from 'react-icons/fi';
import PageHero from '../components/PageHero';

const icons = [FiCpu, FiMonitor, FiRadio, FiZap, FiBookOpen];
const typeColors = {
  IIT: 'bg-orange-900/50 text-orange-300',
  NIT: 'bg-green-900/50 text-green-300',
  IIIT: 'bg-purple-900/50 text-purple-300',
  Other: 'bg-blue-900/50 text-blue-300',
};
const typeFilters = ['All', 'IIT', 'NIT', 'IIIT', 'Other'];

export default function Colleges() {
  const [colleges, setColleges] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    API.get('/colleges').then((r) => setColleges(r.data)).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return colleges.filter((c) => {
      const matchType = filterType === 'All' || c.type === filterType;
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [colleges, search, filterType]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <PageHero
        backLink="/"
        backText="Home"
        title="Select Your College"
        subtitle="Choose your college to access notes, PYQs, and quizzes"
      />

      <div className="max-w-md mx-auto mb-6 relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
        <input type="text" placeholder="Search colleges by name or code..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-zinc-900 text-white placeholder-zinc-500" />
      </div>

      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        {typeFilters.map((t) => (
          <button key={t} onClick={() => setFilterType(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              filterType === t
                ? 'bg-indigo-600 text-white'
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-zinc-500 mt-8">No colleges match your search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((college, i) => {
            const Icon = icons[i % icons.length];
            const typeColor = typeColors[college.type] || 'bg-zinc-700 text-zinc-300';
            return (
              <Link key={college._id} to={`/college/${college._id}`}
                className="bg-zinc-800 rounded-xl shadow-md p-6 card-hover border border-zinc-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-indigo-900/50 text-indigo-300 rounded-xl flex items-center justify-center">
                    <Icon size={28} />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${typeColor}`}>
                    {college.type}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-white">{college.name}</h2>
                <p className="text-sm text-zinc-400 mt-1">{college.code}</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
