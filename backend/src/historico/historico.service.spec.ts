import { HistoricoService } from './historico.service';

describe('HistoricoService', () => {
  it('não salva quando status diferente de concluido', async () => {
    const repo = { create: jest.fn() } as any;
    const svc = new HistoricoService(repo);
    const res = await svc.salvarSeConcluido({ foo: 'bar' }, 'falha');
    expect(res.saved).toBe(false);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('salva quando concluido', async () => {
    const repo = { create: jest.fn().mockResolvedValue({ id: 1 }) } as any;
    const svc = new HistoricoService(repo);
    const res = await svc.salvarSeConcluido({ foo: 'bar' }, 'concluido');
    expect(res.saved).toBe(true);
    expect(res.record).toEqual({ id: 1 });
    expect(repo.create).toHaveBeenCalled();
  });
});
