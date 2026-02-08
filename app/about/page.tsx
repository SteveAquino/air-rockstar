import Link from 'next/link';
import { Card } from '@/src/components/ui/Card';
import { LinkButton } from '@/src/components/ui/LinkButton';
import { Panel } from '@/src/components/ui/Panel';
import styles from './page.module.css';

const TIMELINE = [
  {
    title: 'Spark',
    description:
      'I wanted people to hear the guitar riffs and drum solos I hear in my head when I play air guitar or air drums.',
  },
  {
    title: 'MVP in 2.5 Hours',
    description:
      'I thought, "Hey, I bet Copilot could build that." My son was skeptical. Two and a half hours later we had a working MVP.',
  },
  {
    title: 'Design + Styleguide',
    description:
      'I asked ChatGPT to help shape the design and styleguide. Then Codex built the component library and drove a full design refactor in about an hour.',
  },
  {
    title: 'Guitar Day',
    description:
      'The next day, I spent about an hour adding the guitar mode.',
  },
  {
    title: 'A Small Weekend Project',
    description:
      'Simple, fun, and a great excuse to play with AI dev tools while showing my son how software is built in real life.',
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
            This project started as a way to share the music I hear when I play
            air guitar and air drums. It turned into a fast, fun weekend build
            with help from AI tools and a skeptical co-pilot.
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
            I wanted a way for others to hear the riffs and solos I imagine
            while playing air guitar or air drums.
          </p>
        </Card>

        <Card className={styles.card}>
          <h2>Inspiration</h2>
          <p>
            The spark was the challenge: could AI help me build it quickly? My
            son doubted it, which made it even more fun to try.
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
