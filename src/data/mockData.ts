export interface User {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatar: string;
  skillsOffered: Skill[];
  skillsWanted: Skill[];
}

export interface Skill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Expert';
}

export interface SwapRequest {
  id: string;
  fromUser: User;
  toUser: User;
  skillOffered: Skill;
  skillWanted: Skill;
  status: 'pending' | 'accepted' | 'completed' | 'rejected';
  createdAt: string;
}

export const currentUser: User = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  bio: 'Passionate about learning and sharing knowledge. Love teaching photography and eager to learn web development.',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  skillsOffered: [
    { id: '1', name: 'Photography', level: 'Expert' },
    { id: '2', name: 'Photo Editing', level: 'Intermediate' },
    { id: '3', name: 'Graphic Design', level: 'Beginner' },
  ],
  skillsWanted: [
    { id: '4', name: 'JavaScript', level: 'Beginner' },
    { id: '5', name: 'React', level: 'Beginner' },
    { id: '6', name: 'Spanish', level: 'Intermediate' },
  ],
};

export const users: User[] = [
  currentUser,
  {
    id: '2',
    name: 'Maria Garcia',
    email: 'maria@example.com',
    bio: 'Software developer with a love for languages.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    skillsOffered: [
      { id: '7', name: 'JavaScript', level: 'Expert' },
      { id: '8', name: 'React', level: 'Expert' },
      { id: '9', name: 'Spanish', level: 'Expert' },
    ],
    skillsWanted: [
      { id: '10', name: 'Photography', level: 'Beginner' },
      { id: '11', name: 'Cooking', level: 'Intermediate' },
    ],
  },
  {
    id: '3',
    name: 'James Chen',
    email: 'james@example.com',
    bio: 'Chef and food enthusiast looking to expand horizons.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    skillsOffered: [
      { id: '12', name: 'Cooking', level: 'Expert' },
      { id: '13', name: 'Mandarin', level: 'Expert' },
    ],
    skillsWanted: [
      { id: '14', name: 'Piano', level: 'Beginner' },
      { id: '15', name: 'Graphic Design', level: 'Intermediate' },
    ],
  },
  {
    id: '4',
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    bio: 'Music teacher and yoga instructor.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    skillsOffered: [
      { id: '16', name: 'Piano', level: 'Expert' },
      { id: '17', name: 'Yoga', level: 'Expert' },
      { id: '18', name: 'Meditation', level: 'Intermediate' },
    ],
    skillsWanted: [
      { id: '19', name: 'Cooking', level: 'Beginner' },
      { id: '20', name: 'Photography', level: 'Intermediate' },
    ],
  },
  {
    id: '5',
    name: 'David Kim',
    email: 'david@example.com',
    bio: 'Fitness coach passionate about helping others.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    skillsOffered: [
      { id: '21', name: 'Fitness Training', level: 'Expert' },
      { id: '22', name: 'Nutrition', level: 'Intermediate' },
    ],
    skillsWanted: [
      { id: '23', name: 'Spanish', level: 'Beginner' },
      { id: '24', name: 'Guitar', level: 'Beginner' },
    ],
  },
];

export const swapRequests: SwapRequest[] = [
  {
    id: '1',
    fromUser: users[1],
    toUser: currentUser,
    skillOffered: users[1].skillsOffered[0],
    skillWanted: currentUser.skillsOffered[0],
    status: 'pending',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    fromUser: users[3],
    toUser: currentUser,
    skillOffered: users[3].skillsOffered[0],
    skillWanted: currentUser.skillsOffered[1],
    status: 'accepted',
    createdAt: '2024-01-10',
  },
  {
    id: '3',
    fromUser: currentUser,
    toUser: users[2],
    skillOffered: currentUser.skillsOffered[0],
    skillWanted: users[2].skillsOffered[0],
    status: 'completed',
    createdAt: '2024-01-05',
  },
  {
    id: '4',
    fromUser: users[4],
    toUser: currentUser,
    skillOffered: users[4].skillsOffered[0],
    skillWanted: currentUser.skillsOffered[0],
    status: 'pending',
    createdAt: '2024-01-16',
  },
];

export const recommendedMatches = users.filter(u => u.id !== currentUser.id).slice(0, 3);
