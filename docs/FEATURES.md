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
