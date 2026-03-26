import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import eventApi  from '../api/eventApi';
import EventCard from '../components/events/EventCard';
import Button    from '../components/ui/Button';

const CATEGORIES = [
  'All', 'Academic', 'Workshop', 'Sports',
  'Cultural', 'Social', 'Seminar', 'Competition'
];

const EventsPage = () => {
  const { currentUser }  = useSelector((s) => s.user);
  const canCreate = currentUser?.role === 'organizer' ||
                    currentUser?.role === 'admin';

  const [events,    setEvents]    = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState('');
  const [total,     setTotal]     = useState(0);

  // Filter state
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);

  // Fetch events from API
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = { page, limit: 12 };
      if (search)              params.search   = search;
      if (category !== 'All')  params.category = category;
      if (dateFilter)          params.date     = dateFilter;

      const res = await eventApi.getAllEvents(params);
      setEvents(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError('Failed to load events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [search, category, dateFilter, page]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // Reset to page 1 when filters change
  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };
  const handleCategory = (cat) => { setCategory(cat); setPage(1); };
  const handleDate = (e) => { setDateFilter(e.target.value); setPage(1); };
  const clearFilters = () => {
    setSearch(''); setCategory('All');
    setDateFilter(''); setPage(1);
  };

  const hasActiveFilters = search || category !== 'All' || dateFilter;

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Campus Events</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isLoading ? 'Loading...' : `${total} event${total !== 1 ? 's' : ''} available`}
          </p>
        </div>

        {/* Create event button — organizer/admin only */}
        {canCreate && (
          <Link to="/events/create">
            <Button variant="primary" size="md">
              <svg className="w-4 h-4" fill="none"
                   stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth="2" d="M12 4v16m8-8H4"/>
              </svg>
              Create Event
            </Button>
          </Link>
        )}
      </div>

      {/* ── Search + filters ── */}
      <div className="bg-white rounded-xl border border-gray-200
                      shadow-sm p-4 space-y-4">

        {/* Search input */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4
                          text-gray-400 pointer-events-none"
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Search events by title, description or tags..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300
                       text-sm focus:outline-none focus:ring-2 focus:ring-gray-300
                       hover:border-gray-400"
          />
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium
                         transition-all duration-150
                         ${category === cat
                           ? 'bg-gray-800 text-white'
                           : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                         }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Date filter + clear */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">Date:</label>
            <input
              type="date"
              value={dateFilter}
              onChange={handleDate}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm
                         focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-gray-800
                         underline transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border
                        border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                        xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200
                                    overflow-hidden animate-pulse">
              <div className="h-44 bg-gray-200"/>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"/>
                <div className="h-3 bg-gray-200 rounded w-1/2"/>
                <div className="h-3 bg-gray-200 rounded w-2/3"/>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!isLoading && events.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center
                          justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none"
                 stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7
                       a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">
            No events found
          </h3>
          <p className="text-sm text-gray-400 text-center max-w-xs">
            {hasActiveFilters
              ? 'Try adjusting your search or filters'
              : 'No events have been approved yet. Check back soon.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 text-sm text-gray-600 hover:text-gray-800
                         underline transition-colors">
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* ── Events grid ── */}
      {!isLoading && events.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                        xl:grid-cols-4 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {!isLoading && total > 12 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Previous
          </Button>
          <span className="text-sm text-gray-600 px-3">
            Page {page} of {Math.ceil(total / 12)}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= Math.ceil(total / 12)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </Button>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
