import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const NavBar = ({ onMenuClick }) => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/signin');
  };

  return (
    <header className="bg-gray-800 text-white h-14 flex items-center
                        justify-between px-4 md:px-6 shadow-md flex-shrink-0">

      {/* Left — hamburger + brand */}
      <div className="flex items-center gap-3">

        {/* Hamburger — only visible on mobile */}
        <button
          onClick={onMenuClick}
          className="md:hidden text-gray-300 hover:text-white
                     focus:outline-none transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        {/* Brand logo + name */}
        <Link to="/home" className="flex items-center gap-2 group">
          <div className="w-7 h-7 bg-gray-600 rounded-lg flex items-center
                          justify-center group-hover:bg-gray-500 transition-colors">
            <svg className="w-4 h-4 text-white" fill="none"
                 stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7
                   a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-sm font-bold text-white">SLIIT EventHub</p>
            <p className="text-xs text-gray-400">Event Management</p>
          </div>
        </Link>
      </div>

      {/* Right — user info + logout */}
      <div className="flex items-center gap-2">
        {currentUser && (
          <>
            {/* User avatar + name */}
            <Link to="/profile"
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg
                             hover:bg-gray-700 transition-colors">
              {currentUser.profilePhoto ? (
                <img src={currentUser.profilePhoto} alt="Profile"
                     className="w-7 h-7 rounded-full object-cover
                                ring-2 ring-gray-600"/>
              ) : (
                <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center
                                justify-center text-xs font-bold text-gray-200 uppercase">
                  {currentUser.firstName?.charAt(0) || 'U'}
                </div>
              )}
              <div className="hidden md:block leading-tight">
                <p className="text-xs font-medium text-white">
                  {currentUser.firstName} {currentUser.lastName}
                </p>
                <p className="text-xs text-gray-400 capitalize">
                  {currentUser.role}
                </p>
              </div>
            </Link>

            {/* Logout button */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                         text-gray-300 hover:text-white border border-gray-600
                         hover:bg-gray-700 hover:border-gray-500 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0
                     01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default NavBar;
