import React, { useState } from 'react';
import { Person, Group, GroupConfig } from '../types';
import { generateCreativeTeamNames } from '../services/geminiService';

interface GroupGeneratorProps {
  people: Person[];
}

// Safer ID generator
const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

// Color palette for groups
const GROUP_COLORS = [
  'from-green-400 to-teal-500',
  'from-blue-400 to-indigo-500',
  'from-purple-400 to-pink-500',
  'from-yellow-400 to-orange-500',
  'from-red-400 to-rose-500',
  'from-cyan-400 to-blue-500',
  'from-emerald-400 to-green-500',
  'from-violet-400 to-purple-500',
];

// Moved outside to avoid TSX generic syntax ambiguity and recreating function
const shuffleArray = <T extends any>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const GroupGenerator: React.FC<GroupGeneratorProps> = ({ people }) => {
  const [config, setConfig] = useState<GroupConfig>({ groupSize: 4 });
  const [groups, setGroups] = useState<Group[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleGroup = () => {
    if (people.length === 0) {
      alert("请先在名单管理中添加人员");
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate a brief calculation delay for UX
    setTimeout(() => {
      const shuffled: Person[] = shuffleArray(people);
      const size = Math.max(1, config.groupSize);
      const newGroups: Group[] = [];
      
      for (let i = 0; i < shuffled.length; i += size) {
        const chunk = shuffled.slice(i, i + size);
        newGroups.push({
          id: generateId(),
          name: `第 ${newGroups.length + 1} 组`,
          members: chunk
        });
      }
      
      setGroups(newGroups);
      setIsGenerating(false);
    }, 600);
  };

  const handleAiNaming = async () => {
    if (groups.length === 0) return;
    setIsAiLoading(true);
    try {
      const updatedGroups = await generateCreativeTeamNames(groups);
      setGroups(updatedGroups);
    } catch (e) {
      console.error(e);
      alert("AI 生成失败，请稍后重试");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (groups.length === 0) return;

    // CSV Header
    let csvContent = "组名,姓名\n";

    // Add rows
    groups.forEach(group => {
      group.members.forEach(member => {
        csvContent += `${group.name},${member.name}\n`;
      });
    });

    // Add BOM for Excel utf-8 compatibility
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "分组结果.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          智能自动分组
        </h2>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl mb-6 flex flex-col md:flex-row gap-4 items-end md:items-center">
        <div className="flex-1 w-full">
           <label className="block text-sm font-medium text-gray-700 mb-1">每组人数</label>
           <input 
             type="number" 
             min="2"
             max={people.length || 100}
             value={config.groupSize}
             onChange={(e) => setConfig({ groupSize: parseInt(e.target.value) || 2 })}
             className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
           />
        </div>
        <button
          onClick={handleGroup}
          disabled={isGenerating || people.length === 0}
          className="w-full md:w-auto px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
        >
          {isGenerating ? '分组中...' : '开始随机分组'}
        </button>
      </div>

      {groups.length > 0 && (
        <div className="animate-fade-in">
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-semibold text-gray-700">分组结果 ({groups.length} 组)</h3>
             <div className="flex gap-2">
                <button
                 onClick={handleDownloadCSV}
                 className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  导出 CSV
                </button>
                <button
                  onClick={handleAiNaming}
                  disabled={isAiLoading}
                  className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full transition-colors border
                    ${isAiLoading 
                      ? 'bg-purple-50 text-purple-400 border-purple-100' 
                      : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-transparent hover:shadow-md'
                    }`}
                >
                  {isAiLoading ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                  {isAiLoading ? 'AI 正在思考...' : 'AI 创意命名'}
                </button>
             </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {groups.map((group, index) => (
               <div key={group.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                 <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${GROUP_COLORS[index % GROUP_COLORS.length]}`}></div>
                 <h4 className="font-bold text-gray-800 mb-2 pl-3">{group.name}</h4>
                 <div className="flex flex-wrap gap-2 pl-3">
                   {group.members.map(m => (
                     <span key={m.id} className="inline-block bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded">
                       {m.name}
                     </span>
                   ))}
                 </div>
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};