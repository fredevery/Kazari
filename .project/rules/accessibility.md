# Accessibility

_Rules for implementing comprehensive accessibility features in Electron applications to ensure inclusive design, WCAG 2.1 AA compliance, and support for users with diverse abilities and assistive technologies._

## Context

**Applies to:** Electron applications, desktop productivity apps, accessible user interfaces  
**Level:** Strategic & Tactical - design principles and implementation patterns  
**Audience:** Frontend developers, UX designers, Accessibility specialists, QA engineers

## Core Principles

1. **Inclusive Design:** Design for diverse abilities from the start, not as an afterthought
2. **Semantic Foundation:** Use semantic HTML and ARIA patterns to convey meaning and structure
3. **Keyboard Accessibility:** Ensure all functionality is available via keyboard navigation
4. **Perceivable Content:** Provide alternatives for visual and auditory content

## Rules

### Must Have (Critical)

- **RULE-001:** All interactive elements must be keyboard accessible with visible focus indicators
- **RULE-002:** Implement proper ARIA labels, roles, and properties for screen reader support
- **RULE-003:** Ensure color contrast ratios meet WCAG 2.1 AA standards (4.5:1 for normal text)
- **RULE-004:** Provide alternative text for all meaningful images and icons
- **RULE-005:** Use semantic HTML elements and proper heading hierarchy (h1-h6)
- **RULE-006:** Implement focus management for modals, dialogs, and dynamic content
- **RULE-007:** Support system accessibility preferences (high contrast, reduced motion)

### Should Have (Important)

- **RULE-101:** Implement skip links for efficient navigation to main content
- **RULE-102:** Provide keyboard shortcuts with clear documentation
- **RULE-103:** Use ARIA live regions for dynamic content announcements
- **RULE-104:** Ensure touch targets are at least 44x44 pixels for mobile accessibility
- **RULE-105:** Implement accessible form validation with clear error messages
- **RULE-106:** Provide multiple ways to access the same functionality

### Could Have (Preferred)

- **RULE-201:** Support voice control and alternative input methods
- **RULE-202:** Implement customizable UI scaling and text size options
- **RULE-203:** Provide audio descriptions for time-based media

## Patterns & Anti-Patterns

### ✅ Do This

```typescript
// Accessible button component
interface AccessibleButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  variant?: 'primary' | 'secondary';
}

const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  onClick,
  disabled = false,
  ariaLabel,
  ariaDescribedBy,
  variant = 'primary'
}) => {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      type="button"
    >
      {children}
    </button>
  );
};

// Accessible form with proper labeling
const AccessibleForm = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const errorId = 'task-name-error';

  return (
    <form role="form" aria-labelledby="form-heading">
      <h2 id="form-heading">Add New Task</h2>
      
      <div className="form-group">
        <label htmlFor="task-name">
          Task Name *
        </label>
        <input
          id="task-name"
          name="taskName"
          type="text"
          required
          aria-invalid={errors.taskName ? 'true' : 'false'}
          aria-describedby={errors.taskName ? errorId : undefined}
        />
        {errors.taskName && (
          <div
            id={errorId}
            role="alert"
            className="error-message"
          >
            {errors.taskName}
          </div>
        )}
      </div>
    </form>
  );
};

// Screen reader announcements
class ScreenReaderManager {
  private liveRegion: HTMLElement;

  constructor() {
    this.createLiveRegion();
  }

  private createLiveRegion(): void {
    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.className = 'sr-only';
    document.body.appendChild(this.liveRegion);
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    this.liveRegion.setAttribute('aria-live', priority);
    this.liveRegion.textContent = message;
    
    // Clear after announcement to allow repeat announcements
    setTimeout(() => {
      this.liveRegion.textContent = '';
    }, 1000);
  }
}
```

### ❌ Don't Do This

```typescript
// Don't use div buttons without proper accessibility
<div onClick={handleClick}>Click me</div> // Not keyboard accessible

// Don't use color alone to convey information
<span style={{color: 'red'}}>Error occurred</span> // No alternative indicator

// Don't implement custom focus without proper indicators
.custom-focus {
  outline: none; /* Removes focus indicator */
}

// Don't use generic ARIA labels
<button aria-label="Click">Submit</button> // Not descriptive enough
```

## Decision Framework

**When implementing interactive elements:**

1. **Start with semantic HTML:** Use the appropriate element (button, input, select)
2. **Add keyboard support:** Ensure Tab, Enter, Space, and arrow keys work appropriately  
3. **Provide clear labels:** Use visible labels or aria-label for context
4. **Test with assistive technology:** Verify with actual screen readers

**When designing information hierarchy:**

- Use proper heading levels (h1, h2, h3) to create logical document structure
- Group related content with fieldsets, sections, or ARIA landmarks
- Provide multiple ways to navigate content (headings, landmarks, skip links)

## Exceptions & Waivers

**Valid reasons for exceptions:**

- Technical limitations of underlying platform APIs
- Performance critical paths where accessibility features significantly impact users

**Process for exceptions:**

1. Document the exception with detailed justification
2. Provide alternative accessible solution when possible
3. Plan for future improvement when technical constraints are resolved

## Quality Gates

- **Automated testing:** Use axe-core, Lighthouse accessibility audit, and pa11y for continuous testing
- **Manual testing:** Keyboard navigation testing, screen reader testing with NVDA/VoiceOver/JAWS
- **User testing:** Include users with disabilities in usability testing sessions
- **Code review:** Verify semantic HTML, ARIA usage, and keyboard interaction patterns

## Related Rules

- `rules/notification-system.md` - Accessible notification patterns and screen reader integration
- `rules/error-handling.md` - Accessible error messaging and recovery options
- `rules/typescript-standards.md` - Type safety for accessibility properties and interfaces
- `rules/electron-main-process.md` - System-level accessibility integration

## References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Web Content Accessibility Guidelines
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) - ARIA implementation patterns
- [A11y Project Checklist](https://www.a11yproject.com/checklist/) - Practical accessibility checklist

---

## TL;DR

**Key Principles:**

- All functionality must be keyboard accessible with visible focus indicators
- Use semantic HTML and proper ARIA patterns for screen reader support
- Ensure sufficient color contrast and respect system accessibility preferences
- Test with actual assistive technologies and users with disabilities

**Critical Rules:**

- Must make all interactive elements keyboard accessible (RULE-001)
- Must implement proper ARIA labels and roles (RULE-002)  
- Must meet WCAG 2.1 AA color contrast requirements (RULE-003)
- Must use semantic HTML and proper heading hierarchy (RULE-005)

**Quick Decision Guide:**
When in doubt: Ask "Can a user with disabilities complete this task using only assistive technology?" If not, redesign for inclusivity.

**Before You Code Checklist:**
- [ ] All interactive elements keyboard accessible
- [ ] Proper ARIA labels and semantic HTML used
- [ ] Color contrast ratios verified (4.5:1 minimum)
- [ ] Focus management implemented for dynamic content
- [ ] Screen reader testing completed
- [ ] System accessibility preferences supported
