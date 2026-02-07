import { render, screen } from '@testing-library/react';
import GuitarPage from '../app/guitar/page';

describe('GuitarPage', () => {
  describe('when rendered', () => {
    it('should display the main heading', () => {
      render(<GuitarPage />);
      
      const heading = screen.getByRole('heading', { name: /air guitar/i });
      expect(heading).toBeInTheDocument();
    });

    it('should display coming soon message', () => {
      render(<GuitarPage />);
      
      const message = screen.getByText(/coming soon/i);
      expect(message).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have a main landmark', () => {
      render(<GuitarPage />);
      
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });
  });
});
