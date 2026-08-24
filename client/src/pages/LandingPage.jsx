import React from 'react';
import { Sparkles, ArrowRight, GitFork, BrainCircuit, ShieldCheck, Zap, Layers, Play, Check, ChevronDown } from 'lucide-react';

export default function LandingPage({ onGetStarted }) {
  return (
    <div className="w-full min-h-screen bg-zinc-950 text-zinc-100 flex flex-col overflow-x-hidden selection:bg-violet-500/40">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 text-center max-w-5xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-950/60 border border-violet-500/40 text-violet-300 text-xs font-semibold glow-violet">
          <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
          <span>Next-Generation AI Research Intelligence Platform</span>
        </div>

        <h1 className="font-heading font-extrabold text-4xl sm:text-6xl text-white leading-tight">
          Transform Static Research Papers Into{' '}
          <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
            Interactive Mind Maps
          </span>
        </h1>

        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Upload any academic PDF. Instantly generate dynamic knowledge graphs, interactive bezier mind maps, Leitner flashcards, and converse with a context-aware RAG research tutor.
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={onGetStarted}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-heading font-bold text-sm flex items-center gap-3 transition-all shadow-xl shadow-violet-900/50 glow-violet hover:scale-105"
          >
            <span>Get Started for Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Live Animated UI Mockup */}
        <div className="pt-10 max-w-4xl mx-auto">
          <div className="p-4 rounded-3xl bg-zinc-900/80 border border-violet-500/40 glass-panel shadow-2xl glow-violet overflow-hidden">
            <div className="h-8 border-b border-zinc-800 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-[10px] text-zinc-500 font-mono ml-4">PaperMind Workspace Live Preview</span>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center text-left">
              <div className="space-y-3 bg-zinc-950 p-5 rounded-2xl border border-zinc-800 text-xs">
                <div className="text-violet-400 font-mono text-[10px]">SELECTED TEXT HIGHLIGHT</div>
                <p className="text-zinc-200 bg-violet-600/20 p-3 rounded-xl border border-violet-500/40">
                  "Multi-Head Attention allows the model to jointly attend to information from different representation subspaces at different positions."
                </p>
                <div className="flex gap-2">
                  <span className="px-2 py-1 rounded bg-violet-600 text-white text-[10px] font-bold">Action: Simplify</span>
                  <span className="px-2 py-1 rounded bg-emerald-600 text-white text-[10px] font-bold">Action: Ask Tutor</span>
                </div>
              </div>

              <div className="space-y-3 bg-zinc-950 p-5 rounded-2xl border border-violet-500/40 text-xs glow-violet">
                <div className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI GENERATED MIND MAP NODE
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 font-heading font-bold text-violet-300">
                  Sub-space Attention Head 1..8
                </div>
                <p className="text-zinc-400 text-[11px]">
                  Projects Queries, Keys, and Values into d_k dimensions to compute parallel dot-product metrics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Banner */}
      <section className="py-12 border-y border-zinc-800/80 bg-zinc-950/80">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-heading font-extrabold text-violet-400">3x Faster</div>
            <div className="text-xs text-zinc-400 mt-1">Research Paper Synthesis Rate</div>
          </div>
          <div>
            <div className="text-3xl font-heading font-extrabold text-emerald-400">85% Retention</div>
            <div className="text-xs text-zinc-400 mt-1">Improvement via Spaced Flashcards</div>
          </div>
          <div>
            <div className="text-3xl font-heading font-extrabold text-indigo-400">2M+ Papers</div>
            <div className="text-xs text-zinc-400 mt-1">Mapped in Knowledge Graph</div>
          </div>
        </div>
      </section>

      {/* Pricing Tier Matrix */}
      <section className="py-20 px-6 max-w-6xl mx-auto text-center space-y-12">
        <div className="space-y-3">
          <h2 className="font-heading font-extrabold text-3xl text-white">Transparent Pricing Plans</h2>
          <p className="text-xs text-zinc-400">Choose the ideal workspace tier for your academic research requirements.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Tier */}
          <div className="p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 glass-panel flex flex-col justify-between text-left space-y-6">
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-lg text-white">Free Starter</h3>
              <div className="text-3xl font-heading font-extrabold text-white">$0 <span className="text-xs text-zinc-500 font-normal">/ month</span></div>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 3 Paper Uploads / month</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Core RAG Tutor Access</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Basic Mind Map Viewer</li>
              </ul>
            </div>
            <button onClick={onGetStarted} className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs">Start Free</button>
          </div>

          {/* Pro Tier (Featured) */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-violet-900/40 via-zinc-900 to-zinc-900 border-2 border-violet-500 glass-panel flex flex-col justify-between text-left space-y-6 glow-violet relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full bg-violet-600 text-white text-[10px] font-bold uppercase tracking-wider">Most Popular</div>
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-lg text-white">Pro Researcher</h3>
              <div className="text-3xl font-heading font-extrabold text-white">$12 <span className="text-xs text-zinc-500 font-normal">/ month</span></div>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Unlimited PDF Ingestion</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Full Knowledge Graph Export</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Simulated NeurIPS Peer Reviewer</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Leitner Spaced Repetition Arena</li>
              </ul>
            </div>
            <button onClick={onGetStarted} className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-lg shadow-violet-900/50">Get Pro Access</button>
          </div>

          {/* Enterprise Tier */}
          <div className="p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 glass-panel flex flex-col justify-between text-left space-y-6">
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-lg text-white">Lab / Enterprise</h3>
              <div className="text-3xl font-heading font-extrabold text-white">Custom</div>
              <ul className="space-y-2 text-xs text-zinc-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Team Shared Collections</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Dedicated Vector Store</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> SSO & SAML Authentication</li>
              </ul>
            </div>
            <button onClick={onGetStarted} className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs">Contact Sales</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-zinc-800 text-center text-xs text-zinc-500">
        <p>© 2026 PaperMind AI Platform. Built with MERN Stack (Pure JavaScript).</p>
      </footer>
    </div>
  );
}
