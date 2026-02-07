import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';

describe('HomePage', () => {
  describe('when rendered', () => {
    it('should display the main heading', () => {
      render(<HomePage />);
      
      const heading = screen.getByRole('heading', { name: /air rockstar/i });
      expect(heading).toBeInTheDocument();
    });

    it('should display a description about the app', () => {
      render(<HomePage />);
      
      const description = screen.getByText(/motion tracking|camera|virtual instruments/i);
      expect(description).toBeInTheDocument();
    });

    it('should display a link to the guitar page', () => {
      render(<HomePage />);
      
      const guitarLink = screen.getByRole('link', { name: /play air guitar/i });
      expect(guitarLink).toBeInTheDocument();
    });

    it('should display a link to the drums page', () => {
      render(<HomePage />);
      
      const drumsLink = screen.getByRole('link', { name: /play air drums/i });
      expect(drumsLink).toBeInTheDocument();
    });
  });

  describe('guitar link', () => {
    it('should have the correct href attribute', () => {
      render(<HomePage />);
      
      const guitarLink = screen.getByRole('link', { name: /play air guitar/i });
      expect(guitarLink).toHaveAttribute('href', '/guitar');
    });

    it('should be keyboard accessible', () => {
      render(<HomePage />);
      
      const guitarLink = screen.getByRole('link', { name: /play air guitar/i });
      expect(guitarLink).toHaveAttribute('tabIndex');
    });
  });

  describe('drums link', () => {
    it('should have the correct href attribute', () => {
      render(<HomePage />);
      
      const drumsLink = screen.getByRole('link', { name: /play air drums/i });
      expect(drumsLink).toHaveAttribute('href', '/drums');
    });

    it('should be keyboard accessible', () => {
      render(<HomePage />);
      
      const drumsLink = screen.getByRole('link', { name: /play air drums/i });
      expect(drumsLink).toHaveAttribute('tabIndex');
    });
  });

  describe('accessibility', () => {
    it('should have a main landmark', () => {
      render(<HomePage />);
      
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      render(<HomePage />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });
  });
});
