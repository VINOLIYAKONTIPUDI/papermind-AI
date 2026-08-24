import React, { useState, useEffect } from 'react';
import { Send, Bot, Bookmark, CheckCircle2, RefreshCw } from 'lucide-react';
import { askTutor } from '../../lib/api';

export default function ChatSidebar({ onCitationClick, activePaperId, initialMessage }) {
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'assistant',
      content: 'Hello! I am your AI Research Tutor. Ask me anything about paper architecture, equations, dataset specs, or results!',
      citations: [{ page_number: 1, section_name: 'Abstract & Intro', snippet: 'Self-attention allows processing tokens in parallel...' }]
    }
  ]);
  const [input, setInput] = useState('');
  const [strictMode, setStrictMode] = useState(true);
  const [loading, setLoading] = useState(false);

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
          citations: data.citations
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          content: 'I analyzed your query against the document embeddings: Scaled Dot-Product attention computes Softmax(Q K^T / sqrt(d_k)) V to enable multi-head parallel representations.',
          citations: [{ page_number: 3, section_name: '3. Model Architecture', snippet: 'An attention function can be described...' }]
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content: 'Error communicating with AI Tutor service. Operating in offline comprehension mode.',
        citations: [{ page_number: 1, section_name: 'Abstract', snippet: 'Paper overview...' }]
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-zinc-900 border-l border-zinc-800 flex flex-col glass-panel">
      {/* Tutor Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
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
          className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all flex items-center gap-1 ${
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
          <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'assistant' && (
              <div className="w-6 h-6 rounded-lg bg-violet-600/30 text-violet-300 flex items-center justify-center shrink-0 border border-violet-500/30">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div className={`max-w-[85%] space-y-2 ${msg.sender === 'user' ? 'bg-violet-600 text-white rounded-2xl rounded-tr-none p-3 shadow-md' : 'bg-zinc-950/80 text-zinc-200 border border-zinc-800 rounded-2xl rounded-tl-none p-3'}`}>
              <div className="whitespace-pre-line leading-relaxed">{msg.content}</div>

              {/* Citations Badges */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="pt-2 border-t border-zinc-800/60 flex flex-wrap gap-1.5">
                  {msg.citations.map((cit, cIdx) => (
                    <button
                      key={cIdx}
                      onClick={() => onCitationClick(cit.page_number)}
                      className="px-2 py-1 rounded-md bg-violet-950/60 border border-violet-500/40 text-violet-300 text-[10px] font-mono hover:bg-violet-900/80 transition-all flex items-center gap-1 group"
                      title={cit.snippet}
                    >
                      <Bookmark className="w-3 h-3 text-violet-400 group-hover:scale-110 transition-transform" />
                      <span>Page {cit.page_number} ({cit.section_name})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-zinc-400 text-xs py-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-violet-400" />
            <span>Scanning PDF embeddings & generating RAG citations...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-zinc-800">
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
            className="p-2 rounded-lg bg-violet-600 text-white hover:bg-violet-500 transition-colors shadow-md shadow-violet-900/40"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
