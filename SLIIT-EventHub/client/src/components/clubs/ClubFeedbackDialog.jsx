import { useState } from 'react';

/**
 * ClubFeedbackDialog — Standardized rating modal
 * @param {Object} organizer — Club being reviewed
 * @param {Function} onSubmit — Callback for successful submission
 * @param {Function} onClose — Callback to close dialog
 */
const ClubFeedbackDialog = ({ organizer, onSubmit, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating before submitting.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Simulate API call for now (or use actual API later)
      await onSubmit({
        organizerId: organizer._id,
        rating,
        comment
      });
      // Close on success
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px', backdropFilter: 'blur(10px)',
      background: 'rgba(9,36,71,0.60)',
      animation: 'fadeIn 0.2s ease both',
    }} onClick={onClose}>
      <div style={{
        width: '100%', maxWidth: '440px',
        background: '#ffffff', borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(9,36,71,0.35)',
        padding: '30px', position: 'relative',
        animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both',
      }} onClick={e => e.stopPropagation()}>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            width: '32px', height: '32px', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(9,36,71,0.05)', border: 'none', cursor: 'pointer',
            color: '#8a9ab5', transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#fff1f2';
            e.currentTarget.style.color = '#ef4444';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(9,36,71,0.05)';
            e.currentTarget.style.color = '#8a9ab5';
          }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #f5c84a, #d99e1a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: '800', color: '#092447',
            margin: '0 auto 16px', boxShadow: '0 10px 20px rgba(240,180,41,0.40)',
            overflow: 'hidden'
          }}>
            {organizer.profilePhoto
              ? <img src={organizer.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (organizer.firstName?.charAt(0) || 'C')
            }
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#092447', padding: '0 20px', margin: '0 0 4px' }}>
            Rate {organizer.firstName} {organizer.lastName}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#8a9ab5', margin: 0 }}>
            Share your experience with this club
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Star selector */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                  transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  transform: (hover || rating) >= star ? 'scale(1.2)' : 'scale(1)',
                }}
              >
                <svg
                  width="36" height="36"
                  viewBox="0 0 24 24"
                  fill={(hover || rating) >= star ? '#f5c84a' : 'none'}
                  stroke={(hover || rating) >= star ? '#f5c84a' : '#cbd5e1'}
                  strokeWidth="2"
                  style={{ transition: 'all 0.2s ease' }}
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
                </svg>
              </button>
            ))}
          </div>

          {/* Comment area */}
          <div>
            <label style={{
              display: 'block', fontSize: '0.75rem', fontWeight: '700',
              textTransform: 'uppercase', letterSpacing: '0.8px', color: '#8a9ab5',
              marginBottom: '8px', marginLeft: '4px'
            }}>Your Feedback (Optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you like or what could be improved..."
              style={{
                width: '100%', height: '120px', padding: '14px 18px',
                borderRadius: '16px', background: '#f8fafc',
                border: '1px solid rgba(138,154,181,0.20)',
                fontSize: '0.925rem', color: '#092447', outline: 'none',
                resize: 'none', transition: 'all 0.2s ease',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = '#1a4f9c';
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(26,79,156,0.08)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'rgba(138,154,181,0.20)';
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: '12px', background: '#fff1f2',
              border: '1px solid rgba(239, 68, 68, 0.20)',
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '0.8rem', color: '#dc2626', fontWeight: '500'
            }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: '14px', borderRadius: '16px',
                background: '#f4f6f9', color: '#475569', fontWeight: '700',
                fontSize: '0.875rem', border: 'none', cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
              onMouseLeave={e => e.currentTarget.style.background = '#f4f6f9'}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 2, padding: '14px', borderRadius: '16px',
                background: 'linear-gradient(135deg, #092447 0%, #1a4f9c 100%)',
                color: '#ffffff', fontWeight: '700', fontSize: '0.875rem',
                border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1, transition: 'all 0.2s ease',
                boxShadow: '0 8px 15px rgba(9,36,71,0.30)',
              }}
              onMouseEnter={e => {
                if (!submitting) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 20px rgba(9,36,71,0.40)';
                }
              }}
              onMouseLeave={e => {
                if (!submitting) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 15px rgba(9,36,71,0.30)';
                }
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClubFeedbackDialog;
