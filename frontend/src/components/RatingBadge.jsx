import { FiStar } from 'react-icons/fi';

const ratings = {
  0: { label: 'No Rating', color: 'text-gray-400', stars: 0 },
  1: { label: 'Bronze', color: 'text-amber-700', stars: 1 },
  2: { label: 'Silver', color: 'text-gray-500', stars: 2 },
  3: { label: 'Gold', color: 'text-yellow-500', stars: 3 },
  4: { label: 'Platinum', color: 'text-cyan-500', stars: 4 },
  5: { label: 'Diamond', color: 'text-indigo-500', stars: 5 },
};

export default function RatingBadge({ rating = 0, size = 20 }) {
  const r = ratings[rating] || ratings[0];
  return (
    <span className={`inline-flex items-center gap-0.5 ${r.color}`} title={r.label}>
      {Array.from({ length: r.stars }, (_, i) => <FiStar key={i} size={size} fill="currentColor" />)}
      {Array.from({ length: 5 - r.stars }, (_, i) => <FiStar key={`e${i}`} size={size} />)}
    </span>
  );
}
