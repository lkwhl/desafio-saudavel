'use client'

interface ScoreData {
  name: string
  total: number
  weekPts: number
  streak: number
  perfectDays: number
  isMe: boolean
}

export default function Scoreboard({ me, partner }: { me: ScoreData; partner: ScoreData }) {
  const maxTotal = Math.max(me.total, partner.total, 1)

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '20px',
    }}>
      <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
        Placar Geral
      </p>

      {[me, partner].map((player) => (
        <div key={player.name} style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: player.isMe ? 'var(--accent)' : 'var(--text)' }}>
                {player.name}
              </span>
              {player.isMe && (
                <span style={{ fontSize: '10px', background: 'var(--accent-dim)', color: 'var(--accent)', padding: '1px 6px', borderRadius: '4px' }}>
                  você
                </span>
              )}
            </div>
            <span style={{ fontSize: '20px', fontWeight: '700', color: player.isMe ? 'var(--accent)' : 'var(--text)' }}>
              {player.total}
              <span style={{ fontSize: '11px', fontWeight: '400', color: 'var(--text-muted)', marginLeft: '2px' }}>pts</span>
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ height: '6px', background: 'var(--surface2)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(player.total / maxTotal) * 100}%`,
              background: player.isMe ? 'var(--accent)' : 'var(--blue)',
              borderRadius: '3px',
              transition: 'width 0.6s ease',
            }} />
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <Stat icon="📅" label="semana" value={`${player.weekPts}pts`} />
            <Stat icon="🔥" label="streak" value={`${player.streak}d`} />
            <Stat icon="⭐" label="perfeitos" value={`${player.perfectDays}d`} />
          </div>
        </div>
      ))}
    </div>
  )
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span style={{ fontSize: '12px' }}>{icon}</span>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)' }}>{value}</span>
    </div>
  )
}
