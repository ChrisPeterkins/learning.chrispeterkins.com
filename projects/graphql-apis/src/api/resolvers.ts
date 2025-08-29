// Mock data for resolvers
const users = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    age: 28,
    role: 'ADMIN',
    createdAt: new Date('2023-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    age: 34,
    role: 'USER',
    createdAt: new Date('2023-02-20').toISOString(),
    updatedAt: new Date('2024-01-20').toISOString(),
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol@example.com',
    age: 31,
    role: 'MODERATOR',
    createdAt: new Date('2023-03-10').toISOString(),
    updatedAt: new Date('2024-01-10').toISOString(),
  }
];

const posts = [
  {
    id: '1',
    title: 'Getting Started with GraphQL',
    content: 'GraphQL is a query language for APIs that provides a more efficient, powerful and flexible alternative to REST...',
    slug: 'getting-started-with-graphql',
    published: true,
    status: 'PUBLISHED',
    authorId: '1',
    tags: ['graphql', 'api', 'tutorial'],
    likes: 15,
    views: 234,
    createdAt: new Date('2023-06-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
  },
  {
    id: '2',
    title: 'Advanced GraphQL Patterns',
    content: 'Exploring advanced patterns in GraphQL including subscriptions, federation, and schema stitching...',
    slug: 'advanced-graphql-patterns',
    published: true,
    status: 'PUBLISHED',
    authorId: '2',
    tags: ['graphql', 'advanced', 'patterns'],
    likes: 8,
    views: 156,
    createdAt: new Date('2023-07-22').toISOString(),
    updatedAt: new Date('2024-01-22').toISOString(),
  },
  {
    id: '3',
    title: 'REST vs GraphQL: A Comprehensive Comparison',
    content: 'A detailed comparison between REST and GraphQL architectures, their pros and cons...',
    slug: 'rest-vs-graphql-comparison',
    published: false,
    status: 'DRAFT',
    authorId: '3',
    tags: ['rest', 'graphql', 'comparison'],
    likes: 3,
    views: 45,
    createdAt: new Date('2023-08-10').toISOString(),
    updatedAt: new Date('2024-01-10').toISOString(),
  }
];

const comments = [
  {
    id: '1',
    content: 'Great introduction to GraphQL! Very helpful for beginners.',
    authorId: '2',
    postId: '1',
    parentId: null,
    createdAt: new Date('2023-06-16').toISOString(),
    updatedAt: new Date('2023-06-16').toISOString(),
  },
  {
    id: '2',
    content: 'Thanks! I plan to write more advanced topics soon.',
    authorId: '1',
    postId: '1',
    parentId: '1',
    createdAt: new Date('2023-06-17').toISOString(),
    updatedAt: new Date('2023-06-17').toISOString(),
  },
  {
    id: '3',
    content: 'Looking forward to more content on schema design.',
    authorId: '3',
    postId: '2',
    parentId: null,
    createdAt: new Date('2023-07-23').toISOString(),
    updatedAt: new Date('2023-07-23').toISOString(),
  }
];

const tags = [
  { id: '1', name: 'GraphQL', slug: 'graphql' },
  { id: '2', name: 'API', slug: 'api' },
  { id: '3', name: 'Tutorial', slug: 'tutorial' },
  { id: '4', name: 'Advanced', slug: 'advanced' },
  { id: '5', name: 'Patterns', slug: 'patterns' },
  { id: '6', name: 'REST', slug: 'rest' },
  { id: '7', name: 'Comparison', slug: 'comparison' }
];

// Simple resolver functions
export const resolvers = {
  Query: {
    users: () => users,
    user: (_: any, { id }: { id: string }) => users.find(user => user.id === id),
    posts: () => posts.filter(post => post.published),
    post: (_: any, { id, slug }: { id?: string, slug?: string }) => {
      if (id) return posts.find(post => post.id === id);
      if (slug) return posts.find(post => post.slug === slug);
      return null;
    },
    postsByUser: (_: any, { userId }: { userId: string }) => 
      posts.filter(post => post.authorId === userId),
    comments: (_: any, { postId }: { postId: string }) => 
      comments.filter(comment => comment.postId === postId),
    search: (_: any, { query, type }: { query: string, type?: string[] }) => {
      const results = [];
      
      if (!type || type.includes('User')) {
        const userResults = users.filter(user => 
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase())
        ).map(user => ({ ...user, __typename: 'User' }));
        results.push(...userResults);
      }
      
      if (!type || type.includes('Post')) {
        const postResults = posts.filter(post => 
          post.title.toLowerCase().includes(query.toLowerCase()) ||
          post.content.toLowerCase().includes(query.toLowerCase())
        ).map(post => ({ ...post, __typename: 'Post' }));
        results.push(...postResults);
      }
      
      return results;
    },
    analytics: () => ({
      totalUsers: users.length,
      totalPosts: posts.length,
      totalComments: comments.length,
      postsThisWeek: posts.filter(post => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(post.createdAt) > weekAgo;
      }).length,
      topTags: tags.slice(0, 5)
    })
  },
  
  Mutation: {
    createUser: (_: any, { input }: { input: any }) => {
      const newUser = {
        id: String(users.length + 1),
        ...input,
        role: 'USER',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      users.push(newUser);
      return newUser;
    },
    
    updateUser: (_: any, { id, input }: { id: string, input: any }) => {
      const userIndex = users.findIndex(user => user.id === id);
      if (userIndex === -1) throw new Error('User not found');
      
      users[userIndex] = {
        ...users[userIndex],
        ...input,
        updatedAt: new Date().toISOString(),
      };
      return users[userIndex];
    },
    
    deleteUser: (_: any, { id }: { id: string }) => {
      const userIndex = users.findIndex(user => user.id === id);
      if (userIndex === -1) return false;
      
      users.splice(userIndex, 1);
      return true;
    },
    
    createPost: (_: any, { input }: { input: any }) => {
      const newPost = {
        id: String(posts.length + 1),
        ...input,
        slug: input.title.toLowerCase().replace(/\s+/g, '-'),
        status: input.published ? 'PUBLISHED' : 'DRAFT',
        likes: 0,
        views: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      posts.push(newPost);
      return newPost;
    },
    
    updatePost: (_: any, { id, input }: { id: string, input: any }) => {
      const postIndex = posts.findIndex(post => post.id === id);
      if (postIndex === -1) throw new Error('Post not found');
      
      posts[postIndex] = {
        ...posts[postIndex],
        ...input,
        updatedAt: new Date().toISOString(),
      };
      return posts[postIndex];
    },
    
    deletePost: (_: any, { id }: { id: string }) => {
      const postIndex = posts.findIndex(post => post.id === id);
      if (postIndex === -1) return false;
      
      posts.splice(postIndex, 1);
      return true;
    },
    
    createComment: (_: any, { input }: { input: any }) => {
      const newComment = {
        id: String(comments.length + 1),
        ...input,
        parentId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      comments.push(newComment);
      return newComment;
    }
  },
  
  // Field resolvers
  User: {
    posts: (parent: any) => posts.filter(post => post.authorId === parent.id)
  },
  
  Post: {
    author: (parent: any) => users.find(user => user.id === parent.authorId),
    tags: (parent: any) => tags.filter(tag => parent.tags?.includes(tag.slug))
  },
  
  Comment: {
    author: (parent: any) => users.find(user => user.id === parent.authorId),
    post: (parent: any) => posts.find(post => post.id === parent.postId),
    parent: (parent: any) => parent.parentId ? 
      comments.find(comment => comment.id === parent.parentId) : null,
    replies: (parent: any) => comments.filter(comment => comment.parentId === parent.id)
  }
};

// Subscription resolvers for real-time functionality
export const subscriptionResolvers = {
  Subscription: {
    postAdded: {
      subscribe: () => {
        // In a real implementation, this would use a pub/sub system
        // For demo purposes, we'll simulate with a simple event emitter
        const eventEmitter = createMockEventEmitter();
        return eventEmitter.asyncIterator('POST_ADDED');
      }
    },
    
    commentAdded: {
      subscribe: (_: any, { postId }: { postId: string }) => {
        const eventEmitter = createMockEventEmitter();
        return eventEmitter.asyncIterator(`COMMENT_ADDED_${postId}`);
      }
    },
    
    userUpdated: {
      subscribe: (_: any, { userId }: { userId: string }) => {
        const eventEmitter = createMockEventEmitter();
        return eventEmitter.asyncIterator(`USER_UPDATED_${userId}`);
      }
    }
  }
};

// Mock event emitter for subscriptions
function createMockEventEmitter() {
  const listeners: { [key: string]: Function[] } = {};
  
  return {
    asyncIterator: (eventName: string) => ({
      [Symbol.asyncIterator]: () => ({
        next: () => new Promise(resolve => {
          // Simulate real-time events
          setTimeout(() => {
            const mockData = generateMockSubscriptionData(eventName);
            resolve({ value: mockData, done: false });
          }, Math.random() * 5000 + 1000); // Random delay 1-6 seconds
        })
      })
    }),
    
    emit: (eventName: string, data: any) => {
      if (listeners[eventName]) {
        listeners[eventName].forEach(listener => listener(data));
      }
    },
    
    on: (eventName: string, listener: Function) => {
      if (!listeners[eventName]) {
        listeners[eventName] = [];
      }
      listeners[eventName].push(listener);
    }
  };
}

function generateMockSubscriptionData(eventName: string) {
  if (eventName === 'POST_ADDED') {
    return {
      postAdded: {
        id: String(posts.length + 1),
        title: `New Post ${Date.now()}`,
        content: 'This is a new post added via subscription!',
        author: users[Math.floor(Math.random() * users.length)],
        createdAt: new Date().toISOString()
      }
    };
  }
  
  if (eventName.startsWith('COMMENT_ADDED_')) {
    const postId = eventName.split('_')[2];
    return {
      commentAdded: {
        id: String(comments.length + 1),
        content: `New comment on post ${postId}!`,
        author: users[Math.floor(Math.random() * users.length)],
        post: posts.find(p => p.id === postId),
        createdAt: new Date().toISOString()
      }
    };
  }
  
  return null;
}

// Helper functions for complex queries
export const queryHelpers = {
  // Pagination helper
  getPaginatedResults: (
    items: any[],
    first: number = 10,
    after?: string
  ) => {
    const startIndex = after ? 
      items.findIndex(item => item.id === after) + 1 : 0;
    const endIndex = Math.min(startIndex + first, items.length);
    const selectedItems = items.slice(startIndex, endIndex);
    
    return {
      edges: selectedItems.map(item => ({
        node: item,
        cursor: item.id
      })),
      pageInfo: {
        hasNextPage: endIndex < items.length,
        hasPreviousPage: startIndex > 0,
        startCursor: selectedItems[0]?.id,
        endCursor: selectedItems[selectedItems.length - 1]?.id
      },
      totalCount: items.length
    };
  },
  
  // Search helper
  searchItems: (items: any[], query: string, fields: string[]) => {
    return items.filter(item =>
      fields.some(field =>
        item[field]?.toLowerCase().includes(query.toLowerCase())
      )
    );
  },
  
  // Filter helper
  filterItems: (items: any[], filters: any) => {
    return items.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === undefined || value === null) return true;
        if (Array.isArray(value)) {
          return value.includes(item[key]);
        }
        return item[key] === value;
      });
    });
  }
};

export { users, posts, comments, tags };