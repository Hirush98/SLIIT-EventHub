import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import eventApi from '../api/eventApi';
import EventForm from '../components/events/EventForm';

const EventCreatePage = () => {
  const navigate    = useNavigate();
  const { currentUser } = useSelector((s) => s.user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError,  setServerError]  = useState('');

  // Only organizers and admins can create events
  const canCreate = currentUser?.role === 'organizer' ||
                    currentUser?.role === 'admin';

  const handleSubmit = async (formData, conflictData) => {
    setIsSubmitting(true);
    setServerError('');
    try {
      const res = await eventApi.createEvent(formData);
      // Redirect to the new event's detail page
      navigate(`/events/${res.data.id}`);
    } catch (err) {
      setServerError(
        err.response?.data?.message || 'Failed to create event. Try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Access denied screen
  if (!canCreate) {
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
          Only organisers and administrators can create events.
          Contact an admin to request organiser access.
        </p>
        <Link to="/events"
              className="mt-6 text-sm text-gray-600 hover:text-gray-800
                         underline transition-colors">
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link to="/events"
                  className="hover:text-gray-700 transition-colors">
              Events
            </Link>
            <span>/</span>
            <span className="text-gray-800 font-medium">Create New Event</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Create New Event</h1>
          <p className="text-sm text-gray-500 mt-1">
            Fill in the details below. Your event will be reviewed
            by an admin before going live.
          </p>
        </div>
      </div>

      {/* Server error */}
      {serverError && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border
                        border-red-200 text-red-700 text-sm">
          {serverError}
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200
                      shadow-sm p-6">
        <EventForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Submit Event for Approval"
        />
      </div>
    </div>
  );
};

export default EventCreatePage;
