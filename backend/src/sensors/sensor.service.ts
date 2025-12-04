export type SensorStatus = {
  nome: string;
  ok: boolean;
  detalhe?: string;
};

export class SensorService {
  constructor(private readonly sensores: SensorStatus[] = []) {}

  async verificarTodos(): Promise<{ status: 'ok' | 'falha'; sensores: SensorStatus[] }> {
    const results = this.sensores.map(s => ({ ...s }));
    const algumaFalha = results.some(r => !r.ok);
    return { status: algumaFalha ? 'falha' : 'ok', sensores: results };
  }

  verificarPeso(pesoKg: number, limiteMin = 0.05, limiteMax = 0.2) {
    if (pesoKg < limiteMin || pesoKg > limiteMax) {
      return { ok: false, motivo: 'peso fora da faixa esperada' };
    }
    return { ok: true };
  }
}
