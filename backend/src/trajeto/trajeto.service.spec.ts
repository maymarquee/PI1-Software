import { NotFoundException } from '@nestjs/common';
import { TrajetoService } from './trajeto.service';

describe('TrajetoService', () => {
  let service: TrajetoService;

  const mockPrisma = {
    logSegmento: { create: jest.fn() },
    trajeto: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TrajetoService(mockPrisma as any);
  });

  it('receberFeedbackDoCarrinho should ignore when no trajeto active', async () => {
    const res = await service.receberFeedbackDoCarrinho({ distancia: 5, angulo: 0, velocidade: 1 } as any);
    expect(res).toEqual({ status: 'ignorado' });
    expect(mockPrisma.logSegmento.create).not.toHaveBeenCalled();
  });

  it('receberFeedbackDoCarrinho should store feedback and call prisma', async () => {
    // simulate that a trajeto is active by saving one
    mockPrisma.trajeto.create.mockResolvedValue({ id: 100, comandos: [] });
    const traj = await service.salvarTrajeto({ nome: 't', comandos: [] } as any);
    expect(traj.id).toBe(100);

    const dto = { distancia: 3.2, angulo: 15, velocidade: 0.8 } as any;
    mockPrisma.logSegmento.create.mockResolvedValue({});
    const res = await service.receberFeedbackDoCarrinho(dto);
    expect(res).toEqual({ status: 'recebido' });
    expect(mockPrisma.logSegmento.create).toHaveBeenCalledWith({
      data: {
        trajetoId: 100,
        distancia: dto.distancia,
        angulo: dto.angulo,
        velocidadeMedia: dto.velocidade || 0,
      },
    });

    const entregues = service.entregarFeedbackParaFrontend();
    expect(entregues.length).toBeGreaterThan(0);
  });

  it('salvarTrajeto should create trajeto and set idTrajetoAtual', async () => {
    const fake = { id: 55, comandos: [{ acao: 'mover', valor: 1 }] };
    mockPrisma.trajeto.create.mockResolvedValue(fake);
    const dto = { nome: 'abc', comandos: [{ acao: 'x', valor: 1, direcao: 'frente' }] } as any;
    const res = await service.salvarTrajeto(dto);
    expect(mockPrisma.trajeto.create).toHaveBeenCalled();
    expect(res).toEqual(fake);
  });

  it('listarTrajetos should call prisma.findMany', async () => {
    mockPrisma.trajeto.findMany.mockResolvedValue([{ id: 1 }]);
    const res = await service.listarTrajetos();
    expect(mockPrisma.trajeto.findMany).toHaveBeenCalled();
    expect(res).toEqual([{ id: 1 }]);
  });

  it('toggleFavorito should throw NotFoundException when missing', async () => {
    mockPrisma.trajeto.findUnique.mockResolvedValue(null);
    await expect(service.toggleFavorito(123)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('toggleFavorito should invert favorito state', async () => {
    mockPrisma.trajeto.findUnique.mockResolvedValue({ isFavorito: false });
    mockPrisma.trajeto.update.mockResolvedValue({ id: 5, isFavorito: true });
    const res = await service.toggleFavorito(5);
    expect(mockPrisma.trajeto.update).toHaveBeenCalledWith({ where: { id: 5 }, data: { isFavorito: true } });
    expect(res).toEqual({ id: 5, isFavorito: true });
  });

  it('excluir should call prisma.delete', async () => {
    mockPrisma.trajeto.delete.mockResolvedValue({});
    const res = await service.excluir(8);
    expect(mockPrisma.trajeto.delete).toHaveBeenCalledWith({ where: { id: 8 } });
    expect(res).toEqual({});
  });
});
