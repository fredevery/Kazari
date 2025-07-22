---
description: "Perform comprehensive security review of Electron application code"
mode: "agent"
tools: ["copilot_getErrorsFromFile", "copilot_findReferences"]
---

# Security Review Prompt

Perform a comprehensive security review of the provided Electron application code, focusing on common Electron vulnerabilities and security best practices.

## Review Areas

### Context Isolation and Node Integration
- Verify contextIsolation is enabled in all webPreferences
- Confirm nodeIntegration is disabled in renderer processes
- Check that contextBridge is used exclusively for main-renderer communication
- Ensure no direct Node.js API exposure to renderer processes

### IPC Communication Security
- Review all IPC channel implementations for proper validation
- Check for input sanitization on all data received from renderer processes
- Verify channel allowlisting and rate limiting implementations
- Ensure no sensitive information leakage through IPC error messages

### Content Security Policy
- Verify proper CSP headers are implemented for all renderer processes
- Check for unsafe-inline or unsafe-eval usage in CSP
- Ensure external resource loading uses secure protocols (HTTPS)
- Review script-src and object-src directives for security

### Sandbox Configuration
- Verify sandbox mode is enabled where appropriate
- Check that sandboxed renderers have minimal capabilities
- Ensure preload scripts are properly secured when sandbox is disabled
- Review contextBridge API surface area for minimal exposure

### File System Security
- Check all file system operations for path validation
- Verify protection against directory traversal attacks
- Ensure proper file permissions are set on created files
- Review temporary file handling for secure cleanup

### Dependency Security
- Review package.json for known vulnerable dependencies
- Check for outdated Electron version with security patches
- Verify third-party package usage follows security best practices
- Ensure proper dependency validation and integrity checking

## Security Checklist

### Critical Issues (Must Fix)
- [ ] Context isolation disabled
- [ ] Node integration enabled in renderer
- [ ] Direct Node.js API exposure to renderer
- [ ] Unvalidated IPC input processing
- [ ] Missing input sanitization
- [ ] Weak or missing CSP headers

### Important Issues (Should Fix)
- [ ] Sandbox mode not enabled where possible
- [ ] Excessive contextBridge API surface
- [ ] Insecure external resource loading
- [ ] Missing rate limiting on IPC channels
- [ ] Verbose error messages exposing system information
- [ ] Outdated dependencies with known vulnerabilities

### Recommendations (Consider)
- [ ] Additional security headers implementation
- [ ] Enhanced logging for security events
- [ ] Certificate pinning for external APIs
- [ ] Integrity checking for loaded resources
- [ ] Enhanced session management

## Output Format

Provide findings in the following format:

### Critical Security Issues
List any critical security vulnerabilities that must be addressed immediately.

### Security Warnings  
List important security issues that should be addressed soon.

### Security Recommendations
List additional security improvements that would enhance the application's security posture.

### Code Examples
Provide corrected code examples for any security issues found.

## References
- [Electron Security Guidelines](https://www.electronjs.org/docs/tutorial/security)
- [OWASP Electron Security](https://owasp.org/www-project-electron-secure-coding/)
- Link to project security rules: `.project/rules/electron-security.md`
