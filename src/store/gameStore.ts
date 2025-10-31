import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameState {
  // Player info
  playerName: string;
  
  // Global scores (shared by everyone)
  globalScore: {
    humans: number;
    ai: number;
  };
  
  // Actions
  setPlayerName: (name: string) => void;
  incrementScore: (winner: 'humans' | 'ai') => void;
  resetScores: () => void;
  
  // API actions
  fetchGlobalScores: () => Promise<void>;
  incrementGlobalScore: (winner: 'human' | 'ai') => Promise<void>;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      playerName: '',
      globalScore: {
        humans: 0,
        ai: 0,
      },
      
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
        }),

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

