import React from 'react';
import { DailyReportData } from '../types';
import { ArrowLeft, Calendar, TrendingUp, Award } from 'lucide-react';

interface DailyReportProps {
  data: DailyReportData;
  onClose: () => void;
}

const DailyReport: React.FC<DailyReportProps> = ({ data, onClose }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 animate-in slide-in-from-bottom-10 duration-500 z-50 fixed inset-0 overflow-y-auto">
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center z-10">
        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full mr-2 text-gray-700 dark:text-gray-300">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Daily Health Report</h1>
      </div>

      <div className="max-w-xl mx-auto p-6 space-y-8">
        
        {/* Header Summary */}
        <div className="text-center space-y-2">
            <div className="inline-block p-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg mb-2">
                <Calendar size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Today's Overview</h2>
            <p className="text-gray-500 dark:text-gray-400">Here is how you performed today based on your scan history.</p>
        </div>

        {/* Score and Stats */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase mb-1">Daily Score</span>
                <span className={`text-4xl font-black ${data.score >= 7 ? 'text-green-500' : 'text-orange-500'}`}>
                    {data.score}<span className="text-lg text-gray-400 dark:text-gray-600">/10</span>
                </span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase mb-1">Total Calories</span>
                <span className="text-4xl font-black text-gray-800 dark:text-white">
                    {data.totalCalories}
                </span>
            </div>
        </div>

        {/* Analysis */}
        <div className="space-y-4">
            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center gap-2 mb-3 text-blue-700 dark:text-blue-400 font-semibold">
                    <TrendingUp size={20} />
                    <span>Macro Balance: {data.macroBalance}</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                    {data.analysis}
                </p>
            </div>
        </div>

        {/* Recommendations */}
        <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Award size={20} className="text-yellow-500" />
                Recommendations for Tomorrow
            </h3>
            <ul className="space-y-3">
                {data.recommendations.map((rec, i) => (
                    <li key={i} className="flex gap-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-xl shadow-sm">
                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                            {i + 1}
                        </div>
                        <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">{rec}</span>
                    </li>
                ))}
            </ul>
        </div>
      </div>
    </div>
  );
};

export default DailyReport;