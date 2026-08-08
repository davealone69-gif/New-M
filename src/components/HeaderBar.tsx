import React from 'react';
import { Cpu, Wifi, WifiOff, Play, Pause, ShieldCheck, Terminal, Zap, Database, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderBarProps {
  isOnline: boolean;
  setIsOnline: (val: boolean) => void;
  activeModel: string;
  rainPaused: boolean;
  setRainPaused: (val: boolean) => void;
  rainSpeed: number;
  setRainSpeed: (speed: number) => void;
  activeSkillsCount: number;
  totalArtifactsCount: number;
  currentUser?: User | null;
  onGoogleLogin?: () => void;
  onLogout?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  isOnline,
  setIsOnline,
  activeModel,
  rainPaused,
  setRainPaused,
  rainSpeed,
  setRainSpeed,
  activeSkillsCount,
  totalArtifactsCount,
  currentUser,
  onGoogleLogin,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#0D0208]/90 backdrop-blur-md border-b border-[#00FF41]/30 px-4 py-2 text-[#00FF41] font-mono text-xs flex flex-wrap items-center justify-between gap-3 shadow-[0_0_15px_rgba(0,255,65,0.15)]">
      {/* Brand & Matrix Core Identity */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-8 h-8 rounded bg-black border border-[#00FF41] shadow-[0_0_10px_#00FF41]">
          <Terminal className="w-5 h-5 text-[#00FF41] animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold tracking-widest text-sm text-[#00FF41] drop-shadow-[0_0_8px_rgba(0,255,65,0.8)]">
              MANDELA MATRIX OS
            </h1>
            <span className="px-1.5 py-0.5 text-[10px] rounded bg-[#008F11]/20 border border-[#00FF41]/40 text-[#00FF41]">
              v3.8-HYBRID
            </span>
          </div>
          <p className="text-[10px] text-[#008F11] flex items-center gap-1">
            <Zap className="w-3 h-3 text-[#00FF41]" />
            SWARM ORCHESTRATOR &bull; SKILLS: {activeSkillsCount} &bull; ARTIFACTS: {totalArtifactsCount}
          </p>
        </div>
      </div>

      {/* Center Status Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Model Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/80 border border-[#A855F7]/50 text-[#A855F7] shadow-[0_0_8px_rgba(168,85,247,0.2)]">
          <Cpu className="w-3.5 h-3.5 text-[#A855F7]" />
          <span className="font-semibold">{activeModel}</span>
        </div>

        {/* Firebase Sync Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/80 border border-cyan-500/50 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.2)]">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold">FIRESTORE SYNC</span>
        </div>

        {/* User Auth Status */}
        {currentUser ? (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/80 border border-emerald-500/50 text-emerald-400">
            <UserIcon className="w-3.5 h-3.5" />
            <span className="text-[10px]">
              {currentUser.isAnonymous ? 'ANON ACTIVE' : currentUser.email || 'AUTHENTICATED'}
            </span>
            {currentUser.isAnonymous ? (
              <button
                onClick={onGoogleLogin}
                className="ml-1 px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/40 text-[10px] flex items-center gap-1 cursor-pointer"
                title="Sign in with Google to sync across devices"
              >
                <LogIn className="w-2.5 h-2.5" /> Google
              </button>
            ) : (
              <button
                onClick={onLogout}
                className="ml-1 p-0.5 text-red-400 hover:text-red-300 transition cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-3 h-3" />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={onGoogleLogin}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-black/80 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold cursor-pointer shadow-[0_0_8px_rgba(16,185,129,0.2)]"
            title="Sign in with Google to enable cloud sync"
          >
            <LogIn className="w-3.5 h-3.5" /> GOOGLE SYNC
          </button>
        )}

        {/* Online / Offline Mode Toggle */}
        <button
          onClick={() => setIsOnline(!isOnline)}
          title="Toggle Network Online vs Offline Local Core Mode"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all cursor-pointer ${
            isOnline
              ? 'bg-[#00FF41]/10 border-[#00FF41] text-[#00FF41] hover:bg-[#00FF41]/20'
              : 'bg-amber-500/10 border-amber-500 text-amber-400 hover:bg-amber-500/20'
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-[#00FF41]" />
              <span>ONLINE CORE</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span>OFFLINE LOCAL</span>
            </>
          )}
        </button>

        {/* Security Shield Badge */}
        <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-black/60 border border-[#008F11]/50 text-[#008F11]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00FF41]" />
          <span>ZERO-MOCK</span>
        </div>
      </div>

      {/* Right Matrix Rain & Visual Controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-black/80 border border-[#00FF41]/30 rounded px-2 py-1">
          <span className="text-[10px] text-[#008F11] hidden md:inline">RAIN:</span>
          <button
            onClick={() => setRainPaused(!rainPaused)}
            className="p-1 text-[#00FF41] hover:text-white transition cursor-pointer"
            title={rainPaused ? 'Resume Digital Rain' : 'Pause Digital Rain'}
          >
            {rainPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          </button>
          <select
            value={rainSpeed}
            onChange={(e) => setRainSpeed(Number(e.target.value))}
            className="bg-transparent text-[#00FF41] text-[10px] focus:outline-none cursor-pointer"
            title="Digital Rain Speed"
          >
            <option value={0.5} className="bg-[#0D0208] text-[#00FF41]">0.5x</option>
            <option value={1} className="bg-[#0D0208] text-[#00FF41]">1.0x</option>
            <option value={2} className="bg-[#0D0208] text-[#00FF41]">2.0x</option>
          </select>
        </div>
      </div>
    </header>
  );
};

