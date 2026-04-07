import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

/* ── Role badge styles ────────────────────────────────────── */
const ROLE_BADGE = {
  admin: { bg: 'rgba(240,180,41,0.18)', color: '#92650a', label: 'Admin' },
  organizer: { bg: 'rgba(26,79,156,0.13)', color: '#1a4f9c', label: 'Organizer' },
  participant: { bg: 'rgba(255,255,255,0.15)', color: '#ffffff', label: 'Participant' },
};

/* ── SLIIT Logo from image file ─────────────────────────── */
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

/* ── Desktop Nav Link with Gold indicator ─────────────────── */
const NavLink = ({ to, label, icon }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 14px',
        borderRadius: '10px',
        fontSize: '0.875rem',
        fontWeight: isActive ? '600' : '500',
        color: isActive ? '#ffffff' : 'rgba(255,255,255,0.65)',
        background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        backdropFilter: isActive ? 'blur(8px)' : 'none',
        border: isActive ? '1px solid rgba(255,255,255,0.18)' : '1px solid transparent',
      }}
      onMouseEnter={e => {
        if (!isActive) {
          e.currentTarget.style.color = '#ffffff';
          e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      {icon && (
        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
        </svg>
      )}
      {label}

      {/* Gold underline indicator for active */}
      {isActive && (
        <span style={{
          position: 'absolute',
          bottom: '-1px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '20px',
          height: '2.5px',
          background: 'linear-gradient(90deg, #f5c84a, #d99e1a)',
          borderRadius: '9999px',
        }} />
      )}
    </Link>
  );
};

/* ── Dropdown menu item ───────────────────────────────────── */
const DropdownItem = ({ to, label, icon, description, onClick, danger }) => (
  <Link
    to={to}
    onClick={onClick}
    style={{ textDecoration: 'none' }}
    onMouseEnter={e => {
      e.currentTarget.style.background = danger ? '#fff1f2' : '#f4f6f9';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = 'transparent';
    }}
  >
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '12px',
      padding: '10px 12px', borderRadius: '10px',
      transition: 'background 0.15s ease',
    }}>
      {/* Icon box */}
      <div style={{
        width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px',
        background: danger ? 'rgba(239,68,68,0.10)' : 'rgba(9,36,71,0.07)',
      }}>
        <svg width="16" height="16" fill="none" stroke={danger ? '#ef4444' : '#092447'}
          viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
        </svg>
      </div>

      {/* Text */}
      <div>
        <p style={{
          fontSize: '0.875rem', fontWeight: '600', margin: 0,
          color: danger ? '#dc2626' : '#10233f',
        }}>{label}</p>
        {description && (
          <p style={{
            fontSize: '0.75rem', color: '#8a9ab5',
            margin: '2px 0 0', lineHeight: '1.4',
          }}>{description}</p>
        )}
      </div>
    </div>
  </Link>
);

/* ── Mobile menu link ─────────────────────────────────────── */
const MobileLink = ({ to, label, icon, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);
  return (
    <Link
      to={to}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '11px 16px', borderRadius: '10px',
        fontSize: '0.875rem', fontWeight: isActive ? '600' : '500',
        color: isActive ? '#ffffff' : 'rgba(255,255,255,0.70)',
        background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
        textDecoration: 'none',
        borderLeft: isActive ? '3px solid #f0b429' : '3px solid transparent',
        transition: 'all 0.2s ease',
      }}
    >
      {icon && (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
        </svg>
      )}
      {label}
    </Link>
  );
};

/* ══════════════════════════════════════════════════════════
   Main NavBar Component
   ══════════════════════════════════════════════════════════ */
const NavBar = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef(null);

  const role = currentUser?.role || 'participant';
  const isAdmin = role === 'admin';
  const isOrganizer = role === 'organizer';
  const initials = `${currentUser?.firstName?.charAt(0) || ''}${currentUser?.lastName?.charAt(0) || ''}`.toUpperCase();
  const badge = ROLE_BADGE[role] || ROLE_BADGE.participant;

  /* ── Scroll shadow ──────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Close dropdown on outside click ───────────────── */
  useEffect(() => {
    const h = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  /* ── Close menus on route change ────────────────────── */
  useEffect(() => {
    setMobileOpen(false);
    setDropOpen(false);
  }, [location.pathname]);

  const handleSignOut = () => { signOut(); navigate('/signin'); };

  /* ── Nav links per role ──────────────────────────────── */
  const mainLinks = [
    ...(isAdmin
      ? [{ to: '/admin-dashboard', label: 'Admin', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' }]
      : isOrganizer
        ? [{ to: '/organizer-dashboard', label: 'Dashboard', icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7' }]
        : [{ to: '/home', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' }]),
    { to: '/events', label: 'Events', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { to: '/announcements', label: 'Announcements', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
    { to: '/clubs', label: 'Clubs', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  ];

  const dashItems = isAdmin ? [
    { to: '/admin-dashboard', label: 'Admin Dashboard', description: 'Manage events, users and platform', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { to: '/user-management', label: 'User Management', description: 'View and manage all users', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { to: '/risk-analysis', label: 'Risk Analysis', description: 'Analyze user behavior and risks', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  ] : isOrganizer ? [
    { to: '/organizer-dashboard', label: 'My Dashboard', description: 'View and manage your events', icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7' },
    { to: '/events/create', label: 'Create Event', description: 'Submit a new campus event', icon: 'M12 4v16m8-8H4' },
  ] : [];

  const accItems = [
    { to: '/profile', label: 'My Profile', description: 'View and edit your details', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { to: '/settings', label: 'Settings', description: 'Notification preferences', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ];

  /* ── Render ──────────────────────────────────────────── */
  return (
    <nav style={{
      background: 'linear-gradient(135deg, #0f3560 0%, #1a4f7f 60%, #154070 100%',
      boxShadow: scrolled
        ? '0 4px 24px rgba(9,36,71,0.40), 0 1px 0 rgba(240,180,41,0.15)'
        : '0 1px 0 rgba(255,255,255,0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      transition: 'box-shadow 0.3s ease',
    }}>

      {/* Gold top accent line */}
      <div style={{
        height: '2px',
        background: 'linear-gradient(90deg, transparent 0%, #f0b429 30%, #f5c84a 50%, #f0b429 70%, transparent 100%)',
      }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', height: '64px',
        }}>

          {/* ── Brand / Logo ─────────────────────────── */}
          <Link
            to="/home"
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              textDecoration: 'none', flexShrink: 0,
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <SLIITLogo size={36} />
            <div className="hidden sm:block">
              <p style={{
                color: '#ffffff', fontWeight: '800',
                fontSize: '0.9rem', lineHeight: 1.1,
                letterSpacing: '0.3px',
              }}>SLIIT EventHub</p>
              <p style={{
                color: 'rgba(240,180,41,0.75)',
                fontSize: '0.68rem', lineHeight: 1.2,
                fontWeight: '500', letterSpacing: '0.8px',
                textTransform: 'uppercase',
              }}>Event Management</p>
            </div>
          </Link>

          {/* ── Desktop Links ─────────────────────────── */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: '4px' }}>
            {mainLinks.map(l => <NavLink key={l.to} {...l} />)}
          </div>

          {/* ── Right Side ───────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

            {/* Bell icon */}
            <Link
              to="/announcements"
              className="hidden sm:flex"
              style={{
                width: '36px', height: '36px',
                alignItems: 'center', justifyContent: 'center',
                borderRadius: '10px',
                color: 'rgba(255,255,255,0.60)',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.05)',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#f0b429';
                e.currentTarget.style.background = 'rgba(240,180,41,0.12)';
                e.currentTarget.style.borderColor = 'rgba(240,180,41,0.30)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.60)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </Link>

            {/* ── Profile Dropdown ─────────────────── */}
            <div style={{ position: 'relative' }} ref={dropRef}>
              <button
                onClick={() => setDropOpen(!dropOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '5px 8px 5px 5px',
                  borderRadius: '12px',
                  background: dropOpen ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)',
                  border: `1px solid ${dropOpen ? 'rgba(240,180,41,0.35)' : 'rgba(255,255,255,0.10)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  if (!dropOpen) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
                  }
                }}
                onMouseLeave={e => {
                  if (!dropOpen) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
                  }
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '30px', height: '30px', borderRadius: '8px',
                  background: 'linear-gradient(135deg, #f5c84a, #d99e1a)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#092447', fontSize: '0.7rem', fontWeight: '800',
                  flexShrink: 0, overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(240,180,41,0.40)',
                }}>
                  {currentUser?.profilePhoto
                    ? <img src={currentUser.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (initials || 'U')
                  }
                </div>

                {/* Name + role */}
                <div className="hidden md:block" style={{ textAlign: 'left' }}>
                  <p style={{
                    color: '#ffffff', fontSize: '0.75rem',
                    fontWeight: '600', lineHeight: 1.1, margin: 0,
                  }}>
                    {currentUser?.firstName} {currentUser?.lastName}
                  </p>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: '600',
                    padding: '1px 6px', borderRadius: '9999px',
                    background: badge.bg, color: badge.color,
                    textTransform: 'capitalize',
                  }}>
                    {role}
                  </span>
                </div>

                {/* Chevron */}
                <svg
                  width="14" height="14" fill="none"
                  stroke="rgba(255,255,255,0.50)" viewBox="0 0 24 24"
                  style={{ transition: 'transform 0.2s ease', transform: dropOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* ── Dropdown Panel ─────────────────── */}
              {dropOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  width: '288px',
                  background: '#ffffff',
                  borderRadius: '16px',
                  boxShadow: '0 20px 60px rgba(9,36,71,0.20), 0 4px 16px rgba(9,36,71,0.10)',
                  border: '1px solid rgba(9,36,71,0.08)',
                  overflow: 'hidden',
                  animation: 'scaleIn 0.18s ease both',
                  zIndex: 100,
                }}>

                  {/* Dropdown header */}
                  <div style={{
                    padding: '16px',
                    background: 'linear-gradient(135deg, #061830 0%, #092447 60%, #1a4f9c 100%)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {/* Large avatar */}
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                        background: 'linear-gradient(135deg, #f5c84a, #d99e1a)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#092447', fontSize: '0.875rem', fontWeight: '800',
                        overflow: 'hidden',
                        boxShadow: '0 4px 12px rgba(240,180,41,0.50)',
                      }}>
                        {currentUser?.profilePhoto
                          ? <img src={currentUser.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : (initials || 'U')
                        }
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{
                          color: '#ffffff', fontSize: '0.9rem',
                          fontWeight: '700', margin: 0, lineHeight: 1.2,
                        }}>
                          {currentUser?.firstName} {currentUser?.lastName}
                        </p>
                        <p style={{
                          color: 'rgba(255,255,255,0.55)', fontSize: '0.72rem',
                          margin: '2px 0 4px', overflow: 'hidden',
                          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {currentUser?.email}
                        </p>
                        <span style={{
                          fontSize: '0.68rem', fontWeight: '700',
                          padding: '2px 8px', borderRadius: '9999px',
                          background: 'rgba(240,180,41,0.20)',
                          color: '#f0b429',
                          textTransform: 'capitalize',
                          letterSpacing: '0.5px',
                        }}>
                          {role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dropdown body */}
                  <div style={{ padding: '8px' }}>
                    {/* Dashboard section */}
                    {dashItems.length > 0 && (
                      <>
                        <p style={{
                          fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.8px',
                          textTransform: 'uppercase', color: '#8a9ab5',
                          padding: '6px 12px 4px',
                        }}>Dashboard</p>
                        {dashItems.map(i => (
                          <DropdownItem key={i.to} {...i} onClick={() => setDropOpen(false)} />
                        ))}
                        <div style={{ height: '1px', background: '#f0f3f8', margin: '6px 0' }} />
                      </>
                    )}

                    {/* Account section */}
                    <p style={{
                      fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.8px',
                      textTransform: 'uppercase', color: '#8a9ab5',
                      padding: '4px 12px 4px',
                    }}>Account</p>
                    {accItems.map(i => (
                      <DropdownItem key={i.to} {...i} onClick={() => setDropOpen(false)} />
                    ))}

                    <div style={{ height: '1px', background: '#f0f3f8', margin: '6px 0' }} />

                    {/* Sign Out */}
                    <button
                      onClick={() => { setDropOpen(false); handleSignOut(); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '10px 12px', borderRadius: '10px',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fff1f2'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(239,68,68,0.10)',
                      }}>
                        <svg width="16" height="16" fill="none" stroke="#ef4444" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#dc2626' }}>
                        Sign Out
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Mobile Hamburger ─────────────────── */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden"
              style={{
                width: '36px', height: '36px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)',
                background: mobileOpen ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.75)',
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ───────────────────────────── */}
        {mobileOpen && (
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: '12px 0 16px',
            display: 'flex', flexDirection: 'column', gap: '4px',
            animation: 'fadeInUp 0.2s ease both',
          }}
            className="md:hidden"
          >
            {mainLinks.map(l => (
              <MobileLink key={l.to} {...l} onClick={() => setMobileOpen(false)} />
            ))}

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '8px 0' }} />

            <MobileLink to="/profile" label="My Profile" onClick={() => setMobileOpen(false)}
              icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            <MobileLink to="/settings" label="Settings" onClick={() => setMobileOpen(false)}
              icon="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />

            <button
              onClick={() => { setMobileOpen(false); handleSignOut(); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '11px 16px', borderRadius: '10px', margin: '4px 0 0',
                background: 'rgba(239,68,68,0.10)',
                border: '1px solid rgba(239,68,68,0.20)',
                color: '#fca5a5', fontSize: '0.875rem', fontWeight: '600',
                cursor: 'pointer', width: '100%', textAlign: 'left',
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
