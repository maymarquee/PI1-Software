import { MonitorService } from './monitor.service';

describe('MonitorService (desvios)', () => {
  it('detecta quando dentro da tolerancia', () => {
    const svc = new MonitorService();
    const r = svc.verificarDesvio(1.0, 1.02, 0.05);
    expect(r.desvio).toBe(false);
  });

  it('detecta quando fora da tolerancia', () => {
    const svc = new MonitorService();
    const r = svc.verificarDesvio(1.0, 1.2, 0.05);
    expect(r.desvio).toBe(true);
    expect(r.diff).toBeCloseTo(0.2);
  });
});
