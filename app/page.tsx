import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/src/components/ui/Card';
import { LinkButton } from '@/src/components/ui/LinkButton';
import { StatusPill } from '@/src/components/ui/StatusPill';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Welcome</p>
          <h1 className={styles.title}>Air Rockstar</h1>
          <p className={styles.description}>
            Select an instrument to get started
          </p>
        </div>
        <StatusPill tone="locked" label="Camera Not Ready" />
      </header>

      <section className={styles.cards}>
        <Card className={styles.card}>
          <div className={styles.cardIcon}>
            <Image src="/images/guitar.png" alt="" width={220} height={220} />
          </div>
          <div className={styles.cardBody}>
            <h2>Air Guitar</h2>
            <p>Play guitar in the air</p>
          </div>
          <LinkButton
            href="/guitar"
            aria-label="Start Air Guitar"
            isFullWidth
          >
            Start
          </LinkButton>
        </Card>

        <Card className={styles.card}>
          <div className={styles.cardIcon}>
            <Image src="/images/drums.png" alt="" width={240} height={200} />
          </div>
          <div className={styles.cardBody}>
            <h2>Air Drums</h2>
            <p>Play drums with your hands</p>
          </div>
          <LinkButton
            href="/drums"
            aria-label="Start Air Drums"
            isFullWidth
          >
            Start
          </LinkButton>
        </Card>
      </section>

      <div className={styles.metaLinks}>
        <Link href="/styleguide" className={styles.options}>
          Style Guide <span aria-hidden="true">&gt;</span>
        </Link>
        <Link href="/about" className={styles.options}>
          About <span aria-hidden="true">&gt;</span>
        </Link>
      </div>
    </main>
  );
}
