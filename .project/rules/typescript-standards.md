# TypeScript Standards Rules

TypeScript coding standards and best practices for maintaining type safety, code quality, and developer productivity. These rules ensure consistent and maintainable TypeScript code across the project.

## Context

**Applies to:** All TypeScript code in the project including main process, preload scripts, renderer processes, and shared utilities  
**Level:** Tactical - Implementation quality and maintainability  
**Audience:** All developers writing TypeScript code

## Core Principles

1. **Type Safety First:** Leverage TypeScript's type system to catch errors at compile time and provide better developer experience
2. **Explicit Over Implicit:** Be explicit about types, interfaces, and function signatures to improve code readability and maintainability
3. **Progressive Enhancement:** Start with strict type checking and gradually improve type coverage and strictness over time

## Rules

### Must Have (Critical)

- **RULE-001:** Enable strict mode in tsconfig.json with all strict checks enabled
- **RULE-002:** Use explicit return types for all public functions and methods
- **RULE-003:** Define interfaces for all complex object structures and API contracts
- **RULE-004:** Use proper null checking with strict null checks enabled
- **RULE-005:** Avoid using `any` type - use `unknown` or specific types instead
- **RULE-006:** Use type guards for runtime type checking when dealing with external data
- **RULE-007:** All exported functions and classes must have proper TypeScript documentation comments

### Should Have (Important)

- **RULE-101:** Use union types and discriminated unions for type safety with complex data structures
- **RULE-102:** Implement proper error types instead of throwing generic Error objects
- **RULE-103:** Use readonly modifiers for immutable data structures
- **RULE-104:** Prefer const assertions for literal types over type annotations
- **RULE-105:** Use generic types for reusable functions and components
- **RULE-106:** Implement proper type narrowing with control flow analysis
- **RULE-107:** Use branded types for domain-specific identifiers

### Could Have (Preferred)

- **RULE-201:** Use utility types (Pick, Omit, Record, etc.) for type transformations
- **RULE-202:** Implement proper type inference helpers for complex scenarios
- **RULE-203:** Use conditional types for advanced type logic when appropriate
- **RULE-204:** Prefer type-only imports for type declarations
- **RULE-205:** Use proper namespace organization for related types

## Patterns & Anti-Patterns

### ✅ Do This

```typescript
// Explicit interface definitions
interface UserData {
  readonly id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

// Proper function signatures with explicit return types
async function createUser(userData: Omit<UserData, 'id' | 'createdAt'>): Promise<UserData> {
  // Implementation
}

// Type guards for runtime checking
function isUserData(data: unknown): data is UserData {
  return typeof data === 'object' && 
         data !== null && 
         'id' in data && 
         'name' in data && 
         'email' in data;
}

// Proper error types
class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Branded types for domain identifiers
type UserId = string & { readonly __brand: 'UserId' };
type EmailAddress = string & { readonly __brand: 'EmailAddress' };
```

### ❌ Don't Do This

```typescript
// Using 'any' type
function processData(data: any): any { // ❌ Loses type safety
  return data.whatever;
}

// Implicit return types
function calculateTotal(items) { // ❌ Missing parameter and return types
  return items.reduce((sum, item) => sum + item.price, 0);
}

// No type checking for external data
async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  const user = await response.json(); // ❌ No type validation
  return user;
}

// Generic Error throwing
function validateEmail(email: string) {
  if (!email.includes('@')) {
    throw new Error('Invalid email'); // ❌ Generic error type
  }
}
```

## Decision Framework

**When rules conflict:**

1. Prioritize type safety over convenience
2. Choose explicit types over implicit inference when readability is important
3. Consult TypeScript documentation and team standards

**When facing edge cases:**

- Use `unknown` instead of `any` for truly dynamic content
- Implement proper type guards for runtime validation
- Document complex type logic with comments

## Exceptions & Waivers

**Valid reasons for exceptions:**

- Third-party library integration with poor type definitions (with @ts-ignore and comment)
- Performance-critical code where type checking overhead is significant (with benchmark data)
- Migration from JavaScript code (with planned timeline for proper typing)

**Process for exceptions:**

1. Document the exception with clear justification and TODO comment
2. Add issue tracking item for future improvement
3. Review exceptions quarterly and prioritize resolution

## Quality Gates

- **Automated checks:** TypeScript compiler with strict mode, ESLint TypeScript rules, no-unused-vars checking
- **Code review focus:** Type safety, interface design, proper use of generics and utility types
- **Testing requirements:** Type-level testing for complex types, runtime type validation tests

## Related Rules

- `rules/electron-security.md` - Type safety for security-critical code
- `rules/error-handling.md` - Typed error handling patterns
- `rules/ipc-communication.md` - Type-safe IPC message definitions

## References

- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Official TypeScript documentation
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/) - Comprehensive TypeScript guide
- [TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html) - Google's TypeScript style guide

---

## TL;DR

**Key Principles:**

- Enable strict mode and leverage TypeScript's type system for compile-time error detection
- Be explicit about types and interfaces for better code maintainability
- Avoid 'any' type and use proper type guards for runtime validation

**Critical Rules:**

- Must enable strict mode with all strict checks
- Must use explicit return types for all public functions
- Must define interfaces for complex object structures

**Quick Decision Guide:**
When in doubt: Choose explicit types over implicit inference and prioritize type safety over convenience.
