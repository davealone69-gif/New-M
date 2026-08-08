import React, { useState } from 'react';
import { HardDrive, Wifi, WifiOff, Download, CheckCircle2, Shield, RefreshCw } from 'lucide-react';

interface OfflineCoreManagerProps {
  isOnline: boolean;
  setIsOnline: (val: boolean) => void;
}

export const OfflineCoreManager: React.FC<OfflineCoreManagerProps> = ({
  isOnline,
  setIsOnline,
}) => {
  const [modelLoaded, setModelLoaded] = useState(true);
  const [modelName, setModelName] = useState('gemma-2b-it-quantized.bin');
  const [modelSize] = useState('1.3 GB');
  const [simulatedEngineStatus, setSimulatedEngineStatus] = useState('READY');

  const handleSimulateLoadModel = () => {
    setSimulatedEngineStatus('LOADING_INTO_MEMORY');
    setTimeout(() => {
      setModelLoaded(true);
      setSimulatedEngineStatus('READY');
    }, 1200);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="p-4 rounded border border-blue-500/40 bg-black/80 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-blue-500/10 border border-blue-500">
              <HardDrive className="w-6 h-6 text-blue-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-blue-400 tracking-wider">
                OFFLINE ENGINE &mdash; MEDIAPIPE ON-DEVICE CORE
              </h2>
              <p className="text-xs text-gray-400">
                Zero-Latency On-Device Code Generation & Privacy-Preserving Inference
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-2 px-4 py-2 rounded font-bold transition cursor-pointer border ${
              !isOnline
                ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_10px_#F59E0B]'
                : 'bg-black text-blue-400 border-blue-500 hover:border-blue-400'
            }`}
          >
            {!isOnline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
            <span>{isOnline ? 'SWITCH TO OFFLINE MODE' : 'OFFLINE MODE ACTIVE'}</span>
          </button>
        </div>
      </div>

      {/* On-Device Model Card */}
      <div className="p-4 rounded border border-blue-500/30 bg-black/90 space-y-4">
        <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
          <div className="flex items-center gap-2 text-blue-300 font-bold">
            <Shield className="w-4 h-4 text-blue-400" />
            <span>QUANTIZED ON-DEVICE MODEL STATUS</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500 text-blue-300 font-bold">
            STATUS: {simulatedEngineStatus}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 rounded bg-[#0D0208] border border-gray-800 space-y-1">
            <div className="text-gray-500 text-[10px]">ACTIVE LOCAL BINARY</div>
            <div className="font-bold text-blue-400">{modelName}</div>
          </div>

          <div className="p-3 rounded bg-[#0D0208] border border-gray-800 space-y-1">
            <div className="text-gray-500 text-[10px]">MEMORY FOOTPRINT</div>
            <div className="font-bold text-blue-400">{modelSize}</div>
          </div>

          <div className="p-3 rounded bg-[#0D0208] border border-gray-800 space-y-1">
            <div className="text-gray-500 text-[10px]">INFERENCE ENGINE</div>
            <div className="font-bold text-blue-400">Google MediaPipe GenAI C++</div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
          <div className="flex items-center gap-2 text-emerald-400 text-[11px]">
            <CheckCircle2 className="w-4 h-4" />
            <span>Offline Fallback Active: System prompts & training skills remain 100% on-device</span>
          </div>

          <button
            onClick={handleSimulateLoadModel}
            className="flex items-center gap-2 px-4 py-2 rounded bg-blue-500 text-black font-bold hover:bg-blue-400 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>RE-INITIALIZE MEMORY ENGINE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
