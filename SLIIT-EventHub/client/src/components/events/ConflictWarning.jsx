// Shown when conflict check detects overlapping events on campus
// Soft warning — organizer can still submit

const ConflictWarning = ({ conflicts, onDismiss }) => {
  if (!conflicts || conflicts.length === 0) return null;

  return (
    <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667
                     1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34
                     16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <div>
            <p className="text-sm font-semibold text-yellow-800">
              Time Conflict Detected
            </p>
            <p className="text-xs text-yellow-700 mt-0.5 leading-relaxed">
              {conflicts.length === 1
                ? 'Another event is already scheduled during this time.'
                : `${conflicts.length} events are already scheduled during this time.`}
              {' '}Students who register for your event may not be able
              to attend the following:
            </p>
          </div>
        </div>

        {/* Dismiss button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-yellow-500 hover:text-yellow-700 flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none"
                 stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>

      {/* Conflicting events list */}
      <div className="mt-3 space-y-2">
        {conflicts.map((c, i) => (
          <div key={c.id || i}
               className="bg-white rounded-lg border border-yellow-200 p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold text-gray-800 flex-1">
                {c.title}
              </p>
              <span className="text-xs font-medium text-yellow-700 flex-shrink-0">
                {c.startTime} – {c.endTime}
              </span>
            </div>
            {c.venue && (
              <div className="flex items-center gap-1 mt-1">
                <svg className="w-3 h-3 text-gray-400" fill="none"
                     stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0
                           01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z
                           M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span className="text-xs text-gray-500">{c.venue}</span>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-0.5">
              Organised by {c.organizerName}
            </p>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p className="text-xs text-yellow-700 mt-3 leading-relaxed">
        <span className="font-semibold">You can still submit this event.</span>
        {' '}The admin will review the conflict before approving.
        Consider choosing a different date or time to avoid student
        scheduling conflicts.
      </p>
    </div>
  );
};

// Shown when no conflict found — green confirmation
export const NoConflictBadge = () => (
  <div className="flex items-center gap-2 px-3 py-2 rounded-lg
                  bg-green-50 border border-green-200">
    <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none"
         stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
            strokeWidth="2" d="M5 13l4 4L19 7"/>
    </svg>
    <span className="text-xs font-medium text-green-700">
      No conflicts — this time slot is free on campus
    </span>
  </div>
);

export default ConflictWarning;
