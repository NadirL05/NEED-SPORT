# Design

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--void` | `#FAFAF9` | Main background (warm off-white) |
| `--void-2` | `#F2F1F0` | Secondary bg — footer, marquee, alternating sections |
| `--text` | `#0C0A09` | Primary text — warm near-black |
| `--text-2` | `#6B6368` | Secondary text — muted labels, subtitles |
| `--text-3` | `#A09B97` | Tertiary text — captions, timestamps |
| `--accent` | `#00C2FF` | Brand accent — cyan electric, CTAs, highlights |
| `--accent-glow` | `rgba(0,194,255,0.35)` | Glow shadow for accent elements |
| `--surface` | `rgba(0,0,0,0.04)` | Card fill, subtle overlays |
| `--border` | `rgba(0,0,0,0.10)` | Default borders |
| `--border-soft` | `rgba(0,0,0,0.07)` | Soft dividers |
| `--border-hover` | `rgba(0,194,255,0.45)` | Accent-tinted hover border |

Dark sections (Hero, Immersive, Pitch) restore dark-theme tokens via CSS scope overrides.

## Typography

| Role | Font | Size | Weight | Notes |
|------|------|------|--------|-------|
| Display/Hero | Bebas Neue | clamp(4.5rem, 14vw, 15.5rem) | 400 | Uppercase, letter-spacing 0.01em |
| Section headings | Bebas Neue | clamp(2.5rem, 5vw, 5.5rem) | 400 | Uppercase |
| Body | DM Sans | 1rem / 0.92rem | 300 | line-height 1.55 |
| Labels/Eyebrows | DM Sans | 0.7–0.8rem | 300 | Uppercase, letter-spacing 0.18–0.22em |

## Spacing

- Section padding: `120px 0` (desktop) / `80px 0` (mobile)
- Max content width: `1320px`
- Card gap: `18–20px`
- Wrap padding: `0 28px`

## Shadows (light mode)

- Card resting: `0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)`
- Card hover: `0 8px 32px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)`
- Nav scrolled: `0 1px 12px rgba(0,0,0,0.06)`
- Mega menu: `0 8px 40px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)`

## Border Radius

- Cards: `16px` (`--r-card`)
- Buttons/pills: `100px` (`--pill`)

## Motion

- Default ease: `cubic-bezier(0.2, 0.7, 0.2, 1)` (`--ease`)
- Ease-out: `cubic-bezier(0.16, 1, 0.3, 1)` (`--ease-out`)
- Micro-interactions: 150–300ms
- Card transitions: 350–500ms

## Dark Sections (scoped overrides)

`.hero`, `.immersive`: `color: #FFFFFF; --text: #FFFFFF; --text-2: rgba(255,255,255,0.65)`

`.pitch-sec`: Full dark token set — `background: #0A0A0B; --text: #FFFFFF; --text-2: #A0A0A5` etc.

## Component Notes

- **Buttons**: Primary uses `--accent` (cyan) with dark hover. Ghost uses dark border on light bg.
- **Nav**: Transparent at top → frosted white on scroll with shadow.
- **Drawer**: Light frosted on mobile.
- **Mega menu**: Frosted white with shadow. Link color: `rgba(0,0,0,0.65)`.
- **Cards**: White background with subtle shadow, cyan border on hover.
- **Filters**: Pill buttons; active state inverts to near-black with white text.
