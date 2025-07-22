---
description: "React component development patterns and standards for Kazari"
applyTo: "**/components/**/*.tsx,**/pages/**/*.tsx,**/views/**/*.tsx"
---

# React Components Instructions

## Component Structure

Use functional components with React hooks exclusively.
Implement proper TypeScript interfaces for all props and state.
Keep components focused on a single responsibility.
Extract complex logic into custom hooks.
Use proper component composition patterns.

## Props and State Management

Define explicit TypeScript interfaces for all component props.
Use readonly props interfaces to prevent accidental mutations.
Implement proper default props using ES6 default parameters.
Avoid prop drilling - use context or state management for deep data passing.
Use proper state update patterns with functional updates for complex state.

## Timer Integration

Access timer state through custom hooks that subscribe to IPC updates.
Display time in consistent formats across all components.
Handle timer state changes reactively with useEffect.
Implement proper cleanup for timer subscriptions in useEffect return functions.
Show appropriate loading states while timer data is being fetched.

## Window Communication

Use custom hooks to abstract IPC communication patterns.
Implement proper error handling for IPC operations.
Show loading and error states for async operations.
Cache IPC responses appropriately to avoid unnecessary calls.
Handle window focus changes and visibility appropriately.

## Form Handling

Use controlled components for all form inputs.
Implement proper form validation with clear error messages.
Handle form submission with proper loading and error states.
Use proper ARIA attributes for form accessibility.
Implement keyboard navigation for all interactive elements.

## Styling Patterns

Use consistent spacing and sizing using CSS custom properties or design tokens.
Implement responsive design patterns for different screen sizes.
Use semantic CSS class names that describe purpose rather than appearance.
Implement proper focus indicators for keyboard navigation.
Use appropriate color contrast ratios for accessibility.

## Performance Optimization

Use React.memo for components that receive stable props.
Implement proper key props for list rendering.
Avoid creating objects or functions in render methods.
Use useCallback and useMemo appropriately for expensive operations.
Implement proper error boundaries around potentially failing components.

## Accessibility Implementation

Use semantic HTML elements appropriately (button, main, nav, etc.).
Implement proper ARIA labels and descriptions for complex interactions.
Ensure keyboard navigation works for all interactive elements.
Use proper heading hierarchy (h1, h2, h3, etc.).
Implement focus management for modal dialogs and overlays.

## Error Boundaries

Wrap potentially failing components in error boundaries.
Provide user-friendly error messages with recovery options.
Log component errors without exposing sensitive information.
Implement fallback UI for when components fail to render.
Handle async errors in components with proper error states.

## Testing Patterns

Write tests for all component behaviors and interactions.
Test component rendering with different prop combinations.
Test error states and edge cases thoroughly.
Use proper testing utilities for accessibility testing.
Mock IPC communications in component tests appropriately.

## Component Documentation

Document all props with JSDoc comments including types and examples.
Include usage examples in component documentation.
Document any side effects or external dependencies.
Explain complex component logic with inline comments.
Maintain clear README files for component libraries.
