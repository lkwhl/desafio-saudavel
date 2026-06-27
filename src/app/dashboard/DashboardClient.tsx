'use client'

import { useState } from 'react'
import CheckinForm from '@/components/checkin/CheckinForm'
import { DailyCheckin } from '@/types'

interface Props {
  userId: string
  today: string
  initialCheckin: DailyCheckin | null
  weekExerciseCount: number
  todayExerciseId: string | null
}

export default function DashboardClient({ userId, today, initialCheckin, weekExerciseCount, todayExerciseId }: Props) {
  const [exCount, setExCount] = useState(weekExerciseCount)
  const [exId, setExId] = useState<string | null>(todayExerciseId)

  function handleExerciseToggle(added: boolean) {
    setExCount(c => added ? c + 1 : c - 1)
    if (!added) setExId(null)
    // If added, page will re-render on next visit; for now just count is enough
  }

  return (
    <CheckinForm
      userId={userId}
      today={today}
      initial={initialCheckin}
      exerciseCount={exCount}
      onExerciseToggle={handleExerciseToggle}
      todayExerciseId={exId}
    />
  )
}
