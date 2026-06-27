'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { writeAudit } from '@/lib/audit'
import { DailyCheckin } from '@/types'
import { calcCheckinPoints, calcCigarroPoints, isPerfectDay } from '@/lib/points'

interface Props {
  userId: string
  today: string
  initial: DailyCheckin | null
  exerciseCount: number
  onExerciseToggle: (added: boolean) => void
  todayExerciseId: string | null
}

const BOOL_FIELDS: { key: keyof DailyCheckin; label: string; icon: string; pts: number }[] = [
  { key: 'agua', label: '2L de água', icon: '💧', pts: 2 },
  { key: 'fruta', label: '1 fruta', icon: '🍎', pts: 1 },
  { key: 'legume', label: '1 legume no almoço', icon: '🥦', pts: 1 },
  { key: 'sem_fast_food', label: 'Sem fast food', icon: '🚫', pts: 3 },
  { key: 'leitura', label: '2 páginas de livro', icon: '📖', pts: 2 },
]

const CIGARRO_OPTIONS = [
  { value: 0, label: '0', pts: 15, color: 'var(--green)' },
  { value: 5, label: '≤5', pts: 8, color: 'var(--blue)' },
  { value: 7, label: '≤7', pts: 5, color: 'var(--amber)' },
  { value: 10, label: '≤10', pts: 3, color: 'var(--red)' },
]

export default function CheckinForm({ userId, today, initial, exerciseCount, onExerciseToggle, todayExerciseId }: Props) {
  const [checkin, setCheckin] = useState<Partial<DailyCheckin>>(initial ?? {})
  const [saved, setSaved] = useState(!!initial)
  const [saving, startSaving] = useTransition()
  const [exLoading, startExLoading] = useTransition()

  const supabase = createClient()

  async function toggleBool(field: keyof DailyCheckin) {
    const oldVal = checkin[field] as boolean | undefined
    const newVal = !oldVal
    const updated = { ...checkin, [field]: newVal }
    setCheckin(updated)

    if (saved) {
      startSaving(async () => {
        await supabase.from('daily_checkins').update({ [field]: newVal, updated_at: new Date().toISOString() }).eq('user_id', userId).eq('date', today)
        await writeAudit({ supabase, user_id: userId, date: today, action: 'checkin_update', field: String(field), old_value: String(oldVal ?? false), new_value: String(newVal) })
      })
    }
  }

  async function setCigarros(value: number) {
    const oldVal = checkin.cigarros
    const updated = { ...checkin, cigarros: value }
    setCheckin(updated)

    if (saved) {
      startSaving(async () => {
        await supabase.from('daily_checkins').update({ cigarros: value, updated_at: new Date().toISOString() }).eq('user_id', userId).eq('date', today)
        await writeAudit({ supabase, user_id: userId, date: today, action: 'checkin_update', field: 'cigarros', old_value: String(oldVal), new_value: String(value) })
      })
    }
  }

  async function saveCheckin() {
    startSaving(async () => {
      const payload = {
        user_id: userId,
        date: today,
        agua: checkin.agua ?? false,
        fruta: checkin.fruta ?? false,
        legume: checkin.legume ?? false,
        sem_fast_food: checkin.sem_fast_food ?? false,
        cigarros: checkin.cigarros ?? null,
        leitura: checkin.leitura ?? false,
        updated_at: new Date().toISOString(),
      }
      await supabase.from('daily_checkins').upsert(payload)
      await writeAudit({ supabase, user_id: userId, date: today, action: 'checkin_create' })
      setSaved(true)
    })
  }

  async function toggleExercise() {
    startExLoading(async () => {
      if (todayExerciseId) {
        await supabase.from('exercise_logs').delete().eq('id', todayExerciseId)
        await writeAudit({ supabase, user_id: userId, date: today, action: 'exercise_remove' })
        onExerciseToggle(false)
      } else {
        const { data } = await supabase.from('exercise_logs').insert({ user_id: userId, date: today }).select().single()
        await writeAudit({ supabase, user_id: userId, date: today, action: 'exercise_add' })
        onExerciseToggle(true)
      }
    })
  }

  const asCheckin = checkin as DailyCheckin
  const pts = calcCheckinPoints(asCheckin)
  const perfect = isPerfectDay(asCheckin)

  return (
    <div>
      {/* Points badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
      }}>
        <div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Hoje
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {new Date(today + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{
            fontSize: '28px',
            fontWeight: '700',
            color: perfect ? 'var(--green)' : 'var(--accent)',
          }}>
            {pts}{perfect ? '+10' : ''}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '3px' }}>pts</span>
          {perfect && (
            <p style={{ fontSize: '11px', color: 'var(--green)', marginTop: '2px' }}>⭐ Dia perfeito!</p>
          )}
        </div>
      </div>

      {/* Bool items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {BOOL_FIELDS.map(f => {
          const checked = !!(checkin[f.key])
          return (
            <button
              key={f.key}
              onClick={() => toggleBool(f.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px',
                background: checked ? 'rgba(74, 222, 128, 0.08)' : 'var(--surface2)',
                border: `1px solid ${checked ? 'var(--green-dim)' : 'var(--border)'}`,
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
                width: '100%',
              }}
            >
              <span style={{ fontSize: '22px' }}>{f.icon}</span>
              <span style={{ flex: 1, fontSize: '14px', color: checked ? 'var(--text)' : 'var(--text-muted)', fontWeight: checked ? '500' : '400' }}>
                {f.label}
              </span>
              <span style={{ fontSize: '12px', color: checked ? 'var(--green)' : 'var(--text-muted)', fontWeight: '600' }}>
                {checked ? `+${f.pts}` : `${f.pts}pts`}
              </span>
              <span style={{
                width: '22px', height: '22px',
                borderRadius: '50%',
                background: checked ? 'var(--green)' : 'transparent',
                border: `2px solid ${checked ? 'var(--green)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', color: '#000',
                flexShrink: 0,
              }}>
                {checked ? '✓' : ''}
              </span>
            </button>
          )
        })}
      </div>

      {/* Cigarros */}
      <div style={{
        padding: '14px',
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        marginBottom: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <span style={{ fontSize: '22px' }}>🚬</span>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Cigarros hoje</span>
          {checkin.cigarros !== undefined && checkin.cigarros !== null && (
            <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--green)', fontWeight: '600' }}>
              +{calcCigarroPoints(checkin.cigarros)}pts
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {CIGARRO_OPTIONS.map(opt => {
            const selected = checkin.cigarros === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => setCigarros(opt.value)}
                style={{
                  flex: 1,
                  padding: '10px 4px',
                  background: selected ? `${opt.color}22` : 'var(--surface)',
                  border: `1.5px solid ${selected ? opt.color : 'var(--border)'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: '700', color: selected ? opt.color : 'var(--text)' }}>
                  {opt.label}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{opt.pts}pts</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Exercício */}
      <button
        onClick={toggleExercise}
        disabled={exLoading}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px',
          background: todayExerciseId ? 'rgba(96, 165, 250, 0.08)' : 'var(--surface2)',
          border: `1px solid ${todayExerciseId ? 'var(--blue-dim)' : 'var(--border)'}`,
          borderRadius: '12px',
          cursor: 'pointer',
          width: '100%',
          marginBottom: '8px',
        }}
      >
        <span style={{ fontSize: '22px' }}>🏋️</span>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <p style={{ fontSize: '14px', color: todayExerciseId ? 'var(--text)' : 'var(--text-muted)', fontWeight: todayExerciseId ? '500' : '400' }}>
            Exercício hoje
          </p>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {exerciseCount}/4 na semana · meta: 4x
          </p>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--blue)', fontWeight: '600' }}>
          {exerciseCount >= 4 ? '20pts ✓' : exerciseCount === 3 ? '10pts' : exerciseCount === 2 ? '5pts' : exerciseCount === 1 ? '2pts' : '-'}
        </span>
        <span style={{
          width: '22px', height: '22px',
          borderRadius: '50%',
          background: todayExerciseId ? 'var(--blue)' : 'transparent',
          border: `2px solid ${todayExerciseId ? 'var(--blue)' : 'var(--border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', color: '#000',
          flexShrink: 0,
        }}>
          {todayExerciseId ? '✓' : ''}
        </span>
      </button>

      {/* Save button (only before first save) */}
      {!saved && (
        <button
          onClick={saveCheckin}
          disabled={saving}
          style={{
            width: '100%',
            marginTop: '8px',
            padding: '14px',
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Salvando...' : 'Salvar check-in'}
        </button>
      )}

      {saved && (
        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
          {saving ? '💾 Salvando...' : '✓ Salvo automaticamente'}
        </p>
      )}
    </div>
  )
}
