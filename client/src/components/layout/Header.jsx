import React from 'react';
import { Search, Command, Bell, Sun, Moon, Sparkles, User } from 'lucide-react';

export default function Header({ collapsed, openCommandPalette, lightMode, setLightMode, currentTab, setCurrentTab, activePaper }) {
  const activePaperTitle = activePaper?.title || 'Attention Is All You Need';

  return (
    <header className={`fixed top-0 right-0 h-16 bg-zinc-950/80 border-b border-zinc-800/80 z-20 transition-all duration-300 flex items-center justify-between px-6 backdrop-blur-md ${
      collapsed ? 'left-[68px]' : 'left-[260px]'
    }`}>
      {/* Search & Ctrl+K Trigger */}
      <div className="flex items-center gap-4">
        <button
          onClick={openCommandPalette}
          className="flex items-center gap-3 px-4 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all text-xs w-72 justify-between group"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Search className="w-4 h-4 text-zinc-500 group-hover:text-violet-400 shrink-0" />
            <span className="truncate">Search papers, notes, concepts...</span>
          </div>
          <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-400 border border-zinc-700 flex items-center gap-1 shrink-0">
            <Command className="w-3 h-3" /> K
          </kbd>
        </button>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        {/* Active Paper Chip */}
        <button 
          onClick={() => setCurrentTab('workspace')}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-600/20 text-violet-300 border border-violet-500/40 text-xs font-semibold hover:bg-violet-600/30 transition-all max-w-xs truncate"
          title={activePaperTitle}
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0" />
          <span className="truncate">Active: {activePaperTitle}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setLightMode(!lightMode)}
          className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-zinc-800 transition-colors"
          title="Toggle Dark / Light Theme"
        >
          {lightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Notification Bell */}
        <button className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-zinc-800 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500 animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500" />
        </button>

        {/* User Profile Avatar */}
        <button 
          onClick={() => setCurrentTab('auth')}
          className="flex items-center gap-2 pl-2 border-l border-zinc-800"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-violet-900/30">
            <User className="w-4 h-4" />
          </div>
        </button>
      </div>
    </header>
  );
}
