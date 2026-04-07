import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import ClubFeedbackDialog from '../components/clubs/ClubFeedbackDialog';
import userApi from '../api/userApi';
import clubFeedbackApi from '../api/clubFeedbackApi';

/**
 * ClubsPage — List all organizations and allow students to leave feedback
 * Now connected to real backend APIs.
 */
const ClubsPage = () => {
  const { currentUser } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClub, setSelectedClub] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [error, setError] = useState(null);

  // Load clubs from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Get all organizers
        const { data: organizers } = await userApi.getAllOrganizers();

        // 2. For each organizer, fetch their real rating stats
        const clubsWithStats = await Promise.all(
          organizers.map(async (club) => {
            try {
              const { stats } = await clubFeedbackApi.getFeedbackStats(club._id);
              return { ...club, stats };
            } catch {
              return { ...club, stats: { averageRating: 0, totalReviews: 0 } };
            }
          })
        );

        setClubs(clubsWithStats);
      } catch (err) {
        console.error('Failed to load clubs:', err);
        setError('Could not load campus clubs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFeedbackSubmit = async (feedbackData) => {
    try {
      // 1. Submit to real backend
      await clubFeedbackApi.submitFeedback(feedbackData);

      // 2. Refresh stats for this specific club
      const { stats: newStats } = await clubFeedbackApi.getFeedbackStats(feedbackData.organizerId);

      // 3. Update local state
      setClubs(prev => prev.map(c =>
        c._id === feedbackData.organizerId ? { ...c, stats: newStats } : c
      ));

      return { success: true };
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      throw new Error(err.response?.data?.message || 'Failed to submit feedback');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <p style={{ color: '#8a9ab5', fontWeight: '500' }}>Loading campus clubs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ color: '#ef4444', fontWeight: '600' }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '12px', padding: '8px 20px', borderRadius: '10px',
            background: '#092447', color: '#fff', border: 'none', cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #092447 0%, #1a4f9c 100%)',
        borderRadius: '24px', padding: '48px 32px', marginBottom: '40px',
        color: '#ffffff', position: 'relative', overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(9,36,71,0.25)',
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
            Campus Clubs & Organizations
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.75)', maxWidth: '600px', lineHeight: '1.6', margin: 0 }}>
            Discover the vibrant student communities at SLIIT. Explore club profiles, see what others are saying, and share your own experiences.
          </p>
        </div>
        {/* Background decorative elements */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(240,180,41,0.10)', filter: 'blur(60px)' }} />
      </div>

      {/* Clubs Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '24px'
      }}>
        {clubs.map(club => (
          <div
            key={club._id}
            style={{
              background: '#ffffff', borderRadius: '20px', padding: '24px',
              border: '1px solid rgba(9,36,71,0.06)',
              boxShadow: '0 4px 6px rgba(9,36,71,0.02)',
              transition: 'all 0.3s ease',
              display: 'flex', flexDirection: 'column', gap: '20px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.borderColor = 'rgba(240,180,41,0.30)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(9,36,71,0.06)';
            }}
          >
            {/* Club Header */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                width: '60px', height: '60px', borderRadius: '16px', flexShrink: 0,
                background: 'linear-gradient(135deg, #f5c84a, #d99e1a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#092447', fontSize: '1.25rem', fontWeight: '800',
                overflow: 'hidden', boxShadow: '0 8px 16px rgba(240,180,41,0.30)'
              }}>
                {club.profilePhoto ? (
                  <img src={club.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : club.firstName.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase',
                    letterSpacing: '0.8px', color: '#1a4f9c', padding: '2px 8px',
                    borderRadius: '9999px', background: 'rgba(26,79,156,0.08)'
                  }}>
                    {club.category}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="14" height="14" fill="#f5c84a" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
                    </svg>
                    <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#092447' }}>
                      {club.stats?.averageRating.toFixed(1) || '0.0'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#8a9ab5' }}>
                      ({club.stats?.totalReviews || 0})
                    </span>
                  </div>
                </div>
                <h3 style={{
                  fontSize: '1.1rem', fontWeight: '800', color: '#092447',
                  margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                  {club.firstName} {club.lastName}
                </h3>
              </div>
            </div>

            {/* Description */}
            <p style={{
              fontSize: '0.875rem', color: '#475569', lineHeight: '1.6',
              margin: 0, display: '-webkit-box', WebkitLineClamp: '3',
              WebkitBoxOrient: 'vertical', overflow: 'hidden'
            }}>
              {club.description || 'No description provided by the club.'}
            </p>

            {/* Stats Footer */}
            <div style={{
              marginTop: 'auto', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', paddingTop: '16px',
              borderTop: '1px solid #f1f5f9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" fill="none" stroke="#8a9ab5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b' }}>
                  {club.memberCount || 0} Members
                </span>
              </div>

              {currentUser?.role === 'participant' && (
                <button
                  onClick={() => setSelectedClub(club)}
                  style={{
                    padding: '8px 16px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #092447 0%, #1a4f9c 100%)',
                    color: '#ffffff', fontWeight: '700', fontSize: '0.75rem',
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s ease',
                    boxShadow: '0 4px 10px rgba(9,36,71,0.20)',
                  }}
                >
                  Rate Club
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Feedback Dialog */}
      {selectedClub && (
        <ClubFeedbackDialog
          organizer={selectedClub}
          onSubmit={handleFeedbackSubmit}
          onClose={() => setSelectedClub(null)}
        />
      )}
    </div>
  );
};

export default ClubsPage;
