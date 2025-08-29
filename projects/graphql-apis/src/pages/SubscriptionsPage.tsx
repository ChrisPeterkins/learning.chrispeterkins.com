import React, { useState, useEffect } from 'react'
import { subscriptionSimulator } from '../api/MockGraphQLServer'

const SUBSCRIPTION_EXAMPLES = {
  'Post Added': `subscription OnPostAdded {
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
}`,

  'Comment Added': `subscription OnCommentAdded($postId: ID!) {
  commentAdded(postId: $postId) {
    id
    content
    author {
      id
      name
    }
    post {
      id
      title
    }
    createdAt
  }
}`,

  'User Updated': `subscription OnUserUpdated($userId: ID!) {
  userUpdated(userId: $userId) {
    id
    name
    email
    updatedAt
  }
}`
};

interface SubscriptionEvent {
  id: string
  timestamp: string
  data: any
}

function SubscriptionsPage() {
  const [activeSubscription, setActiveSubscription] = useState<string | null>(null)
  const [events, setEvents] = useState<SubscriptionEvent[]>([])
  const [selectedExample, setSelectedExample] = useState('Post Added')
  const [subscription, setSubscription] = useState(SUBSCRIPTION_EXAMPLES['Post Added'])

  useEffect(() => {
    return () => {
      subscriptionSimulator.cleanup()
    }
  }, [])

  const startSubscription = () => {
    if (activeSubscription) {
      subscriptionSimulator.cleanup()
    }

    setActiveSubscription(selectedExample)
    setEvents([])

    const subscriptionObj = subscriptionSimulator.subscribe(selectedExample, (data: any) => {
      const newEvent: SubscriptionEvent = {
        id: Math.random().toString(36),
        timestamp: new Date().toISOString(),
        data
      }
      setEvents(prev => [newEvent, ...prev].slice(0, 20)) // Keep last 20 events
    })

    return () => subscriptionObj.unsubscribe()
  }

  const stopSubscription = () => {
    subscriptionSimulator.cleanup()
    setActiveSubscription(null)
  }

  const loadExample = (exampleName: string) => {
    setSelectedExample(exampleName)
    setSubscription(SUBSCRIPTION_EXAMPLES[exampleName as keyof typeof SUBSCRIPTION_EXAMPLES])
    if (activeSubscription) {
      stopSubscription()
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Subscriptions</h1>
        <p className="page-description">
          GraphQL subscriptions enable real-time communication between client and server.
          Learn how to implement live updates, handle WebSocket connections, and build
          reactive user interfaces with subscription-based data flows.
        </p>
      </div>

      <div className="concept-grid">
        <div className="concept-card">
          <h3>Real-time Updates</h3>
          <p>
            Subscriptions provide a way to push data from server to client when
            specific events occur. Unlike queries and mutations, subscriptions
            maintain a persistent connection for live updates.
          </p>
        </div>
        
        <div className="concept-card">
          <h3>WebSocket Transport</h3>
          <p>
            Subscriptions typically use WebSockets for persistent, bidirectional
            communication. This enables real-time features like live chat,
            notifications, and collaborative editing.
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Event-Driven Architecture</h3>
          <p>
            Subscriptions work with pub/sub systems where events are published
            to topics and clients subscribe to receive updates. This decouples
            event generation from consumption.
          </p>
        </div>
      </div>

      <div className="realtime-container">
        <h3>Live Subscription Demo</h3>
        <p className="page-description" style={{ marginBottom: '2rem' }}>
          Try starting a subscription to see real-time events as they happen:
        </p>
        
        <div className="demo-controls">
          {Object.keys(SUBSCRIPTION_EXAMPLES).map((name) => (
            <button
              key={name}
              className={`demo-button ${selectedExample === name ? 'active' : ''}`}
              onClick={() => loadExample(name)}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="code-container" style={{ margin: '2rem 0' }}>
          <div className="code-header">
            <span className="code-title">{selectedExample} Subscription</span>
          </div>
          <div className="code-content">
            <pre>{subscription}</pre>
          </div>
        </div>

        <div className="subscription-status">
          <div className={`status-indicator ${
            activeSubscription ? 'connected' : 'disconnected'
          }`}></div>
          <span>
            Status: {activeSubscription ? `Connected to ${activeSubscription}` : 'Disconnected'}
          </span>
        </div>

        <div className="demo-controls" style={{ margin: '1rem 0' }}>
          {!activeSubscription ? (
            <button className="execute-button" onClick={startSubscription}>
              Start Subscription
            </button>
          ) : (
            <button className="demo-button" onClick={stopSubscription}>
              Stop Subscription
            </button>
          )}
        </div>

        <div className="subscription-events">
          <h4>Live Events ({events.length})</h4>
          {events.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>
              {activeSubscription ? 'Waiting for events...' : 'Start a subscription to see live events'}
            </p>
          ) : (
            events.map((event) => (
              <div key={event.id} className="subscription-event">
                <div className="event-timestamp">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
                <div className="event-data">
                  {JSON.stringify(event.data, null, 2)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="code-container">
        <div className="code-header">
          <span className="code-title">Subscription Syntax & Structure</span>
        </div>
        <div className="code-content">
          <pre>{`# Basic subscription structure
subscription SubscriptionName {
  eventField {
    field1
    field2
    nestedObject {
      nestedField
    }
  }
}

# Subscription with variables
subscription OnCommentAdded($postId: ID!) {
  commentAdded(postId: $postId) {
    id
    content
    author {
      name
    }
    createdAt
  }
}

# Multiple subscription fields (not recommended)
subscription MultipleEvents {
  postAdded {
    id
    title
  }
  commentAdded {
    id
    content
  }
}

# Subscription with fragments
fragment PostInfo on Post {
  id
  title
  author {
    name
  }
}

subscription {
  postAdded {
    ...PostInfo
    createdAt
  }
}`}</pre>
        </div>
      </div>

      <div className="concept-grid">
        <div className="concept-card">
          <h3>Subscription Lifecycle</h3>
          <p>
            1. Client opens WebSocket connection<br/>
            2. Client sends subscription operation<br/>
            3. Server validates and starts subscription<br/>
            4. Server sends data when events occur<br/>
            5. Client can unsubscribe or close connection
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Error Handling</h3>
          <p>
            Subscriptions can send errors alongside data. Handle connection
            failures, reconnection logic, and graceful degradation when
            real-time features are unavailable.
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Performance Considerations</h3>
          <p>
            Monitor subscription usage, implement rate limiting, use filtering
            to reduce unnecessary updates, and consider batching events
            for high-frequency updates.
          </p>
        </div>
      </div>

      <div className="code-container">
        <div className="code-header">
          <span className="code-title">Server-Side Subscription Implementation</span>
        </div>
        <div className="code-content">
          <pre>{`// GraphQL Schema
type Subscription {
  postAdded: Post!
  commentAdded(postId: ID!): Comment!
  userOnline: User!
}

// Resolver implementation (Node.js example)
const { PubSub } = require('graphql-subscriptions');
const pubsub = new PubSub();

const resolvers = {
  Subscription: {
    postAdded: {
      subscribe: () => pubsub.asyncIterator(['POST_ADDED']),
    },
    
    commentAdded: {
      subscribe: (_, { postId }) => 
        pubsub.asyncIterator([\`COMMENT_ADDED_\${postId}\`]),
    },
    
    userOnline: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['USER_STATUS_CHANGED']),
        (payload, variables) => {
          return payload.userOnline.status === 'online';
        }
      ),
    },
  },
  
  Mutation: {
    createPost: async (_, { input }) => {
      const post = await createPost(input);
      
      // Publish event for subscribers
      pubsub.publish('POST_ADDED', { postAdded: post });
      
      return post;
    },
  },
};

// WebSocket server setup
const { createServer } = require('http');
const { ApolloServer } = require('apollo-server-express');
const { SubscriptionServer } = require('subscriptions-transport-ws');

const server = new ApolloServer({ typeDefs, resolvers });

const httpServer = createServer(app);
server.installSubscriptionHandlers(httpServer);

SubscriptionServer.create(
  { schema, execute, subscribe },
  { server: httpServer, path: '/graphql' }
);`}</pre>
        </div>
      </div>

      <div className="demo-container">
        <h3>Common Subscription Patterns</h3>
        <div className="concept-grid">
          <div className="concept-card">
            <h4>Live Comments</h4>
            <div className="code-content">
              <pre>{`subscription LiveComments($postId: ID!) {
  commentAdded(postId: $postId) {
    id
    content
    author {
      name
      avatar
    }
    createdAt
  }
}`}</pre>
            </div>
          </div>
          
          <div className="concept-card">
            <h4>Notifications</h4>
            <div className="code-content">
              <pre>{`subscription UserNotifications($userId: ID!) {
  notificationReceived(userId: $userId) {
    id
    type
    title
    message
    read
    createdAt
  }
}`}</pre>
            </div>
          </div>
          
          <div className="concept-card">
            <h4>Live Status Updates</h4>
            <div className="code-content">
              <pre>{`subscription OnlineUsers {
  userStatusChanged {
    user {
      id
      name
    }
    status
    lastSeen
  }
}`}</pre>
            </div>
          </div>
        </div>
      </div>

      <div className="concept-grid">
        <div className="concept-card">
          <h3>Client Libraries</h3>
          <p>
            Apollo Client, Relay, and graphql-ws provide subscription support
            with automatic reconnection, error handling, and integration
            with React components and state management.
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Scaling Subscriptions</h3>
          <p>
            For production apps, consider Redis pub/sub, message queues,
            connection pooling, and horizontal scaling strategies for
            handling thousands of concurrent subscriptions.
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Security & Authorization</h3>
          <p>
            Implement authentication for WebSocket connections, authorize
            subscription access, validate subscription arguments, and
            prevent subscription abuse with rate limiting.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionsPage