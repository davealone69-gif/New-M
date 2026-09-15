import express, { Request, Response } from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { config as loadEnv } from 'dotenv';

loadEnv();

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || '*')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '10mb' }));

// The Android WebView is served from appassets.androidplatform.net, while the
// hosted web build normally has its own origin. Allow both without exposing
// credentials through wildcard CORS.
app.use((req: Request, res: Response, next) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes('*')) {
    res.header('Access-Control-Allow-Origin', '*');
  } else if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  }
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured on the backend.');
  return new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'mandela-matrix-os' } },
  });
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

async function openAiCompatibleCompletion(
  url: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  extraHeaders: Record<string, string> = {},
) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  const raw = await response.text();
  let data: any = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = { error: raw || `HTTP ${response.status}` };
  }

  if (!response.ok) {
    const providerError = data?.error?.message || data?.error || `HTTP ${response.status}`;
    throw new Error(String(providerError));
  }

  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Provider returned no completion text.');
  return String(text);
}

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    system: 'Mandela Matrix OS',
    timestamp: Date.now(),
    backendVersion: '4.0',
    geminiAvailable: Boolean(process.env.GEMINI_API_KEY),
    groqAvailable: Boolean(process.env.GROQ_API_KEY),
    openRouterAvailable: Boolean(process.env.OPENROUTER_API_KEY),
    huggingFaceAvailable: Boolean(process.env.HF_TOKEN),
    defaultGeminiModel: DEFAULT_GEMINI_MODEL,
  });
});

app.post('/api/gemini/synthesize', async (req, res) => {
  try {
    const { prompt, systemInstruction, model } = req.body ?? {};
    if (typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const targetModel = typeof model === 'string' && model.trim() ? model : DEFAULT_GEMINI_MODEL;
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: targetModel,
      contents: prompt,
      config: {
        systemInstruction:
          systemInstruction ||
          'You are Gemini inside Mandela Matrix OS. Synthesize clear, structured architectural answers for matrix, core, and build tasks. Use short sections and bullet points when listing steps.',
      },
    });

    res.json({
      result: response.text || 'Gemini returned an empty response.',
      model: targetModel,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Gemini synthesis error:', error);
    res.status(502).json({ error: `Gemini backend error: ${getErrorMessage(error)}` });
  }
});

app.post('/api/swarm/execute', async (req, res) => {
  try {
    const {
      task,
      plannerPrompt,
      coderPrompt,
      criticPrompt,
      activeSkills,
      model,
      customPlanner,
      customCoder,
      customCritic,
    } = req.body ?? {};

    if (typeof task !== 'string' || !task.trim()) {
      return res.status(400).json({ error: 'Task description is required.' });
    }

    const ai = getGeminiClient();
    const targetModel = typeof model === 'string' && model.trim() ? model : DEFAULT_GEMINI_MODEL;
    const history: any[] = [];

    const pPrompt = customPlanner || plannerPrompt ||
      'You are the PLANNER in Mandela Matrix OS Swarm. Break down the user Android/Kotlin/Compose task into a clear 4-5 step architectural plan. Do not write full implementation code yet.';
    const plannerRes = await ai.models.generateContent({
      model: targetModel,
      contents: `Task: ${task}`,
      config: { systemInstruction: pPrompt },
    });
    const planText = plannerRes.text || 'Planner returned an empty response.';
    history.push({ id: 'step-1', agentType: 'PLANNER', agentName: 'Architecture Planner', input: `Task: ${task}`, output: planText, isProcessing: false, timestamp: Date.now() });

    const formattedSkills = Array.isArray(activeSkills) && activeSkills.length
      ? `\n\n--- MANDATORY TRAINING CENTRE CODING STANDARDS ---\n${activeSkills.map((s: any) => `[${s.title} (${s.category})]:\n${s.promptSnippet}`).join('\n\n')}\n--------------------------------------------------\n`
      : '';
    const cPrompt = (customCoder || coderPrompt ||
      'You are the CODER in Mandela Matrix OS. Generate complete, high-quality Kotlin and Jetpack Compose code based on the architectural plan.') + formattedSkills;
    const coderRes = await ai.models.generateContent({
      model: targetModel,
      contents: `Follow this plan carefully:\n${planText}\n\nTask: ${task}`,
      config: { systemInstruction: cPrompt },
    });
    const codeDraft = coderRes.text || 'Coder returned an empty response.';
    history.push({ id: 'step-2', agentType: 'CODER', agentName: 'Kotlin Compose Coder', input: `Plan:\n${planText}`, output: codeDraft, isProcessing: false, timestamp: Date.now() });

    const crPrompt = customCritic || criticPrompt ||
      'You are the CRITIC in Mandela Matrix OS Swarm. Scan the code for state management bugs, missing imports, Room checklist violations, or missing Scaffold padding. Provide specific constructive feedback.';
    const criticRes = await ai.models.generateContent({
      model: targetModel,
      contents: `Audit this code implementation for bugs, state hoisting issues, and missing imports:\n\n${codeDraft}`,
      config: { systemInstruction: crPrompt },
    });
    const criticFeedback = criticRes.text || 'Critic returned an empty response.';
    history.push({ id: 'step-3', agentType: 'CRITIC', agentName: 'Code Quality Gate Critic', input: `Code Draft:\n${codeDraft}`, output: criticFeedback, isProcessing: false, timestamp: Date.now() });

    const refinementRes = await ai.models.generateContent({
      model: targetModel,
      contents: `Original Plan:\n${planText}\n\nDraft Code:\n${codeDraft}\n\nCritic Feedback:\n${criticFeedback}\n\nGenerate the corrected final Kotlin Jetpack Compose implementation. Include package declarations and imports. Do not claim verification that was not performed.`,
      config: { systemInstruction: cPrompt },
    });
    const finalCode = refinementRes.text || codeDraft;
    history.push({ id: 'step-4', agentType: 'REFINEMENT', agentName: 'Refinement Specialist', input: `Critic Feedback:\n${criticFeedback}`, output: finalCode, isProcessing: false, timestamp: Date.now() });

    res.json({ taskName: task, finalCode, fullHistory: history, model: targetModel, timestamp: Date.now() });
  } catch (error) {
    console.error('Swarm execution error:', error);
    res.status(502).json({ error: `Swarm backend error: ${getErrorMessage(error)}` });
  }
});

app.post('/api/llm/completion', async (req, res) => {
  try {
    const { provider, model, systemPrompt, userPrompt } = req.body ?? {};
    if (typeof userPrompt !== 'string' || !userPrompt.trim()) {
      return res.status(400).json({ error: 'User prompt is required.' });
    }

    const system = systemPrompt || 'You are an AI assistant in Mandela Matrix OS.';

    if (provider === 'Gemini') {
      const ai = getGeminiClient();
      const targetModel = model || DEFAULT_GEMINI_MODEL;
      const response = await ai.models.generateContent({ model: targetModel, contents: userPrompt, config: { systemInstruction: system } });
      return res.json({ content: response.text || 'Gemini returned an empty response.', provider: 'Gemini', model: targetModel });
    }

    if (provider === 'Groq') {
      if (!process.env.GROQ_API_KEY) return res.status(503).json({ error: 'GROQ_API_KEY is not configured on the backend.' });
      const text = await openAiCompatibleCompletion(
        'https://api.groq.com/openai/v1/chat/completions',
        process.env.GROQ_API_KEY,
        model || 'openai/gpt-oss-20b',
        system,
        userPrompt,
      );
      return res.json({ content: text, provider: 'Groq', model: model || 'openai/gpt-oss-20b' });
    }

    if (provider === 'OpenRouter') {
      if (!process.env.OPENROUTER_API_KEY) return res.status(503).json({ error: 'OPENROUTER_API_KEY is not configured on the backend.' });
      const text = await openAiCompatibleCompletion(
        'https://openrouter.ai/api/v1/chat/completions',
        process.env.OPENROUTER_API_KEY,
        model && model !== 'openrouter/free' ? model : 'openrouter/free',
        system,
        userPrompt,
        { 'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'https://github.com/davealone69-gif/New-M', 'X-Title': 'Mandela Matrix OS' },
      );
      return res.json({ content: text, provider: 'OpenRouter', model: model || 'openrouter/free' });
    }

    if (provider === 'Hugging Face') {
      if (!process.env.HF_TOKEN) return res.status(503).json({ error: 'HF_TOKEN is not configured on the backend.' });
      const text = await openAiCompatibleCompletion(
        'https://router.huggingface.co/v1/chat/completions',
        process.env.HF_TOKEN,
        model || 'HuggingFaceH4/zephyr-7b-beta',
        system,
        userPrompt,
      );
      return res.json({ content: text, provider: 'Hugging Face', model: model || 'HuggingFaceH4/zephyr-7b-beta' });
    }

    if (provider === 'Local Offline') {
      return res.status(503).json({ error: 'Local Offline model execution is not hosted by this Node backend. Use the on-device engine or configure a local OpenAI-compatible endpoint.' });
    }

    return res.status(400).json({ error: `Unsupported provider: ${provider || 'unknown'}` });
  } catch (error) {
    console.error('LLM completion error:', error);
    res.status(502).json({ error: `LLM backend error: ${getErrorMessage(error)}` });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, HOST, () => {
    console.log(`Mandela Matrix OS backend listening on http://${HOST}:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Fatal server startup error:', error);
  process.exit(1);
});
