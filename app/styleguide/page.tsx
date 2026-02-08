import Image from 'next/image';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { CameraSetupCard } from '@/src/components/ui/CameraSetupCard';
import { Label } from '@/src/components/ui/Label';
import { Panel } from '@/src/components/ui/Panel';
import { SegmentedControl } from '@/src/components/ui/SegmentedControl';
import { Slider } from '@/src/components/ui/Slider';
import { StatusPill } from '@/src/components/ui/StatusPill';
import styles from './page.module.css';

export default function StyleguidePage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <h1>Air Rockstar Styleguide</h1>
          <p>Design tokens and reusable components.</p>
        </div>
        <StatusPill tone="ready" label="System Ready" />
      </header>

      <section className={styles.grid}>
        <Card>
          <h2>Typography</h2>
          <div className={styles.typography}>
            <h1>Display Heading</h1>
            <h2>Section Heading</h2>
            <p>
              Body text uses Manrope for readability. This is the default
              paragraph style.
            </p>
            <Label>Label text</Label>
          </div>
        </Card>

        <Card>
          <h2>Colors</h2>
          <div className={styles.swatches}>
            <div className={styles.swatch}>
              <span className={styles.swatchColor} />
              Glow Purple
            </div>
            <div className={styles.swatchAlt}>
              <span className={styles.swatchColorAlt} />
              Glow Blue
            </div>
            <div className={styles.swatchSurface}>
              <span className={styles.swatchColorSurface} />
              Surface
            </div>
            <div className={styles.swatchPop}>
              <span className={styles.swatchColorPop} />
              Pop
            </div>
          </div>
        </Card>

        <Card>
          <h2>Buttons</h2>
          <div className={styles.buttonRow}>
            <Button>Primary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="subtle">Subtle</Button>
            <Button variant="danger">Danger</Button>
          </div>
        </Card>

        <Card>
          <h2>Status</h2>
          <div className={styles.statusRow}>
            <StatusPill tone="ready" label="Ready" />
            <StatusPill tone="info" label="Info" />
            <StatusPill tone="warn" label="Warning" />
            <StatusPill tone="locked" label="Locked" />
          </div>
          <div className={styles.badgeRow}>
            <Badge>Accent</Badge>
            <Badge tone="muted">Muted</Badge>
          </div>
        </Card>

        <Panel className={styles.panel}>
          <h2>Controls</h2>
          <div className={styles.controlStack}>
            <Slider
              label="Sensitivity"
              value={70}
              min={0}
              max={100}
              unit="%"
              helpText="Makes hit detection more forgiving when your hands are a little off."
            />
            <Slider
              label="Size"
              value={48}
              min={20}
              max={90}
              unit="%"
              helpText="Changes how large drum pads appear and how easy they are to reach."
            />
            <Slider
              label="Volume"
              value={70}
              min={0}
              max={100}
              unit="%"
              helpText="Controls how loud the drum hits sound."
            />
            <SegmentedControl
              label="Sound Variant"
              value="synth"
              helpText="Switch between electronic and acoustic drum sounds."
              options={[
                { value: 'synth', label: 'Synth' },
                { value: 'acoustic', label: 'Acoustic' },
              ]}
            />
          </div>
        </Panel>

        <CameraSetupCard
          title="Camera Setup"
          isRequesting={false}
        />

        <Card>
          <h2>Iconography</h2>
          <div className={styles.iconRow}>
            <Image src="/images/guitar.png" alt="Guitar" width={140} height={140} />
            <Image src="/images/drums.png" alt="Drums" width={150} height={120} />
          </div>
        </Card>
      </section>
    </main>
  );
}
