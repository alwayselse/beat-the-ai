import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
}

interface GameState {
  playerName: string;
  globalScore: {
    humans: number;
    ai: number;
  };
  leaderboard: LeaderboardEntry[];
  totalGamesPlayed: number;
  currentStreak: number;
  bestStreak: number;
  setPlayerName: (name: string) => void;
  incrementScore: (winner: 'humans' | 'ai') => void;
  resetScores: () => void;
  addToLeaderboard: (entry: LeaderboardEntry) => void;
  updateLeaderboard: (entries: LeaderboardEntry[]) => void;
  incrementGamesPlayed: () => void;
  updateStreak: (won: boolean) => void;
  refreshScores: () => void;
  fetchGlobalScores: () => Promise<void>;
  incrementGlobalScore: (winner: 'human' | 'ai') => Promise<void>;
}

// Generate initial dummy leaderboard
const generateInitialLeaderboard = (): LeaderboardEntry[] => [
  { name: 'Alice Champion', score: 2850, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { name: 'Bob Masters', score: 2340, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { name: 'Zara Elite', score: 2120, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { name: 'Rex Pro', score: 1890, date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
  { name: 'Jay Wins', score: 1650, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { name: 'Sky Walker', score: 1430, date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
  { name: 'Vex Storm', score: 1200, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { name: 'Neo Genius', score: 980, date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
  { name: 'Luna Star', score: 750, date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() },
  { name: 'Kai Legend', score: 520, date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
];

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      playerName: '',
      globalScore: {
        humans: 12,
        ai: 8,
      },
      leaderboard: generateInitialLeaderboard(),
      totalGamesPlayed: 20,
      currentStreak: 3,
      bestStreak: 7,
      
      setPlayerName: (name: string) => 
        set({ playerName: name }),
      
      incrementScore: (winner: 'humans' | 'ai') =>
        set((state) => ({
          globalScore: {
            ...state.globalScore,
            [winner]: state.globalScore[winner] + 1,
          },
        })),
      
      resetScores: () =>
        set({
          globalScore: {
            humans: 0,
            ai: 0,
          },
          totalGamesPlayed: 0,
          currentStreak: 0,
        }),
      
      addToLeaderboard: (entry: LeaderboardEntry) =>
        set((state) => ({
          leaderboard: [...state.leaderboard, entry]
            .sort((a, b) => b.score - a.score)
            .slice(0, 20), // Keep top 20
        })),

      updateLeaderboard: (entries: LeaderboardEntry[]) =>
        set({ leaderboard: entries.sort((a, b) => b.score - a.score) }),

      incrementGamesPlayed: () =>
        set((state) => ({
          totalGamesPlayed: state.totalGamesPlayed + 1,
        })),

      updateStreak: (won: boolean) =>
        set((state) => {
          const newStreak = won ? state.currentStreak + 1 : 0;
          return {
            currentStreak: newStreak,
            bestStreak: Math.max(state.bestStreak, newStreak),
          };
        }),

      refreshScores: () =>
        set((state) => ({
          leaderboard: state.leaderboard.map((entry) => ({
            ...entry,
            score: Math.max(100, entry.score + Math.floor(Math.random() * 200 - 100)),
          })).sort((a, b) => b.score - a.score),
        })),

      // Fetch global scores from API
      fetchGlobalScores: async () => {
        try {
          const response = await fetch('/api/get-scores');
          const data = await response.json();
          set({ globalScore: { humans: data.humans, ai: data.ai } });
        } catch (error) {
          console.error('Failed to fetch global scores:', error);
        }
      },

      // Increment global score via API
      incrementGlobalScore: async (winner: 'human' | 'ai') => {
        try {
          const response = await fetch('/api/update-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ winner }),
          });
          const data = await response.json();
          set({ globalScore: { humans: data.humans, ai: data.ai } });
        } catch (error) {
          console.error('Failed to update global score:', error);
        }
      },
    }),
    {
      name: 'beat-the-ai-storage',
    }
  )
);
