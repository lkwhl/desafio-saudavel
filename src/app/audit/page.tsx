import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/ui/Nav'
import { AuditLog } from '@/types'

const ACTION_LABELS: Record<string, string> = {
  checkin_create: 'Check-in criado',
  checkin_update: 'Item atualizado',
  exercise_add: 'Treino registrado',
  exercise_remove: 'Treino removido',
}

const FIELD_LABELS: Record<string, string> = {
  agua: '💧 Água',
  fruta: '🍎 Fruta',
  legume: '🥦 Legume',
  sem_fast_food: '🚫 Fast food',
  cigarros: '🚬 Cigarros',
  leitura: '📖 Leitura',
}

export default async function AuditPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px 16px' }}>

        <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)', marginBottom: '4px' }}>
          Auditoria
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Todas as alterações registradas, somente leitura.
        </p>

        {!logs?.length && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '60px', fontSize: '14px' }}>
            Nenhuma ação registrada ainda.
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(logs ?? []).map((log: AuditLog) => (
            <div key={log.id} style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '12px 14px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)' }}>
                    {ACTION_LABELS[log.action] ?? log.action}
                  </p>
                  {log.field && (
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {FIELD_LABELS[log.field] ?? log.field}
                      {log.old_value !== null && log.new_value !== null && (
                        <span>
                          {' '}· <span style={{ color: 'var(--red)' }}>{formatVal(log.field, log.old_value)}</span>
                          {' → '}
                          <span style={{ color: 'var(--green)' }}>{formatVal(log.field, log.new_value)}</span>
                        </span>
                      )}
                    </p>
                  )}
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
                    📅 {formatDate(log.date)}
                  </p>
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                  {formatTime(log.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
      <Nav />
    </div>
  )
}

function formatVal(field: string, val: string): string {
  if (field === 'cigarros') return val === 'null' ? '—' : `${val} cig.`
  return val === 'true' ? 'sim' : val === 'false' ? 'não' : val
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
}

function formatTime(isoStr: string): string {
  return new Date(isoStr).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}
