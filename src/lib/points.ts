import { DailyCheckin, ExerciseLog } from '@/types'

export function calcCigarroPoints(cigarros: number | null): number {
  if (cigarros === null) return 0
  if (cigarros === 0) return 15
  if (cigarros <= 5) return 8
  if (cigarros <= 7) return 5
  if (cigarros <= 10) return 3
  return 0
}

export function calcCheckinPoints(checkin: DailyCheckin): number {
  let pts = 0
  if (checkin.agua) pts += 2
  if (checkin.fruta) pts += 1
  if (checkin.legume) pts += 1
  if (checkin.sem_fast_food) pts += 3
  if (checkin.leitura) pts += 2
  pts += calcCigarroPoints(checkin.cigarros)
  return pts
}

export function isPerfectDay(checkin: DailyCheckin): boolean {
  return (
    checkin.agua &&
    checkin.fruta &&
    checkin.legume &&
    checkin.sem_fast_food &&
    checkin.leitura &&
    checkin.cigarros === 0
  )
}

export function calcExercisePoints(weekCount: number): number {
  return weekCount >= 4 ? 20 : 0
}

export function calcStreakBonus(streakDays: number): number {
  if (streakDays >= 14) return 60
  if (streakDays >= 7) return 25
  if (streakDays >= 3) return 10
  return 0
}

// Get ISO week string (YYYY-Www) for a date
export function getWeekKey(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  const day = d.getDay() || 7 // mon=1..sun=7
  d.setDate(d.getDate() + 4 - day)
  const yearStart = new Date(d.getFullYear(), 0, 1)
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`
}

export interface TotalScore {
  base: number
  bonusPerfect: number
  bonusStreak: number
  exercise: number
  total: number
  streak: number
  perfectDays: number
}

export function calcTotalScore(
  checkins: DailyCheckin[],
  exercises: ExerciseLog[]
): TotalScore {
  // Sort checkins by date
  const sorted = [...checkins].sort((a, b) => a.date.localeCompare(b.date))

  let base = 0
  let bonusPerfect = 0
  let bonusStreak = 0
  let streak = 0
  let perfectDays = 0

  for (const c of sorted) {
    const pts = calcCheckinPoints(c)
    base += pts

    if (isPerfectDay(c)) {
      bonusPerfect += 10
      streak++
      perfectDays++
      const sb = calcStreakBonus(streak)
      if (streak === 3 || streak === 7 || streak === 14) {
        bonusStreak += sb
      }
    } else {
      streak = 0
    }
  }

  // Exercise points by week
  const weekMap: Record<string, number> = {}
  for (const e of exercises) {
    const wk = getWeekKey(e.date)
    weekMap[wk] = (weekMap[wk] || 0) + 1
  }
  const exercise = Object.values(weekMap).reduce(
    (sum, count) => sum + calcExercisePoints(count),
    0
  )

  return {
    base,
    bonusPerfect,
    bonusStreak,
    exercise,
    total: base + bonusPerfect + bonusStreak + exercise,
    streak,
    perfectDays,
  }
}

// Points for current week only
export function calcWeekScore(
  checkins: DailyCheckin[],
  exercises: ExerciseLog[],
  weekKey: string
): number {
  const weekCheckins = checkins.filter(c => getWeekKey(c.date) === weekKey)
  const weekExercises = exercises.filter(e => getWeekKey(e.date) === weekKey)

  let pts = 0
  let streak = 0
  for (const c of weekCheckins) {
    pts += calcCheckinPoints(c)
    if (isPerfectDay(c)) {
      pts += 10
      streak++
    } else {
      streak = 0
    }
  }
  pts += calcExercisePoints(weekExercises.length)
  return pts
}
