import logo from '../logo.png';

function Landing({ onGetStarted, showInstallBtn, handleInstall })  {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        <nav className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-3">
            <div className="p-0.5 bg-gradient-to-r from-[#4ECDC4] to-[#8A2BE2] rounded-full">
              <img src={logo} alt="Logo" className="w-10 h-10 bg-white dark:bg-gray-900 rounded-full p-1" />
            </div>
            <h1 className="text-2xl font-bold">FineTrack Ultra Pro</h1>
          </div>
          <button 
            onClick={onGetStarted}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            Launch App
          </button>
          {showInstallBtn && (
          <button 
           onClick={handleInstall}
            className="mt-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-2 border-purple-500 text-purple-600 dark:text-purple-400 px-8 py-3 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
         📱 Install App to Home Screen
         </button>
          )}
        </nav>

        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Track Money Like a Pro
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Expenses, Income, Budgets, Charts. Sab kuch ek jagah. Bilkul free.
          </p>
          <button 
            onClick={onGetStarted}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Get Started Free →
          </button>
          <p className="text-sm text-gray-500 mt-4">No signup required. Data saves in your browser</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/20">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-xl font-bold mb-2">Smart Charts</h3>
            <p className="text-gray-600 dark:text-gray-300">Pie charts, bar graphs. Dekho paisa kahan ja raha</p>
          </div>
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/20">
            <div className="text-4xl mb-3">💰</div>
            <h3 className="text-xl font-bold mb-2">Budget Alerts</h3>
            <p className="text-gray-600 dark:text-gray-300">80% kharch pe warning. 100% pe alert. Control me raho</p>
          </div>
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/20">
            <div className="text-4xl mb-3">📄</div>
            <h3 className="text-xl font-bold mb-2">Export PDF/CSV</h3>
            <p className="text-gray-600 dark:text-gray-300">Monthly report download karo. CA ko bhejo</p>
          </div>
        </div>

        <div className="text-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/20">
          <h3 className="text-3xl font-bold mb-4">Ready to Take Control?</h3>
          <button 
            onClick={onGetStarted}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
          >
            Launch FineTrack Ultra Pro →
          </button>
        </div>

      </div>
    </div>
  );
}

export default Landing;