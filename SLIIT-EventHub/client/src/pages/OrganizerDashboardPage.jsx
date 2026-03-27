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

const STATUS_ICONS = {
  pending:   '🕐',
  approved:  '✅',
  rejected:  '❌',
  completed: '🏁',
  cancelled: '🚫',
};

const CATEGORY_STYLES = {
  Academic:    'bg-blue-100   text-blue-700',
  Workshop:    'bg-purple-100 text-purple-700',
  Sports:      'bg-green-100  text-green-700',
  Cultural:    'bg-pink-100   text-pink-700',
  Social:      'bg-yellow-100 text-yellow-700',
  Seminar:     'bg-orange-100 text-orange-700',
  Competition: 'bg-red-100    text-red-700',
};

const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric'
});

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
      } catch {
        // handle silently
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Stats
  const stats = {
    total:     myEvents.length,
    approved:  myEvents.filter((e) => e.status === 'approved').length,
    pending:   myEvents.filter((e) => e.status === 'pending').length,
    rejected:  myEvents.filter((e) => e.status === 'rejected').length,
  };

  // Filtered events
  const filtered = filter === 'all'
    ? myEvents
    : myEvents.filter((e) => e.status === filter);

  return (
    <div className="space-y-6">

      {/* Page heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Organiser Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your campus events
          </p>
        </div>
        <Link to="/events/create">
          <Button size="md">
            <svg className="w-4 h-4" fill="none"
                 stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth="2" d="M12 4v16m8-8H4"/>
            </svg>
            Create Event
          </Button>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Events',     value: stats.total,    color: 'bg-gray-700'    },
          { label: 'Approved & Live',  value: stats.approved, color: 'bg-green-600'   },
          { label: 'Awaiting Approval',value: stats.pending,  color: 'bg-yellow-500'  },
          { label: 'Rejected',         value: stats.rejected, color: 'bg-red-500'     },
        ].map(({ label, value, color }) => (
          <div key={label}
               className="bg-white rounded-xl border border-gray-200
                          shadow-sm p-4 text-center">
            <p className={`text-3xl font-bold text-white rounded-xl
                          py-2 mb-2 ${color}`}>
              {value}
            </p>
            <p className="text-xs text-gray-500 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Events list */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm
                      overflow-hidden">

        {/* Filter tabs */}
        <div className="flex items-center justify-between px-4 py-3
                        border-b border-gray-200">
          <div className="flex gap-1">
            {['all','approved','pending','rejected','completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium
                           transition-colors capitalize
                           ${filter === f
                             ? 'bg-gray-800 text-white'
                             : 'text-gray-500 hover:bg-gray-100'
                           }`}
              >
                {f}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-400">
            {filtered.length} event{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* List */}
        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-gray-200
                              border-t-gray-600 rounded-full animate-spin"/>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-400 text-sm">No events found.</p>
              {filter === 'all' && (
                <Link to="/events/create"
                      className="mt-3 text-sm text-gray-600 hover:underline">
                  Create your first event →
                </Link>
              )}
            </div>
          ) : (
            filtered.map((event) => (
              <div key={event.id}
                   className="flex items-center gap-4 px-4 py-3
                              hover:bg-gray-50 transition-colors">

                {/* Status icon */}
                <span className="text-lg flex-shrink-0">
                  {STATUS_ICONS[event.status] || '📋'}
                </span>

                {/* Event info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <Link
                      to={`/events/${event.id}`}
                      className="text-sm font-semibold text-gray-800
                                 hover:text-gray-600 transition-colors truncate"
                    >
                      {event.title}
                    </Link>
                    <span className={`px-2 py-0.5 rounded-full text-xs
                                     font-semibold capitalize
                                     ${STATUS_STYLES[event.status] ||
                                       'bg-gray-100 text-gray-600'}`}>
                      {event.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs
                                     font-semibold
                                     ${CATEGORY_STYLES[event.category] ||
                                       'bg-gray-100 text-gray-600'}`}>
                      {event.category}
                    </span>
                    {event.hasConflict && (
                      <span className="text-xs text-yellow-600 font-medium">
                        ⚠️ Conflict
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    {formatDate(event.eventDate)}
                    {' · '}
                    {event.startTime} – {event.endTime}
                    {' · '}
                    {event.venue}
                    {' · '}
                    {event.participantCount}/{event.capacity} registered
                  </p>
                  {/* Rejection reason */}
                  {event.status === 'rejected' && event.rejectionReason && (
                    <p className="text-xs text-red-500 mt-0.5">
                      Reason: {event.rejectionReason}
                    </p>
                  )}
                </div>

                {/* Action links */}
                <div className="flex gap-2 flex-shrink-0">
                  <Link to={`/events/${event.id}`}>
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                  {(event.status === 'pending' || event.status === 'approved') && (
                    <Link to={`/events/${event.id}/edit`}>
                      <Button variant="secondary" size="sm">Edit</Button>
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Help box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4
                      flex items-start gap-3">
        <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div>
          <p className="text-sm font-medium text-blue-800">
            How event approval works
          </p>
          <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
            After you create an event, it goes to <strong>Pending</strong> status.
            An admin reviews it and either <strong>Approves</strong> or
            <strong> Rejects</strong> it. Once approved, students can
            discover and register for your event.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboardPage;
