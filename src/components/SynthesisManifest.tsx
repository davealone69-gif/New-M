import React, { useState } from 'react';
import {
  Archive,
  Search,
  Star,
  Trash2,
  BookOpen,
  Calendar,
  FileCode,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { BuildArtifact } from '../types';
import { CodeViewer } from './CodeViewer';

interface SynthesisManifestProps {
  artifacts: BuildArtifact[];
  onToggleFavorite: (id: string) => void;
  onDeleteArtifact: (id: string) => void;
  onConvertSkill: (artifact: BuildArtifact) => void;
}

export const SynthesisManifest: React.FC<SynthesisManifestProps> = ({
  artifacts,
  onToggleFavorite,
  onDeleteArtifact,
  onConvertSkill,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(
    artifacts.length > 0 ? artifacts[0].id : null
  );

  const filtered = artifacts.filter((art) => {
    const matchesSearch =
      art.taskName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.generatedCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFav = showFavoritesOnly ? art.isFavorite : true;
    return matchesSearch && matchesFav;
  });

  const activeArtifact = artifacts.find((a) => a.id === selectedArtifactId) || filtered[0];

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="p-4 rounded border border-amber-500/40 bg-black/80 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-amber-500/10 border border-amber-500">
              <Archive className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-amber-400 tracking-wider">
                SYNTHESIS MANIFEST &mdash; BUILD ARCHIVE
              </h2>
              <p className="text-xs text-gray-400">
                Persistent Storage & History of Synthesized Android Code Artifacts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-amber-400 font-bold">TOTAL ARTIFACTS:</span>
            <span className="px-2 py-0.5 rounded bg-black border border-amber-500 text-amber-400 font-bold">
              {artifacts.length}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Favorite Filter Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-black/90 p-3 rounded border border-amber-500/30 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-amber-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search manifest by task name or Kotlin code keyword..."
            className="w-full bg-[#0D0208] border border-amber-500/30 rounded pl-9 pr-3 py-2 text-xs text-amber-200 placeholder-gray-600 focus:outline-none focus:border-amber-400"
          />
        </div>

        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded transition cursor-pointer border ${
            showFavoritesOnly
              ? 'bg-amber-500 text-black font-bold border-amber-400'
              : 'bg-black text-amber-400 border-amber-500/40 hover:border-amber-400'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
          <span>FAVORITES ONLY</span>
        </button>
      </div>

      {/* Split View Layout */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center border border-amber-500/20 rounded bg-black/60 text-gray-400 text-xs space-y-2">
          <Archive className="w-8 h-8 text-amber-500/40 mx-auto" />
          <p>No build artifacts found matching filter query.</p>
          <p className="text-[11px] text-gray-500">Run the Swarm Builder to synthesize new code artifacts!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Artifact List */}
          <div className="space-y-3 lg:col-span-1 max-h-[600px] overflow-y-auto pr-1">
            {filtered.map((art) => {
              const isSelected = activeArtifact?.id === art.id;
              return (
                <div
                  key={art.id}
                  onClick={() => setSelectedArtifactId(art.id)}
                  className={`p-3 rounded border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-amber-950/30 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)] text-amber-200'
                      : 'bg-black/80 border-gray-800 text-gray-400 hover:border-amber-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-xs text-amber-400 leading-snug">
                      {art.taskName}
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(art.id);
                      }}
                      className="text-amber-400 hover:text-amber-300 p-1 cursor-pointer shrink-0"
                    >
                      <Star className={`w-3.5 h-3.5 ${art.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-900">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-500" />
                      {new Date(art.timestamp).toLocaleDateString()}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-black border border-amber-500/30 text-amber-300 font-mono">
                      {art.modelUsed}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Artifact Code Inspector */}
          {activeArtifact && (
            <div className="lg:col-span-2 space-y-3 p-4 rounded border border-amber-500/30 bg-black/90">
              <div className="flex items-center justify-between gap-3 flex-wrap border-b border-amber-500/20 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-amber-400">{activeArtifact.taskName}</h3>
                  <p className="text-[11px] text-gray-400">
                    Model: {activeArtifact.modelUsed} &bull; Synthesized:{' '}
                    {new Date(activeArtifact.timestamp).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onConvertSkill(activeArtifact)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-emerald-500/20 border border-emerald-500 text-emerald-300 hover:bg-emerald-500/30 text-xs transition cursor-pointer"
                    title="Convert this code pattern into an active Training Centre Skill"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>LEARN AS SKILL</span>
                  </button>

                  <button
                    onClick={() => onDeleteArtifact(activeArtifact.id)}
                    className="p-1.5 rounded bg-red-950/40 border border-red-500/50 text-red-400 hover:text-red-200 text-xs transition cursor-pointer"
                    title="Delete Artifact"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Code Viewer */}
              <CodeViewer
                code={activeArtifact.generatedCode}
                filename={`${activeArtifact.taskName.replace(/[^a-zA-Z0-9]/g, '_')}.kt`}
                language="kotlin"
                maxHeight="max-h-[450px]"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
