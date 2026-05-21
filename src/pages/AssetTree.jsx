import React, { useState } from 'react';
import { Sparkles, Table2, Network } from 'lucide-react';
import AssetRegister from '@/components/asset-register/AssetRegister';
import AssetTreeVisual from '@/components/asset-tree/AssetTreeVisual';

export default function AssetTree() {
  const [view, setView] = useState('tree');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1480px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl font-bold text-slate-900">Asset Register</h1>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full">
                <Sparkles className="w-3 h-3 text-white" />
                <span className="text-[10px] font-bold text-white tracking-wider">BEST IN CLASS</span>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              Every asset organised by <span className="font-semibold text-slate-700">Location → Room → Asset</span> — one defensible register.
            </p>
          </div>

          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm self-start">
            <button
              onClick={() => setView('register')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                view === 'register' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table2 className="w-3.5 h-3.5" /> Register
            </button>
            <button
              onClick={() => setView('tree')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                view === 'tree' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Network className="w-3.5 h-3.5" /> Visual tree
            </button>
          </div>
        </div>

        {view === 'register' ? <AssetRegister /> : <AssetTreeVisual />}
      </main>
    </div>
  );
}