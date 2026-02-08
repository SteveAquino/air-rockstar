# Air Rockstar Features

## Welcome Screen

### Overview
The welcome screen is the entry point for the Air Rockstar application. It provides users with a choice between two virtual instruments: Air Guitar and Air Drums.

### Requirements

#### Functional Requirements
- Display application title "Air Rockstar"
- Display a subtitle or description explaining the app's purpose
- Provide two navigation buttons:
  - "Play Air Guitar" button navigating to `/guitar`
  - "Play Air Drums" button navigating to `/drums`
- Both buttons must be keyboard accessible and screen reader friendly

#### Accessibility Requirements
- All interactive elements must have appropriate ARIA labels
- Buttons must be accessible via keyboard navigation (Tab key)
- Focus states must be clearly visible
- Semantic HTML structure (main, headings, buttons)
- Support for screen readers with descriptive text

#### User Experience
- Clean, centered layout
- Clear visual hierarchy
- Responsive design for various screen sizes
- Intuitive button placement

#### Technical Requirements
- Built as Next.js App Router page component (`app/page.tsx`)
- Uses Next.js Link component for client-side navigation
- No camera permissions requested on this page (progressive disclosure)
- Static generation compatible (no client-side-only code)

### Future Enhancements
- Animated instrument graphics
- Tutorial/help button
- Settings/customization options
- Recent instrument preference saving

---

## Design System and Component Library

### Overview
Air Rockstar includes a reusable component library and design tokens to ensure a consistent, accessible UI across pages.

### Requirements
- Shared UI components live in `src/components/ui`
- Design tokens and typography are defined in `app/globals.css`
- Self-documenting styleguide available at `/styleguide`
- Components use CSS Modules and explicit, typed props

### Core Components
- Buttons (primary, ghost, subtle, danger)
- Cards and panels for layout surfaces
- Status pills and badges
- Segmented controls and sliders
- Layout utilities (stack and cluster)

### Notes
- Drum mode controls for sensitivity and size are functional and update hit detection in real time
- Sound variant control remains functional

---

## Camera Permission Flow

### Overview
Before users can play virtual instruments, the application needs camera access to track hand movements. This feature implements a user-friendly camera permission request flow with proper error handling and state management.

### Requirements

#### Functional Requirements
- **Progressive Disclosure**: Camera permission is NOT requested on welcome screen
- **Explicit User Action**: Permission requested only when user clicks "Enable Camera" button on instrument page
- **Permission State Checking**: Check if permission already granted before requesting
- **Clear Explanation**: Show why camera access is needed before browser prompt
- **Error Handling**: Handle all permission states (granted, denied, prompt dismissed)
- **Proper Cleanup**: Stop camera stream when component unmounts or user navigates away

#### Permission States
1. **Not Requested**: Initial state, show "Enable Camera" button
2. **Requesting**: Loading state while checking/requesting permission
3. **Granted**: Camera access allowed, show video feed
4. **Denied**: Permission denied, show instructions to enable in browser settings
5. **Error**: Camera unavailable or in use by another app

#### User Experience Flow
1. User navigates to guitar or drums page
2. Page displays instrument preview and "Enable Camera" button
3. User clicks "Enable Camera"
4. App shows brief explanation: "We need camera access to track your hand movements"
5. Browser shows native permission prompt
6. Based on response:
   - **Granted**: Initialize camera, show video feed
   - **Denied**: Show friendly error with instructions
   - **Dismissed**: Allow user to retry

#### Accessibility Requirements
- Button must be keyboard accessible
- Clear ARIA labels for all states
- Screen reader announcements for state changes
- Error messages must be readable by assistive technology

#### Technical Requirements
- Use `navigator.mediaDevices.getUserMedia()` for camera access
- Use `navigator.permissions.query()` to check permission state
- Implement custom React hook: `useCamera()`
- Store camera stream in ref for proper cleanup
- Support constraints: `{ video: { width: 640, height: 480, facingMode: 'user' } }`
- Handle browser compatibility (check for mediaDevices API)

#### Browser Compatibility
- Chrome 53+
- Firefox 47+
- Safari 11+
- Edge 79+
- HTTPS required (or localhost for development)

#### Error Messages
- **Permission Denied**: "Camera access denied. Click the camera icon in your browser's address bar to enable access."
- **Camera In Use**: "Camera is being used by another application. Please close other apps and try again."
- **No Camera Found**: "No camera detected. Please connect a camera and refresh the page."
- **HTTPS Required**: "Camera access requires HTTPS. Please use a secure connection."

### Component Structure
```
app/guitar/page.tsx
app/drums/page.tsx
  └── uses useCamera() hook
src/hooks/useCamera.ts
  └── Camera permission logic and state management
src/components/CameraFeed.tsx (future)
  └── Video display component
```

### State Management
```typescript
interface CameraState {
  stream: MediaStream | null;
  permissionState: 'prompt' | 'granted' | 'denied';
  isRequesting: boolean;
  error: string | null;
}
```

### Future Enhancements
- Camera selection (front/back on mobile, multiple cameras on desktop)
- Resolution/quality settings
- Camera preview before enabling
- Retry mechanism with backoff
- Analytics for permission denial rates


## Hand Tracking with MediaPipe

### Overview
Hand tracking is the core feature enabling gesture recognition. Using MediaPipe Hands, we detect hand landmarks in real-time from the camera feed and process them for musical interaction.

### Requirements

#### Functional Requirements
- **Automatic Initialization**: Start hand tracking when camera feed is active
- **Real-time Detection**: Process video frames continuously (target 30 FPS)
- **Landmark Extraction**: Detect 21 hand landmarks per hand (up to 2 hands)
- **Visual Feedback**: Overlay hand landmarks and connections on video feed
- **Performance Optimization**: Run detection on requestAnimationFrame loop
- **Proper Cleanup**: Stop MediaPipe processing when camera stops or component unmounts

#### Hand Landmark Positions (0-20)
```
0: Wrist
1-4: Thumb (CMC, MCP, IP, Tip)
5-8: Index (MCP, PIP, DIP, Tip)
9-12: Middle (MCP, PIP, DIP, Tip)
13-16: Ring (MCP, PIP, DIP, Tip)
17-20: Pinky (MCP, PIP, DIP, Tip)
```

#### MediaPipe Configuration
```javascript
{
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
}
```

#### Technical Requirements
- Create custom hook: `useHandTracking(videoElement, enabled)`
- Use MediaPipe Hands library (`@mediapipe/hands`)
- Draw landmarks on canvas overlay
- Return hand landmarks array for gesture detection
- Handle initialization errors gracefully
- Throttle/debounce processing if performance issues

#### Performance Targets
- Hand detection: < 33ms per frame (30 FPS)
- UI remains responsive during processing
- CPU usage < 50% on mid-range devices
- Memory stable (no leaks)

#### Visual Display
- Draw accent-colored dots for hand landmarks
- Draw soft white lines connecting landmarks
- Landmark dot size reflects the current sensitivity setting for visual feedback
- Optional: Show landmark numbers for debugging
- Canvas overlay matches video dimensions
- Smooth animations (no flickering)

#### Error Handling
- MediaPipe initialization failure
- Model loading timeout
- Processing errors (invalid frame)
- Browser compatibility issues

### User Experience
1. Camera feed shows with overlay canvas
2. When hands enter frame, landmarks appear in real-time
3. Smooth, accurate tracking follows hand movements
4. Visual feedback confirms system is detecting hands
5. Works in various lighting conditions

### Browser Compatibility
- Requires WebGL support
- Chrome 87+
- Firefox 78+
- Safari 14+
- Edge 87+

### Future Enhancements
- Hand pose classification (fist, open palm, pointing, etc.)
- Gesture detection (swipe, pinch, wave)
- Multi-hand interaction
- Performance mode (reduced quality for lower-end devices)

---

## Air Guitar Mode

### Overview
Air Guitar mode lets users strum virtual strings by moving their fingertips through horizontal string zones over the camera feed. Each string hit triggers a synth pluck with low latency and visual feedback.

### Requirements

#### Functional Requirements
- Display 6 horizontal string zones across the camera feed.
- Use standard tuning (E2, A2, D3, G3, B3, E4).
- Top-to-bottom order on screen: high E (E4) to low E (E2).
- Detect collisions between any fingertip landmark (4, 8, 12, 16, 20) and a string band.
- Trigger a hit only on entry into the band (not continuous contact).
- Enforce a 200ms cooldown per string to prevent double hits.
- Provide visual feedback on hit (highlight and brief glow).
- Split interaction into a fret zone (left) and strum zone (right).
- Fretting in the left zone sets the active fret per string.
- Strumming in the right zone triggers the string sound with pitch modulation.

#### Audio Requirements
- Use Web Audio API for synth and sample playback.
- Basic synth pluck per string (triangle wave).
- Support two sound variants: synth (default) and electric guitar (sample-based).
- Fast attack with exponential decay (200-300ms).
- Master volume control.
- Low latency (< 50ms from collision to sound).
- Pitch modulation based on fret position (semitone steps).
- Electric guitar samples sourced from FluidR3_GM via MIDI.js soundfonts
  (Creative Commons Attribution 3.0).

#### Controls and Stats
- Sensitivity slider (affects hit padding and landmark size).
- String spacing slider (tight to wide string bands).
- String position slider (move the entire string set up/down).
- Volume slider (master gain).
- Support 12-24 frets for pitch modulation (default 20).
- Sound variant toggle (synth vs electric).
- Live stats: hits, combo, tempo (BPM).
- Full-screen performance mode with action bar.

#### Collision Detection
- Use normalized landmarks from MediaPipe.
- Convert Y coordinate to screen pixels.
- A hit occurs when the fingertip enters the band and was not colliding in the previous frame.
- Maintain collision state per fingertip type across hands.

#### Accessibility Requirements
- All controls keyboard accessible.
- Tooltips describe controls and stats in plain language.
- Status pills announce readiness and hand detection.
- Buttons have clear ARIA labels.

### Visual Design
- Strings rendered as thin translucent bands.
- String labels (E, B, G, D, A, E) on the left edge.
- Active string highlight uses brighter accent color.
- Fret indicators display the active fret number per string.

### Testing Strategy
- Unit tests for string layout and collision logic.
- Unit tests for audio initialization and cooldown.
- Page tests for controls and stats rendering.
- E2E tests for string overlay visibility.

### Future Enhancements
- Velocity-based dynamics.
- Alternate guitar tones (clean, muted, distortion).
- Chord/fret simulation.
- Alternate guitar play modes (fret mode vs. chord mode), where the left zone
  becomes a chord selector instead of individual frets.
- Add playful animations and visual effects when notes are played.
- When a fretting hand is detected, shift/lock the fretboard angle or position
  toward that hand so fretting feels more natural as the hand moves.

---

## Virtual Drum Kit

### Overview
The drum kit feature allows users to play drum sounds by moving their hands over virtual drum pads displayed on screen. When hand landmarks collide with drum pads, corresponding drum sounds are played using Tone.js.

### Requirements

#### Functional Requirements
- Display 4 virtual drum pads on screen:
  - Snare Drum (top-left)
  - Hi-Hat (top-right)
  - Kick Drum (bottom-left)
  - Tom (bottom-right)
- Each pad has distinct visual styling
- Detect collision between hand index finger tip (landmark 8) and drum pads
- Play drum sound on collision
- Visual feedback on pad hit (highlight/flash)
- Prevent rapid re-triggering (cooldown period)

#### Drum Pad Specifications
```typescript
interface DrumPad {
  id: string;
  name: string;
  x: number;        // X position (percentage)
  y: number;        // Y position (percentage)
  width: number;    // Width (pixels)
  height: number;   // Height (pixels)
  color: string;    // Base color
  sound: string;    // Sound type
}
```

#### Audio Requirements
- Use Tone.js Sampler or Synth
- Low latency (< 50ms from collision to sound)
- Simple drum sounds:
  - Snare: High-pitched percussive
  - Hi-Hat: Crisp cymbal
  - Kick: Deep bass thump
  - Tom: Mid-range drum
- Cooldown period: 200ms per pad to prevent rapid re-triggering
- Volume control (default 70%)

#### Collision Detection
- Use index finger tip landmark (landmark 8) as hit point
- Normalize landmark coordinates to screen space
- Check if finger tip is within drum pad bounds
- Only trigger on first collision (not continuous contact)
- Support both hands independently

#### Visual Design
- Drum pads overlay on video feed
- Semi-transparent pads (don't obscure hands)
- Clear labels for each drum
- Hit animation (scale up + color change)
- Different colors per drum type

#### Performance Targets
- 60 FPS rendering
- < 50ms audio latency
- No audio glitches or clicks
- Smooth collision detection

#### User Experience
1. Camera feed shows with drum pads overlaid
2. Move hand over drum pad
3. Pad highlights when finger is near
4. Sound plays on collision
5. Visual feedback confirms hit
6. Can play multiple drums rapidly

### Technical Implementation

#### Hook: useDrumKit
```typescript
interface DrumKit {
  pads: DrumPad[];
  lastHitTime: Record<string, number>;
  checkCollision: (landmarks: NormalizedLandmark[], padId: string) => boolean;
  playSound: (padId: string) => void;
  isReady: boolean;
}
```

#### Tone.js Setup
- Initialize Tone.js on component mount
- Create Synth or Sampler for each drum
- Handle user interaction requirement (start audio context)

#### Collision Algorithm
```typescript
function checkCollision(fingerTip: {x: number, y: number}, pad: DrumPad): boolean {
  return (
    fingerTip.x >= pad.x &&
    fingerTip.x <= pad.x + pad.width &&
    fingerTip.y >= pad.y &&
    fingerTip.y <= pad.y + pad.height
  );
}
```

### Testing Strategy
- Unit tests for collision detection logic
- Unit tests for cooldown mechanism
- E2E tests for drum pad rendering
- Manual testing for audio playback
- Manual testing for collision accuracy

### Browser Compatibility
- Requires Web Audio API support
- Chrome 87+
- Firefox 78+
- Safari 14+
- Edge 87+

### Future Enhancements
- More drum sounds (crash cymbal, ride, floor tom)
- Velocity sensitivity (hit harder = louder)
- Recording and playback
- Preset drum patterns
- Visual metronome
- MIDI export
## Drum Sound Variants

### Overview
Users can switch between different sound engines for the virtual drum kit, allowing both electronic synth sounds and realistic acoustic drum samples.

### Requirements

#### Functional Requirements
- **Multiple Sound Variants**: Support both synthesized and sample-based sounds
- **Runtime Switching**: Allow users to change variants without reloading
- **Async Loading**: Load audio samples in background without blocking UI
- **Graceful Fallback**: Continue working even if samples fail to load
- **Low Latency**: No delay between collision and sound playback

#### Sound Variants
1. **Synth Drums** (default)
   - Web Audio API OscillatorNode
   - Instant availability (no loading)
   - Low file size
   - Configurable waveforms and envelopes

2. **Acoustic Samples**
   - Pre-recorded drum samples
   - Realistic drum kit sounds
   - Loaded from local public directory
   - MP3 format for browser compatibility
   - Source: MIDI soundfonts library (public domain)

#### UI Requirements
- Dropdown/select control to switch variants
- Clearly labeled options
- Positioned prominently but not obstructing gameplay
- Persists selection during session

#### Technical Implementation
```typescript
type DrumKitVariant = 'synth' | 'acoustic';

useDrumKit(
  landmarks: NormalizedLandmark[][],
  width: number,
  height: number,
  variant: DrumKitVariant
)
```

#### Sample URLs
- Hosted locally in /public/sounds/drums/
- Snare: snare.mp3
- Hi-hat: hihat.mp3
- Kick: kick.mp3
- Tom: tom.mp3
- Source: MIDI.js Soundfonts (FluidR3_GM, public domain)

#### Performance Targets
- Sample loading: < 2s for all sounds
- Playback latency: < 20ms
- No audio stuttering when switching variants
- Memory efficient (unload unused buffers)

### Testing Strategy
- Unit tests for both synth and sample playback
- Mock fetch for sample loading in tests
- Test error handling for failed sample loads
- Test variant switching mid-session
- Manual testing for audio quality

### Browser Compatibility
- AudioContext.decodeAudioData support
- Chrome 87+
- Firefox 78+
- Safari 14+
- Edge 87+

---

## Drums Controls and Live Metrics

### Overview
The Drums page includes interactive controls and live feedback to help players calibrate the experience without leaving the performance view.

### Functional Requirements
- **Sensitivity**: Makes hit detection more forgiving when hands are slightly off
- **Size**: Changes how large drum pads appear and how easy they are to reach
- **Volume**: Controls overall drum loudness
- **Full Screen Mode**: Expands the drum view to fill the screen while keeping essential actions available
- **Live Metrics**:
  - **Hits**: Total hits this session
  - **Combo**: Current streak of quick hits
  - **Tempo**: Estimated speed of recent hits

### User Experience
- Tooltips explain each control and stat in non-technical language
- Controls update immediately without reloading
- Full Screen Mode can be toggled on and off at any time
- Sensitivity also updates the size of hand tracking dots for quick visual feedback
- Volume updates the overall loudness of drum hits

### Accessibility Requirements
- Tooltip triggers are keyboard accessible
- Tooltips are announced with clear labels
- Control labels remain visible and readable

---

## Backlog and Long-Term Ideas

### Overview
Items captured for future development. These are not in scope for current implementation work but should be considered for future phases.

### Product and Release Management
- Adopt semantic versioning for releases
- Define `1.0.0` as completion of all README phases plus backlog items listed here
- Add a visible in-app changelog page that renders release notes
- Add an "About" page describing the motivation and inspiration for the project,
  plus a short timeline of building with AI tools and beta testing with your son

### Instrument Interaction Modes
- Add toggleable interaction modes for "hands/fingers" vs. "drum sticks" vs. "guitar pick"
- Expose mode selection in the in-game UI with clear visual affordances
- Ensure mode selection changes collision feel without reducing performance
- Add guitar-specific play modes (fret mode vs. chord mode), with chord tiles
  replacing fret markers in the left zone while the right zone remains strummable

### Live Note Stream (Visual Playback)
- Add an in-play right-to-left note stream visualization
- Map hits to guitar notes or drum notation symbols when possible
- For v1, a simpler "zone hit" stream is acceptable
- Support real-time updates without blocking audio or hand tracking

### Drum Kit Expansion
- Add at least one cymbal sound for v1 (e.g. crash or ride)
- Consider expanding to multiple toms and cymbals in a later iteration
- Ensure additional pads do not overwhelm the UI or reduce hit accuracy

### Quality and UX Improvements
- Fix occasional double-hit when two hands enter a drum zone but only one is moving
- Consider moving drum pads to the bottom of the camera view to feel more like a real kit
- Full screen hand tracking can feel slightly offset compared to normal mode; investigate coordinate mapping
- Temporarily pause the camera when the browser tab loses focus or after inactivity,
  so the camera does not stream indefinitely if the user walks away
- Incorporate the logo into the welcome page, add stronger card glow outlines,
  and add snappy/funny copy on the landing experience
- Turn the camera enable screen into a short mode intro with a quick overview
  of how each instrument works
