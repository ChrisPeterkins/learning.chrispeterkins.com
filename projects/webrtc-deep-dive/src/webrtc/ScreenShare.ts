export interface ScreenShareOptions {
  video?: boolean | MediaTrackConstraints
  audio?: boolean | MediaTrackConstraints
  preferCurrentTab?: boolean
  selfBrowserSurface?: 'include' | 'exclude'
  systemAudio?: 'include' | 'exclude'
}

export interface DisplaySurface {
  displaySurface: 'application' | 'browser' | 'monitor' | 'window'
  logicalSurface: boolean
  cursor: 'always' | 'motion' | 'never'
}

export class ScreenShareManager {
  private currentStream?: MediaStream
  private videoElement?: HTMLVideoElement
  private onStreamUpdate?: (stream: MediaStream | null) => void
  private onError?: (error: Error) => void

  async startScreenShare(options: ScreenShareOptions = {}): Promise<MediaStream> {
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error('Screen sharing is not supported in this browser')
      }

      const constraints: DisplayMediaStreamConstraints = {
        video: {
          mediaSource: 'screen',
          ...options.video as MediaTrackConstraints
        },
        audio: options.audio || false
      }

      // Add browser-specific options
      if (options.preferCurrentTab) {
        (constraints as any).preferCurrentTab = true
      }
      if (options.selfBrowserSurface) {
        (constraints as any).selfBrowserSurface = options.selfBrowserSurface
      }
      if (options.systemAudio) {
        (constraints as any).systemAudio = options.systemAudio
      }

      this.currentStream = await navigator.mediaDevices.getDisplayMedia(constraints)
      this.setupStreamListeners()
      
      if (this.onStreamUpdate) {
        this.onStreamUpdate(this.currentStream)
      }

      return this.currentStream
    } catch (error) {
      const screenShareError = new Error(`Screen share failed: ${error}`)
      if (this.onError) {
        this.onError(screenShareError)
      }
      throw screenShareError
    }
  }

  private setupStreamListeners() {
    if (!this.currentStream) return

    // Listen for track ending (user stops sharing)
    this.currentStream.getVideoTracks().forEach(track => {
      track.addEventListener('ended', () => {
        this.stopScreenShare()
      })
    })

    this.currentStream.getAudioTracks().forEach(track => {
      track.addEventListener('ended', () => {
        console.log('Audio track ended')
      })
    })
  }

  stopScreenShare() {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop())
      this.currentStream = undefined
      
      if (this.onStreamUpdate) {
        this.onStreamUpdate(null)
      }
    }
  }

  attachToVideoElement(videoElement: HTMLVideoElement) {
    this.videoElement = videoElement
    if (this.currentStream) {
      videoElement.srcObject = this.currentStream
    }
  }

  getDisplaySurface(): DisplaySurface | null {
    if (!this.currentStream) return null

    const videoTrack = this.currentStream.getVideoTracks()[0]
    if (!videoTrack) return null

    const settings = videoTrack.getSettings() as any
    
    return {
      displaySurface: settings.displaySurface || 'monitor',
      logicalSurface: settings.logicalSurface || false,
      cursor: settings.cursor || 'never'
    }
  }

  getScreenResolution(): { width: number; height: number } | null {
    if (!this.currentStream) return null

    const videoTrack = this.currentStream.getVideoTracks()[0]
    if (!videoTrack) return null

    const settings = videoTrack.getSettings()
    
    return {
      width: settings.width || 0,
      height: settings.height || 0
    }
  }

  async captureScreenshot(): Promise<string> {
    if (!this.currentStream || !this.videoElement) {
      throw new Error('No active screen share or video element')
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      throw new Error('Could not get canvas context')
    }

    canvas.width = this.videoElement.videoWidth
    canvas.height = this.videoElement.videoHeight
    
    ctx.drawImage(this.videoElement, 0, 0)
    
    return canvas.toDataURL('image/png')
  }

  async startRecording(): Promise<MediaRecorder> {
    if (!this.currentStream) {
      throw new Error('No active screen share stream')
    }

    const mediaRecorder = new MediaRecorder(this.currentStream, {
      mimeType: 'video/webm;codecs=vp9'
    })

    const recordedChunks: Blob[] = []

    mediaRecorder.addEventListener('dataavailable', (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data)
      }
    })

    mediaRecorder.addEventListener('stop', () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      
      // Auto-download the recording
      const a = document.createElement('a')
      a.href = url
      a.download = `screen-recording-${Date.now()}.webm`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    })

    mediaRecorder.start()
    return mediaRecorder
  }

  switchToCamera(): Promise<MediaStream> {
    return new Promise(async (resolve, reject) => {
      try {
        if (this.currentStream) {
          this.stopScreenShare()
        }

        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })

        this.currentStream = cameraStream
        
        if (this.videoElement) {
          this.videoElement.srcObject = cameraStream
        }

        if (this.onStreamUpdate) {
          this.onStreamUpdate(cameraStream)
        }

        resolve(cameraStream)
      } catch (error) {
        reject(new Error(`Failed to switch to camera: ${error}`))
      }
    })
  }

  isScreenSharing(): boolean {
    if (!this.currentStream) return false
    
    const videoTrack = this.currentStream.getVideoTracks()[0]
    if (!videoTrack) return false
    
    const settings = videoTrack.getSettings() as any
    return settings.displaySurface !== undefined
  }

  getCurrentStream(): MediaStream | undefined {
    return this.currentStream
  }

  onStreamUpdateListener(callback: (stream: MediaStream | null) => void) {
    this.onStreamUpdate = callback
  }

  onErrorListener(callback: (error: Error) => void) {
    this.onError = callback
  }

  // Static method to check browser support
  static checkBrowserSupport(): {
    getDisplayMedia: boolean
    mediaRecorder: boolean
    supportedMimeTypes: string[]
  } {
    const supportedMimeTypes = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4'
    ].filter(mimeType => MediaRecorder.isTypeSupported(mimeType))

    return {
      getDisplayMedia: !!(navigator.mediaDevices?.getDisplayMedia),
      mediaRecorder: !!(window.MediaRecorder),
      supportedMimeTypes
    }
  }

  // Utility method to create a picture-in-picture effect
  async enablePictureInPicture(): Promise<PictureInPictureWindow | null> {
    if (!this.videoElement || !document.pictureInPictureEnabled) {
      console.warn('Picture-in-picture not supported')
      return null
    }

    try {
      return await this.videoElement.requestPictureInPicture()
    } catch (error) {
      console.error('Failed to enter picture-in-picture mode:', error)
      return null
    }
  }

  async exitPictureInPicture(): Promise<void> {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture()
    }
  }

  // Demo method for testing screen share capabilities
  static async testScreenShareCapabilities(): Promise<{
    canShareScreen: boolean
    canShareAudio: boolean
    canRecord: boolean
    maxResolution: { width: number; height: number }
  }> {
    const capabilities = {
      canShareScreen: false,
      canShareAudio: false,
      canRecord: false,
      maxResolution: { width: 0, height: 0 }
    }

    try {
      if (navigator.mediaDevices?.getDisplayMedia) {
        capabilities.canShareScreen = true
        
        // Test with audio
        try {
          const testStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true
          })
          
          capabilities.canShareAudio = testStream.getAudioTracks().length > 0
          
          const videoTrack = testStream.getVideoTracks()[0]
          if (videoTrack) {
            const settings = videoTrack.getSettings()
            capabilities.maxResolution = {
              width: settings.width || 0,
              height: settings.height || 0
            }
          }
          
          testStream.getTracks().forEach(track => track.stop())
        } catch (error) {
          // Audio might not be available, but screen share still works
        }
      }

      capabilities.canRecord = !!(window.MediaRecorder && 
        MediaRecorder.isTypeSupported('video/webm;codecs=vp9'))

    } catch (error) {
      console.error('Error testing screen share capabilities:', error)
    }

    return capabilities
  }
}