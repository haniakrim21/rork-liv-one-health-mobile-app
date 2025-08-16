export interface Activity {
  id: string;
  type: string;
  duration: number;
  calories: number;
  date: string;
}

export interface Meal {
  id: string;
  name: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
}

export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  progress: number;
  color: string;
  deadline?: string;
}

export interface DailyStats {
  steps: number;
  calories: number;
  sleep: number;
  water: number;
  activeMinutes?: number;
  heartRate?: number;
}

export interface SleepData {
  bedtime: string;
  wakeTime: string;
  duration: number;
  quality: number;
  deepSleep?: number;
  remSleep?: number;
  lightSleep?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  height?: number;
  weight?: number;
  activityLevel?: "sedentary" | "light" | "moderate" | "active" | "very_active";
}