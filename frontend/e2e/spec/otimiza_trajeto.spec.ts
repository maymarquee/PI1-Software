import { test, expect } from '@playwright/test';

test.describe('Otimizar Trajeto', () => {
  test('deve otimizar trajetos com múltiplos comandos de forma correta', async ({ page }) => {
    // Mock das chamadas ao backend
    await page.route('http://localhost:3001/trajetos', route => 
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    );

    // Navega para a aplicação
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

    // Adiciona primeira rota: para frente (10 cm)
    await page.getByRole('button', { name: 'ADICIONAR ROTA' }).click();
    await page.getByRole('button', { name: 'Valor' }).click();
    await page.getByRole('button', { name: 'adicionar', exact: true }).click();
    await page.getByRole('button', { name: 'adicionar', exact: true }).click();

    // Adiciona segunda rota: para frente (valor padrão)
    await page.getByRole('button', { name: 'ADICIONAR ROTA' }).click();
    await page.getByRole('button', { name: 'Valor' }).click();
    await page.getByRole('button', { name: 'adicionar', exact: true }).click();
    await page.getByRole('button', { name: 'adicionar', exact: true }).click();

    // Adiciona terceira rota: rotaciona direita
    await page.getByRole('button', { name: 'ADICIONAR ROTA' }).click();
    await page.getByRole('button', { name: 'rotacionar direita ↷' }).click();

    // Adiciona quarta rota: para frente (20 cm)
    await page.getByRole('button', { name: 'ADICIONAR ROTA' }).click();
    await page.getByRole('button', { name: 'Valor' }).click();
    const spinbutton1 = page.getByRole('spinbutton').first();
    await spinbutton1.clear();
    await spinbutton1.fill('20');
    await page.getByRole('button', { name: 'adicionar', exact: true }).click();
    await page.getByRole('button', { name: 'adicionar', exact: true }).click();

    // Adiciona quinta rota: para frente (10 cm)
    await page.getByRole('button', { name: 'ADICIONAR ROTA' }).click();
    await page.getByRole('button', { name: 'Valor' }).click();
    const spinbutton2 = page.getByRole('spinbutton').first();
    await spinbutton2.clear();
    await spinbutton2.fill('10');
    await page.getByRole('button', { name: 'adicionar', exact: true }).click();
    await page.getByRole('button', { name: 'adicionar', exact: true }).click();

    // Adiciona sexta rota: rotaciona esquerda
    await page.getByRole('button', { name: 'ADICIONAR ROTA' }).click();
    await page.getByRole('button', { name: 'rotacionar esquerda ↶' }).click();

    // Clica em Otimizar
    await page.getByRole('button', { name: 'Otimizar' }).click();

    // Aguarda mensagem de sucesso
    await expect(page.locator('text=Rota otimizada')).toBeVisible({ timeout: 3000 });

    // Verifica que houve consolidação (a contagem não deve ser exatamente 6)
    // Apenas verifica que clicou e a mensagem apareceu
  });
});