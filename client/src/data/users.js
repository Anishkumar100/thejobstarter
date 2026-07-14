export const users = [
  {
    _id: 'u1',
    username: 'rahuldev',
    displayName: 'Rahul Sharma',
    bio: 'CS senior. FAANG-bound. Love graphs & DP.',
    avatar: '',
    college: 'MIT',
    year: '4th',
    externalLinks: [
      { platform: 'leetcode', url: 'https://leetcode.com/rahuldev', label: 'rahuldev' },
      { platform: 'github', url: 'https://github.com/rahuldev', label: 'rahuldev' },
      { platform: 'hackerrank', url: 'https://hackerrank.com/rahuldev', label: 'rahuldev' }
    ],
    skills: ['DSA', 'React', 'Python', 'System Design'],
    followers: ['u2', 'u3'],
    following: ['u4'],
    joinDate: '2026-01-10'
  },
  {
    _id: 'u2',
    username: 'priyap',
    displayName: 'Priya Patel',
    bio: 'Backend dev. DBMS enthusiast. Building for scale.',
    avatar: '',
    college: 'Stanford',
    year: '3rd',
    externalLinks: [
      { platform: 'leetcode', url: 'https://leetcode.com/priyap', label: 'priyap' },
      { platform: 'github', url: 'https://github.com/priyap', label: 'priyap' }
    ],
    skills: ['DBMS', 'Node.js', 'SQL', 'MongoDB'],
    followers: ['u1'],
    following: ['u1', 'u3'],
    joinDate: '2026-01-15'
  },
  {
    _id: 'u3',
    username: 'devansh123',
    displayName: 'Devansh Kumar',
    bio: 'OS geek. Love low-level stuff. Kernel contributor.',
    avatar: '',
    college: 'IIT Bombay',
    year: '4th',
    externalLinks: [
      { platform: 'leetcode', url: 'https://leetcode.com/devansh123', label: 'devansh123' },
      { platform: 'github', url: 'https://github.com/devansh123', label: 'devansh123' },
      { platform: 'codeforces', url: 'https://codeforces.com/profile/devansh123', label: 'devansh123' }
    ],
    skills: ['OS', 'C', 'Rust', 'Linux'],
    followers: ['u1'],
    following: [],
    joinDate: '2026-02-01'
  },
  {
    _id: 'u4',
    username: 'ananyaj',
    displayName: 'Ananya Jain',
    bio: 'Full-stack dev. Open source contributor. Tea addict.',
    avatar: '',
    college: 'NIT Trichy',
    year: '2nd',
    externalLinks: [
      { platform: 'github', url: 'https://github.com/ananyaj', label: 'ananyaj' },
      { platform: 'codechef', url: 'https://codechef.com/users/ananyaj', label: 'ananyaj' }
    ],
    skills: ['React', 'Python', 'DSA', 'Firebase'],
    followers: [],
    following: ['u1', 'u2'],
    joinDate: '2026-02-20'
  }
];
