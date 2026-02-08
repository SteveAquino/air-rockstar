import Link from 'next/link';
import { Card } from '@/src/components/ui/Card';
import { LinkButton } from '@/src/components/ui/LinkButton';
import { Panel } from '@/src/components/ui/Panel';
import styles from './page.module.css';

const TIMELINE = [
  {
    title: 'Spark',
    description:
      'A late-night idea to make practice feel like play, using just a camera.',
  },
  {
    title: 'First Prototype',
    description:
      'Early hand tracking experiments proved we could trigger real-time audio.',
  },
  {
    title: 'AI-Assisted Builds',
    description:
      'Rapid iterations with AI tools helped shape the first playable modes.',
  },
  {
    title: 'Beta Sessions',
    description:
      'Dozens of quick tests with my son helped refine the feel and feedback.',
  },
  {
    title: 'Today',
    description:
      'Air Rockstar keeps evolving with new instruments, dynamics, and playful effects.',
  },
];

export default function AboutPage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>About</p>
          <h1 className={styles.title}>Why Air Rockstar Exists</h1>
          <p className={styles.subtitle}>
            This project started as a way to turn practice into play. It blends
            hand tracking, real-time audio, and a little bit of stage magic.
          </p>
        </div>
        <LinkButton href="/" variant="ghost" size="sm">
          Back to Home
        </LinkButton>
      </header>

      <section className={styles.grid}>
        <Card className={styles.card}>
          <h2>Motivation</h2>
          <p>
            I wanted a playful way to explore music without physical gear. Air
            Rockstar lets anyone air-strum or air-drum and still feel the
            feedback of sound and visuals.
          </p>
        </Card>

        <Card className={styles.card}>
          <h2>Inspiration</h2>
          <p>
            The inspiration came from watching my son explore music with
            curiosity. The goal is to keep that spark alive and make practice
            feel like a game.
          </p>
        </Card>
      </section>

      <Panel className={styles.timelinePanel} as="section">
        <h2 className={styles.timelineTitle}>Build Timeline</h2>
        <ol className={styles.timeline}>
          {TIMELINE.map((item) => (
            <li key={item.title} className={styles.timelineItem}>
              <span className={styles.timelineDot} aria-hidden="true" />
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </Panel>

      <div className={styles.actions}>
        <Link href="/guitar" className={styles.actionLink}>
          Try Air Guitar <span aria-hidden="true">&gt;</span>
        </Link>
        <Link href="/drums" className={styles.actionLink}>
          Try Air Drums <span aria-hidden="true">&gt;</span>
        </Link>
      </div>
    </main>
  );
}
