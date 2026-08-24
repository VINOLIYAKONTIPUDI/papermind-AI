import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Network } from 'lucide-react';

export default function AuthPage({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLoginSuccess();
  };

  return (
    <div className="w-full min-h-screen bg-zinc-950 flex flex-col md:flex-row overflow-hidden">
      {/* Left 50% Pane: Interactive Particle Network Simulation */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-violet-950/60 via-zinc-950 to-indigo-950/60 p-12 flex flex-col justify-between relative border-r border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xl glow-violet">
            P
          </div>
          <span className="font-heading font-extrabold text-2xl text-white">PaperMind AI</span>
        </div>

        {/* Animated Visual Particles Nodes Simulation */}
        <div className="relative h-64 w-full flex items-center justify-center my-auto">
          <div className="absolute w-40 h-40 rounded-full bg-violet-600/20 blur-3xl animate-pulse" />
          <svg className="w-full h-full">
            <line x1="100" y1="80" x2="250" y2="150" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="250" y1="150" x2="400" y2="100" stroke="#6366f1" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="250" y1="150" x2="280" y2="220" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="100" cy="80" r="16" fill="#8b5cf6" className="animate-bounce" />
            <circle cx="250" cy="150" r="24" fill="#6366f1" className="glow-violet" />
            <circle cx="400" cy="100" r="14" fill="#10b981" />
            <circle cx="280" cy="220" r="18" fill="#f59e0b" />
          </svg>
          <div className="absolute bottom-2 text-center text-xs text-zinc-400 font-mono">
            Interactive Multi-Dimensional Knowledge Web
          </div>
        </div>

        <div className="space-y-2 text-zinc-400 text-xs">
          <p>“PaperMind AI completely revolutionized how our team digests 50+ machine learning papers per month.”</p>
          <p className="text-zinc-200 font-semibold">— Dr. Elena Rostova, Senior AI Researcher</p>
        </div>
      </div>

      {/* Right 50% Pane: Authentication Form */}
      <div className="w-full md:w-1/2 p-12 flex flex-col justify-center max-w-md mx-auto space-y-6">
        <div className="space-y-2">
          <h2 className="font-heading font-extrabold text-2xl text-white">
            {isRegister ? 'Create Your Researcher Account' : 'Welcome Back to PaperMind'}
          </h2>
          <p className="text-xs text-zinc-400">Enter your credentials to access your personal paper collections.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-300">Full Name</label>
              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 focus-within:border-violet-500">
                <User className="w-4 h-4 text-zinc-500" />
                <input type="text" placeholder="Dr. Alex Morgan" className="bg-transparent w-full focus:outline-none" required />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-300">Email Address</label>
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 focus-within:border-violet-500">
              <Mail className="w-4 h-4 text-zinc-500" />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="researcher@university.edu" 
                className="bg-transparent w-full focus:outline-none" 
                required 
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-300">Password</label>
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 focus-within:border-violet-500">
              <Lock className="w-4 h-4 text-zinc-500" />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••••••" 
                className="bg-transparent w-full focus:outline-none" 
                required 
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-heading font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-900/50 glow-violet"
          >
            <span>{isRegister ? 'Register Account' : 'Sign In to Workspace'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-zinc-400">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => setIsRegister(!isRegister)} className="text-violet-400 hover:underline font-semibold">
            {isRegister ? 'Sign In' : 'Create Free Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
