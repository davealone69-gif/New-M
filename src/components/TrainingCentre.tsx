import React, { useState } from 'react';
import { BookOpen, Plus, Trash2, CheckCircle2, ShieldCheck, Cpu, Code, Filter } from 'lucide-react';
import { Skill } from '../types';

interface TrainingCentreProps {
  skills: Skill[];
  onToggleSkill: (id: string) => void;
  onAddSkill: (skill: Skill) => void;
  onDeleteSkill: (id: string) => void;
}

export const TrainingCentre: React.FC<TrainingCentreProps> = ({
  skills,
  onToggleSkill,
  onAddSkill,
  onDeleteSkill,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'UI' | 'Database' | 'Architecture' | 'Security' | 'Performance'>('UI');
  const [newDesc, setNewDesc] = useState('');
  const [newSnippet, setNewSnippet] = useState('');

  const handleCreateSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSnippet.trim()) return;

    const skillObj: Skill = {
      id: 'skill-' + Date.now(),
      title: newTitle,
      category: newCategory,
      description: newDesc || 'Custom matrix training skill',
      promptSnippet: newSnippet,
      isActive: true,
    };

    onAddSkill(skillObj);
    setNewTitle('');
    setNewDesc('');
    setNewSnippet('');
    setShowAddModal(false);
  };

  const filteredSkills = skills.filter((s) =>
    selectedCategory === 'ALL' ? true : s.category === selectedCategory
  );

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="p-4 rounded border border-emerald-500/40 bg-black/80 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500">
              <BookOpen className="w-6 h-6 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-emerald-400 tracking-wider">
                TRAINING CENTRE &mdash; SKILL LIBRARY
              </h2>
              <p className="text-xs text-gray-400">
                Hard-coded Android Commandments & Skill Injections for Swarm Agents
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition cursor-pointer shadow-[0_0_10px_#10B981]"
          >
            <Plus className="w-4 h-4" />
            <span>ADD NEW SKILL</span>
          </button>
        </div>
      </div>

      {/* Filter Category Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
        <div className="flex items-center gap-1 text-gray-400">
          <Filter className="w-3.5 h-3.5 text-emerald-400" />
          <span>Category:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['ALL', 'UI', 'Database', 'Architecture', 'Security', 'Performance'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded text-xs transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'bg-black border border-emerald-500/30 text-emerald-300 hover:border-emerald-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSkills.map((skill) => (
          <div
            key={skill.id}
            className={`p-4 rounded border transition-all space-y-3 ${
              skill.isActive
                ? 'bg-emerald-950/20 border-emerald-500 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                : 'bg-black/60 border-gray-800 text-gray-500'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-emerald-400">{skill.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-black border border-emerald-500/40 text-emerald-300">
                    {skill.category}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{skill.description}</p>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => onToggleSkill(skill.id)}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 border ${
                  skill.isActive
                    ? 'bg-emerald-500 border-emerald-400'
                    : 'bg-gray-900 border-gray-700'
                }`}
                title={skill.isActive ? 'Disable Skill Injection' : 'Enable Skill Injection'}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-black transition-transform ${
                    skill.isActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Prompt Snippet Box */}
            <div className="p-3 rounded bg-[#0D0208] border border-gray-800 text-[11px] text-emerald-300 font-mono whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
              {skill.promptSnippet}
            </div>

            <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1">
              <span className="flex items-center gap-1 text-emerald-400">
                {skill.isActive ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>INJECTED IN SWARM CODER</span>
                  </>
                ) : (
                  <span>INACTIVE</span>
                )}
              </span>

              {skill.id.startsWith('skill-') && (
                <button
                  onClick={() => onDeleteSkill(skill.id)}
                  className="text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>DELETE</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Skill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D0208] border border-emerald-500 rounded p-6 max-w-lg w-full font-mono space-y-4 shadow-[0_0_20px_#10B981]">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4" />
              ADD NEW MATRIX TRAINING SKILL
            </h3>

            <form onSubmit={handleCreateSkill} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#00FF41] mb-1">Skill Title:</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Jetpack Compose Animation Performance"
                  required
                  className="w-full bg-black border border-emerald-500/40 rounded p-2 text-emerald-200 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-[#00FF41] mb-1">Category:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-black border border-emerald-500/40 rounded p-2 text-emerald-200 focus:outline-none"
                >
                  <option value="UI">UI</option>
                  <option value="Database">Database</option>
                  <option value="Architecture">Architecture</option>
                  <option value="Security">Security</option>
                  <option value="Performance">Performance</option>
                </select>
              </div>

              <div>
                <label className="block text-[#00FF41] mb-1">Description:</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Short explanation of rule"
                  className="w-full bg-black border border-emerald-500/40 rounded p-2 text-emerald-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#00FF41] mb-1">Prompt Instruction Snippet:</label>
                <textarea
                  value={newSnippet}
                  onChange={(e) => setNewSnippet(e.target.value)}
                  placeholder="Exact prompt directives to inject into the Swarm Coder..."
                  rows={4}
                  required
                  className="w-full bg-black border border-emerald-500/40 rounded p-2 text-emerald-200 focus:outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded border border-gray-700 text-gray-400 hover:text-white cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-emerald-500 text-black font-bold hover:bg-emerald-400 cursor-pointer"
                >
                  CREATE SKILL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
