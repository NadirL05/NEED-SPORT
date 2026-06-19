'use client'

import { useState } from 'react'

const SUBJECTS = [
  'Commande & livraison',
  'Taille / Produit',
  'Retour ou échange',
  'Personnalisation (flocage)',
  'Autre',
] as const

type Status = 'idle' | 'loading' | 'success' | 'error'

const EMPTY = { name: '', email: '', subject: SUBJECTS[0] as string, message: '', company: '' }

export default function ContactForm() {
  const [form, setForm] = useState({ ...EMPTY })
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'loading') return
    setStatus('loading')
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Une erreur est survenue. Réessayez.')
        setStatus('error')
        return
      }
      setStatus('success')
    } catch {
      setError('Connexion impossible. Vérifiez votre réseau et réessayez.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="contact-success" role="status">
        <div className="contact-success-ic" aria-hidden="true">✓</div>
        <h2>Message envoyé&nbsp;!</h2>
        <p>
          Merci {form.name.trim().split(' ')[0] || ''}, nous revenons vers vous sous 24h ouvrées.
        </p>
        <button
          type="button"
          className="cf-submit cf-submit--ghost"
          onClick={() => {
            setForm({ ...EMPTY })
            setStatus('idle')
          }}
        >
          Envoyer un autre message
        </button>
      </div>
    )
  }

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate>
      {status === 'error' && (
        <p className="contact-error" role="alert">{error}</p>
      )}

      <div className="cf-row">
        <div className="cf-field">
          <label htmlFor="cf-name">Nom</label>
          <input
            id="cf-name"
            name="name"
            value={form.name}
            onChange={set('name')}
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            placeholder="Votre nom"
          />
        </div>
        <div className="cf-field">
          <label htmlFor="cf-email">Email</label>
          <input
            id="cf-email"
            name="email"
            type="email"
            value={form.email}
            onChange={set('email')}
            required
            maxLength={120}
            autoComplete="email"
            placeholder="vous@exemple.com"
          />
        </div>
      </div>

      <div className="cf-field">
        <label htmlFor="cf-subject">Sujet</label>
        <select id="cf-subject" name="subject" value={form.subject} onChange={set('subject')}>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="cf-field">
        <label htmlFor="cf-message">Message</label>
        <textarea
          id="cf-message"
          name="message"
          value={form.message}
          onChange={set('message')}
          required
          minLength={10}
          maxLength={2000}
          rows={6}
          placeholder="Comment pouvons-nous vous aider ?"
        />
      </div>

      {/* Honeypot anti-spam — hidden from real users */}
      <input
        className="cf-hp"
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={form.company}
        onChange={set('company')}
      />

      <button type="submit" className="cf-submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Envoi…' : 'Envoyer le message'}
      </button>
      <p className="cf-note">Réponse sous 24h ouvrées · vos données ne sont jamais revendues.</p>
    </form>
  )
}
