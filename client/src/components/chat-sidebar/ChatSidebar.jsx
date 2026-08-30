import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Bookmark, CheckCircle2, RefreshCw } from 'lucide-react';
import { askTutor } from '../../lib/api';
import MarkdownRenderer from './MarkdownRenderer';
import SourceCard from './SourceCard';

export default function ChatSidebar({ onCitationClick, activePaperId, initialMessage }) {
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'assistant',
      content: 'Hello! I am your AI Research Tutor. Ask me anything about paper architecture, equations, dataset specs, or results!',
      citations: []
    }
  ]);
  const [input, setInput] = useState('');
  const [strictMode, setStrictMode] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (initialMessage) {
      setInput(initialMessage);
    }
  }, [initialMessage]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now().toString(), sender: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    const currentQuery = input;
    setInput('');
    setLoading(true);

    try {
      const data = await askTutor(currentQuery, activePaperId, strictMode ? 'strict' : 'general');
      if (data.success) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          content: data.content,
          citations: data.citations || []
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          content: "Sorry, I couldn't generate an answer right now. Please check your network or API keys, and try again.",
          citations: []
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content: "Sorry, I couldn't generate an answer right now. Please check your network and try again.",
        citations: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-zinc-900 border-l border-zinc-800 flex flex-col glass-panel">
      {/* Tutor Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-600/20 text-violet-400 flex items-center justify-center border border-violet-500/30">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-zinc-100">AI Research Tutor</h3>
            <p className="text-[10px] text-zinc-400">Context-Aware RAG Engine</p>
          </div>
        </div>
        <button 
          onClick={() => setStrictMode(!strictMode)} 
          className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all flex items-center gap-1 cursor-pointer ${
            strictMode ? 'bg-violet-600/20 text-violet-300 border-violet-500/40' : 'bg-zinc-800 text-zinc-400 border-zinc-700'
          }`}
        >
          <CheckCircle2 className="w-3 h-3 text-violet-400" />
          <span>{strictMode ? 'Strict PDF Mode' : 'General Mode'}</span>
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'assistant' && (
              <div className="w-6 h-6 rounded-lg bg-violet-600/30 text-violet-300 flex items-center justify-center shrink-0 border border-violet-500/30 mt-1">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div className={`max-w-[85%] space-y-3 ${
              msg.sender === 'user' 
                ? 'bg-violet-600 text-white rounded-2xl rounded-tr-none p-3 shadow-md' 
                : 'bg-zinc-950/80 text-zinc-200 border border-zinc-800/80 rounded-2xl rounded-tl-none p-3'
            }`}>
              {/* Message Content */}
              {msg.sender === 'user' ? (
                <div className="whitespace-pre-line leading-relaxed">{msg.content}</div>
              ) : (
                <MarkdownRenderer content={msg.content} />
              )}

              {/* Citations Section */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="pt-3 border-t border-zinc-800/60 space-y-2 mt-2">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 font-heading">
                    Sources
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {msg.citations.map((cit, cIdx) => (
                      <SourceCard 
                        key={cIdx} 
                        citation={cit} 
                        onCitationClick={onCitationClick} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-2.5 justify-start animate-pulse">
            <div className="w-6 h-6 rounded-lg bg-violet-600/30 text-violet-300 flex items-center justify-center shrink-0 border border-violet-500/30 mt-1">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="max-w-[85%] bg-zinc-950/80 text-zinc-400 border border-zinc-800/80 rounded-2xl rounded-tl-none p-3 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-[10px] text-violet-400 font-medium">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Thinking...</span>
              </div>
              <div className="flex items-center gap-1 pl-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500/80 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500/80 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500/80 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-zinc-800 shrink-0">
        <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl p-2 focus-within:border-violet-500/60 transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI Tutor about equations or concepts..."
            className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none px-2"
          />
          <button 
            onClick={handleSend}
            className="p-2 rounded-lg bg-violet-600 text-white hover:bg-violet-500 transition-colors shadow-md shadow-violet-900/40 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
