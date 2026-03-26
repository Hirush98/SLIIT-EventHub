import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import eventApi from '../api/eventApi';
import Button   from '../components/ui/Button';

const CATEGORY_STYLES = {
  Academic:    'bg-blue-100   text-blue-700',
  Workshop:    'bg-purple-100 text-purple-700',
  Sports:      'bg-green-100  text-green-700',
  Cultural:    'bg-pink-100   text-pink-700',
  Social:      'bg-yellow-100 text-yellow-700',
  Seminar:     'bg-orange-100 text-orange-700',
  Competition: 'bg-red-100    text-red-700',
};

const STATUS_STYLES = {
  pending:   'bg-yellow-100 text-yellow-700',
  approved:  'bg-green-100  text-green-700',
  rejected:  'bg-red-100    text-red-700',
  completed: 'bg-gray-100   text-gray-700',
  cancelled: 'bg-red-100    text-red-600',
};

const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
});

const EventDetailPage = () => {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const { currentUser } = useSelector((s) => s.user);

  const [event,        setEvent]        = useState(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [error,        setError]        = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg,    setActionMsg]    = useState('');

  // Fetch event details
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await eventApi.getEventById(id);
        setEvent(res.data);
      } catch {
        setError('Event not found or failed to load.');
      } finally { setIsLoading(false); }
    };
    load();
  }, [id]);

  if (isLoading) return (
    <div className="flex justify-center items-center py-20">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600
                      rounded-full animate-spin"/>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="text-gray-500 mb-4">{error}</p>
      <Link to="/events"
            className="text-sm text-gray-600 hover:underline">
        Back to Events
      </Link>
    </div>
  );

  if (!event) return null;

  const isOwner      = currentUser?.id === event.createdBy?.toString() ||
                       currentUser?.id === event.createdBy;
  const isAdmin      = currentUser?.role === 'admin';
  const isRegistered = event.participants?.some(
    (p) => p.userId === currentUser?.id
  );
  const spotsLeft    = event.spotsRemaining ?? (event.capacity - event.participantCount);
  const isPast       = new Date(event.eventDate) < new Date();
  const imageUrl     = eventApi.getImageUrl(event.coverImage);

  // Register for event
  const handleRegister = async () => {
    setActionLoading(true); setActionMsg('');
    try {
      const res = await eventApi.registerForEvent(id);
      setEvent(res.data);
      setActionMsg('Successfully registered!');
    } catch (err) {
      setActionMsg(err.response?.data?.message || 'Registration failed.');
    } finally { setActionLoading(false); }
  };

  // Cancel registration
  const handleCancel = async () => {
    if (!window.confirm('Cancel your registration for this event?')) return;
    setActionLoading(true); setActionMsg('');
    try {
      const res = await eventApi.cancelRegistration(id);
      setEvent(res.data);
      setActionMsg('Registration cancelled.');
    } catch (err) {
      setActionMsg(err.response?.data?.message || 'Failed to cancel.');
    } finally { setActionLoading(false); }
  };

  // Admin approve/reject
  const handleStatusChange = async (status) => {
    const reason = status === 'rejected'
      ? window.prompt('Enter rejection reason:')
      : null;
    if (status === 'rejected' && !reason) return;

    setActionLoading(true);
    try {
      const res = await eventApi.updateEventStatus(id, status, reason);
      setEvent(res.data);
      setActionMsg(`Event ${status} successfully.`);
    } catch {
      setActionMsg('Status update failed.');
    } finally { setActionLoading(false); }
  };

  // Delete event
  const handleDelete = async () => {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    try {
      await eventApi.deleteEvent(id);
      navigate('/events');
    } catch {
      setActionMsg('Failed to delete event.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/home" className="hover:text-gray-700">Home</Link>
        <span>/</span>
        <Link to="/events" className="hover:text-gray-700">Events</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium truncate">{event.title}</span>
      </div>

      {/* Cover image */}
      {imageUrl && (
        <div className="w-full h-64 rounded-xl overflow-hidden bg-gray-100">
          <img src={imageUrl} alt={event.title}
               className="w-full h-full object-cover"/>
        </div>
      )}

      {/* Main card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6
                      space-y-6">

        {/* Title + badges */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold
                               ${CATEGORY_STYLES[event.category] || 'bg-gray-100 text-gray-700'}`}>
                {event.category}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize
                               ${STATUS_STYLES[event.status] || 'bg-gray-100 text-gray-700'}`}>
                {event.status}
              </span>
              {event.hasConflict && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold
                                 bg-yellow-100 text-yellow-700">
                  ⚠️ Has Conflict
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-800">{event.title}</h1>
          </div>

          {/* Edit button — owner/admin */}
          {(isOwner || isAdmin) && (
            <Link to={`/events/${id}/edit`}>
              <Button variant="secondary" size="sm">Edit</Button>
            </Link>
          )}
        </div>

        {/* Event details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {[
            {
              icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
              label: 'Date', value: formatDate(event.eventDate)
            },
            {
              icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
              label: 'Time',
              value: `${event.startTime} – ${event.endTime} (${event.duration} hr${event.duration > 1 ? 's' : ''})`
            },
            {
              icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z',
              label: 'Venue', value: event.venue
            },
            {
              icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
              label: 'Capacity',
              value: `${event.participantCount} / ${event.capacity} registered (${spotsLeft} spots left)`
            },
            {
              icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
              label: 'Organiser', value: event.organizerName
            },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center
                              justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-gray-500" fill="none"
                     stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth="2" d={icon}/>
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">{label}</p>
                <p className="text-sm text-gray-700 font-medium">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">About this Event</h3>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {event.description}
          </p>
        </div>

        {/* Tags */}
        {event.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {event.tags.map((tag) => (
              <span key={tag}
                    className="px-2.5 py-1 rounded-full bg-gray-100
                               text-gray-600 text-xs font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Action message */}
        {actionMsg && (
          <p className="text-sm text-center font-medium text-gray-700
                        bg-gray-50 rounded-lg py-2 px-4">
            {actionMsg}
          </p>
        )}

        {/* Registration action — participants */}
        {event.status === 'approved' && !isOwner && !isAdmin && currentUser && (
          <div className="pt-2 border-t border-gray-100">
            {isPast ? (
              <p className="text-sm text-gray-400 text-center">
                This event has already taken place.
              </p>
            ) : isRegistered ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex
                                  items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none"
                         stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round"
                            strokeWidth="2.5" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-green-700">
                    You are registered
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCancel}
                  isLoading={actionLoading}
                >
                  Cancel Registration
                </Button>
              </div>
            ) : spotsLeft <= 0 ? (
              <Button size="full" disabled variant="secondary">
                Event Full — No Spots Available
              </Button>
            ) : (
              <Button
                size="full"
                onClick={handleRegister}
                isLoading={actionLoading}
              >
                Register for this Event
              </Button>
            )}
          </div>
        )}

        {/* Admin actions */}
        {isAdmin && event.status === 'pending' && (
          <div className="pt-2 border-t border-gray-100">
            {event.hasConflict && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-yellow-50
                              border border-yellow-200 text-xs text-yellow-700">
                ⚠️ This event has a time conflict with other events.
                Review carefully before approving.
              </div>
            )}
            <div className="flex gap-3">
              <Button
                size="full"
                onClick={() => handleStatusChange('approved')}
                isLoading={actionLoading}
              >
                ✓ Approve Event
              </Button>
              <Button
                size="full"
                variant="danger"
                onClick={() => handleStatusChange('rejected')}
                isLoading={actionLoading}
              >
                ✗ Reject Event
              </Button>
            </div>
          </div>
        )}

        {/* Owner/Admin — delete */}
        {(isOwner || isAdmin) && (
          <div className="pt-2 border-t border-gray-100">
            <button
              onClick={handleDelete}
              className="text-xs text-red-500 hover:text-red-700
                         hover:underline transition-colors"
            >
              Delete this event
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetailPage;
