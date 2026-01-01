"use client";

import React, { useState, useMemo } from "react";
import questionsData from "./round1.json";

export default function QuizApp() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // 表示モード管理
  // 'menu': 回数選択ボタン (表紙)
  // 'list': 問題一覧
  // 'quiz': クイズ画面
  const [viewMode, setViewMode] = useState<'menu' | 'list' | 'quiz'>('menu');
  const [selectedRound, setSelectedRound] = useState<string | null>(null);

  // 全データから「第〇回」の種類を重複なく取り出す
  const rounds = useMemo(() => {
    const rSet = new Set(questionsData.map(q => q.round));
    return Array.from(rSet).sort();
  }, []);

  // 検索または回数選択に基づいたフィルタリング
  const filteredQuestions = useMemo(() => {
    const term = searchQuery.toLowerCase().trim();
    
    let result = questionsData;

    // 回数が選択されている場合はその回だけで絞り込む
    if (selectedRound && !searchQuery) {
      result = result.filter(q => q.round === selectedRound);
    }

    // 検索ワードがある場合は全体から検索
    if (term) {
      result = questionsData.filter((q) => {
        const pStr = `問題${q.id}`;
        return (
          q.question.toLowerCase().includes(term) ||
          q.id.toString() === term ||
          pStr.includes(term) ||
          q.options.some(opt => opt.toLowerCase().includes(term))
        );
      });
    }

    return [...result].sort((a, b) => a.id - b.id);
  }, [searchQuery, selectedRound]);

  const currentList = filteredQuestions;
  const currentQuestion = currentList[currentIndex];

  // 検索実行
  const handleSearch = () => {
    setSearchQuery(searchInput);
    setSelectedRound(null); // 検索時は回数縛りを解除
    setViewMode('list');
    setCurrentIndex(0);
    resetQuizStatus();
  };

  const resetQuizStatus = () => {
    setShowExplanation(false);
    setSelectedOption(null);
  };

  // 回数ボタンを押した時
  const handleRoundClick = (round: string) => {
    setSelectedRound(round);
    setSearchQuery("");
    setSearchInput("");
    setViewMode('list');
    resetQuizStatus();
  };

  // 一覧から問題を選択
  const handleSelectQuestion = (idx: number) => {
    setCurrentIndex(idx);
    resetQuizStatus();
    setViewMode('quiz');
  };

  const handleOptionClick = (idx: number) => {
    if (showExplanation) return;
    setSelectedOption(idx);
    setShowExplanation(true);
  };

  return (
    <main className="max-w-2xl mx-auto p-4 md:p-8 text-black font-sans">
      {/* 検索エリア（常に表示） */}
      <div className="mb-8 flex gap-2">
        <input
          type="text"
          placeholder="キーワードや問題番号で検索"
          className="w-full p-4 border-2 border-blue-100 rounded-2xl focus:border-blue-500 outline-none shadow-sm bg-white"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button onClick={handleSearch} className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-all">
          検索
        </button>
      </div>

      {/* --- 表示切り替え --- */}

      {viewMode === 'menu' && (
        <div className="animate-in fade-in duration-500">
          <h2 className="text-xl font-bold mb-6 text-gray-700 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
            回数を選択して開始
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {rounds.map(round => (
              <button
                key={round}
                onClick={() => handleRoundClick(round)}
                className="group p-6 bg-white border-2 border-blue-50 rounded-2xl hover:border-blue-500 hover:shadow-xl transition-all text-left flex justify-between items-center"
              >
                <div>
                  <div className="text-2xl font-black text-blue-600 mb-1">{round}</div>
                  <div className="text-gray-500 text-sm font-medium">全 {questionsData.filter(q => q.round === round).length} 問</div>
                </div>
                <span className="text-2xl group-hover:translate-x-2 transition-transform">➔</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'list' && (
        <div className="animate-in slide-in-from-right-4 duration-300">
          <button onClick={() => setViewMode('menu')} className="mb-4 text-blue-600 font-bold hover:underline flex items-center gap-1">
            ← 表紙に戻る
          </button>
          <h3 className="font-bold text-gray-700 mb-4 px-1">
            {searchQuery ? `「${searchQuery}」の検索結果: ${currentList.length}件` : `${selectedRound} の問題一覧`}
          </h3>
          <div className="space-y-3">
            {currentList.map((q, idx) => (
              <div key={`${q.round}-${q.id}`} onClick={() => handleSelectQuestion(idx)} className="p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer shadow-sm flex gap-3 items-center">
                <div className="bg-blue-50 text-blue-600 font-bold px-3 py-1 rounded text-sm whitespace-nowrap">
                  {q.round.replace("第", "")} 問{q.id}
                </div>
                <span className="text-gray-800 truncate text-sm">{q.question}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'quiz' && currentQuestion && (
        <div className="animate-in fade-in duration-300">
          <button onClick={() => setViewMode('list')} className="mb-4 text-blue-600 font-bold flex items-center gap-1 p-2 hover:bg-blue-50 rounded-lg transition">
            ← リストに戻る
          </button>
          
          <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">
            <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
              <span className="font-bold">{currentQuestion.round} ・ 問 {currentQuestion.id}</span>
              <span className="text-sm bg-blue-500 px-3 py-1 rounded-full">{currentIndex + 1} / {currentList.length}</span>
            </div>

            <div className="p-8">
              <h2 className="text-xl font-bold mb-8 text-gray-800 leading-relaxed">{currentQuestion.question}</h2>
              <div className="grid gap-4">
                {currentQuestion.options.map((option, idx) => {
                  const isCorrect = idx === currentQuestion.answerIndex;
                  const isSelected = idx === selectedOption;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(idx)}
                      className={`w-full text-left p-5 rounded-2xl border-2 transition-all font-medium
                        ${!showExplanation ? 'border-gray-100 hover:border-blue-400 hover:bg-blue-50 text-gray-700' : ''}
                        ${showExplanation && isCorrect ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-100 text-gray-400'}
                        ${showExplanation && isSelected && !isCorrect ? 'border-red-300 bg-red-50 text-red-800' : ''}
                      `}
                    >
                      <div className="flex justify-between items-center">
                        <span>{idx + 1}. {option}</span>
                        {showExplanation && isCorrect && <span className="text-green-600 font-bold">正解</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
              {showExplanation && (
                <div className="mt-10 p-6 bg-yellow-50 rounded-2xl border border-yellow-100 animate-in zoom-in-95 duration-300">
                  <p className="font-bold text-yellow-800 mb-2 pb-2 border-b border-yellow-200">【解説】</p>
                  <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{currentQuestion.explanation}</div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between mt-8 gap-4">
            <button disabled={currentIndex === 0} onClick={() => {setCurrentIndex(prev => prev-1); resetQuizStatus();}} className="flex-1 bg-white border-2 border-blue-600 text-blue-600 py-4 rounded-2xl font-bold disabled:opacity-20 active:scale-95 transition">前へ</button>
            <button disabled={currentIndex === currentList.length - 1} onClick={() => {setCurrentIndex(prev => prev+1); resetQuizStatus();}} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold disabled:opacity-20 active:scale-95 transition shadow-lg">次へ</button>
          </div>
        </div>
      )}
    </main>
  );
}