import React, { useState } from 'react';
import { Bot, Plus, X, Sparkles } from 'lucide-react';
import { CustomAgent } from '../types';

interface CustomAgentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAgent: (agent: CustomAgent) => void;
}

export const CustomAgentDialog: React.FC<CustomAgentDialogProps> = ({
  isOpen,
  onClose,
  onSaveAgent,
}) => {
  const [name, setName] = useState('');
  const [systemPrompt, setSystemPrompt] = useState(
    'You are an expert Android UI Architect specializing in Jetpack Compose, state hoisting, and Material 3 design systems.'
  );
  const [colorHex, setColorHex] = useState('#00FF41');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newAgent: CustomAgent = {
      id: 'agent-' + Date.now(),
      name,
      systemPrompt,
      colorHex,
      isActive: true,
    };

    onSaveAgent(newAgent);
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0D0208] border border-[#00FF41] rounded-lg p-6 max-w-md w-full font-mono text-xs space-y-4 shadow-[0_0_25px_rgba(0,255,65,0.2)]">
        <div className="flex items-center justify-between border-b border-[#00FF41]/30 pb-3">
          <div className="flex items-center gap-2 text-[#00FF41] font-bold text-sm tracking-wider">
            <Bot className="w-5 h-5" />
            <span>SYNTHESIZE CUSTOM MATRIX AGENT</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-[#00FF41] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#00FF41] mb-1 font-bold">Agent Name / Specialty:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jetpack Compose UI Architect or Security Auditor"
              required
              className="w-full bg-black border border-[#00FF41]/40 rounded p-2 text-[#00FF41] focus:outline-none focus:border-[#00FF41]"
            />
          </div>

          <div>
            <label className="block text-[#00FF41] mb-1 font-bold">System Persona Prompt:</label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Specify the precise system instructions and persona directives for this agent..."
              rows={4}
              required
              className="w-full bg-black border border-[#00FF41]/40 rounded p-2 text-[#00FF41] focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-[#00FF41] mb-1 font-bold">Agent Badge Accent Color:</label>
            <div className="flex gap-2">
              {['#00FF41', '#A855F7', '#38BDF8', '#F59E0B', '#EC4899'].map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setColorHex(hex)}
                  style={{ backgroundColor: hex }}
                  className={`w-7 h-7 rounded-full cursor-pointer transition-transform ${
                    colorHex === hex ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#00FF41]/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-gray-700 text-gray-400 hover:text-white cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-[#00FF41] text-black font-bold hover:bg-[#008F11] hover:text-white cursor-pointer shadow-[0_0_10px_#00FF41]"
            >
              INITIALIZE AGENT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
