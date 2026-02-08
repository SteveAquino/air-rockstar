import { render, screen } from '@testing-library/react';
import GuitarPage from '../app/guitar/page';

// Mock useCamera hook
jest.mock('../src/hooks/useCamera');
// Mock useHandTracking hook
jest.mock('../src/hooks/useHandTracking');

const mockUseCamera = require('../src/hooks/useCamera').useCamera as jest.Mock;
const mockUseHandTracking = require('../src/hooks/useHandTracking')
  .useHandTracking as jest.Mock;

describe('GuitarPage', () => {
  beforeEach(() => {
    mockUseCamera.mockReturnValue({
      stream: null,
      error: null,
      isRequesting: false,
      permissionState: 'prompt',
      requestCamera: jest.fn(),
      stopCamera: jest.fn(),
    });

    mockUseHandTracking.mockReturnValue({
      landmarks: null,
      isProcessing: false,
      error: null,
    });
  });

  describe('when rendered', () => {
    it('should display the main heading', () => {
      render(<GuitarPage />);
      
      const heading = screen.getByRole('heading', { name: /air guitar/i });
      expect(heading).toBeInTheDocument();
    });

    it('should display camera setup instructions', () => {
      render(<GuitarPage />);
      
      const description = screen.getByText(/enable your camera to start tracking/i);
      expect(description).toBeInTheDocument();
    });

    it('should display enable camera button', () => {
      render(<GuitarPage />);
      
      const button = screen.getByRole('button', { name: /enable camera/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('when camera is enabled', () => {
    it('should display video feed', () => {
      const mockStream = {};
      mockUseCamera.mockReturnValue({
        stream: mockStream,
        error: null,
        isRequesting: false,
        permissionState: 'granted',
        requestCamera: jest.fn(),
        stopCamera: jest.fn(),
      });

      render(<GuitarPage />);
      
      const video = screen.getByLabelText(/camera feed/i);
      expect(video).toBeInTheDocument();
    });

    it('should show hands detected status when landmarks exist', () => {
      const mockStream = {};
      mockUseCamera.mockReturnValue({
        stream: mockStream,
        error: null,
        isRequesting: false,
        permissionState: 'granted',
        requestCamera: jest.fn(),
        stopCamera: jest.fn(),
      });

      mockUseHandTracking.mockReturnValue({
        landmarks: [{ length: 21 }],
        isProcessing: false,
        error: null,
      });

      render(<GuitarPage />);

      const status = screen.getByText(/hands detected/i);
      expect(status).toBeInTheDocument();
    });

    it('should display stop camera button', () => {
      const mockStream = {};
      mockUseCamera.mockReturnValue({
        stream: mockStream,
        error: null,
        isRequesting: false,
        permissionState: 'granted',
        requestCamera: jest.fn(),
        stopCamera: jest.fn(),
      });

      render(<GuitarPage />);
      
      const button = screen.getByRole('button', { name: /stop camera/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('when hand tracking has an error', () => {
    it('should display tracking error message', () => {
      const mockStream = {};
      mockUseCamera.mockReturnValue({
        stream: mockStream,
        error: null,
        isRequesting: false,
        permissionState: 'granted',
        requestCamera: jest.fn(),
        stopCamera: jest.fn(),
      });

      mockUseHandTracking.mockReturnValue({
        landmarks: null,
        isProcessing: false,
        error: 'Tracking error',
      });

      render(<GuitarPage />);

      const trackingError = screen.getByText(/hand tracking: tracking error/i);
      expect(trackingError).toBeInTheDocument();
    });
  });

  describe('when there is an error', () => {
    it('should display error message', () => {
      mockUseCamera.mockReturnValue({
        stream: null,
        error: 'Camera access denied',
        isRequesting: false,
        permissionState: 'denied',
        requestCamera: jest.fn(),
        stopCamera: jest.fn(),
      });

      render(<GuitarPage />);
      
      const error = screen.getByRole('alert');
      expect(error).toHaveTextContent('Camera access denied');
    });
  });

  describe('accessibility', () => {
    it('should have a main landmark', () => {
      render(<GuitarPage />);
      
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    it('should have accessible button label', () => {
      render(<GuitarPage />);
      
      const button = screen.getByRole('button', { name: /enable camera for hand tracking/i });
      expect(button).toBeInTheDocument();
    });
  });
});
