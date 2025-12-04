import { of, throwError } from 'rxjs';
import { InternalServerErrorException } from '@nestjs/common';
import { CarrinhoService } from './carrinho/carrinho.service';
import { TrajetoService } from './trajeto/trajeto.service';
import { SensorService, SensorStatus } from './sensors/sensor.service';
import { HistoricoService } from './historico/historico.service';
import { MonitorService } from './monitor/monitor.service';
import { CurvaService } from './curva/curva.service';

describe('Integration: Complete Trajectory Flow (US01-US09)', () => {
  let carrinhoService: CarrinhoService;
  let trajetoService: TrajetoService;
  let sensorService: SensorService;
  let historicoService: HistoricoService;
  let monitorService: MonitorService;
  let curvaService: CurvaService;

  const mockHttpService = { post: jest.fn() };
  const mockPrisma = {
    trajeto: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    logSegmento: { create: jest.fn() },
  } as any;

  const mockHistoricoRepo = { create: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();

    // Initialize services with mocks
    sensorService = new SensorService([
      { nome: 'ultrassom', ok: true },
      { nome: 'imu', ok: true },
      { nome: 'motor-left', ok: true },
      { nome: 'motor-right', ok: true },
    ]);

    trajetoService = new TrajetoService(mockPrisma);
    carrinhoService = new CarrinhoService(mockHttpService as any, trajetoService, sensorService);
    historicoService = new HistoricoService(mockHistoricoRepo);
    monitorService = new MonitorService();
    curvaService = new CurvaService();
  });

  describe('US01: Comando de Trajeto com Pré-check', () => {
    it('fluxo completo: pré-check OK -> salvar -> enviar ESP -> receber feedback', async () => {
      // Arrange
      const dto = {
        nome: 'trajeto-teste-1',
        comandos: [
          { acao: 'mover', valor: 5, direcao: 'frente' },
          { acao: 'girar', valor: 45, direcao: 'direita' },
        ],
      } as any;

      mockPrisma.trajeto.create.mockResolvedValue({
        id: 101,
        nome: dto.nome,
        comandos: dto.comandos,
        status: 'executando',
      });

      mockHttpService.post.mockReturnValue({
        pipe: () => of({ data: { status: 'recebido', runId: 101 } }),
      });

      const result = await carrinhoService.executar(dto);

      expect(result!.status).toBe('enviado');
      expect(result!.runId).toBe(101);
      expect(mockPrisma.trajeto.create).toHaveBeenCalled();
      expect(mockHttpService.post).toHaveBeenCalled();
    });

    it('pré-check falha quando sensor crítico está com problema', async () => {
      const sensoresFalhos: SensorStatus[] = [
        { nome: 'ultrassom', ok: false, detalhe: 'sem sinal' },
        { nome: 'imu', ok: true },
      ];
      const svcComFalha = new SensorService(sensoresFalhos);
      const carrinhoComFalha = new CarrinhoService(mockHttpService as any, trajetoService, svcComFalha);

      const dto = { nome: 'teste', comandos: [] } as any;

      await expect(carrinhoComFalha.executar(dto)).rejects.toBeInstanceOf(
        InternalServerErrorException
      );
      expect(mockPrisma.trajeto.create).not.toHaveBeenCalled();
    });
  });

  describe('US02: Monitoramento em Tempo Real (Feedback)', () => {
    it('recebe feedback do carrinho e armazena em memória', async () => {
      mockPrisma.trajeto.create.mockResolvedValue({ id: 202, comandos: [] });
      await trajetoService.salvarTrajeto({ nome: 'traj', comandos: [] } as any);

      mockPrisma.logSegmento.create.mockResolvedValue({});

      const feedback = { distancia: 2.5, angulo: 15, velocidade: 0.8 };
      const res = await trajetoService.receberFeedbackDoCarrinho(feedback as any);

      expect(res.status).toBe('recebido');
      expect(mockPrisma.logSegmento.create).toHaveBeenCalledWith({
        data: {
          trajetoId: 202,
          distancia: 2.5,
          angulo: 15,
          velocidadeMedia: 0.8,
        },
      });

      const entregues = trajetoService.entregarFeedbackParaFrontend();
      expect(entregues.length).toBeGreaterThan(0);
      expect(entregues[0]).toHaveProperty('velocidade', 0.8);
    });
  });

  describe('US03: Garantir Segurança com Verificação Pré-Execução', () => {
    it('verifica todos os sensores antes do início', async () => {

      const precheck = await sensorService.verificarTodos();


      expect(precheck.status).toBe('ok');
      expect(precheck.sensores.every((s: any) => s.ok)).toBe(true);
    });

    it('identifica falha em sensor específico durante verificação', async () => {

      const sensoresFalhos = [
        { nome: 'motor-left', ok: false, detalhe: 'sem resposta' },
        { nome: 'motor-right', ok: true },
      ];
      const svc = new SensorService(sensoresFalhos);


      const precheck = await svc.verificarTodos();


      expect(precheck.status).toBe('falha');
      expect(precheck.sensores.some((s: any) => !s.ok)).toBe(true);
    });
  });

  describe('US04: Assegurar Condições de Peso', () => {
    it('verifica que peso está dentro da faixa esperada', () => {
      const pesoOk = sensorService.verificarPeso(0.12); 
      expect(pesoOk.ok).toBe(true);
    });

    it('rejeita peso abaixo da faixa mínima', () => {
      const pesoBaixo = sensorService.verificarPeso(0.01);
      expect(pesoBaixo.ok).toBe(false);
      expect(pesoBaixo.motivo).toContain('fora');
    });

    it('rejeita peso acima da faixa máxima', () => {
      const pesoAlto = sensorService.verificarPeso(0.5);
      expect(pesoAlto.ok).toBe(false);
    });
  });

  describe('US05: Ter Controle e Segurança Durante Execução', () => {
    it('interrompe o trajeto através do endpoint específico', async () => {

      mockHttpService.post.mockReturnValue({
        pipe: () => of({ data: { ok: true } }),
      });


      const result = await carrinhoService.interruptar();


      expect(result!.status).toBe('sucesso');
      expect(result!.comando).toBe('interruptar');
      expect(mockHttpService.post).toHaveBeenCalledWith(
        expect.stringContaining('interruptar'),
        {},
        expect.any(Object)
      );
    });
  });

  describe('US06: Manter Histórico de Dados Válidos', () => {
    it('salva histórico apenas para trajeto concluído', async () => {

      const trajetoCompleto = { id: 301, nome: 'traj-ok', distancia: 5, tempo: 10 };
      mockHistoricoRepo.create.mockResolvedValue({ ...trajetoCompleto });


      const res = await historicoService.salvarSeConcluido(trajetoCompleto, 'concluido');


      expect(res.saved).toBe(true);
      expect(mockHistoricoRepo.create).toHaveBeenCalled();
    });

    it('não salva histórico para trajeto falho', async () => {

      const trajetoFalho = { id: 302, nome: 'traj-fail' };


      const res = await historicoService.salvarSeConcluido(trajetoFalho, 'falha');


      expect(res.saved).toBe(false);
      expect(mockHistoricoRepo.create).not.toHaveBeenCalled();
    });

    it('não salva histórico para trajeto cancelado', async () => {

      const trajetoCancelado = { id: 303, nome: 'traj-cancel' };


      const res = await historicoService.salvarSeConcluido(trajetoCancelado, 'cancelado');


      expect(res.saved).toBe(false);
    });
  });

  describe('US07: Ser Alertado Sobre Falhas de Percurso', () => {
    it('detecta desvio significativo e gera alerta', () => {

      const distanciaPlanejada = 1.0;
      const distanciaReal = 1.15;
      const tolerancia = 0.05;


      const resultado = monitorService.verificarDesvio(
        distanciaPlanejada,
        distanciaReal,
        tolerancia
      );


      expect(resultado.desvio).toBe(true);
      expect(resultado.diff).toBeCloseTo(0.15);
    });

    it('não gera alerta quando dentro da tolerância', () => {

      const distanciaPlanejada = 1.0;
      const distanciaReal = 1.02;
      const tolerancia = 0.05;


      const resultado = monitorService.verificarDesvio(
        distanciaPlanejada,
        distanciaReal,
        tolerancia
      );


      expect(resultado.desvio).toBe(false);
    });
  });

  describe('US08: Executar Trajetos com Curvas', () => {
    it('calcula rotação de rodas para virar à direita', () => {

      const anguloEmGraus = 30;


      const rotacoes = curvaService.calcularRotacaoRodas(anguloEmGraus);


      expect(rotacoes.rotacaoRodaEsquerda).toBeGreaterThan(0);
      expect(rotacoes.rotacaoRodaDireita).toBeLessThan(0);
      expect(Math.abs(rotacoes.rotacaoRodaEsquerda)).toBeCloseTo(
        Math.abs(rotacoes.rotacaoRodaDireita)
      );
    });

    it('calcula rotação de rodas para virar à esquerda', () => {

      const anguloEmGraus = -45;


      const rotacoes = curvaService.calcularRotacaoRodas(anguloEmGraus);


      expect(rotacoes.rotacaoRodaEsquerda).toBeLessThan(0);
      expect(rotacoes.rotacaoRodaDireita).toBeGreaterThan(0);
    });
  });

  describe('US09: Receber Confirmação Visual de Depósito do Ovo', () => {
    it('abre porta para depósito do ovo', async () => {

      mockHttpService.post.mockReturnValue({
        pipe: () => of({ data: { opened: true } }),
      });


      const result = await carrinhoService.abrirPorta();


      expect(result!.status).toBe('sucesso');
      expect(result!.comando).toBe('abrirPorta');
    });

    it('fecha porta após depósito', async () => {

      mockHttpService.post.mockReturnValue({
        pipe: () => of({ data: { closed: true } }),
      });


      const result = await carrinhoService.fecharPorta();


      expect(result!.status).toBe('sucesso');
      expect(result!.comando).toBe('fecharPorta');
    });
  });

  describe('Integration: Complete End-to-End Flow', () => {
    it('executa fluxo completo: pré-check -> salvar -> enviar -> feedback -> histórico', async () => {

      const precheck = await sensorService.verificarTodos();
      expect(precheck.status).toBe('ok');


      const pesoCorreto = sensorService.verificarPeso(0.15);
      expect(pesoCorreto.ok).toBe(true);


      const trajetoDto = {
        nome: 'trajeto-completo',
        comandos: [{ acao: 'mover', valor: 10, direcao: 'frente' }],
      } as any;

      mockPrisma.trajeto.create.mockResolvedValue({
        id: 999,
        ...trajetoDto,
      });

      mockHttpService.post.mockReturnValue({
        pipe: () => of({ data: { status: 'ok' } }),
      });


      const resultado = await carrinhoService.executar(trajetoDto);
      expect(resultado!.status).toBe('enviado');
      expect(resultado!.runId).toBe(999);

 
      mockPrisma.logSegmento.create.mockResolvedValue({});
      const feedback = { distancia: 9.8, angulo: 0, velocidade: 0.5 };
      const feedbackRes = await trajetoService.receberFeedbackDoCarrinho(feedback as any);
      expect(feedbackRes.status).toBe('recebido');


      const desvioCheck = monitorService.verificarDesvio(10, 9.8, 0.5);
      expect(desvioCheck.desvio).toBe(false); // dentro da tolerância


      mockHistoricoRepo.create.mockResolvedValue({ id: 555 });
      const historicoRes = await historicoService.salvarSeConcluido(
        { id: 999, distancia: 9.8 },
        'concluido'
      );
      expect(historicoRes.saved).toBe(true);


      mockHttpService.post.mockReturnValue({
        pipe: () => of({ data: { opened: true } }),
      });
      const aberturaPorta = await carrinhoService.abrirPorta();
      expect(aberturaPorta!.status).toBe('sucesso');
    });
  });
});
