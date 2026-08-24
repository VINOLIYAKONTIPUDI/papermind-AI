import React from 'react';
import { 
  LayoutDashboard, 
  UploadCloud, 
  GitFork, 
  Network, 
  Columns, 
  Award, 
  HelpCircle, 
  BrainCircuit, 
  FileText, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  BookOpen
} from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab, collapsed, setCollapsed }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload Paper', icon: UploadCloud },
    { id: 'workspace', label: 'PDF Workspace', icon: BookOpen },
    { id: 'overview', label: 'Research Overview', icon: FileText },
    { id: 'mindmap', label: 'Mind Map', icon: GitFork },
    { id: 'graph', label: 'Knowledge Graph', icon: Network },
    { id: 'compare', label: 'Compare Papers', icon: Columns },
    { id: 'reviewer', label: 'AI Peer Reviewer', icon: Award },
    { id: 'flashcards', label: 'Flashcards Arena', icon: BrainCircuit },
    { id: 'quiz', label: 'Adaptive Quiz', icon: HelpCircle },
    { id: 'analytics', label: 'Study Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside 
      className={`fixed top-0 left-0 h-screen bg-zinc-950/90 border-r border-zinc-800/80 z-30 transition-all duration-300 flex flex-col backdrop-blur-md ${
        collapsed ? 'w-[68px]' : 'w-[260px]'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 border-b border-zinc-800/80 flex items-center justify-between px-4">
        {!collapsed ? (
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('landing')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg glow-violet">
              P
            </div>
            <div>
              <span className="font-heading font-bold text-lg bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">
                PaperMind
              </span>
              <span className="text-[10px] text-zinc-500 block font-semibold tracking-wider">RESEARCH AI</span>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg mx-auto glow-violet cursor-pointer" onClick={() => setCurrentTab('landing')}>
            P
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              title={collapsed ? item.label : ''}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative group ${
                isActive 
                  ? 'bg-violet-600/15 text-violet-300 border border-violet-500/30' 
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-violet-500 rounded-r-full shadow-sm shadow-violet-500" />
              )}
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-violet-400' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle Footer */}
      <div className="p-3 border-t border-zinc-800/80">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <div className="flex items-center gap-2 text-xs font-semibold"><ChevronLeft className="w-4 h-4" /> <span>Collapse Sidebar</span></div>}
        </button>
      </div>
    </aside>
  );
}
