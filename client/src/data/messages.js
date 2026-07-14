export const conversations = [
  {
    _id: 'c1',
    user: { _id: 'u2', username: 'priyap', displayName: 'Priya Patel', avatar: '' },
    lastMessage: { text: 'Thanks for the help! That really cleared things up.', createdAt: '2026-03-10T14:30:00Z' },
    unread: false
  },
  {
    _id: 'c2',
    user: { _id: 'u3', username: 'devansh123', displayName: 'Devansh Kumar', avatar: '' },
    lastMessage: { text: 'Can you share your OS notes?', createdAt: '2026-03-09T10:15:00Z' },
    unread: true
  }
];

export const messages = [
  { _id: 'm1', sender: 'u1', receiver: 'u2', content: 'Hey Priya! Saw your answer about HashMap. Great explanation!', read: true, createdAt: '2026-03-09T12:00:00Z' },
  { _id: 'm2', sender: 'u2', receiver: 'u1', content: 'Thanks Rahul! I\'ve been studying hard for interviews.', read: true, createdAt: '2026-03-09T12:05:00Z' },
  { _id: 'm3', sender: 'u1', receiver: 'u2', content: 'Want to do a mock interview together this weekend?', read: true, createdAt: '2026-03-09T12:10:00Z' },
  { _id: 'm4', sender: 'u2', receiver: 'u1', content: 'Sure! That would be great. I\'ll prepare some SQL questions.', read: true, createdAt: '2026-03-09T12:15:00Z' },
  { _id: 'm5', sender: 'u2', receiver: 'u1', content: 'Thanks for the help! That really cleared things up.', read: true, createdAt: '2026-03-10T14:30:00Z' },
  { _id: 'm6', sender: 'u3', receiver: 'u1', content: 'Hey! I saw your post about Amazon. Can you share your preparation strategy?', read: true, createdAt: '2026-03-08T09:00:00Z' },
  { _id: 'm7', sender: 'u1', receiver: 'u3', content: 'Sure! I followed a structured plan. Let me share my resources.', read: false, createdAt: '2026-03-08T09:30:00Z' },
  { _id: 'm8', sender: 'u3', receiver: 'u1', content: 'Can you share your OS notes?', read: false, createdAt: '2026-03-09T10:15:00Z' }
];
