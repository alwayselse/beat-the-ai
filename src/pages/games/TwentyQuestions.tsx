import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

export default function TwentyQuestions() {
  const navigate = useNavigate();
  const { incrementGlobalScore } = useGameStore();
  
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [secret, setSecret] = useState('');
  const [history, setHistory] = useState<Message[]>([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [userResponse, setUserResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [playerWon, setPlayerWon] = useState(false);

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

  const handleUserResponse = async () => {
    if (!userResponse.trim() || loading) return;
    
    const newHistory = [...history, { role: 'user' as const, content: userResponse }];
    setHistory(newHistory);
    setUserResponse('');
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
        
        if (won) {
          incrementGlobalScore('human');
        } else {
          incrementGlobalScore('ai');
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      setLoading(false);
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
    <div className="min-h-screen bg-cyan-300 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_#000] p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-black">20 Questions</h1>
            <div className="text-2xl font-black">
              Question {questionCount}/10
            </div>
          </div>
          <div className="mt-2 text-lg font-bold text-gray-600">
            Your secret: {secret}
          </div>
        </div>

        {/* Chat History */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_#000] p-6 mb-6 max-h-96 overflow-y-auto">
          <div className="space-y-4">
            {history.map((msg, index) => (
              <div
                key={index}
                className={`p-4 border-4 border-black ${
                  msg.role === 'ai' 
                    ? 'bg-blue-200 ml-0 mr-12' 
                    : 'bg-green-200 ml-12 mr-0'
                }`}
              >
                <div className="font-black mb-1">
                  {msg.role === 'ai' ? '🤖 AI' : '👤 You'}
                </div>
                <div className="font-bold">{msg.content}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Response Input */}
        {!loading && questionCount < 10 && (
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_#000] p-6">
            <label className="block text-lg font-black mb-3">
              Your response (Yes/No/Maybe):
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => { setUserResponse('Yes'); setTimeout(handleUserResponse, 100); }}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black py-4 px-6 border-4 border-black shadow-[4px_4px_0px_#000] hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-xl"
              >
                Yes
              </button>
              <button
                onClick={() => { setUserResponse('No'); setTimeout(handleUserResponse, 100); }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black py-4 px-6 border-4 border-black shadow-[4px_4px_0px_#000] hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-xl"
              >
                No
              </button>
              <button
                onClick={() => { setUserResponse('Maybe / Sort of'); setTimeout(handleUserResponse, 100); }}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-black py-4 px-6 border-4 border-black shadow-[4px_4px_0px_#000] hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-xl"
              >
                Maybe
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_#000] p-8 text-center">
            <div className="text-2xl font-black">AI is thinking...</div>
          </div>
        )}
      </div>
    </div>
  );
}
