import React, { useState } from 'react';
import { Cpu, Play, RotateCcw, CheckCircle2, AlertCircle, Terminal, BookOpen, Plus, Sparkles, Zap } from 'lucide-react';
import { CustomAgent, Skill, SwarmStep, BuildArtifact } from '../types';
import { CodeViewer } from './CodeViewer';
import { apiFetch } from '../lib/api';

interface SwarmBuilderProps { customAgents: CustomAgent[]; activeSkills: Skill[]; onSaveArtifact: (artifact: BuildArtifact) => void; onOpenAgentModal: () => void; isOnline: boolean; }

export const SwarmBuilder: React.FC<SwarmBuilderProps> = ({ customAgents, activeSkills, onSaveArtifact, onOpenAgentModal, isOnline }) => {
  const [taskInput, setTaskInput] = useState('');
  const [selectedPlanner, setSelectedPlanner] = useState('DEFAULT');
  const [selectedCoder, setSelectedCoder] = useState('DEFAULT');
  const [selectedCritic, setSelectedCritic] = useState('DEFAULT');
  const [selectedModel, setSelectedModel] = useState('gemini-3.6-flash');
  const [isRunning, setIsRunning] = useState(false);
  const [stepsHistory, setStepsHistory] = useState<SwarmStep[]>([]);
  const [finalSynthesizedCode, setFinalSynthesizedCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleRunSwarm = async () => {
    if (!taskInput.trim()) return;
    if (!isOnline) { setErrorMsg('ONLINE CORE is OFF. Enable it before running a remote swarm.'); return; }
    setIsRunning(true); setErrorMsg(null); setSaveSuccess(false); setFinalSynthesizedCode(''); setStepsHistory([]);
    const plannerObj = customAgents.find((a) => a.id === selectedPlanner);
    const coderObj = customAgents.find((a) => a.id === selectedCoder);
    const criticObj = customAgents.find((a) => a.id === selectedCritic);
    try {
      const response = await apiFetch('/api/swarm/execute', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task: taskInput, model: selectedModel, activeSkills, customPlanner: plannerObj?.systemPrompt, customCoder: coderObj?.systemPrompt, customCritic: criticObj?.systemPrompt }) });
      const text = await response.text();
      let data: any = {}; try { data = text ? JSON.parse(text) : {}; } catch { throw new Error(`Backend returned invalid JSON (HTTP ${response.status}).`); }
      if (!response.ok) throw new Error(data.error || `Swarm execution failed (HTTP ${response.status}).`);
      setStepsHistory(data.fullHistory || []); setFinalSynthesizedCode(data.finalCode || '');
      onSaveArtifact({ id: 'artifact-' + Date.now(), taskName: taskInput, generatedCode: data.finalCode || '', timestamp: Date.now(), modelUsed: selectedModel, isFavorite: false, language: 'kotlin' });
      setSaveSuccess(true);
    } catch (err: any) { console.error(err); setErrorMsg(err?.message || 'Backend connection failed. Start the local backend or configure an API URL in Settings.'); }
    finally { setIsRunning(false); }
  };

  return (
    <div className="space-y-6 font-mono">
      <div className="p-4 rounded border border-[#00FF41]/30 bg-black/80"><div className="flex items-center gap-3"><div className="p-2 rounded bg-[#00FF41]/10 border border-[#00FF41]"><Cpu className="w-6 h-6 text-[#00FF41]" /></div><div><h2 className="text-base font-bold text-[#00FF41]">MULTI-AGENT SWARM ORCHESTRATOR</h2><p className="text-xs text-gray-400">Planner → Coder → Quality Critic → Refinement Specialist</p></div></div></div>
      <div className="p-4 rounded border border-[#00FF41]/30 bg-black/90 space-y-4">
        <label className="block text-xs font-bold text-[#00FF41] uppercase">Synthesize Android / Kotlin Task Blueprint:</label>
        <textarea value={taskInput} onChange={(e) => setTaskInput(e.target.value)} placeholder="Describe the Android app or feature you want to build..." rows={4} className="w-full bg-[#0D0208] border border-[#00FF41]/40 rounded p-3 text-xs text-[#00FF41] font-mono" />
        <div className="flex flex-wrap gap-2">{['Build a Todo App with Room Database, StateFlow, and Scaffold','Create an Offline Note Taking App with ViewModel and Compose UI','Build a Weather App with Retrofit API client and M3 Cards','Build an Expense Tracker with Charts and Category filtering'].map((st) => <button key={st} onClick={() => setTaskInput(st)} className="text-[11px] px-2.5 py-1 rounded bg-black border border-[#00FF41]/30 text-gray-300 cursor-pointer">+ {st}</button>)}</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-[#00FF41]/20">{[['Planner Agent',selectedPlanner,setSelectedPlanner,'Default Architecture Planner'],['Coder Agent',selectedCoder,setSelectedCoder,'Default Kotlin Compose Coder'],['Quality Critic Agent',selectedCritic,setSelectedCritic,'Default State & Import Critic']].map(([label,value,setter,def]) => <div key={String(label)}><span className="text-[11px] text-[#00FF41]">{String(label)}:</span><select value={String(value)} onChange={(e) => (setter as any)(e.target.value)} className="w-full bg-[#0D0208] border border-[#00FF41]/40 rounded p-2 text-xs text-[#00FF41]"><option value="DEFAULT">{String(def)}</option>{customAgents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>)}</div>
        <div className="flex justify-between gap-4 flex-wrap"><button onClick={onOpenAgentModal} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-black border border-[#00FF41]/40 text-[#00FF41] text-xs cursor-pointer"><Plus className="w-3.5 h-3.5" /> SYNTHESIZE CUSTOM AGENT</button><button onClick={handleRunSwarm} disabled={isRunning || !taskInput.trim()} className="flex items-center gap-2 px-6 py-2.5 rounded bg-[#00FF41] text-black font-bold text-xs disabled:opacity-50 cursor-pointer">{isRunning ? <><RotateCcw className="w-4 h-4 animate-spin" /> SWARM PROCESSING...</> : <><Play className="w-4 h-4" /> EXECUTE SWARM BUILD</>}</button></div>
      </div>
      {activeSkills.length > 0 && <div className="p-3 rounded border border-emerald-500/30 bg-emerald-950/20 text-xs text-emerald-300"><BookOpen className="inline w-4 h-4 mr-2" />TRAINING CENTRE SKILLS INJECTED: {activeSkills.map((s) => s.title).join(', ')}</div>}
      {errorMsg && <div className="p-3 rounded border border-red-500/50 bg-red-950/30 text-red-300 text-xs flex gap-2"><AlertCircle className="w-4 h-4" />{errorMsg}</div>}
      {stepsHistory.length > 0 && <div className="space-y-4"><h3 className="text-sm font-bold text-[#00FF41] flex gap-2"><Terminal className="w-4 h-4" />SWARM EXECUTION</h3>{stepsHistory.map((step,idx) => <div key={step.id || idx} className="p-4 rounded border border-[#00FF41]/30 bg-black/90"><b className="text-xs text-[#00FF41]">STEP {idx+1}: {step.agentType} - {step.agentName}</b><div className="text-xs text-gray-300 whitespace-pre-wrap mt-2">{step.output}</div></div>)}</div>}
      {finalSynthesizedCode && <div><h3 className="text-sm font-bold text-[#00FF41] flex gap-2"><Sparkles className="w-4 h-4" />FINAL SYNTHESIZED KOTLIN CODE</h3><CodeViewer code={finalSynthesizedCode} filename="MandelaFeature.kt" language="kotlin" /></div>}
      {saveSuccess && <div className="text-xs text-[#00FF41]"><CheckCircle2 className="inline w-4 h-4" /> SAVED TO MANIFEST ARCHIVE</div>}
    </div>
  );
};
