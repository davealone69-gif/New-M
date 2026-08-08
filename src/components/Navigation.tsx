import React from 'react';
import {
  Cpu,
  Sparkles,
  Bot,
  BookOpen,
  Archive,
  Users,
  HardDrive,
  FolderGit2,
} from 'lucide-react';

export type NavTab =
  | 'swarm'
  | 'synthesis'
  | 'free_ai'
  | 'training'
  | 'manifest'
  | 'agents'
  | 'offline'
  | 'exporter';

interface NavigationProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  activeSkillsCount: number;
  artifactsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  activeSkillsCount,
  artifactsCount,
}) => {
  const tabs: {
    id: NavTab;
    label: string;
    sublabel: string;
    icon: React.ElementType;
    badge?: number | string;
    color: string;
  }[] = [
    {
      id: 'swarm',
      label: 'Swarm Builder',
      sublabel: 'Chain-of-Thought Swarm',
      icon: Cpu,
      color: 'text-[#00FF41]',
    },
    {
      id: 'synthesis',
      label: 'Core Synthesis',
      sublabel: 'Gemini Architecture',
      icon: Sparkles,
      color: 'text-[#A855F7]',
    },
    {
      id: 'free_ai',
      label: 'Free LLM Hub',
      sublabel: 'Groq, HF & OpenRouter',
      icon: Bot,
      color: 'text-cyan-400',
    },
    {
      id: 'training',
      label: 'Training Centre',
      sublabel: 'Skill Injection Rules',
      icon: BookOpen,
      badge: activeSkillsCount,
      color: 'text-emerald-400',
    },
    {
      id: 'manifest',
      label: 'Synthesis Manifest',
      sublabel: 'Build Artifacts Archive',
      icon: Archive,
      badge: artifactsCount,
      color: 'text-amber-400',
    },
    {
      id: 'agents',
      label: 'Custom Agents',
      sublabel: 'Persona Synthesizer',
      icon: Users,
      color: 'text-pink-400',
    },
    {
      id: 'offline',
      label: 'Offline Engine',
      sublabel: 'MediaPipe On-Device',
      icon: HardDrive,
      color: 'text-blue-400',
    },
    {
      id: 'exporter',
      label: 'Android Exporter',
      sublabel: 'Gradle & GitHub CI',
      icon: FolderGit2,
      color: 'text-[#00FF41]',
    },
  ];

  return (
    <nav className="bg-[#0D0208]/95 border-b lg:border-b-0 lg:border-r border-[#00FF41]/20 p-2 font-mono text-xs flex lg:flex-col overflow-x-auto lg:overflow-y-auto shrink-0 z-40">
      <div className="flex lg:flex-col gap-1.5 w-full min-w-max lg:min-w-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded transition-all cursor-pointer text-left ${
                isActive
                  ? 'bg-[#00FF41]/15 border border-[#00FF41] shadow-[0_0_12px_rgba(0,255,65,0.25)] text-white'
                  : 'hover:bg-[#00FF41]/5 border border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <div
                className={`p-1.5 rounded bg-black/60 border ${
                  isActive ? 'border-[#00FF41]' : 'border-gray-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${tab.color}`} />
              </div>
              <div className="hidden sm:block lg:block">
                <div className="font-semibold leading-tight text-xs flex items-center justify-between gap-2">
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#00FF41]/20 border border-[#00FF41]/40 text-[#00FF41]">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-gray-500 font-normal">
                  {tab.sublabel}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
