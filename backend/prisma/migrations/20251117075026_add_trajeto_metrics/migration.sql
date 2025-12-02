-- CreateTable
CREATE TABLE "Trajeto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dataExecucao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respostaCarrinho" JSONB,
    "distanciaTotal" REAL DEFAULT 0,
    "tempoTotalEstimado" REAL DEFAULT 0,
    "velocidadeMedia" REAL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Comando" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "acao" TEXT NOT NULL,
    "valor" REAL,
    "direcao" TEXT,
    "trajetoId" INTEGER NOT NULL,
    CONSTRAINT "Comando_trajetoId_fkey" FOREIGN KEY ("trajetoId") REFERENCES "Trajeto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
