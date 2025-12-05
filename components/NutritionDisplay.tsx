import React from 'react';
import { NutritionData } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ArrowLeft, CheckCircle, AlertCircle, Droplets, Flame, Wheat, Beef, Activity, Clock } from 'lucide-react';

interface NutritionDisplayProps {
  data: NutritionData;
  onReset: () => void;
}

const NutritionDisplay: React.FC<NutritionDisplayProps> = ({ data, onReset }) => {
  const macroData = [
    { name: 'Protein', value: data.protein, color: '#3b82f6' }, // Blue
    { name: 'Carbs', value: data.carbs, color: '#f59e0b' },    // Amber
    { name: 'Fat', value: data.fat, color: '#ef4444' },        // Red
  ];

  const getHealthColor = (score: number) => {
    if (score >= 8) return 'text-green-500 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900/30';
    if (score >= 5) return 'text-yellow-500 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900/30';
    return 'text-red-500 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900/30';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Navbar */}
      <div className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 py-3 z-30 flex items-center shadow-sm">
        <button onClick={onReset} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full mr-2 transition-colors">
          <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate flex-1">{data.productName}</h1>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        
        {/* Health Score Card */}
        <div className={`p-6 rounded-2xl border ${getHealthColor(data.healthScore)} flex flex-col items-center justify-center relative overflow-hidden shadow-sm transition-colors`}>
            <div className="absolute top-0 right-0 p-3 opacity-10">
                <CheckCircle size={100} />
            </div>
            <div className="relative z-10 text-center">
                <div className="text-sm uppercase font-bold tracking-wide mb-1 opacity-80 dark:text-gray-200">Health Score</div>
                <div className="text-6xl font-black mb-2">{data.healthScore}<span className="text-2xl font-medium opacity-50">/10</span></div>
                <p className="font-medium text-center max-w-xs mx-auto leading-tight dark:text-gray-200">{data.summary}</p>
            </div>
        </div>

        {/* Macros Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
          <h2 className="text-gray-900 dark:text-white font-semibold mb-4 flex items-center gap-2">
            <PieChart size={20} className="text-gray-500 dark:text-gray-400" />
            Macro Breakdown
          </h2>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={macroData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {macroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'white' }}
                    itemStyle={{ color: '#374151', fontWeight: 600 }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  wrapperStyle={{ color: 'inherit' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Calories */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-gray-800 dark:text-white">{data.calories}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Kcal</span>
            </div>
          </div>
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center transition-colors">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-full mb-2">
                    <Beef size={20} />
                </div>
                <span className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase">Protein</span>
                <span className="text-xl font-bold text-gray-800 dark:text-white">{data.protein}g</span>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center transition-colors">
                <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-500 rounded-full mb-2">
                    <Wheat size={20} />
                </div>
                <span className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase">Carbs</span>
                <span className="text-xl font-bold text-gray-800 dark:text-white">{data.carbs}g</span>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center transition-colors">
                <div className="p-2 bg-red-50 dark:bg-red-900/30 text-red-500 rounded-full mb-2">
                    <Droplets size={20} />
                </div>
                <span className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase">Fat</span>
                <span className="text-xl font-bold text-gray-800 dark:text-white">{data.fat}g</span>
            </div>
        </div>

        {/* Pros and Cons */}
        <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50/50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-xl p-5 transition-colors">
                <h3 className="text-green-800 dark:text-green-400 font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle size={18} /> The Good
                </h3>
                <ul className="space-y-2">
                    {data.pros.map((pro, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-green-900 dark:text-green-200">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"></span>
                            {pro}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="bg-red-50/50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl p-5 transition-colors">
                <h3 className="text-red-800 dark:text-red-400 font-semibold mb-3 flex items-center gap-2">
                    <AlertCircle size={18} /> The Bad
                </h3>
                <ul className="space-y-2">
                    {data.cons.map((con, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-red-900 dark:text-red-200">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
                            {con}
                        </li>
                    ))}
                </ul>
            </div>
        </div>

        {/* Detailed Physiological Analysis */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
             <div className="flex items-start gap-3">
                 <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg shrink-0">
                     <Activity size={24} />
                 </div>
                 <div>
                     <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Effect on Body</h2>
                     <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                         {data.effectOnBody}
                     </p>
                 </div>
             </div>
        </div>

        {/* Consumption Advice */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
             <div className="flex items-start gap-3">
                 <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                     <Clock size={24} />
                 </div>
                 <div>
                     <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Consumption Advice</h2>
                     <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                         {data.consumptionAdvice}
                     </p>
                 </div>
             </div>
        </div>

      </div>
    </div>
  );
};

export default NutritionDisplay;