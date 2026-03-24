import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export function useAgent(token) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [agentStatus, setAgentStatus] = useState('');
  const [connectionError, setConnectionError] = useState('');

  useEffect(() => {
    // Don't connect if there is no token
    if (!token) return;

    // Pass the token in the auth payload
    const newSocket = io(SOCKET_URL, {
      auth: { token }
    });
    setSocket(newSocket);

    // Listeners
    newSocket.on('connect_error', (err) => {
      setConnectionError(err.message);
      newSocket.close();
    });

    newSocket.on('agent_status', (data) => setAgentStatus(data.message));

    newSocket.on('final_chart_ready', (data) => {
      setIsThinking(false);
      setAgentStatus('');
      setMessages((prev) => [...prev, { role: 'agent', type: 'chart', content: data }]);
    });

    newSocket.on('agent_error', (data) => {
      setIsThinking(false);
      setAgentStatus('');
      setMessages((prev) => [...prev, { role: 'agent', type: 'error', content: data.message }]);
    });

    return () => newSocket.close();
  }, [token]);

  const sendPrompt = useCallback((prompt) => {
    if (!socket || !prompt.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', type: 'text', content: prompt }]);
    setIsThinking(true);
    setAgentStatus('Connecting to AI agent...');
    socket.emit('ask_query', { prompt });
  }, [socket]);

  // NEW: Clear chat function
  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, isThinking, agentStatus, sendPrompt, clearChat, connectionError };
}