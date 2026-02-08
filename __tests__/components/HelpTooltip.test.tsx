import { render, screen, fireEvent } from '@testing-library/react';
import { HelpTooltip } from '../../src/components/ui/HelpTooltip';

describe('HelpTooltip', () => {
  it('should render help button with aria label', () => {
    render(<HelpTooltip label="Help: Sensitivity" text="Explains sensitivity." />);

    const button = screen.getByRole('button', { name: /help: sensitivity/i });
    expect(button).toBeInTheDocument();
  });

  it('should toggle pinned state on click', () => {
    render(<HelpTooltip label="Help: Sensitivity" text="Explains sensitivity." />);

    const button = screen.getByRole('button', { name: /help: sensitivity/i });
    expect(button).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});
