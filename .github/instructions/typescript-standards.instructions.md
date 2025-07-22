---
description: "TypeScript coding standards and type safety guidelines"
applyTo: "**/*.ts,**/*.tsx"
---

# TypeScript Standards Instructions

## Type Safety Requirements

Enable strict mode in tsconfig.json with all strict checks enabled.
Use explicit return types for all public functions and methods.
Define interfaces for all complex object structures and API contracts.
Use proper null checking with strict null checks enabled.
Avoid using `any` type - use `unknown` or specific types instead.

## Interface and Type Definitions

Create separate interface files for shared types across modules.
Use readonly properties for immutable data structures.
Implement proper union types for state enums and options.
Use generic types appropriately for reusable components and functions.
Export all interfaces and types that might be used by other modules.

## Function Type Safety

Use type guards for runtime type checking when dealing with external data.
Implement proper function overloads for functions with multiple signatures.
Use proper parameter destructuring with typed interfaces.
Implement exhaustive switch statements with never type checking.
Use proper async/await typing with Promise<T> return types.

## Error Handling Types

Create typed error classes that extend the built-in Error class.
Use union types for functions that can return errors or success values.
Implement proper Result<T, E> patterns for error-prone operations.
Use typed try-catch blocks with proper error type narrowing.
Define error interfaces that include relevant context information.

## IPC Communication Types

Define request and response interfaces for all IPC channels.
Use branded types for channel names to prevent typos.
Implement proper validation functions using type predicates.
Create shared type libraries for communication between processes.
Use discriminated unions for different message types on the same channel.

## React Component Types

Use React.FC<Props> or explicit function return types for components.
Implement proper ref forwarding with React.forwardRef<T, P>.
Use proper event handler types from React.MouseEventHandler<T> etc.
Define proper context types with createContext<T>.
Use proper hook return types for custom hooks.

## State Management Types

Define proper state interfaces for all application state.
Use immutable update patterns with proper TypeScript support.
Implement typed reducers with discriminated union actions.
Use proper selector types for state access functions.
Define action creator types with proper payload typing.

## Utility Type Usage

Use built-in utility types like Partial<T>, Required<T>, Pick<T, K> appropriately.
Create custom utility types for common patterns in the application.
Use conditional types for complex type transformations when needed.
Implement proper mapped types for object transformations.
Use template literal types for string manipulation when appropriate.

## Import and Module Types

Use proper ES6 import/export syntax with type imports where appropriate.
Implement proper module declaration files for third-party libraries.
Use namespace imports sparingly and prefer named imports.
Implement proper re-exports from index files with type preservation.
Use dynamic imports with proper typing for code splitting.

## Documentation Standards

All exported functions and classes must have proper TypeScript documentation comments.
Include @param and @returns tags for all function documentation.
Document generic type parameters with @template tags.
Include usage examples in complex type documentation.
Document any side effects or mutations in function signatures.
