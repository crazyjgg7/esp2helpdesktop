import WebSocket from 'ws'

/**
 * AI 模拟器 - 模拟 ESP32 AI 模块的行为
 * 用于在没有真实硬件时进行开发和测试
 */
export class AISimulator {
  private ws: WebSocket | null = null
  private connected = false
  private deviceId = 'ai-simulator-001'
  private uptime = 0
  private wifiSignal = -45
  private online = false
  private talking = false
  private heartbeatInterval: NodeJS.Timeout | null = null
  private conversationInterval: NodeJS.Timeout | null = null

  constructor(private serverUrl: string = 'ws://localhost:8765') {}

  /**
   * 连接到 WebSocket 服务器
   */
  connect() {
    console.log('[AI Simulator] 连接到服务器:', this.serverUrl)
    this.ws = new WebSocket(this.serverUrl)

    this.ws.on('open', () => {
      console.log('[AI Simulator] 已连接到服务器')
      this.connected = true
      this.online = true

      // 发送握手消息
      this.sendMessage({
        type: 'handshake',
        clientType: 'esp32_device',
        deviceId: this.deviceId
      })

      // 启动心跳
      this.startHeartbeat()

      // 模拟随机对话
      this.startRandomConversations()
    })

    this.ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString())
        this.handleMessage(message)
      } catch (error) {
        console.error('[AI Simulator] 解析消息失败:', error)
      }
    })

    this.ws.on('close', () => {
      console.log('[AI Simulator] 连接已关闭')
      this.connected = false
      this.online = false
      this.stopHeartbeat()
      this.stopRandomConversations()
    })

    this.ws.on('error', (error) => {
      console.error('[AI Simulator] WebSocket 错误:', error)
    })
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.stopHeartbeat()
    this.stopRandomConversations()
  }

  /**
   * 发送消息到服务器
   */
  private sendMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    }
  }

  /**
   * 处理来自服务器的消息
   */
  private handleMessage(message: any) {
    console.log('[AI Simulator] 收到消息:', message.type)

    switch (message.type) {
      case 'handshake_ack':
        console.log('[AI Simulator] 握手成功:', message.data)
        // 发送初始 AI 状态
        this.sendAIStatus()
        break

      case 'ai_config':
        console.log('[AI Simulator] 收到配置:', message.data)
        // 模拟配置更新
        this.handleConfigUpdate(message.data)
        break

      default:
        break
    }
  }

  /**
   * 启动心跳
   */
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.uptime += 5
      this.wifiSignal = -45 + Math.random() * 10 - 5 // -50 到 -40

      this.sendMessage({
        type: 'heartbeat',
        data: {
          deviceId: this.deviceId,
          uptime: this.uptime,
          wifiSignal: Math.round(this.wifiSignal)
        }
      })

      // 同时发送 AI 状态更新
      this.sendAIStatus()
    }, 5000)
  }

  /**
   * 停止心跳
   */
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  /**
   * 发送 AI 状态
   */
  private sendAIStatus() {
    this.sendMessage({
      type: 'ai_status',
      data: {
        online: this.online,
        talking: this.talking,
        wifiSignal: Math.round(this.wifiSignal),
        uptime: this.uptime,
        lastMessage: this.talking ? '正在对话中...' : ''
      }
    })
  }

  /**
   * 启动随机对话模拟
   */
  private startRandomConversations() {
    this.conversationInterval = setInterval(() => {
      // 30% 概率触发对话
      if (Math.random() < 0.3) {
        this.simulateConversation()
      }
    }, 15000) // 每 15 秒检查一次
  }

  /**
   * 停止随机对话
   */
  private stopRandomConversations() {
    if (this.conversationInterval) {
      clearInterval(this.conversationInterval)
      this.conversationInterval = null
    }
  }

  /**
   * 模拟一次对话
   */
  private async simulateConversation() {
    const conversations = [
      { user: '今天天气怎么样？', assistant: '今天天气晴朗，温度适宜，是个出门的好日子。' },
      { user: '现在几点了？', assistant: '现在是下午3点25分。' },
      { user: '帮我设置一个闹钟', assistant: '好的，我已经为您设置了明天早上7点的闹钟。' },
      { user: '播放音乐', assistant: '正在为您播放轻音乐。' },
      { user: '关闭客厅的灯', assistant: '好的，客厅的灯已关闭。' }
    ]

    const conversation = conversations[Math.floor(Math.random() * conversations.length)]

    // 开始对话
    this.talking = true
    this.sendAIStatus()

    // 用户说话
    await this.sleep(500)
    this.sendMessage({
      type: 'ai_conversation',
      data: {
        role: 'user',
        text: conversation.user
      }
    })

    // AI 思考
    await this.sleep(1000)

    // AI 回复
    this.sendMessage({
      type: 'ai_conversation',
      data: {
        role: 'assistant',
        text: conversation.assistant
      }
    })

    // 结束对话
    await this.sleep(500)
    this.talking = false
    this.sendAIStatus()
  }

  /**
   * 处理配置更新
   */
  private handleConfigUpdate(config: any) {
    console.log('[AI Simulator] 应用配置:', config)
    // 模拟配置应用成功
    setTimeout(() => {
      this.sendMessage({
        type: 'ai_config_result',
        data: {
          success: true,
          message: '配置已更新'
        }
      })
    }, 1000)
  }

  /**
   * 手动触发对话（用于测试）
   */
  public triggerConversation(userText: string, assistantText: string) {
    this.talking = true
    this.sendAIStatus()

    setTimeout(() => {
      this.sendMessage({
        type: 'ai_conversation',
        data: {
          role: 'user',
          text: userText
        }
      })

      setTimeout(() => {
        this.sendMessage({
          type: 'ai_conversation',
          data: {
            role: 'assistant',
            text: assistantText
          }
        })

        setTimeout(() => {
          this.talking = false
          this.sendAIStatus()
        }, 500)
      }, 1000)
    }, 500)
  }

  /**
   * 设置在线状态
   */
  public setOnline(online: boolean) {
    this.online = online
    this.sendAIStatus()
  }

  /**
   * 辅助函数：延迟
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
