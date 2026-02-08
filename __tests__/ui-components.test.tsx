import { fireEvent, render, screen } from '@testing-library/react';
import { Badge } from '../src/components/ui/Badge';
import { Button } from '../src/components/ui/Button';
import { Card } from '../src/components/ui/Card';
import { Cluster } from '../src/components/ui/Cluster';
import { IconButton } from '../src/components/ui/IconButton';
import { Label } from '../src/components/ui/Label';
import { Panel } from '../src/components/ui/Panel';
import { SegmentedControl } from '../src/components/ui/SegmentedControl';
import { Slider } from '../src/components/ui/Slider';
import { Stack } from '../src/components/ui/Stack';
import { StatusPill } from '../src/components/ui/StatusPill';

describe('UI components', () => {
  it('should render buttons and badges', () => {
    render(
      <div>
        <Button>Primary</Button>
        <Button variant="ghost">Ghost</Button>
        <Badge>Accent</Badge>
        <Badge tone="muted">Muted</Badge>
      </div>
    );

    expect(screen.getByRole('button', { name: /primary/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ghost/i })).toBeInTheDocument();
    expect(screen.getByText(/accent/i)).toBeInTheDocument();
    expect(screen.getByText(/muted/i)).toBeInTheDocument();
  });

  it('should render layout components with content', () => {
    render(
      <div>
        <Card>Card content</Card>
        <Panel>Panel content</Panel>
        <Stack>
          <span>Stack item</span>
        </Stack>
        <Cluster>
          <span>Cluster item</span>
        </Cluster>
      </div>
    );

    expect(screen.getByText(/card content/i)).toBeInTheDocument();
    expect(screen.getByText(/panel content/i)).toBeInTheDocument();
    expect(screen.getByText(/stack item/i)).toBeInTheDocument();
    expect(screen.getByText(/cluster item/i)).toBeInTheDocument();
  });

  it('should render icon and status pills', () => {
    render(
      <div>
        <IconButton icon={<span>+</span>} aria-label="Add" />
        <StatusPill tone="ready" label="Ready" />
        <StatusPill tone="info" label="Info" icon={<span>i</span>} />
        <Label>Label</Label>
      </div>
    );

    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    expect(screen.getByText(/ready/i)).toBeInTheDocument();
    expect(screen.getByText(/info/i)).toBeInTheDocument();
    expect(screen.getByText(/label/i)).toBeInTheDocument();
  });

  it('should allow segmented control interactions', () => {
    const handleChange = jest.fn();
    render(
      <SegmentedControl
        label="Sound Variant"
        value="synth"
        onChange={handleChange}
        options={[
          { value: 'synth', label: 'Synth' },
          { value: 'acoustic', label: 'Acoustic' },
        ]}
      />
    );

    const acoustic = screen.getByRole('radio', { name: /acoustic/i });
    fireEvent.click(acoustic);
    expect(handleChange).toHaveBeenCalledWith('acoustic');
  });

  it('should render segmented control in read-only mode', () => {
    render(
      <SegmentedControl
        label="Mode"
        value="a"
        options={[
          { value: 'a', label: 'Mode A' },
          { value: 'b', label: 'Mode B' },
        ]}
      />
    );

    const option = screen.getByRole('radio', { name: /mode a/i });
    expect(option).toBeDisabled();
  });

  it('should support slider interactions', () => {
    const handleChange = jest.fn();
    render(
      <Slider label="Sensitivity" value={50} onChange={handleChange} />
    );

    const slider = screen.getByRole('slider', { name: /sensitivity/i });
    fireEvent.change(slider, { target: { value: '70' } });
    expect(handleChange).toHaveBeenCalledWith(70);
  });

  it('should render slider in read-only mode', () => {
    render(<Slider label="Size" value={40} />);

    const slider = screen.getByRole('slider', { name: /size/i });
    expect(slider).toHaveAttribute('readonly');
  });
});
