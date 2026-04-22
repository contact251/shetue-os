'use client';

import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, DollarSign, Plus } from 'lucide-react';
import { Task, ChecklistItem, CostItem } from '@/types';

interface ChecklistSystemProps {
  task: Task;
  items: ChecklistItem[];
  costs: CostItem[];
}

export function ChecklistSystem({ task, items, costs }: ChecklistSystemProps) {
  const [checklist, setChecklist] = useState(items);

  const toggleItem = (id: string) => {
    setChecklist(prev => prev.map(i => 
      i.id === id ? { ...i, is_completed: !i.is_completed } : i
    ));
    // In production, this would trigger a Supabase update
  };

  const totalCost = costs.reduce((acc, curr) => acc + curr.total_cost, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-800">{task.title}</h3>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 uppercase">
            {task.category}
          </span>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 uppercase font-bold">Total Cost</p>
          <p className="text-lg font-bold text-slate-900">৳ {totalCost.toLocaleString()}</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Checklist Section */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Work Checklist</p>
          <div className="space-y-2">
            {checklist.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
              >
                {item.is_completed ? (
                  <CheckCircle2 className="text-emerald-500" size={20} />
                ) : (
                  <Circle className="text-slate-300" size={20} />
                )}
                <span className={`text-sm ${item.is_completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                  {item.item}
                </span>
              </button>
            ))}
            <button className="w-full flex items-center gap-2 p-3 text-sm text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg transition-colors border border-dashed border-indigo-200 mt-2">
              <Plus size={16} /> Add Inspection Point
            </button>
          </div>
        </div>

        {/* Material/Costing Section */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Material Tracking</p>
          <div className="bg-slate-50 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="px-4 py-2 font-semibold">Item</th>
                  <th className="px-4 py-2 font-semibold">Qty</th>
                  <th className="px-4 py-2 font-semibold">Unit Price</th>
                  <th className="px-4 py-2 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {costs.map((cost) => (
                  <tr key={cost.id} className="border-b border-slate-200 last:border-0">
                    <td className="px-4 py-3 text-slate-700">{cost.item_name}</td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{cost.quantity}</td>
                    <td className="px-4 py-3 text-slate-700">৳ {cost.unit_price}</td>
                    <td className="px-4 py-3 text-slate-900 font-bold text-right">৳ {cost.total_cost.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
