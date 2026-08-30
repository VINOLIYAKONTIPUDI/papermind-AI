import React from 'react';
import { FileText } from 'lucide-react';

export default function SourceCard({ citation, onCitationClick }) {
  const { page_number, section_name, document_name, similarity_score, snippet } = citation;

  const docTitle = document_name || 'Research Paper';
  const relevancePercent = typeof similarity_score === 'number' ? Math.round(similarity_score * 100) : null;

  return (
    <div 
      onClick={() => onCitationClick(page_number)}
      className="p-2.5 rounded-lg border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900/60 hover:border-violet-500/40 transition-all cursor-pointer flex flex-col gap-1.5 text-[11px] group active:scale-[0.98] w-full min-w-0"
      title={snippet ? `Snippet:\n"${snippet}"` : `Citation details`}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between w-full gap-2">
        <div className="flex items-center gap-1.5 text-zinc-300 font-medium min-w-0">
          <FileText className="w-3.5 h-3.5 text-violet-400 shrink-0 group-hover:scale-105 transition-transform" />
          <span className="truncate">{docTitle}</span>
        </div>
        {relevancePercent !== null && (
          <span className="text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded text-[9px] shrink-0 font-sans">
            {relevancePercent}% Match
          </span>
        )}
      </div>
      
      {/* Metadata Row */}
      <div className="text-zinc-400 text-[10px] min-w-0 w-full truncate">
        <span>Page {page_number}</span>
        {section_name && !['general', 'unknown', ''].includes(section_name.trim().toLowerCase()) && (
          <>
            <span className="text-zinc-600 px-1">·</span>
            <span className="text-zinc-500 font-sans italic" title={section_name}>
              {section_name}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
