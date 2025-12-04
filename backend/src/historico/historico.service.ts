export class HistoricoService {
  // Em produção isso receberia uma instância de banco (Prisma)
  constructor(private readonly repo: { create: (data: any) => Promise<any> } | null = null) {}

  async salvarSeConcluido(trajeto: any, status: 'concluido' | 'falha' | 'cancelado') {
    if (status !== 'concluido') return { saved: false };
    if (!this.repo) return { saved: false, reason: 'sem-repo' };
    const created = await this.repo.create({ data: trajeto });
    return { saved: true, record: created };
  }
}
