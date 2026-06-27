import { db } from '@/lib/db'
import { adminAuditLog } from '@/lib/db/schema'

export function auditAdminAction(params: {
  action: 'create' | 'update' | 'delete'
  resource: string
  resourceId?: string | number | null
  summary?: string
}): void {
  // Fire-and-forget: never await, never throw
  db.insert(adminAuditLog).values({
    action:     params.action,
    resource:   params.resource,
    resourceId: params.resourceId != null ? String(params.resourceId) : null,
    summary:    params.summary ?? null,
  }).catch(err => {
    console.error('[audit] Failed to log action', params, err)
  })
}
