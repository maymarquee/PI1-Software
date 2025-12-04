export class CurvaService {
  calcularRotacaoRodas(anguloEmGraus: number) {
    const rotacaoRoda = anguloEmGraus * 0.5; 
    return { rotacaoRodaEsquerda: rotacaoRoda, rotacaoRodaDireita: -rotacaoRoda };
  }
}
