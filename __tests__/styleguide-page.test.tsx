import { render, screen } from '@testing-library/react';
import StyleguidePage from '../app/styleguide/page';

describe('StyleguidePage', () => {
  describe('when rendered', () => {
    it('should display the styleguide heading', () => {
      render(<StyleguidePage />);

      const heading = screen.getByRole('heading', {
        name: /air rockstar styleguide/i,
      });
      expect(heading).toBeInTheDocument();
    });

    it('should display a page label', () => {
      render(<StyleguidePage />);

      const label = screen.getByText(/^styleguide$/i);
      expect(label).toBeInTheDocument();
    });

    it('should display a link back to home', () => {
      render(<StyleguidePage />);

      const backLink = screen.getByRole('link', { name: /back to home/i });
      expect(backLink).toHaveAttribute('href', '/');
    });

    it('should display typography and colors sections', () => {
      render(<StyleguidePage />);

      const typography = screen.getByRole('heading', { name: /typography/i });
      const colors = screen.getByRole('heading', { name: /colors/i });
      expect(typography).toBeInTheDocument();
      expect(colors).toBeInTheDocument();
    });

    it('should show component samples', () => {
      render(<StyleguidePage />);

      const buttons = screen.getByRole('heading', { name: /buttons/i });
      const status = screen.getByRole('heading', { name: /status/i });
      expect(buttons).toBeInTheDocument();
      expect(status).toBeInTheDocument();
    });
  });
});
