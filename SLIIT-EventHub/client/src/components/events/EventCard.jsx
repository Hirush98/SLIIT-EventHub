import { Link } from 'react-router-dom';
import eventApi  from '../../api/eventApi';

// Category badge colours
const CATEGORY_STYLES = {
  Academic:    'bg-blue-100   text-blue-700',
  Workshop:    'bg-purple-100 text-purple-700',
  Sports:      'bg-green-100  text-green-700',
  Cultural:    'bg-pink-100   text-pink-700',
  Social:      'bg-yellow-100 text-yellow-700',
  Seminar:     'bg-orange-100 text-orange-700',
  Competition: 'bg-red-100    text-red-700',
};

// Format date nicely: "Tue, 15 Apr 2025"
const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    weekday: 'short',
    day:     'numeric',
    month:   'short',
    year:    'numeric'
  });
};

const EventCard = ({ event }) => {
  const imageUrl      = eventApi.getImageUrl(event.coverImage);
  const spotsLeft     = event.spotsRemaining ?? (event.capacity - event.participantCount);
  const isAlmostFull  = spotsLeft > 0 && spotsLeft <= 10;
  const isFull        = spotsLeft <= 0;

  return (
    <Link
      to={`/events/${event.id}`}
      className="group bg-white rounded-xl border border-gray-200
                 shadow-sm hover:shadow-md hover:border-gray-300
                 transition-all duration-200 overflow-hidden
                 flex flex-col"
    >
      {/* Cover image */}
      <div className="relative h-44 bg-gray-100 flex-shrink-0 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={event.title}
            className="w-full h-full object-cover
                       group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          // Placeholder when no image
          <div className="w-full h-full bg-gradient-to-br from-gray-200
                          to-gray-300 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none"
                 stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7
                       a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
        )}

        {/* Category badge — top left */}
        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full
                         text-xs font-semibold
                         ${CATEGORY_STYLES[event.category] ||
                           'bg-gray-100 text-gray-700'}`}>
          {event.category}
        </span>

        {/* Full badge — top right */}
        {isFull && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full
                           text-xs font-semibold bg-red-100 text-red-700">
            Full
          </span>
        )}
      </div>

      {/* Card content */}
      <div className="p-4 flex flex-col flex-1">

        {/* Title */}
        <h3 className="font-semibold text-gray-800 text-sm leading-snug
                       line-clamp-2 mb-2 group-hover:text-gray-600
                       transition-colors">
          {event.title}
        </h3>

        {/* Date + time */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none"
               stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7
                     a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <span>{formatDate(event.eventDate)}</span>
          <span className="text-gray-300">•</span>
          <span>{event.startTime} – {event.endTime}</span>
        </div>

        {/* Venue */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none"
               stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0
                     01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z
                     M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <span className="truncate">{event.venue}</span>
        </div>

        {/* Footer — organizer + spots */}
        <div className="mt-auto flex items-center justify-between
                        pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500 truncate">
            by {event.organizerName}
          </span>

          {/* Spots remaining */}
          <span className={`text-xs font-medium flex-shrink-0 ml-2
                           ${isFull        ? 'text-red-600'
                           : isAlmostFull  ? 'text-orange-600'
                           :                 'text-green-600'}`}>
            {isFull
              ? 'Full'
              : isAlmostFull
              ? `${spotsLeft} left`
              : `${spotsLeft} spots`}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
