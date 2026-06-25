import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

function from()            { return process.env.EMAIL_FROM         ?? 'NEEDFOOT. <onboarding@resend.dev>' }
function adminEmail()      { return process.env.ADMIN_EMAIL        ?? '' }
function transporterEmail(){ return process.env.TRANSPORTER_EMAIL  ?? '' }

interface OrderItem {
  productName: string
  size?: string | null
  quantity: number
  priceEur: number
}

interface OrderEmailData {
  orderId:         string
  customerName:    string | null
  customerEmail:   string | null
  shippingAddress: string | null
  totalEur:        number
  items:           OrderItem[]
}

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €'
}

// Escape values interpolated into HTML emails (customer name/address/email come
// from Stripe and are partly user-controlled — prevent HTML/markup injection).
function esc(v: unknown): string {
  return String(v ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function itemsTable(items: OrderItem[]) {
  return items.map(i => {
    const label = i.size ? `${i.productName} — ${i.size}` : i.productName
    return `<tr>
      <td style="padding:10px 0;border-bottom:1px solid #F3F4F6;color:#374151;font-size:14px">${esc(label)}</td>
      <td style="padding:10px 0;border-bottom:1px solid #F3F4F6;color:#9CA3AF;font-size:14px;text-align:center">×${i.quantity}</td>
      <td style="padding:10px 0;border-bottom:1px solid #F3F4F6;font-weight:600;color:#111827;font-size:14px;text-align:right">${formatPrice(i.priceEur * i.quantity)}</td>
    </tr>`
  }).join('')
}

function wrapper(content: string) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:40px 0">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:12px;border:1px solid #E5E7EB;overflow:hidden">
        <tr><td style="background:#111827;padding:24px 32px">
          <span style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px">NEEDFOOT.</span>
        </td></tr>
        <tr><td style="padding:32px">${content}</td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #F3F4F6;background:#FAFAFA;color:#9CA3AF;font-size:12px;text-align:center">
          NEEDFOOT. — Maillots de sport authentiques
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

export async function sendOrderConfirmationToCustomer(data: OrderEmailData) {
  if (!data.customerEmail) return

  const addressBlock = data.shippingAddress
    ? `<div style="background:#F9FAFB;border-radius:8px;padding:14px 16px;margin-top:24px">
        <p style="font-size:11px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 8px">Adresse de livraison</p>
        <p style="font-size:14px;color:#374151;margin:0;line-height:1.6;white-space:pre-line">${esc(data.shippingAddress)}</p>
       </div>`
    : ''

  const html = wrapper(`
    <h1 style="font-size:28px;font-weight:800;color:#111827;margin:0 0 8px;letter-spacing:-0.5px">Commande confirmée ✓</h1>
    <p style="color:#6B7280;font-size:15px;margin:0 0 28px;line-height:1.5">
      Bonjour ${esc(data.customerName ?? 'cher client')},<br>
      Ta commande a bien été reçue et sera préparée sous 3 à 4 jours.
    </p>
    <p style="font-size:11px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 8px">Récapitulatif</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${itemsTable(data.items)}
      <tr>
        <td colspan="2" style="padding:14px 0 0;font-weight:700;color:#111827;font-size:15px">Total</td>
        <td style="padding:14px 0 0;font-weight:700;color:#111827;font-size:15px;text-align:right">${formatPrice(data.totalEur)}</td>
      </tr>
    </table>
    ${addressBlock}
    <p style="color:#9CA3AF;font-size:13px;margin:28px 0 0">Délais estimés : préparation 3–4 jours, puis livraison suivie 10–15 jours.</p>
    <p style="color:#9CA3AF;font-size:13px;margin:6px 0 0">Retours sous 14 jours. Les articles personnalisés ne sont pas échangeables.</p>
    <p style="color:#9CA3AF;font-size:13px;margin:6px 0 0">Réf. : <code style="font-family:monospace;color:#6B7280">${esc(data.orderId)}</code></p>
  `)

  await getResend().emails.send({
    from:    from(),
    to:      data.customerEmail,
    subject: `Commande confirmée — NEEDFOOT. (#${data.orderId.slice(0, 12)})`,
    html,
  })
}

export async function sendNewOrderToAdmin(data: OrderEmailData) {
  if (!adminEmail()) return

  const addressBlock = data.shippingAddress
    ? `<div style="background:#F9FAFB;border-radius:8px;padding:14px 16px;margin-top:20px">
        <p style="font-size:11px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 6px">Adresse de livraison</p>
        <p style="font-size:13px;color:#374151;margin:0;line-height:1.6;white-space:pre-line">${esc(data.shippingAddress)}</p>
       </div>`
    : ''

  const html = wrapper(`
    <div style="background:#FEF3C7;border:1px solid #FDE68A;border-radius:8px;padding:14px 16px;margin-bottom:24px">
      <span style="font-size:13px;font-weight:600;color:#92400E">Nouvelle commande a preparer sous 3 a 4 jours</span>
    </div>
    <p style="font-size:14px;color:#374151;margin:0 0 4px"><strong>Client :</strong> ${esc(data.customerName ?? '—')} (${esc(data.customerEmail ?? '—')})</p>
    <p style="font-size:14px;color:#374151;margin:0 0 20px"><strong>Ref :</strong> <code style="font-family:monospace">${esc(data.orderId)}</code></p>
    <p style="font-size:11px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 8px">Articles</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${itemsTable(data.items)}
      <tr>
        <td colspan="2" style="padding:12px 0 0;font-weight:700;color:#111827;font-size:14px">Total encaisse</td>
        <td style="padding:12px 0 0;font-weight:700;color:#059669;font-size:14px;text-align:right">${formatPrice(data.totalEur)}</td>
      </tr>
    </table>
    ${addressBlock}
    <p style="color:#6B7280;font-size:13px;margin:20px 0 0">Rappel délais client : préparation 3–4 jours, puis livraison suivie 10–15 jours.</p>
  `)

  await getResend().emails.send({
    from:    from(),
    to:      adminEmail(),
    subject: `Nouvelle commande ${formatPrice(data.totalEur)} — ${data.customerName ?? data.customerEmail ?? '?'}`,
    html,
  })
}

export async function sendShipmentRequestToTransporter(data: OrderEmailData) {
  if (!transporterEmail()) return

  const addressBlock = data.shippingAddress
    ? `<div style="background:#DBEAFE;border:1px solid #BFDBFE;border-radius:8px;padding:16px;margin-top:20px">
        <p style="font-size:11px;font-weight:600;color:#1E40AF;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 8px">Adresse de livraison</p>
        <p style="font-size:14px;color:#1E3A5F;margin:0;line-height:1.8;font-weight:500;white-space:pre-line">${esc(data.shippingAddress)}</p>
       </div>`
    : ''

  const html = wrapper(`
    <div style="background:#D1FAE5;border:1px solid #A7F3D0;border-radius:8px;padding:14px 16px;margin-bottom:24px">
      <span style="font-size:13px;font-weight:600;color:#065F46">Nouveau colis a enlever et livrer</span>
    </div>
    <p style="font-size:14px;color:#374151;margin:0 0 4px"><strong>Destinataire :</strong> ${esc(data.customerName ?? '—')}</p>
    <p style="font-size:14px;color:#374151;margin:0 0 20px"><strong>Ref. commande :</strong> <code style="font-family:monospace">${esc(data.orderId)}</code></p>
    <p style="font-size:11px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 8px">Contenu du colis</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${itemsTable(data.items)}
    </table>
    ${addressBlock}
    <p style="color:#6B7280;font-size:13px;margin:24px 0 0">Le colis sera disponible a l'enlevement des confirmation de l'expedition dans le portail fournisseur. Livraison client estimee : 10–15 jours apres preparation.</p>
  `)

  await getResend().emails.send({
    from:    from(),
    to:      transporterEmail(),
    subject: `Enlevement + livraison — ${data.customerName ?? data.orderId.slice(0, 12)} (${formatPrice(data.totalEur)})`,
    html,
  })
}

export interface ContactMessage {
  name:    string
  email:   string
  subject: string
  message: string
}

/** Forward a contact-form message to the shop inbox (reply-to = sender). */
export async function sendContactMessage(data: ContactMessage): Promise<{ delivered: boolean }> {
  const to = adminEmail()
  if (!to) {
    console.warn('[contact] ADMIN_EMAIL non défini — message non remis :', data.email)
    return { delivered: false }
  }

  const html = wrapper(`
    <div style="background:#F3F4F6;border-radius:8px;padding:14px 16px;margin-bottom:24px">
      <span style="font-size:13px;font-weight:600;color:#111827">Nouveau message de contact</span>
    </div>
    <p style="font-size:14px;color:#374151;margin:0 0 4px"><strong>Nom :</strong> ${esc(data.name)}</p>
    <p style="font-size:14px;color:#374151;margin:0 0 4px"><strong>Email :</strong> ${esc(data.email)}</p>
    <p style="font-size:14px;color:#374151;margin:0 0 20px"><strong>Sujet :</strong> ${esc(data.subject)}</p>
    <p style="font-size:11px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 8px">Message</p>
    <p style="font-size:14px;color:#374151;margin:0;line-height:1.7;white-space:pre-line">${esc(data.message)}</p>
  `)

  await getResend().emails.send({
    from:    from(),
    to,
    replyTo: data.email,
    subject: `Contact — ${data.subject} · ${data.name}`,
    html,
  }).then(({ error }) => {
    // The Resend SDK resolves (does not throw) on delivery errors such as an
    // unverified sending domain. Surface them so the API returns a real error
    // instead of a misleading success.
    if (error) throw new Error(`Resend: ${error.message}`)
  })
  return { delivered: true }
}
