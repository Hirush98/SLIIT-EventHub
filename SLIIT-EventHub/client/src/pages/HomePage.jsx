import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import eventApi        from '../api/eventApi';
import announcementApi from '../api/announcementApi';
import orderApi from '../api/orderApi';

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

const formatTimeAgo = (date, nowTs) => {
  const diff = Math.floor((nowTs - new Date(date).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const StatCard = ({ label, value, icon, gradient, subtext }) => (
  <div className={`rounded-[28px] border border-white/20 bg-gradient-to-br ${gradient} p-5 text-white shadow-[0_22px_48px_rgba(9,36,71,0.18)] backdrop-blur`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-3xl font-bold">{value ?? '—'}</p>
        <p className="text-sm font-medium opacity-90 mt-0.5">{label}</p>
        {subtext && <p className="text-xs opacity-70 mt-1">{subtext}</p>}
      </div>
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-white/18">
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
      className="group flex overflow-hidden rounded-[26px] border border-white/70 bg-white/92 shadow-[0_18px_40px_rgba(9,36,71,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_48px_rgba(9,36,71,0.14)]">
      <div className={`w-16 flex-shrink-0 bg-gradient-to-b ${gradient} flex flex-col items-center justify-center text-white`}>
        <span className="text-2xl font-bold leading-tight">{day}</span>
        <span className="text-xs font-medium uppercase opacity-90">{month}</span>
      </div>
      <div className="flex-1 p-4 min-w-0">
        <p className="truncate text-sm font-semibold text-slate-800 transition-colors group-hover:text-[#1a4f9c]">{event.title}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {event.startTime} · {event.venue}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-slate-400">{event.category}</span>
          <span className="text-xs font-medium text-[#1a4f9c]">
            {event.spotsRemaining ?? (event.capacity - event.participantCount)} spots
          </span>
        </div>
      </div>
    </Link>
  );
};

const AnnouncementItem = ({ ann, nowTs }) => {
  const p = PRIORITY_STYLES[ann.priority] || PRIORITY_STYLES.normal;
  return (
    <div className="flex gap-3 rounded-2xl p-3 transition-colors hover:bg-slate-50/90">
      <div className={`w-1 rounded-full flex-shrink-0 self-stretch ${p.bar}`}/>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold leading-snug text-slate-800">{ann.title}</p>
          <span className="flex-shrink-0 text-xs text-slate-400">{formatTimeAgo(ann.createdAt, nowTs)}</span>
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500">{ann.content}</p>
        <p className="mt-1 text-xs text-slate-400">by {ann.authorName}</p>
      </div>
    </div>
  );
};

const merchStatusCopy = (order) => {
  if (order.orderStatus === 'completed') {
    return 'Order completed.';
  }

  if (order.paymentMethod === 'collection') {
    return 'Collect your order.';
  }

  return order.paymentStatus === 'confirmed'
    ? 'Payment confirmed. Collect the merch at the outlet.'
    : 'Payment confirmation pending.';
};

const HomePage = () => {
  const { currentUser } = useSelector((s) => s.user);
  const role = currentUser?.role || 'participant';
  const [stats, setStats]               = useState(null);
  const [upcoming, setUpcoming]         = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [myOrders, setMyOrders]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [nowTs, setNowTs]               = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowTs(Date.now());
    }, 60000);
    return () => window.clearInterval(intervalId);
  }, []);

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
        if (role === 'participant') {
          try {
            const orderRes = await orderApi.getMyOrders();
            setMyOrders(orderRes.orders || []);
          } catch {
            setMyOrders([]);
          }
        }
      } catch { /* fail silently */ }
      finally { setLoading(false); }
    };
    load();
  }, [role]);

  const greetingSuffix = { admin: "Here's your platform overview.", organizer: "Ready to manage your events?", participant: "Discover what's happening on campus." }[role] || '';
  const ongoingOrders = myOrders.filter((order) => order.orderStatus !== 'completed');

  return (
    <div className="space-y-8">

      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,#092447_0%,#0f3564_48%,#1a4f9c_100%)] p-6 text-white shadow-[0_30px_60px_rgba(9,36,71,0.22)] md:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-[rgba(240,180,41,0.12)] blur-2xl"/>
        <div className="pointer-events-none absolute -bottom-14 -left-10 h-44 w-44 rounded-full bg-white/6 blur-xl"/>
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 text-sm font-medium text-[#f4d27a]">Welcome back</p>
              <h1 className="text-2xl md:text-3xl font-bold">{currentUser?.firstName} {currentUser?.lastName}</h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-200/80">{greetingSuffix}</p>
            </div>
            <span className="hidden rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold capitalize text-slate-100 sm:block">{role}</span>
          </div>
          <div className="flex flex-wrap gap-3 mt-5">
            <Link to="/events" className="flex items-center gap-2 rounded-2xl bg-[#f0b429] px-4 py-2 text-sm font-semibold text-[#092447] shadow-[0_12px_24px_rgba(240,180,41,0.24)] transition-all hover:-translate-y-0.5 hover:bg-[#f4c552]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              Browse Events
            </Link>
            {(role==='organizer'||role==='admin') && (
              <Link to="/events/create" className="flex items-center gap-2 rounded-2xl border border-white/18 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/18">
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
            <h2 className="text-lg font-bold text-slate-800">Upcoming Events</h2>
            <Link to="/events" className="text-sm font-medium text-[#1a4f9c] hover:text-[#092447]">View all →</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-20 rounded-2xl bg-gray-200 animate-pulse"/>)}</div>
          ) : upcoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[26px] border border-white/70 bg-white/92 py-12 shadow-[0_18px_40px_rgba(9,36,71,0.08)]">
              <p className="text-sm text-slate-400">No upcoming events</p>
            </div>
          ) : (
            <div className="space-y-3">{upcoming.map(e=><UpcomingCard key={e.id} event={e}/>)}</div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Announcements</h2>
            <Link to="/announcements" className="text-sm font-medium text-[#1a4f9c] hover:text-[#092447]">View all →</Link>
          </div>
          <div className="overflow-hidden rounded-[26px] border border-white/70 bg-white/92 shadow-[0_18px_40px_rgba(9,36,71,0.08)]">
            {loading ? (
              <div className="p-4 space-y-3">{[1,2,3].map(i=><div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse"/>)}</div>
            ) : announcements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <p className="text-sm text-slate-400">No announcements yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {announcements.slice(0,5).map(a=><AnnouncementItem key={a._id} ann={a} nowTs={nowTs}/>)}
              </div>
            )}
          </div>
        </div>
      </div>

      {role === 'participant' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Ongoing Merchandise Orders</h2>
            <Link to="/orders" className="text-sm font-medium text-[#1a4f9c] hover:text-[#092447]">Order history →</Link>
          </div>
          {ongoingOrders.length === 0 ? (
            <div className="rounded-[26px] border border-white/70 bg-white/92 p-6 shadow-[0_18px_40px_rgba(9,36,71,0.08)]">
              <p className="text-sm text-slate-500">No ongoing merchandise orders. Completed orders are available in order history.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ongoingOrders.slice(0, 4).map((order) => (
                <div key={order.id} className="rounded-[26px] border border-white/70 bg-white/92 p-5 shadow-[0_18px_40px_rgba(9,36,71,0.08)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold tracking-[0.18em] uppercase text-amber-600">{order.id}</p>
                      <p className="mt-1 text-sm text-slate-500">{new Date(order.placedAt).toLocaleString()}</p>
                    </div>
                    <span className="rounded-full bg-[rgba(26,79,156,0.1)] px-3 py-1 text-xs font-semibold text-[#1a4f9c]">
                      {order.paymentMethod === 'bank' ? 'Bank Transfer' : 'Pay at Collection'}
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-800">{merchStatusCopy(order)}</p>
                  <p className="mt-2 text-sm text-slate-500">Items: {order.items.length}</p>
                  <p className="text-sm text-slate-500">Full amount: Rs. {Number(order.total || 0).toLocaleString()}</p>
                  <Link
                    to={`/orders/view/${order.rawId}`}
                    state={{ from: "/home", label: "Back to Home" }}
                    className="mt-4 inline-flex min-h-[42px] items-center justify-center rounded-full border border-[rgba(26,79,156,0.18)] bg-[rgba(26,79,156,0.08)] px-4 text-sm font-semibold text-[var(--sliit-blue)] transition-all hover:-translate-y-0.5 hover:bg-[rgba(26,79,156,0.14)]"
                  >
                    View Order
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Info strip */}
      <div className="flex items-center gap-3 rounded-[26px] border border-[rgba(26,79,156,0.12)] bg-[linear-gradient(135deg,rgba(26,79,156,0.08),rgba(240,180,41,0.08))] p-4">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[#1a4f9c]">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#092447]">SLIIT EventHub · IT3040 ITPM 2025</p>
          <p className="mt-0.5 text-xs text-[#1a4f9c]">Group 279 · B.H. Kavinda · Y.M.K. Wikramasinghe · Munasinghe M.A.E.S · Wikramasingha W.M.V.U</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
