export interface MediaDeviceInfo {
  deviceId: string
  label: string
  kind: MediaDeviceKind
}

export interface MediaConstraints {
  video?: boolean | MediaTrackConstraints
  audio?: boolean | MediaTrackConstraints
}

export interface MediaStats {
  videoBitrate: number
  audioBitrate: number
  videoResolution: { width: number; height: number }
  frameRate: number
}

export class MediaManager {
  private currentStream?: MediaStream
  private videoElement?: HTMLVideoElement
  private audioContext?: AudioContext
  private analyser?: AnalyserNode
  private onStatsUpdate?: (stats: MediaStats) => void

  constructor() {
    // Initialize audio context for audio analysis
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      this.audioContext = new AudioContext()
    }
  }

  async getAvailableDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      return devices.map(device => ({
        deviceId: device.deviceId,
        label: device.label || `${device.kind} ${device.deviceId.slice(0, 8)}`,
        kind: device.kind
      }))
    } catch (error) {
      console.error('Error enumerating devices:', error)
      return []
    }
  }

  async getUserMedia(constraints: MediaConstraints = { video: true, audio: true }): Promise<MediaStream> {
    try {
      this.currentStream = await navigator.mediaDevices.getUserMedia(constraints)
      
      // Set up audio analysis if audio is enabled
      if (constraints.audio && this.audioContext) {
        this.setupAudioAnalysis(this.currentStream)
      }
      
      return this.currentStream
    } catch (error) {
      console.error('Error accessing media devices:', error)
      throw new Error(`Failed to access media devices: ${error}`)
    }
  }

  private setupAudioAnalysis(stream: MediaStream) {
    if (!this.audioContext) return

    const audioTracks = stream.getAudioTracks()
    if (audioTracks.length === 0) return

    try {
      const source = this.audioContext.createMediaStreamSource(stream)
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 256
      source.connect(this.analyser)
    } catch (error) {
      console.error('Error setting up audio analysis:', error)
    }
  }

  getAudioData(): Uint8Array | null {
    if (!this.analyser) return null
    
    const bufferLength = this.analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    this.analyser.getByteFrequencyData(dataArray)
    return dataArray
  }

  getAudioLevel(): number {
    const audioData = this.getAudioData()
    if (!audioData) return 0

    let sum = 0
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i]
    }
    return sum / audioData.length / 255 // Normalize to 0-1
  }

  attachToVideoElement(videoElement: HTMLVideoElement) {
    this.videoElement = videoElement
    if (this.currentStream) {
      videoElement.srcObject = this.currentStream
    }
  }

  async switchCamera(deviceId?: string): Promise<MediaStream> {
    if (!this.currentStream) {
      throw new Error('No active stream to switch')
    }

    const audioTracks = this.currentStream.getAudioTracks()
    const hasAudio = audioTracks.length > 0

    // Stop current video tracks
    this.currentStream.getVideoTracks().forEach(track => track.stop())

    try {
      const newConstraints: MediaConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
        audio: hasAudio
      }

      const newStream = await this.getUserMedia(newConstraints)
      
      if (this.videoElement) {
        this.videoElement.srcObject = newStream
      }

      return newStream
    } catch (error) {
      console.error('Error switching camera:', error)
      throw error
    }
  }

  toggleAudio(enabled: boolean) {
    if (!this.currentStream) return

    this.currentStream.getAudioTracks().forEach(track => {
      track.enabled = enabled
    })
  }

  toggleVideo(enabled: boolean) {
    if (!this.currentStream) return

    this.currentStream.getVideoTracks().forEach(track => {
      track.enabled = enabled
    })
  }

  async applyVideoEffects(effects: {
    brightness?: number
    contrast?: number
    saturation?: number
  }) {
    if (!this.videoElement) return

    const filters = []
    if (effects.brightness !== undefined) {
      filters.push(`brightness(${effects.brightness}%)`)
    }
    if (effects.contrast !== undefined) {
      filters.push(`contrast(${effects.contrast}%)`)
    }
    if (effects.saturation !== undefined) {
      filters.push(`saturate(${effects.saturation}%)`)
    }

    this.videoElement.style.filter = filters.join(' ')
  }

  getStreamStats(): MediaStats | null {
    if (!this.currentStream) return null

    const videoTrack = this.currentStream.getVideoTracks()[0]
    if (!videoTrack) return null

    const settings = videoTrack.getSettings()
    
    return {
      videoBitrate: 0, // This would need WebRTC stats API for real bitrate
      audioBitrate: 0,
      videoResolution: {
        width: settings.width || 0,
        height: settings.height || 0
      },
      frameRate: settings.frameRate || 0
    }
  }

  startStatsMonitoring(interval: number = 1000) {
    if (!this.onStatsUpdate) return

    const updateStats = () => {
      const stats = this.getStreamStats()
      if (stats && this.onStatsUpdate) {
        this.onStatsUpdate(stats)
      }
    }

    setInterval(updateStats, interval)
  }

  onStatsUpdateListener(callback: (stats: MediaStats) => void) {
    this.onStatsUpdate = callback
  }

  getCurrentStream(): MediaStream | undefined {
    return this.currentStream
  }

  stopAllTracks() {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop())
    }
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close()
    }
  }

  // Utility method to check browser capabilities
  static checkBrowserSupport(): {
    getUserMedia: boolean
    webRTC: boolean
    screenShare: boolean
  } {
    return {
      getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      webRTC: !!(window.RTCPeerConnection),
      screenShare: !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia)
    }
  }
}