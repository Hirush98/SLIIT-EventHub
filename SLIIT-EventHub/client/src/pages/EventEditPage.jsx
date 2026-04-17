import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import eventApi  from '../api/eventApi';
import EventForm from '../components/events/EventForm';

const EventEditPage = () => {
  const { id }          = useParams();
  const navigate        = useNavigate();
  const { currentUser } = useSelector((s) => s.user);

  const [event,        setEvent]        = useState(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError,    setLoadError]    = useState('');
  const [serverError,  setServerError]  = useState('');

  // Load existing event data
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await eventApi.getEventById(id);
        setEvent(res.data);
      } catch {
        setLoadError('Event not found or failed to load.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  // Loading state
  if (isLoading) return (
    <div className="flex justify-center items-center py-20">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600
                      rounded-full animate-spin"/>
    </div>
  );

  // Load error
  if (loadError) return (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="text-gray-500 mb-4">{loadError}</p>
      <Link to="/events"
            className="text-sm text-gray-600 hover:underline">
        Back to Events
      </Link>
    </div>
  );

  if (!event) return null;

  // Only owner or admin can edit
  const isOwner = currentUser?.id === event.createdBy?.toString() ||
                  currentUser?.id === event.createdBy;
  const isAdmin = currentUser?.role === 'admin';

  if (!isOwner && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center
                        justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none"
               stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667
                     1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34
                     16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-sm text-gray-500 text-center max-w-sm">
          You can only edit events you have created.
        </p>
        <Link to={`/events/${id}`}
              className="mt-6 text-sm text-gray-600 hover:underline">
          Back to Event
        </Link>
      </div>
    );
  }

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateStr) => {
    return new Date(dateStr).toISOString().split('T')[0];
  };

  // Pre-fill form with existing event data
  const initialValues = {
    id:            event.id,
    title:         event.title,
    description:   event.description,
    category:      event.category,
    eventDate:     formatDateForInput(event.eventDate),
    startTime:     event.startTime,
    duration:      event.duration,
    venue:         event.venue,
    capacity:      event.capacity,
    tags:          event.tags || [],
    coverImageUrl: eventApi.getImageUrl(event.coverImage),
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setServerError('');
    try {
      await eventApi.updateEvent(id, formData);
      navigate(`/events/${id}`);
    } catch (err) {
      setServerError(
        err.response?.data?.message || 'Failed to update event. Try again.'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <Link to="/events"
                className="hover:text-gray-700 transition-colors">
            Events
          </Link>
          <span>/</span>
          <Link to={`/events/${id}`}
                className="hover:text-gray-700 transition-colors truncate max-w-xs">
            {event.title}
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Edit</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Edit Event</h1>
        <p className="text-sm text-gray-500 mt-1">
          Update your event details. Changes will be saved immediately.
        </p>
      </div>

      {/* Server error */}
      {serverError && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border
                        border-red-200 text-red-700 text-sm">
          {serverError}
        </div>
      )}

      {/* Status notice */}
      {event.status === 'approved' && (
        <div className="px-4 py-3 rounded-lg bg-blue-50 border
                        border-blue-200 text-blue-700 text-sm flex gap-2">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none"
               stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          This event is currently approved and live. Editing it will
          keep its approved status.
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <EventForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Save Changes"
          editMode={true}
        />
      </div>
    </div>
  );
};

export default EventEditPage;
