import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PlayerStats {
  twentyQuestionsWins: number;
  twentyQuestionsPlayed: number;
  twoTruthsWins: number;
  twoTruthsPlayed: number;
  literalGenieWins: number;
  literalGeniePlayed: number;
  commonLinkWins: number;
  commonLinkPlayed: number;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  totalWins: number;
  gamesPlayed: number;
  winRate: number;
  lastPlayed: number;
}

interface GameState {
  // Player info
  playerName: string;
  playerPhone: string;
  playerStats: PlayerStats;
  
  // Global scores (shared by everyone)
  globalScore: {
    humans: number;
    ai: number;
  };
  
  // Leaderboard
  leaderboard: LeaderboardEntry[];
  leaderboardLoading: boolean;
  
  // Actions
  setPlayerName: (name: string) => void;
  setPlayerPhone: (phone: string) => void;
  incrementScore: (winner: 'humans' | 'ai') => void;
  resetScores: () => void;
  
  // Player stats actions
  recordGameResult: (game: 'twentyQuestions' | 'twoTruths' | 'literalGenie' | 'commonLink', won: boolean) => void;
  
  // API actions
  fetchGlobalScores: () => Promise<void>;
  incrementGlobalScore: (winner: 'human' | 'ai') => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      playerName: '',
      playerPhone: '',
      playerStats: {
        twentyQuestionsWins: 0,
        twentyQuestionsPlayed: 0,
        twoTruthsWins: 0,
        twoTruthsPlayed: 0,
        literalGenieWins: 0,
        literalGeniePlayed: 0,
        commonLinkWins: 0,
        commonLinkPlayed: 0,
      },
      globalScore: {
        humans: 0,
        ai: 0,
      },
      leaderboard: [],
      leaderboardLoading: false,
      
      setPlayerName: (name: string) => 
        set({ playerName: name }),
      
      setPlayerPhone: (phone: string) =>
        set({ playerPhone: phone }),
      
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

      // Record game result (update local stats only)
      recordGameResult: (game, won) => {
        const playedKey = `${game}Played` as keyof PlayerStats;
        const winsKey = `${game}Wins` as keyof PlayerStats;
        
        set((state) => ({
          playerStats: {
            ...state.playerStats,
            [playedKey]: (state.playerStats[playedKey] as number) + 1,
            [winsKey]: won ? (state.playerStats[winsKey] as number) + 1 : (state.playerStats[winsKey] as number),
          },
        }));

        console.log(`Game result recorded locally: ${game}, won: ${won}`);
        // API calls (incrementGlobalScore and updateLeaderboard) are now handled by the game files
      },

      // Fetch global scores from API
      fetchGlobalScores: async () => {
        try {
          console.log('Fetching global scores from API...');
          
          const response = await fetch('/api/get-scores');
          
          console.log('Response status:', response.status);
          
          if (!response.ok) {
            console.error('Failed to fetch scores, status:', response.status);
            // Set default values instead of throwing
            set({ globalScore: { humans: 0, ai: 0 } });
            return;
          }

          const data = await response.json();
          console.log('Received score data:', data);
          
          set({ 
            globalScore: { 
              humans: data.humans || 0, 
              ai: data.ai || 0 
            } 
          });
        } catch (error) {
          console.error('Error in fetchGlobalScores:', error);
          // Always set default values on error
          set({ globalScore: { humans: 0, ai: 0 } });
        }
      },

      // Increment global score via API
      incrementGlobalScore: async (winner: 'human' | 'ai') => {
        console.log(`Incrementing global score for: ${winner}`);
        
        try {
          const response = await fetch('/api/update-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ winner }),
          });
          
          if (!response.ok) {
            console.error('Failed to increment score, status:', response.status);
            return;
          }
          
          const data = await response.json();
          console.log('Global score updated:', data);
          
          // Update local state
          set({ globalScore: { humans: data.humans || 0, ai: data.ai || 0 } });
          
          // Also fetch latest scores to ensure sync
          get().fetchGlobalScores();
        } catch (error) {
          console.error('Failed to increment global score:', error);
        }
      },

      // Fetch leaderboard from API
      fetchLeaderboard: async () => {
        set({ leaderboardLoading: true });
        
        try {
          console.log('Fetching leaderboard...');
          
          const response = await fetch('/api/get-leaderboard');
          
          if (!response.ok) {
            console.error('Failed to fetch leaderboard, status:', response.status);
            set({ leaderboard: [], leaderboardLoading: false });
            return;
          }

          const data = await response.json();
          console.log('Received leaderboard data:', data);
          
          set({ 
            leaderboard: data.leaderboard || [],
            leaderboardLoading: false 
          });
        } catch (error) {
          console.error('Failed to fetch leaderboard:', error);
          set({ 
            leaderboard: [],
            leaderboardLoading: false 
          });
        }
      },
    }),
    {
      name: 'beat-the-ai-storage',
    }
  )
);

