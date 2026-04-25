# @panecake/terminal - Specification

## 1. Project Overview

- **Package Name**: `@panecake/terminal`
- **Description**: Terminal layout manager for AI CLI agents - inline subprocess capture, page switching, split views
- **Node.js Version**: 20+ (LTS)

## 2. Key Features

### 2.1 Inline Subprocess Capture
- Spawn child process with PTY
- Capture stdout/stderr and display inline in main output stream
- Collapsible section with header (shows command, status)
- Live streaming output as subprocess runs
- Multiple concurrent inline sections
- Auto-scroll with main terminal output
- Clean up on process exit

### 2.2 Page System
- Multiple named terminal pages
- Switch pages (swap full screen content)
- Quick page switcher UI (keyboard shortcut activated)
- Per-page output history

### 2.3 Split Layout
- Vertical split: info section + terminal section
- Info section: fixed height, scrollable content
- Terminal section: main interactive area
- Used for showing agent context/instructions

### blessed Integration
- Uses blessed Box/Element internally for layout
- Exposes blessed elements for custom styling
- Page container wraps blessed pages widget
- Configurable styling via blessed options

## 3. API

```typescript
// Inline capture
export class InlineCapture {
    constructor(options: InlineCaptureOptions)
    spawn(command: string, args: string[]): ChildProcess
    attach(child: ChildProcess): void
    collapse(): void
    expand(): void
    remove(): void
}

// Page management
export class PageContainer {
    constructor(screen: blessed.Screen)
    createPage(name: string): Page
    showPage(name: string): void
    getCurrentPage(): Page
    listPages(): string[]
}

// Split layout
export function createSplitLayout(
    screen: blessed.Screen,
    options: SplitOptions
): SplitLayout

// Core
export interface TerminalManager {
    screen: blessed.Screen
    inline: InlineCapture
    pages: PageContainer
    
    print(content: string): void
    printLine(content: string): void
    clear(): void
}

export function createTerminal(options?: TerminalOptions): TerminalManager
```

## 4. Dependencies

- **blessed**: Terminal UI widget library
- **node-pty**: PTY for subprocess capture

## 5. Module System

Standard ESM/CJS dual with TypeScript.

## 6. File Structure

```
src/
├── index.ts
├── inline/
│   └── inline-capture.ts
├── pages/
│   └── page-container.ts
├── split/
│   └── split-layout.ts
└── terminal.ts
```