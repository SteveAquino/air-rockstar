import { render, screen } from '@testing-library/react';
import { GuitarVideoStage } from '../app/guitar/GuitarVideoStage';
import type { GuitarString } from '../src/types/guitar';
import { createRef } from 'react';

const baseStrings: GuitarString[] = [
  {
    id: 'e4',
    label: 'E',
    note: 'E4',
    frequency: 329.63,
    yPercent: 10,
    thicknessPx: 8,
    color: '#6ee7ff',
    activeColor: '#22d3ee',
  },
  {
    id: 'b3',
    label: 'B',
    note: 'B3',
    frequency: 246.94,
    yPercent: 25,
    thicknessPx: 8,
    color: '#a5b4fc',
    activeColor: '#818cf8',
  },
  {
    id: 'g3',
    label: 'G',
    note: 'G3',
    frequency: 196.0,
    yPercent: 40,
    thicknessPx: 8,
    color: '#c4b5fd',
    activeColor: '#a78bfa',
  },
  {
    id: 'd3',
    label: 'D',
    note: 'D3',
    frequency: 146.83,
    yPercent: 55,
    thicknessPx: 8,
    color: '#fde68a',
    activeColor: '#fbbf24',
  },
  {
    id: 'a2',
    label: 'A',
    note: 'A2',
    frequency: 110.0,
    yPercent: 70,
    thicknessPx: 8,
    color: '#fcd34d',
    activeColor: '#f59e0b',
  },
  {
    id: 'e2',
    label: 'E',
    note: 'E2',
    frequency: 82.41,
    yPercent: 85,
    thicknessPx: 8,
    color: '#fca5a5',
    activeColor: '#f87171',
  },
];

describe('GuitarVideoStage', () => {
  it('when ready, should render string overlay', () => {
    render(
      <GuitarVideoStage
        videoRef={createRef<HTMLVideoElement>()}
        canvasRef={createRef<HTMLCanvasElement>()}
        containerRef={createRef<HTMLDivElement>()}
        strings={baseStrings}
        activeStrings={new Set(['e4'])}
        frettedStrings={{ e4: 2, b3: 0, g3: 0, d3: 0, a2: 0, e2: 0 }}
        isReady={true}
        isFullScreen={false}
        onExitFullScreen={jest.fn()}
        onStopCamera={jest.fn()}
      />
    );

    const list = screen.getByRole('list', { name: /guitar strings/i });
    expect(list).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(6);
    expect(screen.getByLabelText(/fret 2/i)).toBeInTheDocument();
  });

  it('when not ready, should not render string overlay', () => {
    render(
      <GuitarVideoStage
        videoRef={createRef<HTMLVideoElement>()}
        canvasRef={createRef<HTMLCanvasElement>()}
        containerRef={createRef<HTMLDivElement>()}
        strings={baseStrings}
        activeStrings={new Set()}
        frettedStrings={{}}
        isReady={false}
        isFullScreen={false}
        onExitFullScreen={jest.fn()}
        onStopCamera={jest.fn()}
      />
    );

    expect(
      screen.queryByRole('list', { name: /guitar strings/i })
    ).not.toBeInTheDocument();
  });

  it('when in fullscreen, should show fullscreen controls', () => {
    render(
      <GuitarVideoStage
        videoRef={createRef<HTMLVideoElement>()}
        canvasRef={createRef<HTMLCanvasElement>()}
        containerRef={createRef<HTMLDivElement>()}
        strings={baseStrings}
        activeStrings={new Set()}
        frettedStrings={{}}
        isReady={true}
        isFullScreen={true}
        onExitFullScreen={jest.fn()}
        onStopCamera={jest.fn()}
      />
    );

    expect(
      screen.getByRole('button', { name: /exit full screen/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /stop camera/i })
    ).toBeInTheDocument();
  });
});
