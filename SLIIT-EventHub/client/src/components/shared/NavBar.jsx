import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const ROLE_BADGE = {
  admin:       'bg-red-100    text-red-700',
  organizer:   'bg-indigo-100 text-indigo-700',
  participant: 'bg-green-100  text-green-700',
};

const NavLink = ({ to, label }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);
  return (
    <Link to={to}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
      {label}
    </Link>
  );
};

const DropdownItem = ({ to, label, icon, description, onClick, danger }) => (
  <Link to={to} onClick={onClick}
    className={`flex items-start gap-3 px-4 py-3 rounded-xl transition-all duration-150 group
      ${danger ? 'hover:bg-red-50' : 'hover:bg-gray-50'}`}>
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5
      ${danger ? 'bg-red-100 group-hover:bg-red-200' : 'bg-gray-100 group-hover:bg-indigo-100'}`}>
      <svg className={`w-4 h-4 ${danger ? 'text-red-500' : 'text-gray-600 group-hover:text-indigo-600'}`}
        fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon}/>
      </svg>
    </div>
    <div>
      <p className={`text-sm font-medium ${danger ? 'text-red-600' : 'text-gray-800'}`}>{label}</p>
      {description && <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{description}</p>}
    </div>
  </Link>
);

const MobileLink = ({ to, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);
  return (
    <Link to={to} onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
        ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
      {label}
    </Link>
  );
};

const NavBar = () => {
  const { currentUser, signOut } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const [dropOpen,   setDropOpen]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropRef = useRef(null);

  const role        = currentUser?.role || 'participant';
  const isAdmin     = role === 'admin';
  const isOrganizer = role === 'organizer';
  const initials    = `${currentUser?.firstName?.charAt(0)||''}${currentUser?.lastName?.charAt(0)||''}`.toUpperCase();

  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => { setMobileOpen(false); setDropOpen(false); }, [location.pathname]);

  const handleSignOut = () => { signOut(); navigate('/signin'); };

  const mainLinks = [
    ...(isAdmin ? [{ to: '/admin-dashboard', label: 'Admin' }]
      : isOrganizer ? [{ to: '/organizer-dashboard', label: 'Dashboard' }]
      : [{ to: '/home', label: 'Home' }]),
    { to: '/events',        label: 'Events' },
    { to: '/announcements', label: 'Announcements' },
  ];

  const dashItems = isAdmin ? [
    { to: '/admin-dashboard',  label: 'Admin Dashboard',  description: 'Manage events, users and platform', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { to: '/user-management',  label: 'User Management',  description: 'View and manage all users', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  ] : isOrganizer ? [
    { to: '/organizer-dashboard', label: 'My Dashboard',  description: 'View and manage your events', icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7' },
    { to: '/events/create',       label: 'Create Event',  description: 'Submit a new campus event', icon: 'M12 4v16m8-8H4' },
  ] : [];

  const accItems = [
    { to: '/profile',  label: 'My Profile', description: 'View and edit your details', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { to: '/settings', label: 'Settings',   description: 'Notification preferences',   icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ];

  return (
    <nav className="bg-gray-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <Link to="/home" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <div className="hidden sm:block">
              <p className="text-white font-bold text-sm leading-tight">SLIIT EventHub</p>
              <p className="text-gray-500 text-xs leading-tight">Event Management</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {mainLinks.map((l) => <NavLink key={l.to} {...l} />)}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <Link to="/announcements" className="hidden sm:flex w-9 h-9 items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
            </Link>

            {/* Dropdown */}
            <div className="relative" ref={dropRef}>
              <button onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-700 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
                  {currentUser?.profilePhoto ? <img src={currentUser.profilePhoto} alt="" className="w-full h-full object-cover"/> : initials || 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-white text-xs font-semibold leading-tight">{currentUser?.firstName} {currentUser?.lastName}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium capitalize ${ROLE_BADGE[role]}`}>{role}</span>
                </div>
                <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              {dropOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  {/* Header */}
                  <div className="px-4 py-4 bg-gradient-to-r from-gray-800 to-gray-900">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                        {currentUser?.profilePhoto ? <img src={currentUser.profilePhoto} alt="" className="w-full h-full object-cover"/> : initials || 'U'}
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">{currentUser?.firstName} {currentUser?.lastName}</p>
                        <p className="text-gray-400 text-xs truncate max-w-40">{currentUser?.email}</p>
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium capitalize mt-1 ${ROLE_BADGE[role]}`}>{role}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    {dashItems.length > 0 && (
                      <>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 pt-2 pb-1">Dashboard</p>
                        {dashItems.map((i) => <DropdownItem key={i.to} {...i} onClick={() => setDropOpen(false)}/>)}
                        <div className="my-2 border-t border-gray-100"/>
                      </>
                    )}
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 pt-1 pb-1">Account</p>
                    {accItems.map((i) => <DropdownItem key={i.to} {...i} onClick={() => setDropOpen(false)}/>)}
                    <div className="my-2 border-t border-gray-100"/>
                    <button onClick={() => { setDropOpen(false); handleSignOut(); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 group transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-red-100 group-hover:bg-red-200 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-red-600">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-700 py-3 space-y-1">
            {mainLinks.map((l) => <MobileLink key={l.to} {...l} onClick={() => setMobileOpen(false)}/>)}
            <div className="border-t border-gray-700 pt-2 mt-2">
              <MobileLink to="/profile"  label="Profile"  onClick={() => setMobileOpen(false)}/>
              <MobileLink to="/settings" label="Settings" onClick={() => setMobileOpen(false)}/>
              <button onClick={() => { setMobileOpen(false); handleSignOut(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-gray-800 transition-colors text-sm font-medium">
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
