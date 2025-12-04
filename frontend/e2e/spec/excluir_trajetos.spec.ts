import { test, expect } from '@playwright/test';

test.describe('Excluir Trajetos', () => {
  test('deve excluir trajetos antigos com confirmação', async ({ page }) => {
    // Mock das chamadas ao backend
    await page.route('http://localhost:3001/trajetos', route => {
      const trajetos = [
        { id: 1, nome: 'Trajeto 1', dataExecucao: new Date().toISOString(), comandos: [], isFavorito: false },
        { id: 2, nome: 'Trajeto 2', dataExecucao: new Date().toISOString(), comandos: [], isFavorito: false },
      ];
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(trajetos) });
    });
    await page.route('http://localhost:3001/trajetos/*', route => {
      if (route.request().method() === 'DELETE') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      }
      route.continue();
    });

    // Navega para a aplicação
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

    // Aguarda o carregamento dos trajetos
    await page.waitForSelector('[class*="bg-[#F6F6F6]"]', { timeout: 5000 });

    // Verifica que há trajetos no histórico
    const trajetosIniciais = await page.locator('[class*="bg-[#F6F6F6]"]').count();
    expect(trajetosIniciais).toBeGreaterThanOrEqual(1);

    // Intercepta e confirma o diálogo de exclusão
    page.on('dialog', dialog => {
      console.log(`Dialog: ${dialog.message()}`);
      expect(dialog.message()).toContain('Tem certeza');
      dialog.accept();
    });

    // Clica no botão Excluir do primeiro trajeto
    await page.getByRole('button', { name: 'Excluir' }).first().click();

    // Aguarda a confirmação de exclusão
    await expect(page.locator('text=Trajeto excluído')).toBeVisible({ timeout: 3000 });
  });
});