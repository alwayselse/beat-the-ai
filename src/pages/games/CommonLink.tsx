import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';

interface CommonLinkQuestion {
  id: number;
  category: string;
  items: string[];
  correctAnswer: string;
  trapAnswer: string;
  difficulty: string;
  hint?: string;
}

interface GameData {
  commonLink: CommonLinkQuestion[];
}

export default function CommonLink() {
  const navigate = useNavigate();
  const { recordGameResult } = useGameStore();
  
  const [gameData, setGameData] = useState<CommonLinkQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<CommonLinkQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<'correct' | 'trap' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shuffledAnswers, setShuffledAnswers] = useState<Array<{type: 'correct' | 'trap', text: string}>>([]);

  // Load and shuffle game data on mount
  useEffect(() => {
    const loadGameData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/game-data/common-link.json');
        const data: GameData = await response.json();
        
        // Shuffle the questions and pick first 10
        const shuffled = [...data.commonLink].sort(() => Math.random() - 0.5).slice(0, 10);
        setGameData(shuffled);
        setCurrentQuestion(shuffled[0]);
        
        // Shuffle answer order for first question
        const answers = [
          { type: 'correct' as const, text: shuffled[0].correctAnswer },
          { type: 'trap' as const, text: shuffled[0].trapAnswer }
        ].sort(() => Math.random() - 0.5);
        setShuffledAnswers(answers);
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to load game data:', err);
        setLoading(false);
      }
    };

    loadGameData();
  }, []);

  const handleOptionClick = (option: 'correct' | 'trap') => {
    if (showExplanation) return;

    setSelectedOption(option);
    setShowExplanation(true);

    if (option === 'correct') {
      setScore(score + 1);
    }
  };

  const handleNext = async () => {
    if (questionNumber >= 10) {
      // Game over
      setGameOver(true);
      
      // Need 7/10 to win
      const playerWon = score >= 7;
      
      // Record game result for leaderboard
      recordGameResult('commonLink', playerWon);
      
      // Call API to update global score in Redis
      const winner = playerWon ? 'human' : 'ai';
      try {
        await fetch('/api/update-score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ winner }),
        });
      } catch (error) {
        console.error('Failed to update global score:', error);
      }
      
      // Call API to update leaderboard
      const playerName = useGameStore.getState().playerName;
      const playerPhone = useGameStore.getState().playerPhone;
      if (playerName && playerPhone) {
        try {
          await fetch('/api/update-leaderboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: playerName,
              phone: playerPhone,
              won: playerWon,
              gameType: 'commonLink',
            }),
          });
        } catch (error) {
          console.error('Failed to update leaderboard:', error);
        }
      }
    } else {
      // Next question
      const nextQuestion = gameData[questionNumber];
      setQuestionNumber(questionNumber + 1);
      setCurrentQuestion(nextQuestion);
      setSelectedOption(null);
      setShowExplanation(false);
      
      // Shuffle answer order for next question
      const answers = [
        { type: 'correct' as const, text: nextQuestion.correctAnswer },
        { type: 'trap' as const, text: nextQuestion.trapAnswer }
      ].sort(() => Math.random() - 0.5);
      setShuffledAnswers(answers);
    }
  };

  if (loading || !currentQuestion) {
    return (
      <div className="min-h-screen bg-purple-300 flex items-center justify-center p-4">
        <div className="text-4xl font-black">
          {loading ? 'Loading game data...' : 'Loading...'}
        </div>
      </div>
    );
  }

  if (gameOver) {
    const playerWon = score >= 7;
    return (
      <div className="min-h-screen bg-purple-300 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white border-4 border-black shadow-[8px_8px_0px_#000] p-8">
          <h1 className="text-5xl font-black mb-6 text-center">
            {playerWon ? '🎉 YOU WIN! 🎉' : '😔 AI WINS 😔'}
          </h1>
          
          <div className="text-center mb-8">
            <div className="text-6xl font-black mb-4">{score}/10</div>
            <p className="text-xl font-bold">
              {playerWon 
                ? 'Amazing! You found the real connections!'
                : 'The AI tricked you this time!'}
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/menu')}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-black py-4 px-8 border-4 border-black shadow-[4px_4px_0px_#000] hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-xl"
            >
              Back to Menu
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black py-4 px-8 border-4 border-black shadow-[4px_4px_0px_#000] hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-xl"
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-300 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_#000] p-6 mb-8">
          <h1 className="text-4xl font-black mb-2">The Common Link</h1>
          <div className="flex justify-between items-center">
            <p className="text-xl font-bold">Question {questionNumber}/10</p>
            <p className="text-xl font-bold">Score: {score}</p>
          </div>
        </div>

        {/* Game Card */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_#000] p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-black mb-6 text-center">
              What connects these three things?
            </h2>
            
            <div className="flex gap-4 justify-center mb-8 flex-wrap">
              {currentQuestion.items.map((item, index) => (
                <div
                  key={index}
                  className="bg-cyan-300 border-4 border-black shadow-[4px_4px_0px_#000] p-6 flex-1 min-w-[150px] text-center"
                >
                  <div className="text-2xl md:text-3xl font-black">{item}</div>
                </div>
              ))}
            </div>

            <p className="text-lg font-bold text-center mb-6">
              Choose the REAL connection (watch out for the AI's trap!)
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {shuffledAnswers.map((answer, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(answer.type)}
                disabled={showExplanation}
                className={`w-full text-left p-6 border-4 border-black font-bold text-lg transition-all
                  ${selectedOption === answer.type
                    ? answer.type === 'correct'
                      ? 'bg-green-400 shadow-[4px_4px_0px_#000]'
                      : 'bg-red-400 shadow-[4px_4px_0px_#000]'
                    : showExplanation && answer.type === 'correct'
                      ? 'bg-green-200 shadow-[4px_4px_0px_#000]'
                      : showExplanation
                        ? 'bg-gray-200'
                        : 'bg-blue-300 hover:bg-blue-400 shadow-[6px_6px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]'
                  }
                  ${showExplanation ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <span className="font-black mr-3">{String.fromCharCode(65 + index)}.</span>
                {answer.text}
              </button>
            ))}
          </div>

          {showExplanation && (
            <div className="space-y-4 mb-6">
              <div className="bg-green-100 border-4 border-black p-6">
                <h3 className="text-xl font-black mb-3 text-green-800">
                  ✅ CORRECT ANSWER:
                </h3>
                <p className="text-lg font-bold mb-2">{currentQuestion.correctAnswer}</p>
              </div>

              <div className="bg-red-100 border-4 border-black p-6">
                <h3 className="text-xl font-black mb-3 text-red-800">
                  ⚠️ AI TRAP:
                </h3>
                <p className="text-lg font-bold mb-2">{currentQuestion.trapAnswer}</p>
              </div>

              <div className="bg-yellow-100 border-4 border-black p-6">
                <h3 className="text-2xl font-black">
                  {selectedOption === 'correct' ? '🎯 You got it!' : '😅 You fell for the trap!'}
                </h3>
              </div>
            </div>
          )}

          {showExplanation && (
            <button
              onClick={handleNext}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-4 px-8 border-4 border-black shadow-[6px_6px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-xl"
            >
              {questionNumber >= 10 ? 'See Results' : 'Next Question →'}
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-6 bg-white border-4 border-black shadow-[4px_4px_0px_#000] p-4">
          <div className="flex gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-4 border-2 border-black ${
                  i < questionNumber - 1
                    ? 'bg-green-400'
                    : i === questionNumber - 1
                    ? 'bg-purple-400'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
