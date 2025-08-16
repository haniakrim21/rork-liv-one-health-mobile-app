import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";

interface Activity {
  id: string;
  type: string;
  duration: number;
  calories: number;
  date: string;
}

interface Meal {
  id: string;
  name: string;
  type: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
}

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  progress: number;
  color: string;
}

interface DailyStats {
  steps: number;
  calories: number;
  sleep: number;
  water: number;
}

interface SleepData {
  bedtime: string;
  wakeTime: string;
  duration: number;
  quality: number;
}

interface HealthData {
  dailyStats: DailyStats;
  activities: Activity[];
  meals: Meal[];
  goals: Goal[];
  sleepData: SleepData | null;
  addActivity: (activity: Activity) => void;
  addMeal: (meal: Meal) => void;
  updateSleep: (sleep: SleepData) => void;
}

export const [HealthDataProvider, useHealthData] = createContextHook<HealthData>(() => {
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    steps: 7543,
    calories: 1450,
    sleep: 7.5,
    water: 6,
  });

  const [activities, setActivities] = useState<Activity[]>([
    {
      id: "1",
      type: "Morning Run",
      duration: 30,
      calories: 300,
      date: new Date().toISOString(),
    },
    {
      id: "2",
      type: "Yoga",
      duration: 45,
      calories: 150,
      date: new Date().toISOString(),
    },
  ]);

  const [meals, setMeals] = useState<Meal[]>([
    {
      id: "1",
      name: "Oatmeal with Berries",
      type: "breakfast",
      calories: 350,
      protein: 12,
      carbs: 58,
      fat: 8,
      time: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Grilled Chicken Salad",
      type: "lunch",
      calories: 450,
      protein: 35,
      carbs: 25,
      fat: 18,
      time: new Date().toISOString(),
    },
  ]);

  const [goals] = useState<Goal[]>([
    {
      id: "1",
      title: "Daily Steps",
      target: 10000,
      current: 7543,
      unit: "steps",
      progress: 75,
      color: "#00C851",
    },
    {
      id: "2",
      title: "Weekly Workouts",
      target: 5,
      current: 3,
      unit: "workouts",
      progress: 60,
      color: "#1976D2",
    },
    {
      id: "3",
      title: "Water Intake",
      target: 8,
      current: 6,
      unit: "glasses",
      progress: 75,
      color: "#00ACC1",
    },
    {
      id: "4",
      title: "Sleep Hours",
      target: 8,
      current: 7.5,
      unit: "hours",
      progress: 94,
      color: "#7B1FA2",
    },
  ]);

  const [sleepData, setSleepData] = useState<SleepData | null>(null);

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    try {
      const savedActivities = await AsyncStorage.getItem("activities");
      const savedMeals = await AsyncStorage.getItem("meals");
      
      if (savedActivities) setActivities(JSON.parse(savedActivities));
      if (savedMeals) setMeals(JSON.parse(savedMeals));
    } catch (error) {
      console.error("Error loading health data:", error);
    }
  };

  const addActivity = async (activity: Activity) => {
    const updatedActivities = [activity, ...activities];
    setActivities(updatedActivities);
    await AsyncStorage.setItem("activities", JSON.stringify(updatedActivities));
    
    // Update daily stats
    setDailyStats(prev => ({
      ...prev,
      calories: prev.calories + activity.calories,
    }));
  };

  const addMeal = async (meal: Meal) => {
    const updatedMeals = [meal, ...meals];
    setMeals(updatedMeals);
    await AsyncStorage.setItem("meals", JSON.stringify(updatedMeals));
  };

  const updateSleep = (sleep: SleepData) => {
    setSleepData(sleep);
    setDailyStats(prev => ({
      ...prev,
      sleep: sleep.duration,
    }));
  };

  return {
    dailyStats,
    activities,
    meals,
    goals,
    sleepData,
    addActivity,
    addMeal,
    updateSleep,
  };
});