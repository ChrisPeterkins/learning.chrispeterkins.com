export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join' | 'leave'
  data?: any
  from?: string
  to?: string
}

export interface SignalingStep {
  id: number
  action: string
  description: string
  timestamp: number
  status: 'pending' | 'completed' | 'failed'
}

export class MockSignalingServer {
  private peers: Map<string, any> = new Map()
  private messageHandlers: Map<string, (message: SignalingMessage) => void> = new Map()
  private signalingSteps: SignalingStep[] = []
  private onStepUpdate?: (steps: SignalingStep[]) => void

  constructor() {
    this.initializeSignalingSteps()
  }

  private initializeSignalingSteps() {
    this.signalingSteps = [
      {
        id: 1,
        action: 'Initialize Connection',
        description: 'Client connects to signaling server',
        timestamp: Date.now(),
        status: 'pending'
      },
      {
        id: 2,
        action: 'Exchange Offers',
        description: 'Peers exchange session descriptions (SDP)',
        timestamp: Date.now(),
        status: 'pending'
      },
      {
        id: 3,
        action: 'ICE Candidate Exchange',
        description: 'Exchange network connectivity information',
        timestamp: Date.now(),
        status: 'pending'
      },
      {
        id: 4,
        action: 'STUN/TURN Resolution',
        description: 'Resolve NAT traversal using STUN/TURN servers',
        timestamp: Date.now(),
        status: 'pending'
      },
      {
        id: 5,
        action: 'Establish Connection',
        description: 'Direct P2P connection established',
        timestamp: Date.now(),
        status: 'pending'
      }
    ]
  }

  private updateStep(id: number, status: 'completed' | 'failed') {
    const step = this.signalingSteps.find(s => s.id === id)
    if (step) {
      step.status = status
      step.timestamp = Date.now()
      if (this.onStepUpdate) {
        this.onStepUpdate([...this.signalingSteps])
      }
    }
  }

  connect(peerId: string): Promise<void> {
    return new Promise((resolve) => {
      this.peers.set(peerId, { id: peerId, connected: true })
      this.updateStep(1, 'completed')
      
      // Simulate network delay
      setTimeout(() => {
        resolve()
      }, 500)
    })
  }

  join(peerId: string, messageHandler: (message: SignalingMessage) => void) {
    this.messageHandlers.set(peerId, messageHandler)
    this.peers.set(peerId, { id: peerId, connected: true })
    
    // Notify other peers
    this.broadcast({
      type: 'join',
      from: peerId
    }, peerId)
  }

  leave(peerId: string) {
    this.messageHandlers.delete(peerId)
    this.peers.delete(peerId)
    
    // Notify other peers
    this.broadcast({
      type: 'leave',
      from: peerId
    }, peerId)
  }

  sendMessage(message: SignalingMessage, fromPeerId: string, toPeerId?: string): Promise<void> {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        if (message.type === 'offer' || message.type === 'answer') {
          this.updateStep(2, 'completed')
        } else if (message.type === 'ice-candidate') {
          this.updateStep(3, 'completed')
          // Simulate STUN/TURN process
          setTimeout(() => {
            this.updateStep(4, 'completed')
            // Simulate connection establishment
            setTimeout(() => {
              this.updateStep(5, 'completed')
            }, 1000)
          }, 800)
        }

        if (toPeerId) {
          // Send to specific peer
          const handler = this.messageHandlers.get(toPeerId)
          if (handler) {
            handler({ ...message, from: fromPeerId, to: toPeerId })
          }
        } else {
          // Broadcast to all other peers
          this.broadcast({ ...message, from: fromPeerId }, fromPeerId)
        }
        
        resolve()
      }, Math.random() * 300 + 100) // Random delay 100-400ms
    })
  }

  private broadcast(message: SignalingMessage, excludePeerId: string) {
    this.messageHandlers.forEach((handler, peerId) => {
      if (peerId !== excludePeerId) {
        handler(message)
      }
    })
  }

  getConnectedPeers(): string[] {
    return Array.from(this.peers.keys())
  }

  getSignalingSteps(): SignalingStep[] {
    return [...this.signalingSteps]
  }

  onSignalingStepUpdate(callback: (steps: SignalingStep[]) => void) {
    this.onStepUpdate = callback
  }

  resetSignaling() {
    this.initializeSignalingSteps()
    if (this.onStepUpdate) {
      this.onStepUpdate([...this.signalingSteps])
    }
  }

  // Simulate signaling server events for demo purposes
  simulateSignalingProcess(): Promise<void> {
    return new Promise((resolve) => {
      let currentStep = 1
      
      const processStep = () => {
        if (currentStep <= this.signalingSteps.length) {
          this.updateStep(currentStep, 'completed')
          currentStep++
          setTimeout(processStep, 800)
        } else {
          resolve()
        }
      }
      
      processStep()
    })
  }
}