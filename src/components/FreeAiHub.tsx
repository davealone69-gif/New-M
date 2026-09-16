import React, { useState } from 'react';
import { Bot, Send, Cpu, User, AlertCircle, Radio } from 'lucide-react';
import { ChatMessageUI, FreeModel } from '../types';
import { FREE_MODELS_REGISTRY } from '../data/modelsRegistry';
import { apiFetch } from '../lib/api';

interface FreeAiHubProps { isOnline: boolean; }
export const FreeAiHub: React.FC<FreeAiHubProps> = ({ isOnline }) => {
  const [selectedModel, setSelectedModel] = useState<FreeModel>(FREE_MODELS_REGISTRY[0]);
  const [inputMsg, setInputMsg] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful assistant inside Mandela Matrix OS.');
  const [chatHistory, setChatHistory] = useState<ChatMessageUI[]>([{ id:'welcome-1', sender:'System', provider:'Mandela Matrix OS', text:'Free AI & LLM Hub Initialized.', isUser:false, timestamp:Date.now() }]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSendMessage = async () => {
    if (!inputMsg.trim() || isLoading) return;
    if (!isOnline) { setErrorMsg('ONLINE CORE is OFF. Enable it before using a remote provider.'); return; }
    const userText=inputMsg; setInputMsg(''); setErrorMsg(null);
    setChatHistory(p=>[...p,{id:'user-'+Date.now(),sender:'User',provider:'Local Terminal',text:userText,isUser:true,timestamp:Date.now()}]); setIsLoading(true);
    try {
      const response=await apiFetch('/api/llm/completion',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({provider:selectedModel.provider,model:selectedModel.id,systemPrompt,userPrompt:userText})});
      const text=await response.text(); let data:any={}; try{data=text?JSON.parse(text):{}}catch{throw new Error(`Backend returned invalid JSON (HTTP ${response.status}).`)}
      if(!response.ok) throw new Error(data.error||`LLM request failed (HTTP ${response.status}).`);
      setChatHistory(p=>[...p,{id:'ai-'+Date.now(),sender:selectedModel.name,provider:data.provider||selectedModel.provider,text:data.content||'',isUser:false,timestamp:Date.now()}]);
    } catch(err:any){console.error(err);setErrorMsg(err?.message||'Backend connection failed.');} finally{setIsLoading(false);}
  };

  return <div className="space-y-6 font-mono">
    <div className="p-4 rounded border border-cyan-500/40 bg-black/80"><div className="flex items-center gap-3"><Bot className="w-6 h-6 text-cyan-400"/><div><h2 className="text-base font-bold text-cyan-400">FREE AI & LLM MULTI-PROVIDER HUB</h2><p className="text-xs text-gray-400">Gemini • Groq • OpenRouter • Hugging Face • Local</p></div></div></div>
    <div className="p-3 rounded border border-cyan-500/20 bg-cyan-950/20"><select value={selectedModel.id} onChange={e=>{const f=FREE_MODELS_REGISTRY.find(m=>m.id===e.target.value);if(f)setSelectedModel(f)}} className="w-full bg-black border border-cyan-500/50 text-cyan-300 text-xs p-2 rounded">{FREE_MODELS_REGISTRY.map(m=><option key={m.id} value={m.id}>{m.name} ({m.provider})</option>)}</select><textarea value={systemPrompt} onChange={e=>setSystemPrompt(e.target.value)} className="w-full mt-2 bg-black border border-cyan-500/30 text-gray-300 text-xs p-2 rounded" rows={2}/></div>
    <div className="p-4 rounded border border-cyan-500/30 bg-black/90 space-y-4 min-h-[350px] max-h-[500px] overflow-y-auto">{chatHistory.map(msg=><div key={msg.id} className="p-3 rounded border border-cyan-500/20 text-xs"><b>{msg.isUser?'USER':'AI'} · {msg.provider}</b><div className="whitespace-pre-wrap mt-2">{msg.text}</div></div>)}{isLoading&&<div className="text-cyan-400 animate-pulse"><Cpu className="inline w-4 h-4"/> Processing...</div>}</div>
    {errorMsg&&<div className="p-3 rounded border border-red-500/50 bg-red-950/30 text-red-300 text-xs"><AlertCircle className="inline w-4 h-4 mr-2"/>{errorMsg}</div>}
    <div className="flex gap-2"><input value={inputMsg} onChange={e=>setInputMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!isLoading&&handleSendMessage()} placeholder={`Send prompt to ${selectedModel.name}...`} className="flex-1 bg-[#0D0208] border border-cyan-500/40 rounded px-3 py-2 text-xs text-cyan-200"/><button onClick={handleSendMessage} disabled={isLoading||!inputMsg.trim()} className="px-5 py-2 rounded bg-cyan-500 text-black font-bold text-xs disabled:opacity-50"><Send className="inline w-4 h-4 mr-1"/>SEND</button></div>
    <div className="text-[10px] text-gray-500"><Radio className="inline w-3 h-3"/> {selectedModel.provider} · {selectedModel.id}</div>
  </div>;
};
