export interface PeerConnectionConfig {
  iceServers: RTCIceServer[]
}

export interface ConnectionState {
  connectionState: RTCPeerConnectionState
  iceConnectionState: RTCIceConnectionState
  iceGatheringState: RTCIceGatheringState
  signalingState: RTCSignalingState
}

export class WebRTCPeerConnection {
  private peerConnection: RTCPeerConnection
  private localStream?: MediaStream
  private remoteStream?: MediaStream
  private dataChannel?: RTCDataChannel
  private onStateChange?: (state: ConnectionState) => void
  private onRemoteStream?: (stream: MediaStream) => void
  private onDataChannelMessage?: (message: string) => void

  constructor(config?: PeerConnectionConfig) {
    const defaultConfig: RTCConfiguration = {
      iceServers: config?.iceServers || [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    }

    this.peerConnection = new RTCPeerConnection(defaultConfig)
    this.setupEventListeners()
  }

  private setupEventListeners() {
    this.peerConnection.addEventListener('connectionstatechange', () => {
      this.notifyStateChange()
    })

    this.peerConnection.addEventListener('iceconnectionstatechange', () => {
      this.notifyStateChange()
    })

    this.peerConnection.addEventListener('icegatheringstatechange', () => {
      this.notifyStateChange()
    })

    this.peerConnection.addEventListener('signalingstatechange', () => {
      this.notifyStateChange()
    })

    this.peerConnection.addEventListener('track', (event) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0]
        if (this.onRemoteStream) {
          this.onRemoteStream(this.remoteStream)
        }
      }
    })

    this.peerConnection.addEventListener('datachannel', (event) => {
      const channel = event.channel
      channel.addEventListener('message', (event) => {
        if (this.onDataChannelMessage) {
          this.onDataChannelMessage(event.data)
        }
      })
    })
  }

  private notifyStateChange() {
    if (this.onStateChange) {
      this.onStateChange({
        connectionState: this.peerConnection.connectionState,
        iceConnectionState: this.peerConnection.iceConnectionState,
        iceGatheringState: this.peerConnection.iceGatheringState,
        signalingState: this.peerConnection.signalingState
      })
    }
  }

  async addLocalStream(stream: MediaStream) {
    this.localStream = stream
    stream.getTracks().forEach(track => {
      this.peerConnection.addTrack(track, stream)
    })
  }

  createDataChannel(label: string, options?: RTCDataChannelInit) {
    this.dataChannel = this.peerConnection.createDataChannel(label, options)
    
    this.dataChannel.addEventListener('open', () => {
      console.log('Data channel opened')
    })

    this.dataChannel.addEventListener('message', (event) => {
      if (this.onDataChannelMessage) {
        this.onDataChannelMessage(event.data)
      }
    })

    return this.dataChannel
  }

  sendDataChannelMessage(message: string) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(message)
    }
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    const offer = await this.peerConnection.createOffer()
    await this.peerConnection.setLocalDescription(offer)
    return offer
  }

  async createAnswer(): Promise<RTCSessionDescriptionInit> {
    const answer = await this.peerConnection.createAnswer()
    await this.peerConnection.setLocalDescription(answer)
    return answer
  }

  async setRemoteDescription(description: RTCSessionDescriptionInit) {
    await this.peerConnection.setRemoteDescription(description)
  }

  async addIceCandidate(candidate: RTCIceCandidateInit) {
    await this.peerConnection.addIceCandidate(candidate)
  }

  getConnectionState(): ConnectionState {
    return {
      connectionState: this.peerConnection.connectionState,
      iceConnectionState: this.peerConnection.iceConnectionState,
      iceGatheringState: this.peerConnection.iceGatheringState,
      signalingState: this.peerConnection.signalingState
    }
  }

  getLocalStream(): MediaStream | undefined {
    return this.localStream
  }

  getRemoteStream(): MediaStream | undefined {
    return this.remoteStream
  }

  onStateChangeListener(callback: (state: ConnectionState) => void) {
    this.onStateChange = callback
  }

  onRemoteStreamListener(callback: (stream: MediaStream) => void) {
    this.onRemoteStream = callback
  }

  onDataChannelMessageListener(callback: (message: string) => void) {
    this.onDataChannelMessage = callback
  }

  close() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
    }
    if (this.dataChannel) {
      this.dataChannel.close()
    }
    this.peerConnection.close()
  }
}