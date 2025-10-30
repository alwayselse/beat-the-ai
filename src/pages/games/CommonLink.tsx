import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';

interface LinkOption {
  text: string;
  explanation: string;
}

interface Puzzle {
  items: string[];
  question: string;
  correctLink: LinkOption;
  trapLink: LinkOption;
}

interface GameData {
  commonLink: Puzzle[];
}

export default function CommonLink() {
  const navigate = useNavigate();
  const { incrementGlobalScore, incrementGamesPlayed, updateStreak } = useGameStore();
  
  const [selectedPuzzles, setSelectedPuzzles] = useState<Puzzle[]>([]);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<'correct' | 'trap' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load puzzles from JSON
  useEffect(() => {
    fetch('/games.json')
      .then((res) => res.json())
      .then((data: GameData) => {
        // Select 10 random puzzles and shuffle the answer order
        const shuffled = [...data.commonLink].sort(() => Math.random() - 0.5);
        setSelectedPuzzles(shuffled.slice(0, 10));
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load puzzles:', err);
        setLoading(false);
      });
  }, []);

  const handleOptionClick = (option: 'correct' | 'trap') => {
    if (showExplanation) return;

    setSelectedOption(option);
    setShowExplanation(true);

    if (option === 'correct') {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (questionNumber >= 10) {
      // Game over
      setGameOver(true);
      incrementGamesPlayed();
      
      // Need 7/10 to win
      const playerWon = score >= 7;
      updateStreak(playerWon);
      
      // Update global score
      if (playerWon) {
        incrementGlobalScore('human');
      } else {
        incrementGlobalScore('ai');
      }
    } else {
      // Next question
      setCurrentPuzzleIndex(currentPuzzleIndex + 1);
      setQuestionNumber(questionNumber + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-300 flex items-center justify-center p-4">
        <div className="text-4xl font-black">Loading puzzles...</div>
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

  const currentPuzzle = selectedPuzzles[currentPuzzleIndex];
  
  // Randomly shuffle the options for display
  const [option1, option2] = Math.random() > 0.5 
    ? [
        { type: 'correct' as const, data: currentPuzzle.correctLink },
        { type: 'trap' as const, data: currentPuzzle.trapLink }
      ]
    : [
        { type: 'trap' as const, data: currentPuzzle.trapLink },
        { type: 'correct' as const, data: currentPuzzle.correctLink }
      ];

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
            
            <div className="flex gap-4 justify-center mb-8">
              {currentPuzzle.items.map((item, index) => (
                <div
                  key={index}
                  className="bg-cyan-300 border-4 border-black shadow-[4px_4px_0px_#000] p-6 flex-1 text-center"
                >
                  <div className="text-3xl font-black">{item}</div>
                </div>
              ))}
            </div>

            <p className="text-lg font-bold text-center mb-6">
              Choose the REAL connection (watch out for the AI's trap!)
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <button
              onClick={() => handleOptionClick(option1.type)}
              disabled={showExplanation}
              className={`w-full text-left p-6 border-4 border-black font-bold text-lg transition-all
                ${selectedOption === option1.type
                  ? option1.type === 'correct'
                    ? 'bg-green-400 shadow-[4px_4px_0px_#000]'
                    : 'bg-red-400 shadow-[4px_4px_0px_#000]'
                  : showExplanation && option1.type === 'correct'
                    ? 'bg-green-200 shadow-[4px_4px_0px_#000]'
                    : showExplanation
                      ? 'bg-gray-200'
                      : 'bg-blue-300 hover:bg-blue-400 shadow-[6px_6px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]'
                }
                ${showExplanation ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span className="font-black mr-3">A.</span>
              {option1.data.text}
            </button>

            <button
              onClick={() => handleOptionClick(option2.type)}
              disabled={showExplanation}
              className={`w-full text-left p-6 border-4 border-black font-bold text-lg transition-all
                ${selectedOption === option2.type
                  ? option2.type === 'correct'
                    ? 'bg-green-400 shadow-[4px_4px_0px_#000]'
                    : 'bg-red-400 shadow-[4px_4px_0px_#000]'
                  : showExplanation && option2.type === 'correct'
                    ? 'bg-green-200 shadow-[4px_4px_0px_#000]'
                    : showExplanation
                      ? 'bg-gray-200'
                      : 'bg-blue-300 hover:bg-blue-400 shadow-[6px_6px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]'
                }
                ${showExplanation ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span className="font-black mr-3">B.</span>
              {option2.data.text}
            </button>
          </div>

          {showExplanation && (
            <div className="space-y-4 mb-6">
              <div className="bg-green-100 border-4 border-black p-6">
                <h3 className="text-xl font-black mb-3 text-green-800">
                  ✅ CORRECT ANSWER:
                </h3>
                <p className="text-lg font-bold mb-2">{currentPuzzle.correctLink.text}</p>
                <p className="text-base">{currentPuzzle.correctLink.explanation}</p>
              </div>

              <div className="bg-red-100 border-4 border-black p-6">
                <h3 className="text-xl font-black mb-3 text-red-800">
                  ⚠️ AI TRAP:
                </h3>
                <p className="text-lg font-bold mb-2">{currentPuzzle.trapLink.text}</p>
                <p className="text-base">{currentPuzzle.trapLink.explanation}</p>
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
