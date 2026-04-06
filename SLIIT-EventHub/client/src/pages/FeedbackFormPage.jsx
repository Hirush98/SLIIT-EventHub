import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import feedbackApi from '../api/feedbackApi';
import eventApi from '../api/eventApi';

const FeedbackFormPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((s) => s.user);

  const [event, setEvent] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(null); // ✅ new
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const eventRes = await eventApi.getEventById(eventId);
        setEvent(eventRes.data);

        // Check if user already submitted and if feedback is enabled
        const userStatusRes = await feedbackApi.checkUserFeedbackStatus(eventId);
        setFeedbackOpen(userStatusRes.feedbackEnabled);
        setAlreadySubmitted(userStatusRes.alreadySubmitted);

        // Get feedback stats (avg rating & count) - accessible to all users
        try {
          const statsRes = await feedbackApi.getFeedbackStats(eventId);
          setFeedbacks(statsRes.feedbacks);
        } catch (err) {
          // Silent fail if feedback stats not available
          console.warn('Could not load feedback stats:', err);
          setFeedbacks([]);
        }
      } catch (err) {
        console.error('Error loading event or feedback status:', err);
        setMessage('Failed to load event details.');
      }
    };
    loadData();
  }, [eventId, currentUser]);

  const avgRating = feedbacks.length
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return setMessage('Please select a rating before submitting.');

    setLoading(true);
    setMessage('');
    try {
      await feedbackApi.submitFeedback(eventId, { rating, comments });
      setMessage('success:✅ Feedback submitted! Thank you.');
      setAlreadySubmitted(true);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = message.startsWith('success:');
  const displayMsg = isSuccess ? message.split(':')[1] : message;

  if (feedbackOpen === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        Loading feedback status...
      </div>
    );
  }

  if (!feedbackOpen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{event?.title || 'Event'}</h1>
          <p className="text-gray-500 mb-6">Feedback for this event is currently closed.</p>
          <button
            onClick={() => navigate(`/events/${eventId}`)}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-4"
          >
            Back to Event
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* 🖼️ Event Header Section */}
        <div className="relative h-32 bg-blue-600">
          {event?.coverImage && (
            <img 
              src={eventApi.getImageUrl(event.coverImage)} 
              className="w-full h-full object-cover opacity-40" 
              alt="" 
            />
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-6 text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1 opacity-80">Event Feedback</span>
            <h1 className="text-2xl font-bold truncate w-full">{event?.title || 'Loading...'}</h1>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* 📊 Summary Stats */}
          {avgRating && !alreadySubmitted && (
            <div className="flex items-center justify-center gap-6 py-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="text-center">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Rating</p>
                <p className="text-xl font-bold text-gray-800">{avgRating}<span className="text-gray-400 text-sm">/5</span></p>
              </div>
              <div className="h-8 w-[1px] bg-gray-200"></div>
              <div className="text-center">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Reviews</p>
                <p className="text-xl font-bold text-gray-800">{feedbacks.length}</p>
              </div>
            </div>
          )}

          {alreadySubmitted ? (
            <div className="flex flex-col items-center py-10 text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl">✓</div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Feedback Received!</h3>
                <p className="text-sm text-gray-500">You've already shared your thoughts on this event.</p>
              </div>
              <button 
                onClick={() => navigate(`/events/${eventId}`)}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-4"
              >
                Back to Event
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* ⭐ Interactive Stars */}
              <div className="space-y-4 text-center">
                <label className="text-sm font-bold text-gray-700">How would you rate this event?</label>
                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      className="transition-all duration-200 transform hover:scale-125 focus:outline-none"
                    >
                      <svg 
                        className={`w-10 h-10 ${star <= (hover || rating) ? 'text-yellow-400 fill-current' : 'text-gray-200 fill-current'}`}
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    </button>
                  ))}
                </div>
                <p className="text-xs font-medium text-gray-400 italic">
                  {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : rating === 1 ? 'Poor' : 'Select a star'}
                </p>
              </div>

              {/* 💬 Text Area */}
              <div className="space-y-2">
                <div className="flex justify-between items-end px-1">
                  <label className="text-sm font-bold text-gray-700">Your Experience</label>
                  <span className="text-[10px] text-gray-400 font-mono">{comments.length}/500</span>
                </div>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                  maxLength={500}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none resize-none"
                  placeholder="Tell us what you liked or what could be improved..."
                />
              </div>

              {/* 🔔 Status Message */}
              {displayMsg && (
                <div className={`p-4 rounded-xl text-center text-sm font-medium animate-fade-in ${
                  isSuccess ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {displayMsg}
                </div>
              )}

              {/* 🚀 Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : 'Send Feedback'}
              </button>
            </form>
          )}
        </div>
      </div>
      <p className="mt-6 text-xs text-gray-400">Your feedback is anonymous to the organizer</p>
    </div>
  );
};

export default FeedbackFormPage;