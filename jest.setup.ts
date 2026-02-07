import '@testing-library/jest-dom';

// Minimal fetch mock for MediaPipe library initialization
// MediaPipe Hands requires fetch to load its WASM files
// Individual tests can override this mock for their specific needs
global.fetch = jest.fn((url) => {
  // Check if it's a MediaPipe WASM or data file
  if (typeof url === 'string' && (url.includes('hands') || url.includes('.wasm') || url.includes('.data'))) {
    return Promise.resolve({
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      json: () => Promise.resolve({}),
    } as Response);
  }
  // For other URLs, return a basic response
  return Promise.resolve({
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    json: () => Promise.resolve({}),
    ok: true,
    status: 200,
  } as Response);
});

// Mock HTMLCanvasElement.prototype.getContext
HTMLCanvasElement.prototype.getContext = jest.fn(() => {
  return {
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
  } as unknown as CanvasRenderingContext2D;
});
