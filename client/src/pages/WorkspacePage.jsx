import React, { useState } from 'react';
import PdfViewer from '../components/pdf-viewer/PdfViewer';
import ChatSidebar from '../components/chat-sidebar/ChatSidebar';
import ResearchNotebook from '../components/notebook/ResearchNotebook';
import { MessageSquare, Edit3 } from 'lucide-react';

export default function WorkspacePage({ paper, chunks, paperId }) {
  const [activePage, setActivePage] = useState(1);
  const [rightPanel, setRightPanel] = useState('tutor'); // 'tutor' or 'notebook'
  const [initialChatMessage, setInitialChatMessage] = useState('');

  const handleCitationClick = (page) => {
    if (page) setActivePage(page);
  };

  const handleActionPopover = (actionType, text) => {
    if (actionType === 'askTutor') {
      setRightPanel('tutor');
      setInitialChatMessage(`Can you explain this excerpt: "${text}"?`);
    } else if (actionType === 'flashcard' || actionType === 'simplify') {
      setRightPanel('notebook');
    }
  };

  return (
    <div className="w-full h-[calc(100vh-64px)] bg-zinc-950 flex overflow-hidden">
      {/* Center PDF Viewer Pane */}
      <div className="flex-1 h-full overflow-hidden">
        <PdfViewer
          paper={paper}
          chunks={chunks}
          activePage={activePage}
          setActivePage={setActivePage}
          onTriggerAction={handleActionPopover}
        />
      </div>

      {/* Right Side Panel (Tutor vs Notebook) */}
      <div className="w-[420px] h-full flex flex-col border-l border-zinc-800 shrink-0">
        {/* Panel Switcher Tabs */}
        <div className="h-10 border-b border-zinc-800 bg-zinc-950 px-2 flex items-center gap-1 text-xs">
          <button
            onClick={() => setRightPanel('tutor')}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
              rightPanel === 'tutor' ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>AI Tutor</span>
          </button>
          <button
            onClick={() => setRightPanel('notebook')}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
              rightPanel === 'notebook' ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Notebook</span>
          </button>
        </div>

        {/* Active Panel Content */}
        <div className="flex-1 overflow-hidden">
          {rightPanel === 'tutor' ? (
            <ChatSidebar
              activePaperId={paperId || paper?.id || 'paper-attention-2017'}
              onCitationClick={handleCitationClick}
              initialMessage={initialChatMessage}
            />
          ) : (
            <ResearchNotebook paperTitle={paper?.title} />
          )}
        </div>
      </div>
    </div>
  );
}
