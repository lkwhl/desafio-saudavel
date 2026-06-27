import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { calcTotalScore, calcWeekScore, getWeekKey } from '@/lib/points'
import Nav from '@/components/ui/Nav'
import Scoreboard from '@/components/scoreboard/Scoreboard'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]
  const thisWeek = getWeekKey(today)

  // Fetch my data
  const [{ data: myCheckins }, { data: myExercises }, { data: todayCheckin }, { data: todayExercise }] = await Promise.all([
    supabase.from('daily_checkins').select('*').eq('user_id', user.id),
    supabase.from('exercise_logs').select('*').eq('user_id', user.id),
    supabase.from('daily_checkins').select('*').eq('user_id', user.id).eq('date', today).maybeSingle(),
    supabase.from('exercise_logs').select('*').eq('user_id', user.id).eq('date', today).maybeSingle(),
  ])

  // Fetch partner data (other user)
  const { data: partnerProfile } = await supabase
    .from('user_profiles')
    .select('*')
    .neq('user_id', user.id)
    .maybeSingle()

  const myScore = calcTotalScore(myCheckins ?? [], myExercises ?? [])
  const myWeekPts = calcWeekScore(myCheckins ?? [], myExercises ?? [], thisWeek)

  let partnerScore = { total: 0, streak: 0, perfectDays: 0 }
  let partnerWeekPts = 0
  let partnerName = 'Parceiro'

  if (partnerProfile) {
    const [{ data: pCheckins }, { data: pExercises }] = await Promise.all([
      supabase.from('daily_checkins').select('*').eq('user_id', partnerProfile.user_id),
      supabase.from('exercise_logs').select('*').eq('user_id', partnerProfile.user_id),
    ])
    partnerScore = calcTotalScore(pCheckins ?? [], pExercises ?? [])
    partnerWeekPts = calcWeekScore(pCheckins ?? [], pExercises ?? [], thisWeek)
    partnerName = partnerProfile.display_name
  }

  const { data: myProfile } = await supabase
    .from('user_profiles')
    .select('display_name')
    .eq('user_id', user.id)
    .maybeSingle()

  const weekExercises = (myExercises ?? []).filter(e => getWeekKey(e.date) === thisWeek)

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px 16px' }}>

        {/* Header */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)' }}>
            Olá, {myProfile?.display_name ?? 'você'} 👋
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {today === '2026-07-01' ? '🚀 Primeiro dia do desafio!' : `Dia ${getDayNumber(today)} de 47`}
          </p>
        </div>

        {/* Scoreboard */}
        <Scoreboard
          me={{
            name: myProfile?.display_name ?? 'Você',
            total: myScore.total,
            weekPts: myWeekPts,
            streak: myScore.streak,
            perfectDays: myScore.perfectDays,
            isMe: true,
          }}
          partner={{
            name: partnerName,
            total: partnerScore.total,
            weekPts: partnerWeekPts,
            streak: partnerScore.streak,
            perfectDays: partnerScore.perfectDays,
            isMe: false,
          }}
        />

        {/* Check-in */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '20px',
        }}>
          <DashboardClient
            userId={user.id}
            today={today}
            initialCheckin={todayCheckin}
            weekExerciseCount={weekExercises.length}
            todayExerciseId={todayExercise?.id ?? null}
          />
        </div>

      </div>
      <Nav />
    </div>
  )
}

function getDayNumber(today: string): number {
  const start = new Date('2026-07-01')
  const d = new Date(today + 'T12:00:00')
  return Math.floor((d.getTime() - start.getTime()) / 86400000) + 1
}
