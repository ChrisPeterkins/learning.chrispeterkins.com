// REST API examples for comparison with GraphQL

export interface RESTUser {
  id: string;
  name: string;
  email: string;
  age?: number;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface RESTPost {
  id: string;
  title: string;
  content: string;
  published: boolean;
  authorId: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RESTComment {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  createdAt: string;
}

// Mock REST API responses
const mockUsers: RESTUser[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    age: 28,
    role: 'admin',
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    age: 34,
    role: 'user',
    createdAt: '2023-02-20T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol@example.com',
    age: 31,
    role: 'moderator',
    createdAt: '2023-03-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
  }
];

const mockPosts: RESTPost[] = [
  {
    id: '1',
    title: 'Getting Started with GraphQL',
    content: 'GraphQL is a query language for APIs...',
    published: true,
    authorId: '1',
    tags: ['graphql', 'api', 'tutorial'],
    createdAt: '2023-06-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    title: 'Advanced GraphQL Patterns',
    content: 'Exploring advanced patterns in GraphQL...',
    published: true,
    authorId: '2',
    tags: ['graphql', 'advanced', 'patterns'],
    createdAt: '2023-07-22T00:00:00Z',
    updatedAt: '2024-01-22T00:00:00Z',
  }
];

const mockComments: RESTComment[] = [
  {
    id: '1',
    content: 'Great article!',
    authorId: '2',
    postId: '1',
    createdAt: '2023-06-16T00:00:00Z',
  },
  {
    id: '2',
    content: 'Very helpful, thanks!',
    authorId: '3',
    postId: '1',
    createdAt: '2023-06-17T00:00:00Z',
  }
];

// Mock REST API implementation
export class MockRESTAPI {
  private delay(ms: number = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // User endpoints
  async getUsers(): Promise<RESTUser[]> {
    await this.delay();
    return mockUsers;
  }

  async getUser(id: string): Promise<RESTUser | null> {
    await this.delay();
    return mockUsers.find(user => user.id === id) || null;
  }

  async getUserPosts(userId: string): Promise<RESTPost[]> {
    await this.delay();
    return mockPosts.filter(post => post.authorId === userId);
  }

  async createUser(userData: Partial<RESTUser>): Promise<RESTUser> {
    await this.delay();
    const newUser: RESTUser = {
      id: String(mockUsers.length + 1),
      name: userData.name || '',
      email: userData.email || '',
      age: userData.age,
      role: userData.role || 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    return newUser;
  }

  async updateUser(id: string, userData: Partial<RESTUser>): Promise<RESTUser | null> {
    await this.delay();
    const userIndex = mockUsers.findIndex(user => user.id === id);
    if (userIndex === -1) return null;
    
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...userData,
      updatedAt: new Date().toISOString(),
    };
    return mockUsers[userIndex];
  }

  async deleteUser(id: string): Promise<boolean> {
    await this.delay();
    const userIndex = mockUsers.findIndex(user => user.id === id);
    if (userIndex === -1) return false;
    
    mockUsers.splice(userIndex, 1);
    return true;
  }

  // Post endpoints
  async getPosts(): Promise<RESTPost[]> {
    await this.delay();
    return mockPosts.filter(post => post.published);
  }

  async getPost(id: string): Promise<RESTPost | null> {
    await this.delay();
    return mockPosts.find(post => post.id === id) || null;
  }

  async getPostComments(postId: string): Promise<RESTComment[]> {
    await this.delay();
    return mockComments.filter(comment => comment.postId === postId);
  }

  async createPost(postData: Partial<RESTPost>): Promise<RESTPost> {
    await this.delay();
    const newPost: RESTPost = {
      id: String(mockPosts.length + 1),
      title: postData.title || '',
      content: postData.content || '',
      published: postData.published || false,
      authorId: postData.authorId || '',
      tags: postData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockPosts.push(newPost);
    return newPost;
  }

  async updatePost(id: string, postData: Partial<RESTPost>): Promise<RESTPost | null> {
    await this.delay();
    const postIndex = mockPosts.findIndex(post => post.id === id);
    if (postIndex === -1) return null;
    
    mockPosts[postIndex] = {
      ...mockPosts[postIndex],
      ...postData,
      updatedAt: new Date().toISOString(),
    };
    return mockPosts[postIndex];
  }

  async deletePost(id: string): Promise<boolean> {
    await this.delay();
    const postIndex = mockPosts.findIndex(post => post.id === id);
    if (postIndex === -1) return false;
    
    mockPosts.splice(postIndex, 1);
    return true;
  }

  // Comment endpoints
  async getComments(): Promise<RESTComment[]> {
    await this.delay();
    return mockComments;
  }

  async getComment(id: string): Promise<RESTComment | null> {
    await this.delay();
    return mockComments.find(comment => comment.id === id) || null;
  }

  async createComment(commentData: Partial<RESTComment>): Promise<RESTComment> {
    await this.delay();
    const newComment: RESTComment = {
      id: String(mockComments.length + 1),
      content: commentData.content || '',
      authorId: commentData.authorId || '',
      postId: commentData.postId || '',
      createdAt: new Date().toISOString(),
    };
    mockComments.push(newComment);
    return newComment;
  }

  // Search endpoint
  async search(query: string, type?: string): Promise<any[]> {
    await this.delay();
    const results = [];
    
    if (!type || type === 'users') {
      const userResults = mockUsers.filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      );
      results.push(...userResults.map(user => ({ ...user, type: 'user' })));
    }
    
    if (!type || type === 'posts') {
      const postResults = mockPosts.filter(post => 
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.content.toLowerCase().includes(query.toLowerCase())
      );
      results.push(...postResults.map(post => ({ ...post, type: 'post' })));
    }
    
    return results;
  }
}

// REST vs GraphQL comparison scenarios
export const comparisonScenarios = {
  // Scenario 1: Get user with their posts
  getUserWithPosts: {
    rest: {
      requests: [
        'GET /api/users/1',
        'GET /api/users/1/posts'
      ],
      description: 'Two separate API calls required',
      code: `
// REST approach - Multiple requests
const user = await fetch('/api/users/1').then(r => r.json());
const posts = await fetch('/api/users/1/posts').then(r => r.json());

const userWithPosts = {
  ...user,
  posts
};`,
      issues: [
        'Multiple network requests',
        'Over-fetching of user data',
        'Potential consistency issues',
        'More complex error handling'
      ]
    },
    graphql: {
      requests: [
        'POST /graphql'
      ],
      query: `
query GetUserWithPosts($id: ID!) {
  user(id: $id) {
    id
    name
    email
    posts {
      id
      title
      content
      createdAt
    }
  }
}`,
      description: 'Single request with exactly the data needed',
      benefits: [
        'Single network request',
        'No over-fetching or under-fetching',
        'Strongly typed',
        'Atomic operation'
      ]
    }
  },

  // Scenario 2: Dashboard data
  dashboard: {
    rest: {
      requests: [
        'GET /api/users/me',
        'GET /api/posts?limit=5',
        'GET /api/comments/recent?limit=10',
        'GET /api/analytics'
      ],
      description: 'Multiple endpoints for dashboard data',
      code: `
// REST approach - Multiple endpoints
const [user, posts, comments, analytics] = await Promise.all([
  fetch('/api/users/me').then(r => r.json()),
  fetch('/api/posts?limit=5').then(r => r.json()),
  fetch('/api/comments/recent?limit=10').then(r => r.json()),
  fetch('/api/analytics').then(r => r.json())
]);`,
      issues: [
        'Multiple parallel requests',
        'Different response formats',
        'Error handling complexity',
        'Versioning challenges'
      ]
    },
    graphql: {
      requests: [
        'POST /graphql'
      ],
      query: `
query Dashboard {
  me {
    id
    name
    email
  }
  posts(first: 5) {
    id
    title
    createdAt
  }
  recentComments: comments(first: 10) {
    id
    content
    author {
      name
    }
  }
  analytics {
    totalUsers
    totalPosts
    postsThisWeek
  }
}`,
      description: 'Single request for all dashboard data',
      benefits: [
        'Single request',
        'Consistent response format',
        'Unified error handling',
        'Strong typing across all data'
      ]
    }
  },

  // Scenario 3: Mobile app with limited bandwidth
  mobileProfile: {
    rest: {
      requests: [
        'GET /api/users/1'
      ],
      description: 'Full user object returned (over-fetching)',
      response: `
{
  "id": "1",
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "age": 28,
  "role": "admin",
  "profile": {
    "bio": "Software developer...",
    "avatar": "https://...",
    "website": "https://alice.dev",
    "location": "San Francisco",
    "preferences": { ... },
    "settings": { ... },
    "socialLinks": { ... }
  },
  "createdAt": "2023-01-15T00:00:00Z",
  "updatedAt": "2024-01-15T00:00:00Z"
}`,
      issues: [
        'Over-fetching unnecessary data',
        'Larger payload size',
        'Slower on mobile networks',
        'Higher bandwidth usage'
      ]
    },
    graphql: {
      requests: [
        'POST /graphql'
      ],
      query: `
query MobileProfile($id: ID!) {
  user(id: $id) {
    id
    name
    profile {
      avatar
    }
  }
}`,
      description: 'Only requested fields returned',
      response: `
{
  "data": {
    "user": {
      "id": "1",
      "name": "Alice Johnson",
      "profile": {
        "avatar": "https://..."
      }
    }
  }
}`,
      benefits: [
        'Minimal data transfer',
        'Optimized for mobile',
        'Reduced bandwidth usage',
        'Faster loading times'
      ]
    }
  }
};

// Performance comparison utilities
export class RESTPerformanceTester {
  private restAPI = new MockRESTAPI();

  async testRESTScenario(scenario: keyof typeof comparisonScenarios) {
    const startTime = performance.now();
    
    switch (scenario) {
      case 'getUserWithPosts':
        const user = await this.restAPI.getUser('1');
        const posts = await this.restAPI.getUserPosts('1');
        return {
          result: { ...user, posts },
          duration: performance.now() - startTime,
          requestCount: 2
        };
        
      case 'dashboard':
        const [me, dashPosts, comments, analytics] = await Promise.all([
          this.restAPI.getUser('1'),
          this.restAPI.getPosts(),
          this.restAPI.getComments(),
          { totalUsers: 3, totalPosts: 2, postsThisWeek: 1 }
        ]);
        return {
          result: { me, posts: dashPosts, comments, analytics },
          duration: performance.now() - startTime,
          requestCount: 4
        };
        
      default:
        throw new Error(`Unknown scenario: ${scenario}`);
    }
  }
}

export const restAPI = new MockRESTAPI();
export const restPerformanceTester = new RESTPerformanceTester();