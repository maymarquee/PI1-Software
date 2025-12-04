import { SensorService } from './sensor.service';

describe('SensorService (pre-checks)', () => {
  it('verificarTodos retorna ok quando todos sensores OK', async () => {
    const sensores = [
      { nome: 'ultrassom', ok: true },
      { nome: 'imu', ok: true },
      { nome: 'peso', ok: true },
    ];
    const svc = new SensorService(sensores as any);
    const res = await svc.verificarTodos();
    expect(res.status).toBe('ok');
    expect(res.sensores.length).toBe(3);
  });

  it('verificarTodos identifica falhas', async () => {
    const sensores = [
      { nome: 'ultrassom', ok: true },
      { nome: 'imu', ok: false, detalhe: 'sem resposta' },
    ];
    const svc = new SensorService(sensores as any);
    const res = await svc.verificarTodos();
    expect(res.status).toBe('falha');
    expect(res.sensores.find(s => s.nome === 'imu')!.ok).toBe(false);
  });

  it('verificarPeso aceita peso dentro da faixa e rejeita fora', () => {
    const svc = new SensorService();
    expect(svc.verificarPeso(0.1).ok).toBe(true);
    expect(svc.verificarPeso(0.001).ok).toBe(false);
    expect(svc.verificarPeso(1.0).ok).toBe(false);
  });
});
