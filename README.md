# Sanu — Private Cycle Companion

A premium, iOS-inspired menstrual cycle + relationship-support companion built for **AYUSH LOHANI — made for his sanu — Mansun**.

## Stack
- Node.js + Express
- Vanilla HTML/CSS/JS frontend
- `@google/genai` server-side SDK
- Gemini `gemini-3.8-flash`
- Local browser storage for cycle/relationship data

## Run in Termux / Linux
```bash
cd AyushSanuCycle
npm install
cp .env.example .env
# put your Gemini API key in .env
npm start
```
Then open `http://localhost:3000`.

## AI endpoint
`POST /api/ai` accepts:
```json
{
  "cycleDay": 12,
  "phase": "Follicular",
  "mood": "Calm",
  "symptoms": [],
  "notes": "",
  "userMessage": "aaja uslai kasari treat garam?",
  "relationshipPreferences": "She prefers gentle check-ins."
}
```

The API key is server-only. The frontend never receives it.

## Production notes
- Add authentication before using a remote database.
- Use HTTPS.
- Keep sensitive cycle data out of URLs and analytics.
- If adding cloud persistence, encrypt sensitive fields and provide account-level deletion.
- Add rate limiting and abuse protection to `/api/ai`.
- Review Google's current Gemini API terms and privacy requirements before public launch.
