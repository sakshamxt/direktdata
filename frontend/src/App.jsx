import { useState, useEffect } from 'react';
import { useAgent } from './hooks/useAgent';
import DynamicChart from './DynamicChart';
import { Send, Bot, User, Loader2, BarChart3, Trash2, Lock, LogOut } from 'lucide-react';

function App() {
  // Auth State
  const [passcode, setPasscode] = useState('');
  const [token, setToken] = useState(localStorage.getItem('direktdata_token') || null);
  
  const [inputValue, setInputValue] = useState('');
  
  // Pass the token to our hook
  const { messages, isThinking, agentStatus, sendPrompt, clearChat, connectionError } = useAgent(token);

  // Handle local storage for persistence across refreshes
  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode.trim()) {
      localStorage.setItem('direktdata_token', passcode);
      setToken(passcode);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('direktdata_token');
    setToken(null);
    setPasscode('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isThinking) return;
    sendPrompt(inputValue);
    setInputValue('');
  };

  // --- LOGIN SCREEN ---
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">DirektData Access</h1>
          <p className="text-slate-500 mb-8">Please enter the company passcode to access the AI analyst.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter Passcode..."
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              type="submit"
              className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Unlock Agent
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- MAIN CHAT INTERFACE ---
  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center">
          <BarChart3 className="text-blue-600 mr-2" size={28} />
          <h1 className="text-xl font-bold text-slate-800">DirektData</h1>
          <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full hidden sm:inline-block">
            Secure Session
          </span>
        </div>
        
        {/* NEW: Action Buttons */}
        <div className="flex items-center gap-3">
          {messages.length > 0 && (
            <button 
              onClick={clearChat}
              className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
              title="Clear Chat"
            >
              <Trash2 size={18} />
              <span className="hidden sm:inline-block">Clear</span>
            </button>
          )}
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            title="Lock App"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Show Connection Errors if Passcode is wrong */}
        {connectionError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center">
            <p className="font-semibold mb-2">Connection Error</p>
            <p className="text-sm">{connectionError}. Please log out and try again.</p>
          </div>
        )}

        {messages.length === 0 && !connectionError && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <Bot size={64} className="mb-4 text-slate-300" />
            <p className="text-lg">Ask a question about your business data...</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3xl flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row w-full'}`}>
              <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center ${
                msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-emerald-500 text-white'
              }`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>

              <div className={`p-4 rounded-2xl shadow-sm w-full ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none max-w-lg' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
              }`}>
                {msg.type === 'text' && <p>{msg.content}</p>}
                {msg.type === 'error' && <p className="text-red-500 font-medium">⚠️ {msg.content}</p>}
                
                {msg.type === 'chart' && (
                  <div className="space-y-4 w-full">
                    <p className="font-medium text-slate-700">{msg.content.summary}</p>
                    <DynamicChart config={msg.content} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start">
            <div className="max-w-3xl flex gap-4 flex-row">
              <div className="w-10 h-10 flex-shrink-0 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Loader2 size={20} className="animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-600 rounded-tl-none shadow-sm flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="font-mono text-sm">{agentStatus}</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t border-slate-200 p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isThinking || connectionError !== ''}
            placeholder="Ask DirektData a question..."
            className="w-full pl-6 pr-14 py-4 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm disabled:bg-slate-50 transition-all"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isThinking || connectionError !== ''}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:bg-slate-300 transition-colors"
          >
            <Send size={18} className="ml-1" />
          </button>
        </form>
      </footer>
    </div>
  );
}

export default App;