import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import eventApi from '../api/eventApi';
import Button   from '../components/ui/Button';

const STATUS_STYLES = {
  pending:   'bg-yellow-100 text-yellow-700',
  approved:  'bg-green-100  text-green-700',
  rejected:  'bg-red-100    text-red-700',
  completed: 'bg-gray-100   text-gray-600',
  cancelled: 'bg-red-50     text-red-500',
};

const STATUS_ICONS = { pending:'🕐', approved:'✅', rejected:'❌', completed:'🏁', cancelled:'🚫' };

const CATEGORY_STYLES = {
  Academic:'bg-blue-100 text-blue-700', Workshop:'bg-purple-100 text-purple-700',
  Sports:'bg-green-100 text-green-700', Cultural:'bg-pink-100 text-pink-700',
  Social:'bg-yellow-100 text-yellow-700', Seminar:'bg-orange-100 text-orange-700',
  Competition:'bg-red-100 text-red-700',
};

const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });

// ── Simple bar chart ───────────────────────────────────────
const BarChart = ({ data }) => {
  const max    = Math.max(...data.map((d) => d.value), 1);
  const COLORS = {
    approved:  { bar: 'bg-green-500',  label: 'bg-green-100 text-green-700' },
    pending:   { bar: 'bg-yellow-400', label: 'bg-yellow-100 text-yellow-700' },
    rejected:  { bar: 'bg-red-500',    label: 'bg-red-100 text-red-700' },
    completed: { bar: 'bg-gray-400',   label: 'bg-gray-100 text-gray-600' },
    cancelled: { bar: 'bg-red-300',    label: 'bg-red-50 text-red-400' },
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-sm font-bold text-gray-700 mb-5">Event Status Overview</h3>
      <div className="space-y-3">
        {data.map(({ key, label, value }) => {
          const cfg   = COLORS[key] || { bar: 'bg-indigo-500', label: 'bg-indigo-100 text-indigo-700' };
          const width = max === 0 ? 0 : Math.round((value / max) * 100);
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${cfg.label}`}>
                  {label}
                </span>
                <span className="text-sm font-bold text-gray-800">{value}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-700 ${cfg.bar}`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OrganizerDashboardPage = () => {
  const [myEvents,  setMyEvents]  = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter,    setFilter]    = useState('all');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await eventApi.getMyEvents();
        setMyEvents(res.data || []);
      } catch { /* fail silently */ }
      finally { setIsLoading(false); }
    };
    load();
  }, []);

  const stats = {
    total:     myEvents.length,
    approved:  myEvents.filter((e) => e.status === 'approved').length,
    pending:   myEvents.filter((e) => e.status === 'pending').length,
    rejected:  myEvents.filter((e) => e.status === 'rejected').length,
    completed: myEvents.filter((e) => e.status === 'completed').length,
  };

  const chartData = [
    { key: 'approved',  label: 'Approved',  value: stats.approved  },
    { key: 'pending',   label: 'Pending',   value: stats.pending   },
    { key: 'rejected',  label: 'Rejected',  value: stats.rejected  },
    { key: 'completed', label: 'Completed', value: stats.completed },
  ];

  const filtered = filter === 'all' ? myEvents : myEvents.filter((e) => e.status === filter);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Organiser Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your campus events</p>
        </div>
        <Link to="/events/create">
          <Button size="md">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
            </svg>
            Create Event
          </Button>
        </Link>
      </div>

      {/* Stats + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Events',      value: stats.total,     gradient: 'from-gray-700 to-gray-800' },
            { label: 'Approved & Live',   value: stats.approved,  gradient: 'from-green-600 to-green-700' },
            { label: 'Pending Approval',  value: stats.pending,   gradient: 'from-yellow-500 to-yellow-600' },
            { label: 'Rejected',          value: stats.rejected,  gradient: 'from-red-500 to-red-600' },
          ].map(({ label, value, gradient }) => (
            <div key={label}
                 className={`rounded-2xl p-4 text-white bg-gradient-to-br ${gradient} shadow-md`}>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs font-medium opacity-90 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        {!isLoading && <BarChart data={chartData}/>}
      </div>

      {/* Events list */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Filter tabs */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex gap-1 flex-wrap">
            {['all','approved','pending','rejected','completed'].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors
                  ${filter===f ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                {f}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-400">{filtered.length} event{filtered.length!==1?'s':''}</span>
        </div>

        {/* List */}
        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"/>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-400 text-sm">No events found.</p>
              {filter==='all' && (
                <Link to="/events/create" className="mt-3 text-sm text-indigo-600 hover:underline">
                  Create your first event →
                </Link>
              )}
            </div>
          ) : (
            filtered.map((event) => (
              <div key={event.id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors">
                <span className="text-lg flex-shrink-0">{STATUS_ICONS[event.status]||'📋'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <Link to={`/events/${event.id}`} className="text-sm font-semibold text-gray-800 hover:text-indigo-600 transition-colors truncate">
                      {event.title}
                    </Link>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[event.status]||'bg-gray-100 text-gray-600'}`}>{event.status}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${CATEGORY_STYLES[event.category]||'bg-gray-100 text-gray-600'}`}>{event.category}</span>
                    {event.hasConflict && <span className="text-xs text-yellow-600 font-medium">⚠️ Conflict</span>}
                  </div>
                  <p className="text-xs text-gray-400">{formatDate(event.eventDate)} · {event.startTime}–{event.endTime} · {event.venue} · {event.participantCount}/{event.capacity} registered</p>
                  {event.status==='rejected'&&event.rejectionReason&&(
                    <p className="text-xs text-red-500 mt-0.5">Reason: {event.rejectionReason}</p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link to={`/events/${event.id}`}><Button variant="ghost" size="sm">View</Button></Link>
                  {(event.status==='pending'||event.status==='approved')&&(
                    <Link to={`/events/${event.id}/edit`}><Button variant="secondary" size="sm">Edit</Button></Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Help box */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
        <svg className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div>
          <p className="text-sm font-medium text-indigo-800">How event approval works</p>
          <p className="text-xs text-indigo-600 mt-0.5 leading-relaxed">
            After creating an event it goes <strong>Pending</strong>. An admin reviews it and either <strong>Approves</strong> or <strong>Rejects</strong> it. Once approved, students can register.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboardPage;
