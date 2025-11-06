# 🤖 Beat The AI

An interactive web application featuring four AI-powered games where players compete against Google's Gemini AI. Test your logic, creativity, and quick thinking across unique game modes.

## 🎮 Games

### 1. **Two Truths & A Lie**
- Identify which of three statements is the AI's hallucination
- Win with 7/10 correct answers
- Challenge: Detect subtle logical flaws

### 2. **Literal Genie**
- Craft the perfect wish without loopholes
- Win if your wish can't be twisted by the AI
- 3 attempts per game
- Rate limited to 15 games/hour

### 3. **Common Link**
- Find the logical connection between three items
- Win with 7/10 correct answers
- Multiple difficulty levels

### 4. **20 Questions**
- Think of a secret, let the AI guess it in 20 yes/no questions
- Win if the AI fails to guess correctly
- Real-time gameplay with AI reasoning

## ✨ Features

- **Global Scoreboard**: Real-time tracking of humans vs AI wins
- **Player Leaderboard**: Track individual player statistics (wins, games played, win rate)
- **Rate Limiting**: Prevent abuse while allowing fair play
- **Responsive UI**: Beautiful, animated interface
- **Zero Database Setup**: Uses Upstash Redis for instant database

## 🏗️ Architecture

### Frontend
- **React** + **TypeScript** for component development
- **Vite** for fast development and optimized builds
- **Zustand** for state management
- **Tailwind CSS** for styling
- **React Router** for navigation

### Backend
- **Vercel Serverless Functions** for API endpoints
- **Google Gemini API** for AI game logic
- **Upstash Redis** for persistent data storage

### Deployment
- Hosted on **Vercel**
- Auto-deploys from main branch
- API routes in `/api` folder

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Google Gemini API key
- Upstash Redis account

### Installation

1. **Clone the repository**
```bash
git clone <repo-url>
cd beat-the-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your API keys
```

4. **Run development server**
```bash
npm run dev
```

5. **Build for production**
```bash
npm run build
```

## 🔧 Environment Variables

Create a `.env.local` file (or see `.env.example`):

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
ADMIN_SECRET_KEY=your_admin_secret_key
```

## 📊 Database Structure

**Redis Keys:**
- `global:humans` - Total wins by human players
- `global:ai` - Total wins by AI
- `leaderboard` - Sorted set of player rankings (sorted by wins)
- `player:name:phone` - Individual player statistics

## 🎯 How to Play

1. **Enter your name and phone** on the home screen
2. **Choose a game** from the menu
3. **Play the game** following the specific rules
4. **Check the leaderboard** to see your ranking and global stats

## 📈 Gameplay Statistics

Each player's record includes:
- **Total Wins**: Number of games won
- **Games Played**: Total games completed
- **Win Rate**: Percentage of games won
- **Last Played**: When the player last played

## 🛠️ API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/gemini-20q` | POST | 20 Questions game logic |
| `/api/gemini-commonlink` | POST | Common Link game logic |
| `/api/gemini-genie` | POST | Literal Genie game logic |
| `/api/gemini-truths` | POST | Two Truths game logic |
| `/api/update-score` | POST | Update global win counts |
| `/api/update-leaderboard` | POST | Update player statistics |
| `/api/get-leaderboard` | GET | Fetch player leaderboard |
| `/api/get-scores` | GET | Fetch global human vs AI scores |

## 🎨 Styling

- Clean, bold design with high contrast
- Retro-inspired UI with modern interactions
- Fully responsive on mobile and desktop
- Smooth animations and transitions

## 📱 Responsive Design

- Mobile-first approach
- Touch-friendly buttons
- Optimized for all screen sizes
- Fast load times

## 🔐 Security

- API keys stored securely in environment variables
- CORS enabled for cross-origin requests
- Rate limiting on certain endpoints
- Input validation on all API endpoints

## 📝 License

MIT License - feel free to use this project for your own purposes

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

## 📧 Support

For issues or questions, please open a GitHub issue or contact the maintainers.
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
