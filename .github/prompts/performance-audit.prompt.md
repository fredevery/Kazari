---
description: "Analyze and optimize application performance issues"
mode: "agent"
tools: ["copilot_getErrorsFromFile", "copilot_findReferences"]
---

# Performance Audit Prompt

Analyze the provided code for performance issues and optimization opportunities in this Electron-React-TypeScript application.

## Performance Analysis Areas

### Main Process Performance
- Review timer implementation for accuracy and efficiency
- Check window management for proper resource cleanup
- Analyze IPC communication patterns for unnecessary overhead
- Examine file system operations for blocking behavior
- Review memory usage patterns and potential leaks

### Renderer Process Performance
- Analyze React component rendering efficiency
- Check for unnecessary re-renders and expensive operations
- Review state management patterns for performance impact
- Examine bundle sizes and code splitting opportunities
- Assess asset loading and optimization strategies

### IPC Communication Performance
- Review message frequency and payload sizes
- Check for batching opportunities to reduce IPC overhead
- Analyze serialization/deserialization costs
- Examine error handling impact on performance
- Review subscription patterns for memory efficiency

### Memory Management
- Identify potential memory leaks in timers and event listeners
- Check for proper cleanup in component unmount scenarios
- Review object lifecycle management
- Analyze cache usage and memory consumption
- Examine garbage collection impact patterns

## Performance Checklist

### Critical Performance Issues
- [ ] Main thread blocking operations
- [ ] Memory leaks in timers or event listeners
- [ ] Inefficient IPC communication patterns
- [ ] Large bundle sizes causing slow startup
- [ ] Unoptimized asset loading

### Performance Warnings
- [ ] Excessive React re-renders
- [ ] Inefficient state updates
- [ ] Missing memoization for expensive calculations
- [ ] Suboptimal component architecture
- [ ] Inefficient data structures or algorithms

### Optimization Opportunities
- [ ] Code splitting opportunities
- [ ] Asset optimization potential
- [ ] Caching improvements
- [ ] Batch processing possibilities
- [ ] Component composition improvements

## Analysis Focus Areas

### Timer System Performance
- Review timer precision and accuracy implementation
- Check for drift correction efficiency
- Analyze multi-window synchronization overhead
- Examine state persistence performance impact

### Window Management Performance
- Review window creation and destruction patterns
- Check for proper resource cleanup on window close
- Analyze window focus and visibility handling efficiency
- Examine multi-monitor support performance

### React Component Performance
- Check for proper key usage in list rendering
- Review component memoization opportunities
- Analyze hook dependencies and effect cleanup
- Examine context usage and provider optimization

### Build and Bundle Performance
- Review Vite configuration for optimal building
- Check for proper tree shaking and dead code elimination
- Analyze dependency bundling strategies
- Examine development vs production build differences

## Output Format

### Performance Issues Found
List specific performance problems with file locations and impact assessment.

### Optimization Recommendations
Provide concrete suggestions for improving performance with estimated impact.

### Code Examples
Show optimized code examples for identified performance issues.

### Metrics and Benchmarks
Suggest specific metrics to measure and monitor for performance tracking.

## Performance Best Practices

### React Performance
- Use React.memo for stable props
- Implement proper useCallback and useMemo usage
- Avoid creating objects/functions in render
- Use proper component composition patterns

### Electron Performance
- Minimize main process blocking operations
- Implement proper window lifecycle management
- Use efficient IPC communication patterns
- Optimize asset loading and caching strategies

### TypeScript Performance
- Use proper type definitions to enable optimizations
- Avoid complex type computations at runtime
- Implement efficient data structures
- Use appropriate compiler optimizations
