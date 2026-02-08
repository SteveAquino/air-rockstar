import { render, screen } from '@testing-library/react';
import AboutPage from '../app/about/page';

describe('AboutPage', () => {
  describe('when rendered', () => {
    it('when rendered, should display the main heading', () => {
      render(<AboutPage />);

      const heading = screen.getByRole('heading', {
        level: 1,
        name: /why air rockstar exists/i,
      });
      expect(heading).toBeInTheDocument();
    });

    it('when rendered, should describe the project motivation', () => {
      render(<AboutPage />);

      const motivation = screen.getByRole('heading', { name: /motivation/i });
      expect(motivation).toBeInTheDocument();
    });

    it('when rendered, should show the build timeline', () => {
      render(<AboutPage />);

      const timeline = screen.getByRole('heading', { name: /build timeline/i });
      expect(timeline).toBeInTheDocument();
    });

    it('when rendered, should provide navigation back to home', () => {
      render(<AboutPage />);

      const backLink = screen.getByRole('link', { name: /back to home/i });
      expect(backLink).toHaveAttribute('href', '/');
    });
  });
});
