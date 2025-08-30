import styles from "./page.module.css";
import { Icon } from '@iconify/react'; 
export default function Home() {
  return (
    <div className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <h2>Chartalis</h2>
        <ul>
          <li>Test1</li>
          <li>Test2</li>
          <li>Test3</li>
          <li>Test4</li>
        </ul>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <h1>1</h1>
        </header>

        <div className={styles.cards}>
          <div className={styles.card}>
            <h3>2</h3>
            <p>ABC</p>
          </div>
          <div className={styles.card}>
            <h3>3</h3>
            <p>ABC</p>
          </div>
          <div className={styles.card}>
            <h3>4</h3>
            <p>ABC</p>
          </div>
        </div>
      </main>
    </div>
  );
}

