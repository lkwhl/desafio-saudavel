'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const tabs = [
  { href: '/dashboard', label: 'Hoje', icon: '🏠' },
  { href: '/history', label: 'Histórico', icon: '📅' },
  { href: '/audit', label: 'Auditoria', icon: '📋' },
]

export default function Nav() {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
      zIndex: 50,
    }}>
      {tabs.map(tab => {
        const active = pathname === tab.href
        return (
          <Link key={tab.href} href={tab.href} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            padding: '4px 16px',
            textDecoration: 'none',
            color: active ? 'var(--accent)' : 'var(--text-muted)',
            transition: 'color 0.15s',
          }}>
            <span style={{ fontSize: '20px' }}>{tab.icon}</span>
            <span style={{ fontSize: '10px', fontWeight: active ? '600' : '400' }}>{tab.label}</span>
          </Link>
        )
      })}
      <button onClick={logout} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '3px',
        padding: '4px 16px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--text-muted)',
      }}>
        <span style={{ fontSize: '20px' }}>🚪</span>
        <span style={{ fontSize: '10px' }}>Sair</span>
      </button>
    </nav>
  )
}
