import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Air Rockstar</h1>
        <p className={styles.description}>
          Play virtual instruments using motion tracking and your camera
        </p>
        <div className={styles.buttonContainer}>
          <Link href="/guitar" className={styles.button}>
            🎸 Play Air Guitar
          </Link>
          <Link href="/drums" className={styles.button}>
            🥁 Play Air Drums
          </Link>
        </div>
      </div>
    </main>
  );
}
