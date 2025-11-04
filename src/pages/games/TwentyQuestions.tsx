import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

export default function TwentyQuestions() {
  const navigate = useNavigate();
  const { recordGameResult } = useGameStore();
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [secret, setSecret] = useState('');
  const [history, setHistory] = useState<Message[]>([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [playerWon, setPlayerWon] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  const startGame = async () => {
    if (!secret.trim()) return;
    
    setGameState('playing');
    setLoading(true);
    
    // Get AI's first question
    try {
      const response = await fetch('/api/gemini-20q', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: [], secret, questionCount: 1 }),
      });
      const data = await response.json();
      
      setHistory([{ role: 'ai', content: data.response }]);
      setQuestionCount(1);
      setLoading(false);
    } catch (error) {
      console.error('Failed to get AI question:', error);
      setLoading(false);
    }
  };

  const handleUserResponseWithAnswer = async (answer: string) => {
    if (loading || isSubmitting) return;
    
    setIsSubmitting(true);
    const newHistory = [...history, { role: 'user' as const, content: answer }];
    setHistory(newHistory);
    setLoading(true);

    try {
      const response = await fetch('/api/gemini-20q', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          history: newHistory, 
          secret, 
          questionCount: questionCount + 1 
        }),
      });
      const data = await response.json();
      
      const aiMessage = data.response;
      setHistory([...newHistory, { role: 'ai', content: aiMessage }]);
      setQuestionCount(questionCount + 1);
      
      // Check if AI made a final guess
      if (aiMessage.includes('FINAL GUESS:')) {
        const guess = aiMessage.split('FINAL GUESS:')[1].trim().toLowerCase();
        const secretLower = secret.toLowerCase();
        const won = !guess.includes(secretLower) && !secretLower.includes(guess.split(/[.,!?]/)[0]);
        
        setPlayerWon(won);
        setGameState('finished');
        
        // Record the game result
        recordGameResult('twentyQuestions', won);
        
        // Call API to update score in Redis
        const winner = won ? 'human' : 'ai';
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
                won,
                gameType: 'twentyQuestions',
              }),
            });
          } catch (error) {
            console.error('Failed to update leaderboard:', error);
          }
        }
      }
      
      setLoading(false);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-cyan-300 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_#000] p-8">
            <h1 className="text-5xl font-black mb-4">20 Questions</h1>
            <p className="text-xl font-bold mb-8">
              Think of any object, person, or place. The AI will try to guess it in 10 yes/no questions!
            </p>
            
            <div className="bg-yellow-100 border-4 border-black p-6 mb-8">
              <h3 className="text-xl font-black mb-3">How to Play:</h3>
              <ul className="space-y-2 text-lg">
                <li>• Think of something (e.g., "Eiffel Tower", "Cat", "Pizza")</li>
                <li>• Answer the AI's yes/no questions honestly</li>
                <li>• If the AI guesses correctly on question 10, it wins!</li>
                <li>• If it's wrong, YOU win!</li>
              </ul>
            </div>

            <label className="block text-xl font-black mb-3">
              What are you thinking of?
            </label>
            <input
              type="text"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="e.g., Eiffel Tower"
              className="w-full p-4 border-4 border-black text-lg font-bold mb-6"
              onKeyPress={(e) => e.key === 'Enter' && startGame()}
            />
            
            <button
              onClick={startGame}
              disabled={!secret.trim()}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-4 px-8 border-4 border-black shadow-[6px_6px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div className="min-h-screen bg-cyan-300 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white border-4 border-black shadow-[8px_8px_0px_#000] p-8">
          <h1 className="text-5xl font-black mb-6 text-center">
            {playerWon ? '🎉 YOU WIN! 🎉' : '🤖 AI WINS! 🤖'}
          </h1>
          
          <div className="text-center mb-8">
            <p className="text-2xl font-bold mb-4">
              Your secret was: <span className="text-blue-600">{secret}</span>
            </p>
            <p className="text-xl font-bold">
              {playerWon 
                ? 'The AI couldn\'t guess it!'
                : 'The AI guessed correctly!'}
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
    <div className="min-h-screen bg-cyan-300 flex flex-col">
      {/* Header - Fixed at top */}
      <div className="bg-black text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-black">🎯 20 Questions</h1>
            <p className="text-sm md:text-base font-bold text-yellow-300">Your secret: {secret}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl md:text-4xl font-black text-yellow-300">{questionCount}/10</div>
            <div className="text-xs md:text-sm font-bold">Questions</div>
          </div>
        </div>
      </div>

      {/* Chat Container - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-3">
          {history.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'} animate-fadeIn`}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] p-4 border-4 border-black shadow-[4px_4px_0px_#000] ${
                  msg.role === 'ai'
                    ? 'bg-blue-200 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl'
                    : 'bg-green-200 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{msg.role === 'ai' ? '🤖' : '👤'}</span>
                  <span className="font-black text-sm">{msg.role === 'ai' ? 'AI' : 'You'}</span>
                </div>
                <div className="font-bold text-sm md:text-base break-words">{msg.content}</div>
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start animate-fadeIn">
              <div className="max-w-[85%] md:max-w-[75%] p-4 border-4 border-black shadow-[4px_4px_0px_#000] bg-blue-200 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🤖</span>
                  <span className="font-black text-sm">AI</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="font-bold text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Scroll anchor */}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Response Buttons - Fixed at bottom */}
      {!loading && questionCount < 10 && (
        <div className="bg-white border-t-4 border-black p-4 shadow-[0px_-4px_0px_#000]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-3">
              <p className="text-sm md:text-base font-black">Answer the AI's question:</p>
            </div>
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <button
                onClick={() => handleUserResponseWithAnswer('Yes')}
                disabled={loading || isSubmitting}
                className="bg-green-500 hover:bg-green-600 text-white font-black py-3 md:py-4 px-4 md:px-6 border-4 border-black shadow-[4px_4px_0px_#000] hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-base md:text-xl rounded-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✓ Yes
              </button>
              <button
                onClick={() => handleUserResponseWithAnswer('No')}
                disabled={loading || isSubmitting}
                className="bg-red-500 hover:bg-red-600 text-white font-black py-3 md:py-4 px-4 md:px-6 border-4 border-black shadow-[4px_4px_0px_#000] hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-base md:text-xl rounded-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✗ No
              </button>
              <button
                onClick={() => handleUserResponseWithAnswer('Maybe / Sort of')}
                disabled={loading || isSubmitting}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-black py-3 md:py-4 px-4 md:px-6 border-4 border-black shadow-[4px_4px_0px_#000] hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-base md:text-xl rounded-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ~ Maybe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
