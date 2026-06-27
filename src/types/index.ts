export interface DailyCheckin {
  id: string
  user_id: string
  date: string
  agua: boolean
  fruta: boolean
  legume: boolean
  sem_fast_food: boolean
  cigarros: number | null
  leitura: boolean
  created_at: string
  updated_at: string
}

export interface ExerciseLog {
  id: string
  user_id: string
  date: string
  created_at: string
}

export interface AuditLog {
  id: string
  user_id: string
  date: string
  action: string
  field: string | null
  old_value: string | null
  new_value: string | null
  created_at: string
}

export interface UserScore {
  user_id: string
  display_name: string
  total_points: number
  week_points: number
  streak: number
  today_done: boolean
}

export interface DayScore {
  date: string
  base_points: number
  bonus_points: number
  exercise_points: number
  total: number
  is_perfect: boolean
}

export const CHALLENGE_START = '2026-07-01'
export const CHALLENGE_END = '2026-08-16'

export const USERS: Record<string, string> = {
  // populated from env
}
