export enum AgentType {
  PLANNER = 'PLANNER',
  CODER = 'CODER',
  CRITIC = 'CRITIC',
  REFINEMENT = 'REFINEMENT',
  CUSTOM = 'CUSTOM'
}

export interface CustomAgent {
  id: string;
  name: string;
  systemPrompt: string;
  colorHex: string;
  isActive: boolean;
  avatarIcon?: string;
}

export interface SwarmStep {
  id: string;
  agentType: AgentType | string;
  agentName: string;
  input: String;
  output: string;
  isProcessing: boolean;
  timestamp: number;
}

export interface SwarmResult {
  finalCode: string;
  fullHistory: SwarmStep[];
  taskName: string;
}

export interface Skill {
  id: string;
  title: string;
  description: string;
  promptSnippet: string;
  category: 'UI' | 'Database' | 'Architecture' | 'Security' | 'Performance';
  isActive: boolean;
}

export interface BuildArtifact {
  id: string;
  taskName: string;
  generatedCode: string;
  timestamp: number;
  modelUsed: string;
  isFavorite: boolean;
  language: string;
  files?: Array<{ path: string; content: string }>;
}

export interface FreeModel {
  id: string;
  name: string;
  provider: 'Gemini' | 'Groq' | 'OpenRouter' | 'Hugging Face' | 'Local Offline';
  baseUrl?: string;
  apiEnvKey?: string;
  description: string;
  isOfflineCapable?: boolean;
}

export interface ChatMessageUI {
  id: string;
  sender: string;
  provider: string;
  text: string;
  isUser: boolean;
  timestamp: number;
}

export interface AndroidProject {
  appName: string;
  packageName: string;
  minSdk: number;
  targetSdk: number;
  kotlinVersion: string;
  files: Array<{ path: string; content: string }>;
}
