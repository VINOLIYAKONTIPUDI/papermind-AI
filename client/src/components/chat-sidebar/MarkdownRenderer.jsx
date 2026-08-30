import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Copy, Check } from 'lucide-react';
import 'katex/dist/katex.min.css';

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Failed to copy code to clipboard', err);
    }
  };

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 font-mono text-[11px] text-zinc-300">
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[10px] text-zinc-400">
        <span>{language.toUpperCase()}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-violet-400 transition-colors p-1 rounded hover:bg-zinc-800 cursor-pointer"
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 text-[9px]">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span className="text-[9px]">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto leading-relaxed max-w-full">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function MarkdownRenderer({ content }) {
  const customComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const codeVal = String(children).replace(/\n$/, '');
      const isInline = !match && !className;

      if (isInline) {
        return (
          <code className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800/80 font-mono text-[11px] text-violet-300 break-words" {...props}>
            {children}
          </code>
        );
      }

      return (
        <CodeBlock code={codeVal} language={match ? match[1] : 'text'} />
      );
    },
    h1: ({ children }) => <h1 className="text-sm font-bold font-heading text-zinc-100 mt-4 mb-2">{children}</h1>,
    h2: ({ children }) => <h2 className="text-xs font-bold font-heading text-zinc-100 mt-3.5 mb-1.5">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xs font-semibold font-heading text-zinc-200 mt-3 mb-1">{children}</h3>,
    h4: ({ children }) => <h4 className="text-[11px] font-semibold font-heading text-zinc-300 mt-2.5 mb-1">{children}</h4>,
    ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>,
    li: ({ children }) => <li className="leading-relaxed text-zinc-300 mb-0.5">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-violet-500 pl-3 my-2 italic text-zinc-400 bg-violet-950/10 py-1 pr-2 rounded-r">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="border-zinc-800 my-4" />,
    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline transition-colors">
        {children}
      </a>
    ),
    p: ({ children }) => <p className="mb-2 leading-relaxed text-zinc-200 last:mb-0">{children}</p>,
    table: ({ children }) => (
      <div className="my-3 overflow-x-auto rounded-lg border border-zinc-800 max-w-full">
        <table className="w-full text-left border-collapse text-[11px]">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-300 font-semibold">{children}</thead>,
    tbody: ({ children }) => <tbody className="divide-y divide-zinc-800/50">{children}</tbody>,
    tr: ({ children }) => <tr className="hover:bg-zinc-900/30 transition-colors">{children}</tr>,
    th: ({ children }) => <th className="px-3 py-2 text-zinc-200 font-bold">{children}</th>,
    td: ({ children }) => <td className="px-3 py-2 text-zinc-300">{children}</td>,
  };

  return (
    <div className="markdown-container text-xs text-zinc-200 leading-relaxed break-words">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={customComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
