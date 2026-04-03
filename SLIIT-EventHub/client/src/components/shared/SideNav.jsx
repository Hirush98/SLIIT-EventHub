import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

// ── Nav item definitions ───────────────────────────────────
// Each item has: path, label, icon SVG path, and which roles can see it
const NAV_ITEMS = [
  {
    path:  '/home',
    label: 'Home',
    roles: ['participant', 'organizer', 'admin'],
    icon:  'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    path:  '/events',
    label: 'Events',
    roles: ['participant', 'organizer', 'admin'],
    icon:  'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    path:  '/announcements',
    label: 'Announcements',
    roles: ['participant', 'organizer', 'admin'],
    icon:  'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
  },
  {
    path:  '/admin',
    label: 'Admin Dashboard',
    roles: ['admin'],
    icon:  'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  },
  {
    path:  '/organizer',
    label: 'My Events',
    roles: ['organizer'],
    icon:  'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  },
  {
    path:  '/risk-analysis',
    label: 'Risk Analysis',
    roles: ['admin'],
    icon:  'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  },
];

const ACCOUNT_ITEMS = [
  {
    path:  '/profile',
    label: 'Profile',
    roles: ['participant', 'organizer', 'admin'],
    icon:  'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  },
  {
    path:  '/settings',
    label: 'Settings',
    roles: ['participant', 'organizer', 'admin'],
    icon:  'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  },
];

// ── Single nav link ────────────────────────────────────────
const NavLink = ({ path, label, icon, isActive, onClick }) => (
  <li>
    <Link
      to={path}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg
                  text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                  }`}
    >
      <svg className="w-5 h-5 flex-shrink-0" fill="none"
           stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
              strokeWidth="2" d={icon}/>
      </svg>
      {label}
    </Link>
  </li>
);

// ── Section label ──────────────────────────────────────────
const SectionLabel = ({ label }) => (
  <p className="px-4 pt-5 pb-1.5 text-xs font-semibold uppercase
                tracking-widest text-gray-500">
    {label}
  </p>
);

// ── Main SideNav component ─────────────────────────────────
const SideNav = ({ isOpen, onClose }) => {
  const { currentUser, signOut } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const userRole  = currentUser?.role || 'participant';

  // Filter nav items based on user role
  const visibleMain    = NAV_ITEMS.filter(item => item.roles.includes(userRole));
  const visibleAccount = ACCOUNT_ITEMS.filter(item => item.roles.includes(userRole));

  const isActive = (path) => location.pathname.startsWith(path);

  const handleSignOut = async () => {
    await signOut();
    navigate('/signin');
  };

  // Close sidebar when a link is clicked (mobile)
  const handleLinkClick = () => { if (onClose) onClose(); };

  return (
    <>
      {/* Dark overlay — only on mobile when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-gray-800 z-30
        flex flex-col shadow-xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:z-auto md:shadow-none
        md:border-r md:border-gray-700
      `}>

        {/* Top — brand + close button */}
        <div className="flex items-center justify-between px-4 py-4
                        border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gray-600 rounded-md flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none"
                   stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7
                     a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <span className="text-sm font-bold text-white">SLIIT EventHub</span>
          </div>
          {/* Close button — mobile only */}
          <button onClick={onClose}
                  className="md:hidden text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Nav items — scrollable */}
        <nav className="flex-1 overflow-y-auto py-2">

          <SectionLabel label="Menu" />
          <ul className="space-y-0.5">
            {visibleMain.map((item) => (
              <NavLink
                key={item.path}
                {...item}
                isActive={isActive(item.path)}
                onClick={handleLinkClick}
              />
            ))}
          </ul>

          <SectionLabel label="Account" />
          <ul className="space-y-0.5">
            {visibleAccount.map((item) => (
              <NavLink
                key={item.path}
                {...item}
                isActive={isActive(item.path)}
                onClick={handleLinkClick}
              />
            ))}
          </ul>
        </nav>

        {/* Bottom — user info + logout */}
        <div className="border-t border-gray-700 p-3 flex-shrink-0">
          {/* User info */}
          <div className="flex items-center gap-2 px-2 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center
                            justify-center text-xs font-bold text-gray-200 uppercase">
              {currentUser?.firstName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {currentUser?.firstName} {currentUser?.lastName}
              </p>
              <p className="text-xs text-gray-400 capitalize truncate">
                {currentUser?.role}
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg
                       text-sm text-gray-400 hover:bg-gray-900 hover:text-red-400
                       transition-all duration-200"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none"
                 stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0
                   01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default SideNav;
