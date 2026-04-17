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

// Stat card
const StatCard = ({ label, value, icon, color, subtext }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm
                  p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                     flex-shrink-0 ${color}`}>
      <svg className="w-6 h-6 text-white" fill="none"
           stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
              strokeWidth="2" d={icon}/>
      </svg>
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {subtext && <p className="text-xs text-gray-400 mt-0.5">{subtext}</p>}
    </div>
  </div>
);

const AdminDashboardPage = () => {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [allEvents,     setAllEvents]     = useState([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [actionMsg,     setActionMsg]     = useState('');
  const [activeTab,     setActiveTab]     = useState('pending');

  // Fetch events
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        // Fetch pending events for approval queue
        const pendingRes = await eventApi.getAllEvents({ status: 'pending', limit: 50 });
        setPendingEvents(pendingRes.data || []);

        // Fetch all events for overview
        const allRes = await eventApi.getAllEvents({ status: 'approved', limit: 50 });
        setAllEvents(allRes.data || []);
      } catch {
        // handle silently
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Approve or reject an event
  const handleStatusChange = async (eventId, status, title) => {
    let rejectionReason = '';
    if (status === 'rejected') {
      rejectionReason = window.prompt(
        `Enter a reason for rejecting "${title}":`
      );
      if (!rejectionReason) return; // cancelled
    }

    setActionLoading((prev) => ({ ...prev, [eventId]: true }));
    setActionMsg('');

    try {
      await eventApi.updateEventStatus(eventId, status, rejectionReason);
      // Remove from pending list
      setPendingEvents((prev) => prev.filter((e) => e.id !== eventId));
      setActionMsg(
        `"${title}" has been ${status}.`
      );
      setTimeout(() => setActionMsg(''), 4000);
    } catch {
      setActionMsg('Action failed. Please try again.');
    } finally {
      setActionLoading((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  const stats = [
    {
      label:   'Pending Approval',
      value:   pendingEvents.length,
      color:   'bg-yellow-500',
      subtext: pendingEvents.length > 0 ? 'Needs your review' : 'All clear',
      icon:    'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      label:   'Active Events',
      value:   allEvents.length,
      color:   'bg-green-600',
      subtext: 'Currently approved',
      icon:    'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    },
    {
      label:   'Conflict Flagged',
      value:   pendingEvents.filter((e) => e.hasConflict).length,
      color:   'bg-orange-500',
      subtext: 'Require careful review',
      icon:    'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    },
    {
      label:   'Total Events',
      value:   pendingEvents.length + allEvents.length,
      color:   'bg-gray-600',
      subtext: 'All time',
      icon:    'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    },
  ];

  return (
    <div className="space-y-6">

      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage events and platform settings
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Action message */}
      {actionMsg && (
        <div className="px-4 py-3 rounded-lg bg-gray-50 border
                        border-gray-200 text-gray-700 text-sm">
          {actionMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm
                      overflow-hidden">

        {/* Tab header */}
        <div className="flex border-b border-gray-200">
          {[
            { key: 'pending',  label: `Pending Approval (${pendingEvents.length})` },
            { key: 'approved', label: `Active Events (${allEvents.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-sm font-medium transition-colors
                         border-b-2 -mb-px
                         ${activeTab === tab.key
                           ? 'border-gray-800 text-gray-800'
                           : 'border-transparent text-gray-500 hover:text-gray-700'
                         }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-gray-200
                              border-t-gray-600 rounded-full animate-spin"/>
            </div>
          ) : activeTab === 'pending' ? (

            /* ── Pending events list ── */
            pendingEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center
                                justify-center mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none"
                       stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          strokeWidth="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">
                  All caught up!
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  No events waiting for approval.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`rounded-xl border p-4 transition-colors
                               ${event.hasConflict
                                 ? 'border-yellow-200 bg-yellow-50/50'
                                 : 'border-gray-200 bg-white hover:bg-gray-50'
                               }`}
                  >
                    <div className="flex items-start justify-between gap-4">

                      {/* Event info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs
                                           font-semibold
                                           ${CATEGORY_STYLES[event.category] ||
                                             'bg-gray-100 text-gray-600'}`}>
                            {event.category}
                          </span>
                          {event.hasConflict && (
                            <span className="px-2 py-0.5 rounded-full text-xs
                                             font-semibold bg-yellow-100 text-yellow-700
                                             flex items-center gap-1">
                              ⚠️ Time Conflict
                            </span>
                          )}
                        </div>

                        <Link
                          to={`/events/${event.id}`}
                          className="font-semibold text-gray-800 hover:text-gray-600
                                     transition-colors text-sm line-clamp-1"
                        >
                          {event.title}
                        </Link>

                        <div className="flex flex-wrap gap-3 mt-1.5 text-xs
                                        text-gray-500">
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none"
                                 stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7
                                       a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            {formatDate(event.eventDate)}
                          </span>
                          <span>{event.startTime} – {event.endTime}</span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none"
                                 stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0
                                       01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z
                                       M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            {event.venue}
                          </span>
                          <span>by {event.organizerName}</span>
                        </div>

                        {/* Show conflict details if flagged */}
                        {event.hasConflict && event.conflictDetails?.length > 0 && (
                          <div className="mt-2 p-2 bg-yellow-100 rounded-lg
                                          text-xs text-yellow-800">
                            <p className="font-medium mb-1">Conflicts with:</p>
                            {event.conflictDetails.map((c, i) => (
                              <p key={i}>
                                • {c.title} ({c.startTime}–{c.endTime})
                                by {c.organizerName}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(
                            event.id, 'approved', event.title
                          )}
                          isLoading={actionLoading[event.id]}
                          disabled={!!actionLoading[event.id]}
                        >
                          ✓ Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleStatusChange(
                            event.id, 'rejected', event.title
                          )}
                          isLoading={actionLoading[event.id]}
                          disabled={!!actionLoading[event.id]}
                        >
                          ✗ Reject
                        </Button>
                        <Link to={`/events/${event.id}`}>
                          <Button size="sm" variant="ghost"
                                  className="w-full text-center">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )

          ) : (

            /* ── Active events list ── */
            allEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-400 text-sm">No approved events yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {allEvents.map((event) => (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    className="flex items-center justify-between gap-4 p-3
                               rounded-lg border border-gray-100 hover:bg-gray-50
                               transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800
                                   truncate group-hover:text-gray-600">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(event.eventDate)} · {event.venue}
                        · by {event.organizerName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-xs
                                       font-semibold
                                       ${CATEGORY_STYLES[event.category] ||
                                         'bg-gray-100 text-gray-600'}`}>
                        {event.category}
                      </span>
                      <span className="text-xs text-gray-400">
                        {event.participantCount}/{event.capacity}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
