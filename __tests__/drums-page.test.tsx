import { render, screen, act, fireEvent } from '@testing-library/react';
import DrumsPage from '../app/drums/page';

// Mock useCamera hook
jest.mock('../src/hooks/useCamera');
// Mock useDrumKit hook
jest.mock('../src/hooks/useDrumKit');
// Mock useHandTracking hook
jest.mock('../src/hooks/useHandTracking');

const mockUseCamera = require('../src/hooks/useCamera').useCamera as jest.Mock;
const mockUseDrumKit = require('../src/hooks/useDrumKit').useDrumKit as jest.Mock;
const mockUseHandTracking = require('../src/hooks/useHandTracking')
  .useHandTracking as jest.Mock;

describe('DrumsPage', () => {
  beforeEach(() => {
    mockUseCamera.mockReturnValue({
      stream: null,
      error: null,
      isRequesting: false,
      permissionState: 'prompt',
      requestCamera: jest.fn(),
      stopCamera: jest.fn(),
    });

    mockUseDrumKit.mockReturnValue({
      pads: [
        { id: 'hihat', name: 'Hi-Hat', x: 12, y: 16, width: 120, height: 120, color: '#3b82f6', activeColor: '#2563eb' },
        { id: 'crash', name: 'Crash', x: 68, y: 16, width: 120, height: 120, color: '#f97316', activeColor: '#ea580c' },
        { id: 'tomHigh', name: 'High Tom', x: 40, y: 18, width: 120, height: 120, color: '#14b8a6', activeColor: '#0d9488' },
        { id: 'snare', name: 'Snare', x: 18, y: 48, width: 120, height: 120, color: '#ef4444', activeColor: '#dc2626' },
        { id: 'tomLow', name: 'Low Tom', x: 60, y: 48, width: 120, height: 120, color: '#f59e0b', activeColor: '#d97706' },
        { id: 'kick', name: 'Kick', x: 40, y: 70, width: 120, height: 120, color: '#8b5cf6', activeColor: '#7c3aed' },
      ],
      activePads: new Set(),
      isReady: true,
    });

    mockUseHandTracking.mockReturnValue({
      landmarks: null,
      isProcessing: false,
      error: null,
    });
  });

  describe('when rendered', () => {
    it('should display the main heading', () => {
      render(<DrumsPage />);
      
      const heading = screen.getByRole('heading', { name: /air drums/i });
      expect(heading).toBeInTheDocument();
    });

    it('should display camera setup instructions', () => {
      render(<DrumsPage />);
      
      const description = screen.getByText(/enable your camera to start tracking/i);
      expect(description).toBeInTheDocument();
    });

    it('should display enable camera button', () => {
      render(<DrumsPage />);
      
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

      render(<DrumsPage />);
      
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

      render(<DrumsPage />);

      const status = screen.getByText(/hands detected/i);
      expect(status).toBeInTheDocument();
    });

    it('should display sound variant control', () => {
      const mockStream = {};
      mockUseCamera.mockReturnValue({
        stream: mockStream,
        error: null,
        isRequesting: false,
        permissionState: 'granted',
        requestCamera: jest.fn(),
        stopCamera: jest.fn(),
      });

      render(<DrumsPage />);

      const control = screen.getByRole('radiogroup', { name: /sound variant/i });
      expect(control).toBeInTheDocument();
    });

    it('should display kit pieces controls', () => {
      const mockStream = {};
      mockUseCamera.mockReturnValue({
        stream: mockStream,
        error: null,
        isRequesting: false,
        permissionState: 'granted',
        requestCamera: jest.fn(),
        stopCamera: jest.fn(),
      });

      render(<DrumsPage />);

      const kitGroup = screen.getByRole('group', { name: /kit pieces/i });
      expect(kitGroup).toBeInTheDocument();
    });

    it('should configure hand tracking visuals based on sensitivity', () => {
      const mockStream = {};
      mockUseCamera.mockReturnValue({
        stream: mockStream,
        error: null,
        isRequesting: false,
        permissionState: 'granted',
        requestCamera: jest.fn(),
        stopCamera: jest.fn(),
      });

      render(<DrumsPage />);

      expect(mockUseHandTracking).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        true,
        expect.objectContaining({
          landmarkRadius: expect.any(Number),
          landmarkColor: expect.any(String),
          connectionColor: expect.any(String),
        })
      );
    });

    it('should display help tooltips for controls and stats', () => {
      const mockStream = {};
      mockUseCamera.mockReturnValue({
        stream: mockStream,
        error: null,
        isRequesting: false,
        permissionState: 'granted',
        requestCamera: jest.fn(),
        stopCamera: jest.fn(),
      });

      render(<DrumsPage />);

      expect(
        screen.getByRole('button', { name: /help: sensitivity/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /help: size/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /help: volume/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /help: sound variant/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /help: kit pieces/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /help: combo/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /help: tempo/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /help: hits/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /help: full screen/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /help: stop camera/i })
      ).toBeInTheDocument();
    });

    it('should hide controls when performance mode is enabled', () => {
      const mockStream = {};
      mockUseCamera.mockReturnValue({
        stream: mockStream,
        error: null,
        isRequesting: false,
        permissionState: 'granted',
        requestCamera: jest.fn(),
        stopCamera: jest.fn(),
      });

      render(<DrumsPage />);

      const fullScreenButton = screen.getByRole('button', {
        name: /^full screen$/i,
      });
      fireEvent.click(fullScreenButton);

      expect(
        screen.queryByRole('radiogroup', { name: /sound variant/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('group', { name: /kit pieces/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('slider', { name: /sensitivity/i })
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/combo/i)).not.toBeInTheDocument();
    });

    it('should display audio loading status when kit is not ready', () => {
      const mockStream = {};
      mockUseCamera.mockReturnValue({
        stream: mockStream,
        error: null,
        isRequesting: false,
        permissionState: 'granted',
        requestCamera: jest.fn(),
        stopCamera: jest.fn(),
      });

      mockUseDrumKit.mockReturnValue({
        pads: [],
        activePads: new Set(),
        isReady: false,
      });

      render(<DrumsPage />);

      const status = screen.getByText(/audio loading/i);
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

      render(<DrumsPage />);
      
      const button = screen.getByRole('button', { name: /^stop camera$/i });
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

      render(<DrumsPage />);

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

      render(<DrumsPage />);
      
      const error = screen.getByRole('alert');
      expect(error).toHaveTextContent('Camera access denied');
    });
  });

  describe('when video metadata loads', () => {
    it('should update container size', () => {
      const mockStream = {};
      mockUseCamera.mockReturnValue({
        stream: mockStream,
        error: null,
        isRequesting: false,
        permissionState: 'granted',
        requestCamera: jest.fn(),
        stopCamera: jest.fn(),
      });

      render(<DrumsPage />);
      
      const video = document.querySelector('video');
      expect(video).toBeInTheDocument();
      
      // Trigger loadedmetadata event
      if (video) {
        Object.defineProperty(video, 'videoWidth', { value: 640 });
        Object.defineProperty(video, 'videoHeight', { value: 480 });
        act(() => {
          video.dispatchEvent(new Event('loadedmetadata'));
        });
      }
    });

    it('should update size on window resize', () => {
      const mockStream = {};
      mockUseCamera.mockReturnValue({
        stream: mockStream,
        error: null,
        isRequesting: false,
        permissionState: 'granted',
        requestCamera: jest.fn(),
        stopCamera: jest.fn(),
      });

      render(<DrumsPage />);
      
      // Trigger resize event
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });
    });
  });

  describe('accessibility', () => {
    it('should have a main landmark', () => {
      render(<DrumsPage />);
      
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    it('should have accessible button label', () => {
      render(<DrumsPage />);
      
      const button = screen.getByRole('button', { name: /enable camera for hand tracking/i });
      expect(button).toBeInTheDocument();
    });
  });
});
