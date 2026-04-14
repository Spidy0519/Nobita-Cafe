/**
 * Nobita Café — WebSocket Hook
 */
import { useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws'

export function useSocket(channel, onMessage) {
  const wsRef = useRef(null)

  const connect = useCallback(() => {
    const token = localStorage.getItem('access_token')
    const url = `${WS_URL}/orders/${channel}/?token=${token}`
    
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      console.log(`[WS] Connected to ${channel}`)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage?.(data)
      } catch (e) {
        console.error('[WS] Parse error:', e)
      }
    }

    ws.onclose = (event) => {
      console.log(`[WS] Disconnected from ${channel}`, event.code)
      // Auto-reconnect after 3 seconds
      if (event.code !== 1000) {
        setTimeout(connect, 3000)
      }
    }

    ws.onerror = (error) => {
      console.error('[WS] Error:', error)
    }

    return ws
  }, [channel, onMessage])

  useEffect(() => {
    const ws = connect()
    
    // Ping every 30 seconds to keep alive
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000)

    return () => {
      clearInterval(pingInterval)
      if (wsRef.current) {
        wsRef.current.close(1000)
      }
    }
  }, [connect])

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  return { send }
}

export default useSocket
