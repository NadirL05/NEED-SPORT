import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { enforceRateLimit, getClientIp } from '@/lib/rate-limit'
import { sendContactMessage } from '@/lib/email'

const schema = z.object({
  name:    z.string().trim().min(2).max(80),
  email:   z.string().trim().max(120).pipe(z.email()),
  subject: z.string().trim().min(2).max(120),
  message: z.string().trim().min(10).max(2000),
  company: z.string().max(100).optional(), // honeypot — must stay empty
})

const FIELD_MESSAGES: Record<string, string> = {
  name:    'Indiquez votre nom (2 caractères minimum).',
  email:   'Adresse e-mail invalide.',
  subject: 'Indiquez un sujet.',
  message: 'Votre message doit faire au moins 10 caractères.',
}

export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit(
    `contact:ip:${getClientIp(req)}`,
    5,
    600,
    'Trop de messages envoyés. Réessayez dans quelques minutes.',
  )
  if (limited) return limited

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    const field = String(parsed.error.issues[0]?.path[0] ?? '')
    return NextResponse.json(
      { error: FIELD_MESSAGES[field] ?? 'Veuillez vérifier les champs du formulaire.' },
      { status: 400 },
    )
  }

  // Honeypot: a genuine user never fills this hidden field. Silently accept.
  if (parsed.data.company && parsed.data.company.trim() !== '') {
    return NextResponse.json({ ok: true })
  }

  const { name, email, subject, message } = parsed.data
  try {
    await sendContactMessage({ name, email, subject, message })
  } catch (e) {
    console.error('[contact] envoi échoué:', e)
    return NextResponse.json(
      { error: "L'envoi a échoué. Réessayez ou écrivez-nous à contact@needfoot.fr." },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true })
}
