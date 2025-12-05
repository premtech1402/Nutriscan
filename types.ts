export interface NutritionData {
  productName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  healthScore: number;
  summary: string;
  pros: string[];
  cons: string[];
  effectOnBody: string;
  consumptionAdvice: string;
}

export interface ScanHistoryItem extends NutritionData {
  id: string;
  timestamp: number;
  imageThumbnail: string | null;
}

export interface DailyReportData {
  totalCalories: number;
  macroBalance: string;
  score: number;
  analysis: string;
  recommendations: string[];
}

export interface GoalGuideData {
  goalName: string;
  summary: string;
  guidelines: {
    title: string;
    description: string;
    type: 'do' | 'dont' | 'tip';
  }[];
  schedule: {
    time: string;
    activity: string;
    description: string;
  }[];
}

export enum AppState {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT',
  DAILY_REPORT = 'DAILY_REPORT',
  GOAL_GUIDE = 'GOAL_GUIDE',
  ERROR = 'ERROR'
}
