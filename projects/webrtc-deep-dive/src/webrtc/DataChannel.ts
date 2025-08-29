export interface DataChannelConfig {
  ordered?: boolean
  maxRetransmits?: number
  maxPacketLifeTime?: number
  protocol?: string
}

export interface DataChannelMessage {
  id: string
  timestamp: number
  data: string
  type: 'text' | 'file' | 'json'
  size: number
}

export interface FileTransfer {
  id: string
  name: string
  size: number
  type: string
  chunks: ArrayBuffer[]
  totalChunks: number
  receivedChunks: number
  progress: number
  status: 'pending' | 'transferring' | 'completed' | 'failed'
}

export class DataChannelManager {
  private dataChannel?: RTCDataChannel
  private messageHistory: DataChannelMessage[] = []
  private fileTransfers: Map<string, FileTransfer> = new Map()
  private onMessage?: (message: DataChannelMessage) => void
  private onFileProgress?: (transfer: FileTransfer) => void
  private maxMessageSize = 65536 // 64KB chunks for file transfer

  constructor(peerConnection: RTCPeerConnection, label: string, config?: DataChannelConfig) {
    this.createDataChannel(peerConnection, label, config)
  }

  private createDataChannel(peerConnection: RTCPeerConnection, label: string, config?: DataChannelConfig) {
    const channelConfig: RTCDataChannelInit = {
      ordered: config?.ordered ?? true,
      maxRetransmits: config?.maxRetransmits,
      maxPacketLifeTime: config?.maxPacketLifeTime,
      protocol: config?.protocol ?? ''
    }

    this.dataChannel = peerConnection.createDataChannel(label, channelConfig)
    this.setupEventListeners()
  }

  private setupEventListeners() {
    if (!this.dataChannel) return

    this.dataChannel.addEventListener('open', () => {
      console.log('Data channel opened')
    })

    this.dataChannel.addEventListener('close', () => {
      console.log('Data channel closed')
    })

    this.dataChannel.addEventListener('error', (error) => {
      console.error('Data channel error:', error)
    })

    this.dataChannel.addEventListener('message', (event) => {
      this.handleMessage(event.data)
    })
  }

  private handleMessage(data: string | ArrayBuffer) {
    try {
      if (typeof data === 'string') {
        const parsedMessage = JSON.parse(data)
        
        if (parsedMessage.type === 'file-chunk') {
          this.handleFileChunk(parsedMessage)
        } else if (parsedMessage.type === 'file-info') {
          this.handleFileInfo(parsedMessage)
        } else {
          const message: DataChannelMessage = {
            id: this.generateId(),
            timestamp: Date.now(),
            data: parsedMessage.data || data,
            type: parsedMessage.type || 'text',
            size: new Blob([data]).size
          }
          
          this.messageHistory.push(message)
          if (this.onMessage) {
            this.onMessage(message)
          }
        }
      } else {
        // Handle binary data (for future file transfer implementation)
        const message: DataChannelMessage = {
          id: this.generateId(),
          timestamp: Date.now(),
          data: 'Binary data received',
          type: 'file',
          size: data.byteLength
        }
        
        this.messageHistory.push(message)
        if (this.onMessage) {
          this.onMessage(message)
        }
      }
    } catch (error) {
      console.error('Error handling message:', error)
    }
  }

  private handleFileInfo(info: any) {
    const transfer: FileTransfer = {
      id: info.id,
      name: info.name,
      size: info.size,
      type: info.type,
      chunks: [],
      totalChunks: info.totalChunks,
      receivedChunks: 0,
      progress: 0,
      status: 'pending'
    }
    
    this.fileTransfers.set(info.id, transfer)
    transfer.status = 'transferring'
  }

  private handleFileChunk(chunk: any) {
    const transfer = this.fileTransfers.get(chunk.fileId)
    if (!transfer) return

    transfer.chunks[chunk.index] = this.base64ToArrayBuffer(chunk.data)
    transfer.receivedChunks++
    transfer.progress = (transfer.receivedChunks / transfer.totalChunks) * 100

    if (this.onFileProgress) {
      this.onFileProgress(transfer)
    }

    if (transfer.receivedChunks === transfer.totalChunks) {
      transfer.status = 'completed'
      this.reconstructFile(transfer)
    }
  }

  private reconstructFile(transfer: FileTransfer) {
    const blob = new Blob(transfer.chunks, { type: transfer.type })
    
    // Create download link
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = transfer.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    const message: DataChannelMessage = {
      id: this.generateId(),
      timestamp: Date.now(),
      data: `File received: ${transfer.name} (${this.formatFileSize(transfer.size)})`,
      type: 'file',
      size: transfer.size
    }
    
    this.messageHistory.push(message)
    if (this.onMessage) {
      this.onMessage(message)
    }
  }

  sendTextMessage(text: string) {
    if (!this.isChannelReady()) return false

    try {
      const message = {
        type: 'text',
        data: text,
        timestamp: Date.now()
      }

      this.dataChannel!.send(JSON.stringify(message))
      
      const historyMessage: DataChannelMessage = {
        id: this.generateId(),
        timestamp: Date.now(),
        data: text,
        type: 'text',
        size: new Blob([text]).size
      }
      
      this.messageHistory.push(historyMessage)
      return true
    } catch (error) {
      console.error('Error sending message:', error)
      return false
    }
  }

  sendJsonMessage(data: any) {
    if (!this.isChannelReady()) return false

    try {
      const message = {
        type: 'json',
        data: data,
        timestamp: Date.now()
      }

      this.dataChannel!.send(JSON.stringify(message))
      
      const historyMessage: DataChannelMessage = {
        id: this.generateId(),
        timestamp: Date.now(),
        data: JSON.stringify(data),
        type: 'json',
        size: new Blob([JSON.stringify(data)]).size
      }
      
      this.messageHistory.push(historyMessage)
      return true
    } catch (error) {
      console.error('Error sending JSON message:', error)
      return false
    }
  }

  async sendFile(file: File): Promise<string> {
    if (!this.isChannelReady()) {
      throw new Error('Data channel is not ready')
    }

    const fileId = this.generateId()
    const chunkSize = this.maxMessageSize - 1000 // Leave room for metadata
    const chunks = Math.ceil(file.size / chunkSize)

    // Send file info first
    const fileInfo = {
      type: 'file-info',
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      totalChunks: chunks
    }

    this.dataChannel!.send(JSON.stringify(fileInfo))

    // Send file chunks
    for (let i = 0; i < chunks; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const chunk = file.slice(start, end)
      
      const arrayBuffer = await chunk.arrayBuffer()
      const base64Data = this.arrayBufferToBase64(arrayBuffer)
      
      const chunkMessage = {
        type: 'file-chunk',
        fileId: fileId,
        index: i,
        data: base64Data
      }

      this.dataChannel!.send(JSON.stringify(chunkMessage))
      
      // Add small delay to prevent overwhelming the channel
      if (i < chunks - 1) {
        await new Promise(resolve => setTimeout(resolve, 10))
      }
    }

    return fileId
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    bytes.forEach(byte => binary += String.fromCharCode(byte))
    return btoa(binary)
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  private isChannelReady(): boolean {
    return this.dataChannel?.readyState === 'open'
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  getMessageHistory(): DataChannelMessage[] {
    return [...this.messageHistory]
  }

  getFileTransfers(): FileTransfer[] {
    return Array.from(this.fileTransfers.values())
  }

  getChannelState(): RTCDataChannelState | null {
    return this.dataChannel?.readyState || null
  }

  onMessageListener(callback: (message: DataChannelMessage) => void) {
    this.onMessage = callback
  }

  onFileProgressListener(callback: (transfer: FileTransfer) => void) {
    this.onFileProgress = callback
  }

  clearHistory() {
    this.messageHistory = []
  }

  close() {
    if (this.dataChannel) {
      this.dataChannel.close()
    }
  }

  // Static method to test data channel performance
  static async performanceTest(dataChannel: RTCDataChannel, testSizeKB: number = 100): Promise<{
    throughputMbps: number,
    latencyMs: number,
    packetsLost: number
  }> {
    if (dataChannel.readyState !== 'open') {
      throw new Error('Data channel is not open')
    }

    const testData = 'x'.repeat(testSizeKB * 1024)
    const startTime = performance.now()
    
    dataChannel.send(testData)
    
    const endTime = performance.now()
    const throughput = (testSizeKB * 8) / ((endTime - startTime) / 1000) / 1024 // Mbps
    const latency = endTime - startTime
    
    return {
      throughputMbps: throughput,
      latencyMs: latency,
      packetsLost: 0 // Would need more sophisticated testing for packet loss
    }
  }
}