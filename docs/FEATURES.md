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
