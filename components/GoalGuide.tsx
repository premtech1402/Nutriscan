import React from 'react';
import { GoalGuideData } from '../types';
import { ArrowLeft, CheckCircle2, XCircle, Lightbulb, Clock } from 'lucide-react';

interface GoalGuideProps {
  data: GoalGuideData;
  onClose: () => void;
}

const GoalGuide: React.FC<GoalGuideProps> = ({ data, onClose }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 animate-in slide-in-from-right duration-300 z-50 fixed inset-0 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center z-10">
        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full mr-2 text-gray-700 dark:text-gray-300">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Your Success Plan</h1>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-8 pb-20">
        
        {/* Goal Title & Summary */}
        <div className="text-center space-y-3">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white">{data.goalName}</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
              {data.summary}
            </p>
        </div>

        {/* Guidelines Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
            {data.guidelines.map((item, index) => (
                <div key={index} className={`p-4 rounded-xl border ${
                    item.type === 'do' ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/50' :
                    item.type === 'dont' ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/50' :
                    'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/50'
                }`}>
                    <div className="flex items-center gap-2 mb-2">
                        {item.type === 'do' && <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" />}
                        {item.type === 'dont' && <XCircle size={20} className="text-red-600 dark:text-red-400" />}
                        {item.type === 'tip' && <Lightbulb size={20} className="text-blue-600 dark:text-blue-400" />}
                        <h3 className="font-bold text-gray-900 dark:text-gray-100">{item.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
                </div>
            ))}
        </div>

        {/* Timeline Schedule */}
        <div className="relative">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Clock className="text-green-500" />
                Ideal Daily Schedule
            </h3>
            
            <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800"></div>

            <div className="space-y-6 relative">
                {data.schedule.map((item, index) => (
                    <div key={index} className="flex gap-6 relative">
                        {/* Timeline Dot */}
                        <div className="w-8 flex-shrink-0 flex justify-center z-10">
                            <div className="w-4 h-4 rounded-full bg-white dark:bg-gray-950 border-4 border-green-500 mt-1.5 shadow-sm"></div>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 pb-2">
                            <span className="inline-block px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                                {item.time}
                            </span>
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{item.activity}</h4>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default GoalGuide;
