import React, { useState } from 'react';
import {
  Cpu,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Terminal,
  BookOpen,
  Plus,
  Save,
  Zap,
  Bot,
  Sparkles,
} from 'lucide-react';
import { CustomAgent, Skill, SwarmStep, BuildArtifact } from '../types';
import { CodeViewer } from './CodeViewer';

interface SwarmBuilderProps {
  customAgents: CustomAgent[];
  activeSkills: Skill[];
  onSaveArtifact: (artifact: BuildArtifact) => void;
  onOpenAgentModal: () => void;
  isOnline: boolean;
}

export const SwarmBuilder: React.FC<SwarmBuilderProps> = ({
  customAgents,
  activeSkills,
  onSaveArtifact,
  onOpenAgentModal,
  isOnline,
}) => {
  const [taskInput, setTaskInput] = useState('');
  const [selectedPlanner, setSelectedPlanner] = useState<string>('DEFAULT');
  const [selectedCoder, setSelectedCoder] = useState<string>('DEFAULT');
  const [selectedCritic, setSelectedCritic] = useState<string>('DEFAULT');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.6-flash');

  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [stepsHistory, setStepsHistory] = useState<SwarmStep[]>([]);
  const [finalSynthesizedCode, setFinalSynthesizedCode] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const sampleTasks = [
    'Build a Todo App with Room Database, StateFlow, and Scaffold',
    'Create an Offline Note Taking App with ViewModel and Compose UI',
    'Build a Weather App with Retrofit API client and M3 Cards',
    'Build a Expense Tracker with Charts and Category filtering',
  ];

  const handleRunSwarm = async () => {
    if (!taskInput.trim()) return;

    setIsRunning(true);
    setErrorMsg(null);
    setSaveSuccess(false);
    setFinalSynthesizedCode('');
    setStepsHistory([]);

    const plannerObj = customAgents.find((a) => a.id === selectedPlanner);
    const coderObj = customAgents.find((a) => a.id === selectedCoder);
    const criticObj = customAgents.find((a) => a.id === selectedCritic);

    try {
      const response = await fetch('/api/swarm/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: taskInput,
          model: selectedModel,
          activeSkills: activeSkills,
          customPlanner: plannerObj?.systemPrompt,
          customCoder: coderObj?.systemPrompt,
          customCritic: criticObj?.systemPrompt,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Swarm execution failed.');
      }

      const data = await response.json();
      setStepsHistory(data.fullHistory || []);
      setFinalSynthesizedCode(data.finalCode || '');

      // Automatically save build artifact
      const newArtifact: BuildArtifact = {
        id: 'artifact-' + Date.now(),
        taskName: taskInput,
        generatedCode: data.finalCode || '',
        timestamp: Date.now(),
        modelUsed: selectedModel,
        isFavorite: false,
        language: 'kotlin',
      };
      onSaveArtifact(newArtifact);
      setSaveSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An unexpected error occurred during swarm execution.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Title & Description Header */}
      <div className="p-4 rounded border border-[#00FF41]/30 bg-black/80 backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,65,0.1)]">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-[#00FF41]/10 border border-[#00FF41]">
              <Cpu className="w-6 h-6 text-[#00FF41] animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#00FF41] tracking-wide">
                MULTI-AGENT SWARM ORCHESTRATOR
              </h2>
              <p className="text-xs text-gray-400">
                Planner &rarr; Coder (with Active Skills) &rarr; Quality Critic &rarr; Refinement Specialist
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#008F11]">ACTIVE SKILLS INJECTED:</span>
            <span className="px-2 py-0.5 rounded bg-[#00FF41]/20 border border-[#00FF41] text-[#00FF41] text-xs font-bold">
              {activeSkills.length}
            </span>
          </div>
        </div>
      </div>

      {/* Task Input Section */}
      <div className="p-4 rounded border border-[#00FF41]/30 bg-black/90 space-y-4">
        <label className="block text-xs font-bold text-[#00FF41] tracking-wider uppercase">
          Synthesize Android / Kotlin Task Blueprint:
        </label>
        <div className="flex gap-2">
          <textarea
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="Describe the Android component or application feature you want to build (e.g. Build a Todo App with Room DB, StateFlow and Material 3 Scaffold)..."
            rows={3}
            className="w-full bg-[#0D0208] border border-[#00FF41]/40 rounded p-3 text-xs text-[#00FF41] placeholder-gray-600 focus:outline-none focus:border-[#00FF41] focus:ring-1 focus:ring-[#00FF41] font-mono"
          />
        </div>

        {/* Preset Task Buttons */}
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="text-[11px] text-gray-500 flex items-center gap-1">
            <Zap className="w-3 h-3 text-[#00FF41]" />
            Presets:
          </span>
          {sampleTasks.map((st, i) => (
            <button
              key={i}
              onClick={() => setTaskInput(st)}
              className="text-[11px] px-2.5 py-1 rounded bg-black border border-[#00FF41]/30 hover:border-[#00FF41] text-gray-300 hover:text-[#00FF41] transition cursor-pointer"
            >
              + {st}
            </button>
          ))}
        </div>

        {/* Agent Dock & Model Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-[#00FF41]/20">
          {/* Planner Select */}
          <div className="space-y-1">
            <span className="text-[11px] text-[#00FF41]">Planner Agent:</span>
            <select
              value={selectedPlanner}
              onChange={(e) => setSelectedPlanner(e.target.value)}
              className="w-full bg-[#0D0208] border border-[#00FF41]/40 rounded p-2 text-xs text-[#00FF41] focus:outline-none cursor-pointer"
            >
              <option value="DEFAULT">Default Architecture Planner</option>
              {customAgents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Coder Select */}
          <div className="space-y-1">
            <span className="text-[11px] text-[#00FF41]">Coder Agent:</span>
            <select
              value={selectedCoder}
              onChange={(e) => setSelectedCoder(e.target.value)}
              className="w-full bg-[#0D0208] border border-[#00FF41]/40 rounded p-2 text-xs text-[#00FF41] focus:outline-none cursor-pointer"
            >
              <option value="DEFAULT">Default Kotlin Compose Coder</option>
              {customAgents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Critic Select */}
          <div className="space-y-1">
            <span className="text-[11px] text-[#00FF41]">Quality Critic Agent:</span>
            <select
              value={selectedCritic}
              onChange={(e) => setSelectedCritic(e.target.value)}
              className="w-full bg-[#0D0208] border border-[#00FF41]/40 rounded p-2 text-xs text-[#00FF41] focus:outline-none cursor-pointer"
            >
              <option value="DEFAULT">Default State & Import Critic</option>
              {customAgents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
          <button
            onClick={onOpenAgentModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-black border border-[#00FF41]/40 hover:border-[#00FF41] text-[#00FF41] text-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>SYNTHESIZE CUSTOM AGENT</span>
          </button>

          <button
            onClick={handleRunSwarm}
            disabled={isRunning || !taskInput.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded bg-[#00FF41] text-black font-bold text-xs hover:bg-[#008F11] hover:text-white transition shadow-[0_0_15px_#00FF41] disabled:opacity-50 cursor-pointer"
          >
            {isRunning ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>SWARM PROCESSING...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>EXECUTE SWARM BUILD</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Injected Skills Context Banner */}
      {activeSkills.length > 0 && (
        <div className="p-3 rounded border border-emerald-500/30 bg-emerald-950/20 text-xs text-emerald-300 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-emerald-400">
            <BookOpen className="w-4 h-4" />
            <span>TRAINING CENTRE SKILLS INJECTED INTO CODER BRAIN:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeSkills.map((sk) => (
              <span
                key={sk.id}
                className="px-2 py-0.5 rounded bg-black/60 border border-emerald-500/40 text-[11px]"
              >
                ✓ {sk.title} ({sk.category})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Error Notice */}
      {errorMsg && (
        <div className="p-3 rounded border border-red-500/50 bg-red-950/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Live Swarm Terminal Stream */}
      {stepsHistory.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#00FF41] flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              SWARM CHAIN-OF-THOUGHT TERMINAL STREAM
            </h3>
            {saveSuccess && (
              <span className="text-xs text-[#00FF41] flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#00FF41]" />
                SAVED TO MANIFEST ARCHIVE
              </span>
            )}
          </div>

          <div className="space-y-3">
            {stepsHistory.map((step, idx) => (
              <div
                key={step.id || idx}
                className="p-4 rounded border border-[#00FF41]/30 bg-black/90 space-y-2 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
              >
                <div className="flex items-center justify-between border-b border-[#00FF41]/20 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-ping" />
                    <span className="font-bold text-xs text-[#00FF41] uppercase tracking-wider">
                      STEP {idx + 1}: {step.agentType} &mdash; {step.agentName}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500">
                    {new Date(step.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="text-xs text-gray-300 leading-relaxed font-mono whitespace-pre-wrap bg-[#0D0208] p-3 rounded border border-gray-800">
                  {step.output}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Synthesized Final Code Section */}
      {finalSynthesizedCode && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#00FF41] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00FF41]" />
              FINAL SYNTHESIZED KOTLIN COMPOSE CODE
            </h3>
          </div>
          <CodeViewer code={finalSynthesizedCode} filename="MandelaFeature.kt" language="kotlin" />
        </div>
      )}
    </div>
  );
};
