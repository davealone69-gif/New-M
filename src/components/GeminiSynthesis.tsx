import React, { useState } from 'react';
import { Sparkles, Send, Cpu, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';
import { CodeViewer } from './CodeViewer';

export const GeminiSynthesis: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3.6-flash');
  const [systemInstruction, setSystemInstruction] = useState(
    'You are Gemini inside Mandela Matrix OS. Synthesize clear, structured architectural answers for matrix, core, and build tasks. Use short sections and bullet points when listing steps.'
  );

  const [isLoading, setIsLoading] = useState(false);
  const [synthesisResult, setSynthesisResult] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const promptTemplates = [
    {
      title: 'Room Database Migration Blueprint',
      prompt: 'Provide a complete Room database architecture and 1-to-2 schema migration plan for an Android app with Kotlin and Flow.',
    },
    {
      title: 'Jetpack Compose Clean Architecture',
      prompt: 'Synthesize a Clean Architecture layout with UseCases, Repository interfaces, ViewModels, and Compose UI screens for user authentication.',
    },
    {
      title: 'Coroutines & Offline First Synchronization',
      prompt: 'Design an offline-first data sync engine using Kotlin Coroutines, WorkManager, and Room database with conflict resolution.',
    },
    {
      title: 'M3 Custom Dark Terminal Theme Palette',
      prompt: 'Synthesize Jetpack Compose Material 3 dark color scheme tokens, typography, and custom canvas draw operations for terminal aesthetics.',
    },
  ];

  const handleSynthesize = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setSynthesisResult('');

    try {
      const response = await fetch('/api/gemini/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          systemInstruction,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Gemini synthesis request failed.');
      }

      const data = await response.json();
      setSynthesisResult(data.result);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to communicate with Gemini API server endpoint.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="p-4 rounded border border-[#A855F7]/40 bg-black/80 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-[#A855F7]/10 border border-[#A855F7]">
              <Sparkles className="w-6 h-6 text-[#A855F7] animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#A855F7] tracking-wider">
                CORE GEMINI AI &mdash; MATRIX SYNTHESIS
              </h2>
              <p className="text-xs text-gray-400">
                Server-Side Google DeepMind Gemini API Core Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#A855F7]">MODEL:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-black border border-[#A855F7]/50 text-[#A855F7] text-xs p-1.5 rounded focus:outline-none cursor-pointer font-bold"
            >
              <option value="gemini-3.6-flash">gemini-3.6-flash (Fast Reasoning)</option>
              <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Deep Architecture)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="p-4 rounded border border-[#A855F7]/30 bg-black/90 space-y-4">
        <div className="space-y-1">
          <label className="text-xs text-[#A855F7] font-bold uppercase">
            Matrix Synthesis Prompt:
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Prompt Gemini for matrix synthesis (e.g. Synthesize a Room database architecture for offline task syncing)..."
            rows={3}
            className="w-full bg-[#0D0208] border border-[#A855F7]/40 rounded p-3 text-xs text-[#A855F7] placeholder-gray-600 focus:outline-none focus:border-[#A855F7] focus:ring-1 focus:ring-[#A855F7]"
          />
        </div>

        {/* Prompt Templates */}
        <div className="space-y-2">
          <span className="text-[11px] text-gray-500">Architectural Prompt Templates:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {promptTemplates.map((tmpl, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(tmpl.prompt)}
                className="text-left p-2.5 rounded bg-black/60 border border-[#A855F7]/30 hover:border-[#A855F7] hover:bg-[#A855F7]/10 transition cursor-pointer text-xs"
              >
                <div className="font-bold text-[#A855F7]">{tmpl.title}</div>
                <div className="text-[10px] text-gray-400 truncate">{tmpl.prompt}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            onClick={handleSynthesize}
            disabled={isLoading || !prompt.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded bg-[#A855F7] text-black font-bold text-xs hover:bg-[#A855F7]/80 hover:text-white transition shadow-[0_0_15px_#A855F7] disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Cpu className="w-4 h-4 animate-spin" />
                <span>SYNTHESIZING MATRIX CORE...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>START GEMINI SYNTHESIS</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="p-3 rounded border border-red-500/50 bg-red-950/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Synthesis Output Display */}
      {synthesisResult && (
        <div className="p-4 rounded border border-[#A855F7]/40 bg-black/90 space-y-3">
          <div className="flex items-center justify-between border-b border-[#A855F7]/30 pb-2">
            <span className="font-bold text-xs text-[#A855F7] flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              SYNTHESIS RESULT &bull; {selectedModel}
            </span>
          </div>

          <div className="text-xs text-purple-200 leading-relaxed font-mono whitespace-pre-wrap bg-[#0D0208] p-4 rounded border border-purple-900/40">
            {synthesisResult}
          </div>

          {synthesisResult.includes('class ') || synthesisResult.includes('fun ') ? (
            <CodeViewer code={synthesisResult} filename="GeminiSynthesizedArchitecture.kt" language="kotlin" />
          ) : null}
        </div>
      )}
    </div>
  );
};
