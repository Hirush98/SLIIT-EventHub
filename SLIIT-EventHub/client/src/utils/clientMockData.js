/**
 * Mock data for SLIIT EventHub Frontend
 * Used when running in UI-only mode or when backend is unavailable.
 */

export const mockOrganizers = [
  {
    _id: 'org1',
    firstName: 'FOSS Community',
    lastName: 'SLIIT',
    email: 'foss@sliit.lk',
    role: 'organizer',
    profilePhoto: 'https://api.dicebear.com/7.x/initials/svg?seed=FC',
    description: 'Free and Open Source Software community at SLIIT. We organize workshops, hackathons, and seminars about open source technologies.',
    category: 'Technical',
    memberCount: 150
  },
  {
    _id: 'org2',
    firstName: 'Interactive Media',
    lastName: 'Association',
    email: 'ima@sliit.lk',
    role: 'organizer',
    profilePhoto: 'https://api.dicebear.com/7.x/initials/svg?seed=IMA',
    description: 'The official student body for Interactive Media students. Exploring the intersection of design and technology.',
    category: 'Creative',
    memberCount: 85
  },
  {
    _id: 'org3',
    firstName: 'Sports',
    lastName: 'Council',
    email: 'sports@sliit.lk',
    role: 'organizer',
    profilePhoto: 'https://api.dicebear.com/7.x/initials/svg?seed=SC',
    description: 'Promoting physical well-being and competitive spirit through various sports activities and tournaments.',
    category: 'Sports',
    memberCount: 300
  },
  {
    _id: 'org4',
    firstName: 'IEEE Student',
    lastName: 'Branch',
    email: 'ieee@sliit.lk',
    role: 'organizer',
    profilePhoto: 'https://api.dicebear.com/7.x/initials/svg?seed=IEEE',
    description: 'Global technical association dedicated to advancing technology for the benefit of humanity.',
    category: 'Professional',
    memberCount: 200
  }
];

export const mockFeedbacks = [
  {
    _id: 'fb1',
    userId: { _id: 'u1', firstName: 'Kamal', lastName: 'Perera', profilePhoto: '' },
    organizerId: 'org1',
    rating: 5,
    comment: 'Amazing workshops! Very helpful for beginners.',
    createdAt: '2025-03-20T10:00:00Z'
  },
  {
    _id: 'fb2',
    userId: { _id: 'u2', firstName: 'Nimal', lastName: 'Silva', profilePhoto: '' },
    organizerId: 'org1',
    rating: 4,
    comment: 'Great content, but shared resources could be better.',
    createdAt: '2025-03-22T14:30:00Z'
  },
  {
    _id: 'fb3',
    userId: { _id: 'u3', firstName: 'Sunil', lastName: 'Fernando', profilePhoto: '' },
    organizerId: 'org2',
    rating: 5,
    comment: 'IMA events are always so creative and fun!',
    createdAt: '2025-03-25T09:15:00Z'
  }
];

/**
 * Helper to get average rating for an organizer
 */
export const getMockStats = (organizerId) => {
  const feedbacks = mockFeedbacks.filter(f => f.organizerId === organizerId);
  if (feedbacks.length === 0) return { averageRating: 0, totalReviews: 0 };
  const sum = feedbacks.reduce((acc, curr) => acc + curr.rating, 0);
  return {
    averageRating: sum / feedbacks.length,
    totalReviews: feedbacks.length
  };
};
