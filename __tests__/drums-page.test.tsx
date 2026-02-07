import { render, screen } from '@testing-library/react';
import DrumsPage from '../app/drums/page';

describe('DrumsPage', () => {
  describe('when rendered', () => {
    it('should display the main heading', () => {
      render(<DrumsPage />);
      
      const heading = screen.getByRole('heading', { name: /air drums/i });
      expect(heading).toBeInTheDocument();
    });

    it('should display coming soon message', () => {
      render(<DrumsPage />);
      
      const message = screen.getByText(/coming soon/i);
      expect(message).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have a main landmark', () => {
      render(<DrumsPage />);
      
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });
  });
});
