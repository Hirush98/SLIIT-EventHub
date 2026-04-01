import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import eventApi        from '../api/eventApi';
import announcementApi from '../api/announcementApi';

const PRIORITY_STYLES = {
  urgent: { bar: 'bg-red-500',    badge: 'bg-red-100 text-red-700' },
  high:   { bar: 'bg-orange-400', badge: 'bg-orange-100 text-orange-700' },
  normal: { bar: 'bg-indigo-500', badge: 'bg-indigo-100 text-indigo-700' },
  low:    { bar: 'bg-gray-400',   badge: 'bg-gray-100 text-gray-600' },
};

const CATEGORY_COLOURS = {
  Academic:'from-blue-500 to-blue-600', Workshop:'from-purple-500 to-purple-600',
  Sports:'from-green-500 to-green-600', Cultural:'from-pink-500 to-pink-600',
  Social:'from-yellow-500 to-yellow-600', Seminar:'from-orange-500 to-orange-600',
  Competition:'from-red-500 to-red-600',
};

const StatCard = ({ label, value, icon, gradient, subtext }) => (
  <div className={`rounded-2xl p-5 text-white bg-gradient-to-br ${gradient} shadow-md`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-3xl font-bold">{value ?? '—'}</p>
        <p className="text-sm font-medium opacity-90 mt-0.5">{label}</p>
        {subtext && <p className="text-xs opacity-70 mt-1">{subtext}</p>}
      </div>
      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon}/>
        </svg>
      </div>
    </div>
  </div>
);

const UpcomingCard = ({ event }) => {
  const gradient  = CATEGORY_COLOURS[event.category] || 'from-gray-500 to-gray-600';
  const eventDate = new Date(event.eventDate);
  const day       = eventDate.toLocaleDateString('en-GB', { day: '2-digit' });
  const month     = eventDate.toLocaleDateString('en-GB', { month: 'short' });
  return (
    <Link to={`/events/${event.id}`}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex">
      <div className={`w-16 flex-shrink-0 bg-gradient-to-b ${gradient} flex flex-col items-center justify-center text-white`}>
        <span className="text-2xl font-bold leading-tight">{day}</span>
        <span className="text-xs font-medium uppercase opacity-90">{month}</span>
      </div>
      <div className="flex-1 p-4 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-indigo-600 transition-colors">{event.title}</p>
        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {event.startTime} · {event.venue}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-400">{event.category}</span>
          <span className="text-xs font-medium text-indigo-600">
            {event.spotsRemaining ?? (event.capacity - event.participantCount)} spots
          </span>
        </div>
      </div>
    </Link>
  );
};

const AnnouncementItem = ({ ann }) => {
  const p = PRIORITY_STYLES[ann.priority] || PRIORITY_STYLES.normal;
  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  };
  return (
    <div className="flex gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
      <div className={`w-1 rounded-full flex-shrink-0 self-stretch ${p.bar}`}/>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-gray-800 leading-snug">{ann.title}</p>
          <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(ann.createdAt)}</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{ann.content}</p>
        <p className="text-xs text-gray-400 mt-1">by {ann.authorName}</p>
      </div>
    </div>
  );
};

const HomePage = () => {
  const { currentUser } = useSelector((s) => s.user);
  const role = currentUser?.role || 'participant';
  const [stats, setStats]               = useState(null);
  const [upcoming, setUpcoming]         = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [evRes, annRes] = await Promise.allSettled([
          eventApi.getAllEvents({ limit: 100, status: 'approved' }),
          announcementApi.getLatest()
        ]);
        if (evRes.status === 'fulfilled') {
          const all    = evRes.value.data || [];
          const now    = new Date();
          const future = all.filter((e) => new Date(e.eventDate) >= now)
                            .sort((a,b) => new Date(a.eventDate) - new Date(b.eventDate));
          setUpcoming(future.slice(0, 3));
          setStats({
            total:         all.length,
            upcoming:      future.length,
            active:        all.filter((e) => e.status === 'approved').length,
            registrations: all.reduce((s, e) => s + (e.participantCount || 0), 0)
          });
        }
        if (annRes.status === 'fulfilled') setAnnouncements(annRes.value.data || []);
      } catch { /* fail silently */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const greetingSuffix = { admin: "Here's your platform overview.", organizer: "Ready to manage your events?", participant: "Discover what's happening on campus." }[role] || '';

  return (
    <div className="space-y-8">

      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-r from-gray-900 to-indigo-900 p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white/5 pointer-events-none"/>
        <div className="absolute -bottom-12 -left-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none"/>
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-indigo-300 text-sm font-medium mb-1">Welcome back 👋</p>
              <h1 className="text-2xl md:text-3xl font-bold">{currentUser?.firstName} {currentUser?.lastName}</h1>
              <p className="text-gray-400 text-sm mt-1">{greetingSuffix}</p>
            </div>
            <span className="hidden sm:block px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-indigo-200 capitalize border border-white/20">{role}</span>
          </div>
          <div className="flex flex-wrap gap-3 mt-5">
            <Link to="/events" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              Browse Events
            </Link>
            {(role==='organizer'||role==='admin') && (
              <Link to="/events/create" className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                Create Event
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Events"    value={loading?'...':stats?.total}         gradient="from-indigo-500 to-indigo-600"  subtext="All approved events" icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        <StatCard label="Upcoming Events" value={loading?'...':stats?.upcoming}      gradient="from-violet-500 to-violet-600"  subtext="Scheduled in future"  icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        <StatCard label="Active Events"   value={loading?'...':stats?.active}        gradient="from-emerald-500 to-emerald-600" subtext="Currently approved"  icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        <StatCard label="Registrations"   value={loading?'...':stats?.registrations} gradient="from-orange-500 to-orange-600"  subtext="Total all events"     icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
      </div>

      {/* Upcoming + Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Upcoming Events</h2>
            <Link to="/events" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View all →</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-20 rounded-2xl bg-gray-200 animate-pulse"/>)}</div>
          ) : upcoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-gray-100">
              <p className="text-sm text-gray-400">No upcoming events</p>
            </div>
          ) : (
            <div className="space-y-3">{upcoming.map(e=><UpcomingCard key={e.id} event={e}/>)}</div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Announcements</h2>
            <Link to="/announcements" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View all →</Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-4 space-y-3">{[1,2,3].map(i=><div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse"/>)}</div>
            ) : announcements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <p className="text-sm text-gray-400">No announcements yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {announcements.slice(0,5).map(a=><AnnouncementItem key={a._id} ann={a}/>)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info strip */}
      <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-indigo-800">SLIIT EventHub · IT3040 ITPM 2025</p>
          <p className="text-xs text-indigo-600 mt-0.5">Group 279 · B.H. Kavinda · Y.M.K. Wikramasinghe · Munasinghe M.A.E.S · Wikramasingha W.M.V.U</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
