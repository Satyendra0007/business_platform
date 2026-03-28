import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-[var(--color-neutral-bg)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center border-t-4 border-[var(--color-mustard-gold)]">
        <h1 className="text-3xl font-bold text-[var(--color-marine-blue)] mb-4">
          Tradafy MERN Stack
        </h1>
        <p className="text-gray-600 mb-6 font-medium">
          Frontend initialized successfully using Tailwind CSS v4!
        </p>
        <button className="bg-[var(--color-marine-blue)] hover:bg-[#071a2d] text-white font-semibold py-2 px-6 rounded-md transition-colors w-full">
          Get Started
        </button>
      </div>
    </div>
  );
}

export default App;
