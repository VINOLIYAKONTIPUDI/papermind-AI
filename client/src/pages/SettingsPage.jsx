import React, { useState } from 'react';
import { Settings, Key, User, Shield, Moon, Sun, Save, Check } from 'lucide-react';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('sk-papermind-demo-openai-key-2026');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-zinc-950 p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="font-heading font-extrabold text-2xl text-white">Platform Settings & API Keys</h1>
        <p className="text-xs text-zinc-400">Manage your profile credentials, custom LLM API keys, and theme preferences.</p>
      </div>

      <div className="p-8 rounded-3xl bg-zinc-900/80 border border-zinc-800 glass-panel space-y-6">
        <h3 className="font-heading font-bold text-sm text-zinc-100 flex items-center gap-2">
          <Key className="w-4 h-4 text-violet-400" /> Custom LLM Provider API Keys
        </h3>

        <div className="space-y-2">
          <label className="text-xs text-zinc-300 font-semibold">OpenAI / Anthropic API Key (Optional)</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-200 focus:outline-none focus:border-violet-500"
            placeholder="sk-..."
          />
          <p className="text-[10px] text-zinc-500">If left blank, PaperMind AI uses the high-performance local fallback RAG model.</p>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-violet-900/40"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Settings Saved!' : 'Save Settings'}</span>
        </button>
      </div>
    </div>
  );
}
