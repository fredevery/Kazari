# Electron Security Rules

Security rules and guidelines for developing secure Electron applications. These rules focus on protecting against common vulnerabilities including XSS, code injection, and unauthorized access to system resources.

## Context

**Applies to:** All Electron applications, main process, preload scripts, and renderer processes  
**Level:** Strategic - Security is a foundational requirement  
**Audience:** All developers working on Electron applications

## Core Principles

1. **Principle of Least Privilege:** Grant only the minimum necessary permissions to each process and expose only essential APIs to the renderer
2. **Defense in Depth:** Implement multiple layers of security controls including input validation, output sanitization, and process isolation
3. **Secure by Default:** Configure Electron with the most secure settings by default and explicitly opt-in to less secure features when needed

## Rules

### Must Have (Critical)

- **RULE-001:** Always enable context isolation (`contextIsolation: true`) in webPreferences for all renderer processes
- **RULE-002:** Disable node integration (`nodeIntegration: false`) in all renderer processes unless absolutely necessary
- **RULE-003:** Use contextBridge API exclusively for exposing main process functionality to renderer processes
- **RULE-004:** Validate and sanitize all data received through IPC channels before processing
- **RULE-005:** Never expose Node.js APIs directly to renderer processes without proper validation
- **RULE-006:** Enable sandbox mode (`sandbox: true`) for all renderer processes that don't require Node.js access
- **RULE-007:** Implement Content Security Policy (CSP) headers for all renderer processes

### Should Have (Important)

- **RULE-101:** Use allowRunningInsecureContent: false and experimentalFeatures: false in webPreferences
- **RULE-102:** Implement proper error handling that doesn't expose sensitive information in error messages
- **RULE-103:** Use secure protocols (HTTPS) for all external resource loading
- **RULE-104:** Implement proper session management with secure cookies and token handling
- **RULE-105:** Log security-relevant events for monitoring and auditing purposes
- **RULE-106:** Use whitelisted IPC channels with explicit validation rules
- **RULE-107:** Implement rate limiting for IPC communications to prevent abuse

### Could Have (Preferred)

- **RULE-201:** Use additional security headers like X-Content-Type-Options and X-Frame-Options
- **RULE-202:** Implement integrity checking for loaded resources using Subresource Integrity (SRI)
- **RULE-203:** Use certificate pinning for critical external API communications
- **RULE-204:** Implement proper user session timeout mechanisms
- **RULE-205:** Use secure random number generation for cryptographic operations

## Patterns & Anti-Patterns

### ✅ Do This

```javascript
// Secure BrowserWindow configuration
const mainWindow = new BrowserWindow({
  webPreferences: {
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,
    preload: path.join(__dirname, 'preload.js')
  }
});

// Secure contextBridge usage
contextBridge.exposeInMainWorld('electronAPI', {
  createUser: (userData) => {
    // Validate input before sending to main process
    if (!userData || typeof userData !== 'object') {
      throw new Error('Invalid user data');
    }
    return ipcRenderer.invoke('user:create', userData);
  }
});

// Secure IPC handler with validation
ipcMain.handle('user:create', async (event, userData) => {
  // Validate and sanitize input
  const sanitizedData = sanitizeUserData(userData);
  if (!isValidUserData(sanitizedData)) {
    throw new Error('Invalid user data provided');
  }
  return await createUser(sanitizedData);
});
```

### ❌ Don't Do This

```javascript
// Insecure BrowserWindow configuration
const mainWindow = new BrowserWindow({
  webPreferences: {
    nodeIntegration: true,  // ❌ Exposes Node.js APIs to renderer
    contextIsolation: false, // ❌ Allows renderer access to main world
    allowRunningInsecureContent: true // ❌ Allows mixed content
  }
});

// Insecure direct Node.js exposure
window.fs = require('fs'); // ❌ Never expose Node.js APIs directly

// Insecure IPC without validation
ipcMain.handle('execute-command', async (event, command) => {
  return exec(command); // ❌ Command injection vulnerability
});
```

## Decision Framework

**When rules conflict:**

1. Always prioritize security over convenience
2. Consult with security team or conduct security review
3. Document the decision and implement additional compensating controls

**When facing edge cases:**

- Default to the most restrictive security setting
- Implement additional validation layers when relaxing security constraints
- Conduct threat modeling for non-standard security configurations

## Exceptions & Waivers

**Valid reasons for exceptions:**

- Legacy system integration requiring Node.js access in renderer (with explicit approval and additional controls)
- Performance requirements that conflict with security controls (with risk assessment)
- Third-party library compatibility issues (with security review and mitigation plan)

**Process for exceptions:**

1. Document the exception, business justification, and security risks
2. Implement additional compensating security controls
3. Obtain approval from security team or senior architect
4. Schedule regular review of the exception (quarterly)

## Quality Gates

- **Automated checks:** ESLint rules for Electron security, dependency vulnerability scanning, CSP validation
- **Code review focus:** IPC channel validation, contextBridge usage, webPreferences configuration
- **Testing requirements:** Security testing for all IPC channels, penetration testing for renderer processes

## Related Rules

- `rules/ipc-communication.md` - Secure IPC implementation patterns
- `rules/error-handling.md` - Secure error handling practices
- `rules/typescript-standards.md` - Type safety for security-critical code

## References

- [Electron Security Guidelines](https://www.electronjs.org/docs/latest/tutorial/security) - Official Electron security documentation
- [OWASP Electron Security](https://owasp.org/www-project-electron-security/) - OWASP guidelines for Electron security
- [Electron Security Checklist](https://github.com/doyensec/electronegativity) - Automated security testing tool

---

## TL;DR

**Key Principles:**

- Always use context isolation and disable node integration in renderer processes
- Validate all data at process boundaries and implement defense in depth
- Default to secure configurations and explicitly opt-in to less secure features

**Critical Rules:**

- Must enable contextIsolation: true and nodeIntegration: false
- Must use contextBridge for all main-to-renderer communication
- Must validate and sanitize all IPC data

**Quick Decision Guide:**
When in doubt: Choose the most restrictive security setting and implement additional validation layers.
