import { FreeModel } from '../types';

export const FREE_MODELS_REGISTRY: FreeModel[] = [
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash (Core Brain)',
    provider: 'Gemini',
    description: 'Google Gemini 3.6 Flash fast reasoning and multimodal engine.',
    isOfflineCapable: false
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro (Deep Architect)',
    provider: 'Gemini',
    description: 'Advanced Gemini reasoning for complex architecture and coding.',
    isOfflineCapable: false
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'Groq GPT-OSS 20B',
    provider: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1/',
    apiEnvKey: 'GROQ_API_KEY',
    description: 'Fast open-weight reasoning model hosted by Groq.',
    isOfflineCapable: false
  },
  {
    id: 'openai/gpt-oss-120b',
    name: 'Groq GPT-OSS 120B',
    provider: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1/',
    apiEnvKey: 'GROQ_API_KEY',
    description: 'Large open-weight reasoning model hosted by Groq.',
    isOfflineCapable: false
  },
  {
    id: 'qwen/qwen3.6-27b',
    name: 'Groq Qwen 3.6 27B',
    provider: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1/',
    apiEnvKey: 'GROQ_API_KEY',
    description: 'Qwen 3.6 27B hosted on Groq for coding and reasoning.',
    isOfflineCapable: false
  },
  {
    id: 'openrouter/free',
    name: 'OpenRouter Free (Auto Router)',
    provider: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1/',
    apiEnvKey: 'OPENROUTER_API_KEY',
    description: 'OpenRouter free-model router. Availability is provider-controlled.',
    isOfflineCapable: false
  },
  {
    id: 'HuggingFaceH4/zephyr-7b-beta',
    name: 'Zephyr 7B Beta (Hugging Face)',
    provider: 'Hugging Face',
    baseUrl: 'https://router.huggingface.co/v1/',
    apiEnvKey: 'HF_TOKEN',
    description: 'Hugging Face hosted chat model through the OpenAI-compatible router.',
    isOfflineCapable: false
  },
  {
    id: 'local-gemma-2b-quantized',
    name: 'Local Offline Gemma 2B (On-Device)',
    provider: 'Local Offline',
    description: 'Reserved for a real on-device inference engine. No simulated responses.',
    isOfflineCapable: true
  }
];
