import { SupabaseClient } from '@supabase/supabase-js'

interface AuditParams {
  supabase: SupabaseClient
  user_id: string
  date: string
  action: string
  field?: string
  old_value?: string | null
  new_value?: string | null
}

export async function writeAudit({
  supabase,
  user_id,
  date,
  action,
  field,
  old_value,
  new_value,
}: AuditParams) {
  await supabase.from('audit_logs').insert({
    user_id,
    date,
    action,
    field: field ?? null,
    old_value: old_value !== undefined ? String(old_value ?? '') : null,
    new_value: new_value !== undefined ? String(new_value ?? '') : null,
  })
}
