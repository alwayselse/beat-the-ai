import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LeaderboardEntry {
  playerName: string;
  game: string;
  score: number;
  won: boolean;
  date: string;
}

interface GameStats {
  totalGamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  bestStreak: number;
  currentStreak: number;
}

interface GameState {
  // Player info
  playerName: string;
  
  // Global scores (shared by everyone)
  globalScore: {
    humans: number;
    ai: number;
  };
  
  // Personal stats (per player)
  playerStats: GameStats;
  
  // Personal best scores (top 10 for this player)
  personalBestScores: LeaderboardEntry[];
  
  // Global leaderboard (top players)
  leaderboard: LeaderboardEntry[];
  
  // Legacy local data
  totalGamesPlayed: number;
  currentStreak: number;
  bestStreak: number;
  
  // Actions
  setPlayerName: (name: string) => void;
  incrementScore: (winner: 'humans' | 'ai') => void;
  resetScores: () => void;
  addToLeaderboard: (entry: LeaderboardEntry) => void;
  updateLeaderboard: (entries: LeaderboardEntry[]) => void;
  incrementGamesPlayed: () => void;
  updateStreak: (won: boolean) => void;
  refreshScores: () => void;
  
  // API actions
  fetchGlobalScores: () => Promise<void>;
  incrementGlobalScore: (winner: 'human' | 'ai') => Promise<void>;
  saveGameResult: (game: string, score: number, won: boolean) => Promise<void>;
  fetchPlayerStats: () => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
}

// Generate initial dummy leaderboard
const generateInitialLeaderboard = (): LeaderboardEntry[] => [
  { playerName: 'Alice Champion', game: 'truths', score: 2850, won: true, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { playerName: 'Bob Masters', game: '20q', score: 2340, won: true, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { playerName: 'Zara Elite', game: 'commonlink', score: 2120, won: true, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { playerName: 'Rex Pro', game: 'genie', score: 1890, won: true, date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
  { playerName: 'Jay Wins', game: 'truths', score: 1650, won: true, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
];

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      playerName: '',
      globalScore: {
        humans: 12,
        ai: 8,
      },
      playerStats: {
        totalGamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        bestStreak: 0,
        currentStreak: 0,
      },
      personalBestScores: [],
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
            .slice(0, 20),
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

      // Save individual game result
      saveGameResult: async (game: string, score: number, won: boolean) => {
        const { playerName } = get();
        if (!playerName) {
          console.warn('No player name set, skipping save');
          return;
        }
        
        try {
          const response = await fetch('/api/save-game-result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              playerName, 
              game, 
              score, 
              won 
            }),
          });
          const data = await response.json();
          
          // Update local state with server data
          set({ 
            playerStats: data.stats,
            personalBestScores: data.personalBest 
          });
        } catch (error) {
          console.error('Failed to save game result:', error);
        }
      },

      // Fetch player stats
      fetchPlayerStats: async () => {
        const { playerName } = get();
        if (!playerName) return;
        
        try {
          const response = await fetch(`/api/get-player-stats?name=${encodeURIComponent(playerName)}`);
          const data = await response.json();
          set({ 
            playerStats: data.stats,
            personalBestScores: data.personalBest 
          });
        } catch (error) {
          console.error('Failed to fetch player stats:', error);
        }
      },

      // Fetch global leaderboard
      fetchLeaderboard: async () => {
        try {
          const response = await fetch('/api/get-leaderboard');
          const data = await response.json();
          set({ leaderboard: data.leaderboard });
        } catch (error) {
          console.error('Failed to fetch leaderboard:', error);
        }
      },
    }),
    {
      name: 'beat-the-ai-storage',
      partialize: (state) => ({
        playerName: state.playerName, // Only persist player name locally
      }),
    }
  )
);
