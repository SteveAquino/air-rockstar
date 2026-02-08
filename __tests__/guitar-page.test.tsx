import { render, screen, fireEvent } from '@testing-library/react';
import GuitarPage from '../app/guitar/page';

// Mock useCamera hook
jest.mock('../src/hooks/useCamera');
// Mock useHandTracking hook
jest.mock('../src/hooks/useHandTracking');
// Mock useGuitar hook
jest.mock('../src/hooks/useGuitar');

const mockUseCamera = require('../src/hooks/useCamera').useCamera as jest.Mock;
const mockUseHandTracking = require('../src/hooks/useHandTracking')
  .useHandTracking as jest.Mock;
const mockUseGuitar = require('../src/hooks/useGuitar').useGuitar as jest.Mock;

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

    mockUseGuitar.mockReturnValue({
      strings: [],
      activeStrings: new Set(),
      frettedStrings: {},
      isReady: true,
    });
  });

  describe('when rendered', () => {
    it('when rendered, should display the main heading', () => {
      render(<GuitarPage />);
      
      const heading = screen.getByRole('heading', { name: /air guitar/i });
      expect(heading).toBeInTheDocument();
    });

    it('when rendered, should display camera setup instructions', () => {
      render(<GuitarPage />);
      
      const description = screen.getByText(/enable your camera to start tracking/i);
      expect(description).toBeInTheDocument();
    });

    it('when rendered, should display enable camera button', () => {
      render(<GuitarPage />);
      
      const button = screen.getByRole('button', { name: /enable camera/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('when camera is enabled', () => {
    it('when camera is enabled, should display video feed', () => {
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

    it('when camera is enabled, should show hands detected status when landmarks exist', () => {
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

    it('when camera is enabled, should display controls and stats', () => {
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

      expect(
        screen.getByRole('slider', { name: /sensitivity/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('slider', { name: /string spacing/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('slider', { name: /string position/i })
      ).toBeInTheDocument();
      expect(screen.getByRole('slider', { name: /frets/i })).toBeInTheDocument();
      expect(screen.getByRole('slider', { name: /volume/i })).toBeInTheDocument();
      expect(screen.getByText(/^combo$/i)).toBeInTheDocument();
      expect(screen.getByText(/^tempo$/i)).toBeInTheDocument();
      expect(screen.getByText(/^hits$/i)).toBeInTheDocument();
    });

    it('when camera is enabled, should display full screen and stop camera actions', () => {
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

      expect(
        screen.getByRole('button', { name: /^full screen$/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /^stop camera$/i })
      ).toBeInTheDocument();
    });

    it('when performance mode is enabled, should hide controls', () => {
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

      const fullScreenButton = screen.getByRole('button', {
        name: /^full screen$/i,
      });
      fireEvent.click(fullScreenButton);

      expect(
        screen.queryByRole('slider', { name: /sensitivity/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('slider', { name: /string spacing/i })
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/^combo$/i)).not.toBeInTheDocument();
    });

    it('when guitar is not ready, should display audio loading status', () => {
      const mockStream = {};
      mockUseCamera.mockReturnValue({
        stream: mockStream,
        error: null,
        isRequesting: false,
        permissionState: 'granted',
        requestCamera: jest.fn(),
        stopCamera: jest.fn(),
      });

      mockUseGuitar.mockReturnValue({
        strings: [],
        activeStrings: new Set(),
        frettedStrings: {},
        isReady: false,
      });

      render(<GuitarPage />);

      const status = screen.getByText(/audio loading/i);
      expect(status).toBeInTheDocument();
    });

    it('when camera is enabled, should display stop camera button', () => {
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
      
      const button = screen.getByRole('button', { name: 'Stop Camera' });
      expect(button).toBeInTheDocument();
    });

    it('when stopping the camera in fullscreen, should exit full screen', () => {
      const mockStream = {};
      mockUseCamera.mockReturnValue({
        stream: mockStream,
        error: null,
        isRequesting: false,
        permissionState: 'granted',
        requestCamera: jest.fn(),
        stopCamera: jest.fn(),
      });

      const exitFullscreen = jest.fn().mockResolvedValue(undefined);
      Object.defineProperty(document, 'fullscreenElement', {
        configurable: true,
        get: () => ({}),
      });
      Object.defineProperty(document, 'exitFullscreen', {
        configurable: true,
        value: exitFullscreen,
      });

      render(<GuitarPage />);

      fireEvent.click(screen.getByRole('button', { name: 'Stop Camera' }));

      expect(exitFullscreen).toHaveBeenCalled();
    });

    it('when toggling from an active fullscreen state, should call exitFullscreen', () => {
      const mockStream = {};
      mockUseCamera.mockReturnValue({
        stream: mockStream,
        error: null,
        isRequesting: false,
        permissionState: 'granted',
        requestCamera: jest.fn(),
        stopCamera: jest.fn(),
      });

      const exitFullscreen = jest.fn().mockResolvedValue(undefined);
      Object.defineProperty(document, 'fullscreenElement', {
        configurable: true,
        get: () => ({}),
      });
      Object.defineProperty(document, 'exitFullscreen', {
        configurable: true,
        value: exitFullscreen,
      });

      render(<GuitarPage />);

      fireEvent.click(screen.getByRole('button', { name: /^full screen$/i }));

      expect(exitFullscreen).toHaveBeenCalled();
    });

    it('when fullscreen is available, should request fullscreen', () => {
      const mockStream = {};
      mockUseCamera.mockReturnValue({
        stream: mockStream,
        error: null,
        isRequesting: false,
        permissionState: 'granted',
        requestCamera: jest.fn(),
        stopCamera: jest.fn(),
      });

      const requestFullscreen = jest.fn().mockResolvedValue(undefined);
      Object.defineProperty(HTMLDivElement.prototype, 'requestFullscreen', {
        configurable: true,
        value: requestFullscreen,
      });
      Object.defineProperty(document, 'fullscreenElement', {
        configurable: true,
        get: () => null,
      });

      render(<GuitarPage />);

      fireEvent.click(screen.getByRole('button', { name: /^full screen$/i }));

      expect(requestFullscreen).toHaveBeenCalled();
    });
  });

  describe('when hand tracking has an error', () => {
    it('when hand tracking has an error, should display tracking error message', () => {
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
    it('when there is an error, should display error message', () => {
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
    it('when rendered, should have a main landmark', () => {
      render(<GuitarPage />);
      
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    it('when rendered, should have accessible button label', () => {
      render(<GuitarPage />);
      
      const button = screen.getByRole('button', { name: /enable camera for hand tracking/i });
      expect(button).toBeInTheDocument();
    });
  });
});
