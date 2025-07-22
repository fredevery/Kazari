# Context Meta - VS Code Copilot Instruction Files

This document captures the requirements for generating VS Code Copilot instruction files for the Kazari project. Based on the [VS Code Copilot Customization documentation](https://code.visualstudio.com/docs/copilot/copilot-customization), we need to create instruction files that Copilot can automatically consume.

## Current Assessment

Your `.project/` directory contains:
- **Meta-prompts/** - 31 high-level guidance documents 
- **Prompts/** - 31 specific feature implementation guides 
- **Rules/** - 13 technical standards and architectural guidelines
- **Templates/** - 4 reusable templates

These need to be converted/supplemented with proper VS Code Copilot instruction files.

## VS Code Copilot Instruction File Types

Based on the documentation, we should create:

### 1. `.github/copilot-instructions.md` 
- **Purpose:** Global coding guidelines applied to ALL chat requests automatically
- **Content:** General coding practices, preferred technologies, project requirements
- **Auto-applied:** Yes, to every chat request in the workspace

### 2. `.instructions.md` files in `.github/instructions/`
- **Purpose:** Task-specific or file-type-specific instructions
- **Content:** Targeted guidelines for specific scenarios (e.g., React components, Electron main process)
- **Auto-applied:** Based on `applyTo` glob patterns or manually attached
- **Structure:** Front matter with metadata + instruction content

### 3. `.prompt.md` files in `.github/prompts/`
- **Purpose:** Reusable prompts for common development tasks
- **Content:** Complete prompts that can be run directly in chat
- **Usage:** Run via `/prompt-name` in chat or Command Palette

## Information Needed

### A. Primary Instruction File Strategy
- [ ] **Global instructions** - Create one comprehensive `.github/copilot-instructions.md` with all general guidelines?
- [ ] **Modular instructions** - Create multiple `.instructions.md` files for different contexts?
- [x] **Hybrid approach** - Global basics + specific contextual instruction files?

### B. Instruction File Scope Priorities
Which areas need dedicated `.instructions.md` files with `applyTo` patterns:

- [x] **Electron Main Process** (`applyTo: "**/main/**/*.ts,**/electron/**/*.ts"`)
- [x] **React Components** (`applyTo: "**/components/**/*.tsx,**/pages/**/*.tsx"`)
- [x] **TypeScript Configuration** (`applyTo: "**/*.ts,**/*.tsx"`) 
- [x] **IPC Communication** (`applyTo: "**/ipc/**/*.ts,**/preload/**/*.ts"`)
- [x] **Timer System Logic** (`applyTo: "**/timer/**/*.ts,**/services/**/*.ts"`)
- [x] **Testing Files** (`applyTo: "**/*.test.ts,**/*.spec.ts,**/__tests__/**/*.ts"`)
- [x] **Configuration Files** (`applyTo: "**/vite.config.ts,**/tsconfig.json,**/*.config.js"`)
- [x] **Build & Deployment** (`applyTo: "**/scripts/**/*.ts,package.json"`)

### C. Prompt File Priorities  
Which common tasks need reusable `.prompt.md` files:

- [ ] **Create React Component** - Generate new React components following project patterns
- [ ] **Add IPC Channel** - Create new IPC communication channels with proper typing
- [ ] **Timer Feature** - Add timer-related functionality with state management
- [ ] **Window Management** - Create or modify Electron window management logic
- [ ] **Add Test Suite** - Generate comprehensive tests for new features
- [x] **Security Review** - Perform Electron security reviews on code changes
- [x] **Performance Audit** - Analyze and optimize performance issues
- [x] **Error Handling** - Add proper error handling patterns
- [ ] **Data Persistence** - Implement local storage features
- [ ] **Cross-platform Fix** - Address platform-specific issues

### D. Content Conversion Strategy
How should we handle your existing content:

- [ ] **Extract from existing rules/** - Convert rule files to instruction format
- [ ] **Consolidate meta-prompts** - Merge related meta-prompts into instruction files  
- [ ] **Transform prompts** - Convert existing prompts to `.prompt.md` format
- [x] **Create new content** - Build instruction files from scratch based on spec
- [ ] **Hybrid approach** - Combine existing content with new Copilot-specific formatting

### E. Auto-Application Strategy
How aggressively should instructions be auto-applied:

- [x] **Always apply** (`applyTo: "**"`) for core architectural guidelines
- [x] **File-type specific** for technology-specific patterns
- [x] **Feature-area specific** for domain logic (timer, planning, break system)
- [x] **Manual attachment** for specialized tasks (security review, performance)

### F. Instruction Content Focus
Which aspects should instructions emphasize:

- [x] **Code Generation Patterns** - How to structure and write code
- [x] **Architecture Enforcement** - Ensuring clean architecture boundaries
- [x] **Security Guidelines** - Electron-specific security practices  
- [x] **Performance Considerations** - Optimization patterns and anti-patterns
- [x] **Testing Approach** - Test structure and coverage requirements
- [x] **Error Handling** - Consistent error management patterns
- [x] **Documentation Standards** - Code commenting and documentation practices
- [x] **Git Workflow** - Commit messages, PR practices, branching

### G. Integration Requirements
How should instruction files work together:

- [x] **Reference existing rules** - Link to files in `rules/` directory
- [x] **Cross-reference instructions** - Link between related instruction files  
- [ ] **Reference project spec** - Link to main specification document
- [ ] **Include code examples** - Embed implementation samples in instructions
- [ ] **Version control integration** - Instructions for git workflows and review

## Recommended Next Steps

1. **Start with global instructions** - Create `.github/copilot-instructions.md` with core principles
2. **Add targeted instructions** - Create specific `.instructions.md` files for high-priority areas
3. **Convert existing content** - Transform best content from existing rules/prompts
4. **Create common prompts** - Build `.prompt.md` files for frequent tasks
5. **Test and iterate** - Use instruction files in development and refine based on results

## Notes
- Instructions should be **short and self-contained** statements
- Avoid referencing external resources - make instructions self-sufficient  
- Use natural language in Markdown format
- Consider glob patterns carefully for auto-application
- Instructions are combined, so avoid conflicts between files