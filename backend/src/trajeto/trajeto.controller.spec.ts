import { Test, TestingModule } from '@nestjs/testing';
import { TrajetoController } from './trajeto.controller';

describe('TrajetoController', () => {
  let controller: TrajetoController;

  const mockTrajetoService = {
    receberFeedbackDoCarrinho: jest.fn().mockResolvedValue({ status: 'recebido' }),
    entregarFeedbackParaFrontend: jest.fn().mockReturnValue([]),
    salvarTrajeto: jest.fn().mockResolvedValue({ id: 1 }),
    listarTrajetos: jest.fn().mockResolvedValue([]),
    toggleFavorito: jest.fn().mockResolvedValue({ id: 2 }),
    excluir: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrajetoController],
    })
      .useMocker((token) => {
        if (token === (require as any)('./trajeto.service').TrajetoService || token === 'TrajetoService') {
          return mockTrajetoService;
        }
      })
      .compile();

    controller = module.get<TrajetoController>(TrajetoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('receber should forward feedback to service', async () => {
    const res = await controller.receber({ distancia: 1 } as any);
    expect(mockTrajetoService.receberFeedbackDoCarrinho).toHaveBeenCalled();
    expect(res).toEqual({ status: 'recebido' });
  });

  it('entregar should call entregarFeedbackParaFrontend', () => {
    const res = controller.entregar();
    expect(mockTrajetoService.entregarFeedbackParaFrontend).toHaveBeenCalled();
    expect(res).toEqual([]);
  });

  it('criar should call salvarTrajeto and return wrapper', async () => {
    const res = await controller.criar({ nome: 'x', comandos: [] } as any);
    expect(mockTrajetoService.salvarTrajeto).toHaveBeenCalled();
    expect(res).toHaveProperty('trajeto');
  });

  it('listar should forward to service', async () => {
    const res = await controller.listar();
    expect(mockTrajetoService.listarTrajetos).toHaveBeenCalled();
    expect(res).toEqual([]);
  });

  it('toggleFavorito should call service', async () => {
    const res = await controller.toggleFavorito(2);
    expect(mockTrajetoService.toggleFavorito).toHaveBeenCalledWith(2);
    expect(res).toEqual({ id: 2 });
  });

  it('excluir should call service', async () => {
    const res = await controller.excluir(3);
    expect(mockTrajetoService.excluir).toHaveBeenCalledWith(3);
  });
});
