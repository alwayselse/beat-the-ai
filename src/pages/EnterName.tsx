import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

export default function EnterName() {
  const [name, setName] = useState('');
  const setPlayerName = useGameStore((state) => state.setPlayerName);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length > 0) {
      setPlayerName(name.trim());
      navigate('/menu');
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
  };

  return (
    <div className="min-h-screen bg-yellow-400 flex items-center justify-center px-4">
      <div className="bg-white border-4 border-black rounded-2xl shadow-[12px_12px_0px_#000] p-8 md:p-12 max-w-md w-full">
        <h1 className="text-5xl md:text-6xl font-black text-center mb-8 text-black">
          BEAT THE AI
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xl font-bold mb-4 text-black text-center">
              Enter Your Name:
            </label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              className="w-full px-6 py-4 text-2xl font-bold text-center border-4 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-300"
              placeholder="Your Name"
              autoFocus
            />
          </div>
          
          <button
            type="submit"
            disabled={name.trim().length === 0}
            className={`w-full font-black py-4 px-6 rounded-xl text-2xl border-4 border-black shadow-[8px_8px_0px_#000] transition-all
              ${name.trim().length > 0
                ? 'bg-black text-white hover:shadow-[12px_12px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] cursor-pointer' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            START GAME
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6 font-semibold">
          Ready to challenge the AI?
        </p>
      </div>
    </div>
  );
}
