import { useState, useEffect, useCallback } from 'react';
import eventApi from '../../api/eventApi';

// Month names and day labels
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// Format date to YYYY-MM-DD string
const toDateKey = (year, month, day) =>
  `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

// Format time nicely: "09:00 – 11:00"
const formatTimeRange = (start, end) => `${start} – ${end}`;

const EventCalendar = ({ selectedDate, onDateSelect }) => {
  const today    = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // Calendar dot data from API
  // Shape: { "2025-04-15": [{id, title, startTime, endTime, venue, organizerName}] }
  const [dotData,   setDotData]   = useState({});
  const [dayEvents, setDayEvents] = useState([]);
  const [loadingDots, setLoadingDots] = useState(false);

  // Fetch calendar dots whenever month/year changes
  const fetchDots = useCallback(async () => {
    setLoadingDots(true);
    try {
      const res = await eventApi.getCalendarDots(viewMonth + 1, viewYear);
      setDotData(res.data || {});
    } catch {
      setDotData({});
    } finally {
      setLoadingDots(false);
    }
  }, [viewMonth, viewYear]);

  useEffect(() => { fetchDots(); }, [fetchDots]);

  // When a date is clicked — show its events in the panel
  const handleDayClick = (year, month, day) => {
    const dateKey   = toDateKey(year, month, day);
    const dateValue = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    setDayEvents(dotData[dateKey] || []);
    if (onDateSelect) onDateSelect(dateValue);
  };

  // Navigation
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // Build calendar grid
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth     = new Date(viewYear, viewMonth + 1, 0).getDate();
  const todayKey        = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());
  const selectedKey     = selectedDate || '';

  // Build array of day cells (null = empty, number = day)
  const cells = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

      {/* ── Calendar header ── */}
      <div className="flex items-center justify-between px-4 py-3
                      border-b border-gray-100">
        <button
          onClick={prevMonth}
          className="w-7 h-7 flex items-center justify-center rounded-lg
                     hover:bg-gray-100 transition-colors text-gray-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <div className="text-sm font-semibold text-gray-800">
          {MONTHS[viewMonth]} {viewYear}
          {loadingDots && (
            <span className="ml-2 inline-block w-3 h-3 border-2 border-gray-300
                             border-t-gray-600 rounded-full animate-spin"/>
          )}
        </div>

        <button
          onClick={nextMonth}
          className="w-7 h-7 flex items-center justify-center rounded-lg
                     hover:bg-gray-100 transition-colors text-gray-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      {/* ── Day labels ── */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {DAYS.map((d) => (
          <div key={d}
               className="py-2 text-center text-xs font-medium text-gray-400">
            {d}
          </div>
        ))}
      </div>

      {/* ── Calendar grid ── */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="h-10"/>;

          const dateKey   = toDateKey(viewYear, viewMonth, day);
          const hasEvents = dotData[dateKey]?.length > 0;
          const isToday   = dateKey === todayKey;
          const isSelected = dateKey === selectedKey;

          return (
            <button
              key={dateKey}
              onClick={() => handleDayClick(viewYear, viewMonth, day)}
              className={`
                h-10 flex flex-col items-center justify-center
                text-xs font-medium transition-all duration-150
                relative hover:bg-gray-50
                ${isSelected
                  ? 'bg-gray-800 text-white rounded-lg hover:bg-gray-700'
                  : isToday
                  ? 'text-gray-800 font-bold'
                  : 'text-gray-600'
                }
              `}
            >
              <span>{day}</span>

              {/* Dot indicator — shows if events exist on this day */}
              {hasEvents && (
                <span className={`absolute bottom-1 w-1 h-1 rounded-full
                                 ${isSelected ? 'bg-white' : 'bg-gray-400'}`}/>
              )}

              {/* Today ring */}
              {isToday && !isSelected && (
                <span className="absolute inset-0.5 rounded-lg ring-2
                                 ring-gray-400 ring-offset-0 pointer-events-none"/>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Day events panel ── */}
      {selectedDate && (
        <div className="border-t border-gray-100">
          <div className="px-4 py-3">
            <p className="text-xs font-semibold text-gray-500 uppercase
                          tracking-wider mb-2">
              Events on{' '}
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-GB', {
                weekday: 'long', day: 'numeric', month: 'long'
              })}
            </p>

            {dayEvents.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-xs text-gray-400">No events on this day</p>
                <p className="text-xs text-green-600 mt-1 font-medium">
                  ✓ Time slot is free
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {dayEvents.map((ev) => (
                  <div key={ev.id}
                       className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-gray-800
                                   leading-snug flex-1">
                        {ev.title}
                      </p>
                      <span className="text-xs text-gray-500 flex-shrink-0 font-medium">
                        {formatTimeRange(ev.startTime, ev.endTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <svg className="w-3 h-3 text-gray-400" fill="none"
                           stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0
                                 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z
                                 M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      <span className="text-xs text-gray-500">{ev.venue}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      by {ev.organizerName}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"/>
          <span className="text-xs text-gray-400">Has events</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-lg ring-2 ring-gray-400 inline-block"/>
          <span className="text-xs text-gray-400">Today</span>
        </div>
      </div>
    </div>
  );
};

export default EventCalendar;
