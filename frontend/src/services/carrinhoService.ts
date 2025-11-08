import { api } from './api';

export async function executarTrajeto(trajeto: ExecutarTrajetoDto) {
  const response = await api.post('/carrinho/executar', trajeto);
  return response.data;
}

export type ComandoDto = {
  acao: 'frente' | 'rotacionar';
  direcao?: 'esquerda' | 'direita' | null;
  distancia?: number;
};

export type ExecutarTrajetoDto = {
  comandos: ComandoDto[];
};
