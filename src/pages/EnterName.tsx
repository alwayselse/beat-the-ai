import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

export default function EnterName() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const setPlayerName = useGameStore((state) => state.setPlayerName);
  const setPlayerPhone = useGameStore((state) => state.setPlayerPhone);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has valid session (expires at midnight)
    const storedSession = localStorage.getItem('playerSession');
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        const now = new Date();
        const sessionDate = new Date(session.expiresAt);
        
        // If session is still valid (before midnight), auto-login
        if (now < sessionDate && session.name && session.phone) {
          setPlayerName(session.name);
          setPlayerPhone(session.phone);
          navigate('/menu');
        } else {
          // Session expired, clear it
          localStorage.removeItem('playerSession');
        }
      } catch (error) {
        // Invalid session data, clear it
        localStorage.removeItem('playerSession');
      }
    }
  }, [navigate, setPlayerName, setPlayerPhone]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length > 0 && phone.trim().length >= 10) {
      const trimmedName = name.trim();
      const trimmedPhone = phone.trim();
      
      setPlayerName(trimmedName);
      setPlayerPhone(trimmedPhone);
      
      // Set expiration to midnight tonight
      const expiresAt = new Date();
      expiresAt.setHours(23, 59, 59, 999);
      
      // Store session with expiration
      localStorage.setItem('playerSession', JSON.stringify({
        name: trimmedName,
        phone: trimmedPhone,
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString()
      }));
      
      navigate('/menu');
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 10) {
      setPhone(value);
    }
  };

  const isFormValid = name.trim().length > 0 && phone.trim().length === 10;

  return (
    <div className="min-h-screen bg-yellow-400 flex items-center justify-center px-4">
      <div className="bg-white border-4 border-black rounded-2xl shadow-[12px_12px_0px_#000] p-8 md:p-12 max-w-md w-full">
        <h1 className="text-5xl md:text-6xl font-black text-center mb-4 text-black">
          BEAT THE AI
        </h1>
        
        <p className="text-center text-sm text-gray-600 mb-8 font-semibold">
          🎮 Play all day! Your session expires at midnight.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-bold mb-2 text-black">
              Your Name:
            </label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              className="w-full px-6 py-4 text-xl font-bold border-4 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-300"
              placeholder="John Doe"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-lg font-bold mb-2 text-black">
              Phone Number:
            </label>
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              maxLength={10}
              className="w-full px-6 py-4 text-xl font-bold border-4 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-300"
              placeholder="9876543210"
            />
            {phone.length > 0 && phone.length < 10 && (
              <p className="text-sm text-red-600 mt-2 font-semibold">
                Please enter 10 digits
              </p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full font-black py-4 px-6 rounded-xl text-2xl border-4 border-black shadow-[8px_8px_0px_#000] transition-all
              ${isFormValid
                ? 'bg-black text-white hover:shadow-[12px_12px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] cursor-pointer' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            START PLAYING →
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6 font-semibold">
          We only use your phone number for the leaderboard 📊
        </p>
      </div>
    </div>
  );
}
