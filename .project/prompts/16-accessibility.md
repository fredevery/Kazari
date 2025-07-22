# Accessibility Implementation

_Create a comprehensive accessibility implementation for the Kazari Electron application that ensures all windows, components, and features are fully accessible to users with disabilities, following WCAG 2.1 AA guidelines, inclusive design principles, and providing extensive keyboard navigation and screen reader support._

## Requirements

- Implement complete keyboard navigation for all application windows, dialogs, and interactive elements
- Add comprehensive screen reader support with proper ARIA labels, roles, and live regions
- Ensure all interactive elements meet WCAG 2.1 AA contrast ratios and touch target size requirements
- Implement focus management system that provides clear visual focus indicators and logical focus order
- Create accessible timer and countdown interfaces that work with assistive technologies
- Add support for high contrast mode, reduced motion preferences, and other system accessibility settings
- Implement accessible error handling with clear announcements and recovery options
- Provide alternative input methods for users who cannot use traditional mouse/keyboard interactions
- Create accessible onboarding and help documentation with multiple format options
- Document all accessibility features and provide usage examples for users and developers

## Rules

- rules/accessibility.md
- rules/notification-system.md
- rules/error-handling.md
- rules/typescript-standards.md
- rules/electron-main-process.md

## Domain

```typescript
// Accessibility configuration and interfaces
interface AccessibilityConfig {
  keyboardNavigation: boolean;
  screenReaderSupport: boolean;
  highContrastMode: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  audioDescriptions: boolean;
  alternativeInputMethods: string[];
}

interface FocusManager {
  setFocusTrap(element: HTMLElement): void;
  releaseFocusTrap(): void;
  moveFocus(direction: 'next' | 'previous' | 'first' | 'last'): void;
  getFocusableElements(container?: HTMLElement): HTMLElement[];
  restoreFocus(): void;
}

interface ScreenReaderManager {
  announce(message: string, priority?: 'polite' | 'assertive'): void;
  setLiveRegion(element: HTMLElement, type: 'polite' | 'assertive'): void;
  updateAriaLabel(element: HTMLElement, label: string): void;
  describeElement(element: HTMLElement, description: string): void;
}

interface KeyboardNavigationMap {
  [key: string]: {
    action: string;
    handler: (event: KeyboardEvent) => void;
    scope?: 'global' | 'modal' | 'component';
    description: string;
  };
}

interface AccessibilityState {
  currentFocus: HTMLElement | null;
  focusHistory: HTMLElement[];
  screenReaderActive: boolean;
  keyboardNavigationActive: boolean;
  reducedMotionPreferred: boolean;
  highContrastActive: boolean;
}

// Timer accessibility interfaces
interface AccessibleTimerState {
  remainingTime: number;
  totalTime: number;
  phase: 'planning' | 'focus' | 'break';
  isRunning: boolean;
  formattedTime: string;
  percentComplete: number;
  accessibilityDescription: string;
}

interface TimerAnnouncements {
  sessionStart: string;
  sessionEnd: string;
  phaseTransition: string;
  timeRemaining: (minutes: number) => string;
  pauseResume: (action: 'paused' | 'resumed') => string;
}
```

## Extra Considerations

- Accessibility implementation must not impact performance for users who don't require assistive technologies
- Focus indicators should be highly visible but not interfere with the application's design language
- Screen reader announcements should be contextual and not overwhelming during active use
- Keyboard shortcuts should not conflict with system or assistive technology shortcuts
- Accessibility features should work consistently across all supported platforms (macOS, Windows, Linux)
- Consider cognitive accessibility needs with clear language, consistent navigation, and error prevention
- Ensure accessibility works with the floating countdown window and full-screen break interfaces
- Color should not be the only means of conveying information (use patterns, text, or icons as well)
- Implement accessibility testing as part of the continuous integration pipeline
- Consider internationalization and right-to-left language support in accessibility implementation

## Testing Considerations

- Automated accessibility testing using tools like axe-core and Lighthouse
- Manual testing with actual screen readers (NVDA, JAWS, VoiceOver, TalkBack)
- Keyboard-only navigation testing across all application flows
- High contrast mode testing on all supported operating systems
- Testing with users who have disabilities to validate real-world usability
- Performance testing to ensure accessibility features don't impact app responsiveness
- Cross-browser testing for web components within Electron renderer
- Testing accessibility of custom components and timer interfaces
- Regression testing after UI changes to ensure accessibility is maintained

## Implementation Notes

- Use semantic HTML elements as the foundation for accessible components
- Implement ARIA patterns consistently following WAI-ARIA authoring practices
- Create reusable accessible component library with proper TypeScript types
- Use React's built-in accessibility features and hooks (useId, useFocus, etc.)
- Implement proper heading hierarchy and landmark regions for screen reader navigation
- Create accessible forms with proper labeling, validation, and error messaging
- Use CSS media queries to respect user preferences for reduced motion and high contrast
- Implement skip links and keyboard shortcuts for efficient navigation
- Create accessible tooltips and help text that work with assistive technologies
- Use progressive enhancement to ensure core functionality works without JavaScript

## Specification by Example

### Keyboard Navigation Implementation
```typescript
// Global keyboard navigation manager
class KeyboardNavigationManager {
  private keyMap: KeyboardNavigationMap = {
    'Tab': {
      action: 'navigate-forward',
      handler: (e) => this.handleTabNavigation(e, 'forward'),
      scope: 'global',
      description: 'Move to next interactive element'
    },
    'Shift+Tab': {
      action: 'navigate-backward', 
      handler: (e) => this.handleTabNavigation(e, 'backward'),
      scope: 'global',
      description: 'Move to previous interactive element'
    },
    'Space': {
      action: 'activate-timer',
      handler: (e) => this.handleTimerControl(e, 'toggle'),
      scope: 'component',
      description: 'Start or pause timer'
    },
    'Escape': {
      action: 'close-modal',
      handler: (e) => this.handleEscape(e),
      scope: 'modal',
      description: 'Close modal or cancel action'
    },
    'F1': {
      action: 'show-help',
      handler: (e) => this.showKeyboardHelp(e),
      scope: 'global',
      description: 'Show keyboard shortcuts help'
    }
  };

  init(): void {
    document.addEventListener('keydown', this.handleGlobalKeyDown.bind(this));
    this.setupFocusIndicators();
    this.detectScreenReader();
  }

  private handleTabNavigation(event: KeyboardEvent, direction: 'forward' | 'backward'): void {
    const focusableElements = this.getFocusableElements();
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    
    let nextIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
    
    if (nextIndex >= focusableElements.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = focusableElements.length - 1;
    
    focusableElements[nextIndex]?.focus();
    event.preventDefault();
  }
}
```

### Screen Reader Support
```tsx
// Accessible timer component with screen reader support
const AccessibleTimer: React.FC<{ timerState: AccessibleTimerState }> = ({ timerState }) => {
  const [announcements, setAnnouncements] = useState<string>('');
  const liveRegionRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Announce significant timer events
    if (timerState.phase === 'focus' && timerState.remainingTime === 5 * 60 * 1000) {
      setAnnouncements('5 minutes remaining in focus session');
    }
  }, [timerState]);

  return (
    <div 
      className="timer-container"
      role="region" 
      aria-labelledby="timer-heading"
      aria-describedby="timer-description"
    >
      <h2 id="timer-heading">
        {timerState.phase === 'focus' ? 'Focus Session' : 'Break Time'}
      </h2>
      
      <div 
        id="timer-description" 
        className="sr-only"
        aria-live="polite"
      >
        {timerState.accessibilityDescription}
      </div>
      
      <div 
        className="timer-display"
        role="timer"
        aria-live="off"
        aria-label={`Timer showing ${timerState.formattedTime} remaining`}
      >
        <span aria-hidden="true">{timerState.formattedTime}</span>
      </div>
      
      <progress 
        value={timerState.percentComplete} 
        max="100"
        aria-label={`Session progress: ${timerState.percentComplete}% complete`}
      />
      
      <button
        onClick={() => toggleTimer()}
        aria-pressed={timerState.isRunning}
        aria-describedby="timer-control-help"
      >
        {timerState.isRunning ? 'Pause' : 'Start'} Timer
      </button>
      
      <div id="timer-control-help" className="sr-only">
        Press spacebar to start or pause the timer
      </div>
      
      {/* Live region for announcements */}
      <div
        ref={liveRegionRef}
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {announcements}
      </div>
    </div>
  );
};
```

### Focus Management System
```typescript
class FocusManager {
  private focusStack: HTMLElement[] = [];
  private currentTrapContainer: HTMLElement | null = null;

  setFocusTrap(container: HTMLElement): void {
    this.currentTrapContainer = container;
    const focusableElements = this.getFocusableElements(container);
    
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
      this.saveFocusHistory();
    }
    
    container.addEventListener('keydown', this.handleTrapKeydown.bind(this));
  }

  private handleTrapKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;
    
    const focusableElements = this.getFocusableElements(this.currentTrapContainer!);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (event.shiftKey && document.activeElement === firstElement) {
      lastElement.focus();
      event.preventDefault();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      firstElement.focus();
      event.preventDefault();
    }
  }

  getFocusableElements(container: HTMLElement = document.body): HTMLElement[] {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');
    
    return Array.from(container.querySelectorAll(selector))
      .filter((el) => this.isVisible(el)) as HTMLElement[];
  }

  private isVisible(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      element.offsetWidth > 0 &&
      element.offsetHeight > 0
    );
  }
}
```

### High Contrast and Reduced Motion Support
```css
/* CSS for accessibility preferences */
@media (prefers-reduced-motion: reduce) {
  .timer-progress-animation,
  .notification-slide-in,
  .focus-indicator-transition {
    animation: none !important;
    transition: none !important;
  }
}

@media (prefers-contrast: high) {
  .timer-display {
    background: WindowText;
    color: Window;
    border: 2px solid WindowText;
  }
  
  .focus-indicator {
    outline: 3px solid Highlight;
    outline-offset: 2px;
  }
  
  .button:focus {
    background: Highlight;
    color: HighlightText;
  }
}

@media (forced-colors: active) {
  .timer-progress {
    forced-color-adjust: none;
    background: Canvas;
    border: 1px solid CanvasText;
  }
  
  .timer-progress::after {
    background: Highlight;
  }
}

/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* High visibility focus indicators */
.focus-visible {
  outline: 3px solid #4A90FF;
  outline-offset: 2px;
  border-radius: 4px;
}
```

### Accessible Error Handling
```typescript
interface AccessibleErrorHandler {
  announceError(error: AppError): void;
  showErrorDialog(error: AppError): void;
  provideErrorRecovery(error: AppError): void;
}

class AccessibleErrorHandlerImpl implements AccessibleErrorHandler {
  announceError(error: AppError): void {
    const message = this.getAccessibleErrorMessage(error);
    this.screenReaderManager.announce(message, 'assertive');
    
    // Also show visual error for sighted users
    this.showErrorToast(message);
  }

  showErrorDialog(error: AppError): void {
    const dialog = this.createAccessibleErrorDialog(error);
    
    // Set focus trap and announce dialog
    this.focusManager.setFocusTrap(dialog);
    this.screenReaderManager.announce(
      `Error dialog opened: ${error.message}`, 
      'assertive'
    );
    
    // Focus the primary action button
    const primaryButton = dialog.querySelector('[data-primary-action]') as HTMLElement;
    primaryButton?.focus();
  }

  private getAccessibleErrorMessage(error: AppError): string {
    const severity = error.severity === 'critical' ? 'Critical error:' : 'Error:';
    const action = error.recoverable ? 'Please try the suggested action.' : 'Please contact support.';
    
    return `${severity} ${error.message} ${action}`;
  }
}
```
