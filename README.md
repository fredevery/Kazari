# Kazari - Desktop Timer Application

A cross-platform desktop productivity timer application built with Electron, React, and TypeScript.

## Features

- Multiple timer sessions with custom durations
- Session history tracking
- Desktop notifications
- Clean architecture with TypeScript
- Cross-platform support (Windows, macOS, Linux)

## Development

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Development Commands

```bash
# Start development server
npm run dev

# Type checking
npm run type-check

# Build all processes
npm run build

# Build individual processes
npm run build:main
npm run build:preload  
npm run build:renderer

# Package for distribution
npm run dist
```

### Project Structure

```
src/
├── main/                   # Electron main process
│   ├── application/        # Application services
│   ├── domain/            # Domain entities
│   └── infrastructure/    # Infrastructure layer
├── preload/               # Preload script
├── renderer/              # React renderer process
│   ├── application/       # Redux store and state management
│   └── presentation/      # React components and UI
└── shared/                # Shared types and utilities
```

## Architecture

The application follows clean architecture principles:

- **Domain Layer**: Core business entities and interfaces
- **Application Layer**: Use cases and application services
- **Infrastructure Layer**: External integrations and implementations
- **Presentation Layer**: React components and UI logic

## Technology Stack

- **Electron 29.1.0**: Desktop application framework
- **React 18.2.0**: UI library
- **Redux Toolkit**: State management
- **TypeScript 5.3.3**: Type safety
- **Vite 5.1.5**: Build tooling
- **electron-store**: Persistent storage

## License

MIT License
