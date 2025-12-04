import { Test, TestingModule } from '@nestjs/testing';
import { CarrinhoController } from './carrinho.controller';

describe('CarrinhoController', () => {
  let controller: CarrinhoController;

  const mockCarrinhoService = {
    executar: jest.fn().mockResolvedValue({ status: 'enviado', runId: 1 }),
    interruptar: jest.fn().mockResolvedValue({ status: 'sucesso', comando: 'interruptar' }),
    abrirPorta: jest.fn().mockResolvedValue({ status: 'sucesso', comando: 'abrirPorta' }),
    fecharPorta: jest.fn().mockResolvedValue({ status: 'sucesso', comando: 'fecharPorta' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarrinhoController],
    })
      .useMocker((token) => {
        if (token === 'CarrinhoService' || token === (require as any)("./carrinho.service").CarrinhoService) {
          return mockCarrinhoService;
        }
      })
      .compile();

    controller = module.get<CarrinhoController>(CarrinhoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('executarTrajeto should call service.executar and return result', async () => {
    const dto = { comandos: [{ distancia: 10, direcao: 'frente' }] } as any;
    const res = await controller.executarTrajeto(dto);
    expect(mockCarrinhoService.executar).toHaveBeenCalledWith(dto);
    expect(res).toEqual({ status: 'enviado', runId: 1 });
  });

  it('interruptarTrajeto should call service.interruptar and return result', async () => {
    const res = await controller.interruptarTrajeto();
    expect(mockCarrinhoService.interruptar).toHaveBeenCalled();
    expect(res).toEqual({ status: 'sucesso', comando: 'interruptar' });
  });

  it('abrirPorta should call service.abrirPorta and return result', async () => {
    const res = await controller.abrirPorta();
    expect(mockCarrinhoService.abrirPorta).toHaveBeenCalled();
    expect(res).toEqual({ status: 'sucesso', comando: 'abrirPorta' });
  });

  it('fecharPorta should call service.fecharPorta and return result', async () => {
    const res = await controller.fecharPorta();
    expect(mockCarrinhoService.fecharPorta).toHaveBeenCalled();
    expect(res).toEqual({ status: 'sucesso', comando: 'fecharPorta' });
  });
});
