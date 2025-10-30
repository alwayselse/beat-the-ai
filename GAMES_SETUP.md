# Beat The AI - Complete Setup

## ✅ ALL 4 GAMES FULLY FUNCTIONAL

All games now use **AI-powered backend** with optimized prompts for cost and fun!

### 🎮 Games Available:

#### 1. **20 Questions** (`/game/20q`)
- Player thinks of an object
- AI asks 10 yes/no questions
- AI makes final guess on question 10
- **Win condition**: AI guesses wrong

#### 2. **Two Truths & a Hallucination** (`/game/truths`)
- AI generates 3 facts (2 true, 1 false) per round
- 10 rounds total
- Player identifies the fake fact
- **Win condition**: 7/10 correct

#### 3. **The Literal Genie** (`/game/genie`)
- Player makes a wish
- AI twists it using loopholes
- 3 attempts to craft a perfect wish
- **Win condition**: Make 1 untwistable wish

#### 4. **The Common Link** (`/game/commonlink`)
- AI gives 3 items + 2 possible connections
- 1 correct, 1 trap answer
- 10 rounds total
- **Win condition**: 7/10 correct

---

## 🚀 API Endpoints

### `/api/gemini-20q` - 20 Questions
**Input:**
```json
{
  "history": [{"role": "user|ai", "content": "..."}],
  "secret": "player's secret object",
  "questionCount": 1-10
}
```
**Output:**
```json
{
  "response": "AI's question or FINAL GUESS: ..."
}
```

### `/api/gemini-truths` - Two Truths
**Input:** `POST` (no body needed)
**Output:**
```json
{
  "topic": "Topic name",
  "facts": [
    {"text": "...", "isTrue": true/false}
  ],
  "explanation": "..."
}
```

### `/api/gemini-genie` - Literal Genie
**Input:**
```json
{
  "wish": "player's wish",
  "attemptNumber": 1-3
}
```
**Output:**
```json
{
  "response": "AI's twisted interpretation or defeat",
  "playerWon": true/false
}
```

### `/api/gemini-commonlink` - Common Link
**Input:** `POST` (no body needed)
**Output:**
```json
{
  "items": ["Item1", "Item2", "Item3"],
  "question": "What is the common link?",
  "correctLink": {"text": "...", "explanation": "..."},
  "trapLink": {"text": "...", "explanation": "..."}
}
```

---

## 💰 Cost Optimization

### Prompt Design:
- ✅ Short, focused prompts (under 100 words)
- ✅ Gemini 1.5 Flash (cheapest model)
- ✅ JSON-only responses (no extra text)
- ✅ Single API call per interaction

### Token Estimates:
- **20Q**: ~150 tokens/question × 10 = 1,500 tokens/game
- **Two Truths**: ~200 tokens × 10 puzzles = 2,000 tokens/game
- **Genie**: ~180 tokens × 3 attempts = 540 tokens/game
- **Common Link**: ~250 tokens × 10 puzzles = 2,500 tokens/game

**Average game**: ~1,600 tokens = **$0.00002 per game** (Gemini Flash pricing)

---

## 🎯 Scoring System

All games update the global **Human vs AI** scoreboard:

- **Player wins**: `incrementGlobalScore('human')`
- **AI wins**: `incrementGlobalScore('ai')`

Scores persist via:
- Upstash Redis (global, cross-device)
- LocalStorage (individual stats, streaks)

---

## 🧪 Testing

1. Start dev server: `npm run dev`
2. Visit: `http://localhost:5174`
3. Enter your name
4. All 4 games are playable!

---

## 📝 Environment Variables Required

Add to Vercel:
```
GEMINI_API_KEY=your_key_here
beatai_REDIS_URL=your_upstash_url
beatai_KV_REST_API_TOKEN=your_token
beatai_KV_REST_API_READ_ONLY_TOKEN=your_readonly_token
```

---

## 🎨 Game Design

- **Neubrutalism theme** (bold shadows, bright colors, thick borders)
- **Responsive** (mobile-friendly)
- **Loading states** for all AI calls
- **Error handling** with fallbacks
- **Progress tracking** (question counts, attempts)

---

## 🔥 Next Steps

1. ✅ Test all 4 games locally
2. ✅ Commit and push to GitHub
3. ✅ Vercel auto-deploys
4. ✅ Share and get feedback!

**All games are ready to play! 🎉**
