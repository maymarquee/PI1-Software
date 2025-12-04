export class MonitorService {
  // verifica se o carrinho desviou além de uma tolerância (metros)
  verificarDesvio(distanciaPlanejada: number, distanciaReal: number, tolerancia = 0.05) {
    const diff = Math.abs(distanciaPlanejada - distanciaReal);
    const desvio = diff > tolerancia;
    return { desvio, diff };
  }
}
