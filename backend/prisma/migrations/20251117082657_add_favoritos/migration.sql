-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Trajeto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dataExecucao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respostaCarrinho" JSONB,
    "distanciaTotal" REAL DEFAULT 0,
    "tempoTotalEstimado" REAL DEFAULT 0,
    "velocidadeMedia" REAL DEFAULT 0,
    "nome" TEXT,
    "isFavorito" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Trajeto" ("dataExecucao", "distanciaTotal", "id", "respostaCarrinho", "tempoTotalEstimado", "velocidadeMedia") SELECT "dataExecucao", "distanciaTotal", "id", "respostaCarrinho", "tempoTotalEstimado", "velocidadeMedia" FROM "Trajeto";
DROP TABLE "Trajeto";
ALTER TABLE "new_Trajeto" RENAME TO "Trajeto";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
