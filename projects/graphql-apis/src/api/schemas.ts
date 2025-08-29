import { gql } from '@apollo/client';

export const BASIC_SCHEMA = `
  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
    posts: [Post!]!
    createdAt: String!
  }
  
  type Post {
    id: ID!
    title: String!
    content: String!
    published: Boolean!
    author: User!
    tags: [String!]!
    createdAt: String!
    updatedAt: String!
  }
  
  type Comment {
    id: ID!
    content: String!
    author: User!
    post: Post!
    createdAt: String!
  }
  
  type Query {
    users: [User!]!
    user(id: ID!): User
    posts: [Post!]!
    post(id: ID!): Post
    postsByUser(userId: ID!): [Post!]!
    comments(postId: ID!): [Comment!]!
  }
  
  type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
    
    createPost(input: CreatePostInput!): Post!
    updatePost(id: ID!, input: UpdatePostInput!): Post!
    deletePost(id: ID!): Boolean!
    
    createComment(input: CreateCommentInput!): Comment!
  }
  
  type Subscription {
    postAdded: Post!
    commentAdded(postId: ID!): Comment!
    userUpdated(userId: ID!): User!
  }
  
  input CreateUserInput {
    name: String!
    email: String!
    age: Int
  }
  
  input UpdateUserInput {
    name: String
    email: String
    age: Int
  }
  
  input CreatePostInput {
    title: String!
    content: String!
    published: Boolean = false
    authorId: ID!
    tags: [String!] = []
  }
  
  input UpdatePostInput {
    title: String
    content: String
    published: Boolean
    tags: [String!]
  }
  
  input CreateCommentInput {
    content: String!
    authorId: ID!
    postId: ID!
  }
`;

export const ADVANCED_SCHEMA = `
  # Scalar types
  scalar DateTime
  scalar JSON
  scalar Upload
  
  # Enums
  enum PostStatus {
    DRAFT
    PUBLISHED
    ARCHIVED
  }
  
  enum UserRole {
    ADMIN
    MODERATOR
    USER
  }
  
  # Interfaces
  interface Node {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
  }
  
  # Union types
  union SearchResult = User | Post | Comment
  
  type User implements Node {
    id: ID!
    name: String!
    email: String!
    role: UserRole!
    profile: UserProfile
    posts(
      first: Int
      after: String
      status: PostStatus
    ): PostConnection!
    followers: [User!]!
    following: [User!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }
  
  type UserProfile {
    bio: String
    avatar: String
    website: String
    location: String
    socialLinks: JSON
  }
  
  type Post implements Node {
    id: ID!
    title: String!
    content: String!
    slug: String!
    status: PostStatus!
    author: User!
    tags: [Tag!]!
    comments(first: Int, after: String): CommentConnection!
    likes: Int!
    views: Int!
    featuredImage: String
    metadata: JSON
    createdAt: DateTime!
    updatedAt: DateTime!
  }
  
  type Tag {
    id: ID!
    name: String!
    slug: String!
    posts: [Post!]!
  }
  
  type Comment implements Node {
    id: ID!
    content: String!
    author: User!
    post: Post!
    parent: Comment
    replies: [Comment!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }
  
  # Connection types for pagination
  type PostConnection {
    edges: [PostEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }
  
  type PostEdge {
    node: Post!
    cursor: String!
  }
  
  type CommentConnection {
    edges: [CommentEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }
  
  type CommentEdge {
    node: Comment!
    cursor: String!
  }
  
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }
  
  type Query {
    # Node interface
    node(id: ID!): Node
    
    # User queries
    me: User
    users(
      first: Int
      after: String
      role: UserRole
      search: String
    ): [User!]!
    user(id: ID, email: String): User
    
    # Post queries
    posts(
      first: Int = 10
      after: String
      status: PostStatus = PUBLISHED
      authorId: ID
      tagIds: [ID!]
      search: String
    ): PostConnection!
    post(id: ID, slug: String): Post
    
    # Search
    search(query: String!, type: [String!]): [SearchResult!]!
    
    # Analytics
    analytics: AnalyticsData!
  }
  
  type AnalyticsData {
    totalUsers: Int!
    totalPosts: Int!
    totalComments: Int!
    postsThisWeek: Int!
    topTags: [Tag!]!
  }
  
  type Mutation {
    # Authentication
    login(email: String!, password: String!): AuthPayload!
    register(input: RegisterInput!): AuthPayload!
    logout: Boolean!
    
    # User mutations
    updateProfile(input: UpdateProfileInput!): User!
    followUser(userId: ID!): User!
    unfollowUser(userId: ID!): User!
    
    # Post mutations
    createPost(input: CreatePostInput!): Post!
    updatePost(id: ID!, input: UpdatePostInput!): Post!
    deletePost(id: ID!): Boolean!
    likePost(postId: ID!): Post!
    
    # Comment mutations
    createComment(input: CreateCommentInput!): Comment!
    updateComment(id: ID!, content: String!): Comment!
    deleteComment(id: ID!): Boolean!
    
    # File upload
    uploadFile(file: Upload!): FileUploadResponse!
  }
  
  type AuthPayload {
    token: String!
    user: User!
  }
  
  type FileUploadResponse {
    url: String!
    filename: String!
    mimetype: String!
    size: Int!
  }
  
  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }
  
  input UpdateProfileInput {
    name: String
    bio: String
    avatar: String
    website: String
    location: String
    socialLinks: JSON
  }
  
  type Subscription {
    # Real-time updates
    postAdded: Post!
    postUpdated(id: ID!): Post!
    commentAdded(postId: ID!): Comment!
    userOnline: User!
    userOffline: User!
    
    # Activity feed
    activityFeed(userId: ID!): Activity!
  }
  
  type Activity {
    id: ID!
    type: ActivityType!
    user: User!
    target: Node
    createdAt: DateTime!
  }
  
  enum ActivityType {
    POST_CREATED
    POST_LIKED
    COMMENT_ADDED
    USER_FOLLOWED
  }
`;

// Query examples
export const SAMPLE_QUERIES = {
  getAllUsers: gql`
    query GetAllUsers {
      users {
        id
        name
        email
        age
        createdAt
      }
    }
  `,
  
  getUserWithPosts: gql`
    query GetUserWithPosts($id: ID!) {
      user(id: $id) {
        id
        name
        email
        posts {
          id
          title
          content
          published
          createdAt
        }
      }
    }
  `,
  
  getPostsWithAuthors: gql`
    query GetPostsWithAuthors {
      posts {
        id
        title
        content
        published
        tags
        author {
          id
          name
          email
        }
        createdAt
        updatedAt
      }
    }
  `,
  
  createUser: gql`
    mutation CreateUser($input: CreateUserInput!) {
      createUser(input: $input) {
        id
        name
        email
        age
        createdAt
      }
    }
  `,
  
  createPost: gql`
    mutation CreatePost($input: CreatePostInput!) {
      createPost(input: $input) {
        id
        title
        content
        published
        tags
        author {
          id
          name
        }
        createdAt
      }
    }
  `,
  
  subscribeToNewPosts: gql`
    subscription OnPostAdded {
      postAdded {
        id
        title
        content
        author {
          id
          name
        }
        createdAt
      }
    }
  `
};

// Complex query examples
export const ADVANCED_QUERIES = {
  searchWithFragments: gql`
    fragment UserInfo on User {
      id
      name
      email
      role
    }
    
    fragment PostInfo on Post {
      id
      title
      content
      status
      author {
        ...UserInfo
      }
    }
    
    query SearchContent($query: String!) {
      search(query: $query) {
        ... on User {
          ...UserInfo
          posts(first: 3) {
            edges {
              node {
                ...PostInfo
              }
            }
          }
        }
        ... on Post {
          ...PostInfo
        }
      }
    }
  `,
  
  paginatedPosts: gql`
    query GetPaginatedPosts($first: Int!, $after: String) {
      posts(first: $first, after: $after) {
        edges {
          cursor
          node {
            id
            title
            content
            author {
              name
            }
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        totalCount
      }
    }
  `,
  
  complexMutation: gql`
    mutation CreatePostWithTags($input: CreatePostInput!) {
      createPost(input: $input) {
        id
        title
        content
        status
        tags {
          id
          name
          slug
        }
        author {
          id
          name
          posts(first: 5) {
            edges {
              node {
                id
                title
              }
            }
            totalCount
          }
        }
      }
    }
  `
};