'use client';

import React from 'react';
import { HardHat, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface MetricsProps {
  overallProgress: number;
  totalTasks: number;
  doneTasks: number;
  budgetSpent: number;
}

export function ProgressOverview({ overallProgress, totalTasks, doneTasks, budgetSpent }: MetricsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Progress Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg shadow-indigo-200/50 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-indigo-100 text-sm font-medium">Overall Progress</p>
            <h2 className="text-4xl font-bold mt-2">{overallProgress}%</h2>
            <div className="mt-4 w-full bg-indigo-500/30 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
          <TrendingUp className="absolute -bottom-2 -right-2 text-white/10" size={100} />
        </div>

        {/* Task Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm">Tasks Completed</p>
            <p className="text-2xl font-bold text-slate-900">{doneTasks} / {totalTasks}</p>
          </div>
        </div>

        {/* Budget Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm">Budget Spent</p>
            <p className="text-2xl font-bold text-slate-900">৳ {budgetSpent.toLocaleString()}</p>
          </div>
        </div>

        {/* Alert Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm">Critical Issues</p>
            <p className="text-2xl font-bold text-slate-900">2 Pending</p>
          </div>
        </div>
      </div>
    </div>
  );
}
