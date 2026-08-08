import React, { useState } from 'react';
import { Check, Copy, Download, FileCode, Terminal } from 'lucide-react';

interface CodeViewerProps {
  code: string;
  filename?: string;
  language?: string;
  maxHeight?: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  filename = 'SynthesizedCode.kt',
  language = 'kotlin',
  maxHeight = 'max-h-[500px]',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const lines = code.split('\n');

  return (
    <div className="rounded border border-[#00FF41]/40 bg-black/90 font-mono text-xs shadow-[0_0_15px_rgba(0,0,0,0.8)] overflow-hidden my-3">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0D0208] border-b border-[#00FF41]/20 text-[#00FF41]">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-[#00FF41]" />
          <span className="font-semibold text-xs tracking-wider">{filename}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#008F11]/20 border border-[#00FF41]/30 uppercase text-[#00FF41]">
            {language}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded bg-black/60 border border-[#00FF41]/30 hover:border-[#00FF41] text-[#00FF41] hover:text-white transition cursor-pointer text-[11px]"
            title="Copy Code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#00FF41]" />
                <span>COPIED</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>COPY</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#008F11]/20 border border-[#00FF41]/40 hover:bg-[#00FF41]/20 text-[#00FF41] transition cursor-pointer text-[11px]"
            title="Download .kt File"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT .KT</span>
          </button>
        </div>
      </div>

      {/* Code Area with Line Numbers */}
      <div className={`overflow-auto ${maxHeight} p-3 scrollbar-thin scrollbar-thumb-[#00FF41]/30`}>
        <div className="flex font-mono text-[11px] leading-relaxed">
          {/* Line Numbers */}
          <div className="select-none text-gray-600 text-right pr-3 border-r border-gray-800 shrink-0">
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Code Lines */}
          <pre className="pl-3 text-emerald-300 font-mono whitespace-pre overflow-x-auto w-full">
            <code>
              {lines.map((line, idx) => {
                // Colorize Kotlin keywords for matrix terminal aesthetic
                let styledLine = line;
                return (
                  <div key={idx} className="hover:bg-[#00FF41]/5">
                    <span
                      className={
                        line.startsWith('package') || line.startsWith('import')
                          ? 'text-purple-400'
                          : line.includes('@Composable') || line.includes('@Entity') || line.includes('@Dao')
                          ? 'text-cyan-300 font-bold'
                          : line.includes('class ') || line.includes('interface ') || line.includes('fun ') || line.includes('val ') || line.includes('var ')
                          ? 'text-emerald-200'
                          : line.startsWith('//')
                          ? 'text-gray-500 italic'
                          : 'text-gray-300'
                      }
                    >
                      {line || ' '}
                    </span>
                  </div>
                );
              })}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};
