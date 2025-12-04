import { test, expect } from '@playwright/test';

test.describe('Fluxo Completo com Mock', () => {
  test('deve executar fluxo completo: criar, otimizar, executar, reutilizar e excluir', async ({ page }) => {
    // Mock de todas as chamadas ao backend
    let trajetos: any[] = [];

    await page.route('http://localhost:3001/trajetos', async route => {
      if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON();
        const novoTrajeto = { 
          id: Date.now(), 
          ...body, 
          dataExecucao: new Date().toISOString(),
          distanciaTotal: 30,
          tempoTotalEstimado: 6,
          velocidadeMedia: 5,
          isFavorito: false
        };
        trajetos.push(novoTrajeto);
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: novoTrajeto.id }) });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(trajetos) });
    });
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
    await page.route('http://localhost:3001/trajetos/*', route => {
      if (route.request().method() === 'DELETE') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      }
      route.continue();
    });

    // === ETAPA 1: Criar e executar trajeto ===
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

    // Adiciona duas rotas: frente 10cm + frente 20cm
    await page.getByRole('button', { name: 'ADICIONAR ROTA' }).click();
    await page.getByRole('button', { name: 'Valor' }).click();
    await page.getByRole('button', { name: 'adicionar', exact: true }).click();
    await page.getByRole('button', { name: 'adicionar', exact: true }).click();

    await page.getByRole('button', { name: 'ADICIONAR ROTA' }).click();
    await page.getByRole('button', { name: 'Valor' }).click();
    const spinbutton = page.getByRole('spinbutton').first();
    await spinbutton.clear();
    await spinbutton.fill('20');
    await page.getByRole('button', { name: 'adicionar', exact: true }).click();
    await page.getByRole('button', { name: 'adicionar', exact: true }).click();

    // Otimiza o trajeto (consolida as duas rotas para frente)
    await page.getByRole('button', { name: 'Otimizar' }).click();
    await expect(page.locator('text=Rota otimizada')).toBeVisible({ timeout: 3000 });

    // Inicia o trajeto
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'INICIAR' }).click({ timeout: 5000 });
    await page.getByRole('textbox', { name: 'Ex: Trajeto' }).fill('test_e2e_fluxo_completo');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.locator('text=Executando Trajeto')).toBeVisible({ timeout: 8000 });

    // Testa controles de porta
    await page.getByRole('button', { name: 'ABRIR PORTA' }).click();
    await expect(page.locator('text=Porta aberta')).toBeVisible({ timeout: 3000 });

    await page.getByRole('button', { name: 'FECHAR PORTA' }).click();
    await expect(page.locator('text=Porta fechada')).toBeVisible({ timeout: 3000 });

    // Interrompe o trajeto
    await page.getByRole('button', { name: 'INTERROMPER O TRAJETO' }).click();
    await expect(page.locator('text=Parada enviada')).toBeVisible({ timeout: 3000 });

    // === ETAPA 2: Reutilizar e modificar trajeto ===
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.waitForSelector('text=test_e2e_fluxo_completo', { timeout: 5000 }).catch(() => {});

    if (await page.locator('text=test_e2e_fluxo_completo').isVisible()) {
      await page.getByRole('button', { name: 'Reutilizar Trajeto' }).first().click();
      await expect(page.locator('text=Trajeto carregado para replay')).toBeVisible({ timeout: 3000 });

      // Adiciona nova rota ao trajeto reutilizado
      await page.getByRole('button', { name: 'ADICIONAR ROTA' }).click();
      await page.getByRole('button', { name: 'Valor' }).click();
      await page.getByRole('button', { name: 'adicionar', exact: true }).click();
      await page.getByRole('button', { name: 'adicionar', exact: true }).click();

      // Otimiza novamente
      await page.getByRole('button', { name: 'Otimizar' }).click();
      await expect(page.locator('text=Rota otimizada')).toBeVisible({ timeout: 3000 });

      // Inicia o trajeto modificado
      await page.getByRole('button', { name: 'INICIAR' }).click();
      await page.getByRole('textbox', { name: 'Ex: Trajeto' }).fill('test_e2e_fluxo_modificado');
      await page.getByRole('button', { name: 'Salvar' }).click();
      await expect(page.locator('text=Executando Trajeto')).toBeVisible({ timeout: 5000 });

      // Interrompe o segundo trajeto
      await page.getByRole('button', { name: 'INTERROMPER O TRAJETO' }).click();
      await expect(page.locator('text=Parada enviada')).toBeVisible({ timeout: 3000 });
    }

    // === ETAPA 3: Excluir trajeto ===
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

    page.on('dialog', dialog => {
      dialog.accept();
    });

    const btnExcluir = page.getByRole('button', { name: 'Excluir' }).first();
    if (await btnExcluir.isVisible({ timeout: 3000 }).catch(() => false)) {
      await btnExcluir.click();
      await expect(page.locator('text=Trajeto excluído')).toBeVisible({ timeout: 3000 });
    }
  });
});