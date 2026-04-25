import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import notificationApi from '../../api/notificationApi';

const ROLE_BADGE = {
  admin: 'bg-[rgba(240,180,41,0.18)] text-[#8a6200]',
  organizer: 'bg-[rgba(26,79,156,0.12)] text-[#1a4f9c]',
  participant: 'bg-[rgba(9,36,71,0.12)] text-[#092447]',
};

const SLIITLogo = ({ size = 32 }) => (
  <img
    src="/sliit-logo.png"
    alt="SLIIT Logo"
    style={{
      width: size,
      height: size,
      objectFit: 'contain',
    }}
  />
);

const NavLink = ({ to, label, icon }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={`relative rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-[linear-gradient(135deg,#1a4f9c,#092447)] !text-white shadow-[0_14px_30px_rgba(9,36,71,0.22)]'
          : '!text-white hover:bg-white/10 hover:!text-white'
      }`}
    >
      <span className="inline-flex items-center gap-1.5">
        {icon && (
          <svg className="h-[15px] w-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
          </svg>
        )}
        {label}
      </span>

      {isActive && (
        <span
          style={{
            position: 'absolute',
            bottom: '-1px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '20px',
            height: '2.5px',
            background: 'linear-gradient(90deg, #f5c84a, #d99e1a)',
            borderRadius: '9999px',
          }}
        />
      )}
    </Link>
  );
};

const DropdownItem = ({ to, label, icon, description, onClick, danger }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-start gap-3 rounded-xl px-3 sm:px-4 py-3 transition-all duration-150 group ${
      danger ? 'hover:bg-red-50' : 'hover:bg-slate-50'
    }`}
  >
    <div
      className={`mt-0.5 flex h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-lg ${
        danger ? 'bg-red-100 group-hover:bg-red-200' : 'bg-slate-100 group-hover:bg-[rgba(26,79,156,0.12)]'
      }`}
    >
      <svg
        className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${danger ? 'text-red-500' : 'text-slate-600 group-hover:text-[#1a4f9c]'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
      </svg>
    </div>
    <div className="min-w-0 flex-1">
      <p className={`text-sm font-medium truncate ${danger ? 'text-red-600' : 'text-slate-800'}`}>{label}</p>
      {description && <p className="mt-0.5 text-xs leading-relaxed text-slate-400 line-clamp-2">{description}</p>}
    </div>
  </Link>
);

const MobileLink = ({ to, label, icon, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
        isActive ? 'bg-[linear-gradient(135deg,#1a4f9c,#092447)] text-white' : 'text-white hover:bg-white/10'
      }`}
    >
      {icon && (
        <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
        </svg>
      )}
      <span className="flex-1">{label}</span>
    </Link>
  );
};

const NavBar = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef(null);
  const notifRef = useRef(null);

  const role = currentUser?.role || 'participant';
  const isAdmin = role === 'admin';
  const isOrganizer = role === 'organizer';
  const isParticipant = role === 'participant';
  const initials = `${currentUser?.firstName?.charAt(0) || ''}${currentUser?.lastName?.charAt(0) || ''}`.toUpperCase();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropRef.current && !dropRef.current.contains(event.target)) {
        setDropOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const syncCartCount = () => {
      try {
        const storedCart = JSON.parse(localStorage.getItem('merchCart') || '[]');
        const totalItems = Array.isArray(storedCart)
          ? storedCart.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
          : 0;
        setCartCount(totalItems);
      } catch {
        setCartCount(0);
      }
    };

    syncCartCount();
    window.addEventListener('storage', syncCartCount);
    window.addEventListener('cart-updated', syncCartCount);

    return () => {
      window.removeEventListener('storage', syncCartCount);
      window.removeEventListener('cart-updated', syncCartCount);
    };
  }, []);

  useEffect(() => {
    if (!currentUser || !isParticipant) {
      setNotifications([]);
      setUnreadNotifications(0);
      return;
    }

    const loadNotifications = async () => {
      try {
        const data = await notificationApi.getMyNotifications();
        setNotifications(data.notifications || []);
        setUnreadNotifications(Number(data.unreadCount || 0));
      } catch {
        setNotifications([]);
        setUnreadNotifications(0);
      }
    };

    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 30000);
    return () => window.clearInterval(intervalId);
  }, [currentUser, isParticipant]);

  const handleNotificationToggle = async () => {
    const nextOpen = !notifOpen;
    setNotifOpen(nextOpen);

    if (nextOpen && unreadNotifications > 0) {
      try {
        await notificationApi.markAllRead();
        setNotifications((items) => items.map((item) => ({ ...item, read: true })));
        setUnreadNotifications(0);
      } catch {
        // Keep the menu usable even if the read state cannot be persisted.
      }
    }
  };

  const handleSignOut = () => {
    signOut();
    navigate('/signin');
  };

  const mainLinks = [
    ...(isAdmin
      ? [{ to: '/admin-dashboard', label: 'Admin', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' }]
      : isOrganizer
        ? [{ to: '/organizer-dashboard', label: 'Dashboard', icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7' }]
        : [{ to: '/home', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' }]),
    ...(isAdmin ? [{ to: '/payments', label: 'Payments', icon: 'M17 9V7a5 5 0 00-10 0v2M5 9h14l1 10a2 2 0 01-2 2H6a2 2 0 01-2-2L5 9zm7 4v3m-3-3v1m6-1v1' }] : []),
    ...((isAdmin || isParticipant) ? [{ to: '/merch', label: 'Merchandise', icon: 'M20 13V7a2 2 0 00-2-2h-3V4a2 2 0 10-4 0v1H8a2 2 0 00-2 2v6m14 0v5a2 2 0 01-2 2H8a2 2 0 01-2-2v-5m14 0H6' }] : []),
    { to: '/events', label: 'Events', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { to: '/announcements', label: 'Announcements', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
  ];

  const dashItems = isAdmin
    ? [
        { to: '/admin-dashboard', label: 'Admin Dashboard', description: 'Manage events, users and platform', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
        { to: '/payments', label: 'Payments', description: 'Review merchandise orders and payments', icon: 'M17 9V7a5 5 0 00-10 0v2M5 9h14l1 10a2 2 0 01-2 2H6a2 2 0 01-2-2L5 9zm7 4v3m-3-3v1m6-1v1' },
        { to: '/merch', label: 'Merchandise', description: 'Open the merchandise list', icon: 'M20 13V7a2 2 0 00-2-2h-3V4a2 2 0 10-4 0v1H8a2 2 0 00-2 2v6m14 0v5a2 2 0 01-2 2H8a2 2 0 01-2-2v-5m14 0H6' },
        { to: '/user-management', label: 'User Management', description: 'View and manage all users', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
        { to: '/risk-analysis', label: 'Risk Analysis', description: 'Analyze user behavior and risks', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
        { to: '/admin-orders', label: 'Orders', description: 'Track merchandise order activity', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V9m-5-4l4 4m0 0l-4 4m4-4H9' },
      ]
    : isOrganizer
      ? [
          { to: '/organizer-dashboard', label: 'My Dashboard', description: 'View and manage your events', icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7' },
          { to: '/events/create', label: 'Create Event', description: 'Submit a new campus event', icon: 'M12 4v16m8-8H4' },
        ]
      : [];

  const accItems = [
    { to: '/profile', label: 'My Profile', description: 'View and edit your details', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { to: '/settings', label: 'Settings', description: 'Notification preferences', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ];

  return (
    <nav
      className="sticky top-0 z-50 border-b border-white/10 bg-[linear-gradient(135deg,#092447,#0f3564)] backdrop-blur"
      style={{
        boxShadow: scrolled
          ? '0 18px 48px rgba(9,36,71,0.3)'
          : '0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      <div
        style={{
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, #f0b429 30%, #f5c84a 50%, #f0b429 70%, transparent 100%)',
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <Link to="/home" className="group flex flex-shrink-0 items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center overflow-hidden rounded-xl bg-[linear-gradient(135deg,#f0b429,#d39712)] text-white shadow-[0_12px_26px_rgba(240,180,41,0.28)] transition-transform duration-200 group-hover:-translate-y-0.5">
              <SLIITLogo size={32} />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold leading-tight text-white">SLIIT EventHub</p>
              <p className="text-xs leading-tight text-slate-300/75">Campus Experience Platform</p>
            </div>
          </Link>

          <div className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/6 px-2 py-1 lg:flex">
            {mainLinks.map((link) => <NavLink key={link.to} {...link} />)}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {isParticipant && (
              <Link to="/cart" className="relative hidden h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-white/10 bg-white/6 text-slate-200 transition-colors hover:bg-white/12 hover:text-white sm:flex">
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.2 6h12.4M10 19a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 sm:-right-1.5 sm:-top-1.5 h-4 w-4 sm:h-[18px] sm:min-w-[18px] rounded-full bg-red-500 px-1 text-center text-[10px] font-bold leading-4 sm:leading-[18px] text-white shadow-md">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            )}

            {isParticipant && (
              <div className="relative hidden sm:block" ref={notifRef}>
                <button
                  type="button"
                  onClick={handleNotificationToggle}
                  className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-white/10 bg-white/6 text-slate-200 transition-colors hover:bg-white/12 hover:text-white"
                >
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadNotifications > 0 && (
                    <span className="absolute -right-1 -top-1 sm:-right-1.5 sm:-top-1.5 h-4 w-4 sm:h-[18px] sm:min-w-[18px] rounded-full bg-red-500 px-1 text-center text-[10px] font-bold leading-4 sm:leading-[18px] text-white shadow-md">
                      {unreadNotifications > 99 ? '99+' : unreadNotifications}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 z-50 mt-3 w-72 sm:w-80 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_28px_60px_rgba(9,36,71,0.2)]">
                    <div className="border-b border-slate-100 bg-[linear-gradient(135deg,rgba(26,79,156,0.08),rgba(240,180,41,0.12))] px-4 py-3">
                      <p className="text-sm font-semibold text-slate-800">Notifications</p>
                    </div>
                    <div className="max-h-96 overflow-y-auto p-2">
                      {notifications.length === 0 ? (
                        <div className="px-3 py-6 text-center text-sm text-slate-500">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((item) => (
                          <Link
                            key={item.id}
                            to={`/orders/view/${item.orderId}`}
                            onClick={() => setNotifOpen(false)}
                            state={{ from: '/home', label: 'Back to Home' }}
                            className={`block rounded-2xl px-3 py-3 transition-colors ${
                              item.read ? 'hover:bg-slate-50' : 'bg-[rgba(26,79,156,0.08)] hover:bg-[rgba(26,79,156,0.14)]'
                            }`}
                          >
                            <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                            <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.message}</p>
                            <p className="mt-2 text-[11px] text-slate-400">
                              {new Date(item.createdAt).toLocaleString()}
                            </p>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setDropOpen((open) => !open)}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-2 py-1 sm:px-2.5 sm:py-1.5 transition-colors hover:bg-white/12"
              >
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[linear-gradient(135deg,#1a4f9c,#092447)] text-xs font-bold text-white">
                  {currentUser?.profilePhoto ? <img src={currentUser.profilePhoto} alt="" className="h-full w-full object-cover" /> : initials || 'U'}
                </div>
                <div className="hidden text-left lg:block">
                  <p className="text-xs font-semibold leading-tight text-white">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </p>
                  <span className={`rounded-full px-1.5 py-0.5 text-xs font-medium capitalize ${ROLE_BADGE[role] || ROLE_BADGE.participant}`}>
                    {role}
                  </span>
                </div>
                <svg className={`h-4 w-4 text-slate-300 transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropOpen && (
                <div className="absolute right-0 z-50 mt-3 w-64 sm:w-72 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_28px_60px_rgba(9,36,71,0.2)]">
                  <div className="bg-[linear-gradient(135deg,#092447,#1a4f9c)] px-3 py-3 sm:px-4 sm:py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[linear-gradient(135deg,#f0b429,#d39712)] font-bold text-white">
                        {currentUser?.profilePhoto ? <img src={currentUser.profilePhoto} alt="" className="h-full w-full object-cover" /> : initials || 'U'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">
                          {currentUser?.firstName} {currentUser?.lastName}
                        </p>
                        <p className="max-w-full truncate text-xs text-slate-200/75">{currentUser?.email}</p>
                        <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${ROLE_BADGE[role] || ROLE_BADGE.participant}`}>
                          {role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-1 sm:p-2">
                    {dashItems.length > 0 && (
                      <>
                        <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Dashboard</p>
                        <div className="max-h-48 sm:max-h-64 overflow-y-auto">
                          {dashItems.map((item) => <DropdownItem key={item.to} {...item} onClick={() => setDropOpen(false)} />)}
                        </div>
                        <div className="my-2 border-t border-slate-100" />
                      </>
                    )}

                    <p className="px-3 pb-1 pt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Account</p>
                    {accItems.map((item) => <DropdownItem key={item.to} {...item} onClick={() => setDropOpen(false)} />)}
                    <div className="my-2 border-t border-slate-100" />

                    <button
                      onClick={() => {
                        setDropOpen(false);
                        handleSignOut();
                      }}
                      className="group flex w-full items-center gap-3 rounded-xl px-3 sm:px-4 py-3 transition-colors hover:bg-red-50"
                    >
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 group-hover:bg-red-200">
                        <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold text-red-600">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setMobileOpen((open) => !open)}
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-white/10 bg-white/6 text-slate-200 transition-colors hover:bg-white/12 hover:text-white lg:hidden"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="space-y-1 border-t border-white/10 py-3 lg:hidden">
            {mainLinks.map((link) => <MobileLink key={link.to} {...link} onClick={() => setMobileOpen(false)} />)}
            <div className="mt-2 border-t border-white/10 pt-2">
              {isParticipant && (
                <MobileLink
                  to="/cart"
                  label={`Cart${cartCount > 0 ? ` (${cartCount})` : ''}`}
                  icon="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.2 6h12.4M10 19a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z"
                  onClick={() => setMobileOpen(false)}
                />
              )}
              <MobileLink
                to="/profile"
                label="Profile"
                icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                onClick={() => setMobileOpen(false)}
              />
              <MobileLink
                to="/settings"
                label="Settings"
                icon="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                onClick={() => setMobileOpen(false)}
              />
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleSignOut();
                }}
                className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-red-300 transition-colors hover:bg-white/8"
              >
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
