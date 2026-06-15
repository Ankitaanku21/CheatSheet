import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../redux/authSlice';
import { FiBookOpen, FiLogOut, FiUser, FiAward, FiGrid, FiBookmark, FiMenu, FiX, FiHome } from 'react-icons/fi';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();

  const collegeId = user?.college ? (user.college._id || user.college) : null;
  const handleLogout = () => { dispatch(logoutUser()); setMenuOpen(false); };
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to={collegeId ? `/college/${collegeId}` : '/profile/setup'} className="flex items-center gap-2 text-xl font-bold text-indigo-400 shrink-0">
          <FiBookOpen /> CheatSheet
        </Link>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link to="/colleges" className="text-zinc-300 hover:text-indigo-400 font-medium flex items-center gap-1 text-sm lg:text-base">
                <FiGrid size={16} /> Browse Colleges
              </Link>
              <Link to="/quiz" className="text-zinc-300 hover:text-indigo-400 font-medium text-sm lg:text-base">
                Quizzes
              </Link>
              <Link to="/leaderboard" className="text-zinc-300 hover:text-indigo-400" title="Leaderboard">
                <FiAward size={20} />
              </Link>
              <Link to="/bookmarks" className="text-zinc-300 hover:text-indigo-400" title="Bookmarks">
                <FiBookmark size={20} />
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-zinc-300 hover:text-indigo-400 font-medium text-sm lg:text-base">
                  Admin
                </Link>
              )}
              <Link to="/profile" className="text-zinc-300 hover:text-indigo-400" title="Profile">
                <FiUser size={20} />
              </Link>
              <span className="text-sm text-zinc-500 hidden xl:inline">
                {user.name}{user.college?.name ? ` (${user.college.name})` : ''}
              </span>
              <button onClick={handleLogout} className="text-zinc-400 hover:text-red-400" title="Logout">
                <FiLogOut size={20} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-zinc-300 hover:text-indigo-400 text-sm lg:text-base">Login</Link>
              <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 btn-glow text-sm lg:text-base">
                Register
              </Link>
            </>
          )}
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-zinc-300 hover:text-indigo-400 transition">
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      <div className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeMenu} />
        <div className={`absolute right-0 top-0 bottom-0 w-72 bg-zinc-900 border-l border-zinc-800 shadow-2xl transform transition-transform duration-300 ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between px-4 h-16 border-b border-zinc-800">
            <span className="text-lg font-bold text-indigo-400">Menu</span>
            <button onClick={closeMenu} className="p-2 text-zinc-400 hover:text-white transition">
              <FiX size={20} />
            </button>
          </div>
          <div className="p-4 space-y-1">
            {user ? (
              <>
                <div className="px-3 py-3 border-b border-zinc-800 mb-2">
                  <p className="text-white font-medium truncate">{user.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                </div>
                <Link to={collegeId ? `/college/${collegeId}` : '/profile/setup'} onClick={closeMenu}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-indigo-400 transition">
                  <FiHome size={18} /> Home
                </Link>
                <Link to="/colleges" onClick={closeMenu}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-indigo-400 transition">
                  <FiGrid size={18} /> Browse Colleges
                </Link>
                <Link to="/quiz" onClick={closeMenu}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-indigo-400 transition">
                  <FiAward size={18} /> Quizzes
                </Link>
                <Link to="/leaderboard" onClick={closeMenu}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-indigo-400 transition">
                  <FiAward size={18} /> Leaderboard
                </Link>
                <Link to="/bookmarks" onClick={closeMenu}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-indigo-400 transition">
                  <FiBookmark size={18} /> Bookmarks
                </Link>
                <Link to="/profile" onClick={closeMenu}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-indigo-400 transition">
                  <FiUser size={18} /> Profile
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={closeMenu}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-indigo-400 transition">
                    <FiGrid size={18} /> Admin
                  </Link>
                )}
                <hr className="border-zinc-800 my-2" />
                <button onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-red-400 hover:bg-zinc-800 transition w-full text-left">
                  <FiLogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMenu}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-indigo-400 transition">
                  <FiUser size={18} /> Login
                </Link>
                <Link to="/register" onClick={closeMenu}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition mt-2">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
