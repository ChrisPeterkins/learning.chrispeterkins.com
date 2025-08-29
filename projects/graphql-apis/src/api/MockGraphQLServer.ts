import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { buildSchema, graphql, GraphQLSchema } from 'graphql';
import { resolvers } from './resolvers';
import { BASIC_SCHEMA, ADVANCED_SCHEMA } from './schemas';

// Mock GraphQL Server implementation
export class MockGraphQLServer {
  private schema: GraphQLSchema;
  private resolvers: any;
  
  constructor(schemaString: string = BASIC_SCHEMA, customResolvers: any = resolvers) {
    this.schema = buildSchema(schemaString);
    this.resolvers = customResolvers;
  }
  
  async executeQuery(query: string, variables?: any, context?: any) {
    try {
      const result = await graphql({
        schema: this.schema,
        source: query,
        rootValue: this.resolvers,
        contextValue: context,
        variableValues: variables,
      });
      
      return result;
    } catch (error) {
      console.error('GraphQL execution error:', error);
      return {
        errors: [{ message: error instanceof Error ? error.message : 'Unknown error' }]
      };
    }
  }
  
  // Simulate network delay
  async executeQueryWithDelay(query: string, variables?: any, delay: number = 500) {
    await new Promise(resolve => setTimeout(resolve, delay));
    return this.executeQuery(query, variables);
  }
  
  // Get schema introspection
  getIntrospection() {
    const introspectionQuery = `
      query IntrospectionQuery {
        __schema {
          types {
            name
            kind
            description
            fields {
              name
              type {
                name
                kind
                ofType {
                  name
                  kind
                }
              }
            }
          }
        }
      }
    `;
    
    return this.executeQuery(introspectionQuery);
  }
}

// Create Apollo Client with mock server
export function createMockApolloClient() {
  const mockServer = new MockGraphQLServer();
  
  // Custom link that uses our mock server
  const mockLink = {
    request: async (operation: any) => {
      const { query, variables } = operation;
      const result = await mockServer.executeQuery(query.loc.source.body, variables);
      
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(result);
        }, Math.random() * 500 + 200); // Random delay 200-700ms
      });
    }
  };
  
  return new ApolloClient({
    link: mockLink as any,
    cache: new InMemoryCache({
      typePolicies: {
        Post: {
          fields: {
            comments: {
              merge: false // Don't merge, replace the array
            }
          }
        },
        User: {
          fields: {
            posts: {
              merge: false
            }
          }
        }
      }
    }),
    defaultOptions: {
      watchQuery: {
        errorPolicy: 'all'
      },
      query: {
        errorPolicy: 'all'
      }
    }
  });
}

// Query execution utilities
export class QueryExecutor {
  private server: MockGraphQLServer;
  
  constructor(schema?: string) {
    this.server = new MockGraphQLServer(schema);
  }
  
  async execute(query: string, variables?: any) {
    const startTime = Date.now();
    const result = await this.server.executeQueryWithDelay(query, variables, 300);
    const executionTime = Date.now() - startTime;
    
    return {
      ...result,
      extensions: {
        executionTime,
        timestamp: new Date().toISOString()
      }
    };
  }
  
  // Validate query syntax
  validateQuery(query: string) {
    try {
      const { parse } = require('graphql');
      parse(query);
      return { valid: true, errors: [] };
    } catch (error) {
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : 'Parse error']
      };
    }
  }
  
  // Format query result for display
  formatResult(result: any) {
    return {
      data: result.data ? JSON.stringify(result.data, null, 2) : null,
      errors: result.errors?.map((err: any) => ({
        message: err.message,
        locations: err.locations,
        path: err.path
      })),
      extensions: result.extensions
    };
  }
}

// Real-time subscription simulator
export class SubscriptionSimulator {
  private listeners: Map<string, Function[]> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  
  subscribe(subscription: string, callback: Function) {
    const subscriptionId = this.generateId();
    
    if (!this.listeners.has(subscription)) {
      this.listeners.set(subscription, []);
    }
    
    this.listeners.get(subscription)!.push(callback);
    
    // Start simulating events
    this.startSimulation(subscription);
    
    return {
      unsubscribe: () => {
        const callbacks = this.listeners.get(subscription);
        if (callbacks) {
          const index = callbacks.indexOf(callback);
          if (index > -1) {
            callbacks.splice(index, 1);
          }
          
          if (callbacks.length === 0) {
            this.stopSimulation(subscription);
            this.listeners.delete(subscription);
          }
        }
      }
    };
  }
  
  private startSimulation(subscription: string) {
    if (this.intervals.has(subscription)) {
      return; // Already running
    }
    
    const interval = setInterval(() => {
      this.simulateEvent(subscription);
    }, 3000 + Math.random() * 4000); // 3-7 seconds
    
    this.intervals.set(subscription, interval);
  }
  
  private stopSimulation(subscription: string) {
    const interval = this.intervals.get(subscription);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(subscription);
    }
  }
  
  private simulateEvent(subscription: string) {
    const callbacks = this.listeners.get(subscription);
    if (!callbacks) return;
    
    let mockData;
    
    if (subscription.includes('postAdded')) {
      mockData = {
        postAdded: {
          id: this.generateId(),
          title: `Live Post Update ${new Date().toLocaleTimeString()}`,
          content: 'This post was created in real-time!',
          author: {
            id: '1',
            name: 'Real-time User'
          },
          createdAt: new Date().toISOString()
        }
      };
    } else if (subscription.includes('commentAdded')) {
      mockData = {
        commentAdded: {
          id: this.generateId(),
          content: `Live comment at ${new Date().toLocaleTimeString()}`,
          author: {
            id: '2',
            name: 'Comment Author'
          },
          createdAt: new Date().toISOString()
        }
      };
    }
    
    if (mockData) {
      callbacks.forEach(callback => callback(mockData));
    }
  }
  
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
  
  // Clean up all subscriptions
  cleanup() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    this.listeners.clear();
  }
}

// Export singleton instances
export const mockServer = new MockGraphQLServer();
export const queryExecutor = new QueryExecutor();
export const subscriptionSimulator = new SubscriptionSimulator();

// Performance testing utilities
export class PerformanceTester {
  async testQuery(query: string, variables?: any, iterations: number = 10) {
    const results = [];
    const server = new MockGraphQLServer();
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await server.executeQuery(query, variables);
      const end = performance.now();
      results.push(end - start);
    }
    
    return {
      iterations,
      times: results,
      average: results.reduce((a, b) => a + b) / results.length,
      min: Math.min(...results),
      max: Math.max(...results),
      total: results.reduce((a, b) => a + b)
    };
  }
  
  async compareQueries(queries: { name: string, query: string, variables?: any }[]) {
    const results = {};
    
    for (const { name, query, variables } of queries) {
      results[name] = await this.testQuery(query, variables);
    }
    
    return results;
  }
}

export const performanceTester = new PerformanceTester();