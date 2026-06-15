import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

export default function PageHero({ backLink, backText, title, subtitle, actions }) {
  return (
    <div className="relative rounded-2xl overflow-hidden mb-10 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl border border-white/[0.06]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-purple-900/10 to-transparent" />
      <div className="relative backdrop-blur-sm p-4 sm:p-8">
        {backLink && (
          <Link to={backLink} className="back-btn mb-5">
            <FiArrowLeft size={14} /> {backText || 'Back'}
          </Link>
        )}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{title}</h1>
            {subtitle && <p className="text-zinc-400 text-sm sm:text-base">{subtitle}</p>}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
