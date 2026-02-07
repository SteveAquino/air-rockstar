// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock MediaPipe by default
global.MediaStream = jest.fn().mockImplementation(() => ({
  getTracks: jest.fn(() => []),
  getVideoTracks: jest.fn(() => []),
  getAudioTracks: jest.fn(() => []),
})) as any;

// Mock navigator.mediaDevices
Object.defineProperty(global.navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn(),
    enumerateDevices: jest.fn(),
  },
});

// Mock navigator.permissions
Object.defineProperty(global.navigator, 'permissions', {
  writable: true,
  value: {
    query: jest.fn(),
  },
});

// Mock Web Audio API
global.AudioContext = jest.fn().mockImplementation(() => ({
  createOscillator: jest.fn(),
  createGain: jest.fn(),
  destination: {},
  resume: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),
})) as any;
