import React, { useState } from 'react';
import { Bot, Send, Cpu, User, RefreshCw, AlertCircle, Radio } from 'lucide-react';
import { ChatMessageUI, FreeModel } from '../types';
import { FREE_MODELS_REGISTRY } from '../data/modelsRegistry';

interface FreeAiHubProps {
  isOnline: boolean;
}

export const FreeAiHub: React.FC<FreeAiHubProps> = ({ isOnline }) => {
  const [selectedModel, setSelectedModel] = useState<FreeModel>(FREE_MODELS_REGISTRY[0]);
  const [inputMsg, setInputMsg] = useState('');
  const [systemPrompt, setSystemPrompt] = useState(
    'You are a helpful assistant inside Mandela Matrix OS.'
  );
  const [chatHistory, setChatHistory] = useState<ChatMessageUI[]>([
    {
      id: 'welcome-1',
      sender: 'System',
      provider: 'Mandela Matrix OS',
      text: 'Free AI & LLM Hub Initialized. Select your model provider (Gemini, Groq, OpenRouter, Hugging Face, or Offline Local) and prompt away.',
      isUser: false,
      timestamp: Date.now(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSendMessage = async () => {
    if (!inputMsg.trim()) return;

    const userText = inputMsg;
    setInputMsg('');
    setErrorMsg(null);

    const userMsgObj: ChatMessageUI = {
      id: 'user-' + Date.now(),
      sender: 'User',
      provider: 'Local Terminal',
      text: userText,
      isUser: true,
      timestamp: Date.now(),
    };

    setChatHistory((prev) => [...prev, userMsgObj]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/llm/completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedModel.provider,
          model: selectedModel.id,
          systemPrompt,
          userPrompt: userText,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'LLM completion request failed.');
      }

      const data = await response.json();

      const aiMsgObj: ChatMessageUI = {
        id: 'ai-' + Date.now(),
        sender: selectedModel.name,
        provider: data.provider || selectedModel.provider,
        text: data.content,
        isUser: false,
        timestamp: Date.now(),
      };

      setChatHistory((prev) => [...prev, aiMsgObj]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to connect to model provider endpoint.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="p-4 rounded border border-cyan-500/40 bg-black/80 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500">
              <Bot className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-cyan-400 tracking-wider">
                FREE AI & LLM MULTI-PROVIDER HUB
              </h2>
              <p className="text-xs text-gray-400">
                Groq (Llama 3 / Gemma 2) &bull; Gemini 3.6 &bull; OpenRouter &bull; Hugging Face &bull; Local Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <select
              value={selectedModel.id}
              onChange={(e) => {
                const found = FREE_MODELS_REGISTRY.find((m) => m.id === e.target.value);
                if (found) setSelectedModel(found);
              }}
              className="bg-black border border-cyan-500/50 text-cyan-300 text-xs p-1.5 rounded focus:outline-none cursor-pointer font-bold"
            >
              {FREE_MODELS_REGISTRY.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.provider})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Model Specs Card */}
      <div className="p-3 rounded border border-cyan-500/20 bg-cyan-950/20 text-xs text-cyan-200 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <span className="font-bold text-cyan-400">SELECTED: {selectedModel.name}</span>
          <p className="text-[11px] text-gray-400">{selectedModel.description}</p>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="px-2 py-0.5 rounded bg-black border border-cyan-500/40 text-cyan-300">
            PROVIDER: {selectedModel.provider}
          </span>
          <span
            className={`px-2 py-0.5 rounded border ${
              selectedModel.isOfflineCapable
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
            }`}
          >
            {selectedModel.isOfflineCapable ? 'OFFLINE READY' : 'ONLINE SERVICE'}
          </span>
        </div>
      </div>

      {/* Chat Conversation History Box */}
      <div className="p-4 rounded border border-cyan-500/30 bg-black/90 space-y-4 min-h-[350px] max-h-[500px] overflow-y-auto">
        {chatHistory.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded border font-mono text-xs space-y-1 ${
              msg.isUser
                ? 'bg-cyan-950/20 border-cyan-500/40 text-cyan-100 ml-6'
                : 'bg-black border-emerald-500/40 text-emerald-300 mr-6'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] text-gray-400 border-b border-gray-800 pb-1">
              <span className="font-bold flex items-center gap-1">
                {msg.isUser ? <User className="w-3 h-3 text-cyan-400" /> : <Bot className="w-3 h-3 text-emerald-400" />}
                【{msg.sender}】 ({msg.provider})
              </span>
              <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="whitespace-pre-wrap leading-relaxed pt-1">{msg.text}</div>
          </div>
        ))}

        {isLoading && (
          <div className="p-3 rounded border border-cyan-500/30 bg-black text-cyan-400 text-xs flex items-center gap-2 animate-pulse">
            <Cpu className="w-4 h-4 animate-spin" />
            <span>Connecting to {selectedModel.name}... Processing token generation stream...</span>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 rounded border border-red-500/50 bg-red-950/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Input Message Area */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
          placeholder={`Send prompt to ${selectedModel.name}...`}
          className="flex-1 bg-[#0D0208] border border-cyan-500/40 rounded px-3 py-2 text-xs text-cyan-200 placeholder-gray-600 focus:outline-none focus:border-cyan-400 font-mono"
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || !inputMsg.trim()}
          className="px-5 py-2 rounded bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>SEND</span>
        </button>
      </div>
    </div>
  );
};
