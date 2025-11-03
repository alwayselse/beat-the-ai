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
  updateLeaderboard: () => Promise<void>;
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

      // Record game result and update leaderboard
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

        console.log(`Game result recorded: ${game}, won: ${won}`);
        
        // Update global score
        get().incrementGlobalScore(won ? 'human' : 'ai');
        
        // Update leaderboard after recording the result
        if (won) {
          get().updateLeaderboard();
        }
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

      // Update leaderboard with current player stats
      updateLeaderboard: async () => {
        const state = get();
        const { playerStats, playerName, playerPhone } = state;
        
        if (!playerName) {
          console.error('Cannot update leaderboard: No player name set');
          return;
        }

        const totalWins = 
          playerStats.twentyQuestionsWins +
          playerStats.twoTruthsWins +
          playerStats.literalGenieWins +
          playerStats.commonLinkWins;

        const gamesPlayed = 
          playerStats.twentyQuestionsPlayed +
          playerStats.twoTruthsPlayed +
          playerStats.literalGeniePlayed +
          playerStats.commonLinkPlayed;

        const winRate = gamesPlayed > 0 
          ? parseFloat(((totalWins / gamesPlayed) * 100).toFixed(1))
          : 0;

        console.log('Updating leaderboard with:', { 
          playerName, 
          playerPhone, 
          totalWins, 
          gamesPlayed, 
          winRate 
        });

        try {
          const response = await fetch('/api/update-leaderboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              playerName,
              playerPhone: playerPhone || '',
              totalWins,
              gamesPlayed,
              winRate,
              lastPlayed: Date.now()
            }),
          });
          
          if (!response.ok) {
            console.error('Failed to update leaderboard, status:', response.status);
            return;
          }
          
          const data = await response.json();
          console.log('Leaderboard updated successfully:', data);
          
          // Refresh leaderboard after update
          await get().fetchLeaderboard();
        } catch (error) {
          console.error('Failed to update leaderboard:', error);
        }
      },
    }),
    {
      name: 'beat-the-ai-storage',
    }
  )
);

