import React, { useState } from 'react';
import { NameManager } from './components/NameManager';
import { LuckyDraw } from './components/LuckyDraw';
import { GroupGenerator } from './components/GroupGenerator';
import { Person } from './types';

enum Tab {
  MANAGE = 'MANAGE',
  DRAW = 'DRAW',
  GROUP = 'GROUP'
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.MANAGE);
  const [people, setPeople] = useState<Person[]>([]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-indigo-600 p-2 rounded-lg mr-3">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                 </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">HR 工具箱</h1>
            </div>
            <div className="text-sm text-gray-500">
              人员总数: <span className="font-bold text-indigo-600">{people.length}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col">
        <nav className="flex space-x-2 mb-8 bg-gray-200 p-1 rounded-xl self-center">
          <button
            onClick={() => setActiveTab(Tab.MANAGE)}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === Tab.MANAGE 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            名单管理
          </button>
          <button
            onClick={() => setActiveTab(Tab.DRAW)}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === Tab.DRAW 
                ? 'bg-white text-pink-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            幸运抽奖
          </button>
          <button
            onClick={() => setActiveTab(Tab.GROUP)}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === Tab.GROUP 
                ? 'bg-white text-green-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            自动分组
          </button>
        </nav>

        {/* Content Area */}
        <main className="w-full flex-1">
          {activeTab === Tab.MANAGE && (
            <div className="animate-fade-in-up">
              <NameManager people={people} setPeople={setPeople} />
            </div>
          )}
          {activeTab === Tab.DRAW && (
            <div className="animate-fade-in-up">
              <LuckyDraw people={people} />
            </div>
          )}
          {activeTab === Tab.GROUP && (
            <div className="animate-fade-in-up">
              <GroupGenerator people={people} />
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-5xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-400 text-xs">
            © 2024 HR Lucky & Group Pro. Powered by React & Gemini.
          </p>
        </div>
      </footer>
      
      {/* Simple utility styles injection for animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in {
            animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;