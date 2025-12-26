import React, { useState, useRef, useMemo } from 'react';
import { Person } from '../types';

interface NameManagerProps {
  people: Person[];
  setPeople: (people: Person[]) => void;
}

// Safer ID generator that works in non-secure contexts
const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

const MOCK_NAMES = [
  "赵一", "钱二", "孙三", "李四", "周五", "吴六", "郑七", "王八", 
  "冯九", "陈十", "褚十一", "卫十二", "蒋十三", "沈十四", "韩十五", "杨十六"
];

export const NameManager: React.FC<NameManagerProps> = ({ people, setPeople }) => {
  const [textInput, setTextInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect duplicates
  const { duplicates, hasDuplicates } = useMemo(() => {
    const nameCounts = new Map<string, number>();
    people.forEach(p => {
      nameCounts.set(p.name, (nameCounts.get(p.name) || 0) + 1);
    });
    
    const duplicateNames = new Set<string>();
    nameCounts.forEach((count, name) => {
      if (count > 1) duplicateNames.add(name);
    });

    return {
      duplicates: duplicateNames,
      hasDuplicates: duplicateNames.size > 0
    };
  }, [people]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(e.target.value);
  };

  const processNames = (rawText: string) => {
    // Split by new line or comma, trim whitespace, filter empty
    const names = rawText
      .split(/[\n,]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    // Create Person objects
    const newPeople: Person[] = names.map(name => ({
      id: generateId(),
      name
    }));

    setPeople([...people, ...newPeople]);
    setTextInput('');
  };

  const handleAddFromText = () => {
    if (!textInput.trim()) return;
    processNames(textInput);
  };

  const handleGenerateMockData = () => {
    const newPeople: Person[] = MOCK_NAMES.map(name => ({
      id: generateId(),
      name
    }));
    setPeople([...people, ...newPeople]);
  };

  const handleRemoveDuplicates = () => {
    // We removed window.confirm as it can cause "unresponsive" behavior in some environments 
    // or be annoying for quick actions.
    const seen = new Set<string>();
    const uniquePeople: Person[] = [];
    
    for (const p of people) {
      if (!seen.has(p.name)) {
        seen.add(p.name);
        uniquePeople.push(p);
      }
    }
    
    // Update state only if count changed to avoid unnecessary renders
    if (uniquePeople.length !== people.length) {
      setPeople(uniquePeople);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      processNames(content);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const clearAll = () => {
    if (window.confirm('确定要清空所有名单吗？')) {
      setPeople([]);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          人员名单管理 ({people.length} 人)
        </div>
        <button 
          onClick={handleGenerateMockData}
          className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          🎲 生成模拟名单
        </button>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">手动输入 (每行一个姓名)</label>
            <textarea
              className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-shadow"
              placeholder="张三&#10;李四&#10;王五"
              value={textInput}
              onChange={handleTextChange}
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleAddFromText}
              disabled={!textInput.trim()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              添加名单
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              上传 CSV
            </button>
            <input
              type="file"
              accept=".csv,.txt"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        {/* List Preview */}
        <div className="flex flex-col h-full max-h-[300px]">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium text-gray-700">当前名单</label>
              {hasDuplicates && (
                <button 
                  onClick={handleRemoveDuplicates}
                  className="text-xs flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded hover:bg-amber-200 transition-colors cursor-pointer"
                  title="发现重复姓名，点击移除"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  一键移除重复 ({people.length - new Set(people.map(p => p.name)).size}个)
                </button>
              )}
            </div>
            {people.length > 0 && (
              <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-700 hover:underline">
                清空全部
              </button>
            )}
          </div>
          <div className="flex-1 border border-gray-200 rounded-lg overflow-y-auto bg-gray-50 p-2">
            {people.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                暂无人员，请添加或生成模拟名单
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {people.map((p) => {
                  const isDuplicate = duplicates.has(p.name);
                  return (
                    <span 
                      key={p.id} 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        isDuplicate 
                          ? 'bg-amber-100 text-amber-800 border-amber-200' 
                          : 'bg-indigo-100 text-indigo-800 border-transparent'
                      }`}
                    >
                      {p.name}
                      {isDuplicate && <span className="ml-1 text-[10px]" title="重复姓名">⚠️</span>}
                      <button 
                        onClick={() => setPeople(people.filter(person => person.id !== p.id))}
                        className={`ml-1.5 focus:outline-none ${isDuplicate ? 'text-amber-600 hover:text-amber-800' : 'text-indigo-500 hover:text-indigo-700'}`}
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};