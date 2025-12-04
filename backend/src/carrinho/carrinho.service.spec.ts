import { of, throwError } from 'rxjs';
import { InternalServerErrorException } from '@nestjs/common';
import { CarrinhoService } from './carrinho.service';

describe('CarrinhoService', () => {
  let service: CarrinhoService;
  const mockHttpService = {
    post: jest.fn(),
  };

  const mockTrajetoService = {
    salvarTrajeto: jest.fn(),
  } as any;

  const mockSensorService = {
    verificarTodos: jest.fn().mockResolvedValue({ status: 'ok', sensores: [] }),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CarrinhoService(mockHttpService as any, mockTrajetoService as any, mockSensorService as any);
  });

  it('executar should save trajeto and send to ESP (success)', async () => {
    mockTrajetoService.salvarTrajeto.mockResolvedValue({ id: 42 });
    mockHttpService.post.mockReturnValue({ pipe: () => of({ data: { status: 'ok' } }) });

    const dto = { comandos: [{ distancia: 10, direcao: 'frente' }] } as any;
    const res = await service.executar(dto);

    expect(mockSensorService.verificarTodos).toHaveBeenCalled();
    expect(mockTrajetoService.salvarTrajeto).toHaveBeenCalledWith(dto);
    expect(mockHttpService.post).toHaveBeenCalled();
    expect(res).toEqual({ status: 'enviado', runId: 42, respostaCarrinho: { status: 'ok' } });
  });

  it('executar should throw InternalServerErrorException on HTTP error', async () => {
    mockTrajetoService.salvarTrajeto.mockResolvedValue({ id: 7 });
    mockHttpService.post.mockReturnValue({ pipe: () => throwError(() => new Error('network')) });

    const dto = { comandos: [{ distancia: 1, direcao: 'tras' }] } as any;
    await expect(service.executar(dto)).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('executar should throw when precheck fails', async () => {
    mockSensorService.verificarTodos.mockResolvedValueOnce({ status: 'falha', sensores: [{ nome: 'imu', ok: false }] });
    const dto = { comandos: [{ distancia: 1, direcao: 'tras' }] } as any;
    await expect(service.executar(dto)).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('interruptar should send interruptar command and return success', async () => {
    mockHttpService.post.mockReturnValue({ pipe: () => of({ data: { ok: true } }) });
    const res = await service.interruptar();
    expect(mockHttpService.post).toHaveBeenCalled();
    expect(res).toEqual({ status: 'sucesso', comando: 'interruptar', resposta: { ok: true } });
  });

  it('abrirPorta should send abrirPorta command and return success', async () => {
    mockHttpService.post.mockReturnValue({ pipe: () => of({ data: { opened: true } }) });
    const res = await service.abrirPorta();
    expect(mockHttpService.post).toHaveBeenCalled();
    expect(res).toEqual({ status: 'sucesso', comando: 'abrirPorta', resposta: { opened: true } });
  });

  it('fecharPorta should throw on HTTP failure', async () => {
    mockHttpService.post.mockReturnValue({ pipe: () => throwError(() => new Error('fail')) });
    await expect(service.fecharPorta()).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});
