import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, RefreshCw, ArrowRight, Star, CheckSquare } from 'lucide-react';
import { uploadPaperFile } from '../lib/api';

export default function UploadPage({ onPaperUploaded }) {
  const [file, setFile] = useState(null);
  const [step, setStep] = useState(0); // 0: Drop, 1: Parsing, 2: Planner Ready
  const [progress, setProgress] = useState(0);
  const [uploadedPaper, setUploadedPaper] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const steps = [
    'Verifying File Integrity & Checksum',
    'Extracting PyMuPDF Structural Layout & Sections',
    'Chunking Paragraphs & Calculating Semantic Vector Embeddings',
    'Synthesizing Knowledge Graph Nodes (Entities & Relations)',
    'Generating AI Personalized Study Roadmap'
  ];

  const handleDrop = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const droppedFile = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    if (droppedFile) {
      if (droppedFile.type !== 'application/pdf' && !droppedFile.name.endsWith('.pdf')) {
        setErrorMessage('Invalid file type. Only PDF documents are supported.');
        return;
      }
      setFile(droppedFile);
      startIngestPipeline(droppedFile);
    }
  };

  const startIngestPipeline = async (targetFile) => {
    setStep(1);
    let curStep = 0;
    const interval = setInterval(() => {
      curStep++;
      if (curStep <= 4) setProgress(curStep * 20);
    }, 600);

    // Call API Server for real PDF upload & text parsing
    const res = await uploadPaperFile(targetFile);
    clearInterval(interval);

    if (res.success && res.paper) {
      setProgress(100);
      setUploadedPaper(res.paper);
      setTimeout(() => {
        setStep(2);
      }, 500);
    } else {
      setErrorMessage(res.error || 'Failed to process PDF paper.');
      setStep(0);
    }
  };

  return (
    <div className="w-full min-h-screen bg-zinc-950 p-8 flex flex-col items-center justify-center max-w-4xl mx-auto">
      <div className="w-full space-y-6 text-center">
        
        <div className="space-y-2">
          <h1 className="font-heading font-extrabold text-3xl text-white">Paper Ingestion Pipeline</h1>
          <p className="text-xs text-zinc-400">Upload any PDF research paper (up to 50MB) to extract key insights, mind maps, and flashcards.</p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-300 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {/* Drop Zone */}
        {step === 0 && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="p-12 rounded-3xl bg-zinc-900/60 border-2 border-dashed border-zinc-800 hover:border-violet-500 glass-panel flex flex-col items-center justify-center space-y-4 cursor-pointer transition-all hover:scale-[1.01] glow-violet"
          >
            <div className="w-16 h-16 rounded-2xl bg-violet-600/20 text-violet-400 flex items-center justify-center border border-violet-500/30">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="font-heading font-bold text-base text-zinc-200">Drag and drop your research PDF paper here</div>
              <div className="text-xs text-zinc-500">Supports PDF format up to 50MB</div>
            </div>
            <label className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-violet-900/40">
              Browse Local Files
              <input type="file" accept=".pdf" onChange={handleDrop} className="hidden" />
            </label>
          </div>
        )}

        {/* 5-Stage Stepper Progress */}
        {step === 1 && (
          <div className="p-8 rounded-3xl bg-zinc-900/80 border border-violet-500/40 glass-panel space-y-6 max-w-2xl mx-auto glow-violet">
            <div className="flex items-center gap-3 justify-center">
              <RefreshCw className="w-6 h-6 text-violet-400 animate-spin" />
              <span className="font-heading font-bold text-lg text-white">Processing Document Vectors...</span>
            </div>

            <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden">
              <div style={{ width: `${progress}%` }} className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full transition-all duration-300" />
            </div>

            <div className="space-y-3 text-left">
              {steps.map((st, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  {progress >= (i + 1) * 20 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-zinc-700 shrink-0" />
                  )}
                  <span className={progress >= (i + 1) * 20 ? 'text-zinc-200 font-medium' : 'text-zinc-500'}>{st}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Study Planner Overlay Card */}
        {step === 2 && uploadedPaper && (
          <div className="p-8 rounded-3xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-emerald-500/50 glass-panel space-y-6 text-left max-w-2xl mx-auto shadow-2xl glow-emerald animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="font-heading font-bold text-lg text-white">Your AI Personalized Study Plan Is Ready!</h3>
                  <p className="text-xs text-zinc-400">Extracted Paper: {uploadedPaper.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                <Star className="w-4 h-4 fill-amber-400" /> {uploadedPaper.difficulty_rating || 4}/5 Rating
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-3 text-xs">
              <div className="font-heading font-bold text-violet-300 uppercase tracking-wider text-[11px]">Today's Recommended Goal (Est: {uploadedPaper.reading_time_mins || 30} mins)</div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
                <CheckSquare className="w-4 h-4 text-violet-400" />
                <span>Read Key Section Chunks & Abstract</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
                <CheckSquare className="w-4 h-4 text-violet-400" />
                <span>Review Generated Spaced Flashcards in Leitner Deck</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
                <CheckSquare className="w-4 h-4 text-violet-400" />
                <span>Pass Practice Quiz with score &gt; 80%</span>
              </div>
            </div>

            <button
              onClick={() => onPaperUploaded(uploadedPaper)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-heading font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-950/50 glow-emerald"
            >
              <span>Open Paper Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
