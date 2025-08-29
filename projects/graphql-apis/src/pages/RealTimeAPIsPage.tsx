import React, { useState, useEffect } from 'react'
import { subscriptionSimulator } from '../api/MockGraphQLServer'

const REALTIME_EXAMPLES = {
  'Chat Application': {
    subscription: `subscription ChatMessages($roomId: ID!) {
  messageAdded(roomId: $roomId) {
    id
    content
    user {
      id
      name
      avatar
    }
    timestamp
  }
}`,
    setup: `// Server setup
const { PubSub } = require('graphql-subscriptions');
const pubsub = new PubSub();

const resolvers = {
  Subscription: {
    messageAdded: {
      subscribe: (_, { roomId }) => 
        pubsub.asyncIterator(\`MESSAGE_ADDED_\${roomId}\`)
    }
  },
  
  Mutation: {
    sendMessage: async (_, { roomId, content, userId }) => {
      const message = await createMessage({ roomId, content, userId });
      pubsub.publish(\`MESSAGE_ADDED_\${roomId}\`, {
        messageAdded: message
      });
      return message;
    }
  }
};`,
    description: 'Real-time messaging with room-based subscriptions'
  },

  'Live Notifications': {
    subscription: `subscription UserNotifications($userId: ID!) {
  notificationReceived(userId: $userId) {
    id
    type
    title
    message
    data
    read
    createdAt
  }
}`,
    setup: `// Client implementation
const { useSubscription } = require('@apollo/client');

function NotificationCenter({ userId }) {
  const { data, loading } = useSubscription(USER_NOTIFICATIONS, {
    variables: { userId }
  });

  useEffect(() => {
    if (data?.notificationReceived) {
      // Show toast notification
      showToast(data.notificationReceived);
      
      // Play notification sound
      playNotificationSound();
      
      // Update unread count
      updateUnreadCount();
    }
  }, [data]);

  return <NotificationList />;
}`,
    description: 'Push notifications for user-specific events'
  },

  'Live Dashboard': {
    subscription: `subscription DashboardMetrics {
  metricsUpdated {
    timestamp
    activeUsers
    totalSales
    conversionRate
    topProducts {
      id
      name
      sales
    }
    recentOrders {
      id
      total
      customer
    }
  }
}`,
    setup: `// Real-time dashboard updates
const DASHBOARD_SUBSCRIPTION = gql\`
  subscription DashboardMetrics {
    metricsUpdated {
      timestamp
      activeUsers
      totalSales
      conversionRate
    }
  }
\`;

function Dashboard() {
  const { data, error } = useSubscription(DASHBOARD_SUBSCRIPTION);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    if (data?.metricsUpdated) {
      setMetrics(data.metricsUpdated);
      updateCharts(data.metricsUpdated);
    }
  }, [data]);

  return <MetricsDashboard metrics={metrics} />;
}`,
    description: 'Live business metrics and dashboard updates'
  },

  'Collaborative Editing': {
    subscription: `subscription DocumentChanges($documentId: ID!) {
  documentUpdated(documentId: $documentId) {
    id
    operation
    position
    content
    user {
      id
      name
      cursor
    }
    timestamp
  }
}`,
    setup: `// Operational transformation for collaborative editing
const resolvers = {
  Subscription: {
    documentUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('DOCUMENT_UPDATED'),
        (payload, variables) => {
          return payload.documentUpdated.documentId === variables.documentId;
        }
      )
    }
  },
  
  Mutation: {
    updateDocument: async (_, { documentId, operation }) => {
      // Apply operational transformation
      const transformedOp = await transformOperation(operation);
      
      // Save to database
      await saveOperation(documentId, transformedOp);
      
      // Broadcast to subscribers
      pubsub.publish('DOCUMENT_UPDATED', {
        documentUpdated: {
          documentId,
          operation: transformedOp,
          timestamp: new Date()
        }
      });
      
      return transformedOp;
    }
  }
};`,
    description: 'Real-time collaborative document editing'
  }
};

interface LiveEvent {
  id: string
  type: string
  timestamp: string
  data: any
}

function RealTimeAPIsPage() {
  const [selectedExample, setSelectedExample] = useState('Chat Application')
  const [isConnected, setIsConnected] = useState(false)
  const [events, setEvents] = useState<LiveEvent[]>([])
  const [connectionCount, setConnectionCount] = useState(0)

  useEffect(() => {
    // Simulate connection count changes
    const interval = setInterval(() => {
      setConnectionCount(prev => {
        const change = Math.random() > 0.5 ? 1 : -1
        const newCount = Math.max(0, prev + change)
        return Math.min(100, newCount)
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const connectToLiveUpdates = () => {
    setIsConnected(true)
    setEvents([])

    const subscription = subscriptionSimulator.subscribe(selectedExample, (data: any) => {
      const newEvent: LiveEvent = {
        id: Math.random().toString(36),
        type: selectedExample,
        timestamp: new Date().toISOString(),
        data
      }
      setEvents(prev => [newEvent, ...prev].slice(0, 10))
    })

    return () => {
      subscription.unsubscribe()
      setIsConnected(false)
    }
  }

  const disconnect = () => {
    subscriptionSimulator.cleanup()
    setIsConnected(false)
  }

  const currentExample = REALTIME_EXAMPLES[selectedExample as keyof typeof REALTIME_EXAMPLES]

  return (
    <div>
      <div className="page-header">
        <h1>Real-time APIs</h1>
        <p className="page-description">
          Build modern real-time applications with GraphQL subscriptions and WebSockets.
          Learn patterns for live chat, notifications, collaborative editing, and
          live dashboards with persistent connections and event-driven architecture.
        </p>
      </div>

      <div className="concept-grid">
        <div className="concept-card">
          <h3>WebSocket Transport</h3>
          <p>
            GraphQL subscriptions use WebSockets for persistent, bidirectional
            communication. This enables real-time features like live updates,
            instant messaging, and collaborative applications.
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Pub/Sub Architecture</h3>
          <p>
            Real-time APIs use publish/subscribe patterns where events are
            published to topics and clients subscribe to receive relevant
            updates. This decouples event producers from consumers.
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Event-Driven Design</h3>
          <p>
            Design your real-time features around meaningful business events.
            Consider event granularity, filtering, and how clients will
            consume and react to different event types.
          </p>
        </div>
      </div>

      <div className="realtime-container">
        <h3>Real-time Connection Status</h3>
        
        <div className="performance-metrics">
          <div className="metric-card">
            <div className="metric-value">{isConnected ? 'Connected' : 'Disconnected'}</div>
            <div className="metric-label">WebSocket Status</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-value">{events.length}</div>
            <div className="metric-label">Events Received</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-value">{connectionCount}</div>
            <div className="metric-label">Active Connections</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-value">{isConnected ? '<50ms' : 'N/A'}</div>
            <div className="metric-label">Latency</div>
          </div>
        </div>
      </div>

      <div className="demo-container">
        <h3>Real-time Patterns & Examples</h3>
        <p className="page-description" style={{ marginBottom: '2rem' }}>
          Explore common real-time application patterns:
        </p>
        
        <div className="demo-controls">
          {Object.keys(REALTIME_EXAMPLES).map((example) => (
            <button
              key={example}
              className={`demo-button ${selectedExample === example ? 'active' : ''}`}
              onClick={() => setSelectedExample(example)}
            >
              {example}
            </button>
          ))}
        </div>

        <div className="concept-card">
          <h4>{selectedExample}</h4>
          <p style={{ marginBottom: '1.5rem' }}>{currentExample.description}</p>
          
          <h5>Subscription Definition:</h5>
          <div className="code-content" style={{ marginBottom: '1.5rem' }}>
            <pre>{currentExample.subscription}</pre>
          </div>
          
          <h5>Implementation Example:</h5>
          <div className="code-content">
            <pre>{currentExample.setup}</pre>
          </div>
        </div>
      </div>

      <div className="realtime-container">
        <h3>Live Event Stream</h3>
        
        <div className="demo-controls" style={{ marginBottom: '2rem' }}>
          {!isConnected ? (
            <button className="execute-button" onClick={connectToLiveUpdates}>
              Connect to Live Updates
            </button>
          ) : (
            <button className="demo-button" onClick={disconnect}>
              Disconnect
            </button>
          )}
        </div>

        <div className="subscription-events">
          <h4>Live Events for {selectedExample}</h4>
          {events.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>
              {isConnected ? 'Listening for events...' : 'Connect to see live events'}
            </p>
          ) : (
            events.map((event) => (
              <div key={event.id} className="subscription-event">
                <div className="event-timestamp">
                  {new Date(event.timestamp).toLocaleTimeString()} - {event.type}
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
          <span className="code-title">WebSocket & Subscription Setup</span>
        </div>
        <div className="code-content">
          <pre>{`// Server setup with Apollo Server
const { ApolloServer } = require('apollo-server-express');
const { createServer } = require('http');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { execute, subscribe } = require('graphql');

const app = express();
const httpServer = createServer(app);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, connection }) => {
    // HTTP context for queries/mutations
    if (connection) {
      // WebSocket context for subscriptions
      return connection.context;
    } else {
      return { user: req.user };
    }
  },
});

await server.start();
server.applyMiddleware({ app });

// WebSocket server for subscriptions
SubscriptionServer.create({
  schema: server.schema,
  execute,
  subscribe,
  onConnect: (connectionParams, webSocket) => {
    console.log('Client connected');
    // Authentication can happen here
    return { user: authenticateUser(connectionParams) };
  },
  onDisconnect: (webSocket) => {
    console.log('Client disconnected');
  },
}, {
  server: httpServer,
  path: '/graphql',
});

httpServer.listen(4000);

// Client setup with Apollo Client
import { ApolloClient, InMemoryCache, split, HttpLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql'
});

const wsLink = new GraphQLWsLink(createClient({
  url: 'ws://localhost:4000/graphql',
  connectionParams: {
    authToken: localStorage.getItem('token'),
  },
}));

// Split based on operation type
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});`}</pre>
        </div>
      </div>

      <div className="concept-grid">
        <div className="concept-card">
          <h3>Subscription Filtering</h3>
          <p>
            Use filters to send only relevant events to each client.
            Implement server-side filtering based on user permissions,
            interests, or other criteria to reduce bandwidth and
            improve performance.
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Connection Management</h3>
          <p>
            Handle connection lifecycle events: authentication on connect,
            cleanup on disconnect, heartbeat/keepalive, and graceful
            reconnection with exponential backoff.
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Scaling Considerations</h3>
          <p>
            For high-scale applications, consider Redis pub/sub,
            message queues, connection pooling, and horizontal
            scaling strategies for WebSocket servers.
          </p>
        </div>
      </div>

      <div className="code-container">
        <div className="code-header">
          <span className="code-title">Advanced Subscription Patterns</span>
        </div>
        <div className="code-content">
          <pre>{`// Filtered subscriptions with withFilter
const { withFilter } = require('graphql-subscriptions');

const resolvers = {
  Subscription: {
    // Only send notifications to the target user
    notificationAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('NOTIFICATION_ADDED'),
        (payload, variables, context) => {
          return payload.notificationAdded.userId === variables.userId;
        }
      )
    },
    
    // Room-based chat with authentication
    chatMessage: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('CHAT_MESSAGE'),
        async (payload, variables, context) => {
          // Check if user has access to this room
          const hasAccess = await checkRoomAccess(
            context.user.id, 
            variables.roomId
          );
          return hasAccess && payload.chatMessage.roomId === variables.roomId;
        }
      )
    },
    
    // Live presence with user filtering
    userPresence: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('USER_PRESENCE'),
        (payload, variables, context) => {
          // Only show presence of users in same organization
          return payload.userPresence.organizationId === context.user.organizationId;
        }
      )
    }
  }
};

// Rate limiting for subscriptions
const rateLimiter = new Map();

const rateLimitedResolver = {
  subscribe: (root, args, context) => {
    const userId = context.user.id;
    const now = Date.now();
    const userLimits = rateLimiter.get(userId) || [];
    
    // Clean old entries
    const validEntries = userLimits.filter(time => now - time < 60000); // 1 minute window
    
    if (validEntries.length >= 10) { // Max 10 subscriptions per minute
      throw new Error('Rate limit exceeded');
    }
    
    validEntries.push(now);
    rateLimiter.set(userId, validEntries);
    
    return pubsub.asyncIterator('SOME_EVENT');
  }
};

// Batch subscription events
const batchedPublish = (() => {
  const batches = new Map();
  
  return (topic, payload) => {
    if (!batches.has(topic)) {
      batches.set(topic, []);
      
      // Process batch after short delay
      setTimeout(() => {
        const batch = batches.get(topic);
        batches.delete(topic);
        
        if (batch.length > 0) {
          pubsub.publish(topic, { 
            batchedEvents: batch,
            timestamp: new Date().toISOString()
          });
        }
      }, 100); // 100ms batch window
    }
    
    batches.get(topic).push(payload);
  };
})();`}</pre>
        </div>
      </div>

      <div className="demo-container">
        <h3>Real-time Architecture Patterns</h3>
        <div className="concept-grid">
          <div className="concept-card">
            <h4>Direct WebSocket</h4>
            <p>
              Simple setup where GraphQL server handles WebSocket connections directly.
              Good for small to medium applications with moderate real-time requirements.
            </p>
          </div>
          
          <div className="concept-card">
            <h4>Message Queue Integration</h4>
            <p>
              Use Redis, RabbitMQ, or Apache Kafka for pub/sub. Enables horizontal
              scaling and decouples event generation from WebSocket management.
            </p>
          </div>
          
          <div className="concept-card">
            <h4>Microservices with Event Bus</h4>
            <p>
              Distributed architecture where services publish events to a shared
              event bus, and GraphQL gateway manages subscriptions and filtering.
            </p>
          </div>
        </div>
      </div>

      <div className="concept-grid">
        <div className="concept-card">
          <h3>Error Handling</h3>
          <p>
            • Handle connection drops gracefully<br/>
            • Implement automatic reconnection<br/>
            • Send error events in subscription stream<br/>
            • Provide fallback for offline scenarios<br/>
            • Log connection issues for monitoring
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Performance Optimization</h3>
          <p>
            • Use connection pooling<br/>
            • Implement event batching<br/>
            • Add subscription rate limiting<br/>
            • Monitor connection count<br/>
            • Optimize event serialization<br/>
            • Cache frequently accessed data
          </p>
        </div>
        
        <div className="concept-card">
          <h3>Security Best Practices</h3>
          <p>
            • Authenticate WebSocket connections<br/>
            • Validate subscription parameters<br/>
            • Implement authorization per event<br/>
            • Add rate limiting per user<br/>
            • Monitor for subscription abuse<br/>
            • Use HTTPS/WSS in production
          </p>
        </div>
      </div>
    </div>
  )
}

export default RealTimeAPIsPage