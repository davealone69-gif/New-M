import React, { useState, useEffect } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { Navigation, NavTab } from './components/Navigation';
import { MatrixRain } from './components/MatrixRain';
import { SwarmBuilder } from './components/SwarmBuilder';
import { GeminiSynthesis } from './components/GeminiSynthesis';
import { FreeAiHub } from './components/FreeAiHub';
import { TrainingCentre } from './components/TrainingCentre';
import { SynthesisManifest } from './components/SynthesisManifest';
import { CustomAgentDialog } from './components/CustomAgentDialog';
import { OfflineCoreManager } from './components/OfflineCoreManager';
import { ProjectExporter } from './components/ProjectExporter';

import { Skill, CustomAgent, BuildArtifact } from './types';
import { PRESET_SKILLS } from './data/skillsDefaults';
import { User } from 'firebase/auth';
import {
  db,
  initAuthListener,
  loginWithGoogle,
  logoutUser,
  testConnection,
  handleFirestoreError,
  OperationType,
} from './lib/firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('swarm');
  const [isOnline, setIsOnline] = useState(true);

  // Digital Rain animation controls
  const [rainPaused, setRainPaused] = useState(false);
  const [rainSpeed, setRainSpeed] = useState(1);

  // Auth user state
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Preset default custom agents
  const defaultCustomAgents: CustomAgent[] = [
    {
      id: 'agent-pre-1',
      name: 'Android UI Architect',
      systemPrompt:
        'You are an expert Android UI Architect. Enforce Jetpack Compose, state hoisting, Scaffold padding, and Material 3 design tokens.',
      colorHex: '#00FF41',
      isActive: true,
    },
    {
      id: 'agent-pre-2',
      name: 'Security & Audit Specialist',
      systemPrompt:
        'You are a Security Gate Auditor. Check for exposed secrets, unhandled network exceptions, and memory leaks.',
      colorHex: '#A855F7',
      isActive: true,
    },
  ];

  // Preset default artifacts
  const defaultArtifacts: BuildArtifact[] = [
    {
      id: 'art-1',
      taskName: 'Todo App with Room Database & Scaffold',
      timestamp: Date.now() - 3600000,
      modelUsed: 'gemini-3.6-flash',
      isFavorite: true,
      language: 'kotlin',
      generatedCode: `// Mandela Matrix OS Synthesized Component
package com.mandela.matrixos.todo

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "todo_items")
data class TodoEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val title: String,
    val isDone: Boolean = false
)

@Dao
interface TodoDao {
    @Query("SELECT * FROM todo_items ORDER BY id DESC")
    fun getAllTodos(): Flow<List<TodoEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTodo(todo: TodoEntity)

    @Delete
    suspend fun deleteTodo(todo: TodoEntity)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TodoScreen() {
    Scaffold(
        topBar = { TopAppBar(title = { Text("Mandela Matrix Todo Engine") }) }
    ) { paddingValues ->
        Column(
            modifier = Modifier.fillMaxSize().padding(paddingValues).padding(16.dp)
        ) {
            Text("Mandela Matrix OS - Room Persistent Core", style = MaterialTheme.typography.titleMedium)
        }
    }
}`,
    },
    {
      id: 'art-2',
      taskName: 'Offline Note Taking App with ViewModel',
      timestamp: Date.now() - 7200000,
      modelUsed: 'Groq/Llama3-70b',
      isFavorite: false,
      language: 'kotlin',
      generatedCode: `// Offline Note Engine
package com.mandela.matrixos.notes

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

data class Note(val id: String, val title: String, val content: String)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotesScreen() {
    Scaffold(
        topBar = { TopAppBar(title = { Text("Offline Matrix Notes") }) }
    ) { paddingValues ->
        Column(modifier = Modifier.fillMaxSize().padding(paddingValues).padding(16.dp)) {
            Text("Offline Mode Active - Zero Latency Local Engine")
        }
    }
}`,
    },
  ];

  // State
  const [skills, setSkills] = useState<Skill[]>(PRESET_SKILLS);
  const [customAgents, setCustomAgents] = useState<CustomAgent[]>(defaultCustomAgents);
  const [artifacts, setArtifacts] = useState<BuildArtifact[]>(defaultArtifacts);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);

  // 1. Connection test on boot
  useEffect(() => {
    testConnection();
  }, []);

  // 2. Auth listener
  useEffect(() => {
    const unsubscribe = initAuthListener((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 3. Firestore Realtime Sync
  useEffect(() => {
    if (!currentUser) return;

    const userId = currentUser.uid;

    // A. Sync Custom Agents
    const agentsPath = 'customAgents';
    const agentsQuery = query(
      collection(db, agentsPath),
      where('userId', '==', userId)
    );
    const unsubAgents = onSnapshot(
      agentsQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: CustomAgent[] = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: data.id,
              name: data.name,
              systemPrompt: data.systemPrompt,
              colorHex: data.colorHex,
              isActive: data.isActive,
            };
          });
          setCustomAgents(loaded);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, agentsPath);
      }
    );

    // B. Sync Artifacts
    const artifactsPath = 'artifacts';
    const artifactsQuery = query(
      collection(db, artifactsPath),
      where('userId', '==', userId)
    );
    const unsubArtifacts = onSnapshot(
      artifactsQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: BuildArtifact[] = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: data.id,
              taskName: data.taskName,
              timestamp: data.timestamp,
              modelUsed: data.modelUsed,
              isFavorite: data.isFavorite,
              language: data.language,
              generatedCode: data.generatedCode,
            };
          });
          setArtifacts(loaded);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, artifactsPath);
      }
    );

    // C. Sync Skills
    const skillsPath = 'skills';
    const skillsQuery = query(
      collection(db, skillsPath),
      where('userId', '==', userId)
    );
    const unsubSkills = onSnapshot(
      skillsQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: Skill[] = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: data.id,
              title: data.title,
              category: data.category,
              description: data.description,
              promptSnippet: data.promptSnippet,
              isActive: data.isActive,
            };
          });
          setSkills(loaded);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, skillsPath);
      }
    );

    return () => {
      unsubAgents();
      unsubArtifacts();
      unsubSkills();
    };
  }, [currentUser]);

  // Skill Handlers with Firestore persistence
  const handleToggleSkill = async (id: string) => {
    const updated = skills.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s));
    setSkills(updated);

    if (currentUser) {
      const target = updated.find((s) => s.id === id);
      if (target) {
        const path = `skills/${target.id}`;
        try {
          await setDoc(doc(db, 'skills', target.id), {
            ...target,
            userId: currentUser.uid,
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, path);
        }
      }
    }
  };

  const handleAddSkill = async (skill: Skill) => {
    setSkills((prev) => [skill, ...prev]);

    if (currentUser) {
      const path = `skills/${skill.id}`;
      try {
        await setDoc(doc(db, 'skills', skill.id), {
          ...skill,
          userId: currentUser.uid,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  };

  const handleDeleteSkill = async (id: string) => {
    setSkills((prev) => prev.filter((s) => s.id !== id));

    if (currentUser) {
      const path = `skills/${id}`;
      try {
        await deleteDoc(doc(db, 'skills', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  };

  // Artifact Handlers with Firestore persistence
  const handleSaveArtifact = async (art: BuildArtifact) => {
    setArtifacts((prev) => [art, ...prev]);

    if (currentUser) {
      const path = `artifacts/${art.id}`;
      try {
        await setDoc(doc(db, 'artifacts', art.id), {
          ...art,
          userId: currentUser.uid,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  };

  const handleToggleFavoriteArtifact = async (id: string) => {
    const updated = artifacts.map((a) => (a.id === id ? { ...a, isFavorite: !a.isFavorite } : a));
    setArtifacts(updated);

    if (currentUser) {
      const target = updated.find((a) => a.id === id);
      if (target) {
        const path = `artifacts/${target.id}`;
        try {
          await setDoc(doc(db, 'artifacts', target.id), {
            ...target,
            userId: currentUser.uid,
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, path);
        }
      }
    }
  };

  const handleDeleteArtifact = async (id: string) => {
    setArtifacts((prev) => prev.filter((a) => a.id !== id));

    if (currentUser) {
      const path = `artifacts/${id}`;
      try {
        await deleteDoc(doc(db, 'artifacts', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  };

  const handleConvertArtifactToSkill = (art: BuildArtifact) => {
    const newSkill: Skill = {
      id: 'skill-' + Date.now(),
      title: `Pattern: ${art.taskName.slice(0, 30)}`,
      category: 'Architecture',
      description: `Synthesized from build artifact: ${art.taskName}`,
      promptSnippet: `Synthesized Code Standard:\n${art.generatedCode.slice(0, 400)}...`,
      isActive: true,
    };
    handleAddSkill(newSkill);
    setActiveTab('training');
  };

  // Agent Handlers with Firestore persistence
  const handleSaveCustomAgent = async (agent: CustomAgent) => {
    setCustomAgents((prev) => [...prev, agent]);

    if (currentUser) {
      const path = `customAgents/${agent.id}`;
      try {
        await setDoc(doc(db, 'customAgents', agent.id), {
          ...agent,
          createdAt: Date.now(),
          userId: currentUser.uid,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  };

  const activeSkillsCount = skills.filter((s) => s.isActive).length;

  return (
    <div className="min-h-screen bg-[#0D0208] text-[#00FF41] font-mono relative flex flex-col selection:bg-[#00FF41] selection:text-black overflow-x-hidden">
      {/* Background Matrix Rain Animation */}
      <MatrixRain speed={rainSpeed} isPaused={rainPaused} />

      {/* Persistent Terminal Header */}
      <HeaderBar
        isOnline={isOnline}
        setIsOnline={setIsOnline}
        activeModel={
          activeTab === 'synthesis'
            ? 'Gemini 3.6 Flash'
            : activeTab === 'free_ai'
            ? 'Free AI Hub'
            : 'Swarm Orchestrator'
        }
        rainPaused={rainPaused}
        setRainPaused={setRainPaused}
        rainSpeed={rainSpeed}
        setRainSpeed={setRainSpeed}
        activeSkillsCount={activeSkillsCount}
        totalArtifactsCount={artifacts.length}
        currentUser={currentUser}
        onGoogleLogin={loginWithGoogle}
        onLogout={logoutUser}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex flex-col lg:flex-row relative z-10 overflow-hidden">
        {/* Navigation Sidebar / Rail */}
        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeSkillsCount={activeSkillsCount}
          artifactsCount={artifacts.length}
        />

        {/* Tab View Container */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'swarm' && (
            <SwarmBuilder
              customAgents={customAgents}
              activeSkills={skills.filter((s) => s.isActive)}
              onSaveArtifact={handleSaveArtifact}
              onOpenAgentModal={() => setIsAgentModalOpen(true)}
              isOnline={isOnline}
            />
          )}

          {activeTab === 'synthesis' && <GeminiSynthesis />}

          {activeTab === 'free_ai' && <FreeAiHub isOnline={isOnline} />}

          {activeTab === 'training' && (
            <TrainingCentre
              skills={skills}
              onToggleSkill={handleToggleSkill}
              onAddSkill={handleAddSkill}
              onDeleteSkill={handleDeleteSkill}
            />
          )}

          {activeTab === 'manifest' && (
            <SynthesisManifest
              artifacts={artifacts}
              onToggleFavorite={handleToggleFavoriteArtifact}
              onDeleteArtifact={handleDeleteArtifact}
              onConvertSkill={handleConvertArtifactToSkill}
            />
          )}

          {activeTab === 'agents' && (
            <div className="space-y-6">
              <div className="p-4 rounded border border-pink-500/40 bg-black/80 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-base font-bold text-pink-400">CUSTOM AGENT SYNTHESIZER</h2>
                  <p className="text-xs text-gray-400">
                    Create custom agent personas with custom system prompts to swap into the Swarm Builder.
                  </p>
                </div>
                <button
                  onClick={() => setIsAgentModalOpen(true)}
                  className="px-4 py-2 rounded bg-pink-500 text-black font-bold text-xs hover:bg-pink-400 transition cursor-pointer"
                >
                  + SYNTHESIZE NEW AGENT
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customAgents.map((ag) => (
                  <div
                    key={ag.id}
                    className="p-4 rounded border border-pink-500/30 bg-black/90 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-pink-400 text-xs">{ag.name}</span>
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: ag.colorHex }}
                      />
                    </div>
                    <p className="text-xs text-gray-300 font-mono bg-[#0D0208] p-2 rounded border border-gray-800">
                      {ag.systemPrompt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'offline' && (
            <OfflineCoreManager isOnline={isOnline} setIsOnline={setIsOnline} />
          )}

          {activeTab === 'exporter' && <ProjectExporter artifacts={artifacts} />}
        </main>
      </div>

      {/* Synthesize Agent Modal */}
      <CustomAgentDialog
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        onSaveAgent={handleSaveCustomAgent}
      />
    </div>
  );
}
