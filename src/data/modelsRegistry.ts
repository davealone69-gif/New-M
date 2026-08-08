import { FreeModel } from '../types';

export const FREE_MODELS_REGISTRY: FreeModel[] = [
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash (Core Brain)',
    provider: 'Gemini',
    description: 'Google DeepMind fast reasoning & multimodal engine for matrix synthesis.',
    isOfflineCapable: false
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro (Deep Architect)',
    provider: 'Gemini',
    description: 'Advanced reasoning and complex system architecture design.',
    isOfflineCapable: false
  },
  {
    id: 'llama3-70b-8192',
    name: 'Groq Llama 3 (70B Fast)',
    provider: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1/',
    apiEnvKey: 'GROQ_API_KEY',
    description: 'Ultra-high-speed inference engine delivering 300+ tokens/sec.',
    isOfflineCapable: false
  },
  {
    id: 'llama3-8b-8192',
    name: 'Groq Llama 3 (8B)',
    provider: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1/',
    apiEnvKey: 'GROQ_API_KEY',
    description: 'Lightweight high-speed Llama 3 model for rapid iteration.',
    isOfflineCapable: false
  },
  {
    id: 'gemma2-9b-it',
    name: 'Groq Gemma 2 (9B)',
    provider: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1/',
    apiEnvKey: 'GROQ_API_KEY',
    description: 'Google open weights Gemma 2 model running at high speed.',
    isOfflineCapable: false
  },
  {
    id: 'openrouter/free',
    name: 'OpenRouter Free (Auto Router)',
    provider: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1/',
    apiEnvKey: 'OPENROUTER_API_KEY',
    description: 'Zero-cost dynamic router connecting to available open LLM models.',
    isOfflineCapable: false
  },
  {
    id: 'HuggingFaceH4/zephyr-7b-beta',
    name: 'Zephyr 7B Beta (Hugging Face)',
    provider: 'Hugging Face',
    baseUrl: 'https://api-inference.huggingface.co/v1/',
    apiEnvKey: 'HF_TOKEN',
    description: 'Community-tuned open assistant model hosted on Hugging Face.',
    isOfflineCapable: false
  },
  {
    id: 'local-gemma-2b-quantized',
    name: 'Local Offline Gemma 2B (MediaPipe Engine)',
    provider: 'Local Offline',
    description: 'Runs on-device without internet connection. Total privacy and zero latency.',
    isOfflineCapable: true
  }
];
