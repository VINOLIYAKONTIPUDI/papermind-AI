import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import CommandPalette from './components/layout/CommandPalette';

// Page Views
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import OverviewPage from './pages/OverviewPage';
import WorkspacePage from './pages/WorkspacePage';
import MindMapCanvas from './components/mind-map/MindMapCanvas';
import KnowledgeGraphView from './components/graph-view/KnowledgeGraphView';
import ComparePage from './pages/ComparePage';
import ReviewerScorecard from './components/reviewer/ReviewerScorecard';
import FlashcardsPage from './pages/FlashcardsPage';
import QuizPage from './pages/QuizPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

import { fetchPapers, fetchPaperById } from './lib/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState('landing');
  const [collapsed, setCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [lightMode, setLightMode] = useState(false);

  // Global Paper Library State
  const [papers, setPapers] = useState([]);
  const [activePaperId, setActivePaperId] = useState('paper-attention-2017');
  const [activePaperData, setActivePaperData] = useState(null);
  const [activeChunks, setActiveChunks] = useState([]);

  // Fetch Paper Library on Mount
  useEffect(() => {
    async function loadPapers() {
      const data = await fetchPapers();
      if (data && data.length > 0) {
        setPapers(data);
        const currentId = activePaperId || data[0].id;
        const detail = await fetchPaperById(currentId);
        if (detail) {
          setActivePaperData(detail.paper);
          setActiveChunks(detail.chunks || []);
        }
      }
    }
    loadPapers();
  }, []);

  // Handle Paper Selection
  const handleSelectPaper = async (paperId) => {
    setActivePaperId(paperId);
    const detail = await fetchPaperById(paperId);
    if (detail) {
      setActivePaperData(detail.paper);
      setActiveChunks(detail.chunks || []);
    }
  };

  // Handle New Paper Uploaded
  const handlePaperUploaded = (newPaper) => {
    setPapers(prev => [newPaper, ...prev]);
    setActivePaperId(newPaper.id);
    setActivePaperData(newPaper);
    setActiveChunks([]);
    fetchPaperById(newPaper.id).then(detail => {
      if (detail) setActiveChunks(detail.chunks || []);
    });
  };

  // Standalone Layout Check
  const isFullStandalone = currentTab === 'landing' || currentTab === 'auth';

  return (
    <div className={`min-h-screen bg-zinc-950 text-zinc-100 ${lightMode ? 'light-theme' : ''}`}>
      {/* Global Command Palette HUD */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        setCurrentTab={setCurrentTab}
        papers={papers}
        onSelectPaper={handleSelectPaper}
      />

      {!isFullStandalone ? (
        <div className="flex">
          {/* Collapsible Left Navigation Sidebar */}
          <Sidebar
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />

          {/* Top Header */}
          <Header
            collapsed={collapsed}
            openCommandPalette={() => setCommandPaletteOpen(true)}
            lightMode={lightMode}
            setLightMode={setLightMode}
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            activePaper={activePaperData}
          />

          {/* Main Workspace View Content */}
          <main className={`flex-1 pt-16 transition-all duration-300 ${collapsed ? 'ml-[68px]' : 'ml-[260px]'}`}>
            {currentTab === 'dashboard' && (
              <Dashboard
                papers={papers}
                activePaperId={activePaperId}
                onSelectPaper={(id) => { handleSelectPaper(id); setCurrentTab('workspace'); }}
                onGoToUpload={() => setCurrentTab('upload')}
                setCurrentTab={setCurrentTab}
              />
            )}
            {currentTab === 'upload' && (
              <UploadPage
                onPaperUploaded={(newPaper) => {
                  handlePaperUploaded(newPaper);
                  setCurrentTab('overview');
                }}
              />
            )}
            {currentTab === 'workspace' && (
              <WorkspacePage
                paper={activePaperData}
                chunks={activeChunks}
                paperId={activePaperId}
              />
            )}
            {currentTab === 'overview' && (
              <OverviewPage
                paper={activePaperData}
                onStartReading={() => setCurrentTab('workspace')}
              />
            )}
            {currentTab === 'mindmap' && (
              <MindMapCanvas
                paperId={activePaperId}
                onNodePageClick={() => setCurrentTab('workspace')}
              />
            )}
            {currentTab === 'graph' && (
              <KnowledgeGraphView
                paperId={activePaperId}
              />
            )}
            {currentTab === 'compare' && (
              <ComparePage
                papers={papers}
                defaultPaperA={activePaperId}
              />
            )}
            {currentTab === 'reviewer' && (
              <ReviewerScorecard
                paperId={activePaperId}
              />
            )}
            {currentTab === 'flashcards' && (
              <FlashcardsPage
                paperId={activePaperId}
              />
            )}
            {currentTab === 'quiz' && (
              <QuizPage
                paperId={activePaperId}
              />
            )}
            {currentTab === 'analytics' && <AnalyticsPage />}
            {currentTab === 'settings' && <SettingsPage />}
          </main>
        </div>
      ) : (
        /* Standalone Landing Page or Auth Page */
        <main className="w-full min-h-screen">
          {currentTab === 'landing' && <LandingPage onGetStarted={() => setCurrentTab('dashboard')} />}
          {currentTab === 'auth' && <AuthPage onLoginSuccess={() => setCurrentTab('dashboard')} />}
        </main>
      )}
    </div>
  );
}
