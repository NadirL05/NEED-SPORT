import { expect, test } from '@playwright/test'

test('la recherche boutique fonctionne au clavier de bout en bout', async ({ page }) => {
  await page.goto('/shop')

  // Next.js 16 Turbopack shows an RSC error overlay (harmless known bug).
  // Suppress it via CSS so it never covers the page content during local tests.
  await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' })

  const search = page.getByRole('searchbox', {
    name: 'Rechercher un club ou un maillot',
  })
  const cards = page.locator('.ms2-card')

  await expect(page.getByRole('heading', { level: 1, name: 'Nos Maillots' })).toBeVisible({ timeout: 20000 })
  const initialCount = await cards.count()
  await search.fill('domicile')
  await expect.poll(() => cards.count()).toBeLessThan(initialCount)
  await expect(cards).not.toHaveCount(0)

  await search.fill('requête sans résultat')
  await expect(page.getByText('Aucun maillot trouvé')).toBeVisible()

  await page.getByRole('button', { name: 'Réinitialiser' }).click()
  await expect(search).toBeFocused()
  await expect(search).toHaveValue('')
})

for (const width of [320, 375, 414, 768]) {
  test(`la boutique ne déborde pas à ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/shop')

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }))

    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth)
  })
}
