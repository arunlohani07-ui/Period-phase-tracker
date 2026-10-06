import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

app.use(express.json({ limit: '32kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const responseSchema = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    whatItMayMean: { type: 'string' },
    howToRespond: { type: 'string' },
    whatToSay: { type: 'string' },
    avoid: { type: 'array', items: { type: 'string' } }
  },
  required: ['summary', 'whatItMayMean', 'howToRespond', 'whatToSay', 'avoid']
};

const SYSTEM = `You are Sanu Companion, a calm, respectful relationship-support assistant inside a private menstrual-cycle companion app. You are not a doctor and never diagnose medical conditions. Cycle phase is context only: never claim a phase causes a person's mood, personality, behavior, pain, or relationship behavior. Say that people vary and prioritize what the person actually says and does. Use only the context supplied by the user. Never claim to know what another person is thinking. Use phrases like “based on what you shared”, “one possibility”, and “ask rather than assume”. If severe, unusual, worsening, or concerning symptoms are described, recommend contacting a trusted adult or qualified healthcare professional rather than diagnosing. Keep answers concise, practical, non-judgmental, and emotionally intelligent. Match the user's language naturally, including English, Nepali, or Roman Nepali. Return only valid JSON matching the provided schema.`;

function safe(v, max = 1200) { return typeof v === 'string' ? v.slice(0, max) : ''; }
function compactContext(body) {
  return {
    cycleDay: Number.isFinite(body.cycleDay) ? body.cycleDay : null,
    phase: safe(body.phase, 40), mood: safe(body.mood, 80),
    symptoms: Array.isArray(body.symptoms) ? body.symptoms.slice(0, 12).map(x => safe(x, 80)) : [],
    notes: safe(body.notes), userMessage: safe(body.userMessage),
    relationshipPreferences: safe(body.relationshipPreferences, 1200)
  };
}

app.get('/api/health', (_req, res) => res.json({ ok: true, aiConfigured: Boolean(ai), model: 'gemini-3.8-flash' }));

app.post('/api/ai', async (req, res) => {
  const context = compactContext(req.body || {});
  if (!context.userMessage.trim()) return res.status(400).json({ error: 'Please describe what happened or ask a question.' });
  if (!ai) return res.status(503).json({ error: 'Gemini is not configured. Add GEMINI_API_KEY to .env to enable Ask AI.' });

  const prompt = `${SYSTEM}\n\nUSER CONTEXT (may be incomplete):\n${JSON.stringify(context, null, 2)}\n\nRespond to the user's latest message. Do not infer facts that are not present.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json', responseSchema, temperature: 0.35 }
    });
    const raw = response.text || '{}';
    const data = JSON.parse(raw);
    res.json(data);
  } catch (error) {
    console.error('Gemini error:', error?.message || error);
    res.status(502).json({ error: 'The AI companion could not respond right now. Please try again.' });
  }
});

app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(port, () => console.log(`Ayush Sanu Cycle running at http://localhost:${port}`));
