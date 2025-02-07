export interface SleepData {
  id: string;
  user_id: string;
  date: string;
  sleep_duration: number | null;
  deep_sleep_duration: number | null;
  rem_sleep_duration: number | null;
  light_sleep_duration: number | null;
  resting_heart_rate: number | null;
  temperature_deviation: number | null;
  bedtime_start: string | null;
  bedtime_end: string | null;
  created_at: string;
}

export interface AIRecommendation {
  id: string;
  user_id: string;
  recommendation: string;
  priority: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  is_ai: boolean;
  created_at: string;
} 