import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, IconButton, Chip, LinearProgress, Button } from '@mui/material';
import {
  SmartToy,
  Wifi,
  WifiOff,
  Settings,
  Refresh,
  VolumeUp,
  Mic,
  ArrowBack,
  PlayArrow,
  Stop,
} from '@mui/icons-material';

const ipcRenderer = window.require('electron').ipcRenderer;

interface AIPageProps {
  onBack: () => void;
}

interface AIStatus {
  online: boolean;
  talking: boolean;
  wifiSignal: number;
  uptime: number;
  lastMessage: string;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

const AIPage: React.FC<AIPageProps> = ({ onBack }) => {
  const [aiStatus, setAiStatus] = useState<AIStatus>({
    online: false,
    talking: false,
    wifiSignal: 0,
    uptime: 0,
    lastMessage: '',
  });

  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [simulatorRunning, setSimulatorRunning] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // 连接到 WebSocket 服务器
  useEffect(() => {
    const connectWebSocket = () => {
      console.log('[AIPage] 连接到 WebSocket...');
      const ws = new WebSocket('ws://localhost:8765');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[AIPage] WebSocket 已连接');
        // 发送握手消息
        ws.send(JSON.stringify({
          type: 'handshake',
          clientType: 'control_panel'
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[AIPage] 收到消息:', data.type);

          if (data.type === 'ai_status') {
            setAiStatus({
              online: data.data.online,
              talking: data.data.talking,
              wifiSignal: data.data.wifiSignal,
              uptime: data.data.uptime,
              lastMessage: data.data.lastMessage || ''
            });
          } else if (data.type === 'ai_conversation') {
            const message: ConversationMessage = {
              role: data.data.role,
              text: data.data.text,
              timestamp: data.data.timestamp || Date.now()
            };
            setConversationHistory(prev => [...prev, message]);

            // 更新最后一条消息
            if (data.data.role === 'assistant') {
              setAiStatus(prev => ({
                ...prev,
                lastMessage: data.data.text
              }));
            }
          }
        } catch (error) {
          console.error('[AIPage] 解析消息失败:', error);
        }
      };

      ws.onclose = () => {
        console.log('[AIPage] WebSocket 已断开');
        // 5 秒后重连
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = (error) => {
        console.error('[AIPage] WebSocket 错误:', error);
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // 启动 AI 模拟器
  const handleStartSimulator = async () => {
    try {
      const result = await ipcRenderer.invoke('ai-simulator-start');
      if (result.success) {
        setSimulatorRunning(true);
        console.log('[AIPage] AI 模拟器已启动');
      } else {
        console.error('[AIPage] 启动模拟器失败:', result.error);
      }
    } catch (error) {
      console.error('[AIPage] 启动模拟器异常:', error);
    }
  };

  // 停止 AI 模拟器
  const handleStopSimulator = async () => {
    try {
      const result = await ipcRenderer.invoke('ai-simulator-stop');
      if (result.success) {
        setSimulatorRunning(false);
        console.log('[AIPage] AI 模拟器已停止');
      } else {
        console.error('[AIPage] 停止模拟器失败:', result.error);
      }
    } catch (error) {
      console.error('[AIPage] 停止模拟器异常:', error);
    }
  };

  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getWifiSignalStrength = (signal: number): string => {
    if (signal > -50) return '优秀';
    if (signal > -60) return '良好';
    if (signal > -70) return '一般';
    return '较弱';
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 2,
        gap: 2,
      }}
    >
      {/* 返回按钮 */}
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <IconButton
          onClick={onBack}
          sx={{
            color: '#fff',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            },
          }}
        >
          <ArrowBack />
        </IconButton>

        <Typography
          variant="body1"
          sx={{
            color: '#fff',
            fontWeight: 600,
          }}
        >
          AI 小智
        </Typography>

        <IconButton
          sx={{
            color: '#fff',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            },
          }}
        >
          <Settings />
        </IconButton>
      </Box>

      {/* AI 状态卡片 */}
      <Box
        sx={{
          width: '90%',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 3,
          padding: 2,
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* 在线状态 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SmartToy sx={{ color: aiStatus.online ? '#4caf50' : '#f44336', fontSize: 32 }} />
            <Box>
              <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                {aiStatus.online ? '在线' : '离线'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                运行时间: {formatUptime(aiStatus.uptime)}
              </Typography>
            </Box>
          </Box>

          <Chip
            icon={aiStatus.online ? <Wifi /> : <WifiOff />}
            label={aiStatus.online ? getWifiSignalStrength(aiStatus.wifiSignal) : '未连接'}
            size="small"
            sx={{
              backgroundColor: aiStatus.online
                ? 'rgba(76, 175, 80, 0.2)'
                : 'rgba(244, 67, 54, 0.2)',
              color: aiStatus.online ? '#4caf50' : '#f44336',
            }}
          />
        </Box>

        {/* 对话状态 */}
        {aiStatus.talking && (
          <Box sx={{ marginBottom: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1 }}>
              <Mic sx={{ color: '#2196f3', fontSize: 20 }} />
              <Typography variant="caption" sx={{ color: '#2196f3' }}>
                正在对话中...
              </Typography>
            </Box>
            <LinearProgress
              sx={{
                backgroundColor: 'rgba(33, 150, 243, 0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#2196f3',
                },
              }}
            />
          </Box>
        )}

        {/* 最后一条消息 */}
        {aiStatus.lastMessage && (
          <Box
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 2,
              padding: 1.5,
              marginTop: 2,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: 0.5,
                display: 'block',
              }}
            >
              最后对话
            </Typography>
            <Typography variant="body2" sx={{ color: '#fff' }}>
              {aiStatus.lastMessage}
            </Typography>
          </Box>
        )}
      </Box>

      {/* 功能提示 */}
      <Box
        sx={{
          width: '90%',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          borderRadius: 2,
          padding: 1.5,
          border: '1px solid rgba(33, 150, 243, 0.3)',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: '#2196f3',
            display: 'block',
            marginBottom: 0.5,
            fontWeight: 600,
          }}
        >
          💡 使用提示
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          说出"你好小智"唤醒 AI 助手，然后就可以开始对话了
        </Typography>
      </Box>

      {/* AI 模拟器控制 */}
      <Box
        sx={{
          width: '90%',
          backgroundColor: 'rgba(156, 39, 176, 0.1)',
          borderRadius: 2,
          padding: 1.5,
          border: '1px solid rgba(156, 39, 176, 0.3)',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: '#9c27b0',
            display: 'block',
            marginBottom: 1,
            fontWeight: 600,
          }}
        >
          🔧 开发工具
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={simulatorRunning ? <Stop /> : <PlayArrow />}
          onClick={simulatorRunning ? handleStopSimulator : handleStartSimulator}
          sx={{
            backgroundColor: simulatorRunning ? '#f44336' : '#9c27b0',
            '&:hover': {
              backgroundColor: simulatorRunning ? '#d32f2f' : '#7b1fa2',
            },
          }}
        >
          {simulatorRunning ? '停止模拟器' : '启动模拟器'}
        </Button>
        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block', marginTop: 1 }}>
          {simulatorRunning ? '模拟器正在运行，会自动生成测试数据' : '启动模拟器进行开发测试'}
        </Typography>
      </Box>

      {/* 快捷操作 */}
      <Box
        sx={{
          width: '90%',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1,
        }}
      >
        <Box
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            padding: 1.5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
            },
          }}
        >
          <VolumeUp sx={{ color: '#fff', fontSize: 24 }} />
          <Typography variant="caption" sx={{ color: '#fff' }}>
            音量
          </Typography>
        </Box>

        <Box
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            padding: 1.5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
            },
          }}
        >
          <Refresh sx={{ color: '#fff', fontSize: 24 }} />
          <Typography variant="caption" sx={{ color: '#fff' }}>
            重启
          </Typography>
        </Box>

        <Box
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            padding: 1.5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
            },
          }}
        >
          <Settings sx={{ color: '#fff', fontSize: 24 }} />
          <Typography variant="caption" sx={{ color: '#fff' }}>
            配置
          </Typography>
        </Box>
      </Box>

      {/* 硬件状态 */}
      <Box
        sx={{
          width: '90%',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 2,
          padding: 1.5,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255, 255, 255, 0.6)',
            display: 'block',
            marginBottom: 1,
          }}
        >
          硬件信息
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              芯片
            </Typography>
            <Typography variant="caption" sx={{ color: '#fff' }}>
              ESP32-S3R8
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Flash
            </Typography>
            <Typography variant="caption" sx={{ color: '#fff' }}>
              16MB
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              PSRAM
            </Typography>
            <Typography variant="caption" sx={{ color: '#fff' }}>
              8MB
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              固件版本
            </Typography>
            <Typography variant="caption" sx={{ color: '#fff' }}>
              v2.2.3
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AIPage;
