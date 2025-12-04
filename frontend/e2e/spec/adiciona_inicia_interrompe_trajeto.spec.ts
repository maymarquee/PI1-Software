import { test, expect } from '@playwright/test';

test.describe('Adiciona e interrompe trajeto', () => {
  test('adiciona rotas, inicia e interrompe trajeto ', async ({ page }) => {
    // Mock das chamadas ao backend
    await page.route('http://localhost:3001/trajetos', route => 
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    );
    await page.route('http://localhost:3001/carrinho/executar', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'ok' }) })
    );
    await page.route('http://localhost:3001/carrinho/abrir-porta', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'ok' }) })
    );
    await page.route('http://localhost:3001/carrinho/fechar-porta', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'ok' }) })
    );
    await page.route('http://localhost:3001/carrinho/interruptar', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'ok' }) })
    );

    // Navega para a aplicação
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

    // Adiciona uma rota simples
    await page.getByRole('button', { name: 'ADICIONAR ROTA' }).click();
    await page.getByRole('button', { name: 'Valor' }).click();
    await page.getByRole('button', { name: 'adicionar', exact: true }).click();
    await page.getByRole('button', { name: 'adicionar', exact: true }).click();

    // Inicia o trajeto
    await page.getByRole('button', { name: 'INICIAR' }).click();
    await page.getByRole('textbox', { name: 'Ex: Trajeto' }).fill('test_e2e_abrir_porta');
    await page.getByRole('button', { name: 'Salvar' }).click();

    // Aguarda a execução iniciar
    await expect(page.locator('text=Executando Trajeto')).toBeVisible({ timeout: 5000 });

    // Interrompe o trajeto
    await page.getByRole('button', { name: 'INTERROMPER O TRAJETO' }).click();
    await expect(page.locator('text=Parada enviada')).toBeVisible({ timeout: 3000 });
  });
});
