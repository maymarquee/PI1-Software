import styles from './Modal1.module.css'; 

export default function PainelDeComandos() {
  return (
    // Esta é a div principal que será nosso retângulo branco.
    <div className={styles.panelContainer}>
      <h1 className={styles.title}>Adicionar</h1>

      <div className={`${styles.commandItem} ${styles.greenItem}`}>
        <span>para frente</span>

        <div className={styles.rightContent}>
          <button className={styles.valueButton}>
            Valor
          </button>
          
          <span className={styles.icon}>↑</span>
        </div>
      </div>

      <button className={`${styles.commandItem} ${styles.blueButton}`}>
        <span>rotacionar direita</span>
        <span className={styles.icon}>↷</span>
      </button>

      <button className={`${styles.commandItem} ${styles.brownButton}`}>
        <span>rotacionar esquerda</span>
        <span className={styles.icon}>↶</span>
      </button>

    </div>
  );
}