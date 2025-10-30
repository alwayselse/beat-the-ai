export default function About() {
  return (
    <div className="min-h-screen bg-yellow-400 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white border-4 border-black rounded-2xl shadow-[12px_12px_0px_#000] p-8 mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-center text-black mb-4">
            ℹ️ ABOUT THE GAME
          </h1>
          <p className="text-center text-xl text-gray-700 font-semibold">
            Can Humans Outsmart Artificial Intelligence?
          </p>
        </div>

        {/* Game Description */}
        <div className="space-y-6">
          <div className="bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_#000] p-6">
            <h2 className="text-2xl font-black text-black mb-4">🎮 What is Beat The AI?</h2>
            <p className="text-gray-700 leading-relaxed font-medium">
              <strong>Beat The AI</strong> is an arcade-style collection of mind games where you compete 
              against artificial intelligence. Test your creativity, logic, and wit across four unique 
              challenges designed to push the boundaries of human vs. machine intelligence.
            </p>
          </div>

          <div className="bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_#000] p-6">
            <h2 className="text-2xl font-black text-black mb-4">🎯 The Games</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-red-600 pl-4">
                <h3 className="font-black text-lg text-black">20Q — The AI Guesser</h3>
                <p className="text-gray-700 font-medium">
                  Think of any object and the AI will try to guess it in 10 questions or less. 
                  Can it read your mind through clever deduction?
                </p>
              </div>

              <div className="border-l-4 border-red-600 pl-4">
                <h3 className="font-black text-lg text-black">Two Truths & a Hallucination</h3>
                <p className="text-gray-700 font-medium">
                  The AI presents three "facts" - two real, one fabricated. Use your knowledge 
                  and intuition to spot which one the AI made up.
                </p>
              </div>

              <div className="border-l-4 border-red-600 pl-4">
                <h3 className="font-black text-lg text-black">The Literal Genie</h3>
                <p className="text-gray-700 font-medium">
                  Make a wish, but be careful! The AI will grant it in the most literal (and often 
                  unexpected) way possible. Can you phrase it perfectly?
                </p>
              </div>

              <div className="border-l-4 border-red-600 pl-4">
                <h3 className="font-black text-lg text-black">The Common Link</h3>
                <p className="text-gray-700 font-medium">
                  Find the true connection between three seemingly random items before the AI 
                  tricks you with a plausible but incorrect link.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_#000] p-6">
            <h2 className="text-2xl font-black text-black mb-4">🏆 How to Win</h2>
            <ul className="space-y-3 text-gray-700 font-medium">
              <li className="flex items-start gap-3">
                <span className="text-2xl">✓</span>
                <span>Each game you win adds to the <strong className="text-green-600">HUMAN WINS</strong> counter</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">✓</span>
                <span>If the AI wins, it gets added to the <strong className="text-red-600">AI WINS</strong> counter</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">✓</span>
                <span>Climb the leaderboard by earning points across all games</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">✓</span>
                <span>Challenge yourself and prove human intelligence still reigns supreme!</span>
              </li>
            </ul>
          </div>

          <div className="bg-black border-4 border-black rounded-xl shadow-[8px_8px_0px_#000] p-6">
            <h2 className="text-2xl font-black text-white mb-4">⚡ All Games Powered by AI</h2>
            <p className="text-white font-medium">
              Every game features real-time AI interaction, challenging you with intelligent responses 
              and adaptive gameplay. Can you outsmart the machine?
            </p>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-pink-500 border-4 border-black rounded-xl shadow-[8px_8px_0px_#000] p-6 text-white text-center">
            <p className="text-2xl font-black mb-2">Ready to prove your intelligence?</p>
            <p className="text-lg font-semibold">Enter your initials and start playing!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
