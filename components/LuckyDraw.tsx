import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Person, LuckyDrawConfig } from '../types';

interface LuckyDrawProps {
  people: Person[];
}

export const LuckyDraw: React.FC<LuckyDrawProps> = ({ people }) => {
  const [currentWinner, setCurrentWinner] = useState<Person | null>(null);
  const [displayValue, setDisplayValue] = useState<string>('???');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winners, setWinners] = useState<Person[]>([]);
  const [config, setConfig] = useState<LuckyDrawConfig>({ allowRepeats: false });

  const audioContextRef = useRef<AudioContext | null>(null);

  // Sound effect generator using Web Audio API
  const playTickSound = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  const playWinSound = () => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'triangle';
    // Simple arpeggio
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
    osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3); // C6

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
  };

  const startDraw = () => {
    // Determine the pool of candidates
    let pool = people;
    if (!config.allowRepeats) {
      const winnerIds = new Set(winners.map(w => w.id));
      pool = people.filter(p => !winnerIds.has(p.id));
    }

    if (pool.length === 0) {
      alert("候选池已空！请添加人员或允许重复抽取。");
      return;
    }

    setIsSpinning(true);
    setCurrentWinner(null);
    let counter = 0;
    const totalSpins = 30 + Math.floor(Math.random() * 10); // Minimum 30 ticks
    let delay = 50;

    const spin = () => {
      // Pick random name for visual effect
      const randomPerson = pool[Math.floor(Math.random() * pool.length)];
      setDisplayValue(randomPerson.name);
      playTickSound();

      counter++;

      if (counter < totalSpins) {
        // Slow down exponentially
        if (counter > totalSpins - 10) {
          delay *= 1.2;
        }
        setTimeout(spin, delay);
      } else {
        // Final winner
        const finalWinner = pool[Math.floor(Math.random() * pool.length)];
        setDisplayValue(finalWinner.name);
        setCurrentWinner(finalWinner);
        setWinners(prev => [finalWinner, ...prev]);
        setIsSpinning(false);
        playWinSound();
        triggerConfetti();
      }
    };

    spin();
  };

  const resetWinners = () => {
    if (confirm("确定要清空获奖记录吗？")) {
      setWinners([]);
      setCurrentWinner(null);
      setDisplayValue("???");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          幸运抽奖
        </h2>
        <div className="flex items-center space-x-2">
          <label className="flex items-center cursor-pointer relative">
            <input
              type="checkbox"
              checked={config.allowRepeats}
              onChange={(e) => setConfig({ ...config, allowRepeats: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-500"></div>
            <span className="ml-2 text-sm font-medium text-gray-700">允许重复</span>
          </label>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-10">
        {/* Slot Machine Display */}
        <div className={`
          relative w-full max-w-md h-32 bg-gray-900 rounded-xl overflow-hidden shadow-inner border-4 border-gray-800 flex items-center justify-center
          ${isSpinning ? 'ring-4 ring-pink-400 ring-opacity-50' : ''}
        `}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent pointer-events-none z-10"></div>
          <div className="text-4xl md:text-5xl font-black text-white tracking-wider z-0 transition-transform duration-75">
            {displayValue}
          </div>
          {/* Decorative shine */}
          <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
        </div>

        {/* Start Button */}
        <button
          onClick={startDraw}
          disabled={isSpinning || people.length === 0}
          className={`
            mt-8 px-12 py-4 rounded-full font-bold text-lg shadow-lg transform transition-all active:scale-95
            ${isSpinning
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-xl hover:-translate-y-1'
            }
          `}
        >
          {isSpinning ? '抽取中...' : '开始抽奖'}
        </button>
      </div>

      {/* History */}
      {winners.length > 0 && (
        <div className="mt-8 border-t border-gray-100 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">获奖名单历史 ({winners.length})</h3>
            <button onClick={resetWinners} className="text-sm text-red-500 hover:text-red-700">清除记录</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {winners.map((winner, index) => (
              <div key={`${winner.id}-${index}`} className="flex items-center p-2 bg-pink-50 rounded-lg border border-pink-100">
                <div className="h-6 w-6 rounded-full bg-pink-200 text-pink-700 flex items-center justify-center text-xs font-bold mr-2">
                  {winners.length - index}
                </div>
                <span className="text-gray-800 font-medium truncate">{winner.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};