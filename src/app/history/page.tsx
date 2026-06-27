import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { calcCheckinPoints, calcCigarroPoints, isPerfectDay } from '@/lib/points'
import Nav from '@/components/ui/Nav'
import { DailyCheckin, ExerciseLog } from '@/types'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: checkins }, { data: exercises }] = await Promise.all([
    supabase.from('daily_checkins').select('*').eq('user_id', user.id).order('date', { ascending: false }),
    supabase.from('exercise_logs').select('*').eq('user_id', user.id),
  ])

  const exerciseByDate = new Set((exercises ?? []).map((e: ExerciseLog) => e.date))

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px 16px' }}>

        <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)', marginBottom: '20px' }}>
          Histórico
        </h1>

        {!checkins?.length && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '60px', fontSize: '14px' }}>
            Nenhum check-in ainda.<br />Volte ao início e marque seu primeiro dia! 🎯
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(checkins ?? []).map((c: DailyCheckin) => {
            const pts = calcCheckinPoints(c)
            const perfect = isPerfectDay(c)
            const hasEx = exerciseByDate.has(c.date)

            return (
              <div key={c.id} style={{
                background: 'var(--surface)',
                border: `1px solid ${perfect ? 'var(--green-dim)' : 'var(--border)'}`,
                borderRadius: '12px',
                padding: '14px 16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>
                      {formatDate(c.date)}
                    </span>
                    {perfect && <span style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--green)' }}>⭐ Perfeito</span>}
                  </div>
                  <span style={{ fontSize: '18px', fontWeight: '700', color: perfect ? 'var(--green)' : 'var(--accent)' }}>
                    {pts + (perfect ? 10 : 0)}
                    <span style={{ fontSize: '11px', fontWeight: '400', color: 'var(--text-muted)' }}>pts</span>
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <Chip done={c.agua} icon="💧" label="Água" />
                  <Chip done={c.fruta} icon="🍎" label="Fruta" />
                  <Chip done={c.legume} icon="🥦" label="Legume" />
                  <Chip done={c.sem_fast_food} icon="🚫" label="Sem FF" />
                  <Chip done={c.leitura} icon="📖" label="Leitura" />
                  <Chip done={hasEx} icon="🏋️" label="Treino" />
                  {c.cigarros !== null && (
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      background: c.cigarros === 0 ? 'var(--green-dim)' : 'var(--surface2)',
                      color: c.cigarros === 0 ? 'var(--green)' : 'var(--text-muted)',
                      border: '1px solid var(--border)',
                    }}>
                      🚬 {c.cigarros === 0 ? 'zero' : `≤${c.cigarros}`}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

      </div>
      <Nav />
    </div>
  )
}

function Chip({ done, icon, label }: { done: boolean; icon: string; label: string }) {
  return (
    <span style={{
      padding: '3px 8px',
      borderRadius: '20px',
      fontSize: '11px',
      background: done ? 'rgba(74,222,128,0.1)' : 'var(--surface2)',
      color: done ? 'var(--green)' : 'var(--text-muted)',
      border: `1px solid ${done ? 'var(--green-dim)' : 'var(--border)'}`,
      opacity: done ? 1 : 0.5,
    }}>
      {icon} {label}
    </span>
  )
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'short', day: 'numeric', month: 'short'
  })
}
