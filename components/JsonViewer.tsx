
import React from 'react';

interface JsonViewerProps {
  data: any;
  title?: string;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ data, title }) => {
  return (
    <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
      {title && (
        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
          <button 
            onClick={() => navigator.clipboard.writeText(JSON.stringify(data, null, 2))}
            className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded transition-colors"
          >
            Copy JSON
          </button>
        </div>
      )}
      <div className="p-4 overflow-x-auto max-h-[500px] custom-scrollbar">
        <pre className="text-sm text-emerald-400">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      </div>
    </div>
  );
};
