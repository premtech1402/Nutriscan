import React, { useState, useEffect } from 'react';
import { AppState, NutritionData, ScanHistoryItem, DailyReportData, GoalGuideData } from './types';
import Scanner from './components/Scanner';
import NutritionDisplay from './components/NutritionDisplay';
import DailyReport from './components/DailyReport';
import GoalGuide from './components/GoalGuide';
import { analyzeImage, analyzeText, generateDailyReport, generateGoalGuide } from './services/geminiService';
import { ScanBarcode, ChefHat, History as HistoryIcon, Search, ChevronRight, FileText, Target, Map, Sun, Moon } from 'lucide-react';

const GOALS = ["General Health", "Weight Loss", "Weight Gain", "Muscle Build", "Low Carb / Keto"];

const FoodLoader = ({ progress, stage }: { progress: number, stage: string }) => (
  <div className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-8 flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-300">
      
      {/* Food Animation */}
      <div className="flex items-center gap-6 text-5xl mb-2">
          <div className="animate-float-1 transform transition-transform hover:scale-110">🍎</div>
          <div className="animate-float-2 transform transition-transform hover:scale-110">🥑</div>
          <div className="animate-float-3 transform transition-transform hover:scale-110">🥦</div>
      </div>

      {/* Progress Bar & Text */}
      <div className="w-full max-w-xs space-y-3">
          <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <span className="truncate pr-2">{stage}</span>
              <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                  style={{ width: `${progress}%` }}
              />
          </div>
      </div>

      <p className="text-gray-400 dark:text-gray-500 text-xs text-center max-w-xs">
          AI Chef is analyzing your food...
      </p>
  </div>
);

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [currentData, setCurrentData] = useState<NutritionData | null>(null);
  const [dailyReportData, setDailyReportData] = useState<DailyReportData | null>(null);
  const [goalGuideData, setGoalGuideData] = useState<GoalGuideData | null>(null);
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [userGoal, setUserGoal] = useState<string>("General Health");
  const [isDark, setIsDark] = useState(false);
  
  // Loading state
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState("Initializing...");

  // Initialize
  useEffect(() => {
    // History
    const savedHistory = localStorage.getItem('nutriscan_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
    // Goal
    const savedGoal = localStorage.getItem('nutriscan_goal');
    if (savedGoal) setUserGoal(savedGoal);
    
    // Theme
    const savedTheme = localStorage.getItem('nutriscan_theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Simulated Loading Progress
  useEffect(() => {
    if (appState === AppState.ANALYZING || isProcessing) {
        setLoadingProgress(0);
        setLoadingStage("Warming up...");
        
        const interval = setInterval(() => {
            setLoadingProgress(prev => {
                const remaining = 95 - prev;
                const increment = Math.max(0.2, remaining * 0.05); 
                const next = Math.min(prev + increment, 95);
                
                if (next < 30) setLoadingStage("Scanning ingredients...");
                else if (next < 55) setLoadingStage("Checking nutrients...");
                else if (next < 80) setLoadingStage("Calculating score...");
                else setLoadingStage("Plating up...");
                
                return next;
            });
        }, 150);
        return () => clearInterval(interval);
    }
  }, [appState, isProcessing]);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('nutriscan_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('nutriscan_theme', 'light');
    }
  };

  const handleGoalChange = (newGoal: string) => {
    setUserGoal(newGoal);
    localStorage.setItem('nutriscan_goal', newGoal);
  };

  const addToHistory = (data: NutritionData, imageThumbnail: string | null) => {
    const newItem: ScanHistoryItem = {
      ...data,
      id: Date.now().toString(),
      timestamp: Date.now(),
      imageThumbnail
    };
    const newHistory = [newItem, ...history].slice(0, 20); // Keep last 20
    setHistory(newHistory);
    localStorage.setItem('nutriscan_history', JSON.stringify(newHistory));
  };

  const handleScan = () => {
    setAppState(AppState.SCANNING);
    setErrorMsg(null);
  };

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setAppState(AppState.ANALYZING);
    try {
        const result = await analyzeText(searchQuery, userGoal);
        setCurrentData(result);
        addToHistory(result, null);
        setAppState(AppState.RESULT);
        setSearchQuery(""); // Clear input
    } catch (err: any) {
        console.error(err);
        setErrorMsg(err.message || "Failed to find product.");
        setAppState(AppState.ERROR);
    }
  };

  const handleCapture = async (imageData: string) => {
    setAppState(AppState.ANALYZING);
    try {
      const result = await analyzeImage(imageData, userGoal);
      setCurrentData(result);
      addToHistory(result, imageData);
      setAppState(AppState.RESULT);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to analyze. Try again.");
      setAppState(AppState.ERROR);
    }
  };

  const handleGenerateReport = async () => {
    setIsProcessing(true);
    const today = Date.now();
    const oneDayAgo = today - (24 * 60 * 60 * 1000);
    const todaysItems = history.filter(item => item.timestamp > oneDayAgo);

    if (todaysItems.length === 0) {
        setErrorMsg("No scans found for the last 24 hours.");
        setAppState(AppState.ERROR);
        setIsProcessing(false);
        return;
    }

    try {
        const report = await generateDailyReport(todaysItems);
        setDailyReportData(report);
        setAppState(AppState.DAILY_REPORT);
    } catch (err: any) {
        setErrorMsg("Failed to generate report.");
        setAppState(AppState.ERROR);
    } finally {
        setIsProcessing(false);
    }
  };

  const handleGenerateGuide = async () => {
    setIsProcessing(true);
    try {
        const guide = await generateGoalGuide(userGoal);
        setGoalGuideData(guide);
        setAppState(AppState.GOAL_GUIDE);
    } catch (err: any) {
        setErrorMsg("Failed to generate guide.");
        setAppState(AppState.ERROR);
    } finally {
        setIsProcessing(false);
    }
  }

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setCurrentData(null);
    setErrorMsg(null);
  };

  const handleHistoryClick = (item: ScanHistoryItem) => {
    setCurrentData(item);
    setAppState(AppState.RESULT);
  };

  // --- Render Functions ---

  if (appState === AppState.SCANNING) {
    return <Scanner onCapture={handleCapture} onClose={handleReset} />;
  }

  if (appState === AppState.RESULT && currentData) {
    return <NutritionDisplay data={currentData} onReset={handleReset} />;
  }

  if (appState === AppState.DAILY_REPORT && dailyReportData) {
    return <DailyReport data={dailyReportData} onClose={handleReset} />;
  }

  if (appState === AppState.GOAL_GUIDE && goalGuideData) {
    return <GoalGuide data={goalGuideData} onClose={handleReset} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white font-sans transition-colors duration-300">
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 p-6 pb-4 border-b border-gray-100 dark:border-gray-800 shadow-sm sticky top-0 z-10 transition-colors">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-green-500 p-2 rounded-lg text-white">
                <ChefHat size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">NutriScan AI</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Smart Food Analysis</p>
              </div>
            </div>
            
            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 transition-colors">
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Goal Selector */}
          <div className="flex gap-2">
             <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <Target size={16} className="text-green-600 dark:text-green-400" />
                </div>
                <select 
                   value={userGoal}
                   onChange={(e) => handleGoalChange(e.target.value)}
                   className="w-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 text-sm font-semibold rounded-lg focus:ring-green-500 focus:border-green-500 block pl-10 p-2.5 appearance-none cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                   {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
             </div>
             
             {/* Guide Button */}
             <button 
                onClick={handleGenerateGuide}
                disabled={isProcessing}
                className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-4 rounded-lg font-medium text-sm hover:bg-green-200 dark:hover:bg-green-900/60 transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
             >
                <Map size={16} />
                Plan
             </button>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-lg mx-auto space-y-8">

        {/* Hero Section */}
        <section className="text-center space-y-4 py-4">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
              Is it good for <br/> <span className="text-green-600 dark:text-green-400">{userGoal}?</span>
            </h2>
        </section>

        {/* Main Action Area */}
        <div className="space-y-4">
            {/* Analyzer Loading/Error State */}
            {(appState === AppState.ANALYZING || isProcessing) ? (
                 <FoodLoader progress={loadingProgress} stage={loadingStage} />
            ) : appState === AppState.ERROR ? (
                <div className="w-full bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/30 p-6 text-center space-y-4">
                    <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center text-red-500 dark:text-red-400">
                        <ScanBarcode size={24} />
                    </div>
                    <h3 className="text-red-800 dark:text-red-300 font-semibold">Error</h3>
                    <p className="text-red-600 dark:text-red-400 text-sm">{errorMsg}</p>
                    <button 
                        onClick={handleReset}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-red-500/30 transition-all active:scale-95"
                    >
                        Try Again
                    </button>
                </div>
            ) : (
                <>
                {/* Large Scan Button */}
                <button 
                    onClick={handleScan}
                    className="group relative w-full h-40 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl shadow-gray-900/20 flex flex-col items-center justify-center overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop')] opacity-20 bg-cover bg-center group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="relative z-10 flex flex-col items-center gap-3">
                        <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/40 group-hover:bg-green-400 transition-colors">
                            <ScanBarcode size={28} />
                        </div>
                        <span className="text-white font-bold text-lg">Tap to Scan</span>
                    </div>
                </button>

                {/* Manual Search Form */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400" />
                    </div>
                    <form onSubmit={handleManualSearch}>
                        <input 
                            type="text" 
                            placeholder="Or type product name (e.g. Lays Classic)" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm rounded-xl focus:ring-green-500 focus:border-green-500 block pl-10 p-4 shadow-sm transition-colors"
                        />
                    </form>
                </div>
                </>
            )}
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <HistoryIcon size={18} className="text-gray-400" />
                    Today's Scans
                </h3>
                <button 
                    onClick={handleGenerateReport}
                    disabled={isProcessing}
                    className="text-xs font-semibold bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                >
                    <FileText size={14} />
                    Daily Report
                </button>
            </div>
            
            <div className="space-y-3">
                {history.map((item) => (
                    <button 
                        key={item.id}
                        onClick={() => handleHistoryClick(item)}
                        className="w-full bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                    >
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
                             {item.imageThumbnail ? (
                                <img src={item.imageThumbnail} alt={item.productName} className="w-full h-full object-cover" />
                             ) : (
                                <Search size={20} />
                             )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white truncate">{item.productName}</h4>
                            <div className="flex items-center justify-between mt-1">
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    <span>{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    <span>•</span>
                                    <span>{item.calories} kcal</span>
                                </div>
                                <span className={`text-xs font-bold ${item.healthScore >= 7 ? 'text-green-600 dark:text-green-400' : item.healthScore <= 4 ? 'text-red-500 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                    {item.healthScore}/10
                                </span>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-gray-300 dark:text-gray-600" />
                    </button>
                ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default App;