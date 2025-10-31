import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';

interface Fact {
  text: string;
  isTrue: boolean;
}

interface Puzzle {
  topic: string;
  facts: Fact[];
  explanation: string;
}

export default function TwoTruths() {
  const navigate = useNavigate();
  const { incrementGlobalScore } = useGameStore();
  
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [selectedFactIndex, setSelectedFactIndex] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load puzzle from AI
  const loadNewPuzzle = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gemini-truths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const puzzle = await response.json();
      setCurrentPuzzle(puzzle);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load puzzle:', err);
      setLoading(false);
    }
  };

  // Load first puzzle on mount
  useEffect(() => {
    loadNewPuzzle();
  }, []);

  const handleFactClick = (factIndex: number) => {
    if (showExplanation || !currentPuzzle) return;

    setSelectedFactIndex(factIndex);
    setShowExplanation(true);

    const selectedFact = currentPuzzle.facts[factIndex];

    // Check if the selected fact is the lie (isTrue === false)
    if (!selectedFact.isTrue) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (questionNumber >= 10) {
      // Game over
      setGameOver(true);
      
      // Need 7/10 to win
      const playerWon = score >= 7;
      
      // Update global score
      if (playerWon) {
        incrementGlobalScore('human');
      } else {
        incrementGlobalScore('ai');
      }
    } else {
      // Next question
      setQuestionNumber(questionNumber + 1);
      setSelectedFactIndex(null);
      setShowExplanation(false);
      loadNewPuzzle();
    }
  };

  if (gameOver) {
    const playerWon = score >= 7;
    return (
      <div className="min-h-screen bg-yellow-300 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white border-4 border-black shadow-[8px_8px_0px_#000] p-8">
          <h1 className="text-5xl font-black mb-6 text-center">
            {playerWon ? '🎉 YOU WIN! 🎉' : '😔 AI WINS 😔'}
          </h1>
          
          <div className="text-center mb-8">
            <div className="text-6xl font-black mb-4">{score}/10</div>
            <p className="text-xl font-bold">
              {playerWon 
                ? 'Excellent work! You beat the AI!'
                : 'So close! The AI got you this time.'}
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

  if (!currentPuzzle || loading) {
    return (
      <div className="min-h-screen bg-yellow-300 flex items-center justify-center p-4">
        <div className="text-4xl font-black">
          {loading ? 'AI is generating puzzle...' : 'Loading...'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-300 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_#000] p-6 mb-8">
          <h1 className="text-4xl font-black mb-2">Two Truths & a Hallucination</h1>
          <div className="flex justify-between items-center">
            <p className="text-xl font-bold">Question {questionNumber}/10</p>
            <p className="text-xl font-bold">Score: {score}</p>
          </div>
        </div>

        {/* Game Card */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_#000] p-8">
          <h2 className="text-3xl font-black mb-8 text-center bg-pink-300 border-4 border-black p-4">
            {currentPuzzle.topic}
          </h2>

          <p className="text-lg font-bold mb-6 text-center">
            Which statement is the AI hallucination?
          </p>

          <div className="space-y-4 mb-8">
            {currentPuzzle.facts.map((fact, index) => (
              <button
                key={index}
                onClick={() => handleFactClick(index)}
                disabled={showExplanation}
                className={`w-full text-left p-6 border-4 border-black font-bold text-lg transition-all
                  ${selectedFactIndex === index
                    ? fact.isTrue
                      ? 'bg-red-400 shadow-[4px_4px_0px_#000]'
                      : 'bg-green-400 shadow-[4px_4px_0px_#000]'
                    : showExplanation
                      ? fact.isTrue
                        ? 'bg-gray-200'
                        : 'bg-green-200 shadow-[4px_4px_0px_#000]'
                      : 'bg-blue-300 hover:bg-blue-400 shadow-[6px_6px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px]'
                  }
                  ${showExplanation ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <span className="font-black mr-3">{String.fromCharCode(65 + index)}.</span>
                {fact.text}
              </button>
            ))}
          </div>

          {showExplanation && (
            <div className="bg-yellow-100 border-4 border-black p-6 mb-6">
              <h3 className="text-2xl font-black mb-4">
                {selectedFactIndex !== null && !currentPuzzle.facts[selectedFactIndex].isTrue
                  ? '✅ Correct!'
                  : '❌ Wrong!'}
              </h3>
              <p className="text-lg font-bold">{currentPuzzle.explanation}</p>
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
                    ? 'bg-yellow-400'
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
