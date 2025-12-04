import { CurvaService } from './curva.service';

describe('CurvaService', () => {
  it('calcula rotacoes simetricas para angulo positivo', () => {
    const svc = new CurvaService();
    const r = svc.calcularRotacaoRodas(30);
    expect(r.rotacaoRodaEsquerda).toBeCloseTo(15);
    expect(r.rotacaoRodaDireita).toBeCloseTo(-15);
  });

  it('calcula rotacoes para angulo negativo', () => {
    const svc = new CurvaService();
    const r = svc.calcularRotacaoRodas(-60);
    expect(r.rotacaoRodaEsquerda).toBeCloseTo(-30);
    expect(r.rotacaoRodaDireita).toBeCloseTo(30);
  });
});
